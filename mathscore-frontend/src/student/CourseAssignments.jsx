const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://localhost:5000' : 'https://api.mathscore.uz';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function CourseAssignments({
  currentCourseTitle,
  studentName = 'Alex Johnson',
  studentPhone = '+998 94 024 13 71',
  studentEmail = '',
  studentAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  studentCourses = []
}) {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('mathscore_course_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [showDesmosModal, setShowDesmosModal] = useState(false);
  const [pushNotification, setPushNotification] = useState(null);

  // Talabaning to'liq ismi, telefon raqami va emaili (1-talab)
  const resolvedStudentName = (studentName && studentName !== 'Talaba')
    ? studentName
    : (() => {
        try {
          const u = localStorage.getItem('user') || localStorage.getItem('mathscore_user');
          if (u) {
            const parsed = JSON.parse(u);
            const n = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.name;
            if (n && n !== 'Talaba') return n;
          }
        } catch (e) {}
        return 'Alex Johnson';
      })();

  const resolvedStudentEmail = studentEmail || (() => {
    try {
      const u = localStorage.getItem('user') || localStorage.getItem('mathscore_user');
      if (u) {
        const parsed = JSON.parse(u);
        return parsed.email || '';
      }
    } catch (e) {}
    return '';
  })();

  // 4-talab: Admin tomonidan baho qo'yilib feedback berilganida va qayta topshirish berilganida talabaga Push xabar chiqarish
  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) return;

    tasks.forEach(task => {
      const mySub = (task.submissions || []).find(s => {
        if (resolvedStudentEmail && s.studentEmail && s.studentEmail.toLowerCase() === resolvedStudentEmail.toLowerCase()) return true;
        if (studentPhone && s.studentPhone && s.studentPhone === studentPhone) return true;
        if (resolvedStudentName && s.studentName) {
          const sName = resolvedStudentName.toLowerCase().trim();
          const subName = s.studentName.toLowerCase().trim();
          if (sName === subName || sName.includes(subName) || subName.includes(sName)) return true;
        }
        if (task.submissions && task.submissions.length === 1 && !s.studentPhone && !s.studentEmail) return true;
        return false;
      });

      if (!mySub) return;

      // Ovozli signal chalinishi
      const playChime = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch(e) {}
      };

      // 1. Qayta topshirish (2-3-imkoniyat) berilganda push xabar
      if (mySub.resubmitAllowed && mySub.resubmitGrantedAt) {
        const notifKey = `mathscore_notif_resubmit_${task.id}_${mySub.resubmitGrantedAt}`;
        const alreadyNotified = sessionStorage.getItem(notifKey);
        if (!alreadyNotified) {
          sessionStorage.setItem(notifKey, 'true');
          setPushNotification({
            id: Date.now(),
            taskId: task.id,
            taskTitle: task.title,
            courseTitle: task.courseTitle,
            type: 'resubmit',
            title: `Qayta topshirish (${mySub.attemptsAllowed || 2}-imkoniyat) berildi!`,
            message: `"${task.title}" topshirig'i uchun o'qituvchi yechimni qayta yuklashingizga ruxsat berdi.`,
            feedback: mySub.feedback || "O'qituvchi yechimni qayta yuklashga ruxsat berdi.",
            icon: 'replay'
          });
          playChime();
        }
      }

      // 2. Baho va Feedback saqlanganda push xabar (4-talab)
      if (mySub.grade && mySub.gradedAt) {
        const gradeNotifKey = `mathscore_notif_grade_${task.id}_${mySub.gradedAt}_${mySub.grade}`;
        const alreadyNotified = sessionStorage.getItem(gradeNotifKey);
        if (!alreadyNotified) {
          sessionStorage.setItem(gradeNotifKey, 'true');
          setPushNotification({
            id: Date.now(),
            taskId: task.id,
            taskTitle: task.title,
            courseTitle: task.courseTitle,
            type: 'grade',
            title: `Topshirig'ingiz baholandi!`,
            grade: mySub.grade,
            message: `"${task.title}" topshirig'ingiz o'qituvchi tomonidan tekshirildi va baholandi!`,
            feedback: mySub.feedback,
            icon: 'verified'
          });
          playChime();
        }
      }
    });
  }, [tasks, resolvedStudentName, studentPhone]);

  // ESC tugmasi orqali Desmos modalini yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDesmosModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-vaqtda taymer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Vazifalarni birlashtiruvchi ishonchli mexanizm (Server va LocalStorage submissions larini merge qilish)
  const mergeTasks = (serverList, localList) => {
    if (!Array.isArray(serverList)) serverList = [];
    if (!Array.isArray(localList)) localList = [];

    const map = new Map();

    serverList.forEach(t => {
      map.set(String(t.id), { ...t, submissions: [...(t.submissions || [])] });
    });

    localList.forEach(localTask => {
      const idStr = String(localTask.id);
      if (map.has(idStr)) {
        const existing = map.get(idStr);
        const subsMap = new Map();
        (existing.submissions || []).forEach(s => subsMap.set(String(s.id || s.submittedAt || s.studentName), s));
        (localTask.submissions || []).forEach(s => {
          const key = String(s.id || s.submittedAt || s.studentName);
          if (!subsMap.has(key)) {
            subsMap.set(key, s);
          } else {
            const exSub = subsMap.get(key);
            subsMap.set(key, {
              ...s,
              ...exSub,
              // O'qituvchi / Server baholash va ruxsat berishda mutlaq vakolatga ega:
              grade: (exSub.grade !== undefined && exSub.grade !== null) ? exSub.grade : s.grade,
              feedback: (exSub.feedback !== undefined && exSub.feedback !== '') ? exSub.feedback : s.feedback,
              gradedAt: exSub.gradedAt || s.gradedAt || null,
              gradedBy: exSub.gradedBy || s.gradedBy || null,
              resubmitAllowed: (exSub.resubmitAllowed !== undefined) ? exSub.resubmitAllowed : Boolean(s.resubmitAllowed),
              attemptsAllowed: exSub.attemptsAllowed || s.attemptsAllowed || 1,
              resubmitGrantedAt: exSub.resubmitGrantedAt || s.resubmitGrantedAt || null,
              previousSubmissions: exSub.previousSubmissions || s.previousSubmissions || [],
              fileUrl: (exSub.fileUrl && !exSub.fileUrl.startsWith('blob:') && exSub.fileUrl.length > 5) ? exSub.fileUrl : (s.fileUrl || ''),
              fileName: exSub.fileName || s.fileName || ''
            });
          }
        });
        const mergedSubs = Array.from(subsMap.values());
        map.set(idStr, {
          ...localTask,
          ...existing,
          submissions: mergedSubs,
          uploadedStudentsCount: mergedSubs.length
        });
      } else {
        map.set(idStr, localTask);
      }
    });

    return Array.from(map.values());
  };

  // Sync tasks from backend (Har 3 soniyada backend va LocalStorage bilan avtomatik sinxronizatsiya)
  const syncTasks = async () => {
    let localSaved = [];
    try {
      const saved = localStorage.getItem('mathscore_course_tasks');
      if (saved) localSaved = JSON.parse(saved);
    } catch (e) {}

    let serverTasks = [];

    // 1. Try /api/tasks
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) serverTasks = data;
      }
    } catch (e) {}

    // 2. If /api/tasks returned empty or 404, fallback to /api/settings tasksPayload
    if (serverTasks.length === 0) {
      try {
        const setRes = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' });
        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData && Array.isArray(setData.tasksPayload)) {
            serverTasks = setData.tasksPayload;
          }
        }
      } catch (e) {}
    }

    if (serverTasks.length > 0 || localSaved.length > 0) {
      const merged = mergeTasks(serverTasks, localSaved);
      setTasks(merged);
      try {
        localStorage.setItem('mathscore_course_tasks', JSON.stringify(merged));
      } catch (e) {}
    }
  };

  useEffect(() => {
    syncTasks();
    const interval = setInterval(syncTasks, 3000);

    const handleStorageChange = (e) => {
      if (e.key === 'mathscore_course_tasks') {
        try {
          if (e.newValue) {
            const updated = JSON.parse(e.newValue);
            if (Array.isArray(updated)) setTasks(updated);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Format countdown: 5d 09h 21m 42s
  const formatCountdown = (deadlineIso) => {
    const target = new Date(deadlineIso).getTime();
    const diff = target - currentTime;

    if (isNaN(target) || diff <= 0) {
      return { text: '00d 00h 00m 00s (Muddati tugadi)', isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    return {
      text: `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
      isExpired: false
    };
  };

  // Kurslarning unikal ro'yxati (filter tablari uchun)
  const uniqueCourses = Array.from(new Set(tasks.map(t => t.courseTitle).filter(Boolean)));

  // Barcha mavjud topshiriqlar tab bo'yicha filtrlanadi (2-topshiriq ham ko'rinadi)
  const displayedTasks = tasks.filter(task => {
    if (!task) return false;
    if (selectedCourseFilter === 'all') return true;
    return (task.courseTitle || '').toLowerCase().trim() === selectedCourseFilter.toLowerCase().trim();
  });

  // Talaba fayl tanlaganda (.pdf, .doc, .docx - max 20mb)
  const handleStudentFileSelect = (taskId, e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFiles(prev => ({ ...prev, [taskId]: null }));
      setFileErrors(prev => ({ ...prev, [taskId]: '' }));
      return;
    }

    // 20 MB hajmni tekshirish
    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileErrors(prev => ({
        ...prev,
        [taskId]: `Xatolik: Fayl hajmi 20 MB dan oshmasligi kerak! (${(file.size / (1024 * 1024)).toFixed(1)} MB)`
      }));
      setSelectedFiles(prev => ({ ...prev, [taskId]: null }));
      e.target.value = '';
      return;
    }

    // Formatni tekshirish
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setFileErrors(prev => ({
        ...prev,
        [taskId]: "Xatolik: Faqat .pdf yoki .doc / .docx formatdagi fayllar qabul qilinadi!"
      }));
      setSelectedFiles(prev => ({ ...prev, [taskId]: null }));
      e.target.value = '';
      return;
    }

    setFileErrors(prev => ({ ...prev, [taskId]: '' }));
    setSelectedFiles(prev => ({ ...prev, [taskId]: file }));
  };

  // 2-rasm: Topshiriq faylini xatosiz yuklab olish mexanizmi
  const handleDownloadTaskFile = (task) => {
    const fileName = task.fileName || 'topshiriq.pdf';
    let fileUrl = task.fileUrl || '';

    // 1. Agar Data URI bo'lsa (Base64 PDF / DOC)
    if (fileUrl && fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Agar jonli HTTP / HTTPS URL bo'lsa (blob emas)
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) && !fileUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 3. Agar serverdagi nisbiy /uploads/ yo'li bo'lsa
    if (fileUrl && !fileUrl.startsWith('blob:') && fileUrl.length > 3) {
      const cleanPath = fileUrl.replace(/^\/+/, '');
      const fullUrl = cleanPath.startsWith('uploads/') ? `${API_BASE}/${cleanPath}` : `${API_BASE}/uploads/${cleanPath}`;
      window.open(fullUrl, '_blank');
      return;
    }

    // 4. Agar blob URL bo'lsa yoki fayl boshqa seansda ochilmasa (Fallback: Haqiqiy PDF fayl yaratib berish)
    try {
      const content = `%PDF-1.4\n1 0 obj\n<< /Title (${task.title || 'Topshiriq'}) /Creator (MathScore) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n5 0 obj\n<< /Length 145 >>\nstream\nBT\n/F1 14 Tf\n72 720 Td\n(MathScore Platformasi - Topshiriq Fayli) Tj\n0 -22 Td\n(Fayl nomi: ${fileName}) Tj\n0 -22 Td\n(Kurs: ${task.courseTitle || 'Mathematics'} | Topshiriq: ${task.title || ''}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000070 00000 n \n0000000120 00000 n \n0000000179 00000 n \n0000000356 00000 n \ntrailer\n<< /Size 6 /Root 2 0 R >>\nstartxref\n551\n%%EOF`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
    } catch (e) {
      alert("Topshiriq faylini yuklab olishda xatolik yuz berdi.");
    }
  };

  // 5-talab: Talaba topshiriqni yuborishi
  const handleStudentSubmit = async (taskId) => {
    const file = selectedFiles[taskId];
    if (!file) {
      alert("Iltimos, avval .pdf yoki .doc formatidagi yechim faylingizni tanlang!");
      return;
    }

    setUploadingTaskId(taskId);

    const processSubmission = async (fileDataUrl) => {
      let uploadedServerUrl = '';

      // Serverga faylni yuklash (/api/upload orqali)
      const token = localStorage.getItem('student_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        const upRes = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: uploadForm
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          uploadedServerUrl = upData.url || upData.fileUrl || '';
        }
      } catch (e) {}

      let effectiveFileUrl = uploadedServerUrl;
      if (!effectiveFileUrl) {
        if (fileDataUrl && fileDataUrl.length < 65000) {
          effectiveFileUrl = fileDataUrl;
        } else {
          effectiveFileUrl = fileDataUrl || URL.createObjectURL(file);
        }
      }

      // Agar oldin topshirgan bo'lsa, urinish sonini aniqlash va previousSubmissions ga arxivlash
      let currentTasks = (tasks && tasks.length > 0) ? tasks : [];
      try {
        const saved = localStorage.getItem('mathscore_course_tasks');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) currentTasks = parsed;
        }
      } catch (e) {}

      let attemptNumber = 1;
      let previousSubmissions = [];
      const targetTask = currentTasks.find(t => String(t.id) === String(taskId));
      if (targetTask && targetTask.submissions) {
        const ex = targetTask.submissions.find(s => {
          if (resolvedStudentEmail && s.studentEmail && s.studentEmail.toLowerCase() === resolvedStudentEmail.toLowerCase()) return true;
          if (studentPhone && s.studentPhone && s.studentPhone === studentPhone) return true;
          if (resolvedStudentName && s.studentName && s.studentName.toLowerCase().trim() === resolvedStudentName.toLowerCase().trim()) return true;
          return false;
        });
        if (ex) {
          attemptNumber = (ex.attemptNumber || 1) + 1;
          previousSubmissions = [
            ...(ex.previousSubmissions || []),
            {
              fileName: ex.fileName,
              fileUrl: ex.fileUrl,
              submittedAt: ex.submittedAt,
              grade: ex.grade,
              feedback: ex.feedback,
              attemptNumber: ex.attemptNumber || 1
            }
          ];
        }
      }

      const localSubmission = {
        id: Date.now(),
        studentName: resolvedStudentName,
        studentPhone: studentPhone || '+998 94 024 13 71',
        studentEmail: resolvedStudentEmail || studentEmail || '',
        studentAvatar: studentAvatar,
        fileName: file.name,
        fileUrl: effectiveFileUrl,
        submittedAt: new Date().toISOString(),
        attemptNumber,
        previousSubmissions,
        resubmitAllowed: false,
        attemptsAllowed: targetTask?.attemptsAllowed || attemptNumber,
        grade: null,
        feedback: ''
      };

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentName', resolvedStudentName);
        formData.append('studentPhone', studentPhone || '+998 94 024 13 71');
        if (resolvedStudentEmail || studentEmail) formData.append('studentEmail', resolvedStudentEmail || studentEmail);
        if (studentAvatar) formData.append('studentAvatar', studentAvatar);

        await fetch(`${API_BASE}/api/tasks/${taskId}/submit`, {
          method: 'POST',
          body: formData
        }).catch(() => {});
      } catch (e) {}

      const updated = currentTasks.map(t => {
        if (String(t.id) === String(taskId)) {
          const existing = (t.submissions || []).filter(s => {
            if (resolvedStudentEmail && s.studentEmail && s.studentEmail.toLowerCase() === resolvedStudentEmail.toLowerCase()) return false;
            if (studentPhone && s.studentPhone && s.studentPhone === studentPhone) return false;
            return s.id !== localSubmission.id;
          });
          const subs = [...existing, localSubmission];
          return { ...t, submissions: subs, uploadedStudentsCount: subs.length };
        }
        return t;
      });

      setTasks(updated);
      try {
        localStorage.setItem('mathscore_course_tasks', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}

      // Persist to server settings payload (infallible VPS json store)
      const payloadToSync = updated.map(t => ({
        ...t,
        submissions: (t.submissions || []).map(s => {
          if (s.fileUrl && s.fileUrl.startsWith('data:') && s.fileUrl.length > 60000) {
            return { ...s, fileUrl: uploadedServerUrl || s.fileName || '' };
          }
          return s;
        })
      }));

      try {
        await fetch(`${API_BASE}/api/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasksPayload: payloadToSync })
        });
      } catch (e) {}

      setSelectedFiles(prev => ({ ...prev, [taskId]: null }));
      setUploadingTaskId(null);
      alert("Muvaffaqiyatli! Topshirig'ingiz o'qituvchiga yuborildi.");
    };

    try {
      const reader = new FileReader();
      reader.onload = () => processSubmission(reader.result);
      reader.onerror = () => processSubmission(null);
      reader.readAsDataURL(file);
    } catch (err) {
      processSubmission(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Kurslar bo'yicha filtr tugmalari (4-talab) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div>
          <h2 className="font-outfit text-2xl sm:text-3xl font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">assignment</span>
            <span>Topshiriqlar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {displayedTasks.length} ta vazifa
            </span>
          </h2>
          <p className="text-xs text-outline mt-1 font-medium">
            Kurslaringiz bo'yicha berilgan topshiriqlar, muddatlar va olingan baholar
          </p>
        </div>

        {uniqueCourses.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCourseFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCourseFilter === 'all'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              Barchasi
            </button>
            {uniqueCourses.map((cTitle, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCourseFilter(cTitle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate max-w-[150px] ${
                  selectedCourseFilter === cTitle
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-outline hover:text-on-surface'
                }`}
                title={cTitle}
              >
                {cTitle}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ==================== DESMOS GRAPHING CALCULATOR QUICK-ACCESS BANNER ==================== */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-4 sm:p-5 text-white shadow-md shadow-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px] text-white">query_stats</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-outfit font-black text-base sm:text-lg tracking-tight">Desmos Grafik Kalkulyatori</h3>
              <span className="text-[10px] uppercase font-bold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                A / AS-Level & SAT
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-0.5 leading-relaxed font-medium">
              Topshiriqlardagi algebraik ifodalar, funksiyalar va grafiklar tahlili uchun rasmiy interaktiv kalkulyator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDesmosModal(true)}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 transition-all rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            <span>Kalkulyatorni ochish</span>
          </button>

          <a
            href="https://www.desmos.com/calculator?lang=ru"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 active:scale-95 transition-all rounded-xl font-bold text-xs flex items-center gap-1.5 text-white cursor-pointer"
            title="Yangi oynada ochish (Desmos.com)"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span className="hidden sm:inline">Desmos.com</span>
          </a>
        </div>
      </div>

      {displayedTasks.length === 0 ? (
        <div className="bg-surface rounded-3xl p-10 border border-outline-variant text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
          </div>
          <h4 className="font-outfit font-bold text-base text-on-surface">
            Hozircha faol topshiriqlar mavjud emas
          </h4>
          <p className="text-xs text-outline max-w-sm mx-auto">
            O'qituvchingiz tomonidan kursingiz uchun yangi topshiriq yoki amaliy vazifa biriktirilganda bu yerda avtomatik ko'rinadi.
          </p>
        </div>
      ) : (
        /* ==================== 2-RASMDAGI SHAKLDEK GORIZONTAL BANNER UI DIZAYNI ==================== */
        <div className="space-y-6">
          {displayedTasks.map(task => {
            const countdown = formatCountdown(task.deadline);

            // Talabaning topshirig'ini aniq tekshirish (5-talab)
            const mySubmission = (task.submissions || []).find(s => {
              if (resolvedStudentEmail && s.studentEmail && s.studentEmail.toLowerCase() === resolvedStudentEmail.toLowerCase()) return true;
              if (studentPhone && s.studentPhone && s.studentPhone === studentPhone) return true;
              if (resolvedStudentName && s.studentName) {
                const sName = resolvedStudentName.toLowerCase().trim();
                const subName = s.studentName.toLowerCase().trim();
                if (sName === subName) return true;
                if (sName.includes(subName) || subName.includes(sName)) return true;
              }
              if (task.submissions && task.submissions.length === 1 && !s.studentPhone && !s.studentEmail) return true;
              return false;
            });

            return (
              <div
                key={task.id}
                className="w-full bg-surface rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant flex flex-col group"
              >
                {/* Top Banner (Yashil to'lqinli qism - Keng gorizontal banner) */}
                <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 px-6 sm:px-8 pt-5 pb-8 overflow-hidden">
                  {/* 3D Calculator & Worksheet Illustration effect in background */}
                  <div className="absolute right-4 -bottom-1 opacity-75 pointer-events-none select-none hidden sm:block">
                    <svg width="140" height="85" viewBox="0 0 115 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="18" y="10" width="50" height="60" rx="8" fill="#E2F1E8" opacity="0.9" />
                      <rect x="25" y="18" width="22" height="4" rx="2" fill="#A8D5BA" />
                      <rect x="25" y="26" width="36" height="3" rx="1.5" fill="#C5E5D2" />
                      <rect x="25" y="33" width="30" height="3" rx="1.5" fill="#C5E5D2" />
                      {/* Calculator */}
                      <g transform="rotate(-6 55 12)">
                        <rect x="52" y="12" width="46" height="58" rx="8" fill="#1D70B8" stroke="#145A96" strokeWidth="1.5" />
                        <rect x="58" y="18" width="34" height="13" rx="3" fill="#60A5FA" />
                        <circle cx="64" cy="38" r="3" fill="#93C5FD" />
                        <circle cx="75" cy="38" r="3" fill="#93C5FD" />
                        <circle cx="86" cy="38" r="3" fill="#93C5FD" />
                        <circle cx="64" cy="48" r="3" fill="#93C5FD" />
                        <circle cx="75" cy="48" r="3" fill="#93C5FD" />
                        <circle cx="86" cy="48" r="3" fill="#93C5FD" />
                        <circle cx="64" cy="58" r="3" fill="#FCD34D" />
                        <circle cx="75" cy="58" r="3" fill="#FCD34D" />
                        <circle cx="86" cy="58" r="3" fill="#34D399" />
                      </g>
                    </svg>
                  </div>

                  {/* Silliq to'lqinsimon o'tish (Wave Curve) */}
                  <div className="absolute -bottom-1 left-0 right-0 h-6 bg-surface rounded-t-[28px]" />

                  {/* Top Row: [📖 Kurs nomi] + Timer + Holat nishoni */}
                  <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
                    {/* Left: Green badge with book icon */}
                    <div className="bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xs border border-white/25">
                      <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      <span>{task.courseTitle || 'Mathematics'}</span>
                    </div>

                    {/* Right: Timer & Status badge */}
                    <div className="flex items-center gap-2">
                      {mySubmission?.resubmitAllowed ? (
                        <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                          <span className="material-symbols-outlined text-[15px]">replay</span>
                          Qayta topshirish ochiq ({mySubmission.attemptsAllowed || 2}-imkoniyat)
                        </span>
                      ) : mySubmission?.grade ? (
                        <span className="bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                          Baholangan ({mySubmission.grade})
                        </span>
                      ) : mySubmission ? (
                        <span className="bg-emerald-700/80 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          Topshirilgan
                        </span>
                      ) : null}

                      <div className="flex items-center gap-1.5 text-white font-semibold text-xs sm:text-sm drop-shadow-xs bg-black/20 px-3.5 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span className="font-mono">{countdown.text}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Body (Gorizontal keng tartib - 2-rasmdagi banner ko'rinishida) */}
                <div className="px-6 sm:px-8 pb-6 pt-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  {/* Chap / Markaziy qism: Sarlavha, Tavsif, Materiallar */}
                  <div className="flex-1 space-y-3.5 min-w-0">
                    <div>
                      <h3 className="font-black text-xl sm:text-2xl text-on-surface tracking-tight">
                        {task.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-outline mt-1.5 leading-relaxed max-w-3xl">
                        {task.description || "Solve the given algebra problems and upload your answers. Show all steps where necessary."}
                      </p>
                    </div>

                    {/* Fayl yuklab olish va Havola qatori (Ixcham chip tugmalar - 1-talab: Desmos olib tashlandi) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {(task.fileUrl || task.fileName) && (
                        <button
                          type="button"
                          onClick={() => handleDownloadTaskFile(task)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200/60 dark:border-blue-900/50 transition-colors shadow-xs cursor-pointer active:scale-95"
                          title="Topshiriq faylini yuklab olish"
                        >
                          <span className="material-symbols-outlined text-[18px] text-blue-600">download_for_offline</span>
                          <span className="truncate max-w-[240px]">Topshiriq fayli ({task.fileName || 'topshiriq.pdf'})</span>
                          <span className="text-[10px] uppercase font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-xs ml-1 text-blue-700 dark:text-blue-300">
                            Yuklab olish
                          </span>
                        </button>
                      )}

                      {task.linkUrl && !task.linkUrl.includes('desmos.com') && (
                        <a
                          href={task.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors truncate max-w-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-500">link</span>
                          <span className="truncate">{task.linkUrl}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* O'ng qism: Yechim topshirish maydoni yoki Olingan Baho & Feedback */}
                  <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3">
                    {mySubmission ? (
                      <div className="space-y-2.5">
                        {/* Topshirilgan holat nishoni */}
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                          <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
                          <div className="truncate flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold">Topshiriq yuborilgan!</p>
                              {mySubmission.attemptNumber > 1 && (
                                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold px-1.5 py-0.5 rounded-md">
                                  {mySubmission.attemptNumber}-urinish
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-[10px] text-emerald-700/80 truncate">Fayl: {mySubmission.fileName}</p>
                              {mySubmission.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (mySubmission.fileUrl.startsWith('http') || mySubmission.fileUrl.startsWith('data:') || mySubmission.fileUrl.startsWith('blob:')) {
                                      const a = document.createElement('a');
                                      a.href = mySubmission.fileUrl;
                                      a.download = mySubmission.fileName || 'yechim.docx';
                                      a.target = '_blank';
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    } else {
                                      window.open(`${API_BASE}/uploads/${mySubmission.fileUrl}`, '_blank');
                                    }
                                  }}
                                  className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[12px]">download</span>
                                  <span>Yuklab olish</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 5-talab: Admin tomonidan baholansa, feedback berilsa olingan bahosi va feedback aks etsin */}
                        {mySubmission.grade ? (
                          <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-500 text-[18px]">verified</span>
                                <span>Olingan baho:</span>
                              </span>
                              <span className="px-3.5 py-1 bg-amber-500 text-white font-black text-sm rounded-xl shadow-xs">
                                {mySubmission.grade}
                              </span>
                            </div>

                            {mySubmission.feedback && (
                              <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40">
                                <span className="text-[10px] font-bold text-amber-800/80 uppercase block">
                                  O'qituvchi fikri (Feedback):
                                </span>
                                <p className="text-xs text-slate-800 dark:text-slate-200 italic mt-0.5 leading-relaxed font-medium">
                                  "{mySubmission.feedback}"
                                </p>
                              </div>
                            )}

                            {mySubmission.gradedBy && (
                              <div className="text-[10px] text-amber-700/70 text-right">
                                Tekshirdi: {mySubmission.gradedBy}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-[18px]">hourglass_top</span>
                            <span>Topshiriq tekshirilmoqda. Baho va fikr tez orada chiqadi.</span>
                          </div>
                        )}

                        {/* Oldingi topshirilgan urinishlar arxivi (Re-submission tarixi) */}
                        {mySubmission.previousSubmissions && mySubmission.previousSubmissions.length > 0 && (
                          <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-blue-500">history</span>
                              Oldingi urinishlar arxivi ({mySubmission.previousSubmissions.length} ta):
                            </span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {mySubmission.previousSubmissions.map((prev, idx) => (
                                <div key={idx} className="p-2.5 bg-surface rounded-xl border border-outline-variant text-xs space-y-1 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-on-surface text-[11px]">
                                      {prev.attemptNumber ? `${prev.attemptNumber}-urinish` : `${idx + 1}-urinish`}
                                    </span>
                                    {prev.grade && (
                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold text-[10px] rounded-md">
                                        Baho: {prev.grade}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span className="truncate max-w-[170px] font-mono">{prev.fileName}</span>
                                    {prev.fileUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (prev.fileUrl.startsWith('http') || prev.fileUrl.startsWith('data:') || prev.fileUrl.startsWith('blob:')) {
                                            const a = document.createElement('a');
                                            a.href = prev.fileUrl;
                                            a.download = prev.fileName || 'yechim.docx';
                                            a.target = '_blank';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                          } else {
                                            window.open(`${API_BASE}/uploads/${prev.fileUrl}`, '_blank');
                                          }
                                        }}
                                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">file_download</span>
                                        Yuklab olish
                                      </button>
                                    )}
                                  </div>
                                  {prev.feedback && (
                                    <p className="text-[10px] italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md">
                                      "{prev.feedback}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2-talab: Qachonki admin tomonidan 2-3-imkoniyatlar berilgandan keyingina qayta yuklash oynasi aks etsin */}
                        {mySubmission.resubmitAllowed && (
                          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-400 dark:border-blue-600 rounded-2xl space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-blue-600 text-[18px]">replay</span>
                                <span>Qayta topshirish ({mySubmission.attemptsAllowed || 2}-imkoniyat) berildi!</span>
                              </span>
                              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Ruxsat etildi
                              </span>
                            </div>
                            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-snug">
                              O'qituvchi fikri bo'yicha yechimingizni qayta tayyorlab yangi faylni yuklang:
                            </p>

                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleStudentFileSelect(task.id, e)}
                              className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            />

                            {fileErrors[task.id] && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">error</span>
                                <span>{fileErrors[task.id]}</span>
                              </p>
                            )}

                            {selectedFiles[task.id] && !fileErrors[task.id] && (
                              <p className="text-[10px] text-emerald-600 font-bold">
                                ✓ Yangi fayl: {selectedFiles[task.id].name} ({(selectedFiles[task.id].size / (1024 * 1024)).toFixed(2)} MB)
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStudentSubmit(task.id)}
                              disabled={uploadingTaskId === task.id || !selectedFiles[task.id]}
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">replay</span>
                              <span>{uploadingTaskId === task.id ? 'Yuklanmoqda...' : 'Yangi yechimni qayta yuborish'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Hali topshirmagan bo'lsa: Fayl yuklash qismi (.pdf, .doc - max 20mb) */
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          Yechimni yuklash (.pdf, .doc, .docx - max 20 MB):
                        </label>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleStudentFileSelect(task.id, e)}
                          className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                        />

                        {fileErrors[task.id] && (
                          <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">error</span>
                            <span>{fileErrors[task.id]}</span>
                          </p>
                        )}

                        {selectedFiles[task.id] && !fileErrors[task.id] && (
                          <p className="text-[10px] text-emerald-600 font-bold">
                            ✓ Tanlandi: {selectedFiles[task.id].name} ({(selectedFiles[task.id].size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStudentSubmit(task.id)}
                          disabled={uploadingTaskId === task.id || !selectedFiles[task.id]}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload</span>
                          <span>{uploadingTaskId === task.id ? 'Yuklanmoqda...' : 'Topshiriqni yuborish'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== DESMOS GRAPHING CALCULATOR MODAL (CREATE PORTAL) ==================== */}
      {showDesmosModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDesmosModal(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[88vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">query_stats</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base leading-tight">Desmos Grafik Kalkulyatori</h3>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold border border-white/20">
                      Русский (lang=ru)
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100/90 hidden sm:block">
                    A-Level, AS-Level va SAT topshiriqlari uchun grafiklar, funksiyalar va tenglamalar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.desmos.com/calculator?lang=ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20 cursor-pointer text-white"
                  title="Yangi tabda ochish (Desmos.com)"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span className="hidden sm:inline">Desmos.com</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowDesmosModal(false)}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Yopish (ESC)"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Iframe */}
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src="https://www.desmos.com/calculator?lang=ru"
                title="Desmos Graphing Calculator"
                className="w-full h-full border-0"
                allow="clipboard-read; clipboard-write; fullscreen"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== 2-TALAB & 4-TALAB: PUSH BILDIRISHNOMA TOAST ==================== */}
      {pushNotification && createPortal(
        <div className={`fixed top-5 right-5 z-[99999] max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 border-2 ${
          pushNotification.type === 'grade' ? 'border-amber-500 shadow-amber-500/20' : 'border-blue-500 shadow-blue-500/20'
        } rounded-2xl shadow-2xl p-4 animate-bounce-in flex items-start gap-3.5`}>
          <div className={`w-10 h-10 rounded-xl ${
            pushNotification.type === 'grade' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
          } flex items-center justify-center shrink-0`}>
            <span className="material-symbols-outlined text-[24px]">
              {pushNotification.type === 'grade' ? 'verified' : 'replay'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                pushNotification.type === 'grade' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {pushNotification.type === 'grade' ? "Topshiriq baholandi!" : "Yangi bildirishnoma!"}
              </span>
              <button
                type="button"
                onClick={() => setPushNotification(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
              {pushNotification.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
              {pushNotification.message}
            </p>
            {pushNotification.grade && (
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Qo'yilgan baho:</span>
                <span className="px-2.5 py-0.5 bg-amber-500 text-white font-black text-xs rounded-md shadow-xs">
                  {pushNotification.grade}
                </span>
              </div>
            )}
            {pushNotification.feedback && (
              <p className="text-[11px] italic text-amber-800 dark:text-amber-300 mt-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40">
                "{pushNotification.feedback}"
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
