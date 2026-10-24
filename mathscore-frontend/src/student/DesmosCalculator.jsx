import React, { useState } from 'react';

export default function DesmosCalculator({ isOpen, onClose, viewMode = 'floating', onToggleMode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('calc'); // 'calc' | 'presets'

  if (!isOpen) return null;

  // Preset formulalar yo'riqnomasi A/AS-Level uchun
  const mathPresets = [
    { name: 'Kvadratik funksiya', formula: 'y = a*x^2 + b*x + c', desc: 'Parabola va uning simmetriya o\'qi' },
    { name: 'Trigonometrik to\'lqin', formula: 'y = a*sin(b*x - c) + d', desc: 'Amplituda, davr va fazalar' },
    { name: 'Ko\'rsatkichli funksiya', formula: 'y = a*e^(k*x)', desc: 'O\'sish va so\'nish jarayonlari' },
    { name: 'Doira tenglamasi', formula: '(x - h)^2 + (y - k)^2 = r^2', desc: 'Markaz (h, k) va radius r' },
    { name: 'Hosila / Tangens chizig\'i', formula: 'f(x) = x^3 - 3x; g(x) = f\'(x)', desc: 'Ekstremum nuqtalarini topish' },
    { name: 'Integrallash sohasi', formula: '0 <= y <= sin(x) {0 <= x <= pi}', desc: 'Egri chiziqli trapetsiya yuzi' }
  ];

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl border-2 border-white dark:border-slate-800 font-bold text-xs cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">calculate</span>
          <span>Desmos Graphing Lab</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    );
  }

  // Split-screen rejimida (dars ko'rish vaqtida yonma-yon integratsiya)
  if (viewMode === 'split') {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-lg animate-fade-in">
        {/* Desmos Split Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
            <span className="font-outfit font-bold text-xs text-on-surface">
              Desmos Graphing Calculator — A & AS Level
            </span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-mono font-bold uppercase">
              Live Interactive
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleMode && onToggleMode('floating')}
              className="p-1 rounded-md hover:bg-surface-container-high text-outline hover:text-on-surface"
              title="Suzuvchi rejimga o'tkazish"
            >
              <span className="material-symbols-outlined text-[16px]">picture_in_picture_alt</span>
            </button>
            <button
              onClick={() => onToggleMode && onToggleMode('fullscreen')}
              className="p-1 rounded-md hover:bg-surface-container-high text-outline hover:text-on-surface"
              title="To'liq ekranga yoyish"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-error-container text-outline hover:text-error"
              title="Yopish"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Embedded Desmos Iframe */}
        <div className="flex-1 w-full relative bg-white">
          <iframe
            src="https://www.desmos.com/calculator?lang=ru"
            title="Desmos Graphing Calculator"
            className="w-full h-full border-0"
            allow="clipboard-write; fullscreen"
          />
        </div>
      </div>
    );
  }

  // Fullscreen rejimida
  if (viewMode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col p-4 animate-fade-in">
        <div className="bg-surface rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl border border-outline-variant">
          <div className="flex items-center justify-between px-5 py-3 bg-surface-container border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">ssid_chart</span>
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-on-surface">
                  Cambridge A/AS Level Desmos Graphing Lab
                </h3>
                <p className="text-[10px] text-outline">
                  Matematik funksiyalar, hosilalar va integrallarni vizual tahlil qilish tizimi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleMode && onToggleMode('floating')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high text-outline hover:text-on-surface text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">fullscreen_exit</span>
                <span>Kichraytirish</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-error-container text-error hover:opacity-80 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-white">
            <iframe
              src="https://www.desmos.com/calculator?lang=ru"
              title="Desmos Graphing Calculator Fullscreen"
              className="w-full h-full border-0"
              allow="clipboard-write; fullscreen"
            />
          </div>
        </div>
      </div>
    );
  }

  // Standart Floating Rejim (O'ng pastda suzuvchi professional dock)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[480px] sm:w-[560px] h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] bg-surface dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden animate-scale-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container dark:bg-zinc-800 border-b border-outline-variant select-none cursor-move">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-[20px]">query_stats</span>
          <span className="font-outfit font-bold text-xs text-on-surface">
            Desmos Graphing Lab
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[9px] font-mono font-bold">
            A/AS Level
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1">
          <div className="flex bg-surface-container-high dark:bg-zinc-700/60 rounded-lg p-0.5 text-[10px] font-bold mr-1">
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-2 py-0.5 rounded ${activeTab === 'calc' ? 'bg-primary text-on-primary' : 'text-outline hover:text-on-surface'}`}
            >
              Kalkulyator
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-2 py-0.5 rounded ${activeTab === 'presets' ? 'bg-primary text-on-primary' : 'text-outline hover:text-on-surface'}`}
            >
              Formulalar
            </button>
          </div>

          <button
            onClick={() => onToggleMode && onToggleMode('fullscreen')}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
            title="To'liq ekranga yoyish"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
            title="Pastga yig'ish (Minimize)"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-error-container text-outline hover:text-error"
            title="Yopish"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Desmos Calculator Iframe */}
      {activeTab === 'calc' ? (
        <div className="flex-1 w-full relative bg-white">
          <iframe
            src="https://www.desmos.com/calculator?lang=ru"
            title="Desmos Graphing Calculator"
            className="w-full h-full border-0"
            allow="clipboard-write; fullscreen"
          />
        </div>
      ) : (
        /* Tab 2: A/AS Level Quick Formula Cheatsheet */
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low">
          <h4 className="font-outfit text-xs font-bold text-on-surface">
            A-Level va AS-Level Uchun Tayyor Matematik Shabonlar
          </h4>
          <p className="text-[11px] text-outline leading-relaxed">
            Quyidagi formulalarni nusxalab olib, Desmos kalkulyatoriga kiriting va slayderlar yordamida parametrlar harakatini ko'ring:
          </p>

          <div className="space-y-2">
            {mathPresets.map((p, idx) => (
              <div key={idx} className="p-3 bg-surface rounded-xl border border-outline-variant space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">{p.name}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(p.formula);
                      alert(`Nusxalandi: ${p.formula}`);
                    }}
                    className="text-[10px] text-outline hover:text-primary flex items-center gap-0.5 font-bold"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Nusxalash</span>
                  </button>
                </div>
                <div className="font-mono text-xs bg-surface-container px-2 py-1 rounded text-on-surface">
                  {p.formula}
                </div>
                <p className="text-[10px] text-outline">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
