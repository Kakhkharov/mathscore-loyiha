import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// 8 ta tayyor sifatli vektorli geometrik va matematik diagrammalar shablonlari
export const MATH_TEMPLATES = [
  {
    id: 'cartesian',
    name: 'Koordinatalar tekisligi (X-Y)',
    category: 'Algebra & Funksiyalar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:#ffffff;"><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="1"/></pattern></defs><rect width="400" height="300" fill="url(#grid)" /><line x1="20" y1="150" x2="380" y2="150" stroke="#1e293b" stroke-width="2.5" /><line x1="200" y1="280" x2="200" y2="20" stroke="#1e293b" stroke-width="2.5" /><polygon points="380,150 370,145 370,155" fill="#1e293b" /><polygon points="200,20 195,30 205,30" fill="#1e293b" /><text x="385" y="165" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">x</text><text x="210" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">y</text><text x="185" y="168" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b">O</text><circle cx="200" cy="150" r="3" fill="#1e293b"/><text x="245" y="166" font-size="10" font-family="sans-serif" fill="#64748b">2</text><text x="295" y="166" font-size="10" font-family="sans-serif" fill="#64748b">4</text><text x="145" y="166" font-size="10" font-family="sans-serif" fill="#64748b">-2</text><text x="95" y="166" font-size="10" font-family="sans-serif" fill="#64748b">-4</text><text x="180" y="104" font-size="10" font-family="sans-serif" fill="#64748b">2</text><text x="180" y="54" font-size="10" font-family="sans-serif" fill="#64748b">4</text></svg>`
  },
  {
    id: 'right_triangle',
    name: "To'g'ri burchakli uchburchak (Pifagor)",
    category: 'Geometriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><polygon points="80,220 320,220 80,60" fill="#eff6ff" stroke="#2563eb" stroke-width="3" /><polyline points="80,195 105,195 105,220" fill="none" stroke="#dc2626" stroke-width="2" /><circle cx="92" cy="207" r="2" fill="#dc2626" /><text x="60" y="235" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e293b">C</text><text x="330" y="235" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e293b">B</text><text x="65" y="55" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e293b">A</text><text x="50" y="145" font-family="sans-serif" font-size="15" font-weight="bold" fill="#2563eb">b</text><text x="195" y="242" font-family="sans-serif" font-size="15" font-weight="bold" fill="#2563eb">a</text><text x="210" y="130" font-family="sans-serif" font-size="16" font-weight="bold" fill="#dc2626">c</text><text x="140" y="30" font-family="sans-serif" font-size="13" font-style="italic" font-weight="bold" fill="#64748b">a² + b² = c²</text></svg>`
  },
  {
    id: 'circle_radius',
    name: 'Aylana va Radius (Sektor)',
    category: 'Planimetriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><circle cx="200" cy="140" r="100" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5" /><line x1="200" y1="140" x2="300" y2="140" stroke="#2563eb" stroke-width="2.5" /><line x1="200" y1="140" x2="270" y2="69" stroke="#2563eb" stroke-width="2.5" /><circle cx="200" cy="140" r="4" fill="#1e293b" /><path d="M 235 140 A 35 35 0 0 0 225 115" fill="none" stroke="#dc2626" stroke-width="2" /><text x="180" y="148" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e293b">O</text><text x="245" y="160" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2563eb">r</text><text x="240" y="128" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626">α</text><text x="308" y="145" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">A</text><text x="278" y="65" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">B</text></svg>`
  },
  {
    id: 'parabola',
    name: 'Parabola funksiyasi (Kvadratik)',
    category: 'Funksiyalar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><line x1="40" y1="180" x2="360" y2="180" stroke="#94a3b8" stroke-width="2" /><line x1="200" y1="260" x2="200" y2="20" stroke="#94a3b8" stroke-width="2" /><text x="365" y="185" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b">x</text><text x="205" y="25" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b">y</text><path d="M 80 40 Q 200 260 320 40" fill="none" stroke="#2563eb" stroke-width="3" /><circle cx="200" cy="205" r="4" fill="#dc2626" /><text x="210" y="215" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626">V(h, k)</text><text x="130" y="35" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2563eb">y = ax² + bx + c</text></svg>`
  },
  {
    id: 'sine_wave',
    name: "Trigonometrik to'lqin y = sin(x)",
    category: 'Trigonometriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><line x1="30" y1="140" x2="370" y2="140" stroke="#64748b" stroke-width="2" /><line x1="60" y1="260" x2="60" y2="20" stroke="#64748b" stroke-width="2" /><path d="M 60 140 Q 120 40 180 140 T 300 140 T 370 200" fill="none" stroke="#7c3aed" stroke-width="3" /><text x="375" y="145" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b">x</text><text x="65" y="25" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b">y</text><text x="175" y="160" font-family="sans-serif" font-size="11" fill="#64748b">π</text><text x="290" y="160" font-family="sans-serif" font-size="11" fill="#64748b">2π</text><text x="35" y="90" font-family="sans-serif" font-size="11" fill="#64748b">1</text><text x="30" y="195" font-family="sans-serif" font-size="11" fill="#64748b">-1</text><text x="140" y="35" font-family="sans-serif" font-size="13" font-weight="bold" fill="#7c3aed">y = sin(x)</text></svg>`
  },
  {
    id: 'equilateral_triangle',
    name: 'Teng tomonli uchburchak va Balandlik',
    category: 'Geometriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><polygon points="200,40 320,230 80,230" fill="#f0fdf4" stroke="#16a34a" stroke-width="3" /><line x1="200" y1="40" x2="200" y2="230" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="4,4" /><text x="195" y="30" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e293b">A</text><text x="65" y="245" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e293b">B</text><text x="325" y="245" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e293b">C</text><text x="205" y="140" font-family="sans-serif" font-size="13" font-weight="bold" fill="#16a34a">h</text><text x="195" y="250" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">a</text><text x="120" y="130" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">a</text><text x="270" y="130" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">a</text></svg>`
  },
  {
    id: 'trapezoid',
    name: 'Trapetsiya va Balandlik',
    category: 'Geometriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><polygon points="120,70 280,70 340,220 60,220" fill="#fffbeb" stroke="#d97706" stroke-width="3" /><line x1="120" y1="70" x2="120" y2="220" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,4" /><polyline points="120,200 138,200 138,220" fill="none" stroke="#dc2626" stroke-width="1.5" /><text x="195" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="#d97706">b (kichik asos)</text><text x="190" y="245" font-family="sans-serif" font-size="14" font-weight="bold" fill="#d97706">a (katta asos)</text><text x="100" y="145" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626">h</text><text x="130" y="30" font-family="sans-serif" font-size="12" font-style="italic" fill="#64748b">S = (a + b) / 2 · h</text></svg>`
  },
  {
    id: 'cube_3d',
    name: 'Fazoviy Shakl: Kub (3D)',
    category: 'Stereometriya',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" style="background:#ffffff;"><polygon points="100,100 220,100 220,220 100,220" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" /><line x1="100" y1="100" x2="160" y2="50" stroke="#0284c7" stroke-width="2.5" /><line x1="220" y1="100" x2="280" y2="50" stroke="#0284c7" stroke-width="2.5" /><line x1="220" y1="220" x2="280" y2="170" stroke="#0284c7" stroke-width="2.5" /><line x1="160" y1="50" x2="280" y2="50" stroke="#0284c7" stroke-width="2.5" /><line x1="280" y1="50" x2="280" y2="170" stroke="#0284c7" stroke-width="2.5" /><line x1="100" y1="220" x2="160" y2="170" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,4" /><line x1="160" y1="50" x2="160" y2="170" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,4" /><line x1="160" y1="170" x2="280" y2="170" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,4" /><text x="155" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284c7">a</text><text x="230" y="160" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284c7">a</text><text x="255" y="80" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284c7">a</text><text x="140" y="25" font-family="sans-serif" font-size="12" font-style="italic" fill="#64748b">V = a³,  S = 6a²</text></svg>`
  }
];

// Interaktiv Chizish Doskasi Modali
export function SketchDrawerModal({ onClose, onSave }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [isGrid, setIsGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isGrid) {
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 20; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 20; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [isGrid]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e) => {
    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isGrid) {
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 20; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 20; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 flex flex-col animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500 text-[20px]">draw</span>
            <h3 className="font-black text-sm text-slate-800 dark:text-white">Interaktiv Chizish Doskasi (Matematik Diagramma)</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs border border-slate-200/60 dark:border-slate-700">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${tool === 'pen' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[15px]">edit</span> Qalam
            </button>
            <button
              type="button"
              onClick={() => setTool('line')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${tool === 'line' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[15px]">straighten</span> Chiziq
            </button>
            <button
              type="button"
              onClick={() => setTool('rect')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${tool === 'rect' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[15px]">crop_square</span> To'rtburchak
            </button>
            <button
              type="button"
              onClick={() => setTool('circle')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${tool === 'circle' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[15px]">radio_button_unchecked</span> Aylana
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[15px]">ink_eraser</span> O'chirg'ich
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {['#1e293b', '#2563eb', '#dc2626', '#16a34a', '#7c3aed'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${color === c ? 'scale-125 border-white ring-2 ring-indigo-500 shadow-xs' : 'border-transparent'}`}
                title={c}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsGrid(!isGrid)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${isGrid ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {isGrid ? '✓ Katakli' : 'Bo\'sh fon'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
            >
              Tozalash
            </button>
          </div>
        </div>

        <div className="relative border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-inner flex justify-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={360}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="cursor-crosshair w-full max-h-[360px] object-contain touch-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-400">Sichqoncha bilan chizing yoki burchaklarni belgilang</span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Diagrammani biriktirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Asosiy Diagramma va Chizmalar Studiyasi Komponenti
export default function MathDiagramStudio({
  imageUrl,
  onImageChange,
  apiBase = 'http://localhost:5000',
  getAuthMediaUrl = (url) => url,
  questionNumber = 1,
  isActiveTab = true
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showShapesModal, setShowShapesModal] = useState(false);
  const [showSketch, setShowSketch] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Rasmni xavfsiz va samarali qayta ishlash (Server API + Base64 zaxirasi)
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Xatolik: Faqat rasm fayllari qabul qilinadi (PNG, JPG, WebP, SVG)!");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Xatolik: Rasm hajmi 20 MB dan oshmasligi kerak!");
      return;
    }

    // Serverga yuklashga urinish
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onImageChange(data.url);
          showToast("✓ Diagramma serverga muvaffaqiyatli yuklandi!");
          return;
        }
      }
    } catch (e) {
      console.warn("Serverga yuklashda xatolik, Base64 rejimiga o'tildi:", e);
    }

    // Server offline bo'lsa ham Base64 orqali darhol saqlash
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange(event.target.result);
      showToast("✓ Diagramma muvaffaqiyatli biriktirildi!");
    };
    reader.readAsDataURL(file);
  };

  // Kompyuterdan fayl tanlash
  const handleFileSelect = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg, image/webp, image/svg+xml';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) processImageFile(file);
    };
    fileInput.click();
  };

  // O'zgacha samarali usul: Butun oynadan Ctrl+V orqali screenshotlarni ushlab olish
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isActiveTab) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            showToast("✓ Rasm buferdan (Ctrl+V) muvaffaqiyatli qo'yildi!");
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isActiveTab, questionNumber]);

  return (
    <div className="space-y-3">
      {/* Sarlavha va Tezkor Tugmalar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">architecture</span>
            Geometriya chizmasi yoki Matematik diagramma yuklash
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Kompyuterdan, buferdan (Ctrl+V), tayyor shablonlardan yoki doskada chizib biriktiring
          </span>
        </div>

        {/* Tezkor vositalar paneli */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowShapesModal(true)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="8 ta tayyor geometrik va algebraik shablonlar"
          >
            <span className="material-symbols-outlined text-[15px]">shapes</span>
            <span>Shablonlar (8 ta)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSketch(true)}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Interaktiv doskada o'zingiz chizing"
          >
            <span className="material-symbols-outlined text-[15px]">draw</span>
            <span>Doskada chizish</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlModal(true)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Rasm URL havolasi orqali qo'yish"
          >
            <span className="material-symbols-outlined text-[15px]">link</span>
            <span>Havola (URL)</span>
          </button>
        </div>
      </div>

      {/* Rasm mavjud bo'lgandagi ko'rinish */}
      {imageUrl ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              onClick={() => setShowZoomModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Kattalashtirib ko'rish"
            >
              <img
                src={getAuthMediaUrl(imageUrl)}
                className="w-32 h-24 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 shadow-xs group-hover:scale-105 transition-transform"
                alt="Savol diagrammasi"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity">
                <span className="material-symbols-outlined text-[22px]">zoom_in</span>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Diagramma faol
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-xs">
                {imageUrl.startsWith('data:image/svg')
                  ? 'Matematik SVG shablon'
                  : imageUrl.startsWith('data:image/png')
                  ? 'Chizilgan / Buferdan olingan rasm'
                  : (imageUrl.split('/').pop() || 'diagramma.png')}
              </p>
              <p className="text-[10px] text-slate-400">
                O'quvchi test yechishida ushbu chizma savol matni ostida to'liq aks etadi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowZoomModal(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              Kattalashtirish
            </button>
            <button
              type="button"
              onClick={handleFileSelect}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">replay</span>
              Almashtirish
            </button>
            <button
              type="button"
              onClick={() => {
                onImageChange('');
                showToast("Rasm o'chirildi.");
              }}
              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              title="Diagrammani o'chirish"
            >
              <span className="material-symbols-outlined text-[17px]">delete</span>
            </button>
          </div>
        </div>
      ) : (
        /* Rasm yuklash maydoni: Drag & Drop, Click, Paste */
        <div
          onClick={handleFileSelect}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processImageFile(e.dataTransfer.files[0]);
            }
          }}
          className={`p-7 rounded-2xl text-center cursor-pointer transition-all border-2 border-dashed ${
            isDragging
              ? 'bg-indigo-50/80 border-indigo-600 ring-4 ring-indigo-500/20 scale-[1.01]'
              : 'bg-white/40 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2.5 shadow-2xs">
            <span className="material-symbols-outlined text-2xl">
              {isDragging ? 'download' : 'add_photo_alternate'}
            </span>
          </div>
          <p className="text-xs font-black text-slate-800 dark:text-white">
            {isDragging ? "Rasmni tashlang..." : "Rasm yuklash / Sudrab tashlash"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Geometrik shakllar, funksiya grafiklari yoki diagrammalar (JPG, PNG, WebP)
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
            <span className="material-symbols-outlined text-[13px]">content_paste</span>
            <span>Tezkor usul: Win+Shift+S bilan rasm olib, to'g'ridan-to'g'ri Ctrl+V ni bosing!</span>
          </div>
        </div>
      )}

      {/* ==================== 1. TAYYOR SHABLONLAR MODALI ==================== */}
      {showShapesModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in" onClick={() => setShowShapesModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">shapes</span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800 dark:text-white">Tayyor Matematik & Geometrik Shablonlar (8 ta)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Kerakli chizmani bosing, u bir zumda sifatli SVG shaklida savolga biriktiriladi</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowShapesModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MATH_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tmpl.svg);
                    onImageChange(dataUrl);
                    setShowShapesModal(false);
                    showToast(`✓ "${tmpl.name}" diagrammasi biriktirildi!`);
                  }}
                  className="group p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div className="h-36 w-full bg-white rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none" dangerouslySetInnerHTML={{ __html: tmpl.svg }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider block truncate">{tmpl.category}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate" title={tmpl.name}>{tmpl.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold group-hover:bg-indigo-700 transition-colors shrink-0">Tanlash</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== 2. INTERAKTIV CHIZISH DOSKASI ==================== */}
      {showSketch && createPortal(
        <SketchDrawerModal
          onClose={() => setShowSketch(false)}
          onSave={(dataUrl) => {
            onImageChange(dataUrl);
            setShowSketch(false);
            showToast("✓ Chizilgan diagramma muvaffaqiyatli biriktirildi!");
          }}
        />,
        document.body
      )}

      {/* ==================== 3. RASM HAVOLASI (URL) MODALI ==================== */}
      {showUrlModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowUrlModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[20px]">link</span>
                Rasm havolasini kiritish (URL)
              </h3>
              <button type="button" onClick={() => setShowUrlModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Internetdagi istalgan to'g'ridan-to'g'ri rasm havolasini (JPG, PNG, WebP) kiriting:
            </p>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/math-diagram.png"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-hidden focus:border-indigo-500 text-slate-800 dark:text-white"
            />
            {urlInput && (
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                <img src={urlInput} alt="Preview" className="max-h-36 mx-auto rounded-lg object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowUrlModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!urlInput.trim()) return alert("Iltimos, to'g'ri rasm havolasini kiriting!");
                  onImageChange(urlInput.trim());
                  setShowUrlModal(false);
                  setUrlInput('');
                  showToast("✓ Rasm havolasi muvaffaqiyatli biriktirildi!");
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Biriktirish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== 4. DIAGRAMMA ZOOM PREVIEW MODALI ==================== */}
      {showZoomModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowZoomModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">visibility</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Savol #{questionNumber} Diagrammasi (Kattalashtirilgan ko'rinish)</span>
              </div>
              <button type="button" onClick={() => setShowZoomModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-[75vh] w-full flex items-center justify-center p-2 overflow-auto">
              <img src={getAuthMediaUrl(imageUrl)} alt="Kattalashtirilgan diagramma" className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-inner bg-white p-2" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== 5. TOAST XABARNOMASI ==================== */}
      {toastMessage && createPortal(
        <div className="fixed top-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs animate-bounce-in border border-emerald-400/40">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>,
        document.body
      )}
    </div>
  );
}
