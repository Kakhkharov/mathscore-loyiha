const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const db = {
  get: async (table) => {
    switch (table) {
      case 'users': return await prisma.user.findMany();
      case 'courses': return await prisma.course.findMany({ include: { lessons: true } });
      case 'tests': {
        const tests = await prisma.test.findMany({
          include: {
            questions: true,
            course: true
          }
        });
        return tests.map(t => ({
          ...t,
          course: t.course ? t.course.title : (t.category || null),
          questions: t.questions.map(q => {
            let parsedAns = q.correctAnswer;
            if (q.type === 'multiple') {
              try { parsedAns = JSON.parse(q.correctAnswer); } catch (e) { parsedAns = [0]; }
            } else if (q.type === 'truefalse') {
              parsedAns = q.correctAnswer === 'true' || q.correctAnswer === '1' || q.correctAnswer === true || q.correctAnswer === 1;
            } else if (q.type === 'single' || q.type === 'mcq') {
              parsedAns = isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer);
            }
            return {
              ...q,
              options: JSON.parse(q.options || '[]'),
              correctAnswer: parsedAns
            };
          })
        }));
      }
      case 'submissions': return await prisma.submission.findMany();
      case 'securityLogs': return await prisma.securityLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
      case 'apiLogs': return await prisma.apiLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
      default: return [];
    }
  },

  getById: async (table, id) => {
    switch (table) {
      case 'users': return await prisma.user.findUnique({ where: { id } });
      case 'courses': return await prisma.course.findUnique({ where: { id }, include: { lessons: true } });
      case 'tests': {
        const t = await prisma.test.findUnique({
          where: { id },
          include: { questions: true, course: true }
        });
        if (!t) return null;
        return {
          ...t,
          course: t.course ? t.course.title : (t.category || null),
          questions: t.questions.map(q => {
            let parsedAns = q.correctAnswer;
            if (q.type === 'multiple') {
              try { parsedAns = JSON.parse(q.correctAnswer); } catch (e) { parsedAns = [0]; }
            } else if (q.type === 'truefalse') {
              parsedAns = q.correctAnswer === 'true' || q.correctAnswer === '1' || q.correctAnswer === true || q.correctAnswer === 1;
            } else if (q.type === 'single' || q.type === 'mcq') {
              parsedAns = isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer);
            }
            return {
              ...q,
              options: JSON.parse(q.options || '[]'),
              correctAnswer: parsedAns
            };
          })
        };
      }
      case 'submissions': return await prisma.submission.findUnique({ where: { id } });
      default: return null;
    }
  },

  insert: async (table, record) => {
    switch (table) {
      case 'users': return await prisma.user.create({ data: record });
      case 'courses': {
        const data = {
          title: record.title,
          category: record.category,
          instructor: record.instructor,
          price: record.price !== undefined && record.price !== null ? String(record.price) : "",
          image: record.image,
          description: record.description
        };
        if (record.lessons && Array.isArray(record.lessons)) {
          data.lessons = {
            create: record.lessons.map(lesson => ({
              title: lesson.title,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl || ''
            }))
          };
        }
        return await prisma.course.create({ data });
      }
      case 'tests': {
        const { questions, ...testData } = record;
        const mappedQuestions = questions ? questions.map(q => {
          const { id, ...qData } = q;
          return {
            type: qData.type || 'single',
            text: qData.text || '',
            options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
            correctAnswer: typeof qData.correctAnswer === 'object'
              ? JSON.stringify(qData.correctAnswer)
              : String(qData.correctAnswer !== undefined && qData.correctAnswer !== null ? qData.correctAnswer : ''),
            score: Number(qData.score !== undefined ? qData.score : 1),
            explanation: qData.explanation || '',
            hint: qData.hint || '',
            imageUrl: qData.imageUrl || null
          };
        }) : [];

        let resolvedCourseId = testData.courseId || null;
        if (!resolvedCourseId && testData.course) {
          const matchedCourse = await prisma.course.findFirst({
            where: {
              OR: [
                { id: testData.course },
                { title: testData.course },
                { title: { contains: testData.course } }
              ]
            }
          });
          if (matchedCourse) resolvedCourseId = matchedCourse.id;
        }
        
        const cleanTestData = {
          title: testData.title,
          category: testData.category || 'General',
          difficulty: testData.difficulty || 'Medium',
          questionCount: Number(testData.questionCount || (mappedQuestions.length || 0)),
          duration: Number(testData.duration || 60),
          status: testData.status || 'Draft',
          passingPercentage: testData.passingPercentage !== undefined ? Number(testData.passingPercentage) : 70,
          startDate: testData.startDate || null,
          endDate: testData.endDate || null,
          randomizeQuestions: Boolean(testData.randomizeQuestions),
          randomizeAnswers: Boolean(testData.randomizeAnswers),
          courseId: resolvedCourseId
        };

        const created = await prisma.test.create({
          data: {
            ...cleanTestData,
            questions: { create: mappedQuestions }
          },
          include: { questions: true, course: true }
        });

        return {
          ...created,
          course: created.course ? created.course.title : (created.category || null),
          questions: created.questions.map(q => ({
            ...q,
            options: JSON.parse(q.options || '[]')
          }))
        };
      }
      case 'submissions': {
        return await prisma.submission.create({
          data: {
            userId: record.userId,
            userName: record.userName,
            userEmail: record.userEmail,
            testId: record.testId,
            testTitle: record.testTitle,
            score: Number(record.score),
            correctCount: Number(record.correctCount),
            incorrectCount: Number(record.incorrectCount),
            tabSwitches: Number(record.tabSwitches || 0),
            timeSpent: record.timeSpent || '00:00',
            passed: Boolean(record.passed)
          }
        });
      }
      default: return null;
    }
  },

  update: async (table, id, updatedFields) => {
    switch (table) {
      case 'courses': {
        const allowed = ['title', 'category', 'instructor', 'price', 'image', 'description'];
        const data = {};
        for (const key of allowed) {
          if (updatedFields[key] !== undefined) {
            if (key === 'price') {
              data[key] = String(updatedFields[key]);
            } else {
              data[key] = updatedFields[key];
            }
          }
        }
        
        if (updatedFields.lessons && Array.isArray(updatedFields.lessons)) {
          // Replace all lessons with new array
          await prisma.lesson.deleteMany({ where: { courseId: id } });
          data.lessons = {
            create: updatedFields.lessons.map(lesson => ({
              title: lesson.title,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl || ''
            }))
          };
        }
        
        return await prisma.course.update({ where: { id }, data });
      }
      case 'tests': {
        const allowed = ['title', 'category', 'difficulty', 'questionCount', 'duration', 'status', 'passingPercentage', 'startDate', 'endDate', 'randomizeQuestions', 'randomizeAnswers', 'courseId'];
        const data = {};
        for (const key of allowed) {
          if (updatedFields[key] !== undefined) {
            if (['questionCount', 'duration', 'passingPercentage'].includes(key)) {
              data[key] = Number(updatedFields[key]);
            } else if (['randomizeQuestions', 'randomizeAnswers'].includes(key)) {
              data[key] = Boolean(updatedFields[key]);
            } else {
              data[key] = updatedFields[key];
            }
          }
        }

        if (!data.courseId && updatedFields.course) {
          const matchedCourse = await prisma.course.findFirst({
            where: {
              OR: [
                { id: updatedFields.course },
                { title: updatedFields.course },
                { title: { contains: updatedFields.course } }
              ]
            }
          });
          if (matchedCourse) data.courseId = matchedCourse.id;
        }

        if (updatedFields.questions && Array.isArray(updatedFields.questions)) {
          await prisma.question.deleteMany({ where: { testId: id } });
          data.questions = {
            create: updatedFields.questions.map(q => {
              const { id: qId, ...qData } = q;
              return {
                type: qData.type || 'single',
                text: qData.text || '',
                options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
                correctAnswer: typeof qData.correctAnswer === 'object'
                  ? JSON.stringify(qData.correctAnswer)
                  : String(qData.correctAnswer !== undefined && qData.correctAnswer !== null ? qData.correctAnswer : ''),
                score: Number(qData.score !== undefined ? qData.score : 1),
                explanation: qData.explanation || '',
                hint: qData.hint || '',
                imageUrl: qData.imageUrl || null
              };
            })
          };
          if (!data.questionCount) {
            data.questionCount = updatedFields.questions.filter(q => (q.text || '').trim() !== '').length || updatedFields.questions.length;
          }
        }

        const updated = await prisma.test.update({
          where: { id },
          data,
          include: { questions: true, course: true }
        });

        return {
          ...updated,
          course: updated.course ? updated.course.title : (updated.category || null),
          questions: updated.questions.map(q => ({
            ...q,
            options: JSON.parse(q.options || '[]')
          }))
        };
      }
      default: return null;
    }
  },

  delete: async (table, id) => {
    try {
      switch (table) {
        case 'users': await prisma.user.delete({ where: { id } }); break;
        case 'courses': {
          await prisma.lesson.deleteMany({ where: { courseId: id } }).catch(() => {});
          await prisma.userCourse.deleteMany({ where: { courseId: id } }).catch(() => {});
          await prisma.test.updateMany({ where: { courseId: id }, data: { courseId: null } }).catch(() => {});
          await prisma.course.delete({ where: { id } });
          break;
        }
        case 'tests': await prisma.test.delete({ where: { id } }); break;
        default: return false;
      }
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
  },

  logApiRequest: async (logEntry) => {
    try {
      await prisma.apiLog.create({
        data: {
          method: logEntry.method,
          url: logEntry.url,
          statusCode: logEntry.statusCode || 200,
          ip: logEntry.ip,
          userAgent: logEntry.userAgent || ''
        }
      });
    } catch (err) { console.error(err); }
  },

  logSecurityIncident: async (logEntry) => {
    try {
      await prisma.securityLog.create({
        data: {
          type: logEntry.type,
          severity: logEntry.severity,
          message: logEntry.message,
          ip: logEntry.ip,
          details: logEntry.details ? JSON.stringify(logEntry.details) : null
        }
      });
    } catch (err) { console.error(err); }
  },
  
  clearLogs: async () => {
    await prisma.apiLog.deleteMany({});
    await prisma.securityLog.deleteMany({});
  },

  prisma
};

// Initialize DB with default admin if not exists
async function initDb() {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'malikatoxirova31@gmail.com' } });
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      await prisma.user.create({
        data: {
          name: "Malika Opa",
          email: "malikatoxirova31@gmail.com",
          password: bcrypt.hashSync("admin123", salt),
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
        }
      });
      await prisma.user.create({
        data: {
          name: "Alex Johnson",
          email: "student@mathscore.uz",
          password: bcrypt.hashSync("12345678", salt),
          role: "student",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop",
          course: "SAT Math Masterclass"
        }
      });
      console.log("[DB] Prisma Database initialized with default users.");
    }
  } catch (error) {
    console.error("[DB] Init Error:", error);
  }
}
initDb();

module.exports = db;
