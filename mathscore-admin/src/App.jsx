import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';
import { initialCourses, initialStudents, initialActivities } from './mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const yearlyData = [
  { name: 'Yan', daromad: 4000000, sotuv: 24 },
  { name: 'Fev', daromad: 3000000, sotuv: 18 },
  { name: 'Mar', daromad: 5000000, sotuv: 29 },
  { name: 'Apr', daromad: 4500000, sotuv: 27 },
  { name: 'May', daromad: 6000000, sotuv: 34 },
  { name: 'Iyun', daromad: 5500000, sotuv: 30 },
  { name: 'Iyul', daromad: 7000000, sotuv: 42 },
  { name: 'Avg', daromad: 8500000, sotuv: 50 },
  { name: 'Sen', daromad: 10000000, sotuv: 65 },
  { name: 'Okt', daromad: 9500000, sotuv: 60 },
  { name: 'Noy', daromad: 11000000, sotuv: 72 },
  { name: 'Dek', daromad: 12500000, sotuv: 80 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Daromad') ? entry.value.toLocaleString('ru-RU') + ' UZS' : entry.value.toLocaleString('ru-RU')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ name: 'Malika', role: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop' });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getAuthMediaUrl = (url) => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
      const token = localStorage.getItem('admin_token');
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}token=${token}`;
    }
    return url;
  };
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [courses, setCourses] = useState(initialCourses);
  const [students, setStudents] = useState(initialStudents);
  const [activities, setActivities] = useState(initialActivities);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState(null);
  const [deleteCourseInput, setDeleteCourseInput] = useState('');
  
  const [salesTimeframe, setSalesTimeframe] = useState('Oylik');
  const [revenueTimeframe, setRevenueTimeframe] = useState('Haftalik');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '', category: 'SAT Prep', price: '', instructor: 'Malika Opa', image: '', lessonsCount: '', curriculum: [], promoVideoUrl: '', promoVideoFile: ''
  });
  const [tempLesson, setTempLesson] = useState({ title: '', duration: '', videoUrl: '', videoFile: '' });

  // Video yuklash animatsiyasini simulyatsiya qilish
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const [promoUploadProgress, setPromoUploadProgress] = useState(0);
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);

  const handlePromoVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPromo(true);
    setPromoUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      
      setPromoUploadProgress(100);
      setTimeout(() => {
        setIsUploadingPromo(false);
        setNewCourse(prev => ({ ...prev, promoVideoFile: file.name, promoVideoUrl: data.url }));
      }, 300);
    } catch (err) {
      console.error("Upload error", err);
      setIsUploadingPromo(false);
    }
  };

  const handleLessonVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingLesson(true);
    setLessonUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      
      setLessonUploadProgress(100);
      setTimeout(() => {
        setIsUploadingLesson(false);
        setTempLesson(prev => ({ ...prev, videoFile: file.name, videoUrl: data.url }));
      }, 300);
    } catch (err) {
      console.error("Upload error", err);
      setIsUploadingLesson(false);
    }
  };

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', course: '', status: 'Online', deadline: ''
  });

  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [assignCourseData, setAssignCourseData] = useState({ name: '', email: '', course: '', deadline: '' });

  // Dynamic 30-question mock generator for math tests
  const generateMockQuestions = () => {
    const topics = ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics'];
    const questions = [];
    
    // Question 1: Algebra (LaTeX math)
    questions.push({
      id: 1,
      type: 'math',
      text: 'Quyidagi algebraik ifodadagi x ni toping: \\frac{3x + 5}{2} = 16',
      options: ['x = 9', 'x = 10', 'x = 7', 'x = 12'],
      correctAnswer: 0,
      score: 4,
      difficulty: 'Easy',
      explanation: 'Tenglamaning har ikkala tomonini 2 ga ko\'paytiramiz: 3x + 5 = 32. Keyin 5 ni ayiramiz: 3x = 27. x = 9.',
      hint: 'Ikkala tomonni maxrajga ko\'paytiring.',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop'
    });

    // Question 2: Calculus (LaTeX Integral)
    questions.push({
      id: 2,
      type: 'math',
      text: 'Berilgan aniq integralni hisoblang: \\int_{0}^{2} (3x^2 - 2x) dx',
      options: ['4', '6', '8', '10'],
      correctAnswer: 0,
      score: 5,
      difficulty: 'Medium',
      explanation: 'Boshlang\'ich funksiya F(x) = x^3 - x^2 bo\'ladi. Chegaralarni hisoblasak: F(2) - F(0) = (2^3 - 2^2) - (0) = 8 - 4 = 4.',
      hint: 'Boshlang\'ich funksiyani aniqlab, chegaralarni qo\'ying.',
      imageUrl: ''
    });

    // Generate 28 more premium mock questions to total 30 questions
    for (let i = 3; i <= 30; i++) {
      const topic = topics[i % topics.length];
      questions.push({
        id: i,
        type: i % 4 === 0 ? 'truefalse' : (i % 4 === 1 ? 'single' : (i % 4 === 2 ? 'multiple' : 'short')),
        text: `Quyidagi ${topic} savolini yeching: Agar f(x) = x^2 bo'lsa, f'(${i}) qiymatini hisoblang. Formula: \\frac{d}{dx}(x^2) = 2x.`,
        options: i % 4 === 0 ? ['Rost', 'Yolg\'on'] : (i % 4 === 2 ? [`${i * 2}`, `${i + 4}`, `${i * 3}`, `${i * 2} (To'g'ri)`] : [`${i * 2}`, `${i + 4}`, `${i * 3}`, `${i - 2}`]),
        correctAnswer: i % 4 === 2 ? [0, 3] : 0,
        score: 4,
        difficulty: i % 2 === 0 ? 'Easy' : 'Medium',
        explanation: `Funksiyadan hosila olsak f'(x) = 2x bo'ladi. x ning o'rniga ${i} ni qo'ysak, natija ${i * 2} bo'ladi.`,
        hint: 'Hosilaning formulasidan foydalaning.',
        imageUrl: ''
      });
    }
    return questions;
  };

  // Admin Tests state
  const [tests, setTests] = useState([
    {
      id: 1,
      title: "SAT Mathematics Standard Test 1",
      course: "SAT Mathematics Intensive",
      category: "SAT Prep",
      difficulty: "Medium",
      questionCount: 30,
      passingPercentage: 70,
      duration: 60, // minutes
      status: "Published",
      questions: generateMockQuestions(),
      startDate: "2026-05-18",
      endDate: "2026-06-18",
      randomizeQuestions: false,
      randomizeAnswers: false,
      autoSave: true,
      autoSubmit: true,
      fullscreenMode: false,
      preventCopyPaste: false,
      preventTabSwitch: false,
      enableCalculator: true,
      enableFormulaSheet: true,
      attemptLimit: 2,
      instantResult: true
    },
    {
      id: 2,
      title: "A-Level Pure Mathematics Diagnostic",
      course: "A-Level Pure Maths",
      category: "A-Level",
      difficulty: "Hard",
      questionCount: 15,
      passingPercentage: 65,
      duration: 90,
      status: "Draft",
      questions: generateMockQuestions().slice(0, 15),
      startDate: "2026-05-20",
      endDate: "2026-06-20",
      randomizeQuestions: true,
      randomizeAnswers: true,
      autoSave: true,
      autoSubmit: true,
      fullscreenMode: true,
      preventCopyPaste: true,
      preventTabSwitch: true,
      enableCalculator: true,
      enableFormulaSheet: true,
      attemptLimit: 1,
      instantResult: false
    }
  ]);

  const [activeTest, setActiveTest] = useState(null); 
  const [isBuildingTest, setIsBuildingTest] = useState(false);
  const [testBuilderTab, setTestBuilderTab] = useState('general'); // general, questions, advanced
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Search and filters for tests dashboard
  const [testSearch, setTestSearch] = useState('');
  const [testStatusFilter, setTestStatusFilter] = useState('All');
  const [testSort, setTestSort] = useState('newest');

  const [studentFilterCourse, setStudentFilterCourse] = useState('Barchasi');
  const [studentFilterStatus, setStudentFilterStatus] = useState('Hammasi');

  // New test draft/creation state
  const [newTest, setNewTest] = useState({
    title: '',
    course: 'SAT Prep',
    category: 'SAT Prep',
    description: '',
    difficulty: 'Medium',
    questionCount: 30,
    passingPercentage: 70,
    duration: 60,
    startDate: '2026-05-18',
    endDate: '2026-06-18',
    status: 'Draft',
    randomizeQuestions: false,
    randomizeAnswers: false,
    autoSave: true,
    autoSubmit: true,
    fullscreenMode: false,
    preventCopyPaste: false,
    preventTabSwitch: false,
    enableCalculator: true,
    enableFormulaSheet: true,
    attemptLimit: 1,
    instantResult: true,
    questions: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      type: 'single',
      text: '',
      options: ['A-javob', 'B-javob', 'C-javob', 'D-javob'],
      correctAnswer: 0,
      score: 4,
      difficulty: 'Medium',
      explanation: '',
      hint: '',
      negativeMarking: false,
      imageUrl: ''
    }))
  });

  const [showWordImportView, setShowWordImportView] = useState(false);
  const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Preview/Edit, 3: Settings
  const [importFileName, setImportFileName] = useState('');
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importProgressPercent, setImportProgressPercent] = useState(0);
  const [importProgressStep, setImportProgressStep] = useState('');
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [docxSettings, setDocxSettings] = useState({
    title: '',
    course: 'SAT Prep',
    category: 'SAT Prep',
    description: '',
    difficulty: 'Medium',
    timeLimit: 60,
    shuffleQuestions: false,
    shuffleAnswers: false
  });

  const [createdStudentCredentials, setCreatedStudentCredentials] = useState(null);
  
  const [landingSettings, setLandingSettings] = useState({ heroTitle: '', heroSubtitle: '', contactPhone: '', contactAddress: '', telegramLink: '' });
  const [landingResults, setLandingResults] = useState([]);
  const [newLandingResult, setNewLandingResult] = useState({ score: '', name: '', color: 'text-primary', imageUrl: '', imagePosition: 'object-center' });
  const [landingPricing, setLandingPricing] = useState([]);
  const [newLandingPricing, setNewLandingPricing] = useState({ title: '', description: '', price: '', type: 'primary', imageUrl: '' });

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('admin_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`http://localhost:5000${url}`, {
      ...options,
      headers,
      cache: 'no-store'
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('admin_token');
      setCurrentPage('login');
      throw new Error('Sessiya muddati tugadi. Iltimos, qaytadan kiring.');
    }
    return response;
  };

  const syncData = async () => {
    try {
      const coursesRes = await fetchWithAuth('/api/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
      
      const studentsRes = await fetchWithAuth('/api/students');
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
      
      const statsRes = await fetchWithAuth('/api/system/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.recentSecurityLogs) {
          const mappedLogs = statsData.recentSecurityLogs.map(log => ({
            id: log.id || Date.now() + Math.random(),
            type: log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'review' : 'instructor',
            content: `${log.type}: ${log.message}`,
            detail: `IP: ${log.ip}`,
            time: new Date(log.timestamp).toLocaleTimeString()
          }));
          setActivities(mappedLogs);
        }
      }

      const testsRes = await fetchWithAuth('/api/tests');
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData);
      }

      try {
        const setRes = await fetch('http://localhost:5001/api/settings', { cache: 'no-store' });
        if (setRes.ok) setLandingSettings(await setRes.json());
        const resRes = await fetch('http://localhost:5001/api/results', { cache: 'no-store' });
        if (resRes.ok) setLandingResults(await resRes.json());
        const priRes = await fetch('http://localhost:5001/api/pricing', { cache: 'no-store' });
        if (priRes.ok) setLandingPricing(await priRes.json());
      } catch (e) {
        console.error('Landing sync failed:', e);
      }
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetchWithAuth('/api/auth/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then(user => {
          if (user.role === 'admin') {
            setAdminProfile({
              name: user.name,
              role: 'Super Admin',
              avatar: user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
            });
            setCurrentPage('dashboard');
            syncData();
          } else {
            localStorage.removeItem('admin_token');
            setCurrentPage('login');
          }
        })
        .catch(err => {
          console.warn(err.message);
          setCurrentPage('login');
        });
    }
  }, []);

  const triggerNewTest = () => {
    setNewTest({
      title: '',
      course: 'SAT Prep',
      category: 'SAT Prep',
      description: '',
      difficulty: 'Medium',
      questionCount: 30,
      passingPercentage: 70,
      duration: 60,
      startDate: '2026-05-18',
      endDate: '2026-06-18',
      status: 'Draft',
      randomizeQuestions: false,
      randomizeAnswers: false,
      autoSave: true,
      autoSubmit: true,
      fullscreenMode: false,
      preventCopyPaste: false,
      preventTabSwitch: false,
      enableCalculator: true,
      enableFormulaSheet: true,
      attemptLimit: 1,
      instantResult: true,
      questions: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        type: 'single',
        text: '',
        options: ['A-javob', 'B-javob', 'C-javob', 'D-javob'],
        correctAnswer: 0,
        score: 4,
        difficulty: 'Medium',
        explanation: '',
        hint: '',
        negativeMarking: false,
        imageUrl: ''
      }))
    });
    setActiveQuestionIndex(0);
    setTestBuilderTab('general');
    setIsBuildingTest(true);
  };

  const handleCreateTestSubmit = async (statusVal) => {
    const finalStatus = statusVal || newTest.status;
    if (!newTest.title) return alert("Iltimos, test nomini kiriting!");
    
    const testData = {
      ...newTest,
      status: finalStatus,
      questionCount: newTest.questions.filter(q => q.text.trim() !== '').length || 30
    };

    try {
      let response;
      if (newTest.id) {
        response = await fetchWithAuth(`/api/tests/${newTest.id}`, {
          method: 'PUT',
          body: JSON.stringify(testData)
        });
      } else {
        response = await fetchWithAuth('/api/tests', {
          method: 'POST',
          body: JSON.stringify(testData)
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Testni saqlashda xatolik.');
      }

      alert(finalStatus === 'Published' ? "Test muvaffaqiyatli chop etildi!" : "Test qoralama sifatida saqlandi!");
      setIsBuildingTest(false);
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Haqiqatan ham bu testni o'chirmoqchimisiz?")) return;
    try {
      const response = await fetchWithAuth(`/api/tests/${testId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'O\'chirishda xatolik.');
      }
      alert("Test platformadan o'chirildi!");
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicateTest = async (test) => {
    const duplicated = {
      ...test,
      title: `${test.title} (Nusxa)`,
      status: 'Draft'
    };
    delete duplicated.id;

    try {
      const response = await fetchWithAuth('/api/tests', {
        method: 'POST',
        body: JSON.stringify(duplicated)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nusxalashda xatolik.');
      }
      alert("Test muvaffaqiyatli nusxalandi!");
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuestionTextToolbarClick = (action) => {
    const qIndex = activeQuestionIndex;
    const currentQ = newTest.questions[qIndex];
    let addedText = "";
    if (action === 'bold') addedText = " **matn** ";
    else if (action === 'italic') addedText = " *matn* ";
    else if (action === 'underline') addedText = " <u>matn</u> ";
    else if (action === 'bullet') addedText = "\n• ";
    else if (action === 'number') addedText = "\n1. ";
    else if (action === 'table') addedText = "\n| Ustun 1 | Ustun 2 |\n|---|---|\n| Qiymat 1 | Qiymat 2 |\n";
    else if (action === 'link') addedText = " [Havola nomi](https://example.com) ";

    const updatedQuestions = [...newTest.questions];
    updatedQuestions[qIndex] = {
      ...currentQ,
      text: (currentQ.text || "") + addedText
    };
    setNewTest({ ...newTest, questions: updatedQuestions });
  };

  const handleMathSymbolClick = (symbol) => {
    const qIndex = activeQuestionIndex;
    const currentQ = newTest.questions[qIndex];
    const updatedQuestions = [...newTest.questions];
    updatedQuestions[qIndex] = {
      ...currentQ,
      text: (currentQ.text || "") + ` $${symbol}$ `
    };
    setNewTest({ ...newTest, questions: updatedQuestions });
  };

  const handleQuestionImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          },
          body: formData
        });

        if (!res.ok) throw new Error("Rasm yuklashda xatolik yuz berdi");

        const data = await res.json();
        
        const qIndex = activeQuestionIndex;
        const currentQ = newTest.questions[qIndex];
        const updatedQuestions = [...newTest.questions];
        
        updatedQuestions[qIndex] = {
          ...currentQ,
          imageUrl: data.url
        };
        setNewTest({ ...newTest, questions: updatedQuestions });
        alert("Diagramma chizmasi muvaffaqiyatli yuklandi!");
      } catch (err) {
        alert(err.message);
      }
    };
    fileInput.click();
  };

  const renderMathPreview = (text) => {
    if (!text) return <div className="text-slate-400 text-xs italic">Formula va matn oldindan ko'rinishi shu yerda chiqadi...</div>;
    try {
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
      return (
        <div className="math-rendered p-4 bg-indigo-500/5 dark:bg-slate-900/50 border border-indigo-500/20 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-medium text-sm leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-0.5">
          {parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              const html = katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
              return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
              const html = katex.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: false });
              return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    } catch (e) {
      return <div className="text-red-500 text-xs">{text}</div>;
    }
  };

  const renderMathInline = (text) => {
    if (!text) return "";
    try {
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
      return (
        <span className="font-semibold text-xs inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
          {parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              return <BlockMath key={index} math={part.slice(2, -2)} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={index} math={part.slice(1, -1)} />;
            }
            return <span key={index}>{part}</span>;
          })}
        </span>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kirishda xatolik yuz berdi.');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Faqat adminlar kirishi mumkin.');
      }

      localStorage.setItem('admin_token', data.token);
      setAdminProfile({
        name: data.user.name,
        role: 'Super Admin',
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
      });
      setCurrentPage('dashboard');
      syncData();
      alert("Admin portalga muvaffaqiyatli kirildi!");
    } catch (err) {
      alert(err.message);
    }
  };

  const parseTestText = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    let currentQuestion = null;

    lines.forEach(line => {
      const questionMatch = line.match(/^(\d+)[\.\)\s-]+\s*(.*)$/);
      const variantMatch = line.match(/^(\+)?([A-D])[\)\.\s-]+\s*(.*)$/i) || line.match(/^(\+)(.*)$/);

      if (questionMatch && !line.match(/^(\+)?([A-D])[\)\.\s-]/i)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          questionText: questionMatch[2].trim(),
          options: [],
          correctAnswer: null,
          difficulty: 'Medium',
          points: 4
        };
      } else if (variantMatch) {
        if (!currentQuestion) {
          currentQuestion = {
            questionText: "Savol matni",
            options: [],
            correctAnswer: null,
            difficulty: 'Medium',
            points: 4
          };
        }

        let isCorrect = false;
        let optionText = "";

        const letterMatch = line.match(/^(\+)?([A-D])[\)\.\s-]+\s*(.*)$/i);
        if (letterMatch) {
          isCorrect = !!letterMatch[1];
          optionText = letterMatch[3].trim();
        } else {
          const plusMatch = line.match(/^(\+)(.*)$/);
          isCorrect = true;
          optionText = plusMatch[2].trim();
        }

        currentQuestion.options.push(optionText);
        if (isCorrect) {
          currentQuestion.correctAnswer = currentQuestion.options.length - 1;
        }
      } else {
        if (currentQuestion) {
          currentQuestion.questionText += " " + line;
        } else {
          currentQuestion = {
            questionText: line,
            options: [],
            correctAnswer: null,
            difficulty: 'Medium',
            points: 4
          };
        }
      }
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const handleDocxImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const mammoth = await import('mammoth');
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          const text = result.value;
          const parsedQuestions = parseTestText(text);
          
          if (parsedQuestions.length === 0) {
            alert("Hech qanday test savoli topilmadi. Iltimos, faylda savollar '1. ...' va variantlar 'A) ...' yoki '+A) ...' formatida ekanligini tekshiring.");
            return;
          }
          
          const updatedQuestions = [...newTest.questions];
          
          parsedQuestions.forEach((pq, idx) => {
            const mappedQuestion = {
              id: idx + 1,
              type: pq.options.length > 0 ? 'single' : 'short',
              text: pq.questionText,
              options: pq.options.length > 0 ? pq.options : ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
              correctAnswer: pq.correctAnswer !== null ? pq.correctAnswer : 0,
              score: pq.points || 4,
              difficulty: pq.difficulty || 'Medium',
              explanation: '',
              hint: '',
              imageUrl: ''
            };
            if (idx < updatedQuestions.length) {
              updatedQuestions[idx] = mappedQuestion;
            } else {
              updatedQuestions.push(mappedQuestion);
            }
          });

          setNewTest(prev => ({
            ...prev,
            questions: updatedQuestions
          }));

          alert(`Muvaffaqiyatli! ${parsedQuestions.length} ta savol Word (.docx) hujjatidan import qilindi va tizimga o'tkazildi!`);
          setActiveQuestionIndex(0);
        } catch (err) {
          console.error("Docx parsing error:", err);
          alert("Hujjatni o'qishda xatolik yuz berdi: " + err.message);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Mammoth loading error:", err);
      alert("Word faylini o'qish kutubxonasini yuklashda xatolik yuz berdi.");
    }
  };

  const convertPlainTextMathToLaTeX = (text) => {
    if (!text) return "";
    let processed = text;

    // 1. Fractions: (3x+2)/(x-1) -> \frac{3x+2}{x-1}
    processed = processed.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');
    processed = processed.replace(/\(([^)]+)\)\/([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
    processed = processed.replace(/([a-zA-Z0-9]+)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');

    // 2. Square Roots: √x or √(expression)
    processed = processed.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
    processed = processed.replace(/√([a-zA-Z0-9+-]+)/g, '\\sqrt{$1}');

    // 3. Exponents / Powers: ², ³, ⁴ or x² or x^2
    processed = processed.replace(/²/g, '^2');
    processed = processed.replace(/³/g, '^3');
    processed = processed.replace(/⁴/g, '^4');
    processed = processed.replace(/⁵/g, '^5');
    processed = processed.replace(/ⁿ/g, '^n');

    // 4. Integrals: ∫₀¹ f(x)dx or ∫ x² dx
    processed = processed.replace(/∫[₀0_]\^?[₁1]/g, '\\int_{0}^{1}');
    processed = processed.replace(/∫/g, '\\int ');

    // 5. Derivatives: dy/dx, d²y/dx²
    processed = processed.replace(/d²y\/dx²/g, '\\frac{d^2y}{dx^2}');
    processed = processed.replace(/dy\/dx/g, '\\frac{dy}{dx}');

    // 6. Limits: lim x→0 sin(x)/x
    processed = processed.replace(/lim\s+([a-zA-Z0-9]+)\s*(?:→|->|➔|\\to)\s*([a-zA-Z0-9]+)/g, '\\lim_{$1 \\to $2} ');

    // 7. Logarithms: log₂(x), ln(x)
    processed = processed.replace(/log_([0-9a-zA-Z]+)\(([^)]+)\)/g, '\\log_{$1}($2)');
    processed = processed.replace(/log₂\(([^)]+)\)/g, '\\log_2($1)');
    processed = processed.replace(/ln\(([^)]+)\)/g, '\\ln($1)');

    // 8. Sigma / Summation: Σ(i=1 to n)
    processed = processed.replace(/Σ\(([^=]+)=([^\s]+)\s+to\s+([^)]+)\)/gi, '\\sum_{$1=$2}^{$3}');
    processed = processed.replace(/Σ/g, '\\sum ');

    // 9. Matrices: [1 2] [3 4]
    processed = processed.replace(/\[([0-9a-zA-Z\s+-]+)\]\s*\[([0-9a-zA-Z\s+-]+)\]/g, (match, r1, r2) => {
      const row1 = r1.trim().replace(/\s+/g, ' & ');
      const row2 = r2.trim().replace(/\s+/g, ' & ');
      return `\\begin{pmatrix} ${row1} \\\\ ${row2} \\end{pmatrix}`;
    });

    // 10. Trigonometric Functions: sin(x), cos(x), tan(x)
    processed = processed.replace(/sin\(([^)]+)\)/g, '\\sin($1)');
    processed = processed.replace(/cos\(([^)]+)\)/g, '\\cos($1)');
    processed = processed.replace(/tan\(([^)]+)\)/g, '\\tan($1)');

    return processed;
  };

  const handleDownloadTemplate = () => {
    const templateContent = `
      <h1>MathScore Test Import Template</h1>
      <p>Barcha savollarni quyidagi formatda yozing. To'g'ri javob variantini oldiga "+" belgisini qo'ying.</p>
      <br/>
      <p>1. Quyidagi algebraik ifodadagi x ni toping: (3x+5)/2 = 16</p>
      <p>+A) x = 9</p>
      <p>B) x = 10</p>
      <p>C) x = 7</p>
      <p>D) x = 12</p>
      <br/>
      <p>2. Solve the equation: x² + 5x + 6 = 0</p>
      <p>+A) x = -2, -3</p>
      <p>B) x = 2, 3</p>
      <p>C) x = 1, 6</p>
      <p>D) x = 0</p>
      <br/>
      <p>3. Berilgan aniq integralni hisoblang: ∫₀¹ x² dx</p>
      <p>A) 1/2</p>
      <p>+B) 1/3</p>
      <p>C) 1/4</p>
      <p>D) 1</p>
    `;
    const blob = new Blob([templateContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MathScore_Test_Import_Template.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveImportedTest = (status) => {
    if (!docxSettings.title.trim()) {
      alert("Iltimos, test nomini kiriting!");
      return;
    }

    const createdTest = {
      id: Date.now(),
      title: docxSettings.title,
      course: docxSettings.course,
      category: docxSettings.category,
      difficulty: docxSettings.difficulty,
      questionCount: importedQuestions.length,
      passingPercentage: 70,
      duration: Number(docxSettings.timeLimit),
      status: status,
      questions: importedQuestions.map((q, idx) => ({
        id: idx + 1,
        type: 'single',
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        score: q.score || 4,
        difficulty: q.difficulty || 'Medium',
        explanation: q.explanation || '',
        hint: q.hint || '',
        imageUrl: q.imageUrl || ''
      })),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      randomizeQuestions: docxSettings.shuffleQuestions,
      randomizeAnswers: docxSettings.shuffleAnswers,
      autoSave: true,
      autoSubmit: true,
      fullscreenMode: false,
      preventCopyPaste: false,
      preventTabSwitch: false,
      enableCalculator: true,
      enableFormulaSheet: true,
      attemptLimit: 1,
      instantResult: true
    };

    setTests(prev => [createdTest, ...prev]);
    setActivities(prev => [
      {
        id: Date.now(),
        type: 'quiz',
        content: `Yangi test import qilindi: "${createdTest.title}"`,
        detail: `Word (.docx) fayl orqali, ${createdTest.questionCount} ta savol`,
        time: "Hozirgina"
      },
      ...prev
    ]);

    alert(`Muvaffaqiyatli! "${createdTest.title}" nomli test 30 kunlik muddat bilan faollashtirildi (Status: ${status === 'Published' ? 'Faol/Nashr etilgan' : 'Qoralama'}).`);
    setShowWordImportView(false);
    setImportStep(1);
    setImportFileName('');
    setImportedQuestions([]);
    setIsBuildingTest(false);
  };

  const handleDocxWizardImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Xatolik: Fayl o'lchami 10 MB dan oshmasligi lozim!");
      return;
    }
    
    if (!file.name.endsWith('.docx')) {
      alert("Xatolik: Faqat .docx formatidagi Word fayllarini yuklashingiz mumkin!");
      return;
    }

    setImportFileName(file.name);
    setIsProcessingImport(true);
    setImportProgressPercent(0);
    setImportProgressStep("Uploading file...");

    setTimeout(() => {
      setImportProgressPercent(15);
      setImportProgressStep("Reading DOCX...");
      
      setTimeout(() => {
        setImportProgressPercent(30);
        setImportProgressStep("Extracting questions...");
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            const text = result.value;
            
            setTimeout(() => {
              setImportProgressPercent(50);
              setImportProgressStep("Detecting correct answers...");
              
              const parsed = parseTestText(text);
              
              setTimeout(() => {
                setImportProgressPercent(70);
                setImportProgressStep("Converting math formulas...");
                
                const finalQuestions = parsed.map((pq, idx) => {
                  const convertedText = convertPlainTextMathToLaTeX(pq.questionText);
                  const convertedOptions = pq.options.map(opt => convertPlainTextMathToLaTeX(opt));
                  
                  const errors = [];
                  if (pq.correctAnswer === null) {
                    errors.push(`Question ${idx + 1} has no marked correct answer.`);
                  } else if (Array.isArray(pq.correctAnswer) ? pq.correctAnswer.length > 1 : false) {
                    errors.push(`Question ${idx + 1} has multiple marked correct answers.`);
                  }
                  
                  if (pq.options.length === 0) {
                    errors.push(`Question ${idx + 1} has no answer options.`);
                  }

                  const isDuplicate = tests.some(t => t.questions.some(q => q.text.toLowerCase().trim() === convertedText.toLowerCase().trim()));
                  if (isDuplicate) {
                    errors.push("Duplicate question detected in database.");
                  }

                  return {
                    id: idx + 1,
                    type: 'single',
                    text: convertedText,
                    options: convertedOptions.length > 0 ? convertedOptions : ['A-javob', 'B-javob', 'C-javob', 'D-javob'],
                    correctAnswer: pq.correctAnswer !== null ? pq.correctAnswer : 0,
                    score: 4,
                    difficulty: 'Medium',
                    explanation: '',
                    hint: '',
                    validationErrors: errors,
                    isDuplicate: isDuplicate
                  };
                });

                setTimeout(() => {
                  setImportProgressPercent(90);
                  setImportProgressStep("Generating preview...");
                  
                  setTimeout(() => {
                    setImportProgressPercent(100);
                    setImportProgressStep("Done");
                    setImportedQuestions(finalQuestions);
                    
                    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                    setDocxSettings(prev => ({
                      ...prev,
                      title: baseName + " Practice Test"
                    }));
                    
                    setTimeout(() => {
                      setIsProcessingImport(false);
                      setImportStep(2);
                    }, 500);
                  }, 400);
                }, 400);
              }, 400);
            }, 400);
          } catch (err) {
            console.error("Mammoth read error:", err);
            alert("Word faylini o'qishda xatolik: " + err.message);
            setIsProcessingImport(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }, 500);
    }, 500);
  };

  const renderWordImportWizard = () => {
    const totalErrors = importedQuestions.reduce((sum, q) => sum + (q.validationErrors || []).length, 0);

    return (
      <div className="modern-card p-8 space-y-6 animate-fade-in">
        {/* Wizard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500 text-[28px]">description</span>
              MS Word (.docx) Test Import System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Word hujjatidagi savollarni avtomatik ravishda onlayn test rejimiga o'tkazish.</p>
          </div>
          <button 
            onClick={() => {
              setShowWordImportView(false);
              setImportStep(1);
              setImportFileName('');
              setImportedQuestions([]);
              setIsBuildingTest(false);
            }} 
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Bekor qilish"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="flex justify-between items-center max-w-2xl mx-auto py-2">
          {[
            { step: 1, label: "Fayl yuklash" },
            { step: 2, label: "Tahrirlash & Validation" },
            { step: 3, label: "Test Sozlamalari" }
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${importStep === s.step ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : importStep > s.step ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {importStep > s.step ? <span className="material-symbols-outlined text-sm">check</span> : s.step}
                </div>
                <span className={`text-xs font-bold ${importStep === s.step ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 mx-4 ${importStep > s.step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: FILE UPLOAD CONTAINER */}
        {importStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
            {!isProcessingImport ? (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-500/5 transition-all relative">
                  <input 
                    type="file" 
                    accept=".docx" 
                    onChange={handleDocxWizardImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <span className="material-symbols-outlined text-5xl text-indigo-500 mb-3 block">upload_file</span>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">Drag & Drop your .docx file here</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">or click to browse from computer</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold">
                    <span>Faqat .docx formatlar (Max 10 MB)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">description</span>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Word import shabloni (Template)</h4>
                      <p className="text-[10px] text-slate-400 font-medium">To'g'ri integratsiya bo'lishi uchun namuna faylni yuklab oling.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span> Download Example File
                  </button>
                </div>
              </div>
            ) : (
              /* Loading Spinner / Progress flow area */
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-10 text-center space-y-6 animate-pulse">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">{importProgressStep}</h3>
                  <p className="text-xs text-slate-400 font-semibold">Tizim Word hujjatini o'qib, formulalarni LaTeXga aylantirmoqda...</p>
                </div>
                
                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${importProgressPercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-indigo-500">{importProgressPercent}% bajarildi</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUESTIONS PREVIEW AND EDIT TABLE */}
        {importStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Validation Banner / Alert */}
            {totalErrors > 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                <div>
                  <h4 className="font-black text-xs text-amber-500 uppercase tracking-wide">Validation Alerts Detected</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mt-0.5 leading-relaxed">
                    Yuklangan hujjatda {totalErrors} ta muammo aniqlandi (Masalan: javobi belgilanmagan savol, duplicate yoki formula render xatoligi). Iltimos, quyidagi jadval orqali ularni to'g'rilang.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-emerald-500">verified</span>
                <div>
                  <h4 className="font-black text-xs text-emerald-500 uppercase tracking-wide">Tizim to'liq tekshirildi (All Validated!)</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mt-0.5 leading-relaxed">
                    Barcha {importedQuestions.length} ta savol muvaffaqiyatli import qilindi. Formula va to'g'ri javob variantlari to'g'ri aniqlandi. Keyingi bosqichga o'tishingiz mumkin!
                  </p>
                </div>
              </div>
            )}

            {/* Questions Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-4 px-4 w-12 text-center">#</th>
                      <th className="py-4 px-4 w-1/3">Savol matni (Tahrirlash)</th>
                      <th className="py-4 px-4 w-1/3">Javob Variantlari</th>
                      <th className="py-4 px-4">LaTeX rendered math preview</th>
                      <th className="py-4 px-4 w-12 text-center">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {importedQuestions.map((q, idx) => (
                      <tr key={q.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${q.validationErrors.length > 0 ? 'bg-amber-500/[0.02]' : ''}`}>
                        {/* Question Number & Error Badge */}
                        <td className="py-4 px-4 align-top text-center">
                          <span className="font-black text-xs text-slate-400">{q.id}</span>
                          {q.validationErrors.length > 0 && (
                            <span className="material-symbols-outlined text-amber-500 text-base mt-2 block mx-auto" title={q.validationErrors.join('\n')}>warning</span>
                          )}
                        </td>

                        {/* Question text textarea */}
                        <td className="py-4 px-4 align-top space-y-2">
                          <textarea 
                            value={q.text}
                            onChange={e => {
                              const updated = [...importedQuestions];
                              updated[idx].text = e.target.value;
                              
                              // Recalculate validation errors
                              const errors = [];
                              if (updated[idx].correctAnswer === null) errors.push(`Question ${q.id} has no marked correct answer.`);
                              if (e.target.value.includes('/') && !e.target.value.includes('\\frac')) errors.push("Math formula could not be rendered correctly.");
                              updated[idx].validationErrors = errors;
                              
                              setImportedQuestions(updated);
                            }}
                            rows={3}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500" 
                          />
                          {q.validationErrors.map((err, errIdx) => (
                            <span key={errIdx} className="inline-block text-[9px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">{err}</span>
                          ))}
                        </td>

                        {/* Options Config */}
                        <td className="py-4 px-4 align-top space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            return (
                              <div key={optIdx} className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    const updated = [...importedQuestions];
                                    updated[idx].correctAnswer = optIdx;
                                    
                                    // Remove "no correct answer" warning
                                    updated[idx].validationErrors = updated[idx].validationErrors.filter(e => !e.includes("correct answer"));
                                    setImportedQuestions(updated);
                                  }}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent'}`}
                                >
                                  <span className="material-symbols-outlined text-[12px] font-black">check</span>
                                </button>
                                <input 
                                  value={opt}
                                  onChange={e => {
                                    const updated = [...importedQuestions];
                                    updated[idx].options[optIdx] = e.target.value;
                                    setImportedQuestions(updated);
                                  }}
                                  className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-[11px] text-slate-800 dark:text-white outline-none focus:border-indigo-500" 
                                />
                              </div>
                            );
                          })}
                        </td>

                        {/* LaTeX visual math preview */}
                        <td className="py-4 px-4 align-top space-y-2">
                          <div className="p-3 bg-indigo-500/5 dark:bg-slate-900/80 border border-indigo-500/10 dark:border-slate-800 rounded-xl space-y-2 min-h-24">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">Savol ko'rinishi:</span>
                            <div className="text-xs text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                              {renderMathInline(q.text)}
                            </div>
                            <div className="h-px bg-indigo-500/10 my-1" />
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">Variantlar preview:</span>
                            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1">
                                  <span className={`font-bold text-[10px] ${q.correctAnswer === optIdx ? 'text-emerald-500' : 'text-slate-400'}`}>{String.fromCharCode(65 + optIdx)})</span>
                                  <span>{renderMathInline(opt)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 align-top text-center">
                          <button 
                            onClick={() => {
                              const updated = importedQuestions.filter(item => item.id !== q.id).map((item, index) => ({ ...item, id: index + 1 }));
                              setImportedQuestions(updated);
                            }}
                            className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => {
                  const newQ = {
                    id: importedQuestions.length + 1,
                    type: 'single',
                    text: 'Yangi savol matnini bu yerga yozing...',
                    options: ['A-javob', 'B-javob', 'C-javob', 'D-javob'],
                    correctAnswer: 0,
                    score: 4,
                    difficulty: 'Medium',
                    explanation: '',
                    hint: '',
                    validationErrors: []
                  };
                  setImportedQuestions([...importedQuestions, newQ]);
                }}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Yangi Savol Qo'shish
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setImportStep(1)} className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Ortga</button>
                <button onClick={() => setImportStep(3)} className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 flex items-center justify-center gap-1">Davom etish <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GENERAL SETTINGS & SAVE */}
        {importStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Test Nomi (Title)</label>
                <input 
                  value={docxSettings.title}
                  onChange={e => setDocxSettings({ ...docxSettings, title: e.target.value })}
                  placeholder="SAT Math practice test" 
                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Kurs yo'nalishi (Course)</label>
                <select 
                  value={docxSettings.course}
                  onChange={e => setDocxSettings({ ...docxSettings, course: e.target.value })}
                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Kategoriya (Category)</label>
                <select 
                  value={docxSettings.category}
                  onChange={e => setDocxSettings({ ...docxSettings, category: e.target.value })}
                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {Array.from(new Set(courses.map(c => c.category))).map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  <option value="Custom">Boshqa (Custom)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Vaqt limiti (Minut)</label>
                <input 
                  type="number"
                  value={docxSettings.timeLimit}
                  onChange={e => setDocxSettings({ ...docxSettings, timeLimit: Number(e.target.value) })}
                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Qiyinchilik darajasi</label>
                <select 
                  value={docxSettings.difficulty}
                  onChange={e => setDocxSettings({ ...docxSettings, difficulty: e.target.value })}
                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Shuffling Options Toggles */}
              <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Kengaytirilgan variantlar</span>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Savollarni tasodifiy almashtirish (Shuffle Questions)</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Har bir o'quvchiga savollar alohida tartibda chiqadi.</p>
                  </div>
                  <button 
                    onClick={() => setDocxSettings({ ...docxSettings, shuffleQuestions: !docxSettings.shuffleQuestions })}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${docxSettings.shuffleQuestions ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${docxSettings.shuffleQuestions ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Javob variantlarini almashtirish (Shuffle Answers)</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Savol variantlari (A, B, C, D) tartibi tasodifiy almashtiriladi.</p>
                  </div>
                  <button 
                    onClick={() => setDocxSettings({ ...docxSettings, shuffleAnswers: !docxSettings.shuffleAnswers })}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${docxSettings.shuffleAnswers ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${docxSettings.shuffleAnswers ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setImportStep(2)} className="w-full sm:w-auto px-5 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Ortga</button>
              <button onClick={() => handleSaveImportedTest('Draft')} className="w-full sm:w-auto px-5 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Qoralama sifatida saqlash</button>
              <button onClick={() => handleSaveImportedTest('Published')} className="w-full sm:w-auto px-6 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer">Testni Chop Etish (Nashr)</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleAddLesson = () => {
    if (!tempLesson.title || !tempLesson.duration) return;
    setNewCourse(prev => ({ ...prev, curriculum: [...prev.curriculum, { id: Date.now(), ...tempLesson }] }));
    setTempLesson({ title: '', duration: '', videoUrl: '', videoFile: '' });
  };

  const handleDeleteLesson = (lessonId) => {
    setNewCourse(prev => ({ ...prev, curriculum: prev.curriculum.filter(l => l.id !== lessonId) }));
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.price) return alert("Iltimos, barcha zaruriy maydonlarni to'ldiring!");
    
    try {
      const bodyPayload = {
        ...newCourse,
        price: Number(newCourse.price),
        lessons: newCourse.curriculum,
        lessonsCount: newCourse.lessonsCount ? Number(newCourse.lessonsCount) : newCourse.curriculum.length,
        image: newCourse.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDml4tLNvySCO_8Sk5xl-mjsjhz_Ej0cqH5cHeg56Ubt-Sm8Pb7RaEXyE_QJfIlAxjKq4MaZGzrY3eO141r3AhrdP1OuulE35nT1PKttbDY_Rv7phjufab0qv_R9MDZ5vEOYjS2L6SUM9t4_zUqnW2zBjCJ75A8tEwyE8BonYWKIwircoAZ54nUSrDMuwcFkz0t59CYPzNojT7fvfsKCGrudiTQcaImh7ACT_kRWUBGhRrBhdBf3L4qePh5wotnQNm497SH1cpiDVKY"
      };

      let response;
      if (isEditing) {
        response = await fetchWithAuth(`/api/courses/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(bodyPayload)
        });
      } else {
        response = await fetchWithAuth('/api/courses', {
          method: 'POST',
          body: JSON.stringify(bodyPayload)
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kursni saqlashda xatolik.');
      }

      alert(isEditing ? "Kurs yangilandi!" : "Yangi kurs qo'shildi!");
      setIsEditing(false);
      setEditingId(null);
      setNewCourse({ title: '', category: 'SAT Prep', price: '', instructor: 'Malika Opa', image: '', lessonsCount: '', curriculum: [], promoVideoUrl: '', promoVideoFile: '' });
      setCurrentPage('courses');
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerEditCourse = (course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setNewCourse({
      title: course.title || '',
      category: course.category || 'SAT Prep',
      price: course.price || '',
      instructor: course.instructor || 'Malika Opa',
      image: course.image || '',
      lessonsCount: course.lessonsCount || '',
      curriculum: course.curriculum || course.lessons || [],
      promoVideoUrl: course.promoVideoUrl || '',
      promoVideoFile: course.promoVideoFile || ''
    });
    setCurrentPage('course-management');
  };

  const toggleCourseStatus = async (courseId) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;
    const nextStatus = target.status === "Active" ? "Draft" : "Active";
    
    try {
      const response = await fetchWithAuth(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...target, status: nextStatus })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kurs holatini yangilashda xatolik.');
      }
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetchWithAuth(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'O\'chirishda xatolik.');
      }
      alert("Kurs o'chirildi!");
      setActivities(prev => [{ id: Date.now(), type: 'course', content: `Kurs o'chirildi: ${deleteCourseTarget?.title || courseId}`, detail: "Admin tomonidan", time: "Hozirgina" }, ...prev]);
      setDeleteCourseTarget(null);
      setDeleteCourseInput('');
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    try {
      const response = await fetchWithAuth('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          course: newStudent.course,
          deadline: newStudent.deadline
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'O\'quvchini qo\'shishda xatolik.');
      }

      if (data.newCourseAdded) {
        // Existing student — new course was granted
        alert(`✅ ${data.message}`);
      } else {
        // New student created — show credentials
        setCreatedStudentCredentials({
          name: data.student.name,
          email: data.student.email,
          password: data.password
        });
      }

      setNewStudent({ name: '', email: '', course: '', status: 'Online', deadline: '' });
      setShowAddStudentModal(false);
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignCourseSubmit = async (e) => {
    e.preventDefault();
    if (!assignCourseData.email || !assignCourseData.course) return;

    try {
      const response = await fetchWithAuth('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          name: assignCourseData.name,
          email: assignCourseData.email,
          course: assignCourseData.course,
          deadline: assignCourseData.deadline
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kursni biriktirishda xatolik.');
      }

      alert(`✅ ${data.message || 'Kurs muvaffaqiyatli biriktirildi!'}`);
      setShowAssignCourseModal(false);
      setAssignCourseData({ name: '', email: '', course: '', deadline: '' });
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStudentStatus = (studentId) => setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: s.status === 'Online' ? 'Offline' : 'Online' } : s));
  
  const handleUpdateLandingSettings = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingSettings)
      });
      if(res.ok) alert("Landing sozlamalari yangilandi!");
    } catch(e) { alert("Xatolik!"); }
  };

  const handleAddLandingResult = async () => {
    if (landingResults.length >= 10) {
      alert("Maksimal 10 ta sertifikat yuklash mumkin!");
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLandingResult)
      });
      if(res.ok) {
        setLandingResults([...landingResults, await res.json()]);
        setNewLandingResult({score:'', name:'', color:'text-primary'});
      }
    } catch(e) { alert("Xatolik!"); }
  };

  const handleDeleteLandingResult = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/results/${id}`, { method: 'DELETE' });
      if(res.ok) {
        setLandingResults(landingResults.filter(r => r.id !== id));
      }
    } catch(e) { alert("Xatolik!"); }
  };

  const handleSaveAllResults = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/results/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingResults)
      });
      if(res.ok) {
        alert("Barcha natijalar va sertifikatlar muvaffaqiyatli saqlandi va asosiy Landing sahifaga integratsiya qilindi!");
      }
    } catch(e) { alert("Xatolik!"); }
  };

  const handleLandingImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchWithAuth('/api/upload', {
      method: 'POST',
      body: formData
    });
    if(!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleAddLandingPricing = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLandingPricing)
      });
      if(res.ok) {
        setLandingPricing([...landingPricing, await res.json()]);
        setNewLandingPricing({ title: '', description: '', price: '', type: 'primary', imageUrl: '' });
      }
    } catch(e) { alert("Xatolik!"); }
  };

  const handleDeleteLandingPricing = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/pricing/${id}`, { method: 'DELETE' });
      if(res.ok) {
        setLandingPricing(landingPricing.filter(p => p.id !== id));
      }
    } catch(e) { alert("Xatolik!"); }
  };

  const handleMovePricing = async (index, direction) => {
    if (index + direction < 0 || index + direction >= landingPricing.length) return;
    const newArr = [...landingPricing];
    const temp = newArr[index];
    newArr[index] = newArr[index + direction];
    newArr[index + direction] = temp;
    
    try {
      const res = await fetch('http://localhost:5001/api/pricing/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArr)
      });
      if(res.ok) setLandingPricing(newArr);
    } catch(e) { alert("Xatolik!"); }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Talabani o'chirmoqchimisiz?")) {
      try {
        const res = await fetchWithAuth(`/api/students/${studentId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'O\'chirishda xatolik.');
        }
        alert("O'quvchi tizimdan o'chirildi!");
        syncData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const [categories, setCategories] = useState([
    { id: 1, title: "SAT Prep", count: 4, students: 280, icon: "calculate", color: "from-blue-500/20 to-indigo-500/20 border-indigo-500/30" },
    { id: 2, title: "A-Level Mathematics", count: 3, students: 140, icon: "functions", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
    { id: 3, title: "Foundation Maths", count: 2, students: 95, icon: "square_foot", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
    { id: 4, title: "Olympiad Math", count: 1, students: 48, icon: "trophy", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
    { id: 5, title: "AP Calculus", count: 2, students: 64, icon: "analytics", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30" }
  ]);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ title: '', icon: 'calculate' });

  const categoryIcons = [
    { value: 'calculate', label: 'Kalkulyator' },
    { value: 'functions', label: 'Funksiyalar' },
    { value: 'square_foot', label: 'Geometriya' },
    { value: 'trophy', label: 'Olimpiada' },
    { value: 'analytics', label: 'Analitika' },
    { value: 'science', label: 'Fan' },
    { value: 'auto_stories', label: 'Kitob' },
    { value: 'psychology', label: 'Mantiq' }
  ];

  const categoryColors = [
    "from-blue-500/20 to-indigo-500/20 border-indigo-500/30",
    "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    "from-rose-500/20 to-pink-500/20 border-rose-500/30"
  ];

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.title.trim()) return;
    const color = categoryColors[categories.length % categoryColors.length];
    setCategories(prev => [...prev, { id: Date.now(), title: newCategory.title, count: 0, students: 0, icon: newCategory.icon, color }]);
    setNewCategory({ title: '', icon: 'calculate' });
    setShowAddCategoryModal(false);
  };

  const handleDeleteCategory = (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (window.confirm(`"${cat?.title}" kategoriyasini o'chirmoqchimisiz?`)) {
      setCategories(prev => prev.filter(c => c.id !== catId));
    }
  };

  const [settings, setSettings] = useState({
    adminName: 'Malika', // admin name
    brandName: 'MathScore Academy',
    primaryColor: "Ko'k (Royal Indigo)",
    newPassword: '',
    supabaseKey: 'sb_proj_key_mathscore_18972412',
    vimeoToken: ''
  });

  const filteredCourses = courses.filter(c => (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase())) && (categoryFilter === 'All' || c.category === categoryFilter));
  
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Course Filter
    const matchesCourse = studentFilterCourse === 'Barchasi' || (s.courses && s.courses.some(c => c.title === studentFilterCourse)) || s.course === studentFilterCourse;
    
    // Status Filter
    let matchesStatus = true;
    const now = new Date();
    const deadlineDate = s.deadline ? new Date(s.deadline) : null;
    
    if (studentFilterStatus === 'Faqat aktivlar') {
      matchesStatus = s.status === 'Aktiv' || s.status === 'Online';
    } else if (studentFilterStatus === 'Faqat muddati tugaganlar') {
      matchesStatus = s.status === 'Muddati tugagan';
    } else if (studentFilterStatus === 'Tugash muddati bo\'yicha') {
      matchesStatus = !!s.deadline;
    } else if (studentFilterStatus === 'Tugash muddati oy hisobida') {
      matchesStatus = deadlineDate && deadlineDate.getMonth() === now.getMonth() && deadlineDate.getFullYear() === now.getFullYear();
    } else if (studentFilterStatus === 'Chetlashtirilganlar') {
      matchesStatus = s.status === 'Chetlashtirilgan';
    }
    
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const studentsTotal = students.filter(s => s.status !== 'Chetlashtirilgan').length;
  const studentsGraduated = students.filter(s => s.status === 'Muddati tugagan').length;
  const studentsDeleted = students.filter(s => s.status === 'Chetlashtirilgan').length;

  const exportStudentsToExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      "F.I.SH.": s.name,
      "Email": s.email,
      "Telefon": s.phone || '-',
      "Kursi": (s.courses && s.courses.length > 0) ? s.courses.map(c => c.title).join(', ') : s.course,
      "Qo'shilgan sana": s.createdAt ? new Date(s.createdAt).toLocaleDateString('uz-UZ') : '-',
      "Tugash muddati": s.deadline ? new Date(s.deadline).toLocaleDateString('uz-UZ') : '-',
      "Holati": s.status === 'Muddati tugagan' ? 'Muddati tugagan' : s.status === 'Chetlashtirilgan' ? 'Chetlashtirilgan' : 'Aktiv'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar");
    XLSX.writeFile(workbook, "Oquvchilar_hisoboti.xlsx");
  };

  const exportStudentsToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text("O'quvchilar Hisoboti", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Umumiy soni: ${filteredStudents.length} ta o'quvchi`, 14, 30);
    
    const tableColumn = ["F.I.SH.", "Email", "Telefon", "Kursi", "Qo'shilgan sana", "Tugash muddati", "Holati"];
    const tableRows = [];

    filteredStudents.forEach(s => {
      const row = [
        s.name,
        s.email,
        s.phone || '-',
        (s.courses && s.courses.length > 0) ? s.courses.map(c => c.title).join(', ') : s.course,
        s.createdAt ? new Date(s.createdAt).toLocaleDateString('uz-UZ') : '-',
        s.deadline ? new Date(s.deadline).toLocaleDateString('uz-UZ') : '-',
        s.status === 'Muddati tugagan' ? 'Muddati tugagan' : s.status === 'Chetlashtirilgan' ? 'Chetlashtirilgan' : 'Aktiv'
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save("Oquvchilar_hisoboti.pdf");
  };

  const getSalesChartHeights = () => salesTimeframe === 'Haftalik' ? ['h-[35%]', 'h-[65%]', 'h-[45%]', 'h-[90%]', 'h-[75%]'] : salesTimeframe === 'Yillik' ? ['h-[90%]', 'h-[85%]', 'h-[75%]', 'h-[60%]', 'h-[80%]'] : ['h-[50%]', 'h-[66%]', 'h-[85%]', 'h-[33%]', 'h-[95%]'];
  const getRevenueSvgPath = () => revenueTimeframe === 'Oylik' ? "M0,130 Q50,110 100,60 T200,90 T300,40 T400,20" : "M0,120 Q50,80 100,100 T200,50 T300,80 T400,30";

  const handleAdminAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Fayl hajmi 5MB dan oshmasligi kerak!");
      return;
    }
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      let currentAvatar = adminProfile.avatar;
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Rasmni yuklashda xatolik');
        currentAvatar = uploadData.url;
      }
      
      const payload = { avatar: currentAvatar, name: settings.adminName };
      if (settings.newPassword && settings.newPassword.trim().length > 0) {
        payload.newPassword = settings.newPassword;
      }

      const updateRes = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Profilni yangilashda xatolik");
      
      setAdminProfile(prev => ({ ...prev, avatar: currentAvatar, name: settings.adminName }));
      setAvatarFile(null);
      if (payload.newPassword) {
        setSettings(prev => ({ ...prev, newPassword: '' }));
      }
      setActivities(prev => [{ id: Date.now(), type: 'settings', content: "Tizim sozlamalari yangilandi", detail: `Brend: ${settings.brandName}`, time: "Hozirgina" }, ...prev]);
      alert("Sozlamalar muvaffaqiyatli saqlandi! Agar parolni yangilagan bo'lsangiz, emailingizga xabar yuborildi.");
    } catch (err) {
      alert(err.message);
    }
  };
  const getThemeStyles = () => {
    if (settings.primaryColor === "Yashil (Forest Emerald)") {
      return `
        :root {
          --color-indigo-50: #ecfdf5;
          --color-indigo-100: #d1fae5;
          --color-indigo-200: #a7f3d0;
          --color-indigo-300: #6ee7b7;
          --color-indigo-400: #34d399;
          --color-indigo-500: #10b981;
          --color-indigo-600: #059669;
          --color-indigo-700: #047857;
          --color-indigo-800: #065f46;
          --color-indigo-900: #064e3b;
          --color-indigo-950: #022c22;
        }
      `;
    } else if (settings.primaryColor === "Qizil (Sunset Rose)") {
      return `
        :root {
          --color-indigo-50: #fff1f2;
          --color-indigo-100: #ffe4e6;
          --color-indigo-200: #fecdd3;
          --color-indigo-300: #fda4af;
          --color-indigo-400: #fb7185;
          --color-indigo-500: #f43f5e;
          --color-indigo-600: #e11d48;
          --color-indigo-700: #be123c;
          --color-indigo-800: #9f1239;
          --color-indigo-900: #881337;
          --color-indigo-950: #4c0519;
        }
      `;
    }
    return '';
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-50 antialiased flex flex-col font-sans transition-colors duration-300 relative bg-transparent">
      <style>{getThemeStyles()}</style>
      {cropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Rasmni moslashtirish</h3>
            <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setCropModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">Bekor qilish</button>
              <button 
                onClick={async () => {
                  try {
                    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                    setAvatarFile(croppedImage);
                    setAdminProfile(prev => ({ ...prev, avatar: URL.createObjectURL(croppedImage) }));
                    setCropModalOpen(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer shadow-md"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* -------------------- ANIMATED GRADIENT BACKGROUND -------------------- */}
      <div className="animated-gradient-bg"></div>

      {/* -------------------- LOGIN -------------------- */}
      {currentPage === 'login' && (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-sm modern-card p-10 flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                <span className="material-symbols-outlined text-[28px]">calculate</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Platformaga Kirish</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Boshqaruv tizimiga xush kelibsiz</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input name="email" required className="w-full h-12 pl-12 pr-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold transition-all text-slate-900 dark:text-white" type="text" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parol</label>
                  <span 
                    onClick={async () => {
                      const emailInput = document.querySelector('input[name="email"]').value;
                      if(!emailInput) return alert("Iltimos, avval email manzilingizni kiriting!");
                      try {
                        const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: emailInput })
                        });
                        const data = await res.json();
                        alert(data.message || "Tiklash xati yuborildi!");
                      } catch(e) {
                        alert("Xatolik yuz berdi!");
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-500 cursor-pointer hover:underline"
                  >
                    Unutdingizmi?
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input name="password" required className="w-full h-12 pl-12 pr-12 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold transition-all text-slate-900 dark:text-white" type={showPassword ? "text" : "password"} />
                  <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center justify-center gap-2 active:scale-95" type="submit">
                Tizimga kirish <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MAIN DASHBOARD SHELL -------------------- */}
      {currentPage !== 'login' && (
        <div className="flex flex-col min-h-screen bg-transparent relative z-10">
          
          {/* Header */}
          <header className="modern-card fixed top-4 left-4 right-4 h-16 flex items-center justify-between px-6 z-40 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="material-symbols-outlined text-[20px]">calculate</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{settings.brandName || 'MathScore'}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all relative">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white dark:ring-slate-900"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-72 modern-card p-5 animate-fade-in z-50">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Bildirishnomalar</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Tizimga kirildi</p>
                        <p className="text-[10px] text-slate-500 mt-1">Hozirgina</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setShowHelpModal(true)} className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </button>

              <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all">
                <span className="material-symbols-outlined text-[20px]">{darkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{adminProfile.name}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{adminProfile.role}</p>
                </div>
                <div className="w-10 h-10 shrink-0">
                  <img alt="Admin" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" src={getAuthMediaUrl(adminProfile.avatar)} />
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-1 pt-24 px-4 pb-4 gap-6">
            
            {/* Modern Sidebar */}
            <aside className="w-56 modern-card h-[calc(100vh-7rem)] sticky top-24 flex flex-col p-3 gap-1 z-30 overflow-y-auto hidden lg:flex">
              {[
                { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
                { id: 'home', icon: 'home', label: 'Bosh sahifa' },
                { id: 'categories', icon: 'category', label: 'Kategoriyalar' },
                { id: 'courses', icon: 'smart_display', label: 'Videolar' },
                { id: 'tests', icon: 'quiz', label: 'Testlar' },

                { id: 'settings', icon: 'settings', label: 'Sozlamalar' },
                { id: 'students', icon: 'group', label: 'Talabalar' },
                { id: 'landing', icon: 'web', label: 'Lending' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSearchQuery(''); syncData(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    currentPage === item.id 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage('login')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-auto rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span> Chiqish
              </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-[calc(100vh-7rem)]">
              <div className="max-w-6xl mx-auto space-y-6">

                {/* VIEW 1: DASHBOARD */}
                {currentPage === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="modern-card modern-card-hover p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Umumiy Daromad</p>
                            {(() => {
                              let total = 0;
                              students.forEach(student => {
                                if (student.courses && student.courses.length > 0) {
                                  student.courses.forEach(studentCourse => {
                                    const enrolledCourse = courses.find(c => c.id === studentCourse.id || c.title === studentCourse.title);
                                    if (enrolledCourse && enrolledCourse.price) {
                                      total += Number(enrolledCourse.price) || 0;
                                    }
                                  });
                                } else {
                                  const enrolledCourse = courses.find(c => c.title.toLowerCase() === (student.course || '').toLowerCase());
                                  if (enrolledCourse && enrolledCourse.price) {
                                    total += Number(enrolledCourse.price) || 0;
                                  }
                                }
                              });
                              const formattedRevenue = total.toLocaleString('ru-RU');
                              return <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formattedRevenue} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">UZS</span></h3>;
                            })()}
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">payments</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-emerald-500 mt-4 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">trending_up</span> +12.4% o'tgan oydan
                        </p>
                      </div>

                      <div className="modern-card modern-card-hover p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Faol Talabalar</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{students.length} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">nafar</span></h3>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-indigo-500 mt-4 flex items-center gap-1">
                          Ta'lim olayotgan talabalar
                        </p>
                      </div>

                      <div className="modern-card modern-card-hover p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Kurslar</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{courses.length} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">ta</span></h3>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">auto_stories</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-pink-500 mt-4 flex items-center gap-1">
                          Platformadagi yo'nalishlar
                        </p>
                      </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="modern-card p-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Sotuvlar Tahlili (Oyma-oy)</h4>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} content={<CustomTooltip />} />
                              <Bar dataKey="sotuv" name="Sotuvlar soni" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="modern-card p-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Daromad Trendi (2026-yil)</h4>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => value >= 1000000 ? (value/1000000) + 'M' : value} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="daromad" name="Daromad (UZS)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Logs Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="modern-card p-6 space-y-5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">Harakatlar Jurnali</h4>
                        <div className="space-y-4">
                          {activities.slice(0,4).map(a => (
                            <div key={a.id} className="flex gap-4 items-center">
                              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{a.content}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{a.detail} • {a.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="modern-card p-6 space-y-5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">Yangi Talabalar</h4>
                        <div className="space-y-4">
                          {students.slice(0,4).map(s => (
                            <div key={s.id} className="flex items-center gap-4">
                              <img src={getAuthMediaUrl(s.avatar)} alt={s.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.course}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 2: COURSES */}
                {currentPage === 'courses' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="modern-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kurslar Ro'yxati</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Platformadagi barcha faol ta'lim yo'nalishlari.</p>
                      </div>
                      <button onClick={() => { setIsEditing(false); setNewCourse({ title: '', category: 'SAT Prep', price: '', instructor: 'Malika Opa', image: '', lessonsCount: '', curriculum: [], promoVideoUrl: '', promoVideoFile: '' }); setCurrentPage('course-management'); }} className="bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 hover:opacity-90 transition-all">
                        <span className="material-symbols-outlined">add</span> Yangi Kurs
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map(course => (
                        <div key={course.id} className="modern-card modern-card-hover overflow-hidden flex flex-col group">
                          <div className="h-48 relative overflow-hidden">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{course.category}</span>
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{course.instructor}</p>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 py-3 border-y border-slate-200 dark:border-slate-700">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> {course.studentsCount || 0}</span>
                              <span className="flex items-center gap-1 text-amber-500"><span className="material-symbols-outlined text-[16px]">star</span> {course.rating || 0}</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">menu_book</span> {course.lessonsCount || (course.lessons && course.lessons.length) || (course.curriculum && course.curriculum.length) || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <p className="text-lg font-black text-indigo-500">{Number(course.price || 0).toLocaleString()} UZS</p>
                              <div className="flex gap-2">
                                <button onClick={() => triggerEditCourse(course)} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={() => { setDeleteCourseTarget(course); setDeleteCourseInput(''); }} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 3: COURSE MGT */}
                {currentPage === 'course-management' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    <div className="modern-card p-8 space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{isEditing ? "Kursni Tahrirlash" : "Yangi Kurs Yaratish"}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platformaga yangi darslik kiriting.</p>
                      </div>
                      <form onSubmit={handleCreateCourseSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Kurs Nomi</label>
                          <input required value={newCourse.title} onChange={e=>setNewCourse({...newCourse, title: e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Kategoriya</label>
                            <select value={newCourse.category} onChange={e=>setNewCourse({...newCourse, category: e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white">
                              <option>SAT Prep</option><option>A-Level</option><option>Foundation</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Narxi (UZS)</label>
                            <input required type="number" value={newCourse.price} onChange={e=>setNewCourse({...newCourse, price: e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white" />
                          </div>
                        </div>

                        {/* Course Promo Video Upload */}
                        <div className="space-y-3 p-5 bg-white/30 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Kurs Muqaddimasi (Promo Video)</label>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-500">Video Havolasi (URL)</span>
                              <input 
                                placeholder="https://example.com/promo.mp4" 
                                value={newCourse.promoVideoUrl || ''} 
                                onChange={e=>setNewCourse({...newCourse, promoVideoUrl: e.target.value})} 
                                className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-indigo-500 outline-none text-slate-900 dark:text-white" 
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-500">Video Fayli Yuklash</span>
                              <label className="flex items-center justify-center w-full h-[38px] bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
                                {isUploadingPromo ? (
                                  <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                    <div className="h-full bg-indigo-500/20 absolute left-0 top-0 transition-all duration-300" style={{ width: `${promoUploadProgress}%` }}></div>
                                    <span className="text-xs font-bold text-indigo-500 relative z-10 animate-pulse">{promoUploadProgress}% Yuklanmoqda...</span>
                                  </div>
                                ) : newCourse.promoVideoFile ? (
                                  <div className="flex items-center gap-1.5 px-3 w-full justify-between">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="material-symbols-outlined text-emerald-500 text-sm shrink-0">check_circle</span>
                                      <span className="text-xs font-bold text-emerald-500 truncate max-w-[100px]">{newCourse.promoVideoFile}</span>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewCourse({...newCourse, promoVideoFile: ''}); }} 
                                      className="text-slate-400 hover:text-rose-500 p-0.5"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    <span className="text-xs font-bold">Fayl tanlash</span>
                                  </div>
                                )}
                                <input type="file" accept="video/*" className="hidden" onChange={handlePromoVideoUpload} disabled={isUploadingPromo} />
                              </label>
                            </div>
                          </div>
                        </div>

                        <button className="w-full py-4 bg-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all">{isEditing ? "O'zgarishlarni Saqlash" : "Kursni Nashr Etish"}</button>
                      </form>
                    </div>

                    <div className="modern-card p-8 space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">O'quv Dasturi (Curriculum)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kurs tarkibidagi darslar ro'yxati.</p>
                      </div>
                      <div className="p-5 bg-white/30 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                        <input value={tempLesson.title} onChange={e=>setTempLesson({...tempLesson, title: e.target.value})} placeholder="Dars nomi" className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white" />
                        <input value={tempLesson.duration} onChange={e=>setTempLesson({...tempLesson, duration: e.target.value})} placeholder="Davomiyligi (masalan: 45 min)" className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white" />
                        
                        {/* Lesson Video Upload */}
                        <div className="p-4 bg-white/20 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Dars Videosi</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400">Video Havolasi (URL)</span>
                              <input 
                                placeholder="YouTube, Vimeo yoki MP4" 
                                value={tempLesson.videoUrl || ''} 
                                onChange={e=>setTempLesson({...tempLesson, videoUrl: e.target.value})} 
                                className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-indigo-500 outline-none text-slate-900 dark:text-white" 
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400">Yoki Fayl Yuklash</span>
                              <label className="flex items-center justify-center w-full h-[38px] bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
                                {isUploadingLesson ? (
                                  <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                    <div className="h-full bg-indigo-500/20 absolute left-0 top-0 transition-all duration-300" style={{ width: `${lessonUploadProgress}%` }}></div>
                                    <span className="text-xs font-bold text-indigo-500 relative z-10 animate-pulse">{lessonUploadProgress}% Yuklanmoqda...</span>
                                  </div>
                                ) : tempLesson.videoFile ? (
                                  <div className="flex items-center gap-1.5 px-3 w-full justify-between">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="material-symbols-outlined text-emerald-500 text-sm shrink-0">check_circle</span>
                                      <span className="text-xs font-bold text-emerald-500 truncate max-w-[100px]">{tempLesson.videoFile}</span>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTempLesson({...tempLesson, videoFile: ''}); }} 
                                      className="text-slate-400 hover:text-rose-500 p-0.5"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    <span className="text-xs font-bold">Fayl tanlash</span>
                                  </div>
                                )}
                                <input type="file" accept="video/*" className="hidden" onChange={handleLessonVideoUpload} disabled={isUploadingLesson} />
                              </label>
                            </div>
                          </div>
                        </div>

                        <button disabled={isUploadingLesson} onClick={handleAddLesson} type="button" className={`w-full py-3 font-bold rounded-xl transition-colors text-slate-900 dark:text-white ${isUploadingLesson ? 'bg-slate-200 dark:bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-500/10 hover:text-indigo-500'}`}>
                          {isUploadingLesson ? 'Video yuklanmoqda...' : "Dars Qo'shish"}
                        </button>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {newCourse.curriculum.map((l, i) => (
                          <div key={l.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white">
                            <div className="flex flex-col gap-1">
                              <span>{i+1}. {l.title} ({l.duration})</span>
                              {(l.videoUrl || l.videoFile) && (
                                <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-semibold">
                                  <span className="material-symbols-outlined text-xs">smart_display</span>
                                  <span className="truncate max-w-[200px]">{l.videoFile ? `Video fayl: ${l.videoFile}` : `Video havola: ${l.videoUrl}`}</span>
                                </div>
                              )}
                            </div>
                            <button onClick={()=>handleDeleteLesson(l.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 4: STUDENTS */}
                {currentPage === 'students' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="modern-card p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">O'quvchilar Tizimi</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platformada ta'lim olayotgan o'quvchilarni boshqarish.</p>
                      </div>
                      <button onClick={() => setShowAddStudentModal(true)} className="bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 hover:opacity-90">
                        <span className="material-symbols-outlined">person_add</span> Yangi Talaba
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="modern-card p-5 border-l-4 border-indigo-500 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px]">groups</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Talabalar soni</p>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{studentsTotal}</h3>
                        </div>
                      </div>
                      <div className="modern-card p-5 border-l-4 border-emerald-500 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px]">school</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kursni bitirganlar</p>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{studentsGraduated}</h3>
                        </div>
                      </div>
                      <div className="modern-card p-5 border-l-4 border-rose-500 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px]">person_off</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chetlashtirilganlar</p>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{studentsDeleted}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Filters & Export */}
                    <div className="modern-card p-4 flex flex-col xl:flex-row justify-between items-center gap-4">
                      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                          <input 
                            type="text" 
                            placeholder="Ism yoki familiya qidirish..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full sm:w-auto pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none min-w-[200px]"
                          />
                        </div>
                        <select 
                          value={studentFilterCourse}
                          onChange={(e) => setStudentFilterCourse(e.target.value)}
                          className="h-10 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none min-w-[150px]"
                        >
                          <option value="Barchasi">Barcha Kurslar</option>
                          {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                        </select>

                        <select 
                          value={studentFilterStatus}
                          onChange={(e) => setStudentFilterStatus(e.target.value)}
                          className="h-10 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none min-w-[200px]"
                        >
                          <option value="Hammasi">Hammasi (Faol & Tugagan)</option>
                          <option value="Tugash muddati bo'yicha">Tugash muddati borlar</option>
                          <option value="Tugash muddati oy hisobida">Shu oyda tugaydiganlar</option>
                          <option value="Faqat aktivlar">Faqat Aktivlar</option>
                          <option value="Faqat muddati tugaganlar">Faqat Muddati Tugaganlar</option>
                          <option value="Chetlashtirilganlar">Chetlashtirilganlar</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button onClick={exportStudentsToExcel} className="h-10 px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[18px]">table_chart</span> Excel (.xlsx)
                        </button>
                        <button onClick={exportStudentsToPDF} className="h-10 px-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-rose-500/20">
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> PDF
                        </button>
                      </div>
                    </div>

                    <div className="modern-card overflow-hidden overflow-x-auto">
                      <div className="min-w-[800px]">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 grid grid-cols-7 font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <div className="col-span-2">Talaba Ma'lumotlari</div>
                          <div>Kurs nomi</div>
                          <div>Qo'shilgan sana</div>
                          <div>Tugash muddati</div>
                          <div>Holati</div>
                          <div className="text-right">Amallar</div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {filteredStudents.map(std => (
                            <div key={std.id} className="p-5 grid grid-cols-7 items-center hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors gap-4">
                              <div className="col-span-2 flex items-center gap-4">
                                <img 
                                  src={getAuthMediaUrl(std.avatar)} 
                                  className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover" 
                                  alt={std.name}
                                />
                                <div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white">{std.name}</p>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] xl:max-w-[220px]" title={std.email.replace(/\.archived\.\d+/, '')}>
                                    {std.email.replace(/\.archived\.\d+/, '')}
                                  </p>
                                  {std.phone && <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mt-0.5">{std.phone}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-start">
                                {(std.courses && std.courses.length > 0) ? std.courses.map((c, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20">{c.title}</span>
                                )) : (
                                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{std.course}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{std.createdAt ? new Date(std.createdAt).toLocaleDateString('uz-UZ') : '-'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{std.deadline ? new Date(std.deadline).toLocaleDateString('uz-UZ') : '-'}</span>
                              </div>
                              <div>
                                <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-full ${std.status === 'Muddati tugagan' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : std.status === 'Chetlashtirilgan' ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20 line-through' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                  {std.status === 'Muddati tugagan' ? 'Muddati tugagan' : std.status === 'Chetlashtirilgan' ? 'Chetlashtirilgan' : 'Aktiv'}
                                </span>
                              </div>
                              <div className="text-right flex justify-end gap-3">
                                {std.email.includes('.archived.') && (
                                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-500/10 text-slate-500 cursor-not-allowed" title="Ushbu hisob arxivlangan (Taqiqlangan)">
                                    <span className="material-symbols-outlined text-[16px]">block</span>
                                  </div>
                                )}
                                <button 
                                  onClick={() => {
                                    setAssignCourseData({ name: std.name, email: std.email.replace(/\.archived\.\d+/, ''), course: '', deadline: std.deadline ? new Date(std.deadline).toISOString().split('T')[0] : '' });
                                    setShowAssignCourseModal(true);
                                  }} 
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer" 
                                  title="Yangi kursga ruxsat berish"
                                >
                                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                                </button>
                                <button onClick={()=>handleDeleteStudent(std.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer" title="Chetlashtirish"><span className="material-symbols-outlined text-[16px]">close</span></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 5: HOME */}
                {currentPage === 'home' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="modern-card p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Xush kelibsiz, Malika Opa! 👋</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Platformaning umumiy boshqaruvi va o'quvchilar ko'rsatkichlari nazorati sizning qo'lingizda.</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={triggerNewTest} className="px-5 py-3 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">quiz</span> Yangi Test</button>
                        <button onClick={() => setCurrentPage('courses')} className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">smart_display</span> Videolar</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { title: "Bugungi faoliyat", value: `${tests.length} ta test`, detail: "Umumiy tizimdagi testlar", icon: "update", color: "text-indigo-500 bg-indigo-500/10" },
                        { title: "Sotuvlar soni", value: `${students.reduce((acc, s) => acc + (s.courses?.length || 1), 0)} ta kurs`, detail: "Tizimdagi xaridlar", icon: "trending_up", color: "text-emerald-500 bg-emerald-500/10" },
                        { title: "Ortacha reyting", value: "4.92 / 5.0", detail: `${students.length} o'quvchi fikri`, icon: "star", color: "text-amber-500 bg-amber-500/10" },
                        { title: "Yuklangan darslar", value: `${courses.reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 0), 0)} ta video`, detail: "Sifatli HD formatda", icon: "smart_display", color: "text-pink-500 bg-pink-500/10" }
                      ].map((item, i) => (
                        <div key={i} className="modern-card p-6 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.title}</p>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{item.value}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="modern-card p-6 lg:col-span-2 space-y-4">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Tezkor E'lonlar va Topshiriqlar</h3>
                        <div className="space-y-3">
                          {[
                            { title: "SAT Math yangi standart test versiyasi", desc: "Talabalar o'rtasida katta sinov testi rejalashtirildi.", date: "22-May, 14:00" },
                            { title: "A-Level darslarining integratsiya tahlili", desc: "Integrallash bo'limidagi yangi savollar yuklandi.", date: "Hozirgina" }
                          ].map((ann, i) => (
                            <div key={i} className="p-4 bg-white/30 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-indigo-500">{ann.date}</span>
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-bold uppercase">Muhim</span>
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{ann.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="modern-card p-6 space-y-4">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">O'qituvchi Ma'lumotlari</h3>
                        <div className="flex flex-col items-center text-center p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
                          <img className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30" src={getAuthMediaUrl(adminProfile.avatar)} alt={adminProfile.name} />
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white">{adminProfile.name}</h4>
                            <p className="text-xs text-indigo-500 font-bold uppercase mt-1">Loyiha Asoschisi & Bosh Ustoz</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Algebra, Geometriya, SAT va A-Level Matematikasi bo'yicha 8 yillik xalqaro tajriba.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 6: CATEGORIES */}
                {currentPage === 'categories' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="modern-card p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kurs Kategoriyalari</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platformada o'tiladigan matematik yo'nalishlar.</p>
                      </div>
                      <button onClick={() => setShowAddCategoryModal(true)} className="bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 hover:opacity-90">
                        <span className="material-symbols-outlined">add_circle</span> Yangi Kategoriya
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat.id} className={`modern-card bg-gradient-to-br ${cat.color} border p-6 space-y-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative group`}>
                          <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-3xl text-indigo-500">{cat.icon}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-white/80 dark:bg-slate-800 text-[10px] font-bold rounded-full text-slate-700 dark:text-slate-300 shadow-sm">{cat.count} ta kurs</span>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)} 
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                title="Kategoriyani o'chirish"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{cat.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platformadagi yetakchi ta'lim yo'nalishlaridan biri.</p>
                          </div>
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span>A'zo o'quvchilar:</span>
                            <span className="text-indigo-500 font-black">{cat.students} nafar</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Category Modal */}
                    {showAddCategoryModal && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="modern-card w-full max-w-md p-8 space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Yangi Kategoriya Qo'shish</h3>
                            <button onClick={() => setShowAddCategoryModal(false)} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>
                          <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Kategoriya Nomi</label>
                              <input 
                                required 
                                value={newCategory.title} 
                                onChange={e => setNewCategory({...newCategory, title: e.target.value})} 
                                placeholder="Masalan: IELTS Mathematics" 
                                className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Ikonka</label>
                              <div className="grid grid-cols-4 gap-2">
                                {categoryIcons.map(ic => (
                                  <button 
                                    type="button" 
                                    key={ic.value} 
                                    onClick={() => setNewCategory({...newCategory, icon: ic.value})}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${newCategory.icon === ic.value ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400'}`}
                                  >
                                    <span className="material-symbols-outlined text-[20px]">{ic.value}</span>
                                    <span className="text-[9px] font-bold">{ic.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button className="w-full p-4 bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all">Saqlash</button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* VIEW 8: SETTINGS */}
                {currentPage === 'settings' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="modern-card p-6">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Platforma Sozlamalari</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Brending, xavfsizlik va bulut xizmatlarini integratsiya qilish sozlamalari.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <form onSubmit={handleSaveSettings} className="modern-card p-6 space-y-5 lg:col-span-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">Tizim va Xavfsizlik Sozlamalari</h3>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="relative group cursor-pointer w-20 h-20 shrink-0">
                            <img alt="Admin Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-md" src={getAuthMediaUrl(adminProfile.avatar)} />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                            </div>
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={handleAdminAvatarChange}
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Profil rasmi</h4>
                            <p className="text-xs text-slate-500 mt-1">Yangi rasmni yuklang va kerakli qismini kesib oling. Maksimal hajm: 5MB.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">F.I.SH. (Admin ismi)</label>
                            <input value={settings.adminName} onChange={e=>setSettings({...settings, adminName:e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tizim nomi (Brand)</label>
                            <input value={settings.brandName} onChange={e=>setSettings({...settings, brandName:e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Asosiy rang mavzusi</label>
                            <select value={settings.primaryColor} onChange={e=>setSettings({...settings, primaryColor:e.target.value})} className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                              <option value="Ko'k (Royal Indigo)">Ko'k (Royal Indigo)</option>
                              <option value="Yashil (Forest Emerald)">Yashil (Forest Emerald)</option>
                              <option value="Qizil (Sunset Rose)">Qizil (Sunset Rose)</option>
                            </select>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Kirish uchun yangi parol</label>
                            <input type="password" value={settings.newPassword} onChange={e=>setSettings({...settings, newPassword:e.target.value})} placeholder="••••••••" className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                          </div>
                        </div>
                        <button type="submit" className="px-5 py-3 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-all">O'zgarishlarni Saqlash</button>
                      </form>

                      <div className="modern-card p-6 space-y-5">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">Bulut Integratsiyalari</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                            <h4 className="font-bold text-xs text-indigo-500 uppercase tracking-wider">Supabase Video Storage</h4>
                            <p className="text-[10px] text-slate-500">Video fayllarini bulutga to'g'ridan-to'g'ri yuklash uchun API kaliti konfiguratsiyasi.</p>
                            <input type="password" value={settings.supabaseKey} onChange={e=>setSettings({...settings, supabaseKey:e.target.value})} className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500" />
                          </div>

                          <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2">
                            <h4 className="font-bold text-xs text-purple-500 uppercase tracking-wider">Vimeo API Config</h4>
                            <p className="text-[10px] text-slate-500">Dars videolarini o'quvchilarga oqimli va xavfsiz (stream) uzatish kaliti.</p>
                            <input placeholder="Vimeo Access Token" value={settings.vimeoToken} onChange={e=>setSettings({...settings, vimeoToken:e.target.value})} className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 9: TESTS (TEST DASHBOARD & TEST BUILDER) */}
                {currentPage === 'tests' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* TEST DASHBOARD LIST VIEW (when not in builder) */}
                    {!isBuildingTest ? (
                      <div className="space-y-6">
                        
                        {/* Summary Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="modern-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[24px]">quiz</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Umumiy Testlar</p>
                              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{tests.length} ta</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Yaratilgan sinov jami</p>
                            </div>
                          </div>
                          
                          <div className="modern-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[24px]">verified</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chop etilgan (Published)</p>
                              <h4 className="text-2xl font-black text-emerald-500 mt-1">{tests.filter(t => t.status === 'Published').length} ta</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Faol holatda</p>
                            </div>
                          </div>

                          <div className="modern-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[24px]">edit_note</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qoralama testlar (Draft)</p>
                              <h4 className="text-2xl font-black text-amber-500 mt-1">{tests.filter(t => t.status === 'Draft').length} ta</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tahrirlash jarayonida</p>
                            </div>
                          </div>
                        </div>

                        {/* Top Filters & Action Row */}
                        <div className="modern-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                            <div className="relative w-full sm:max-w-xs">
                              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                              <input 
                                value={testSearch}
                                onChange={e => setTestSearch(e.target.value)}
                                placeholder="Test nomini qidirish..." 
                                className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                              />
                            </div>
                            <select 
                              value={testStatusFilter}
                              onChange={e => setTestStatusFilter(e.target.value)}
                              className="w-full sm:w-auto p-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                            >
                              <option value="All">Barcha Statuslar</option>
                              <option value="Published">Nashr Etilgan</option>
                              <option value="Draft">Qoralama</option>
                            </select>
                            <select 
                              value={testSort}
                              onChange={e => setTestSort(e.target.value)}
                              className="w-full sm:w-auto p-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                            >
                              <option value="newest">Yangi qo'shilganlar</option>
                              <option value="oldest">Eski qo'shilganlar</option>
                            </select>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                            <button 
                              onClick={() => {
                                setShowWordImportView(true);
                                setImportStep(1);
                                setImportFileName('');
                                setImportedQuestions([]);
                                setIsBuildingTest(true);
                              }}
                              className="w-full sm:w-auto bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-all select-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined">upload_file</span> Word (.docx) Fayldan Import
                            </button>
                            <button 
                              onClick={triggerNewTest}
                              className="w-full sm:w-auto bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-all select-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined">add_circle</span> Yangi Test Yaratish
                            </button>
                          </div>
                        </div>

                        {/* List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {tests
                            .filter(t => {
                              const matchSearch = t.title.toLowerCase().includes(testSearch.toLowerCase());
                              const matchStatus = testStatusFilter === 'All' || t.status === testStatusFilter;
                              return matchSearch && matchStatus;
                            })
                            .sort((a,b) => testSort === 'newest' ? b.id - a.id : a.id - b.id)
                            .map(test => (
                              <div key={test.id} className="modern-card p-6 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all border border-slate-200 dark:border-slate-700/50">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-bold uppercase tracking-wider">{test.category}</span>
                                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${test.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{test.status === 'Published' ? 'Faol' : 'Qoralama'}</span>
                                  </div>
                                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{test.title}</h3>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{test.course}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Savollar</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-0.5"><span className="material-symbols-outlined text-[13px] text-indigo-500">list</span> {test.questionCount || test.questions.length} ta</span>
                                  </div>
                                  <div className="space-y-1 border-x border-slate-200 dark:border-slate-800">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vaqt Limiti</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-0.5"><span className="material-symbols-outlined text-[13px] text-indigo-500">timer</span> {test.duration} min</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Daraja</span>
                                    <span className={`text-xs font-black flex items-center justify-center gap-0.5 ${test.difficulty === 'Hard' ? 'text-rose-500' : (test.difficulty === 'Medium' ? 'text-indigo-500' : 'text-emerald-500')}`}><span className="material-symbols-outlined text-[13px]">tune</span> {test.difficulty}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-[10px] font-bold text-slate-400">Muddati: {test.startDate} - {test.endDate}</span>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleDuplicateTest(test)} 
                                      title="Nusxalash"
                                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setNewTest({ ...test });
                                        setActiveQuestionIndex(0);
                                        setTestBuilderTab('general');
                                        setIsBuildingTest(true);
                                      }}
                                      title="Tahrirlash"
                                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteTest(test.id)} 
                                      title="O'chirish"
                                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      showWordImportView ? (
                        renderWordImportWizard()
                      ) : (
                        /* POWERFUL ONLINE TEST BUILDER VIEW */
                        <div className="modern-card p-8 space-y-6 animate-fade-in">
                        
                        {/* Builder Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Online Test Quruvchi (Test Builder)</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platforma o'quvchilari uchun test rejimini sozlashingiz mumkin.</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleCreateTestSubmit('Draft')} 
                              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Qoralama sifatida saqlash
                            </button>
                            <button 
                              onClick={() => handleCreateTestSubmit('Published')} 
                              className="px-5 py-2.5 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-colors"
                            >
                              Testni Chop Etish (Nashr)
                            </button>
                            <button 
                              onClick={() => setIsBuildingTest(false)} 
                              className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors border border-slate-200 dark:border-slate-700"
                              title="Yopish"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>
                        </div>

                        {/* Builder Tab Navigation */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                          {[
                            { id: 'general', label: '1. Umumiy sozlamalar', icon: 'settings' },
                            { id: 'questions', label: '2. Savollar boshqaruvchisi', icon: 'list_alt' },
                            { id: 'advanced', label: '3. Kengaytirilgan sozlamalar', icon: 'shield_lock' }
                          ].map(t => (
                            <button 
                              key={t.id}
                              onClick={() => setTestBuilderTab(t.id)}
                              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all ${testBuilderTab === t.id ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                              <span>{t.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* TAB 1: GENERAL TEST SETTINGS */}
                        {testBuilderTab === 'general' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Test Nomi / Sarlavhasi</label>
                                <input 
                                  required 
                                  value={newTest.title} 
                                  onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                                  placeholder="Masalan: SAT Matematika Kirish Imtihoni 1"
                                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Kurs yo'nalishi</label>
                                  <select 
                                    value={newTest.course} 
                                    onChange={e => setNewTest({ ...newTest, course: e.target.value })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                  >
                                    <option value="">Kursni tanlang</option>
                                    {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Kategoriya</label>
                                  <select 
                                    value={newTest.category} 
                                    onChange={e => setNewTest({ ...newTest, category: e.target.value })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                  >
                                    <option value="">Kategoriyani tanlang</option>
                                    {Array.from(new Set(courses.map(c => c.category))).map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Test Izohi (Tavsifi)</label>
                                <textarea 
                                  value={newTest.description}
                                  onChange={e => setNewTest({ ...newTest, description: e.target.value })}
                                  placeholder="Test bo'yicha yo'riqnoma yoki qisqacha ma'lumot..."
                                  rows={4}
                                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Qiyinchilik Darajasi</label>
                                  <select 
                                    value={newTest.difficulty} 
                                    onChange={e => setNewTest({ ...newTest, difficulty: e.target.value })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                  >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Vaqt Limiti (daqiqa)</label>
                                  <input 
                                    type="number" 
                                    value={newTest.duration} 
                                    onChange={e => setNewTest({ ...newTest, duration: Number(e.target.value) })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">O'tish foizi (%)</label>
                                  <input 
                                    type="number" 
                                    value={newTest.passingPercentage} 
                                    onChange={e => setNewTest({ ...newTest, passingPercentage: Number(e.target.value) })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Savollar soni</label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    max="200"
                                    value={newTest.questions?.length || 30} 
                                    onChange={(e) => {
                                      const newCount = parseInt(e.target.value) || 1;
                                      if (newCount < 1 || newCount > 200) return;
                                      let updatedQs = [...(newTest.questions || [])];
                                      if (newCount > updatedQs.length) {
                                        const toAdd = newCount - updatedQs.length;
                                        const extraQs = Array.from({ length: toAdd }, () => ({
                                          id: generateUUID(),
                                          type: 'multiple',
                                          text: '',
                                          imageUrl: null,
                                          options: ['', '', '', ''],
                                          correctAnswer: 0,
                                          points: 1,
                                          difficulty: 'medium',
                                          explanation: ''
                                        }));
                                        updatedQs = [...updatedQs, ...extraQs];
                                      } else if (newCount < updatedQs.length) {
                                        updatedQs = updatedQs.slice(0, newCount);
                                      }
                                      setNewTest({ ...newTest, questions: updatedQs });
                                    }}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Boshlanish vaqti</label>
                                  <input 
                                    type="date" 
                                    value={newTest.startDate} 
                                    onChange={e => setNewTest({ ...newTest, startDate: e.target.value })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Tugash vaqti</label>
                                  <input 
                                    type="date" 
                                    value={newTest.endDate} 
                                    onChange={e => setNewTest({ ...newTest, endDate: e.target.value })}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500" 
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                              <button onClick={() => setTestBuilderTab('questions')} className="px-6 py-3 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 flex items-center gap-1">Keyingi qadam <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: QUESTIONS BUILDER (30 QUESTIONS INTERACTIVE GRID & FORM) */}
                        {testBuilderTab === 'questions' && (
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                            
                            {/* 30 Questions Navigation Sidebar */}
                            <div className="space-y-4 lg:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-4">
                              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Savollar Listi (1 - 30)</h3>
                              
                              {/* Word (.docx) Import Card */}
                              <div className="p-4 bg-indigo-500/5 dark:bg-slate-900/50 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-indigo-500">description</span>
                                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">MS Word (.docx) Import</span>
                                </div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-normal">
                                  Hujjatdagi to'g'ri javob oldiga <code className="bg-indigo-500/10 text-indigo-500 px-1 py-0.5 rounded font-black">+</code> belgisini qo'ying. Savollar avtomatik shakllantiriladi.
                                </p>
                                <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer active:translate-y-px transition-all text-[10px] font-black shadow-md shadow-indigo-600/10 select-none">
                                  <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                  <span>Faylni yuklash</span>
                                  <input 
                                    type="file" 
                                    accept=".docx" 
                                    onChange={handleDocxImport} 
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
                                {newTest.questions.map((q, idx) => {
                                  const isActive = idx === activeQuestionIndex;
                                  const hasText = (q.text || "").trim().length > 0;
                                  return (
                                    <button 
                                      key={q.id}
                                      onClick={() => setActiveQuestionIndex(idx)}
                                      className={`h-10 w-full flex items-center justify-center font-bold text-xs rounded-lg transition-all ${
                                        isActive 
                                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                                          : hasText 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                      }`}
                                    >
                                      {idx + 1}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-1.5 text-[10px] font-bold text-slate-500">
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Tanlangan</div>
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> To'ldirilgan</div>
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Bo'sh savol</div>
                              </div>
                            </div>

                            {/* Active Question Editor Area */}
                            <div className="lg:col-span-3 space-y-5">
                              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">quiz</span> Savol #{activeQuestionIndex + 1} ni Tahrirlash</h3>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${newTest.questions[activeQuestionIndex].text.trim().length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>{newTest.questions[activeQuestionIndex].text.trim().length > 0 ? 'Tayyor' : 'Matn yo\'q'}</span>
                              </div>

                              {/* Question Settings Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Savol Turi</label>
                                  <select 
                                    value={newTest.questions[activeQuestionIndex].type}
                                    onChange={e => {
                                      const updated = [...newTest.questions];
                                      updated[activeQuestionIndex] = {
                                        ...updated[activeQuestionIndex],
                                        type: e.target.value,
                                        correctAnswer: e.target.value === 'multiple' ? [0] : (e.target.value === 'truefalse' ? true : 0)
                                      };
                                      setNewTest({ ...newTest, questions: updated });
                                    }}
                                    className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                  >
                                    <option value="single">Yagona variant (MCQ)</option>
                                    <option value="multiple">Ko'p variantli (MCQ)</option>
                                    <option value="truefalse">Rost / Yolg'on</option>
                                    <option value="short">Qisqa matn javob</option>
                                    <option value="math">Matematik formula yechimi</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Ajratiladigan ball</label>
                                  <input 
                                    type="number"
                                    value={newTest.questions[activeQuestionIndex].score}
                                    onChange={e => {
                                      const updated = [...newTest.questions];
                                      updated[activeQuestionIndex] = { ...updated[activeQuestionIndex], score: Number(e.target.value) };
                                      setNewTest({ ...newTest, questions: updated });
                                    }}
                                    className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Savol qiyinchiligi</label>
                                  <select 
                                    value={newTest.questions[activeQuestionIndex].difficulty || 'Medium'}
                                    onChange={e => {
                                      const updated = [...newTest.questions];
                                      updated[activeQuestionIndex] = { ...updated[activeQuestionIndex], difficulty: e.target.value };
                                      setNewTest({ ...newTest, questions: updated });
                                    }}
                                    className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                  >
                                    <option value="Easy">Oson (Easy)</option>
                                    <option value="Medium">O'rtacha (Medium)</option>
                                    <option value="Hard">Qiyin (Hard)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Question Rich Text & Math Equations Formatting Toolbar */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Savol matni va formula muharriri</span>
                                
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-xl flex flex-wrap gap-1.5 items-center">
                                  {/* Rich Text controls */}
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('bold')} title="Qalin" className="w-8 h-8 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">B</button>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('italic')} title="Kursiv" className="w-8 h-8 italic font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">I</button>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('underline')} title="Ostiga chizilgan" className="w-8 h-8 underline hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">U</button>
                                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('bullet')} title="Belgili ro'yxat" className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"><span className="material-symbols-outlined text-[16px]">format_list_bulleted</span></button>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('number')} title="Raqamli ro'yxat" className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"><span className="material-symbols-outlined text-[16px]">format_list_numbered</span></button>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('table')} title="Jadval" className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"><span className="material-symbols-outlined text-[16px]">table</span></button>
                                  <button type="button" onClick={() => handleQuestionTextToolbarClick('link')} title="Havola" className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"><span className="material-symbols-outlined text-[16px]">link</span></button>
                                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                  
                                  {/* Special LaTeX quick formulas */}
                                  <button type="button" onClick={() => handleMathSymbolClick('\\frac{a}{b}')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Kasr formulasi">a/b</button>
                                  <button type="button" onClick={() => handleMathSymbolClick('\\int_{a}^{b}')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Integral">∫</button>
                                  <button type="button" onClick={() => handleMathSymbolClick('\\frac{d}{dx}')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Hosila">d/dx</button>
                                  <button type="button" onClick={() => handleMathSymbolClick('\\sum')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Yig'indi (Sigma)">∑</button>
                                  <button type="button" onClick={() => handleMathSymbolClick('\\sqrt{x}')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Kvadrat Ildiz">√x</button>
                                  <button type="button" onClick={() => handleMathSymbolClick('x^2')} className="px-2 h-8 text-[11px] font-bold bg-indigo-500/10 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white transition-colors" title="Daraja">x²</button>
                                </div>

                                <textarea 
                                  value={newTest.questions[activeQuestionIndex].text}
                                  onChange={e => {
                                    const updated = [...newTest.questions];
                                    updated[activeQuestionIndex] = { ...updated[activeQuestionIndex], text: e.target.value };
                                    setNewTest({ ...newTest, questions: updated });
                                  }}
                                  placeholder="Savol matnini bu yerga yozing... (Formulalarni $ belgisi ichiga yozing: $\frac{a}{b}$, $\sqrt{x}$, $x^2$)"
                                  rows={5}
                                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                />

                                {/* Live Formula Preview Box */}
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Formula va savolning jonli ko'rinishi (Live Rendered LaTeX Preview)</span>
                                  {renderMathPreview(newTest.questions[activeQuestionIndex].text)}
                                </div>
                              </div>

                              {/* Question Image Upload (Dropzone & simulated action) */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Geometriya chizmasi yoki Matematik diagramma yuklash</span>
                                
                                {newTest.questions[activeQuestionIndex].imageUrl ? (
                                  <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                      <img src={getAuthMediaUrl(newTest.questions[activeQuestionIndex].imageUrl)} className="w-20 h-14 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm" alt="Diagramma" />
                                      <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">{newTest.questions[activeQuestionIndex].imageUrl.split('/').pop() || 'diagramma.png'}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">Chizma olchamlari: 100% moslashuvchan</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button type="button" onClick={() => alert("Diagramma qirqildi (Crop success)!")} className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg text-[10px] hover:bg-indigo-500 hover:text-white transition-colors">Qirqish (Crop)</button>
                                      <button type="button" onClick={() => alert("Diagramma olchami ozgartirildi (Resize success)!")} className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg text-[10px] hover:bg-indigo-500 hover:text-white transition-colors">O'lcham (Resize)</button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const updated = [...newTest.questions];
                                          updated[activeQuestionIndex].imageUrl = '';
                                          setNewTest({ ...newTest, questions: updated });
                                        }} 
                                        className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={handleQuestionImageUpload}
                                    className="p-6 bg-white/30 dark:bg-slate-900/30 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
                                  >
                                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">upload_file</span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">Rasm yuklash / Sudrab tashlash</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Geometrik shakllar, funksiya grafiklari yoki diagrammalar (JPG, PNG)</p>
                                  </div>
                                )}
                              </div>

                              {/* MCQ Options Configuration */}
                              {(newTest.questions[activeQuestionIndex].type === 'single' || newTest.questions[activeQuestionIndex].type === 'multiple') && (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Javob variantlari va to'g'ri javobni belgilash</span>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updated = [...newTest.questions];
                                        updated[activeQuestionIndex].options.push(`Yangi variant ${String.fromCharCode(65 + updated[activeQuestionIndex].options.length)}`);
                                        setNewTest({ ...newTest, questions: updated });
                                      }}
                                      className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg text-[10px] hover:bg-indigo-500 hover:text-white flex items-center gap-0.5"
                                    >
                                      <span className="material-symbols-outlined text-xs">add</span> Variant Qo'shish
                                    </button>
                                  </div>

                                  <div className="space-y-3">
                                    {newTest.questions[activeQuestionIndex].options.map((opt, optIdx) => {
                                      const isCorrect = newTest.questions[activeQuestionIndex].type === 'multiple' 
                                        ? (newTest.questions[activeQuestionIndex].correctAnswer || []).includes(optIdx)
                                        : newTest.questions[activeQuestionIndex].correctAnswer === optIdx;
                                      
                                      return (
                                        <div key={optIdx} className="flex items-center gap-3 animate-fade-in">
                                          {/* Mark Correct Radio/Checkbox Button */}
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              const updated = [...newTest.questions];
                                              if (newTest.questions[activeQuestionIndex].type === 'multiple') {
                                                let arr = [...(updated[activeQuestionIndex].correctAnswer || [])];
                                                if (arr.includes(optIdx)) arr = arr.filter(v => v !== optIdx);
                                                else arr.push(optIdx);
                                                updated[activeQuestionIndex].correctAnswer = arr;
                                              } else {
                                                updated[activeQuestionIndex].correctAnswer = optIdx;
                                              }
                                              setNewTest({ ...newTest, questions: updated });
                                            }}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent'}`}
                                            title="To'g'ri javob deb belgilash"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                          </button>

                                          {/* Drag and Reorder Up/Down */}
                                          <div className="flex flex-col gap-0.5">
                                            <button 
                                              type="button"
                                              disabled={optIdx === 0}
                                              onClick={() => {
                                                const updated = [...newTest.questions];
                                                const arr = [...updated[activeQuestionIndex].options];
                                                const temp = arr[optIdx];
                                                arr[optIdx] = arr[optIdx - 1];
                                                arr[optIdx - 1] = temp;
                                                updated[activeQuestionIndex].options = arr;
                                                setNewTest({ ...newTest, questions: updated });
                                              }}
                                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-900 rounded disabled:opacity-30"
                                            >
                                              <span className="material-symbols-outlined text-xs">keyboard_arrow_up</span>
                                            </button>
                                            <button 
                                              type="button"
                                              disabled={optIdx === newTest.questions[activeQuestionIndex].options.length - 1}
                                              onClick={() => {
                                                const updated = [...newTest.questions];
                                                const arr = [...updated[activeQuestionIndex].options];
                                                const temp = arr[optIdx];
                                                arr[optIdx] = arr[optIdx + 1];
                                                arr[optIdx + 1] = temp;
                                                updated[activeQuestionIndex].options = arr;
                                                setNewTest({ ...newTest, questions: updated });
                                              }}
                                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-900 rounded disabled:opacity-30"
                                            >
                                              <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                                            </button>
                                          </div>

                                          <div className="flex-1 flex flex-col gap-1.5">
                                            <input 
                                              value={opt}
                                              onChange={e => {
                                                const updated = [...newTest.questions];
                                                updated[activeQuestionIndex].options[optIdx] = e.target.value;
                                                setNewTest({ ...newTest, questions: updated });
                                              }}
                                              placeholder={`Variant matni yoki LaTeX formulasi, masalan: \\frac{1}{2} yoki x^2`}
                                              className="w-full p-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                            />
                                            {opt && (opt.includes('\\') || opt.includes('^') || opt.includes('_')) && (
                                              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1 flex items-center gap-1.5 animate-fade-in">
                                                <span className="material-symbols-outlined text-[12px] text-indigo-500">functions</span>
                                                <span>Formula ko'rinishi:</span>
                                                <span className="bg-indigo-500/5 dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/10 dark:border-slate-800 text-slate-700 dark:text-indigo-400">
                                                  {renderMathInline(opt)}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          <button 
                                            type="button"
                                            onClick={() => {
                                              const updated = [...newTest.questions];
                                              updated[activeQuestionIndex].options = updated[activeQuestionIndex].options.filter((_, idx) => idx !== optIdx);
                                              setNewTest({ ...newTest, questions: updated });
                                            }}
                                            className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                                            title="Variantni o'chirish"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* True/False Configuration */}
                              {newTest.questions[activeQuestionIndex].type === 'truefalse' && (
                                <div className="space-y-3">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Rost yoki Yolg'on holatidagi javob</span>
                                  <div className="grid grid-cols-2 gap-4">
                                    {['Rost', 'Yolg\'on'].map((tf, tfIdx) => {
                                      const isCorrect = newTest.questions[activeQuestionIndex].correctAnswer === (tfIdx === 0);
                                      return (
                                        <button
                                          key={tfIdx}
                                          type="button"
                                          onClick={() => {
                                            const updated = [...newTest.questions];
                                            updated[activeQuestionIndex].correctAnswer = tfIdx === 0;
                                            setNewTest({ ...newTest, questions: updated });
                                          }}
                                          className={`py-4 font-black rounded-xl border text-sm transition-all flex items-center justify-center gap-2 ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'}`}
                                        >
                                          <span className="material-symbols-outlined text-[16px]">{isCorrect?'check_circle':'circle'}</span>
                                          {tf}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Short / Math text answer configuration */}
                              {(newTest.questions[activeQuestionIndex].type === 'short' || newTest.questions[activeQuestionIndex].type === 'math') && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase block">To'g'ri javob matni / qiymati (Student kiritishi shart)</span>
                                  <input 
                                    value={newTest.questions[activeQuestionIndex].correctAnswer || ""}
                                    onChange={e => {
                                      const updated = [...newTest.questions];
                                      updated[activeQuestionIndex].correctAnswer = e.target.value;
                                      setNewTest({ ...newTest, questions: updated });
                                    }}
                                    placeholder={newTest.questions[activeQuestionIndex].type === 'math' ? "Tenglama javobi, masalan: x=7 yoki 4" : "Kutilayotgan javob matni..."}
                                    className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                  />
                                </div>
                              )}

                              {/* Question Explanation, Hint, and Settings */}
                              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Javob tushuntirishi (Explanation)</label>
                                    <textarea 
                                      value={newTest.questions[activeQuestionIndex].explanation || ""}
                                      onChange={e => {
                                        const updated = [...newTest.questions];
                                        updated[activeQuestionIndex].explanation = e.target.value;
                                        setNewTest({ ...newTest, questions: updated });
                                      }}
                                      placeholder="Talaba testni topshirib bo'lgach ko'rinadigan qadam-baqadam yechim izohi..."
                                      rows={3}
                                      className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Kichik yordam (Optional Hint)</label>
                                    <textarea 
                                      value={newTest.questions[activeQuestionIndex].hint || ""}
                                      onChange={e => {
                                        const updated = [...newTest.questions];
                                        updated[activeQuestionIndex].hint = e.target.value;
                                        setNewTest({ ...newTest, questions: updated });
                                      }}
                                      placeholder="Talabaga dars jarayonida ko'rsatiladigan kichik maslahat..."
                                      rows={3}
                                      className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-300">
                                    <input 
                                      type="checkbox" 
                                      checked={newTest.questions[activeQuestionIndex].negativeMarking || false}
                                      onChange={e => {
                                        const updated = [...newTest.questions];
                                        updated[activeQuestionIndex].negativeMarking = e.target.checked;
                                        setNewTest({ ...newTest, questions: updated });
                                      }}
                                      className="w-4 h-4 text-indigo-500 border-slate-300 dark:border-slate-700 rounded" 
                                    />
                                    <span>Salbiy ball tizimi (Negative marking)</span>
                                  </label>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button 
                                  disabled={activeQuestionIndex === 0}
                                  onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl disabled:opacity-30 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">arrow_back</span> Oldingi savol
                                </button>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      if (newTest.questions.length > 1) {
                                        const updated = [...newTest.questions];
                                        updated.splice(activeQuestionIndex, 1);
                                        setNewTest({ ...newTest, questions: updated });
                                        if (activeQuestionIndex >= updated.length) {
                                          setActiveQuestionIndex(updated.length - 1);
                                        }
                                      }
                                    }}
                                    disabled={newTest.questions.length <= 1}
                                    className="px-4 py-2 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-30"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span> O'chirish
                                  </button>
                                  {activeQuestionIndex === newTest.questions.length - 1 ? (
                                    <button 
                                      onClick={() => {
                                        const updated = [...newTest.questions];
                                        updated.push({
                                          id: updated.length + 1,
                                          type: 'single',
                                          text: '',
                                          options: ['A-javob', 'B-javob', 'C-javob', 'D-javob'],
                                          correctAnswer: 0,
                                          score: 4,
                                          difficulty: 'Medium',
                                          explanation: '',
                                          hint: '',
                                          negativeMarking: false,
                                          imageUrl: ''
                                        });
                                        setNewTest({ ...newTest, questions: updated });
                                        setActiveQuestionIndex(activeQuestionIndex + 1);
                                      }}
                                      className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors flex items-center gap-1"
                                    >
                                      Savol Qo'shish <span className="material-symbols-outlined text-[16px]">add</span>
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                                      className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors flex items-center gap-1"
                                    >
                                      Keyingi savol <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: ADVANCED PREVENTIVE AND CHEAT-PROOF TEST SETTINGS */}
                        {testBuilderTab === 'advanced' && (
                          <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              <div className="modern-card p-6 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">lock</span> Firibgarlikka Qarshi Himoya (Cheat-proof)</h3>
                                
                                <div className="space-y-3">
                                  {[
                                    { stateName: 'fullscreenMode', label: "To'liq ekran rejasi (Fullscreen taking)", desc: "Student testni to'liq ekranda yechadi, chiqishga ruxsat yo'q" },
                                    { stateName: 'preventCopyPaste', label: "Nusxa ko'chirishni taqiqlash (Prevent copy/paste)", desc: "Savollar matnini nusxalash va javoblarni tashqi manbadan kiritish bloklanadi" },
                                    { stateName: 'preventTabSwitch', label: "Tab almashtirishni cheklash (Prevent tab switching)", desc: "Brauzerda boshqa sahifaga o'tsa test avtomatik ravishda yakunlanadi" }
                                  ].map(item => (
                                    <label key={item.stateName} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer">
                                      <input 
                                        type="checkbox"
                                        checked={newTest[item.stateName]}
                                        onChange={e => setNewTest({ ...newTest, [item.stateName]: e.target.checked })}
                                        className="w-4 h-4 text-indigo-500 rounded border-slate-300 mt-0.5" 
                                      />
                                      <div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white block">{item.label}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{item.desc}</span>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="modern-card p-6 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">construction</span> Tizim Imkoniyatlari (Features)</h3>
                                
                                <div className="space-y-3">
                                  {[
                                    { stateName: 'randomizeQuestions', label: "Savollarni tasodifiy tartiblash (Shuffle questions)", desc: "Har bir student uchun savollar har xil ketma-ketlikda chiqadi" },
                                    { stateName: 'randomizeAnswers', label: "Javoblarni tasodifiy tartiblash (Shuffle answers)", desc: "MCQ variantlari har bir o'quvchida aralashtiriladi" },
                                    { stateName: 'enableCalculator', label: "Kalkulyatorni yoqish (Calculator sheet)", desc: "Student pleyerida interaktiv hisob-kitob kalkulyatori ko'rinadi" },
                                    { stateName: 'enableFormulaSheet', label: "Matematik formulalar varog'ini taqdim etish", desc: "Test jarayonida tayyor SAT formulalar varag'ini ochish imkoniyati" }
                                  ].map(item => (
                                    <label key={item.stateName} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer">
                                      <input 
                                        type="checkbox"
                                        checked={newTest[item.stateName]}
                                        onChange={e => setNewTest({ ...newTest, [item.stateName]: e.target.checked })}
                                        className="w-4 h-4 text-indigo-500 rounded border-slate-300 mt-0.5" 
                                      />
                                      <div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white block">{item.label}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{item.desc}</span>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Urinishlar soni (Attempt limit)</label>
                                <select 
                                  value={newTest.attemptLimit}
                                  onChange={e => setNewTest({ ...newTest, attemptLimit: Number(e.target.value) })}
                                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                >
                                  <option value={1}>1 ta urinish (Qattiq nazorat)</option>
                                  <option value={2}>2 ta urinish</option>
                                  <option value={3}>3 ta urinish</option>
                                  <option value={999}>Cheksiz urinishlar</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Natijalarni darhol ko'rsatish (Instant result)</label>
                                <select 
                                  value={newTest.instantResult ? "true" : "false"}
                                  onChange={e => setNewTest({ ...newTest, instantResult: e.target.value === 'true' })}
                                  className="w-full p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 outline-none"
                                >
                                  <option value="true">Darhol natija va yechim izohlarini ko'rsatish</option>
                                  <option value="false">Faqat test muddati yakunlangach ko'rsatish</option>
                                </select>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                              <button 
                                onClick={() => handleCreateTestSubmit('Draft')} 
                                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                Qoralama saqlash
                              </button>
                              <button 
                                onClick={() => handleCreateTestSubmit('Published')} 
                                className="px-6 py-3 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-colors"
                              >
                                Testni nashr qilish
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      )
                    )}
                  </div>
                )}
              </div>
              {currentPage === 'landing' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Landing Sahifa Boshqaruvi</h2>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Asosiy sahifadagi ma'lumotlar va sertifikatlarni o'zgartirish.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings Section */}
                    <div className="modern-card p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">settings</span> Asosiy Sozlamalar</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Hero Sarlavha</label>
                          <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={landingSettings.heroTitle} onChange={(e) => setLandingSettings({...landingSettings, heroTitle: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Hero Qisqa Matn</label>
                          <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={landingSettings.heroSubtitle} onChange={(e) => setLandingSettings({...landingSettings, heroSubtitle: e.target.value})} rows="3"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Telefon</label>
                            <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={landingSettings.contactPhone} onChange={(e) => setLandingSettings({...landingSettings, contactPhone: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Manzil</label>
                            <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={landingSettings.contactAddress} onChange={(e) => setLandingSettings({...landingSettings, contactAddress: e.target.value})} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Telegram Link</label>
                          <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={landingSettings.telegramLink} onChange={(e) => setLandingSettings({...landingSettings, telegramLink: e.target.value})} />
                        </div>
                        <button onClick={handleUpdateLandingSettings} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all">Saqlash</button>
                      </div>
                    </div>

                    {/* Results / Certificates */}
                    <div className="modern-card p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500">military_tech</span> Natijalar / Sertifikatlar</h3>
                      
                      <div className="flex flex-col gap-3 mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                          <input placeholder="Ism (Masalan: Azizbek)" className="flex-1 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 outline-none text-sm font-bold p-3 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all" value={newLandingResult.name} onChange={e=>setNewLandingResult({...newLandingResult, name: e.target.value})} />
                          <input placeholder="Natija/Ball (Masalan: SAT 1520)" className="flex-1 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 outline-none text-sm font-bold p-3 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all" value={newLandingResult.score} onChange={e=>setNewLandingResult({...newLandingResult, score: e.target.value})} />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center w-full">
                          <label className="flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-all flex-1 min-w-[150px]">
                            <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-300">upload_file</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sertifikat yuklash</span>
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              if(e.target.files[0]) {
                                try {
                                  const url = await handleLandingImageUpload(e.target.files[0]);
                                  setNewLandingResult({...newLandingResult, imageUrl: url});
                                } catch(err) { alert("Rasm yuklashda xatolik!"); }
                              }
                            }} />
                          </label>
                          <select className="bg-white dark:bg-slate-700/50 outline-none text-sm border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white flex-1 min-w-[120px] focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer" value={newLandingResult.imagePosition} onChange={e=>setNewLandingResult({...newLandingResult, imagePosition: e.target.value})}>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="object-center">Markaz (Center)</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="object-top">Teparoq (Top)</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="object-bottom">Pastroq (Bottom)</option>
                          </select>
                          <select className="bg-white dark:bg-slate-700/50 outline-none text-sm border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white flex-1 min-w-[120px] focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer" value={newLandingResult.color} onChange={e=>setNewLandingResult({...newLandingResult, color: e.target.value})}>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="text-primary">Kok</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="text-secondary">Yashil</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="text-tertiary">Qizgish</option>
                          </select>
                          <button onClick={handleAddLandingResult} className="bg-indigo-500 text-white w-full sm:w-auto px-6 py-2.5 rounded-lg hover:bg-indigo-600 text-sm font-bold shrink-0 shadow-lg shadow-indigo-500/30 transition-all">Qo'shish</button>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1">💡 <b>Tavsiya (Maksimal 10 tagacha):</b> Eng yaxshi natija uchun rasm vertikal (bo'yiga uzun) bo'lishi kerak (Masalan: 400x500 px yoki 600x800 px).</p>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {landingResults.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              {r.imageUrl ? (
                                <img src={r.imageUrl} className={`w-10 h-10 rounded-full object-cover ${r.imagePosition}`} alt="" />
                              ) : (
                                <span className={`material-symbols-outlined ${r.color}`}>workspace_premium</span>
                              )}
                              <div>
                                <p className="text-sm font-bold">{r.name}</p>
                                <p className="text-[11px] font-bold text-slate-500">{r.score}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteLandingResult(r.id)} className="text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Save Button for Results */}
                      <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                        <button 
                          onClick={handleSaveAllResults} 
                          className="bg-emerald-500 text-white w-full py-2.5 rounded-lg hover:bg-emerald-600 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">save</span> 
                          Ma'lumotlarni saqlash va Integratsiya qilish
                        </button>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="modern-card p-6 lg:col-span-2">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-amber-500">payments</span> Tariflar / Kurslar</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="space-y-3">
                          <input placeholder="Kurs nomi (Masalan: SAT Matematika)" className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 outline-none text-sm font-bold p-3 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all" value={newLandingPricing.title} onChange={e=>setNewLandingPricing({...newLandingPricing, title: e.target.value})} />
                          <textarea placeholder="Kurs ta'rifi" className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 outline-none text-sm p-3 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" rows="2" value={newLandingPricing.description} onChange={e=>setNewLandingPricing({...newLandingPricing, description: e.target.value})}></textarea>
                        </div>
                        <div className="space-y-3">
                          <input placeholder="Narxi (Masalan: 600,000)" className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 outline-none text-sm font-bold p-3 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all" value={newLandingPricing.price} onChange={e=>setNewLandingPricing({...newLandingPricing, price: e.target.value})} />
                          <div className="flex gap-2">
                            <select className="bg-white dark:bg-slate-700/50 outline-none text-sm border border-slate-200 dark:border-slate-600 p-3 rounded-lg flex-1 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer" value={newLandingPricing.type} onChange={e=>setNewLandingPricing({...newLandingPricing, type: e.target.value})}>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="primary">Asosiy (Primary)</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="secondary">Ikkilamchi (Secondary)</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="tertiary">Qo'shimcha (Tertiary)</option>
                            </select>
                            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600 p-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-all">
                              <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-300">image</span>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Muqova rasmi</span>
                              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                if(e.target.files[0]) {
                                  try {
                                    const url = await handleLandingImageUpload(e.target.files[0]);
                                    setNewLandingPricing({...newLandingPricing, imageUrl: url});
                                  } catch(err) { alert("Rasm yuklashda xatolik!"); }
                                }
                              }} />
                            </label>
                          </div>
                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 mb-2">💡 <b>Tavsiya:</b> Kurs muqovasi uchun yotiq (landshaft) rasm yuklang (Masalan: 800x450 px).</p>
                          <button onClick={handleAddLandingPricing} className="bg-indigo-500 text-white w-full py-2 rounded-lg hover:bg-indigo-600 text-sm font-bold">Tarif Qo'shish</button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {landingPricing.map((p, index) => (
                          <div key={p.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <button onClick={() => handleMovePricing(index, -1)} disabled={index===0} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">expand_less</span></button>
                                <button onClick={() => handleMovePricing(index, 1)} disabled={index===landingPricing.length-1} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">expand_more</span></button>
                              </div>
                              {p.imageUrl && <img src={p.imageUrl} className="w-16 h-12 object-cover rounded-lg" alt="" />}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{p.title} <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 ml-2">{p.price} so'm</span></p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg truncate">{p.description}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteLandingPricing(p.id)} className="text-rose-500 hover:bg-rose-500/10 w-10 h-10 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">delete</span></button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </main>
          </div>

          {/* Add Student Modal */}
          {showAddStudentModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="modern-card w-full max-w-md p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Yangi Talaba Qo'shish</h3>
                  <button onClick={() => setShowAddStudentModal(false)} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">F.I.SH. (Full Name)</label>
                    <input required value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})} placeholder="Ism Familiya" className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email manzili</label>
                    <input type="email" required value={newStudent.email} onChange={e=>setNewStudent({...newStudent, email:e.target.value})} placeholder="Email" className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Yo'nalish (Kurs)</label>
                    <select 
                      required
                      value={newStudent.course} 
                      onChange={e => setNewStudent({...newStudent, course: e.target.value})}
                      className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="" disabled hidden>Kursni tanlang...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Muddat (Deadline)</label>
                    <input type="date" required value={newStudent.deadline || ''} onChange={e=>setNewStudent({...newStudent, deadline:e.target.value})} className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <button 
                    type="submit"
                    className={`w-full p-4 text-white font-black rounded-xl shadow-lg transition-all ${
                      (newStudent.name && newStudent.email && newStudent.course && newStudent.deadline) 
                        ? 'bg-indigo-500 shadow-indigo-500/30 hover:opacity-90' 
                        : 'bg-indigo-500/50 cursor-not-allowed'
                    }`}
                  >
                    Saqlash
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Assign Course Modal */}
          {showAssignCourseModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" style={{ zIndex: 9999 }}>
              <div className="modern-card w-full max-w-md p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Yangi Kursga Ruxsat Berish</h3>
                  <button onClick={() => setShowAssignCourseModal(false)} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleAssignCourseSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Talaba (Email)</label>
                    <input disabled value={assignCourseData.email} className="w-full p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Yo'nalish (Yangi Kurs)</label>
                    <select 
                      required
                      value={assignCourseData.course} 
                      onChange={e => setAssignCourseData({...assignCourseData, course: e.target.value})}
                      className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="" disabled hidden>Yangi kursni tanlang...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Muddat (Yangi Deadline)</label>
                    <input type="date" required value={assignCourseData.deadline || ''} onChange={e=>setAssignCourseData({...assignCourseData, deadline:e.target.value})} className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-indigo-500 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <button 
                    type="submit"
                    className={`w-full p-4 text-white font-black rounded-xl shadow-lg transition-all ${
                      (assignCourseData.course && assignCourseData.deadline) 
                        ? 'bg-indigo-500 shadow-indigo-500/30 hover:opacity-90' 
                        : 'bg-indigo-500/50 cursor-not-allowed'
                    }`}
                  >
                    Ruxsat Berish
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Student Credentials Modal (Generated Password Simulation) */}
          {createdStudentCredentials && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" style={{ zIndex: 9999 }}>
              <div className="modern-card w-full max-w-md p-8 space-y-6 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] bg-slate-900/90 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 animate-pulse"></div>
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20">
                  <span className="material-symbols-outlined text-[36px]">mail</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">Xat yuborildi (Simulyatsiya)</h3>
                  <p className="text-xs text-slate-400 font-medium">Yangi o'quvchi ro'yxatdan o'tdi va unga kirish ma'lumotlari elektron pochtasiga jo'natildi.</p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-left space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Foydalanuvchi ismi</span>
                    <span className="text-sm font-bold text-slate-300">{createdStudentCredentials.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email (Login)</span>
                    <span className="text-sm font-bold text-white select-all">{createdStudentCredentials.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Generatsiya qilingan parol</span>
                    <div className="flex items-center justify-between mt-1 bg-white/5 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800">
                      <span className="text-sm font-mono font-black text-emerald-400 tracking-wider select-all">{createdStudentCredentials.password}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(createdStudentCredentials.password);
                          alert("Parol nusxalandi!");
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span> Nusxa
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setCreatedStudentCredentials(null)} 
                  className="w-full py-4 bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-colors"
                >
                  Tushunarli
                </button>
              </div>
            </div>
          )}


          {/* Delete Course Confirmation Modal */}
          {deleteCourseTarget && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-rose-500 p-6 flex justify-between items-center">
                  <h3 className="text-xl font-black text-white flex items-center gap-2"><span className="material-symbols-outlined text-[24px]">warning</span> Diqqat! O'chirish</h3>
                  <button onClick={() => { setDeleteCourseTarget(null); setDeleteCourseInput(''); }} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"><span className="material-symbols-outlined text-[18px]">close</span></button>
                </div>
                <div className="p-6 space-y-4 text-slate-900 dark:text-white">
                  <p className="text-sm">Mazkur kursni kurs nomini yozib o'chirishni xohlaysizmi? <br/>Haqiqatdan ham <strong>{deleteCourseTarget.title}</strong> kursini o'chirishni xohlaysizmi?</p>
                  <p className="text-sm font-bold text-rose-500">Tasdiqlash uchun quyidagi yozuvni kiriting: <br/>"{deleteCourseTarget.title}"</p>
                  <input
                    type="text"
                    value={deleteCourseInput}
                    onChange={(e) => setDeleteCourseInput(e.target.value)}
                    placeholder="Kurs nomini kiriting..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => { setDeleteCourseTarget(null); setDeleteCourseInput(''); }} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">Yo'q</button>
                    <button 
                      onClick={() => handleDeleteCourse(deleteCourseTarget.id)} 
                      disabled={deleteCourseInput !== deleteCourseTarget.title}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all ${deleteCourseInput === deleteCourseTarget.title ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 cursor-pointer' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
                    >Ha</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;
