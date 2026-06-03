import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Sample LMS Course Data
const coursesData = [
  {
    id: 'sat-math',
    title: 'SAT Mathematics Intensive',
    category: 'Algebra & Geometry',
    progress: 45,
    tag: 'Easy',
    instructor: 'Malika Opa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFhDPXAwP0-mCX5QF4Xx32QGmVTXoWaoau_L1f4gtxR0hE7rk1oU9B_Fz2QxfH5FBrzQnxddkzhl0CrwDzjfvCbD3kONRVOm0pJy8dFxuo22kpQSx32tVABkwGoNHo3Hn-S-zOmWyZ56C-8dJHTh3-WcwGedY8Q-78FDeCR6wbhAJCLIBQLy7Av9vqtAP6kpJGr7J3QoEKUW-UyehI37G-umxGt6pdMeUBw0-NN8v7oSwp5i3qBP755XtXl4t3Xf3uLpj8MX2pbDy8',
    description: 'Intensive preparation covering all key concepts required for the quantitative section.',
    lessons: [
      { id: 1, title: '1. Kirish va Kurs Rejasi', duration: '15:20', completed: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 2, title: '2. Algebra Asoslari & Tenglamalar', duration: '45:00', completed: false, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 3, title: '3. Chiziqli Tenglamalar Tizimi', duration: '38:15', completed: false, locked: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 4, title: '4. Kvadrat Tenglamalar va Grafiklar', duration: '42:10', completed: false, locked: false, videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ]
  },
  {
    id: 'alevel-math',
    title: 'A-Level Pure Math & Mechanics',
    category: 'Calculus',
    progress: 72,
    tag: 'Advanced',
    instructor: 'Malika Opa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV6_oqyLO4rOubcLIKHvaKFC77Ha8G7HozH9fVLWcvmFF3setBuSi7cI7qWoXDyRh68dZFqZwUxB3gg_-cFCvEa0TiF28wtZHVttSHjC-bqBtqaPY-FpEUQH-g9Ys3jdk_RtgxD8V4Y1zgqF2jho1wpQrI7B_Jmi57pNGlDmi6r3KGYaK31Wv0vxdkBBm3A4Y_NmOAk6Ud-ooqRndMt3z8hRcHQc9WylUU8nUzj9UhqlXeJfI2H8My9_Hc0q1w9SWqGUh68ye6UQO6',
    description: 'Deep dive into differentiation, integration, and advanced trigonometric identities.',
    lessons: [
      { id: 1, title: '1. Kirish va Limitlar', duration: '20:10', completed: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 2, title: '2. Hosila olish qoidalari', duration: '50:40', completed: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 3, title: '3. Integrallash Asoslari', duration: '48:00', completed: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 4, title: '4. Murakkab Integrallar', duration: '55:30', completed: false, locked: false, videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ]
  },
  {
    id: 'foundation-stats',
    title: 'Mathematics Foundation',
    category: 'Data & Stats',
    progress: 15,
    tag: 'Medium',
    instructor: 'Malika Opa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0p7L3CK_EkYJ6_XeukUeLogbqG1eqk7UsvsMuri6f9WXUk6ReItHMeaNS4pt5kH2endtqmCpV9gpNbp4KbKTnXGXRGrK9LkgjUj9A-lBilCv2BYdM3POHkj-e8su1UKFAtOK9wMVeab66I0ilOf48C0bLAhFSZ-NlGri7Y2j4DYdatcutw5cB42P1n3lICmzeA6laDUIbVF4m0eESCfbGn7nuHFFzjeeNQeMixqYWm1GiuS2lku3tcfF5_E94cOPMPPjrn9vsU0BM',
    description: 'Master probability distributions, hypothesis testing, and data interpretation.',
    lessons: [
      { id: 1, title: '1. Ehtimollar nazariyasi', duration: '22:15', completed: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 2, title: '2. Tasodifiy miqdorlar', duration: '30:45', completed: false, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      { id: 3, title: '3. Gipotenzalarni tekshirish', duration: '40:00', completed: false, locked: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ]
  }
];

// Rich Premium mock tests (30 SAT Math Questions with robust explanations and custom LaTeX markup)
const studentTests = [
  {
    id: 'sat-diagnostic',
    title: 'SAT Quantitative Diagnostik Testi',
    category: 'SAT Quantitative',
    duration: 60, // in minutes
    totalQuestions: 30,
    passingScore: 70, // percentage
    difficulty: 'Medium',
    description: 'SAT Math bo\'limi uchun to\'liq 30 ta savoldan iborat premium diagnostika imtihoni. Algebra, Geometriya, Trigonometriya, Statistika va funksiyalar sohasini mukammal qamrab oladi.',
    questions: [
      {
        id: 1,
        topic: 'Algebra',
        difficulty: 'Easy',
        question: 'Solve for x in the equation: 3x - 7 = 14',
        options: ['x = 5', 'x = 7', 'x = 9', 'x = 6'],
        correct: 1,
        explanation: 'Berilgan tenglamani bosqichma-bosqich yechamiz:\n3x - 7 = 14\n3x = 14 + 7\n3x = 21\nx = \\frac{21}{3} = 7.\nTo\'g\'ri javob: B (x = 7).'
      },
      {
        id: 'q2',
        topic: 'Geometry',
        difficulty: 'Medium',
        question: 'Find the area of a circle with a radius of r = 7 cm. (Take \\pi \\approx \\frac{22}{7})',
        options: ['154 cm^2', '44 cm^2', '77 cm^2', '616 cm^2'],
        correct: 0,
        explanation: 'Doira yuzini hisoblash formulasi: A = \\pi r^2.\nBerilgan qiymatlarni qo\'yamiz:\nA = \\frac{22}{7} \\cdot 7^2 = \\frac{22}{7} \\cdot 49 = 22 \\cdot 7 = 154 \\text{ cm}^2.\nTo\'g\'ri javob: A (154 cm^2).'
      },
      {
        id: 3,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Evaluate the definite integral: \\int_{0}^{1} x e^{x} dx',
        options: ['1', 'e - 1', 'e - 2', 'e'],
        correct: 0,
        explanation: 'Ushbu integralni bo\'laklab integrallash usuli bilan yechamiz: \\int u dv = uv - \\int v du.\nBelgilash kiritamiz: u = x \\Rightarrow du = dx\ndv = e^x dx \\Rightarrow v = e^x\nU holda integral: [x e^x]_{0}^{1} - \\int_{0}^{1} e^x dx = [x e^x - e^x]_{0}^{1}.\nChegaralarni hisoblaymiz:\nx = 1 da: (1 \\cdot e^1 - e^1) = 0\nx = 0 da: (0 \\cdot e^0 - e^0) = -1\nNatija: 0 - (-1) = 1.\nTo\'g\'ri javob: A (1).'
      },
      {
        id: 4,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Find the derivative of the function: f(x) = \\ln(x^2 + 1)',
        options: ['\\frac{2x}{x^2+1}', '\\frac{1}{x^2+1}', '\\frac{x}{x^2+1}', '\\frac{2}{x^2+1}'],
        correct: 0,
        explanation: 'Murakkab funksiyani hosila olish qoidasiga binoan: [\\ln(u)]\' = \\frac{u\'}{u}.\nBu yerda u = x^2 + 1 va uning hosilasi u\' = 2x.\nShuning uchun: f\'(x) = \\frac{2x}{x^2 + 1}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 5,
        topic: 'Algebra',
        difficulty: 'Medium',
        question: 'If \\log_2(x) + \\log_2(x - 2) = 3, then find the value of x:',
        options: ['x = 4', 'x = 2', 'x = -2', 'x = 8'],
        correct: 0,
        explanation: 'Logarifm yig\'indisi xossasidan foydalanamiz: \\log_2(x(x - 2)) = 3\nDemak: x(x - 2) = 2^3 = 8\nx^2 - 2x - 8 = 0.\nViyet teoremasiga ko\'ra ildizlar: x = 4 va x = -2.\nLogarifm aniqlanish sohasiga ko\'ra (x > 0 va x - 2 > 0) ya\'ni x > 2 bo\'lishi shart.\nShu sababli x = 4 to\'g\'ri yechim. To\'g\'ri javob: A.'
      },
      {
        id: 6,
        topic: 'Trigonometry',
        difficulty: 'Medium',
        question: 'Determine the exact value of the expression: \\sin(\\frac{\\pi}{3}) \\cdot \\cos(\\frac{\\pi}{6})',
        options: ['\\frac{3}{4}', '\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '1'],
        correct: 0,
        explanation: 'Trigonometrik burchaklar jadvalidan foydalanamiz:\n\\sin(\\frac{\\pi}{3}) = \\frac{\\sqrt{3}}{2}\n\\cos(\\frac{\\pi}{6}) = \\frac{\\sqrt{3}}{2}\nKo\'paytma: \\frac{\\sqrt{3}}{2} \\cdot \\frac{\\sqrt{3}}{2} = \\frac{3}{4}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 7,
        topic: 'Algebra',
        difficulty: 'Medium',
        question: 'Find the roots of the quadratic equation: x^2 - 5x + 6 = 0',
        options: ['x = 2 and x = 3', 'x = -2 and x = -3', 'x = 1 and x = 6', 'x = 0 and x = 5'],
        correct: 0,
        explanation: 'Kvadrat tenglamani Viyet teoremasi orqali yozamiz:\nx_1 + x_2 = 5 va x_1 \\cdot x_2 = 6.\nBu shartlarni qanoatlantiruvchi sonlar: 2 va 3. Natijada x = 2 va x = 3.\nTo\'g\'ri javob: A.'
      },
      {
        id: 8,
        topic: 'Geometry',
        difficulty: 'Easy',
        question: 'What is the sum of interior angles of a regular hexagon?',
        options: ['720^\\circ', '540^\\circ', '360^\\circ', '900^\\circ'],
        correct: 0,
        explanation: 'Qavariq ko\'pburchak ichki burchaklar yig\'indisi formulasi: S_n = (n - 2) \\cdot 180^\\circ.\nMuntazam oltiburchak (hexagon) uchun n = 6.\nS_6 = (6 - 2) \\cdot 180^\\circ = 4 \\cdot 180^\\circ = 720^\\circ.\nTo\'g\'ri javob: A.'
      },
      {
        id: 9,
        topic: 'Statistics',
        difficulty: 'Medium',
        question: 'A bag contains 4 red and 6 blue marbles. If two marbles are drawn at random without replacement, what is the probability that both are red?',
        options: ['\\frac{2}{15}', '\\frac{4}{25}', '\\frac{1}{3}', '\\frac{3}{10}'],
        correct: 0,
        explanation: 'Birinchi marotaba qizil shar olish ehtimoli: P(R_1) = \\frac{4}{10}.\nShar qaytarib solinmagani sababli bagda 9 ta shar (3 ta qizil) qoladi.\nIkkinchi qizil shar olish ehtimoli: P(R_2|R_1) = \\frac{3}{9} = \\frac{1}{3}.\nIkkalasining birgalikda ro\'y berish ehtimoli: P = \\frac{4}{10} \\cdot \\frac{1}{3} = \\frac{4}{30} = \\frac{2}{15}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 10,
        topic: 'Algebra',
        difficulty: 'Hard',
        question: 'Calculate the sum of the infinite geometric series: \\sum_{n=1}^{\\infty} 3 \\cdot (\\frac{1}{2})^n',
        options: ['3', '6', '2', '1.5'],
        correct: 0,
        explanation: 'Cheksiz kamayuvchi geometrik progressiya yig\'indisi formulasi: S = \\frac{a_1}{1 - q}.\nBirinchi hadi: a_1 = 3 \\cdot (\\frac{1}{2})^1 = \\frac{3}{2} = 1.5.\nMaxraji: q = \\frac{1}{2} = 0.5.\nHisoblaymiz: S = \\frac{1.5}{1 - 0.5} = \\frac{1.5}{0.5} = 3.\nTo\'g\'ri javob: A.'
      },
      {
        id: 11,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Find the value of the following trigonometric limit: \\lim_{x \\to 0} \\frac{\\sin(5x)}{x}',
        options: ['5', '1', '0', '\\infty'],
        correct: 0,
        explanation: 'Birinchi ajoyib limitdan foydalanamiz: \\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1.\nIfodani moslashtiramiz: \\frac{\\sin(5x)}{x} = 5 \\cdot \\frac{\\sin(5x)}{5x}.\nLimitni hisoblasak: \\lim_{x \\to 0} 5 \\cdot \\frac{\\sin(5x)}{5x} = 5 \\cdot 1 = 5.\nTo\'g\'ri javob: A.'
      },
      {
        id: 12,
        topic: 'Algebra',
        difficulty: 'Easy',
        question: 'Simplify the algebraic exponential expression: (2x^3 y^2)^3',
        options: ['8x^9 y^6', '6x^9 y^6', '8x^6 y^5', '2x^9 y^6'],
        correct: 0,
        explanation: 'Daraja xossalaridan foydalanamiz: (a \\cdot b^m \\cdot c^n)^p = a^p \\cdot b^{m \\cdot p} \\cdot c^{n \\cdot p}.\n(2x^3 y^2)^3 = 2^3 \\cdot (x^3)^3 \\cdot (y^2)^3 = 8 \\cdot x^9 \\cdot y^6 = 8x^9y^6.\nTo\'g\'ri javob: A.'
      },
      {
        id: 13,
        topic: 'Geometry',
        difficulty: 'Medium',
        question: 'A right-angled triangle has a hypotenuse of length 13 cm and one side of length 5 cm. Find the length of the other side.',
        options: ['12 cm', '8 cm', '10 cm', '11 cm'],
        correct: 0,
        explanation: 'Pifagor teoremasi: a^2 + b^2 = c^2.\nBerilgan: a = 5, c = 13.\n5^2 + b^2 = 13^2 \\Rightarrow 25 + b^2 = 169\nb^2 = 169 - 25 = 144 \\Rightarrow b = \\sqrt{144} = 12 \\text{ cm}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 14,
        topic: 'Trigonometry',
        difficulty: 'Hard',
        question: 'Simplify the basic trigonometric difference: \\cos^2(\\theta) - \\sin^2(\\theta)',
        options: ['\\cos(2\\theta)', '\\sin(2\\theta)', '1', '0'],
        correct: 0,
        explanation: 'Ikkilangan burchak trigonometrik formulalariga asosan:\n\\cos^2(\\theta) - \\sin^2(\\theta) = \\cos(2\\theta).\nTo\'g\'ri javob: A.'
      },
      {
        id: 15,
        topic: 'Algebra',
        difficulty: 'Medium',
        question: 'If 3^{x+1} = 27^{x-1}, determine the value of x:',
        options: ['x = 2', 'x = 1', 'x = 3', 'x = 4'],
        correct: 0,
        explanation: '27 sonini 3 ning darajasi shaklida yozib olamiz:\n3^{x+1} = (3^3)^{x-1} \\Rightarrow 3^{x+1} = 3^{3x-3}.\nDarajalarini tenglashtiramiz:\nx + 1 = 3x - 3\n1 + 3 = 3x - x \\Rightarrow 2x = 4 \\Rightarrow x = 2.\nTo\'g\'ri javob: A.'
      },
      {
        id: 16,
        topic: 'Statistics',
        difficulty: 'Easy',
        question: 'Find the statistical median of the following set of values: 3, 8, 5, 12, 10',
        options: ['8', '7.6', '5', '10'],
        correct: 0,
        explanation: 'Medianani hisoblash uchun ma\'lumotlar to\'plamini o\'sish tartibida joylashtiramiz:\n3, 5, 8, 10, 12.\nO\'rtada turgan element - 8. Demak, mediana 8 ga teng.\nTo\'g\'ri javob: A.'
      },
      {
        id: 17,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Identify the critical points of the function: f(x) = x^3 - 3x',
        options: ['x = \\pm 1', 'x = 0', 'x = \\pm 3', 'x = \\pm \\sqrt{3}'],
        correct: 0,
        explanation: 'Kritik nuqtalarni topish uchun funksiya hosilasini hisoblab nolga tenglashtiramiz:\nf\'(x) = 3x^2 - 3 = 0\n3(x^2 - 1) = 0 \\Rightarrow x^2 = 1 \\Rightarrow x = \\pm 1.\nTo\'g\'ri javob: A.'
      },
      {
        id: 18,
        topic: 'Geometry',
        difficulty: 'Medium',
        question: 'What is the volume of a sphere with a radius of 3 cm? (Give your answer in terms of \\pi)',
        options: ['36\\pi cm^3', '12\\pi cm^3', '24\\pi cm^3', '18\\pi cm^3'],
        correct: 0,
        explanation: 'Sfera hajmi formulasi: V = \\frac{4}{3} \\pi r^3.\nRadius r = 3 cm ni formulaga qo\'yamiz:\nV = \\frac{4}{3} \\pi (3)^3 = \\frac{4}{3} \\pi \\cdot 27 = 4 \\pi \\cdot 9 = 36\\pi \\text{ cm}^3.\nTo\'g\'ri javob: A.'
      },
      {
        id: 19,
        topic: 'Algebra',
        difficulty: 'Easy',
        question: 'If f(x) = 2x^2 - 3x + 5, calculate the exact value of f(-2):',
        options: ['19', '7', '3', '15'],
        correct: 0,
        explanation: 'Funksiyaga x = -2 qiymatini qo\'yamiz:\nf(-2) = 2(-2)^2 - 3(-2) + 5 = 2(4) + 6 + 5 = 8 + 6 + 5 = 19.\nTo\'g\'ri javob: A.'
      },
      {
        id: 20,
        topic: 'Trigonometry',
        difficulty: 'Medium',
        question: 'In a right-angled triangle, if \\tan(\\theta) = \\frac{3}{4}, evaluate the value of \\cos(\\theta):',
        options: ['\\frac{4}{5}', '\\frac{3}{5}', '\\frac{5}{4}', '\\frac{5}{3}'],
        correct: 0,
        explanation: '\\tan(\\theta) = \\frac{\\text{qarama-qarshi katet}}{\\text{yopishgan katet}} = \\frac{3}{4}.\nPifagor sonlariga asosan, gipotenuza c = \\sqrt{3^2 + 4^2} = 5 ga teng.\nKosinus formulasi: \\cos(\\theta) = \\frac{\\text{yopishgan katet}}{\\text{gipotenuza}} = \\frac{4}{5}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 21,
        topic: 'Algebra',
        difficulty: 'Hard',
        question: 'If x + \\frac{1}{x} = 5, then what is the value of x^2 + \\frac{1}{x^2}?',
        options: ['23', '25', '27', '21'],
        correct: 0,
        explanation: 'Berilgan tenglikning ikkala tarafini kvadratga ko\'taramiz:\n(x + \\frac{1}{x})^2 = 5^2\nx^2 + 2 \\cdot x \\cdot \\frac{1}{x} + \\frac{1}{x^2} = 25\nx^2 + 2 + \\frac{1}{x^2} = 25 \\Rightarrow x^2 + \\frac{1}{x^2} = 25 - 2 = 23.\nTo\'g\'ri javob: A.'
      },
      {
        id: 22,
        topic: 'Geometry',
        difficulty: 'Hard',
        question: 'The diagonal of a square is 8\\sqrt{2} cm. Find the area of the square.',
        options: ['64 cm^2', '32 cm^2', '16 cm^2', '128 cm^2'],
        correct: 0,
        explanation: 'Kvadrat diagonali d = a\\sqrt{2} ga teng, bu yerda a - kvadrat tomoni.\nDemak, a\\sqrt{2} = 8\\sqrt{2} \\Rightarrow a = 8 \\text{ cm}.\nKvadrat yuzi: S = a^2 = 8^2 = 64 \\text{ cm}^2.\nTo\'g\'ri javob: A.'
      },
      {
        id: 23,
        topic: 'Statistics',
        difficulty: 'Medium',
        question: 'The arithmetic mean of 5 numbers is 12. If a 6th number is added, the new mean becomes 13. What is the value of the 6th number?',
        options: ['18', '15', '14', '20'],
        correct: 0,
        explanation: 'Dastlabki 5 ta sonning umumiy yig\'indisi: 5 \\cdot 12 = 60.\n6 ta sonning yangi yig\'indisi: 6 \\cdot 13 = 78.\nQo\'shilgan oltinchi son: 78 - 60 = 18.\nTo\'g\'ri javob: A.'
      },
      {
        id: 24,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Find the following limit at infinity: \\lim_{x \\to \\infty} \\frac{3x^2 - 5x + 2}{2x^2 + 7}',
        options: ['\\frac{3}{2}', '0', '\\infty', '\\frac{2}{7}'],
        correct: 0,
        explanation: 'Surat va maxrajni eng yuqori daraja x^2 ga bo\'lib yuboramiz:\n\\lim_{x \\to \\infty} \\frac{3 - \\frac{5}{x} + \\frac{2}{x^2}}{2 + \\frac{7}{x^2}} = \\frac{3 - 0 + 0}{2 + 0} = \\frac{3}{2}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 25,
        topic: 'Algebra',
        difficulty: 'Easy',
        question: 'Solve for y in the equation: 2(y - 3) = 4y + 8',
        options: ['y = -7', 'y = -1', 'y = 7', 'y = 1'],
        correct: 0,
        explanation: 'Qavslarni ochamiz va noma\'lumlar burchagini o\'zgartiramiz:\n2y - 6 = 4y + 8\n-6 - 8 = 4y - 2y\n-14 = 2y \\Rightarrow y = -7.\nTo\'g\'ri javob: A.'
      },
      {
        id: 26,
        topic: 'Trigonometry',
        difficulty: 'Easy',
        question: 'Find the radian measure of the angle: 120^\\circ',
        options: ['\\frac{2\\pi}{3}', '\\frac{3\\pi}{4}', '\\frac{\\pi}{3}', '\\frac{5\\pi}{6}'],
        correct: 0,
        explanation: 'Gradusdan radianga o\'tish formulasi: \\text{Radian} = \\text{Gradus} \\cdot \\frac{\\pi}{180}.\nHisoblaymiz: 120^\\circ \\cdot \\frac{\\pi}{180} = \\frac{120\\pi}{180} = \\frac{2\\pi}{3}.\nTo\'g\'ri javob: A.'
      },
      {
        id: 27,
        topic: 'Geometry',
        difficulty: 'Medium',
        question: 'Calculate the Euclidean distance between two points (1, 2) and (4, 6) in the coordinate system.',
        options: ['5', '7', '25', '\\sqrt{7}'],
        correct: 0,
        explanation: 'Ikki nuqta orasidagi masofa formulasi: d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}.\nQiymatlarni qo\'yamiz:\nd = \\sqrt{(4 - 1)^2 + (6 - 2)^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5.\nTo\'g\'ri javob: A.'
      },
      {
        id: 28,
        topic: 'Statistics',
        difficulty: 'Medium',
        question: 'If the mathematical variance of a sample dataset is 49, determine its standard deviation:',
        options: ['7', '49', '3.5', '9.8'],
        correct: 0,
        explanation: 'O\'rtacha kvadratik chetlanish (standard deviation) dispersiya (variance) ning musbat kvadrat ildiziga teng bo\'ladi:\n\\sigma = \\sqrt{\\text{Variance}} = \\sqrt{49} = 7.\nTo\'g\'ri javob: A.'
      },
      {
        id: 29,
        topic: 'Calculus',
        difficulty: 'Hard',
        question: 'Find the derivative using the chain rule: \\frac{d}{dx} (\\sin(x^2))',
        options: ['2x \\cos(x^2)', '\\cos(x^2)', '2x \\sin(x^2)', '-2x \\cos(x^2)'],
        correct: 0,
        explanation: 'Murakkab funksiya hosilasi (Chain Rule): [\\sin(u)]\' = \\cos(u) \\cdot u\'.\nBu yerda u = x^2 bo\'lib, uning hosilasi u\' = 2x.\nDemak: \\frac{d}{dx}(\\sin(x^2)) = \\cos(x^2) \\cdot 2x = 2x \\cos(x^2).\nTo\'g\'ri javob: A.'
      },
      {
        id: 30,
        topic: 'Algebra',
        difficulty: 'Hard',
        question: 'Calculate the sum of the roots of the quadratic equation: 2x^2 - 8x + 5 = 0',
        options: ['4', '-4', '2.5', '5'],
        correct: 0,
        explanation: 'Kvadrat tenglama ildizlarining yig\'indisi Viyet teoremasiga ko\'ra: x_1 + x_2 = -\\frac{b}{a}.\nTenglamada a = 2, b = -8.\nIldizlar yig\'indisi: -\\frac{-8}{2} = \\frac{8}{2} = 4.\nTo\'g\'ri javob: A.'
      }
    ]
  },
  {
    id: 'trig-challenge',
    title: 'Geometriya & Trigonometriya Tezkor Testi',
    category: 'Geometry & Trig',
    duration: 15,
    totalQuestions: 5,
    passingScore: 80,
    difficulty: 'Medium',
    description: 'Burchaklar, trigonometrik ayniyatlar va Pifagor qonuniyatlari bo\'yicha 5 ta tezkor savoldan iborat blits-imtihon.',
    questions: [
      {
        id: 1,
        topic: 'Trigonometry',
        difficulty: 'Easy',
        question: 'Evaluate the trigonometric sum: \\sin(\\frac{\\pi}{2}) + \\cos(\\pi)',
        options: ['0', '1', '2', '-1'],
        correct: 0,
        explanation: 'Jadval qiymatlari: \\sin(\\frac{\\pi}{2}) = 1 va \\cos(\\pi) = -1. Yig\'indi: 1 + (-1) = 0.'
      },
      {
        id: 2,
        topic: 'Geometry',
        difficulty: 'Medium',
        question: 'Tomonlari 6, 8 va 10 bo\'lgan uchburchakning yuzini toping:',
        options: ['24', '48', '30', '40'],
        correct: 0,
        explanation: 'Bu to\'g\'ri burchakli uchburchakdir, chunki 6^2 + 8^2 = 10^2 (36+64=100). Yuzi katetlar ko\'paytmasining yarmi: S = \\frac{1}{2} \\cdot 6 \\cdot 8 = 24.'
      },
      {
        id: 3,
        topic: 'Trigonometry',
        difficulty: 'Hard',
        question: 'If \\sin(x) = 1, then what is the value of \\cos(x)?',
        options: ['0', '1', '-1', '\\frac{1}{2}'],
        correct: 0,
        explanation: 'Asosiy trigonometrik ayniyat: \\sin^2(x) + \\cos^2(x) = 1. Agar \\sin(x) = 1 bo\'lsa, 1^2 + \\cos^2(x) = 1 \\Rightarrow \\cos^2(x) = 0 \\Rightarrow \\cos(x) = 0.'
      },
      {
        id: 4,
        topic: 'Geometry',
        difficulty: 'Easy',
        question: 'Kvadratning perimetri 20 cm bo\'lsa, uning yuzini toping:',
        options: ['25 cm^2', '20 cm^2', '16 cm^2', '36 cm^2'],
        correct: 0,
        explanation: 'Kvadrat perimetri P = 4a = 20 cm, demak uning tomoni a = 5 cm. Yuzi esa S = a^2 = 5^2 = 25 \\text{ cm}^2.'
      },
      {
        id: 5,
        topic: 'Trigonometry',
        difficulty: 'Medium',
        question: 'Soddalashtiring: \\tan(x) \\cdot \\cos(x)',
        options: ['\\sin(x)', '\\cos(x)', '1', '\\cot(x)'],
        correct: 0,
        explanation: '\\tan(x) = \\frac{\\sin(x)}{\\cos(x)} ekanligidan: \\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x) = \\sin(x).'
      }
    ]
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      setCurrentPage('reset-password');
    }
  }, []);

  // User Profile
  const [profile, setProfile] = useState({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.j@example.com',
    phone: '+998 99 824 46 18',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    course: 'SAT Math Masterclass'
  });

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  };

  const [courses, setCourses] = useState(coursesData);
  const [tests, setTests] = useState(studentTests);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('student_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`https://api.mathscore.uz${url}`, {
      ...options,
      headers
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('student_token');
      setCurrentPage('login');
      throw new Error('Sessiya muddati tugadi. Qayta kirishingiz kerak.');
    }
    return response;
  };

  const syncData = async (studentProfile = null) => {
    try {
      let allowedCourseTitles = [];

      // First, get user data with enrolled courses
      const meRes = await fetchWithAuth('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();

        if (meData.enrolledCourses && meData.enrolledCourses.length > 0) {
          // Use enrolled courses from the backend (multi-course support)
          const processedCourses = meData.enrolledCourses.map(course => {
            const baseCourse = coursesData.find(c => c.id === course.id) || {};
            return {
              progress: baseCourse.progress || 0,
              tag: baseCourse.tag || 'Easy',
              ...course,
              lessons: (course.lessons || []).reduce((acc, lesson, idx) => {
                const isCompleted = (meData.completedLessons && meData.completedLessons.includes(lesson.id)) || lesson.completed || false;
                const prevCompleted = idx === 0 ? true : acc[idx - 1].completed;
                acc.push({
                  ...lesson,
                  completed: isCompleted,
                  locked: lesson.locked !== undefined ? lesson.locked : !prevCompleted
                });
                return acc;
              }, [])
            };
          });

          allowedCourseTitles = processedCourses.map(c => c.title);
          setCourses(processedCourses);

          if (processedCourses.length > 0) {
            const matchedCourse = processedCourses[0];
            setActiveCourse(matchedCourse);
            if (matchedCourse.lessons && matchedCourse.lessons.length > 0) {
              setActiveLesson(matchedCourse.lessons[0]);
            } else {
              setActiveLesson(null);
            }
          } else {
            setActiveCourse(null);
            setActiveLesson(null);
          }
        } else {
          // Fallback: filter all courses by legacy single course field
          const coursesRes = await fetchWithAuth('/api/courses');
          if (coursesRes.ok) {
            const coursesDataVal = await coursesRes.json();
            const processedCourses = coursesDataVal.map(course => {
              const baseCourse = coursesData.find(c => c.id === course.id) || {};
              return {
                progress: baseCourse.progress || 0,
                tag: baseCourse.tag || 'Easy',
                ...course,
                lessons: (course.lessons || []).reduce((acc, lesson, idx) => {
                  const isCompleted = (meData.completedLessons && meData.completedLessons.includes(lesson.id)) || lesson.completed || false;
                  const prevCompleted = idx === 0 ? true : acc[idx - 1].completed;
                  acc.push({
                    ...lesson,
                    completed: isCompleted,
                    locked: lesson.locked !== undefined ? lesson.locked : !prevCompleted
                  });
                  return acc;
                }, [])
              };
            });

            const currentUser = studentProfile || JSON.parse(localStorage.getItem('student_user') || '{}');
            const currentEnrolledCourse = currentUser.course || '';

            const filteredCourses = processedCourses.filter(c =>
              c.title.toLowerCase().includes(currentEnrolledCourse.toLowerCase()) ||
              c.id.toLowerCase().includes(currentEnrolledCourse.toLowerCase())
            );

            allowedCourseTitles = filteredCourses.map(c => c.title);
            setCourses(filteredCourses);

            if (filteredCourses.length > 0) {
              setActiveCourse(filteredCourses[0]);
              if (filteredCourses[0].lessons && filteredCourses[0].lessons.length > 0) {
                setActiveLesson(filteredCourses[0].lessons[0]);
              } else {
                setActiveLesson(null);
              }
            } else {
              setActiveCourse(null);
              setActiveLesson(null);
            }
          }
        }
      }

      const testsRes = await fetchWithAuth('/api/tests');
      if (testsRes.ok) {
        const testsDataVal = await testsRes.json();
        const mappedTests = testsDataVal
          .filter(t => !t.course || allowedCourseTitles.includes(t.course))
          .map(t => ({
            ...t,
            questions: (t.questions || []).map(q => ({
              ...q,
              question: q.text || q.question || '',
              correct: q.correctAnswer !== undefined ? q.correctAnswer : q.correct
            }))
          }));
        setTests(mappedTests);
      }

      const submissionsRes = await fetchWithAuth('/api/submissions');
      if (submissionsRes.ok) {
        const subs = await submissionsRes.json();
        setSubmissions(subs);
      }

      const notifRes = await fetchWithAuth('/api/notifications');
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      return;
    }

    const token = localStorage.getItem('student_token');
    if (token) {
      fetchWithAuth('/api/auth/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then(user => {
          const studentProfile = {
            firstName: user.name.split(' ')[0] || user.name,
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone || '',
            avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
            course: user.course || 'SAT Math Masterclass'
          };
          setProfile(studentProfile);
          if (!user.phone || user.phone.trim() === '') {
            setCurrentPage('profile');
            setShowProfileAlert(true);
          } else {
            setCurrentPage('dashboard');
          }
          syncData(studentProfile);
        })
        .catch(err => {
          console.warn(err.message);
          setCurrentPage('login');
        });
    }
  }, []);

  // Course Playing State
  const [activeCourse, setActiveCourse] = useState(coursesData[0]);
  const [activeLesson, setActiveLesson] = useState(coursesData[0].lessons[1]);
  const [canProceedToNext, setCanProceedToNext] = useState(false);

  // Next Lesson Unlock Timer
  useEffect(() => {
    if (currentPage === 'courses') {
      setCanProceedToNext(false);
      const timer = setTimeout(() => {
        setCanProceedToNext(true);
      }, 10000); // 10 soniyadan keyin aktivlashadi
      return () => clearTimeout(timer);
    }
  }, [activeLesson, currentPage]);

  // Test State Variables
  const [activeQuizTest, setActiveQuizTest] = useState(studentTests[0]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([0]);
  const [timerSeconds, setTimerSeconds] = useState(3600);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showQuizConfirmationModal, setShowQuizConfirmationModal] = useState(false);

  // Results panel and Certificates
  const [quizResult, setQuizResult] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Security / Cheat Shield state
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);

  // Scientific Calculator states
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Password hide/show
  const [showPassword, setShowPassword] = useState(false);

  // Dark Mode toggler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Quiz Countdown Timer Hook
  useEffect(() => {
    let interval = null;
    if (currentPage === 'test-interface' && !isTimerPaused && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && currentPage === 'test-interface') {
      handleSubmitTest();
    }
    return () => clearInterval(interval);
  }, [currentPage, isTimerPaused, timerSeconds]);

  // Cheat Prevention Tab Focus Detector
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentPage === 'test-interface' && activeQuizTest?.preventTabSwitch) {
        setTabSwitchesCount(prev => {
          const nextCount = prev + 1;

          fetchWithAuth('/api/system/cheat-report', {
            method: 'POST',
            body: JSON.stringify({
              testTitle: activeQuizTest.title,
              tabSwitches: nextCount
            })
          }).catch(err => console.warn('Cheat alert report failed:', err));

          alert(`OGOHLANTIRISH!\nImtihon paytida brauzer oynasini yoki tabini o'zgartirish qat'iyan man etiladi.\nXatti-harakat tizimda qayd etildi (${nextCount}/3).\n3 ta ogohlantirishdan so'ng testingiz avtomatik tarzda yakunlanadi!`);

          if (nextCount >= 3) {
            handleSubmitTest();
          }
          return nextCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage, activeQuizTest]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // High-Fidelity Client-Side Regex LaTeX Parser
  const renderMathContent = (text) => {
    if (!text) return "";
    try {
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
      return (
        <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
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
        </span>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  const handleSelectAnswer = (qIndex, optionIndex) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));

    // Auto-mark as visited
    if (!visitedQuestions.includes(qIndex)) {
      setVisitedQuestions(prev => [...prev, qIndex]);
    }
  };

  const handleToggleFlag = (qIndex) => {
    if (markedForReview.includes(qIndex)) {
      setMarkedForReview(prev => prev.filter(item => item !== qIndex));
    } else {
      setMarkedForReview(prev => [...prev, qIndex]);
    }
  };

  const handleSubmitTest = async () => {
    setShowQuizConfirmationModal(false);

    const spentTimeSecs = activeQuizTest.duration * 60 - timerSeconds;
    const timeSpentStr = formatTimer(spentTimeSecs >= 0 ? spentTimeSecs : 0);

    try {
      const response = await fetchWithAuth('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          testId: activeQuizTest.id,
          answers: quizAnswers,
          tabSwitches: tabSwitchesCount,
          timeSpent: timeSpentStr
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Natijani saqlashda xatolik.');
      }

      setQuizResult({
        testId: activeQuizTest.id,
        testTitle: activeQuizTest.title,
        score: data.result.score,
        correctCount: data.result.correctCount,
        incorrectCount: data.result.totalQuestions - data.result.correctCount,
        unansweredCount: activeQuizTest.questions.length - Object.keys(quizAnswers).length,
        timeSpent: timeSpentStr,
        answers: quizAnswers,
        cheatAlerts: tabSwitchesCount
      });

      setCurrentPage('test-results');
      syncData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setMarkedForReview([]);
    setVisitedQuestions([0]);
    setTimerSeconds(activeQuizTest.duration * 60);
    setTabSwitchesCount(0);
    setActiveQuestion(0);
    setCurrentPage('test-interface');
  };

  const handleStartTestFlow = (test) => {
    let processedTest = JSON.parse(JSON.stringify(test)); // Deep copy to safely modify locally

    if (processedTest.randomizeQuestions && processedTest.questions) {
      processedTest.questions = processedTest.questions.sort(() => Math.random() - 0.5);
    }

    if (processedTest.randomizeAnswers && processedTest.questions) {
      processedTest.questions = processedTest.questions.map(q => {
        if (q.options && q.options.length > 0 && typeof q.correct === 'number') {
          const optionsWithStatus = q.options.map((opt, index) => ({ text: opt, isCorrect: index === q.correct }));
          const shuffled = optionsWithStatus.sort(() => Math.random() - 0.5);
          return {
            ...q,
            options: shuffled.map(o => o.text),
            correct: shuffled.findIndex(o => o.isCorrect)
          };
        }
        return q;
      });
    }

    setActiveQuizTest(processedTest);
    setQuizAnswers({});
    setMarkedForReview([]);
    setVisitedQuestions([0]);
    setTimerSeconds(processedTest.duration * 60);
    setTabSwitchesCount(0);
    setActiveQuestion(0);
    setCurrentPage('test-start');
  };

  // Safe Math evaluator for floating scientific calculator
  const handleCalcPress = (btn) => {
    if (btn === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (btn === '=') {
      try {
        let expression = calcInput;
        // replace with Math equivalents safely
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/π/g, 'Math.PI');

        const evalFn = new Function(`return ${expression}`);
        const res = evalFn();
        setCalcResult(Number(res).toFixed(4).replace(/\.?0+$/, ''));
      } catch (err) {
        setCalcResult('Xatolik');
      }
    } else {
      const isFunction = ['sin', 'cos', 'tan', 'sqrt', 'log'].includes(btn);
      setCalcInput(prev => prev + (isFunction ? btn + '(' : btn));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    setCurrentPage('login');
    setIsSidebarOpen(false);
  };

  const sidebarNavItems = [
    { name: 'Dashboard', icon: 'dashboard', page: 'dashboard' },
    { name: 'Testlar Markazi', icon: 'quiz', page: 'test-center' },
    { name: 'Imtihon Natijalari', icon: 'insights', page: 'test-results' },
    { name: 'Settings', icon: 'settings', page: 'profile' }
  ];

  // Domain accuracy computer helper
  const getCategoryAccuracy = (category) => {
    if (!activeQuizTest || !quizResult) return 0;
    const catQuestions = activeQuizTest.questions.filter(q => q.topic === category);
    if (catQuestions.length === 0) return 0;

    let correct = 0;
    catQuestions.forEach(q => {
      const originalIdx = activeQuizTest.questions.indexOf(q);
      if (quizResult.answers[originalIdx] === q.correct) {
        correct++;
      }
    });
    return Math.round((correct / catQuestions.length) * 100);
  };

  const getLessonIndex = () => activeCourse?.lessons?.findIndex(l => l.id === activeLesson?.id);

  const handlePrevLesson = () => {
    const idx = getLessonIndex();
    if (idx > 0) setActiveLesson(activeCourse.lessons[idx - 1]);
  };

  const handleNextLesson = async () => {
    const idx = getLessonIndex();
    if (idx !== -1 && idx < activeCourse.lessons.length) {
      // Backendga dars yakunlanganini yuboramiz
      try {
        await fetchWithAuth(`/api/lessons/${activeLesson.id}/complete`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to mark lesson as completed', err);
      }

      // Joriy darsni "completed" (tugallangan) deb belgilaymiz
      const updatedLessons = [...activeCourse.lessons];
      updatedLessons[idx] = { ...updatedLessons[idx], completed: true };
      // Keyingi darsni "unlocked" qilamiz
      if (idx + 1 < updatedLessons.length) {
        updatedLessons[idx + 1] = { ...updatedLessons[idx + 1], locked: false };
      }
      const updatedCourse = { ...activeCourse, lessons: updatedLessons };

      setActiveCourse(updatedCourse);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));

      // Agar bu oxirgi dars bo'lmasa, keyingisiga o'tamiz
      if (idx < activeCourse.lessons.length - 1) {
        setActiveLesson(updatedCourse.lessons[idx + 1]);
      }
    }
  };

  const getVideoSrc = (url) => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
      const token = localStorage.getItem('student_token');
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}token=${token}`;
    }
    return url;
  };

  const handleAvatarChange = async (e) => {
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('student_token');
      let currentAvatar = profile.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile, 'avatar.jpg');

        const uploadRes = await fetch('https://api.mathscore.uz/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Rasmni yuklashda xatolik');
        currentAvatar = uploadData.url;
      }

      const updateRes = await fetch('https://api.mathscore.uz/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profile,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          avatar: currentAvatar
        })
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Profilni yangilashda xatolik");

      setProfile(prev => ({ ...prev, avatar: currentAvatar }));
      setAvatarFile(null);
      setShowProfileAlert(false);
      alert("Sozlamalar muvaffaqiyatli saqlandi!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background antialiased flex flex-col font-sans transition-colors duration-200">

      {cropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl flex flex-col gap-4 border border-outline-variant">
            <h3 className="text-lg font-outfit font-bold text-on-surface">Rasmni moslashtirish</h3>
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
              <button onClick={() => setCropModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-outline hover:text-on-surface transition-colors cursor-pointer">Bekor qilish</button>
              <button
                onClick={async () => {
                  try {
                    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                    setAvatarFile(croppedImage);
                    setProfile(prev => ({ ...prev, avatar: URL.createObjectURL(croppedImage) }));
                    setCropModalOpen(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MINIMALIST LOGIN -------------------- */}
      {currentPage === 'login' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-[420px] bg-surface rounded-2xl border border-outline-variant p-8 shadow-xs flex flex-col gap-6">

            {/* Logo */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px] block">calculate</span>
              </div>
              <h1 className="font-outfit text-xl font-bold tracking-tight text-on-surface">MathScore</h1>
              <p className="text-xs text-outline font-medium">Tizimga kirish uchun ma'lumotlarni kiriting</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.elements.email.value;
                const password = e.target.elements.password.value;

                try {
                  const response = await fetch('https://api.mathscore.uz/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                  });

                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error || 'Kirishda xatolik yuz berdi.');
                  }

                  if (data.user.role !== 'student') {
                    throw new Error('Talaba hisobi emas. Admin paneldan kiring.');
                  }

                  localStorage.setItem('student_token', data.token);
                  const studentProfile = {
                    firstName: data.user.name.split(' ')[0] || data.user.name,
                    lastName: data.user.name.split(' ').slice(1).join(' ') || '',
                    email: data.user.email,
                    phone: data.user.phone || '',
                    avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
                    course: data.user.course || 'SAT Math Masterclass'
                  };
                  setProfile(studentProfile);

                  if (!data.user.phone || data.user.phone.trim() === '') {
                    setCurrentPage('profile');
                    setShowProfileAlert(true);
                  } else {
                    setCurrentPage('dashboard');
                  }
                  syncData(studentProfile);
                  alert("Tizimga muvaffaqiyatli kirildi!");
                } catch (err) {
                  alert(err.message);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-on-surface" htmlFor="email">Email yoki Telefon</label>
                <input
                  name="email"
                  required
                  className="w-full h-11 px-4 bg-surface-container rounded-lg border border-outline-variant text-on-surface focus:border-primary focus:outline-none text-xs font-medium placeholder:text-outline/40"
                  id="email"
                  type="text"
                  placeholder="student@mathscore.uz"
                />
              </div>

              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex justify-between items-center">
                  <label className="text-on-surface" htmlFor="password">Parol</label>
                  <a onClick={(e) => { e.preventDefault(); setCurrentPage('forgot-password'); }} className="text-[10px] text-primary hover:underline font-semibold cursor-pointer">Unutdingizmi?</a>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    required
                    className="w-full h-11 pl-4 pr-10 bg-surface-container rounded-lg border border-outline-variant text-on-surface focus:border-primary focus:outline-none text-xs font-medium placeholder:text-outline/40"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer flex items-center justify-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button className="w-full h-11 bg-primary text-on-primary font-semibold rounded-lg text-xs hover:bg-primary/95 transition-all mt-4 cursor-pointer" type="submit">
                Tizimga kirish
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = 'http://localhost:5173/'; }}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all mt-3 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span>Asosiy saytga qaytish</span>
              </button>

              <button
                type="button"
                onClick={() => { window.open('https://t.me/math_teacher_m', '_blank'); }}
                className="w-full h-11 bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-semibold rounded-lg text-xs transition-all mt-3 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.03-2.76-.86c-.6-.188-.61-.6.126-.89l10.81-4.17c.5-.188.943.114.75 1.485z" /></svg>
                <span>Admin bilan bog'lanish</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- FORGOT PASSWORD -------------------- */}
      {currentPage === 'forgot-password' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in">
          <div className="w-full max-w-[420px] bg-surface rounded-2xl border border-outline-variant p-8 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px] block">lock_reset</span>
              </div>
              <h1 className="font-outfit text-xl font-bold tracking-tight text-on-surface">Parolni Tiklash</h1>
              <p className="text-xs text-outline font-medium">Tizimga ulangan e-mail manzilingizni kiriting. Biz sizga parolni tiklash havolasini yuboramiz.</p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.elements.email.value;
              try {
                const res = await fetch('https://api.mathscore.uz/api/auth/forgot-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                const data = await res.json();
                alert(data.message || data.error);
                if (res.ok) setCurrentPage('login');
              } catch (err) {
                alert('Xatolik yuz berdi');
              }
            }} className="space-y-4">
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-on-surface" htmlFor="reset-email">E-mail</label>
                <input name="email" required className="w-full h-11 px-4 bg-surface-container rounded-lg border border-outline-variant text-on-surface focus:border-primary focus:outline-none text-xs font-medium placeholder:text-outline/40" id="reset-email" type="email" placeholder="student@mathscore.uz" />
              </div>
              <button className="w-full h-11 bg-primary text-on-primary font-semibold rounded-lg text-xs hover:bg-primary/95 transition-all mt-4 cursor-pointer" type="submit">Tiklash havolasini yuborish</button>
              <button type="button" onClick={() => setCurrentPage('login')} className="w-full h-11 bg-surface-container text-on-surface font-semibold rounded-lg text-xs hover:bg-outline-variant transition-all mt-3 cursor-pointer">Orqaga qaytish</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- RESET PASSWORD -------------------- */}
      {currentPage === 'reset-password' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in">
          <div className="w-full max-w-[420px] bg-surface rounded-2xl border border-outline-variant p-8 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px] block">password</span>
              </div>
              <h1 className="font-outfit text-xl font-bold tracking-tight text-on-surface">Yangi Parol</h1>
              <p className="text-xs text-outline font-medium">Yangi parolni kiriting (kamida 8 ta belgi).</p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const newPassword = e.target.elements.newPassword.value;
              const token = new URLSearchParams(window.location.search).get('token');
              try {
                const res = await fetch('https://api.mathscore.uz/api/auth/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token, newPassword })
                });
                const data = await res.json();
                alert(data.message || data.error);
                if (res.ok) {
                  window.history.replaceState(null, '', '/');
                  setCurrentPage('login');
                }
              } catch (err) {
                alert('Xatolik yuz berdi');
              }
            }} className="space-y-4">
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-on-surface" htmlFor="new-password">Yangi parol</label>
                <input name="newPassword" required minLength="8" className="w-full h-11 px-4 bg-surface-container rounded-lg border border-outline-variant text-on-surface focus:border-primary focus:outline-none text-xs font-medium placeholder:text-outline/40" id="new-password" type="password" placeholder="••••••••" />
              </div>
              <button className="w-full h-11 bg-primary text-on-primary font-semibold rounded-lg text-xs hover:bg-primary/95 transition-all mt-4 cursor-pointer" type="submit">Parolni o'zgartirish</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MAIN LMS SHELL -------------------- */}
      {currentPage !== 'login' && currentPage !== 'forgot-password' && currentPage !== 'reset-password' && (
        <div className="flex flex-col min-h-screen">

          {/* Premium Header */}
          <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-14 bg-surface border-b border-outline-variant shadow-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-on-surface p-1.5 rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">{isSidebarOpen ? 'close' : 'menu'}</span>
              </button>

              <div
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-2 select-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px] block">calculate</span>
                </div>
                <span className="font-outfit text-base font-bold tracking-tight text-on-surface">MathScore</span>
              </div>

              {/* Horizontal Navbar */}
              <nav className="hidden md:flex gap-5 items-center ml-8 text-xs font-semibold">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`py-1 transition-colors ${currentPage === 'dashboard' ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { if (courses.length > 0) { setActiveCourse(courses[0]); setCurrentPage('courses'); } }}
                  className={`py-1 transition-colors ${currentPage === 'courses' ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  Kurslarim
                </button>
                <button
                  onClick={() => setCurrentPage('test-center')}
                  className={`py-1 transition-colors ${currentPage === 'test-center' ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  Imtihonlar
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer relative"
                >
                  <span className="material-symbols-outlined text-[20px] block">notifications</span>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-surface"></span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-outline-variant/60 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-3 border-b border-outline-variant/60">
                      <h4 className="text-xs font-bold text-on-surface">Bildirishnomalar</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-outline font-medium">Bildirishnomalar yo'q</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              if (!n.isRead) {
                                await fetchWithAuth(`/api/notifications/${n.id}/read`, { method: 'POST' });
                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                              }
                            }}
                            className={`p-3 border-b border-outline-variant/60 last:border-0 cursor-pointer hover:bg-surface-container transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h5 className={`text-xs font-bold ${!n.isRead ? 'text-on-surface' : 'text-outline'}`}>{n.title}</h5>
                              <span className="text-[9px] text-outline/80 font-medium whitespace-nowrap ml-2">
                                {new Date(n.createdAt).toLocaleDateString('uz-UZ')} {new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-outline leading-tight">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark mode switcher */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] block">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* User profile dropdown trigger */}
              <div
                onClick={() => {
                  setCurrentPage('profile');
                  if (!profile.phone || profile.phone.length < 17) setShowProfileAlert(true);
                }}
                className="flex items-center gap-2.5 cursor-pointer pl-3 border-l border-outline-variant/60"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                  <img alt="Student Profile" className="w-full h-full object-cover" src={getVideoSrc(profile.avatar)} />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-on-surface leading-none">{profile.firstName} {profile.lastName}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-1 pt-14 relative">

            {/* Sidebar Left Navigation */}
            <aside className={`
              fixed lg:sticky top-14 left-0 h-[calc(100vh-56px)] w-60 bg-surface border-r border-outline-variant z-35 transition-transform duration-200
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="p-4 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {/* Student mini card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <img alt="Avatar" className="w-full h-full object-cover" src={getVideoSrc(profile.avatar)} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-on-surface truncate">{profile.firstName} {profile.lastName}</h4>
                      <p className="text-[10px] text-outline font-medium">Premium o'quvchi</p>
                    </div>
                  </div>

                  {/* Nav Item list */}
                  <nav className="flex flex-col gap-1">
                    {sidebarNavItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => { setCurrentPage(item.page); setIsSidebarOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${currentPage === item.page || (item.page === 'test-results' && currentPage === 'test-results')
                            ? 'bg-primary/10 text-primary'
                            : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
                          }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${currentPage === item.page ? 'fill' : ''}`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="pt-4 border-t border-outline-variant space-y-3">
                  <button
                    onClick={() => { if (courses.length > 0) { setActiveCourse(courses[0]); setCurrentPage('courses'); setIsSidebarOpen(false); } }}
                    className="w-full bg-primary text-on-primary font-semibold text-xs py-2.5 rounded-lg hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    Darslarni boshlash
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 w-full text-error/85 hover:bg-error-container/10 transition-colors rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar backdrop */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-xs z-30 lg:hidden"
              ></div>
            )}

            {/* Primary content area */}
            <main className="flex-1 bg-background overflow-y-auto px-6 py-6 relative">
              <div className="max-w-[1000px] mx-auto">

                {/* -------------------- DASHBOARD VIEW -------------------- */}
                {currentPage === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in">
                    <header>
                      <h1 className="font-outfit text-2xl font-bold text-on-surface">Xush kelibsiz, {profile.firstName}! 👋</h1>
                      <p className="text-xs text-outline font-medium">Bugungi darslaringiz va faollik darajangiz.</p>
                    </header>

                    {/* Bento stats list */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-surface rounded-xl p-5 border border-outline-variant flex items-center gap-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px] fill">local_fire_department</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Joriy Seriya</p>
                          <p className="font-outfit text-base font-bold text-on-surface">
                            {Math.max(1, Math.floor((new Date() - new Date(profile?.createdAt || new Date())) / (1000 * 60 * 60 * 24)))} Kun
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface rounded-xl p-5 border border-outline-variant flex items-center gap-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px] fill">check_circle</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Tugallangan Darslar</p>
                          <p className="font-outfit text-base font-bold text-on-surface">
                            {courses.reduce((acc, course) => acc + (course.lessons || []).filter(l => l.completed).length, 0)} ta dars
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface rounded-xl p-5 border border-outline-variant flex items-center gap-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-lg bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px] fill">emoji_events</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider">O'rtacha Ball</p>
                          <p className="font-outfit text-base font-bold text-on-surface">
                            {submissions.length > 0
                              ? Math.round(submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length) + '% natija'
                              : '0% natija'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Course list grid */}
                    <section className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="font-outfit text-lg font-bold text-on-surface">Mening Kurslarim</h2>
                        {courses.length > 0 && (
                          <button
                            onClick={() => { setActiveCourse(courses[0]); setCurrentPage('courses'); }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            Barchasi
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {courses.map((course) => (
                          <article key={course.id} className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col hover:border-primary/50 transition-colors group shadow-xs">
                            <div className="relative h-36 w-full bg-surface-container overflow-hidden">
                              <img alt={course.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" src={course.image} />
                              <div className="absolute top-3 left-3 bg-surface/90 text-on-surface border border-outline-variant font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                                {course.category}
                              </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1 gap-4">
                              <div className="space-y-1">
                                <h3 className="font-outfit text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                                <p className="text-[11px] text-outline line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                              </div>

                              <div className="space-y-1 mt-auto">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-outline uppercase tracking-wider">O'zlashtirish</span>
                                  <span className="text-primary">{course.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${course.progress}%` }}></div>
                                </div>
                              </div>

                              <button
                                onClick={() => { setActiveCourse(course); setActiveLesson((course.lessons && course.lessons.length > 0) ? course.lessons[0] : null); setCurrentPage('courses'); }}
                                className="w-full bg-surface-container hover:bg-primary hover:text-on-primary font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Darsni ko\'rish</span>
                                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* -------------------- LMS COURSE PLAYER VIEW -------------------- */}
                {currentPage === 'courses' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

                    <div className="lg:col-span-8 flex flex-col gap-4">

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setCurrentPage('dashboard')}
                          className="flex items-center gap-0.5 text-xs font-bold text-outline hover:text-on-surface transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                          Dashboard
                        </button>

                        <button
                          onClick={() => setCurrentPage('test-center')}
                          className="bg-secondary-container text-secondary px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1 border border-secondary/20"
                        >
                          <span className="material-symbols-outlined text-[15px]">assignment</span>
                          Test topshirish (Diagnostic)
                        </button>
                      </div>

                      {/* Video Embed Player */}
                      <div className="w-full aspect-video bg-surface rounded-xl border border-outline-variant relative overflow-hidden flex items-center justify-center shadow-xs">
                        {activeLesson?.videoUrl ? (
                          isYouTube(activeLesson.videoUrl) ? (
                            <iframe
                              className="w-full h-full bg-black"
                              src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                              title={activeLesson.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video
                              key={activeLesson?.id}
                              src={getVideoSrc(activeLesson.videoUrl)}
                              controls
                              controlsList="nodownload"
                              onContextMenu={(e) => e.preventDefault()}
                              className="w-full h-full object-contain bg-black"
                              poster={activeCourse.image}
                            />
                          )
                        ) : (
                          <>
                            <img alt="Math class" className="absolute inset-0 w-full h-full object-cover opacity-30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzzisCD3Y_87UDZHcdRNf3vaQ3Ls3tGms1gjNBX0KxX7GoPKU_r2J3rCkHXdLTEL1g8gj4D12dB0byX4DnBjMA198-OTx6OiXtKEFADmR-ZrBKOTDkZv-eptuDp0gW13jPfv3Q4M2XYdW11Xx2jXFaGNcJIPdxb6D0XvfdjJdX1Y6VgutQ2Zlf2YEsAI8fOUHDF_c0eAVJCRdchjvuu004Sw_B81H6zrgopQgbV9Sp2AyRjp3aGy8HmLklVugPTyVXG3GtubL-Xw0l" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3 z-10 bg-black/40">
                              <span className="material-symbols-outlined text-5xl">videocam_off</span>
                              <p className="font-bold text-sm tracking-wide">Video mavjud emas</p>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3 text-white text-[10px] z-10 opacity-50">
                              <span className="material-symbols-outlined cursor-not-allowed text-[16px]">play_arrow</span>
                              <div className="flex-1 bg-white/30 h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-0"></div>
                              </div>
                              <span className="font-bold">00:00 / {activeLesson?.duration ? (activeLesson.duration.includes(':') ? activeLesson.duration : `${activeLesson.duration}:00`) : '00:00'}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Lesson Navigation Buttons */}
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={handlePrevLesson}
                          disabled={getLessonIndex() === 0}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${getLessonIndex() === 0
                              ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant'
                              : 'bg-surface border border-outline-variant text-on-surface hover:border-primary/50 cursor-pointer'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                          Oldingi dars
                        </button>

                        <button
                          onClick={handleNextLesson}
                          disabled={!canProceedToNext}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${!canProceedToNext
                              ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant'
                              : 'bg-primary text-on-primary hover:scale-105 shadow-md cursor-pointer'
                            }`}
                        >
                          Keyingi dars
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>

                      {/* Lesson Context */}
                      <div className="bg-surface p-5 rounded-xl border border-outline-variant space-y-3 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-bold text-[9px] uppercase border border-primary/20">
                            {activeCourse.title}
                          </span>
                        </div>
                        <h2 className="font-outfit text-xl font-bold text-on-surface">{activeLesson?.title || "Dars Tanlanmagan"}</h2>
                        <p className="text-xs text-outline leading-relaxed font-medium">
                          Ushbu dars doirasida biz o'rganilgan mavzularning chuqur nazariy va amaliy tahlilini ko'rib chiqamiz. Masalalarni optimal yechish yo'llari, formulalarni isbotlash va ularni SAT quantitative bo'limida qo'llash sirlarini o'rganasiz.
                        </p>

                        <div className="pt-4 border-t border-outline-variant flex flex-wrap gap-3">
                          <a href="#" className="flex items-center gap-1.5 p-2 bg-surface-container rounded-lg border border-outline-variant hover:border-primary/50 transition-colors text-[10px] font-bold text-outline">
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                            <span>Mavzu_Konspekti.pdf</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Course Syllabus */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      {/* Multi-Course Switcher */}
                      {courses.length > 1 && (
                        <div className="bg-surface rounded-xl p-4 border border-outline-variant shadow-xs">
                          <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Kurs tanlang</label>
                          <select
                            value={activeCourse?.id || ''}
                            onChange={(e) => {
                              const selected = courses.find(c => c.id === e.target.value);
                              if (selected) {
                                setActiveCourse(selected);
                                if (selected.lessons && selected.lessons.length > 0) {
                                  setActiveLesson(selected.lessons[0]);
                                } else {
                                  setActiveLesson(null);
                                }
                              }
                            }}
                            className="w-full p-2.5 bg-surface-container rounded-lg border border-outline-variant text-on-surface text-xs font-bold focus:border-primary focus:outline-none cursor-pointer"
                          >
                            {courses.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="bg-surface rounded-xl p-5 border border-outline-variant flex flex-col gap-4 shadow-xs">
                        <div className="space-y-1">
                          <h3 className="font-outfit text-sm font-bold text-on-surface">Kurs Dasturi</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${activeCourse.progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-primary shrink-0">{activeCourse.progress}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {(activeCourse.lessons || []).map((lesson) => (
                            <button
                              key={lesson.id}
                              disabled={lesson.locked}
                              onClick={() => setActiveLesson(lesson)}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${lesson.locked ? 'opacity-40 cursor-not-allowed border-transparent' : 'cursor-pointer'
                                } ${activeLesson && activeLesson.id === lesson.id
                                  ? 'bg-primary/5 border-primary text-primary font-bold'
                                  : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                                }`}
                            >
                              {lesson.completed ? (
                                <span className="material-symbols-outlined text-tertiary fill shrink-0 text-[16px]">check_circle</span>
                              ) : lesson.locked ? (
                                <span className="material-symbols-outlined text-outline shrink-0 text-[16px]">lock</span>
                              ) : (
                                <span className="material-symbols-outlined text-primary shrink-0 text-[16px]">play_circle</span>
                              )}
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold truncate leading-none">{lesson.title}</p>
                                <p className="text-[9px] text-outline font-medium mt-1">{lesson.duration ? (lesson.duration.includes(':') ? lesson.duration : `${lesson.duration}:00`) : ''}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- TEST CENTER / PORTAL VIEW -------------------- */}
                {currentPage === 'test-center' && (
                  <div className="space-y-6 animate-fade-in">
                    <header className="flex flex-col gap-1">
                      <h1 className="font-outfit text-2xl font-bold text-on-surface">Imtihonlar Markazi</h1>
                      <p className="text-xs text-outline font-medium">Barcha onlayn testlar va diagnostik imtihonlar ro'yxati.</p>
                    </header>

                    {/* Portal Stats Bento */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1 shadow-xs">
                        <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Mavjud Testlar</span>
                        <div className="font-outfit text-xl font-bold text-on-surface">{tests.length} ta</div>
                      </div>
                      <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1 shadow-xs">
                        <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Tugallangan testlar</span>
                        <div className="font-outfit text-xl font-bold text-tertiary">{quizResult ? '1 ta' : '0 ta'}</div>
                      </div>
                      <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1 shadow-xs">
                        <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Oxirgi Ball</span>
                        <div className="font-outfit text-xl font-bold text-secondary">{quizResult ? `${quizResult.score}%` : '—'}</div>
                      </div>
                      <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1 shadow-xs">
                        <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Sertifikatlar</span>
                        <div className="font-outfit text-xl font-bold text-primary">{quizResult && quizResult.score >= 70 ? '1 ta' : '0 ta'}</div>
                      </div>
                    </div>

                    {/* Test List Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tests.map((test) => (
                        <div key={test.id} className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs group">
                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-bold text-[9px] uppercase tracking-wider">
                                {test.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${test.difficulty === 'Easy' ? 'bg-tertiary-container text-tertiary' :
                                  test.difficulty === 'Medium' ? 'bg-secondary-container text-secondary' : 'bg-error-container text-error'
                                }`}>
                                {test.difficulty}
                              </span>
                            </div>
                            <h3 className="font-outfit text-base font-bold text-on-surface group-hover:text-primary transition-colors">{test.title}</h3>
                            <p className="text-xs text-outline font-medium line-clamp-3 leading-relaxed">{test.description}</p>

                            <div className="flex items-center gap-4 text-[10px] text-outline font-bold pt-2">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">assignment</span>
                                <span>{test.totalQuestions} ta savol</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">schedule</span>
                                <span>{test.duration} daqiqa</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">verified</span>
                                <span>{test.passingScore}% o'tish</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                            <div className="text-[10px] font-bold text-outline">
                              {quizResult && quizResult.testId === test.id ? (
                                <span className="text-tertiary flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  Bajarildi ({quizResult.score}%)
                                </span>
                              ) : 'Topshirilmagan'}
                            </div>

                            <button
                              onClick={() => handleStartTestFlow(test)}
                              className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Boshlash</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------- TEST START VIEW -------------------- */}
                {currentPage === 'test-start' && (
                  <div className="max-w-2xl mx-auto animate-fade-in">
                    <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden flex flex-col shadow-xs">

                      {/* Banner */}
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-on-primary p-6 text-center space-y-2">
                        <span className="inline-block px-2.5 py-0.5 bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded border border-white/20">
                          {activeQuizTest.category}
                        </span>
                        <h1 className="font-outfit text-xl font-bold">{activeQuizTest.title}</h1>
                        <p className="text-[11px] text-on-primary/80 max-w-md mx-auto leading-relaxed font-medium">
                          {activeQuizTest.description}
                        </p>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-5">
                          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant space-y-2 text-xs font-medium">
                            <h2 className="font-outfit text-xs font-bold text-on-surface flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                              Imtihon Tarkibi & Mavzular
                            </h2>
                            <ul className="text-outline space-y-1 list-disc list-inside">
                              <li>Algebraik funksiyalar va chiziqli tenglamalar.</li>
                              <li>Geometrik shakllar, yuzalar, sferalar, diagonallar.</li>
                              <li>Trigonometrik ayniyatlar va nisbatlar.</li>
                              <li>Ehtimollar nazariyasi, mediana va dispersiya.</li>
                              <li>Murakkab integrallar va hosila olish qoidalari.</li>
                            </ul>
                          </div>

                          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant space-y-3">
                            <h2 className="font-outfit text-xs font-bold text-on-surface flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                              Tizim Qoidalari & Shartlari
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-tertiary text-[18px]">calculate</span>
                                <span className="text-on-surface">Scientific Kalkulyator mavjud</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-error text-[18px]">lock</span>
                                <span className="text-on-surface">Tab o'zgartirish taqiqlanadi</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary start panel */}
                        <div className="flex flex-col justify-between gap-4">
                          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant flex flex-col gap-2 text-xs font-medium">
                            <div className="flex justify-between items-center">
                              <span className="text-outline">Savollar soni:</span>
                              <span className="font-bold text-on-surface">{activeQuizTest.questions?.length || activeQuizTest.questionCount || 0} ta</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-outline">Ajratilgan vaqt:</span>
                              <span className="font-bold text-on-surface">{activeQuizTest.duration} daqiqa</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-outline">O'tish bali:</span>
                              <span className="font-bold text-tertiary">{activeQuizTest.passingPercentage || activeQuizTest.passingScore || 70}%</span>
                            </div>
                          </div>

                          <button
                            onClick={handleResetQuiz}
                            className="w-full bg-primary text-on-primary font-semibold text-xs py-3 rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-sm text-center"
                          >
                            Imtihonni Boshlash
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- TEST INTERFACE VIEW -------------------- */}
                {currentPage === 'test-interface' && (
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in relative ${activeQuizTest?.preventCopyPaste ? 'select-none' : ''}`}
                    onCopy={activeQuizTest?.preventCopyPaste ? (e) => { e.preventDefault(); alert("Diqqat! Test savollaridan nusxa ko'chirish taqiqlangan."); } : undefined}
                    onPaste={activeQuizTest?.preventCopyPaste ? (e) => { e.preventDefault(); } : undefined}
                  >

                    {/* Left Sidebar 30-Question Navigator */}
                    <div className="lg:col-span-3">
                      <div className="bg-surface rounded-xl p-4 border border-outline-variant flex flex-col gap-4 shadow-xs sticky top-20">
                        <div className="flex justify-between items-center pb-2 border-b border-outline-variant">
                          <h3 className="font-outfit text-xs font-bold text-on-surface">Savollar paneli</h3>
                          <span className="text-[10px] font-bold text-primary">
                            {activeQuestion + 1} / {activeQuizTest.questions.length}
                          </span>
                        </div>

                        {/* Navigator grid of pills */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {activeQuizTest.questions.map((q, idx) => {
                            const isAnswered = quizAnswers[idx] !== undefined;
                            const isCurrent = idx === activeQuestion;
                            const isFlagged = markedForReview.includes(idx);

                            let btnClass = "bg-surface border border-outline-variant text-outline hover:bg-surface-container";
                            if (isAnswered) btnClass = "bg-tertiary/10 border-tertiary/30 text-tertiary font-bold";
                            if (isFlagged) btnClass = "bg-primary/10 border-primary/30 text-primary font-bold";
                            if (isCurrent) btnClass = "bg-primary text-on-primary font-bold border-primary shadow-xs scale-105";

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveQuestion(idx);
                                  if (!visitedQuestions.includes(idx)) {
                                    setVisitedQuestions(prev => [...prev, idx]);
                                  }
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${btnClass}`}
                              >
                                {idx + 1}
                                {isFlagged && <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Coloring Legend */}
                        <div className="p-3 bg-surface-container rounded-xl text-[9px] font-bold space-y-1.5 border border-outline-variant">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-surface border border-outline-variant"></div>
                            <span className="text-outline">Bosh (Unvisited)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-surface-container-high border border-outline-variant"></div>
                            <span className="text-outline">Ko'rilgan (No Answer)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-tertiary/20 border border-tertiary/30"></div>
                            <span className="text-tertiary">Yechilgan (Answered)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/30"></div>
                            <span className="text-primary">Ko'rib chiqish (Flagged)</span>
                          </div>
                        </div>

                        {/* Interactive actions */}
                        <div className="pt-3 border-t border-outline-variant space-y-2">
                          <button
                            onClick={() => handleToggleFlag(activeQuestion)}
                            className="w-full bg-surface-container border border-outline-variant text-outline font-semibold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer hover:text-on-surface"
                          >
                            <span className="material-symbols-outlined text-[14px]">flag</span>
                            {markedForReview.includes(activeQuestion) ? "Belgini olib tashlash" : "Ko'rib chiqish belgisi"}
                          </button>

                          <div className="flex flex-col items-center p-2.5 bg-surface-container rounded-lg border border-outline-variant/50">
                            <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Qolgan vaqt</span>
                            <div className={`flex items-center gap-1 font-outfit text-base font-bold transition-all ${timerSeconds < 300 ? 'text-error animate-pulse text-lg' : 'text-secondary'
                              }`}>
                              <span className="material-symbols-outlined text-[16px]">timer</span>
                              {formatTimer(timerSeconds)}
                            </div>

                            {/* Auto-save light */}
                            <div className="flex items-center gap-1 mt-1 text-[8px] text-tertiary font-bold">
                              <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-ping"></span>
                              <span>Avtomatik saqlandi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Central Question Workspace */}
                    <div className="lg:col-span-9 flex flex-col gap-4">

                      {/* Premium Top Bar */}
                      <div className="bg-surface border border-outline-variant p-4 rounded-xl flex justify-between items-center shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-primary/20">
                            Savol {activeQuestion + 1}
                          </span>
                          <span className="bg-surface-container border border-outline-variant text-outline font-bold text-[9px] uppercase px-1.5 py-0.5 rounded">
                            {activeQuizTest.questions[activeQuestion]?.topic || ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Calculator trigger */}
                          <button
                            onClick={() => setShowCalculator(!showCalculator)}
                            className="bg-secondary-container text-secondary border border-secondary/20 hover:bg-secondary/15 px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">calculate</span>
                            <span>Kalkulyator</span>
                          </button>

                          <button
                            onClick={() => setShowQuizConfirmationModal(true)}
                            className="bg-error text-on-error hover:bg-error/95 px-4 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <span>Imtihonni Yakunlash</span>
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Question Sheet */}
                      <div className="bg-surface rounded-2xl p-6 border border-outline-variant flex flex-col gap-6 shadow-xs min-h-[300px]">

                        {/* Question Text with Live LaTeX parsed values */}
                        <div className="space-y-4">
                          <h2 className="text-[11px] font-bold text-outline uppercase tracking-wider">Masala Sharti:</h2>
                          <div className="font-outfit text-base font-bold text-on-surface leading-relaxed text-left flex flex-wrap items-center gap-1.5">
                            {renderMathContent(activeQuizTest.questions[activeQuestion]?.question || '')}
                          </div>
                          {activeQuizTest.questions[activeQuestion]?.imageUrl && (
                            <div className="mt-4 flex justify-center">
                              <img src={getVideoSrc(activeQuizTest.questions[activeQuestion].imageUrl)} alt="Diagramma" className="max-w-full h-auto rounded-xl border border-outline-variant shadow-sm object-contain" style={{ maxHeight: '300px' }} />
                            </div>
                          )}
                        </div>

                        {/* Interactive Options grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/60">
                          {(activeQuizTest.questions[activeQuestion]?.options || []).map((opt, oIdx) => {
                            const isChecked = quizAnswers[activeQuestion] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectAnswer(activeQuestion, oIdx)}
                                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all quiz-option cursor-pointer group ${isChecked
                                    ? 'bg-primary/5 border-primary text-primary font-bold shadow-xs'
                                    : 'bg-surface border-outline-variant hover:bg-surface-container text-on-surface hover:border-outline'
                                  }`}
                              >
                                <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${isChecked
                                    ? 'bg-primary border-primary text-on-primary'
                                    : 'border-outline-variant text-outline bg-surface-container group-hover:border-outline'
                                  }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className="text-xs font-semibold leading-relaxed">
                                  {renderMathContent(opt)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Quick Navigation */}
                      <div className="bg-surface border border-outline-variant p-4 rounded-xl flex justify-between items-center shadow-xs">
                        <button
                          disabled={activeQuestion === 0}
                          onClick={() => {
                            setActiveQuestion(prev => prev - 1);
                            if (!visitedQuestions.includes(activeQuestion - 1)) {
                              setVisitedQuestions(prev => [...prev, activeQuestion - 1]);
                            }
                          }}
                          className="bg-surface hover:bg-surface-container text-on-surface font-bold text-xs py-2.5 px-4 rounded-lg border border-outline-variant transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[15px]">chevron_left</span> Ortga
                        </button>

                        <div className="text-[10px] text-outline font-bold">
                          Savol {activeQuestion + 1} / {activeQuizTest.questions.length}
                        </div>

                        {activeQuestion === activeQuizTest.questions.length - 1 ? (
                          <button
                            onClick={() => setShowQuizConfirmationModal(true)}
                            className="bg-tertiary text-on-tertiary font-bold text-xs py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Yuborish</span>
                            <span className="material-symbols-outlined text-[15px]">check</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveQuestion(prev => prev + 1);
                              if (!visitedQuestions.includes(activeQuestion + 1)) {
                                setVisitedQuestions(prev => [...prev, activeQuestion + 1]);
                              }
                            }}
                            className="bg-primary text-on-primary font-bold text-xs py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Keyingi</span>
                            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Floating Scientific Calculator Widget */}
                    {showCalculator && (
                      <div className="fixed bottom-6 right-6 w-72 bg-surface/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-outline-variant p-4 shadow-xl z-50 flex flex-col gap-3 animate-fade-in">
                        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/60">
                          <h4 className="font-outfit text-xs font-bold text-on-surface flex items-center gap-1">
                            <span className="material-symbols-outlined text-secondary text-[16px]">calculate</span>
                            Muxandislik Kalkulyatori
                          </h4>
                          <button
                            onClick={() => setShowCalculator(false)}
                            className="w-5 h-5 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>

                        {/* Screen */}
                        <div className="bg-surface-container-high rounded-xl p-3 text-right space-y-1 border border-outline-variant">
                          <div className="text-[10px] text-outline font-bold truncate h-4">{calcInput || '0'}</div>
                          <div className="font-outfit text-lg font-bold text-on-surface truncate h-7">{calcResult || '0'}</div>
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                          {['sin', 'cos', 'tan', 'sqrt', 'log'].map((btn) => (
                            <button
                              key={btn}
                              onClick={() => handleCalcPress(btn)}
                              className="bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 cursor-pointer"
                            >
                              {btn}
                            </button>
                          ))}

                          {['(', ')', 'π', 'C', '='].map((btn) => (
                            <button
                              key={btn}
                              onClick={() => handleCalcPress(btn)}
                              className={`py-2 rounded-lg cursor-pointer ${btn === 'C' ? 'bg-error-container text-error' :
                                  btn === '=' ? 'bg-tertiary text-on-tertiary col-span-2' : 'bg-surface-container hover:bg-surface-container-high'
                                }`}
                            >
                              {btn}
                            </button>
                          ))}

                          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '+'].map((btn) => (
                            <button
                              key={btn}
                              onClick={() => handleCalcPress(btn)}
                              className="bg-surface-container hover:bg-surface-container-high py-2.5 rounded-lg cursor-pointer"
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------- TEST RESULTS VIEW -------------------- */}
                {currentPage === 'test-results' && !quizResult && (
                  <div className="text-center py-12 space-y-4 animate-fade-in">
                    <span className="material-symbols-outlined text-4xl text-outline block">query_stats</span>
                    <h2 className="font-outfit text-lg font-bold text-on-surface">Topshirilgan testlar topilmadi</h2>
                    <p className="text-xs text-outline font-medium">Imtihonlar markazidan testlarni topshiring va sertifikatga ega bo'ling.</p>
                    <button
                      onClick={() => setCurrentPage('test-center')}
                      className="bg-primary text-on-primary font-semibold text-xs py-2 px-5 rounded-lg hover:opacity-90 cursor-pointer"
                    >
                      Testlar bo'limiga o'tish
                    </button>
                  </div>
                )}

                {currentPage === 'test-results' && quizResult && (
                  <div className="space-y-6 animate-fade-in">
                    <header className="text-center space-y-1">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2 shadow-xs">
                        <span className="material-symbols-outlined text-2xl fill">emoji_events</span>
                      </div>
                      <h1 className="font-outfit text-2xl font-bold text-on-surface">Imtihon Natijasi</h1>
                      <p className="text-xs text-outline font-medium">{quizResult.testTitle}</p>
                    </header>

                    {/* Bento Results Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                      {/* Circle Gauge Chart */}
                      <div className="md:col-span-4 bg-surface rounded-2xl border border-outline-variant p-6 flex flex-col items-center justify-center gap-4 shadow-xs text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-surface-container" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path
                              className={quizResult.score >= activeQuizTest.passingScore ? "text-tertiary" : "text-error"}
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${quizResult.score}, 100`}
                              fill="none"
                              strokeLinecap="round"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="font-outfit text-2xl font-bold text-on-surface">{quizResult.score}%</span>
                            <span className="text-[8px] text-outline font-bold uppercase tracking-wider">Umumiy ball</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[9px] font-bold ${quizResult.score >= activeQuizTest.passingScore
                              ? 'bg-tertiary-container border-tertiary/20 text-tertiary'
                              : 'bg-error-container border-error/20 text-error'
                            }`}>
                            <span className="material-symbols-outlined text-[12px]">{quizResult.score >= activeQuizTest.passingScore ? 'verified' : 'cancel'}</span>
                            {quizResult.score >= activeQuizTest.passingScore ? 'MUVAFFAQIYATLI O\'TDI' : 'YIQILDI'}
                          </span>
                        </div>
                      </div>

                      {/* Detail Metrics Bento Card */}
                      <div className="md:col-span-8 grid grid-cols-2 gap-4">
                        <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1.5 shadow-xs">
                          <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                          <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Sarflangan Vaqt</p>
                          <p className="font-outfit text-base font-bold text-on-surface">{quizResult.timeSpent}</p>
                        </div>

                        <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1.5 shadow-xs">
                          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                          <p className="text-[9px] font-bold text-outline uppercase tracking-wider">To'g'ri Javoblar</p>
                          <p className="font-outfit text-base font-bold text-tertiary">{quizResult.correctCount} ta</p>
                        </div>

                        <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1.5 shadow-xs">
                          <span className="material-symbols-outlined text-error text-[20px]">cancel</span>
                          <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Xato Javoblar</p>
                          <p className="font-outfit text-base font-bold text-error">{quizResult.incorrectCount} ta</p>
                        </div>

                        <div className="bg-surface rounded-xl p-4 border border-outline-variant space-y-1.5 shadow-xs">
                          <span className="material-symbols-outlined text-outline text-[20px]">security</span>
                          <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Tab Ogohlantirishlar</p>
                          <p className="font-outfit text-base font-bold text-on-surface">{quizResult.cheatAlerts} marta</p>
                        </div>
                      </div>
                    </div>

                    {/* Domain Category Accuracy Chart */}
                    <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-4 shadow-xs">
                      <h3 className="font-outfit text-sm font-bold text-on-surface">Mavzular bo'yicha o'zlashtirish tahlili</h3>

                      <div className="space-y-3 text-xs font-bold">
                        {['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics'].map((cat) => {
                          const acc = getCategoryAccuracy(cat);
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-on-surface">{cat}</span>
                                <span className="text-primary">{acc}%</span>
                              </div>
                              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${acc >= 80 ? 'bg-tertiary' :
                                      acc >= 50 ? 'bg-secondary' : 'bg-error'
                                    }`}
                                  style={{ width: `${acc}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Results Actions */}
                    <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-surface border border-outline-variant rounded-2xl shadow-xs">
                      <button
                        onClick={() => setCurrentPage('test-center')}
                        className="bg-primary text-on-primary font-bold text-xs py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                        Kursga qaytish
                      </button>

                      {quizResult.score >= activeQuizTest.passingScore && (
                        <button
                          onClick={() => setShowCertificate(true)}
                          className="bg-secondary text-on-secondary font-bold text-xs py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1 border border-secondary/20"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Sertifikatni yuklab olish
                        </button>
                      )}

                      <button
                        onClick={handleResetQuiz}
                        className="bg-transparent border border-outline text-outline font-bold text-xs py-2.5 px-6 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Imtihonni qayta topshirish
                      </button>
                    </div>

                    {/* Complete 30-Question Review Panel (Tahlil) */}
                    <div className="space-y-4">
                      <h3 className="font-outfit text-base font-bold text-on-surface">Savollar tahlili va yechimlari</h3>

                      <div className="space-y-4">
                        {activeQuizTest.questions.map((q, qIdx) => {
                          const studentAns = quizResult.answers[qIdx];
                          const isCorrect = studentAns === q.correct;

                          return (
                            <details key={q.id || qIdx} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-xs group">
                              <summary className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors select-none font-bold text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${studentAns === undefined ? 'bg-zinc-200 text-zinc-600' :
                                      isCorrect ? 'bg-tertiary/20 text-tertiary' : 'bg-error/20 text-error'
                                    }`}>
                                    {qIdx + 1}
                                  </span>
                                  <span className="text-on-surface text-left line-clamp-1">{renderMathContent(q.question)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-outline font-bold">
                                  <span>{q.topic}</span>
                                  <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180">expand_more</span>
                                </div>
                              </summary>

                              <div className="p-5 border-t border-outline-variant space-y-4 bg-surface-container-low/30 text-xs">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-outline uppercase tracking-wider text-[9px]">Savol:</h4>
                                  <p className="font-bold text-on-surface leading-relaxed text-left flex items-center flex-wrap gap-1">
                                    {renderMathContent(q.question)}
                                  </p>
                                  {q.imageUrl && (
                                    <div className="mt-3 flex justify-center">
                                      <img src={getVideoSrc(q.imageUrl)} alt="Diagramma" className="max-w-full h-auto rounded-lg border border-outline-variant shadow-sm object-contain" style={{ maxHeight: '200px' }} />
                                    </div>
                                  )}
                                </div>

                                {/* Options list in review */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isChoice = studentAns === oIdx;
                                    const isRight = q.correct === oIdx;

                                    let cardStyle = "border-outline-variant bg-surface text-on-surface";
                                    if (isChoice && !isRight) cardStyle = "border-error/40 bg-error/5 text-error";
                                    if (isRight) cardStyle = "border-tertiary/40 bg-tertiary/5 text-tertiary font-bold";

                                    return (
                                      <div key={oIdx} className={`p-3 rounded-lg border flex items-center gap-2.5 ${cardStyle}`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${isRight ? 'bg-tertiary text-on-tertiary border-tertiary' :
                                            isChoice ? 'bg-error text-on-error border-error' : 'bg-surface-container text-outline border-outline-variant'
                                          }`}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <span>{renderMathContent(opt)}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Step-by-step math explanation */}
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-3 space-y-2 text-left">
                                  <h4 className="font-outfit text-xs font-bold text-primary flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                                    Mukammal Masala Yechimi:
                                  </h4>
                                  <div className="text-on-surface leading-relaxed font-semibold font-serif italic text-xs whitespace-pre-line flex flex-wrap items-center gap-1.5">
                                    {renderMathContent(q.explanation)}
                                  </div>
                                </div>
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}



                {/* -------------------- PROFILE / SETTINGS VIEW -------------------- */}
                {currentPage === 'profile' && (
                  <div className="space-y-6 animate-fade-in relative">
                    {/* Top slide-down alert for missing phone */}
                    <div className={`absolute top-0 left-0 right-0 z-10 transition-all duration-500 ease-in-out ${showProfileAlert ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
                      <div className="bg-rose-500 text-white px-4 py-3 rounded-xl shadow-lg flex justify-between items-center mx-auto max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">warning</span>
                          <span className="text-xs font-bold">Iltimos, profil ma'lumotlaringizni (telefon raqamingizni) to'liq kiriting.</span>
                        </div>
                        <button onClick={() => setShowProfileAlert(false)} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          OK
                        </button>
                      </div>
                    </div>

                    <header className={showProfileAlert ? 'mt-14 transition-all duration-500' : 'transition-all duration-500'}>
                      <h1 className="font-outfit text-2xl font-bold text-on-surface">Shaxsiy Sozlamalar</h1>
                      <p className="text-xs text-outline font-medium">Akkaunt ma'lumotlarini boshqarish.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <section className="md:col-span-8 bg-surface border border-outline-variant p-6 rounded-xl space-y-6 shadow-xs">
                        <h2 className="font-outfit text-sm font-bold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                          Profilni tahrirlash
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="relative group cursor-pointer w-16 h-16">
                            <img alt="Avatar" className="w-16 h-16 rounded-full border border-outline-variant object-cover" src={getVideoSrc(profile.avatar)} />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-white text-[18px]">edit</span>
                            </div>
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </div>

                          <form className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-outline">Ismingiz</label>
                              <input
                                className="h-10 px-3 bg-surface-container rounded-lg border border-outline-variant text-xs font-medium focus:border-primary focus:outline-none text-on-surface"
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-outline">Familiyangiz</label>
                              <input
                                className="h-10 px-3 bg-surface-container rounded-lg border border-outline-variant text-xs font-medium focus:border-primary focus:outline-none text-on-surface"
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <label className="text-outline">Elektron pochta manzili</label>
                              <input
                                className="h-10 px-3 bg-surface-container/50 rounded-lg border border-outline-variant text-xs font-medium text-outline cursor-not-allowed focus:outline-none"
                                type="email"
                                value={profile.email}
                                readOnly
                                disabled
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <label className="text-outline">Telefon raqami <span className="text-rose-500">*</span></label>
                              <input
                                className="h-10 px-3 bg-surface-container rounded-lg border border-outline-variant text-xs font-bold focus:border-primary focus:outline-none text-on-surface"
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                required
                                value={profile.phone}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/[^\d+]/g, '');
                                  if (!val.startsWith('+')) {
                                    val = '+' + val.replace(/\+/g, '');
                                  }
                                  const cleaned = val.replace(/\D/g, '').substring(0, 12);
                                  let formatted = '+';
                                  if (cleaned.length > 0) formatted += cleaned.substring(0, 3);
                                  if (cleaned.length > 3) formatted += ' ' + cleaned.substring(3, 5);
                                  if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 8);
                                  if (cleaned.length > 8) formatted += ' ' + cleaned.substring(8, 10);
                                  if (cleaned.length > 10) formatted += ' ' + cleaned.substring(10, 12);
                                  if (cleaned.length === 0) formatted = '';
                                  setProfile({ ...profile, phone: formatted });
                                }}
                              />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                              <button
                                onClick={(e) => {
                                  if (!profile.phone || profile.phone.length < 17) {
                                    e.preventDefault();
                                    setShowProfileAlert(true);
                                    return;
                                  }
                                  handleProfileSave(e);
                                }}
                                className="bg-primary text-on-primary font-semibold text-xs py-2 px-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                                type="button"
                              >
                                Saqlash
                              </button>
                            </div>
                          </form>
                        </div>
                      </section>

                      <div className="md:col-span-4 flex flex-col gap-6">
                        <section className="bg-surface border border-outline-variant p-5 rounded-xl space-y-4 shadow-xs">
                          <h2 className="font-outfit text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-tertiary text-[18px]">palette</span>
                            Interfeys rejimi
                          </h2>
                          <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/60">
                            <span className="text-[11px] font-bold text-on-surface">Tungi rejim (Dark Mode)</span>

                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                className="sr-only peer"
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                              />
                              <div className="w-9 h-5 bg-outline-variant/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border-2 border-transparent"></div>
                            </label>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </main>
          </div>
        </div>
      )}

      {/* -------------------- CONFIRM SUBMIT MODAL -------------------- */}
      {showQuizConfirmationModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-error-container text-error rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-base font-bold text-on-surface">Imtihonni yakunlaysizmi?</h3>
              <p className="text-xs text-outline leading-relaxed font-medium">
                Siz {Object.keys(quizAnswers).length} ta savolga javob berdingiz ({activeQuizTest.questions.length - Object.keys(quizAnswers).length} ta qoldi).
                Ushbu qarorni ortga qaytarib bo'lmaydi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-semibold text-xs pt-2">
              <button
                onClick={() => setShowQuizConfirmationModal(false)}
                className="bg-surface-container border border-outline-variant text-outline py-2.5 rounded-lg hover:text-on-surface cursor-pointer"
              >
                Yo'q, qaytish
              </button>

              <button
                onClick={handleSubmitTest}
                className="bg-primary text-on-primary py-2.5 rounded-lg hover:opacity-95 cursor-pointer shadow-xs"
              >
                Ha, yakunlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PREMIUM ACADEMIC CERTIFICATE MODAL -------------------- */}
      {showCertificate && quizResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white text-zinc-900 rounded-3xl p-8 max-w-2xl w-full border-[10px] border-double border-amber-600/30 shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden bg-cover bg-center">

            {/* Elegant Background Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center font-bold text-[180px] font-serif text-amber-900">
              ∫
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/40"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/40"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/40"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/40"></div>

            {/* Certificate Header */}
            <div className="space-y-1 z-10">
              <div className="text-amber-700 font-bold uppercase tracking-[0.25em] text-[10px] font-outfit">MathScore Online LMS</div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-800">MUVAFFAQIYAT SERTIFIKATI</h2>
              <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2"></div>
            </div>

            {/* Certificate Main Text */}
            <div className="space-y-4 z-10 max-w-md">
              <p className="font-serif italic text-zinc-500 text-xs">Ushbu hujjat mamnuniyat bilan topshiriladi:</p>

              <h3 className="font-outfit text-xl font-black text-amber-800 border-b border-amber-200 pb-1 px-4 inline-block tracking-wide">
                {profile.firstName} {profile.lastName}
              </h3>

              <p className="text-xs text-zinc-600 leading-relaxed font-serif font-medium">
                talabaning <strong>{quizResult.testTitle}</strong> bo'limidagi barcha murakkab algebraic va geometrik hisob-kitoblar hamda test sinovlaridan muvaffaqiyatli o'tganligini va <strong>{quizResult.score}%</strong> yuqori ko'rsatkich qayd etganligini tasdiqlaydi.
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="w-full grid grid-cols-3 items-end pt-6 z-10 text-[10px] font-bold">

              {/* Left Sign */}
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-zinc-400 text-xs block h-6">Malika Opa</span>
                <div className="w-20 border-t border-zinc-300 mt-1"></div>
                <span className="text-zinc-400 uppercase text-[8px] tracking-wider mt-1 block">Bosh O'qituvchi</span>
              </div>

              {/* Gold Medal Seal */}
              <div className="flex justify-center">
                <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-md border-4 border-amber-300 animate-spin-slow">
                  <div className="absolute inset-2 border border-dashed border-white/40 rounded-full"></div>
                  <span className="material-symbols-outlined text-[26px] text-white fill">verified</span>
                </div>
              </div>

              {/* Right Date */}
              <div className="flex flex-col items-center">
                <span className="text-zinc-800 block h-6 font-medium leading-loose">18-May, 2026</span>
                <div className="w-20 border-t border-zinc-300 mt-1"></div>
                <span className="text-zinc-400 uppercase text-[8px] tracking-wider mt-1 block">Berilgan Sana</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex gap-3 z-10 text-xs font-semibold">
              <button
                onClick={() => { window.print(); }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                Chop etish
              </button>

              <button
                onClick={() => setShowCertificate(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-5 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
