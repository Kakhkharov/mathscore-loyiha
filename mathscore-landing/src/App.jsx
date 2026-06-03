import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef([]);

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Tariflar', href: '#tariflar' },
    { name: 'Aloqa', href: '#aloqa' },
    { name: 'Natijalar', href: '#natijalar' }
  ];

  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.name === activeTab);
    const activeElement = tabsRef.current[activeIndex];
    
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  // Intersection Observer scroll reveal effects
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const targets = document.querySelectorAll('.scroll-reveal');
    targets.forEach(target => observer.observe(target));

    return () => {
      targets.forEach(target => observer.unobserve(target));
    };
  }, []);

  const [settings, setSettings] = useState({
    heroTitle: "SAT Matematikani zamonaviy metodlar yordamida, ingliz tilida tez va samarali o'rganing",
    heroSubtitle: "Jahon standartlariga mos ta'lim. Yuqori ball oling va nufuzli xorijiy universitetlarga grant yutish imkoniyatini qo'lga kiriting.",
    contactPhone: "+998 99 824 46 18",
    contactAddress: "Toshkent shahri, Sergeli tumani",
    telegramLink: "https://t.me/math_teacher_m"
  });
  
  const [results, setResults] = useState([
    { score: 'SAT 1520', name: 'Azizbek K.', color: 'text-primary' },
    { score: 'SAT 1480', name: 'Malika O.', color: 'text-tertiary' },
    { score: 'A-Level A*', name: 'Sardor T.', color: 'text-secondary' },
    { score: 'SAT 1550', name: 'Durdona S.', color: 'text-primary' },
    { score: 'SAT 1450', name: 'Javohir N.', color: 'text-tertiary' },
    { score: 'A-Level A', name: 'Laylo R.', color: 'text-secondary' },
    { score: 'SAT 1500', name: 'Rustam M.', color: 'text-primary' }
  ]);
  
  const [pricing, setPricing] = useState([
    { title: 'SAT Matematika', description: 'Noldan boshlab yuqori darajagacha intensiv tayyorgarlik. Ingliz tilida masalalar yechish.', price: '600,000', type: 'primary' },
    { title: 'A-Level Math', description: 'Kembrij dasturi asosida chuqurlashtirilgan matematika. Pure Math va Mechanics.', price: '700,000', type: 'tertiary' },
    { title: 'Matematika Foundation', description: 'Asosiy matematik bilimlarni mustahkamlash va ingliz tilidagi terminlarga moslashish.', price: '500,000', type: 'secondary' }
  ]);

  const [selectedImage, setSelectedImage] = useState(null);
  const displayResults = results.slice(0, 10);

  useEffect(() => {
    fetch('http://localhost:5000/api/settings', { cache: 'no-store' }).then(res => res.json()).then(data => setSettings(data)).catch(console.error);
    fetch('http://localhost:5000/api/results', { cache: 'no-store' }).then(res => res.json()).then(data => setResults(data)).catch(console.error);
    fetch('http://localhost:5000/api/pricing', { cache: 'no-store' }).then(res => res.json()).then(data => setPricing(data)).catch(console.error);
  }, []);

  return (
    <div className="bg-surface antialiased text-on-surface">
      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-md text-primary sticky top-0 z-50 border-b-2 border-outline-variant/30 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-2 select-none cursor-pointer group">
          <div className="bg-gradient-to-br from-primary to-purple-600 text-white p-1.5 rounded-lg shadow-md group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-[24px] block">calculate</span>
          </div>
          <span className="font-outfit text-2xl font-black tracking-tight text-on-surface">
            Math<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Score</span>
          </span>
        </div>

        <nav className="hidden md:flex relative items-center bg-surface-container-high/40 p-1 rounded-full border border-outline-variant/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md">
          {/* Sliding Background Capsule */}
          <span 
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          ></span>
          {navItems.map((item, index) => (
            <a
              key={item.name}
              ref={el => tabsRef.current[index] = el}
              onClick={() => setActiveTab(item.name)}
              href={item.href}
              className={`relative font-label-md text-[14px] px-5 py-1.5 z-10 transition-colors duration-300 rounded-full ${
                activeTab === item.name ? 'font-bold text-primary' : 'font-medium text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a 
            href="https://t.me/math_teacher_m" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 border-2 border-primary/30 text-primary hover:border-primary/85 hover:shadow-[0_0_15px_rgba(67,67,213,0.3)] font-bold font-label-md text-[14px] px-5 py-2.5 rounded-full hover:bg-primary/5 transition-all active:translate-y-px cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Adminga yozish</span>
          </a>
          <button 
            onClick={() => { window.location.href = "http://localhost:5174/"; }}
            className="relative group bg-gradient-to-r from-primary to-purple-600 text-white font-label-md text-[14px] px-6 py-2.5 rounded-full font-bold shadow-[0_4px_14px_0_rgba(67,67,213,0.39)] hover:shadow-[0_0_25px_rgba(67,67,213,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">Sign in</span>
            <span className="material-symbols-outlined text-[18px] relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 flex flex-col md:flex-row items-center gap-12 scroll-reveal">
          <div className="flex-1 space-y-6">
            <h1 className="font-outfit text-3xl md:text-5xl font-black text-on-surface leading-[1.15] tracking-tight">
              {settings.heroTitle}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-[1.6]">
              {settings.heroSubtitle}
            </p>
            <div className="pt-4">
              <button 
                onClick={() => { window.location.href = "http://localhost:5174/"; }}
                className="bg-primary text-on-primary font-label-md px-8 py-4 rounded-lg hover:opacity-90 hover:shadow-[0_0_30px_rgba(67,67,213,0.8)] hover:-translate-y-0.5 active:translate-y-px transition-all text-lg font-bold shadow-[0_4px_0_#2e2bc2] cursor-pointer"
              >
                Kursga yozilish
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-square rounded-full bg-primary-fixed/30 absolute -inset-4 blur-3xl z-0"></div>
            <img 
              alt="Students studying" 
              className="rounded-2xl relative z-10 w-full h-[500px] object-cover border-2 border-primary-fixed shadow-[8px_8px_0_#e1e0ff]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArW8Uc0_kSgKSsniA_f9P74j0UX-Oww5TZqRRyMYnMUbWaefbg9X9MYdj9z4u9SJfI4NJrhH11kkV2GVKYOWimLdgrJLs-SU8bh9on0_K-ce6LjoGyEqC1dOKN3lyEMsKI0vmNSRj_ZdsbQtrJiAVrsfwoyTuXNsx1eV0-XAiLaObOMQ1NaK7BBO0Dk42qyUNlEJ4SkgW47RXdywORTdzfWsekH37icvVXGKd9NHwbu9SKrgn61d630Jr0vPJcNynTbfjL5BmvxYAF"
            />
          </div>
        </section>

        {/* Natijalar */}
        <section className="bg-surface-container-low py-20 scroll-reveal" id="natijalar">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-10 flex flex-col items-center">
            <span className="text-primary font-bold uppercase tracking-[0.15em] text-xs mb-3 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">Biz bilan faxrlaning</span>
            <h2 className="font-outfit text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary text-center pb-2 drop-shadow-sm">
              Natijalar
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-full mt-2 mb-4"></div>
            <p className="text-center text-on-surface-variant font-body-md text-body-md max-w-2xl mx-auto">O'quvchilarimiz erishgan yuqori SAT va A-Level natijalari</p>
          </div>
          <div className="slider">
            <div className="slide-track" style={{ '--slide-count': displayResults.length || 7 }}>
              {/* Slides */}
              {[...displayResults, ...displayResults].map((item, index) => (
                <div key={index} className="slide">
                  <div 
                    className={`bg-white rounded-xl border-2 border-outline-variant shadow-sm h-64 flex flex-col justify-center items-center overflow-hidden relative ${item.imageUrl ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    onClick={() => item.imageUrl && setSelectedImage(item.imageUrl)}
                  >
                    {item.imageUrl ? (
                      <>
                        <img src={item.imageUrl} className={`w-full h-full object-cover ${item.imagePosition || 'object-center'} transition-transform duration-500 hover:scale-105`} alt={item.name} />
                        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-3 text-center">
                          <p className="font-black text-lg text-white">{item.score}</p>
                          <p className="text-xs font-medium text-white/80">{item.name}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className={`material-symbols-outlined text-5xl ${item.color || 'text-primary'} mb-2`}>workspace_premium</span>
                        <p className="font-bold text-xl">{item.score}</p>
                        <p className="text-sm text-on-surface-variant">{item.name}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Imkoniyatlar */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 scroll-reveal">
          <div className="flex flex-col items-center mb-12">
            <span className="text-tertiary font-bold uppercase tracking-[0.15em] text-xs mb-3 bg-tertiary/10 px-4 py-1.5 rounded-full border border-tertiary/20">Sizning kelajagingiz</span>
            <h2 className="font-outfit text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-tertiary via-green-500 to-tertiary text-center pb-2 drop-shadow-sm">
              Imkoniyatlar - ajoyib!
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-tertiary to-green-500 rounded-full mt-2 mb-4"></div>
            <p className="text-center text-on-surface-variant font-body-md text-body-md">Kursni tugatgandan keyingi natijalaringiz ham qiziqmi?!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-border bg-pastel-purple card-lift reveal-child delay-100">
              <p className="font-body-md text-body-md font-semibold">SAT Matematikani yuqori ballga topshirish orqali nufuzli chet el universitetlariga grant yutish imkoni ham paydo bo'ladi</p>
            </div>
            <div className="card-border bg-pastel-green card-lift reveal-child delay-200">
              <p className="font-body-md text-body-md font-semibold">Qisqa vaqt ichida qiyin SAT masalalarini oson yechish ko'nikmasiga ega bo'lasiz</p>
            </div>
            <div className="card-border bg-pastel-blue card-lift reveal-child delay-300">
              <p className="font-body-md text-body-md font-semibold">Xalqaro darajadagi ta'lim muhitiga kirib, kuchli va maqsadli tengdoshlar bilan o'qiysiz</p>
            </div>
            <div className="card-border bg-pastel-orange card-lift reveal-child delay-400">
              <p className="font-body-md text-body-md font-semibold">Terminlarni to'g'ri tushunish va qo'llashni o'rganasiz. "Something in your eyes" iborasini Avazbek Olimovdan yaxshiroq ayta olasiz!</p>
            </div>
            <div className="card-border bg-pastel-red card-lift reveal-child delay-500">
              <p className="font-body-md text-body-md font-semibold">Ingliz tilida matematika o'rganishning mutlaqo yangi va zamonaviy metodlarini sinab ko'rasiz</p>
            </div>
            <div className="card-border bg-pastel-yellow card-lift reveal-child delay-600">
              <p className="font-body-md text-body-md font-semibold">Shaxsiy karyerangizda o'sish uchun yuqori maoshli ish topishingizga zamin yaratasiz</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => { window.location.href = "http://localhost:5174/"; }}
              className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-lg hover:opacity-90 hover:shadow-[0_0_25px_rgba(67,67,213,0.7)] hover:-translate-y-0.5 active:translate-y-px transition-all font-bold shadow-[0_4px_0_#2e2bc2] cursor-pointer"
            >
              Ishtirok etish
            </button>
          </div>
        </section>

        {/* Kurslarimiz aynan */}
        <section className="bg-surface-container-low py-20 scroll-reveal">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col items-center mb-12">
              <span className="text-secondary font-bold uppercase tracking-[0.15em] text-xs mb-3 bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">Maqsadli auditoriya</span>
              <h2 className="font-outfit text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary via-orange-400 to-red-500 text-center pb-2 drop-shadow-sm">
                Kurslarimiz aynan kimlar uchun?
              </h2>
              <div className="w-16 h-1.5 bg-gradient-to-r from-secondary to-orange-400 rounded-full mt-2"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card-border bg-pastel-orange card-lift flex flex-col justify-center reveal-child delay-100">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Abituriyentlar</h3>
                <p className="font-medium text-sm text-on-surface-variant">Davlat va chet el universitetlari, xalqaro dasturlar va litsey imtihonlariga SAT Matematikadan tayyorlanuvchilar uchun</p>
              </div>
              <div className="card-border bg-pastel-green card-lift flex flex-col justify-center reveal-child delay-200">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Havaskorlar</h3>
                <p className="font-medium text-sm text-on-surface-variant">Yangi til va madaniyatlarni o'rganishga qiziquvchi sayohatchilar, poliglotlar uchun</p>
              </div>
              <div className="card-border bg-pastel-blue card-lift flex flex-col justify-center reveal-child delay-300">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Ma'lum kasb egalari</h3>
                <p className="font-medium text-sm text-on-surface-variant">Qo'shimcha til bilish orqali o'z karyerasida o'sishni reja qilyotgan xodimlar uchun</p>
              </div>
              <div className="card-border bg-pastel-purple card-lift flex flex-col justify-center reveal-child delay-400">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Maktab o'quvchilari</h3>
                <p className="font-medium text-sm text-on-surface-variant">Ingliz tilida matematikani o'rganib, darsdan bo'sh vaqtlarini samarali o'tkazishni xohlovchi o'quvchilar uchun</p>
              </div>
              <div className="card-border bg-pastel-purple card-lift flex flex-col justify-center reveal-child delay-500">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Talabalar</h3>
                <p className="font-medium text-sm text-on-surface-variant">Darslardan tashqari zamonaviy kasblarni o'rganib moliyaviy erkinlikka erishmoqchi bo'lgan yoshlar uchun</p>
              </div>
              <div className="card-border bg-pastel-yellow card-lift flex flex-col justify-center reveal-child delay-600">
                <h3 className="font-outfit text-xl font-black text-black mb-2">Chet eldagi yurtdoshlarimiz</h3>
                <p className="font-medium text-sm text-on-surface-variant">Chet el nufuzli oliygohlarida o'qish maqsadida xalqaro SAT imtihonini muvaffaqiyatli topshirishni maqsad qilgan insonlar uchun ideal tanlov hisoblanadi</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => { window.location.href = "http://localhost:5174/"; }}
                className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-lg hover:opacity-90 hover:shadow-[0_0_25px_rgba(67,67,213,0.7)] hover:-translate-y-0.5 active:translate-y-px transition-all font-bold shadow-[0_4px_0_#2e2bc2] cursor-pointer"
              >
                Ishtirok etish
              </button>
            </div>
          </div>
        </section>

        {/* Tariflar */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 scroll-reveal" id="tariflar">
          <div className="flex flex-col items-center mb-12">
            <span className="text-primary font-bold uppercase tracking-[0.15em] text-xs mb-3 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">Sizga mos paketlar</span>
            <h2 className="font-outfit text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-center pb-2 drop-shadow-sm">
              Tariflar
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => {
              // Determine card style based on type
              let colorClass = 'primary';
              let shadowColor = '#4343d5';
              let buttonStyle = 'bg-primary text-on-primary hover:shadow-[0_0_20px_#4343d580]';
              let imgSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuDml4tLNvySCO_8Sk5xl-mjsjhz_Ej0cqH5cHeg56Ubt-Sm8Pb7RaEXyE_QJfIlAxjKq4MaZGzrY3eO141r3AhrdP1OuulE35nT1PKttbDY_Rv7phjufab0qv_R9MDZ5vEOYjS2L6SUM9t4_zUqnW2zBjCJ75A8tEwyE8BonYWKIwircoAZ54nUSrDMuwcFkz0t59CYPzNojT7fvfsKCGrudiTQcaImh7ACT_kRWUBGhRrBhdBf3L4qePh5wotnQNm497SH1cpiDVKY";
              
              if (plan.type === 'tertiary') {
                colorClass = 'tertiary';
                shadowColor = '#006822';
                buttonStyle = 'bg-tertiary text-on-tertiary hover:shadow-[0_0_20px_#00682280]';
                imgSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuAmlLTsBn2JqKAZIVyqo2XBzGZPQs4-pUQKDhyXtXeTNzhznSy5M4KqKpuO6UqUlwqqSnzGWsP4r9UybYlr__glDn7aoO996-b_ZZxGcqPihBpEBBGb7idSRAOkGYD5xzYsddWGfl17ILVxnprJ1L0vc8q1l_ZlSlHB7d_WUGj-iFTinYzaGQGi_RiLViqNOiq1QieA_fwI7WD_dBeRAQRcNpBgovT4f_ENRa7Iedgja1pnQ_BRaOMyE8qoBUeKCEmLW7nVrx65ZP1i";
              } else if (plan.type === 'secondary') {
                colorClass = 'secondary';
                shadowColor = '#8f4e00';
                buttonStyle = 'bg-secondary text-white hover:shadow-[0_0_20px_#8f4e0080]';
                imgSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jfwMWlV2Z7MU1wgHOVMAyNVwULA6sO57ip8zSt13Xus0ItU4d72lDf_GPn-aUzR11GPcvNgulQWL1rB57YX2n6ALDqTO9fotxU3XbPYV82cyUJjnollL8oNqjoqnnOuee-oQWUGObCfNJ6_w-okXyOWgF1xcuXRK3EbBLQTfYW7knIY6MvLRVxJd49DPF_82aU6d-4j76OUfF9L9MZeMzm8SgXzgcWI5qZkQ5vyWfFeBwAyAPbtEET6OluJ_aOrcZeqWwu6gxl-D";
              }

              return (
                <div key={plan.id || index} className={`bg-white rounded-2xl border-2 border-${colorClass} overflow-hidden hover:shadow-[0_8px_0_${shadowColor}] transition-all duration-300 flex flex-col relative reveal-child delay-${(index % 3 + 1) * 100}`}>
                  {plan.type === 'tertiary' && <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary text-xs font-bold px-3 py-1 rounded-full z-10">Popular</div>}
                  <div className={`h-48 bg-${colorClass}/10 relative`}>
                    <img alt={plan.title} className="w-full h-full object-cover mix-blend-multiply opacity-80" src={plan.imageUrl || imgSrc}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-outfit text-2xl font-black text-black mb-2">{plan.title}</h3>
                    <p className="font-medium text-on-surface-variant mb-6 flex-1">{plan.description}</p>
                    <div className="mb-6">
                      <span className={`font-display-lg text-3xl font-bold text-${colorClass}`}>{plan.price}</span>
                      <span className="text-on-surface-variant text-sm"> so'm / oy</span>
                    </div>
                    <button 
                      onClick={() => { window.location.href = "http://localhost:5174/"; }}
                      className={`w-full ${buttonStyle} font-label-md py-3 rounded-lg hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold cursor-pointer`}
                    >
                      Ishtirok etish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant/30 pt-16 pb-8 px-margin-mobile md:px-margin-desktop mt-20 relative overflow-hidden scroll-reveal" id="aloqa">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 relative z-10">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 select-none mb-4">
                <div className="bg-gradient-to-br from-primary to-purple-600 text-white p-1.5 rounded-lg shadow-md">
                  <span className="material-symbols-outlined text-[24px] block">calculate</span>
                </div>
                <span className="font-outfit text-2xl font-black tracking-tight text-on-surface">
                  Math<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Score</span>
                </span>
              </div>
              <p className="text-on-surface-variant text-sm max-w-sm mb-6 leading-relaxed">
                Jahon standartlariga mos SAT va A-Level matematika ta'limi. Orzuyingizdagi universitetga biz bilan tayyorlaning.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <a 
                  href="https://t.me/math_teacher_m" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(67,67,213,0.5)] transition-all font-bold text-sm px-5 py-2.5 rounded-full cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Adminga yozish
                </a>
                <div className="flex items-center gap-3">
                  <a href="https://t.me/math_teacher_m" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-container-highest/50 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.204-.054-.31-.346-.116l-6.405 4.032-2.766-.867c-.6-.188-.614-.6.126-.89l10.81-4.168c.5-.197.942.126.861.94z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/sigmaeducation_uz/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-container-highest/50 flex items-center justify-center text-on-surface-variant hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/30">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-on-surface mb-4">Tezkor havolalar</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span> Asosiy sahifa</a></li>
                <li><a href="#tariflar" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span> Tariflar</a></li>
                <li><a href="#natijalar" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span> O'quvchilar natijalari</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-on-surface mb-4">Aloqa</h4>
              <ul className="space-y-4">
                <li>
                  <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`} className="group flex items-start gap-3 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">call</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Telefon raqam</p>
                      <p className="text-sm font-medium">{settings.contactPhone}</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="group flex items-start gap-3 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">location_on</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Manzil</p>
                      <p className="text-sm font-medium">{settings.contactAddress}</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <span className="text-on-surface-variant text-sm font-medium">© 2024 MathScore. Barcha huquqlar himoyalangan.</span>
            <div className="flex items-center gap-6 text-sm font-medium text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Maxfiylik siyosati</a>
              <a href="#" className="hover:text-primary transition-colors">Ommaviy oferta</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Gallery Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-full flex flex-col items-center justify-center">
            <button 
              className="absolute -top-12 right-0 sm:-right-12 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <img 
              src={selectedImage} 
              alt="Sertifikat" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
