require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { sendStudentCredentials, sendPasswordReset } = require('./mailer');

const db = require('./db');
const {
  JWT_SECRET,
  corsOptions,
  globalRateLimiter,
  authRateLimiter,
  sanitizeInput,
  authenticateToken,
  requireRole
} = require('./security');

const app = express();

// Automatically catch all async errors in route handlers to prevent process crashes
const originalMethods = ['get', 'post', 'put', 'delete'];
originalMethods.forEach(method => {
  const original = app[method];
  app[method] = function (path, ...handlers) {
    const wrappedHandlers = handlers.map(handler => {
      if (typeof handler !== 'function' || handler.length > 3) return handler;
      return (req, res, next) => {
        try {
          const result = handler(req, res, next);
          if (result && typeof result.catch === 'function') {
            result.catch(next);
          }
        } catch (err) {
          next(err);
        }
      };
    });
    return original.call(this, path, ...wrappedHandlers);
  };
});
const PORT = process.env.PORT || 5000;

const startTime = Date.now();
let maintenanceMode = false;
let sseClients = [];

app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(sanitizeInput);
app.use(express.static(path.join(__dirname, 'public')));

// Secure Video Streaming / Uploads Access
app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const publicExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  // Allow public access to images (used in landing page, certificates, etc.)
  if (publicExtensions.includes(ext)) {
    return next();
  }

  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Ruxsat yo\'q. Token kerak.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Ruxsat etilmagan token.' });
    next();
  });
}, express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for videos
});

app.get('/api/system/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  sseClients.push(res);
  req.on('close', () => { sseClients = sseClients.filter(client => client !== res); });
});

function broadcastToDashboard(type, data) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach(client => { client.write(`data: ${payload}\n\n`); });
}

app.use((req, res, next) => {
  if (maintenanceMode && !req.path.startsWith('/api/system') && !req.path.startsWith('/api/auth')) {
    return res.status(503).json({ error: 'Tizimda texnik ishlar olib borilmoqda (Maintenance Mode).' });
  }
  const logEntry = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent']
  };
  res.on('finish', () => {
    logEntry.statusCode = res.statusCode;
    db.logApiRequest(logEntry);
    broadcastToDashboard('api_log', logEntry);
  });
  next();
});

// File Upload
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  db.logSecurityIncident({ type: 'FILE_UPLOADED', severity: 'LOW', message: `Foydalanuvchi yukladi: ${req.file.originalname}`, ip: req.ip });
  broadcastToDashboard('sec_log', { type: 'FILE_UPLOADED', severity: 'LOW', message: `Fayl yuklandi: ${req.file.originalname}`, ip: req.ip });
  
  res.status(201).json({ url: fileUrl, filename: req.file.originalname });
});

// Profile Update
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { avatar, phone, newPassword, name } = req.body;
  if (!avatar && !phone && !newPassword && !name) return res.status(400).json({ error: 'Yangilash uchun ma\'lumot kiritilmadi.' });
  
  const updateData = {};
  if (avatar) updateData.avatar = avatar;
  if (phone) updateData.phone = phone;
  if (name) updateData.name = name;
  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.' });
    updateData.password = await bcrypt.hash(newPassword, 10);
  }
  
  const updatedUser = await db.prisma.user.update({
    where: { id: req.user.id },
    data: updateData
  });
  
  if (newPassword) {
    const { sendPasswordChangeNotification } = require('./mailer');
    sendPasswordChangeNotification(updatedUser.email, updatedUser.name, newPassword);
  }
  
  res.json({ message: 'Profil muvaffaqiyatli yangilandi', ...updateData });
});


// Auth
app.post('/api/auth/register', authRateLimiter, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Barcha maydonlarni to\'ldirish shart.' });
  
  const users = await db.get('users');
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Ushbu elektron pochta allaqachon ro\'yxatdan o\'tgan.' });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    name, email, password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'student',
    avatar: role === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop'
  };

  await db.insert('users', newUser);
  db.logSecurityIncident({ type: 'USER_REGISTERED', severity: 'LOW', message: `Yangi foydalanuvchi: ${email}`, ip: req.ip });
  broadcastToDashboard('sec_log', { type: 'USER_REGISTERED', severity: 'LOW', message: `Ro'yxatdan o'tish: ${email}`, ip: req.ip });

  res.status(201).json({ message: 'Ro\'yxatdan muvaffaqiyatli o\'tildi!' });
});

app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Elektron pochta va parolni kiriting.' });

  const user = await db.prisma.user.findUnique({ where: { email } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    db.logSecurityIncident({ type: 'FAILED_LOGIN', severity: 'HIGH', message: `Failed login attempt for user: ${email}`, ip: req.ip });
    broadcastToDashboard('sec_log', { type: 'FAILED_LOGIN', severity: 'HIGH', message: `Noto'g'ri parol: ${email}`, ip: req.ip });
    return res.status(401).json({ error: 'Elektron pochta yoki parol noto\'g\'ri.' });
  }

  if (user.status === 'Chetlashtirilgan') {
    db.logSecurityIncident({ type: 'EXPELLED_LOGIN_ATTEMPT', severity: 'HIGH', message: `Chetlashtirilgan talaba kirishga urindi: ${email}`, ip: req.ip });
    return res.status(403).json({ error: 'Siz tizimdan chetlashtirilgansiz. Kirish taqiqlangan.' });
  }

  if (user.role === 'student' && user.deadline && new Date(user.deadline) < new Date()) {
    db.logSecurityIncident({ type: 'EXPIRED_LOGIN_ATTEMPT', severity: 'LOW', message: `Muddati o'tgan foydalanuvchi kirishga urindi: ${email}`, ip: req.ip });
    return res.status(403).json({ error: 'Kurs muddati tugagan. Tizimga kirish taqiqlangan.' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone } });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await db.prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      completedLessons: true,
      userCourses: {
        include: { course: { include: { lessons: true } } }
      }
    }
  });
  if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

  if (user.status === 'Chetlashtirilgan') {
    return res.status(403).json({ error: 'Siz tizimdan chetlashtirilgansiz. Tizimdan avtomatik chiqarildingiz.' });
  }

  if (user.deadline && new Date(user.deadline) < new Date()) {
    return res.status(403).json({ error: 'Kurs muddati tugagan. Tizimdan avtomatik chiqarildingiz.' });
  }
  
  const enrolledCourses = user.userCourses.map(uc => ({
    id: uc.course.id,
    title: uc.course.title,
    category: uc.course.category,
    instructor: uc.course.instructor,
    price: uc.course.price,
    image: uc.course.image,
    description: uc.course.description,
    lessons: uc.course.lessons,
    grantedAt: uc.grantedAt
  }));

  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    avatar: user.avatar, course: user.course, status: user.status, phone: user.phone,
    enrolledCourses,
    completedLessons: user.completedLessons.map(cl => cl.lessonId)
  });
});

// Students
app.get('/api/students', authenticateToken, requireRole('admin'), async (req, res) => {
  const users = await db.prisma.user.findMany({
    where: { role: 'student' },
    include: {
      userCourses: {
        include: { course: true }
      }
    }
  });
  res.json(users.map(u => {
    let currentStatus = u.status || 'Online';
    if (currentStatus !== 'Chetlashtirilgan' && u.deadline && new Date(u.deadline) < new Date()) {
      currentStatus = 'Muddati tugagan';
    }
    return {
      id: u.id, name: u.name, email: u.email,
      course: u.userCourses.map(uc => uc.course.title).join(', ') || u.course || 'Kurs tayinlanmagan',
      courses: u.userCourses.map(uc => ({ id: uc.course.id, title: uc.course.title })),
      status: currentStatus, avatar: u.avatar, phone: u.phone, deadline: u.deadline,
      createdAt: u.createdAt
    };
  }));
});

app.post('/api/students', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, email, course, deadline } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Foydalanuvchi ismi va e-maili talab qilinadi.' });
  
  let existing = await db.prisma.user.findUnique({
    where: { email },
    include: { userCourses: { include: { course: true } } }
  });

  if (existing && existing.status === 'Chetlashtirilgan') {
    // Admin wants to add this student again separately. Archive old email.
    await db.prisma.user.update({
      where: { id: existing.id },
      data: { email: `${existing.email}.archived.${Date.now()}` }
    });
    existing = null;
  }

  // If student already exists — add a new course access
  if (existing) {
    if (existing.role !== 'student') {
      return res.status(400).json({ error: 'Bu email admin akkauntiga tegishli.' });
    }

    // Find the course by title
    const targetCourse = await db.prisma.course.findFirst({ where: { title: course } });
    if (!targetCourse) {
      return res.status(400).json({ error: `"${course}" nomli kurs topilmadi. Avval kursni yarating.` });
    }

    // Check if already enrolled in this course
    const alreadyEnrolled = existing.userCourses.some(uc => uc.course.id === targetCourse.id);
    
    if (alreadyEnrolled) {
      if (deadline || existing.status === 'Chetlashtirilgan') {
        await db.prisma.user.update({
          where: { id: existing.id },
          data: { 
            status: 'Online', 
            deadline: deadline ? new Date(deadline) : existing.deadline 
          }
        });
        return res.status(200).json({ newCourseAdded: true, message: `${existing.name} ning "${course}" kursi uchun muddati va holati yangilandi (Aktivlashtirildi).` });
      } else {
        return res.status(400).json({ error: `${existing.name} allaqachon "${course}" kursiga yozilgan.` });
      }
    }

    // Grant new course access
    await db.prisma.userCourse.create({
      data: { userId: existing.id, courseId: targetCourse.id }
    });

    await db.prisma.user.update({
      where: { id: existing.id },
      data: { 
        status: 'Online', 
        ...(deadline && { deadline: new Date(deadline) }) 
      }
    });

    // Add notification
    const addedDateStr = new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    await db.prisma.notification.create({
      data: {
        userId: existing.id,
        title: "Yangi kursga qo'shildingiz",
        message: `Siz ${addedDateStr} sanasida "${course}" kursiga muvaffaqiyatli qo'shildingiz.`
      }
    });

    db.logSecurityIncident({ type: 'COURSE_ACCESS_GRANTED', severity: 'LOW', message: `${email} ga "${course}" kursi tayinlandi`, ip: req.ip });
    broadcastToDashboard('sec_log', { type: 'COURSE_ACCESS_GRANTED', severity: 'LOW', message: `${existing.name} → ${course}`, ip: req.ip });

    // Fetch updated user with courses
    const updatedUser = await db.prisma.user.findUnique({
      where: { id: existing.id },
      include: { userCourses: { include: { course: true } } }
    });

    return res.status(200).json({
      student: {
        id: updatedUser.id, name: updatedUser.name, email: updatedUser.email,
        course: updatedUser.userCourses.map(uc => uc.course.title).join(', '),
        courses: updatedUser.userCourses.map(uc => ({ id: uc.course.id, title: uc.course.title })),
        status: updatedUser.status, avatar: updatedUser.avatar, deadline: updatedUser.deadline
      },
      newCourseAdded: true,
      addedCourse: course,
      message: `${existing.name} ga "${course}" kursi muvaffaqiyatli tayinlandi!`
    });
  }

  // New student creation
  const plainPassword = `Math$${Math.floor(1000 + Math.random() * 9000)}`;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(plainPassword, salt);

  const saved = await db.prisma.user.create({
    data: {
      name, email, password: hashedPassword, role: 'student', course: course || 'Kurs tayinlanmagan',
      status: 'Online', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop',
      deadline: deadline ? new Date(deadline) : null
    }
  });

  // Auto-assign course via UserCourse table
  const targetCourse = await db.prisma.course.findFirst({ where: { title: course } });
  if (targetCourse) {
    await db.prisma.userCourse.create({
      data: { userId: saved.id, courseId: targetCourse.id }
    });

    const addedDateStr = new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    await db.prisma.notification.create({
      data: {
        userId: saved.id,
        title: "Platformaga xush kelibsiz",
        message: `Siz ${addedDateStr} sanasida "${course}" kursiga muvaffaqiyatli qo'shildingiz.`
      }
    });
  }

  // Send email asynchronously without blocking the response
  sendStudentCredentials(email, name, plainPassword);

  db.logSecurityIncident({ type: 'STUDENT_CREATED_BY_ADMIN', severity: 'LOW', message: `Admin qo'shdi: ${email}`, ip: req.ip });
  broadcastToDashboard('sec_log', { type: 'STUDENT_CREATED', severity: 'LOW', message: `Yangi o'quvchi: ${email}`, ip: req.ip });

  res.status(201).json({
    student: {
      id: saved.id, name: saved.name, email: saved.email,
      course: saved.course,
      courses: targetCourse ? [{ id: targetCourse.id, title: targetCourse.title }] : [],
      status: saved.status, avatar: saved.avatar
    },
    password: plainPassword
  });
});

app.post('/api/auth/forgot-password', authRateLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email manzilini kiriting.' });
  
  const user = await db.prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success to prevent email enumeration attacks
    return res.json({ message: "Agar bu email bizning bazada bo'lsa, tiklash havolasi yuborildi." });
  }

  // Create short-lived token for reset (15 minutes)
  const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const resetLink = `http://localhost:5174/reset-password?token=${resetToken}`;
  
  sendPasswordReset(email, user.name, resetLink);
  
  db.logSecurityIncident({ type: 'PASSWORD_RESET_REQUESTED', severity: 'LOW', message: `Parol tiklash so'rovi: ${email}`, ip: req.ip });
  res.json({ message: "Agar bu email bizning bazada bo'lsa, tiklash havolasi yuborildi." });
});

app.post('/api/auth/reset-password', authRateLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token va yangi parol talab qilinadi.' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    
    await db.prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });
    
    db.logSecurityIncident({ type: 'PASSWORD_RESET_SUCCESS', severity: 'MEDIUM', message: `Parol tiklandi: ID=${decoded.id}`, ip: req.ip });
    res.json({ message: 'Parolingiz muvaffaqiyatli o\'zgartirildi. Endi yangi parol bilan kirishingiz mumkin.' });
  } catch (error) {
    res.status(400).json({ error: 'Havola muddati o\'tgan yoki noto\'g\'ri.' });
  }
});

app.delete('/api/students/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await db.prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'Chetlashtirilgan' }
    });
    res.json({ message: 'Talaba tizimdan chetlashtirildi.' });
  } catch (error) {
    res.status(404).json({ error: 'Talaba topilmadi.' });
  }
});

// Courses
app.get('/api/courses', async (req, res) => { res.json(await db.get('courses')); });
app.post('/api/courses', authenticateToken, requireRole('admin'), async (req, res) => {
  const saved = await db.insert('courses', req.body);
  res.status(201).json(saved);
});
app.put('/api/courses/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const updated = await db.update('courses', req.params.id, req.body);
  res.json(updated);
});
app.delete('/api/courses/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const success = await db.delete('courses', req.params.id);
  if (!success) return res.status(404).json({ error: 'Kurs topilmadi yoki xatolik yuz berdi.' });
  res.json({ message: 'Kurs o\'chirildi.' });
});

// Tests
app.get('/api/tests', authenticateToken, async (req, res) => {
  const tests = await db.get('tests');
  if (req.user.role === 'student') {
    return res.json(tests.map(t => {
      const sanitizedQuestions = (t.questions || []).map(q => {
        const { correctAnswer, explanation, ...safeQ } = q;
        return safeQ;
      });
      return { ...t, questions: sanitizedQuestions };
    }));
  }
  res.json(tests);
});

app.get('/api/tests/:id', authenticateToken, async (req, res) => {
  const test = await db.getById('tests', req.params.id);
  if (!test) return res.status(404).json({ error: 'Test topilmadi.' });
  if (req.user.role === 'student') {
    const sanitizedQuestions = (test.questions || []).map(q => {
      const { correctAnswer, explanation, ...safeQ } = q;
      return safeQ;
    });
    return res.json({ ...test, questions: sanitizedQuestions });
  }
  res.json(test);
});

app.post('/api/tests', authenticateToken, requireRole('admin'), async (req, res) => {
  const saved = await db.insert('tests', req.body);
  res.status(201).json(saved);
});
app.put('/api/tests/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const updated = await db.update('tests', req.params.id, req.body);
  res.json(updated);
});
app.delete('/api/tests/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  await db.delete('tests', req.params.id);
  res.json({ message: 'Test o\'chirildi.' });
});

// Submissions
app.post('/api/submissions', authenticateToken, async (req, res) => {
  const { testId, answers, tabSwitches, timeSpent } = req.body;
  const test = await db.getById('tests', testId);
  if (!test) return res.status(404).json({ error: 'Test topilmadi.' });

  let correctCount = 0;
  test.questions.forEach((q, idx) => {
    if (answers && answers[idx] === q.correctAnswer) correctCount++;
  });

  const totalQuestions = test.questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= (test.passingPercentage || 70);

  await db.insert('submissions', {
    userId: req.user.id, userName: req.user.name, userEmail: req.user.email,
    testId, testTitle: test.title, score, correctCount, incorrectCount: totalQuestions - correctCount,
    tabSwitches: tabSwitches || 0, timeSpent: timeSpent || '00:00', passed
  });

  if (tabSwitches >= 3) {
    db.logSecurityIncident({ type: 'EXAM_CHEATING_ALERT', severity: 'HIGH', message: `Talaba imtihonda cheat qildi: ${req.user.email}. Tab: ${tabSwitches}`, ip: req.ip });
    broadcastToDashboard('sec_log', { type: 'EXAM_CHEATING_ALERT', severity: 'HIGH', message: `Imtihonda ko'chirish urinishi: ${req.user.name}`, ip: req.ip });
  }

  res.status(201).json({ message: 'Natijangiz saqlandi!', result: { score, correctCount, totalQuestions, passed, tabSwitches } });
});

app.get('/api/submissions', authenticateToken, async (req, res) => {
  const submissions = await db.get('submissions');
  if (req.user.role === 'student') return res.json(submissions.filter(s => s.userId === req.user.id));
  res.json(submissions);
});

app.post('/api/system/cheat-report', authenticateToken, async (req, res) => {
  const { testTitle, tabSwitches } = req.body;
  db.logSecurityIncident({ type: 'TAB_SWITCH_WARNING', severity: 'MEDIUM', message: `Talaba imtihon oynasidan chiqdi: ${req.user.name}. Test: "${testTitle}". Ogohlantirishlar: ${tabSwitches}`, ip: req.ip });
  broadcastToDashboard('sec_log', { type: 'TAB_SWITCH_WARNING', severity: 'MEDIUM', message: `Oynadan chiqish: ${req.user.name} (${tabSwitches}-marta)`, ip: req.ip });
  res.json({ success: true });
});

// System Stats
app.get('/api/admin/dashboard-stats', authenticateToken, requireRole('admin'), async (req, res) => {
  const students = await db.prisma.user.count({ where: { role: 'student' } });
  const activeStudents = await db.prisma.user.count({ where: { role: 'student', status: { not: 'Chetlashtirilgan' } } });
  const tests = await db.prisma.test.count();
  const passCount = await db.prisma.submission.count({ where: { passed: true } });
  const passRate = tests > 0 ? Math.round((passCount / (await db.prisma.submission.count() || 1)) * 100) : 0;
  
  res.json({ totalStudents: students, activeStudents, activeTests: tests, avgPassRate: passRate });
});

// Lesson Completion
app.post('/api/lessons/:id/complete', authenticateToken, async (req, res) => {
  try {
    const existing = await db.prisma.completedLesson.findUnique({
      where: {
        userId_lessonId: {
          userId: req.user.id,
          lessonId: req.params.id
        }
      }
    });

    if (!existing) {
      await db.prisma.completedLesson.create({
        data: {
          userId: req.user.id,
          lessonId: req.params.id
        }
      });
    }
    
    res.json({ success: true, message: "Dars yakunlandi" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system/stats', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const totalCourses = await db.prisma.course.count();
  const totalTests = await db.prisma.test.count();
  const totalSubmissions = await db.prisma.submission.count();
  const totalUsers = await db.prisma.user.count();
  const securityLogs = await db.get('securityLogs');
  const apiLogs = await db.get('apiLogs');

  res.json({
    system: { platform: os.platform(), arch: os.arch(), cpuModel: os.cpus()[0]?.model, uptime, maintenanceMode },
    counts: { courses: totalCourses, tests: totalTests, submissions: totalSubmissions, users: totalUsers, securityEvents: securityLogs.length, apiHits: apiLogs.length },
    recentSecurityLogs: securityLogs.slice(0, 10),
    recentApiLogs: apiLogs.slice(0, 10)
  });
});

app.post('/api/system/control', async (req, res) => {
  const { action, value } = req.body;
  if (action === 'toggle_maintenance') {
    maintenanceMode = value;
    db.logSecurityIncident({ type: 'SYSTEM_MAINTENANCE_TOGGLE', severity: 'HIGH', message: `Maintenance Mode is now ${maintenanceMode ? 'ENABLED' : 'DISABLED'}`, ip: req.ip });
    broadcastToDashboard('sec_log', { type: 'MAINTENANCE_TOGGLE', severity: 'HIGH', message: `Maintenance Mode: ${maintenanceMode ? 'YOQILDI' : 'OCHIRILDI'}` });
    return res.json({ success: true, maintenanceMode });
  }
  if (action === 'clear_logs') {
    await db.clearLogs();
    db.logSecurityIncident({ type: 'LOGS_CLEARED', severity: 'MEDIUM', message: 'System audit logs cleared.', ip: req.ip });
    broadcastToDashboard('sec_log', { type: 'LOGS_CLEARED', severity: 'MEDIUM', message: 'Loglar tozalandi.' });
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Noto\'g\'ri buyruq.' });
});

// Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  // First, dynamically generate deadline notifications before fetching
  if (req.user.role === 'student') {
    const user = await db.prisma.user.findUnique({ where: { id: req.user.id }, select: { deadline: true } });
    if (user && user.deadline) {
      const now = new Date();
      const diffTime = new Date(user.deadline) - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const checkAndCreate = async (title, message) => {
        const existing = await db.prisma.notification.findFirst({
          where: { userId: req.user.id, title }
        });
        if (!existing) {
          await db.prisma.notification.create({
            data: { userId: req.user.id, title, message }
          });
        }
      };

      if (diffDays <= 10 && diffDays > 1) {
        await checkAndCreate("Muddat tugamoqda", "Kurs muddati tugashiga 10 kundan kam vaqt qoldi. Iltimos, kursni yakunlang.");
      } else if (diffDays === 1) {
        await checkAndCreate("So'nggi kun", "Bugun kursning oxirgi kuni! Tezroq ulgurib qoling.");
      }
    }
  }

  const notifications = await db.prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(notifications);
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  await db.prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true }
  });
  res.json({ success: true });
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  db.logSecurityIncident({ type: 'SERVER_INTERNAL_ERROR', severity: 'HIGH', message: `Server Error: ${err.message}`, ip: req.ip });
  res.status(500).json({ error: 'Serverda ichki xatolik yuz berdi.' });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🔒 MathScore SECURE BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`🖥️  LIVE CONTROL PANEL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
