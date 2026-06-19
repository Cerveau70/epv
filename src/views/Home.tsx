
import React, { useState, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'motion/react';
import { PhotoGallery } from '../components/ui/PhotoGallery.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ShieldAlert, BookOpen, Quote, ChevronRight, UserCheck, GraduationCap, Award, ArrowRight, Star, Calendar } from 'lucide-react';
import { Translate, Plant } from '@phosphor-icons/react';
import { useLang } from '../lib/LanguageContext.tsx';
import { t } from '../lib/i18n.ts';

interface HomeProps {
  onNavigate: (hash: string) => void;
}

const CARD_W      = 275;              // largeur d'une carte en px
const CARD_GAP    = 24;               // espace entre cartes en px
const CARD_STRIDE = CARD_W + CARD_GAP; // 299px par slot

const TESTIMONIALS: { id: number; parent: string; role: string; initials: string; color: string; quote: string; stars: number }[] = [
  // Témoignages à renseigner avec de vrais avis parents
];

/** Wrapper déclenchant une animation CSS au scroll */
function Reveal({ children, delay = 0, animation = 'bounceInUp', className = '' }: {
  children: React.ReactNode;
  delay?: number;
  animation?: 'bounceInUp' | 'slideInLeft' | 'slideInRight' | 'popIn';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        animation: visible ? `${animation} 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : 'none',
        opacity: visible ? undefined : 0,
      }}
    >
      {children}
    </div>
  );
}

/** Carte 3D · effet tilt au survol de la souris */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 28 });
  const y = useSpring(rawY, { stiffness: 280, damping: 28 });
  const rotateX = useTransform(y, [-80, 80], [10, -10]);
  const rotateY = useTransform(x, [-80, 80], [-10, 10]);
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', willChange: 'transform' }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - r.left - r.width  / 2);
        rawY.set(e.clientY - r.top  - r.height / 2);
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Carte bulle de témoignage · scale réactif à la position dans le track */
function TestimonialCard({ t, idx, trackX, containerW }: {
  t: (typeof TESTIMONIALS)[0];
  idx: number;
  trackX: MotionValue<number>;
  containerW: number;
}) {
  const scale = useTransform(trackX, (x: number) => {
    const cardCenter = x + idx * CARD_STRIDE + CARD_W / 2;
    const dist = Math.abs(cardCenter - containerW / 2);
    return Math.max(0.88, 1.12 - (dist / CARD_STRIDE) * 0.24);
  });

  return (
    <motion.div
      style={{ scale, transformOrigin: 'bottom center' }}
      className="speech-bubble-tail w-[275px] shrink-0 rounded-2xl bg-[#f8fafc]
                 border-[2.5px] border-[#22C55E]
                 shadow-[0_12px_40px_rgba(0,0,0,0.10),0_4px_16px_rgba(34,197,94,0.10)]
                 p-5 flex flex-col gap-3 cursor-default"
    >
      <p className="font-serif text-[13px] text-gray-700 leading-relaxed">
        "{t.quote}"
      </p>
      <div className="h-px bg-[#22C55E]/25" />
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color}
                        flex items-center justify-center shrink-0
                        text-white text-[11px] font-extrabold select-none`}>
          {t.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans font-bold text-gray-800 text-xs leading-tight truncate">{t.parent}</p>
          <p className="text-[9px] text-gray-500 mt-0.5 truncate">{t.role}</p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: t.stars }).map((_, i) => (
            <Star key={i} size={10} className="fill-brand-gold text-brand-gold" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { lang } = useLang();

  const ROTATING_WORDS = lang === 'fr'
    ? ['Rigueur', 'Bilinguisme', 'Excellence', 'Épanouissement']
    : ['Rigor', 'Bilingualism', 'Excellence', 'Development'];

  /* (pancarte chalk · pas d'état, animation CSS pure) */

  /* Carousel piliers mobile */
  const pillarCarouselRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState(1);
  useEffect(() => {
    const el = pillarCarouselRef.current;
    if (!el) return;
    const CARD_W = 232 + 14;
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      setActivePillar(Math.max(0, Math.min(2, Math.round((center - CARD_W / 2) / CARD_W))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* Marquee spotlight */
  const marqueePausedRef                          = useRef(false);
  const marqueeContainerRef                       = useRef<HTMLDivElement>(null);
  const [marqueeContainerW, setMarqueeContainerW] = useState(CARD_STRIDE * 3 - CARD_GAP);
  const trackX                                    = useMotionValue(0);

  /* Mot rotatif */
  const [wordIdx, setWordIdx]         = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setWordVisible(false);
      swap = setTimeout(() => {
        setWordIdx(p => (p + 1) % ROTATING_WORDS.length);
        setWordVisible(true);
      }, 320);
    }, 2600);
    return () => { clearInterval(interval); clearTimeout(swap); };
  }, []);

  /* Animation rAF du marquee · 50s pour parcourir la moitié du track */
  useEffect(() => {
    const total = TESTIMONIALS.length * CARD_STRIDE;
    let x = 0;
    let rafId: number;
    const tick = () => {
      if (!marqueePausedRef.current) {
        x -= total / (50 * 60);
        if (x <= -total) x += total;
        trackX.set(x);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [trackX]);

  /* Mesure du conteneur après le premier rendu */
  useEffect(() => {
    if (marqueeContainerRef.current) {
      setMarqueeContainerW(marqueeContainerRef.current.offsetWidth);
    }
  }, []);

  const handleCTA = () => {
    onNavigate("#/admissions");
    // Laisser React re-rendre la page Admissions puis scroller jusqu'au formulaire
    setTimeout(() => {
      const el = document.getElementById('inscription-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
  };

  const handleRdv = () => {
    onNavigate("#/admissions");
    setTimeout(() => {
      const el = document.getElementById('rdv-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
  };

  const bannerItems = lang === 'fr' ? [
    'Inscriptions Ouvertes',
    'Rentrée Septembre 2026',
    'EPV Horizons Savants',
    'Bingerville · Abidjan',
    'Maternelle & Primaire',
    '25 élèves max / classe',
    'Programme Bilingue FR/EN',
  ] : [
    'Enrollments Open',
    'September 2026 School Year',
    'EPV Horizons Savants',
    'Bingerville · Abidjan',
    'Kindergarten & Primary',
    '25 students max / class',
    'Bilingual Program FR/EN',
  ];

  return (
    <div className="relative animate-fade-in">

      {/* ══════ BANDEROLE SCROLL ══════════════════════════════ */}
      <div className="bg-white overflow-hidden py-2 select-none border-b border-brand-border/30">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marqueeScroll 24s linear infinite' }}
        >
          {[...bannerItems, ...bannerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-brand-blue-deep font-sans font-bold text-[11px] uppercase tracking-[0.2em] pr-8">
              {item}
              <span className="w-1 h-1 rounded-full bg-brand-blue-deep shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden min-h-[78vh] sm:min-h-[85vh] lg:min-h-[92vh] flex flex-col lg:flex-row">
        {/* Image de fond plein écran */}
        <img
          src="/img/classe.jpg" alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          loading="eager"
        />
        {/* Overlay dégradé : gauche opaque → droite transparent */}
        <div className="absolute inset-0 z-[1]"
             style={{ background: 'linear-gradient(to right, #06192e 0%, #0D2E5C 30%, rgba(8,24,56,0.88) 48%, rgba(8,24,56,0.50) 65%, rgba(8,24,56,0.18) 82%, transparent 100%)' }} />
        {/* ══ Panneau GAUCHE ══ */}
        <div
          className="relative z-10 flex flex-col justify-center
                     w-full lg:w-[60%]
                     pl-6 pr-4 sm:pl-10 lg:pl-12 xl:pl-16
                     pt-10 pb-10 lg:py-0 min-h-[78vh] sm:min-h-[85vh] lg:min-h-[92vh]"
        >
          {/* Lueur ambiante subtile */}
          <div className="absolute top-1/3 -left-16 w-72 h-72 bg-brand-blue-medium/15 blur-[110px] rounded-full pointer-events-none" />

          <div className="relative z-10">

            {/* ── Pancarte 3D ardoise + craie ── */}
            <style>{`
              @keyframes chalk-1 {
                0%,3%   { clip-path: inset(0 100% 0 0); }
                28%,68% { clip-path: inset(0 0% 0 0);   }
                88%,100%{ clip-path: inset(0 100% 0 0); }
              }
              @keyframes chalk-2 {
                0%,22%  { clip-path: inset(0 100% 0 0); }
                47%,68% { clip-path: inset(0 0% 0 0);   }
                88%,100%{ clip-path: inset(0 100% 0 0); }
              }
              @keyframes chalk-div {
                0%,35%  { opacity: 0; transform: scaleX(0); }
                55%,68% { opacity: 1; transform: scaleX(1); }
                88%,100%{ opacity: 0; transform: scaleX(0); }
              }
              @keyframes board-rock {
                0%,100% { transform: perspective(420px) rotateY(-18deg) rotateX(6deg) rotate(-2deg); }
                50%     { transform: perspective(420px) rotateY(-14deg) rotateX(4deg) rotate(2deg);  }
              }
              .chalk-txt-1  { animation: chalk-1   8s ease-in-out infinite; display: block; }
              .chalk-txt-2  { animation: chalk-2   8s ease-in-out infinite; display: block; }
              .chalk-sep    { animation: chalk-div 8s ease-in-out infinite; transform-origin: left; }
              .board-rock   {
                animation: board-rock 5s ease-in-out infinite;
                transform-style: preserve-3d;
              }
            `}</style>

            <div className="hero-fade-in mb-4 select-none inline-flex flex-col items-start"
                 style={{ animationDelay: '0ms' }}>
              <div className="inline-flex flex-col items-center" style={{ perspective: '500px' }}>

                {/* Fils de suspension */}
                <div className="flex justify-between w-[72px] px-3">
                  <div className="w-px h-3" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), #b8860b)' }} />
                  <div className="w-px h-3" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), #b8860b)' }} />
                </div>

                {/* Ardoise 3D */}
                <div className="board-rock relative cursor-default" style={{ transformOrigin: 'top center' }}>

                  {/* ── Épaisseur haut ── */}
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, height:6,
                    background:'linear-gradient(to right,#5a3808,#8b5e12,#5a3808)',
                    transform:'rotateX(90deg)', transformOrigin:'top',
                  }}/>
                  {/* ── Épaisseur droite ── */}
                  <div style={{
                    position:'absolute', top:0, right:-6, bottom:0, width:6,
                    background:'linear-gradient(to bottom,#7a4e10,#5a3808)',
                    transform:'rotateY(-90deg)', transformOrigin:'right',
                  }}/>
                  {/* ── Épaisseur bas ── */}
                  <div style={{
                    position:'absolute', bottom:0, left:0, right:0, height:6,
                    background:'linear-gradient(to right,#4a2e06,#7a5010,#4a2e06)',
                    transform:'rotateX(-90deg)', transformOrigin:'bottom',
                  }}/>

                  {/* ── Cadre bois + ardoise ── */}
                  <div style={{
                    background:'#1e3a22',
                    border:'4px solid #8b6914',
                    borderRadius:4,
                    padding:'9px 13px 9px',
                    minWidth:138,
                    boxShadow:'0 8px 28px rgba(0,0,0,0.55), inset 0 0 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
                    position:'relative', overflow:'hidden',
                  }}>

                    {/* Texture grain ardoise */}
                    <div style={{
                      position:'absolute', inset:0, opacity:.06,
                      backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.3) 3px,rgba(255,255,255,.3) 4px)',
                    }}/>

                    {/* Reflet vitre */}
                    <div style={{
                      position:'absolute', top:3, left:5, width:38, height:2,
                      background:'rgba(255,255,255,0.07)', borderRadius:2, transform:'rotate(-1deg)',
                    }}/>

                    {/* ── Texte craie ligne 1 ── */}
                    <p className="chalk-txt-1 font-sans font-bold text-center leading-tight"
                       style={{ fontSize:10, color:'#f0edd8', letterSpacing:'0.05em',
                                textShadow:'0 0 6px rgba(240,237,216,0.5),1px 1px 0 rgba(0,0,0,0.3)' }}>
                      {t('hero.badge1', lang)}
                    </p>

                    {/* ── Séparateur craie ── */}
                    <div className="chalk-sep mx-2 my-[4px]"
                         style={{ height:1, background:'rgba(240,237,216,0.28)' }}/>

                    {/* ── Texte craie ligne 2 ── */}
                    <p className="chalk-txt-2 font-sans font-semibold text-center uppercase"
                       style={{ fontSize:8, color:'rgba(240,237,216,0.75)', letterSpacing:'0.2em',
                                textShadow:'0 0 4px rgba(240,237,216,0.35)' }}>
                      {t('hero.badge2', lang)}
                    </p>

                    {/* ── Petit trait de craie décoratif ── */}
                    <div style={{
                      position:'absolute', bottom:4, right:8, width:14, height:1,
                      background:'rgba(240,237,216,0.15)', borderRadius:1,
                    }}/>
                  </div>
                </div>
              </div>
            </div>

            {/* H1 · typographie fluide clamp() */}
            <h1
              className="hero-fade-in font-sans font-extrabold text-white tracking-[-0.01em] leading-[1.25]"
              style={{ fontSize: 'clamp(1.3rem, 4.5vw, 2.75rem)', animationDelay: '80ms' }}
            >
              {t('hero.h1a', lang)}
              <span className="text-brand-gold block mt-0.5">{t('hero.h1b', lang)}</span>
            </h1>

            {/* Mot rotatif */}
            <div
              className="hero-fade-in flex items-center gap-2 mt-3"
              style={{ animationDelay: '180ms' }}
            >
              <span className="text-white/28 text-[10px] uppercase tracking-[0.18em] font-sans">{t('hero.vision', lang)}</span>
              <span
                className="text-brand-gold text-[11px] font-bold uppercase tracking-[0.18em] font-sans"
                style={{
                  opacity:   wordVisible ? 1 : 0,
                  transform: wordVisible ? 'translateY(0)' : 'translateY(-6px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
              >
                {ROTATING_WORDS[wordIdx]}
              </span>
            </div>

            {/* Séparateur */}
            <div className="hero-fade-in h-[3px] w-10 bg-brand-gold rounded-full mt-3 mb-3"
                 style={{ animationDelay: '220ms' }} />

            {/* Boutons */}
            <div className="hero-fade-in mt-7 flex flex-wrap items-stretch gap-3 sm:gap-4"
                 style={{ animationDelay: '350ms' }}>
              <Button
                variant="cta"
                className="px-6 py-3 text-xs font-bold tracking-wide flex-1 sm:flex-none
                           shadow-[0_5px_18px_rgba(245,166,35,0.35)]
                           hover:shadow-[0_8px_26px_rgba(245,166,35,0.50)]"
                onClick={handleCTA}
              >
                <GraduationCap size={14} className="shrink-0" />
                {t('hero.btn.preinsc', lang)}
              </Button>
              <Button
                variant="secondary"
                className="px-6 py-3 text-xs font-semibold flex-1 sm:flex-none
                           bg-white/6 text-white border-white/18
                           hover:bg-white/12 hover:border-white/35"
                onClick={handleRdv}
              >
                <Calendar size={14} className="shrink-0" />
                {t('hero.btn.rdv', lang)}
              </Button>
              <Button
                variant="secondary"
                className="px-6 py-3 text-xs font-semibold w-full sm:w-auto
                           bg-white/6 text-white border-white/18
                           hover:bg-white/12 hover:border-white/35"
                onClick={() => { onNavigate("#/programmes"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <BookOpen size={14} className="shrink-0" />
                {t('hero.btn.prog', lang)}
              </Button>
            </div>
          </div>
        </div>

        {/* ══ Trois cercles décoratifs ══ */}
        <div className="pointer-events-none select-none">

          {/* Lueur ambiante */}
          <div className="absolute right-[5%] top-[8%] w-16 h-16 lg:right-[20%] lg:top-[32%] lg:w-60 lg:h-60
                          bg-brand-gold/8 blur-[40px] lg:blur-[90px] rounded-full" />

          {/* Grand cercle · haut droite (mobile: coin haut-droit) */}
          <div className="absolute right-[2%] top-[3%]
                          w-24 h-24 sm:w-32 sm:h-32 lg:w-72 lg:h-72 xl:w-80 xl:h-80
                          rounded-full overflow-hidden
                          opacity-80 sm:opacity-85 lg:opacity-100
                          z-[2] lg:z-10
                          ring-[1.5px] lg:ring-[3px] ring-white/20
                          shadow-[0_4px_14px_rgba(0,0,0,0.30)] lg:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
               style={{ animation: 'float3D 7s ease-in-out 0s infinite' }}>
            <img src="/img/classe.jpg" alt="Classe EPV"
                 className="w-full h-full object-cover brightness-[1.05]" />
          </div>

          {/* Cercle moyen · juste en dessous à gauche du grand (mobile) */}
          <div className="absolute right-[20%] top-[14%]
                          w-16 h-16 sm:w-24 sm:h-24 lg:right-[30%] lg:top-[38%] lg:w-52 lg:h-52 xl:w-56 xl:h-56
                          rounded-full overflow-hidden
                          opacity-65 sm:opacity-75 lg:opacity-100
                          z-[2] lg:z-20
                          ring-[1.5px] lg:ring-[3px] ring-brand-gold/40
                          shadow-[0_3px_10px_rgba(0,0,0,0.25)] lg:shadow-[0_14px_44px_rgba(0,0,0,0.40)]"
               style={{ animation: 'float3DReverse 8.5s ease-in-out 1.4s infinite' }}>
            <img src="/img/co.jpeg" alt="Vie scolaire EPV"
                 className="w-full h-full object-cover" />
          </div>

          {/* Petit cercle · sous le grand, coin droit (mobile) */}
          <div className="absolute right-[3%] top-[26%]
                          w-12 h-12 sm:w-16 sm:h-16 lg:right-[4%] lg:top-auto lg:bottom-[8%] lg:w-36 lg:h-36 xl:w-40 xl:h-40
                          rounded-full overflow-hidden
                          opacity-55 sm:opacity-65 lg:opacity-100
                          z-[2] lg:z-10
                          ring-[1px] lg:ring-[3px] ring-white/25
                          shadow-[0_2px_8px_rgba(0,0,0,0.22)] lg:shadow-[0_10px_32px_rgba(0,0,0,0.38)]"
               style={{ animation: 'float3D 6s ease-in-out 0.8s infinite' }}>
            <img src="/img/classe.jpg" alt="EPV campus"
                 className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </section>

      {/* ══ 3. PILIERS · Staggered Layout + Framer Motion ══ */}
      <section className="pt-24 pb-40 px-4 md:px-8 relative overflow-hidden"
               style={{ background: 'linear-gradient(160deg,#f4f8ff 0%,#fffbf0 50%,#f0fdf6 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal animation="bounceInUp" className="text-center mb-16">
            <span className="block text-[10px] font-bold uppercase tracking-[0.35em] text-brand-gold mb-5">
              {lang === 'fr' ? 'Modèle Pédagogique Unique' : 'Unique Educational Model'}
            </span>
            <h2 className="font-sans font-black text-brand-blue-deep uppercase tracking-[0.08em] leading-tight" style={{fontSize:"clamp(1.6rem,4vw,3rem)"}}>
              {lang === 'fr' ? 'Nos Trois' : 'Our Three'}{' '}
              <span className="text-brand-gold">
                {lang === 'fr' ? 'Piliers' : 'Pillars'}
              </span><br className="hidden md:block" />
              {lang === 'fr' ? 'Fondateurs' : 'Founding'}
            </h2>
            <div className="h-px w-16 bg-brand-gold/50 mx-auto mt-6" />
          </Reveal>

          {/* ── Données des 3 piliers ── */}
          {(() => {
            const pillars = [
              {
                badge:     lang === 'fr' ? 'Élite'    : 'Elite',
                badgeBg:   'bg-brand-blue-deep', badgeText: 'text-white',
                barClass:  'from-blue-500 to-brand-blue-deep',
                border:    'border-blue-100',
                shadow:    'shadow-[0_2px_10px_rgba(13,46,92,0.08)] hover:shadow-[0_8px_28px_rgba(13,46,92,0.14)]',
                iconBg:    'from-blue-100 to-blue-50',
                Icon:      Award,
                iconColor: 'text-brand-blue-deep',
                title:     lang === 'fr' ? 'Excellence Académique'   : 'Academic Excellence',
                desc:      lang === 'fr'
                  ? "Un enseignement rigoureux basé sur les programmes nationaux renforcés par les meilleures méthodes internationales · approche Singapour pour les maths, écriture renforcée, projets scientifiques autonomes."
                  : "Rigorous teaching based on national curricula enhanced by the best international methods · Singapore approach for maths, reinforced writing, autonomous science projects.",
                ctaLabel:  lang === 'fr' ? 'EN SAVOIR PLUS' : 'LEARN MORE',
                ctaColor:  'text-brand-blue-medium hover:text-brand-blue-deep',
                ctaLine:   'bg-brand-blue-light',
                onClick:   () => { onNavigate('#/programmes'); window.scrollTo({ top:0, behavior:'smooth' }); },
              },
              {
                badge:     lang === 'fr' ? 'Bilingue' : 'Bilingual',
                badgeBg:   'bg-brand-gold',      badgeText: 'text-brand-blue-deep',
                barClass:  'from-brand-gold to-yellow-400',
                border:    'border-yellow-100',
                shadow:    'shadow-[0_2px_10px_rgba(245,166,35,0.08)] hover:shadow-[0_8px_28px_rgba(245,166,35,0.18)]',
                iconBg:    'from-yellow-100 to-amber-50',
                Icon:      Translate,
                iconColor: 'text-amber-600',
                title:     lang === 'fr' ? 'Richesse Bilingue Précoce' : 'Early Bilingual Richness',
                desc:      lang === 'fr'
                  ? "Immersion Français/Anglais dès la Petite Section. Récits, ateliers ludiques et cours animés par des locuteurs natifs pour une maîtrise bilingue durable dès l'enfance."
                  : "French/English immersion from Nursery. Stories, playful workshops and classes led by native speakers for lasting bilingual mastery from childhood.",
                ctaLabel:  lang === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER',
                ctaColor:  'text-brand-gold hover:text-amber-600',
                ctaLine:   'bg-brand-gold',
                onClick:   () => { onNavigate('#/programmes/maternelle'); window.scrollTo({ top:0, behavior:'smooth' }); },
              },
              {
                badge:     'Innovation',
                badgeBg:   'bg-emerald-500',     badgeText: 'text-white',
                barClass:  'from-emerald-500 to-green-400',
                border:    'border-emerald-100',
                shadow:    'shadow-[0_2px_10px_rgba(45,140,60,0.07)] hover:shadow-[0_8px_28px_rgba(45,140,60,0.15)]',
                iconBg:    'from-green-100 to-emerald-50',
                Icon:      Plant,
                iconColor: 'text-emerald-700',
                title:     lang === 'fr' ? 'Épanouissement & Éveil' : 'Growth & Awakening',
                desc:      lang === 'fr'
                  ? "Apprentissage par la curiosité et l'expérimentation · éveil sportif, artistique (musique, théâtre, poterie), et initiation à la robotique et à la programmation."
                  : "Learning through curiosity and experimentation · sport, arts (music, theatre, pottery), and introduction to robotics and coding.",
                ctaLabel:  lang === 'fr' ? 'EXPLORER' : 'EXPLORE',
                ctaColor:  'text-emerald-600 hover:text-emerald-800',
                ctaLine:   'bg-emerald-500',
                onClick:   () => { onNavigate('#/programmes'); window.scrollTo({ top:0, behavior:'smooth' }); },
              },
            ];

            /* Contenu d'une carte (partagé mobile + desktop) */
            const CardInner = ({ p }: { p: typeof pillars[0] }) => (
              <div className={`h-full rounded-sm bg-white border ${p.border} ${p.shadow} transition-shadow overflow-hidden relative p-6 flex flex-col gap-4`}>
                <span className={`absolute top-4 right-4 px-2 py-0.5 ${p.badgeBg} ${p.badgeText} text-[8px] font-bold uppercase tracking-widest rounded-full`}>{p.badge}</span>
                <div className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${p.barClass}`} />
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.iconBg} flex items-center justify-center mt-1 shadow-sm shrink-0`}>
                  <p.Icon size={18} className={p.iconColor} />
                </div>
                <div className="flex-1 min-h-0">
                  <h3 className="font-sans font-extrabold text-base text-brand-blue-deep mb-2 tracking-tight leading-snug">{p.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed font-serif">{p.desc}</p>
                </div>
                <button onClick={p.onClick}
                  className={`mt-auto inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] ${p.ctaColor} transition-colors group`}>
                  {p.ctaLabel}
                  <span className={`inline-block h-px ${p.ctaLine} w-6 group-hover:w-12 transition-all duration-300`} />
                  <ArrowRight size={10} className="shrink-0" />
                </button>
              </div>
            );

            return (
              <>
                {/* ── MOBILE : carousel horizontal avec zoom sur la carte centrale ── */}
                <div className="md:hidden relative">
                  {/* indicateurs dots */}
                  <div className="flex justify-center gap-1.5 mb-4">
                    {pillars.map((_, i) => (
                      <div key={i} className="rounded-full transition-all duration-300"
                           style={{ width: i === activePillar ? 16 : 6, height: 6,
                                    background: i === activePillar ? '#0D2E5C' : 'rgba(13,46,92,0.2)' }} />
                    ))}
                  </div>
                  <div
                    ref={pillarCarouselRef}
                    className="flex overflow-x-auto gap-[14px] pb-4 -mx-4 px-4"
                    style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                  >
                    {pillars.map((p, i) => (
                      <div key={i}
                           className="shrink-0 transition-all duration-350"
                           style={{
                             width: 232,
                             scrollSnapAlign: 'center',
                             transform: i === activePillar ? 'scale(1.04)' : 'scale(0.91)',
                             opacity:   i === activePillar ? 1 : 0.72,
                             transitionProperty: 'transform, opacity',
                             transitionDuration: '320ms',
                             transitionTimingFunction: 'ease',
                           }}>
                        <CardInner p={p} />
                      </div>
                    ))}
                    {/* Espacement droit pour que la 3e carte puisse se centrer */}
                    <div className="shrink-0 w-4" aria-hidden />
                  </div>
                </div>

                {/* ── DESKTOP : grille en escalier ── */}
                <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8 items-start">
                  {pillars.map((p, i) => (
                    <div key={i} style={{ marginTop: i === 1 ? 40 : i === 2 ? 80 : 0 }}>
                      <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: i * 0.2 }}
                      >
                        <TiltCard className="h-full">
                          <CardInner p={p} />
                        </TiltCard>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ══ 4. PROJET PÉDAGOGIQUE · Style Aiglon : dark + collage ══ */}
      <section className="relative overflow-hidden" style={{ background: '#0b1d3a' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch relative z-10">

          {/* ── Collage deux photos ── */}
          <Reveal animation="slideInLeft" className="relative p-10 md:p-14 flex items-center">
            <div className="relative w-full">
              {/* Grande photo */}
              <img
                src="/img/classe.jpg"
                alt="EPV · Classe"
                loading="lazy"
                className="w-full h-[280px] md:h-[340px] object-cover"
              />
              {/* Petite photo chevauchant en bas-droite */}
              <div className="absolute -bottom-10 right-6 w-[55%] border-[5px] shadow-2xl"
                   style={{ borderColor: '#0b1d3a' }}>
                <img
                  src="/img/co.jpeg"
                  alt="EPV · Vie scolaire"
                  loading="lazy"
                  className="w-full h-[170px] object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* ── Contenu texte ── */}
          <Reveal animation="slideInRight" className="flex items-center py-14 pb-20 lg:pb-14 px-10 md:px-14">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.35em] text-brand-gold mb-6">
                {lang === 'fr' ? "Notre Mission d'Abidjan" : 'Our Abidjan Mission'}
              </span>
              <h2 className="font-sans font-black text-white uppercase tracking-[0.06em] leading-tight mb-6" style={{fontSize:"clamp(1.6rem,4vw,3rem)"}}>
                {lang === 'fr' ? <>Former<br />l'élite<br /><span className="text-brand-gold">de demain.</span></> : <>Shaping<br />tomorrow's<br /><span className="text-brand-gold">elite.</span></>}
              </h2>
              <div className="h-px w-12 bg-brand-gold/45 mb-7" />
              <p className="text-white/65 font-serif leading-relaxed mb-5 text-sm">
                {lang === 'fr'
                  ? "Pour nous, « Horizons Savants » signifie repousser les frontières classiques d'apprentissage. Notre complexe à Bingerville offre plus qu'une simple éducation de base."
                  : 'For us, "Horizons Savants" means pushing beyond the classic boundaries of learning. Our Bingerville campus offers more than a basic education.'}
              </p>
              <p className="border-l-2 border-brand-gold pl-5 font-sans font-bold uppercase tracking-widest text-brand-gold/80 mb-8 text-xs">
                NOUS FAISONS DES SACHANTS DE DEMAIN
              </p>
              <button
                onClick={() => { onNavigate('#/ecole'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold hover:text-brand-gold-light transition-colors group"
              >
                {lang === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER'}
                <span className="inline-block h-px bg-brand-gold w-8 group-hover:w-14 transition-all duration-300" />
                <ArrowRight size={11} className="shrink-0" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 5. GALERIE · Bento Grid ══ */}
      <section className="py-24 px-4 md:px-8" style={{ background: '#F4F8FF' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal animation="bounceInUp" className="text-center mb-14">
            <span className="block text-[10px] font-bold uppercase tracking-[0.35em] text-brand-gold mb-5">
              {lang === 'fr' ? 'Notre Campus à Bingerville, Abidjan' : 'Our Campus in Bingerville, Abidjan'}
            </span>
            <h2 className="font-sans font-black text-brand-blue-deep uppercase tracking-[0.08em] leading-tight" style={{fontSize:"clamp(1.6rem,4vw,3rem)"}}>
              {lang === 'fr' ? 'Notre' : 'Our'}{' '}
              <span className="text-brand-gold">
                {lang === 'fr' ? 'Équipement' : 'Academic'}
              </span><br className="hidden md:block" />
              {lang === 'fr' ? 'Pédagogique' : 'Facilities'}
            </h2>
            <p className="font-serif text-sm text-brand-muted mt-5 max-w-xl mx-auto leading-relaxed">
              {lang === 'fr'
                ? "Un campus vert, entièrement climatisé, surveillé 24h/24 · conçu pour l'épanouissement, la sécurité et l'excellence de chaque enfant."
                : "A green, fully air-conditioned campus, monitored 24/7 · designed for the well-being, safety and excellence of every child."}
            </p>
            <div className="h-px w-12 bg-brand-gold/50 mx-auto mt-6" />
          </Reveal>
          <PhotoGallery />
        </div>
      </section>

      {/* ══ 6. TÉMOIGNAGES · Infinite Marquee ══ */}
      {TESTIMONIALS.length > 0 && <section className="relative py-20 overflow-hidden" style={{ background: '#0b1d3a' }}>

        {/* En-tête centré */}
        <Reveal animation="bounceInUp" className="text-center mb-12 px-4 relative z-10">
          <span className="block text-[10px] font-bold uppercase tracking-[0.35em] text-brand-gold mb-5">
            {lang === 'fr' ? 'Témoignages de confiance' : 'Trusted testimonials'}
          </span>
          <h2 className="font-sans font-black text-white uppercase tracking-[0.08em] leading-tight" style={{fontSize:"clamp(1.6rem,4vw,2.75rem)"}}>
            {lang === 'fr' ? 'Ce que disent' : 'What'}<br />
            {lang === 'fr' ? 'les' : ''}{' '}
            <span className="text-brand-gold">
              {lang === 'fr' ? 'Familles' : 'Families Say'}
            </span>
          </h2>
          <div className="h-px w-12 bg-brand-gold/45 mx-auto mt-5" />
        </Reveal>

        {/* Fenêtre exacte 3 cartes + masque bords fondu */}
        <div
          ref={marqueeContainerRef}
          className="relative z-10 mx-auto overflow-hidden"
          style={{
            maxWidth: `${CARD_STRIDE * 3 - CARD_GAP}px`,
            maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
          }}
          onMouseEnter={() => { marqueePausedRef.current = true; }}
          onMouseLeave={() => { marqueePausedRef.current = false; }}
        >
          <motion.div
            className="flex pt-10 pb-8"
            style={{ x: trackX, gap: `${CARD_GAP}px` }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <TestimonialCard
                key={idx}
                t={t}
                idx={idx}
                trackX={trackX}
                containerW={marqueeContainerW}
              />
            ))}
          </motion.div>
        </div>
      </section>}

      {/* ══ 7. CTA FINAL · Full Width, Interactive Tiles ══ */}
      <section className="relative py-24 px-4 md:px-8 overflow-hidden"
               style={{ background: 'linear-gradient(145deg,#06192e 0%,#0D2E5C 45%,#0a2550 100%)' }}>
        {/* Lueurs ambiantes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/6 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-blue-light/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal animation="bounceInUp" className="text-center mb-14">
            <h2 className="font-sans font-black text-white uppercase tracking-[0.06em] leading-tight" style={{fontSize:"clamp(1.6rem,4vw,2.75rem)"}}>
              {lang === 'fr' ? 'Offrez' : 'Give Your Child'}{' '}
              <span className="text-brand-gold">
                {lang === 'fr' ? "L'Excellence" : 'Excellence'}
              </span>
              {lang === 'fr' ? ' À Votre Enfant' : ''}
            </h2>
            <p className="mt-4 text-sm text-white/55 max-w-xl mx-auto font-serif">
              {lang === 'fr'
                ? "Le nombre de places pour la rentrée de Septembre 2026 est restreint pour préserver nos ambitions d'accompagnement."
                : "The number of places for September 2026 is limited to preserve our ambitions for personal accompaniment."}
            </p>
          </Reveal>

          {/* Interactive Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {([
              {
                icon: <ShieldAlert size={22} className="text-brand-gold" />, iconBg: 'bg-white/10',
                glow: 'rgba(245,166,35,0.25)', border: 'border-brand-gold/30',
                title: lang === 'fr' ? 'Espace Parent' : 'Parent Space',
                desc: lang === 'fr' ? 'Suivez votre dossier, rendez-vous et documents sécurisés en ligne.' : 'Track your file, appointments and secure documents online.',
                label: lang === 'fr' ? 'Se connecter' : 'Log in',
                action: () => { onNavigate('#/espace-parent'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
                btnClass: 'bg-brand-gold text-brand-blue-deep',
              },
              {
                icon: <GraduationCap size={22} className="text-brand-blue-light" />, iconBg: 'bg-white/10',
                glow: 'rgba(74,144,217,0.22)', border: 'border-brand-blue-light/30',
                title: lang === 'fr' ? 'Pré-inscription' : 'Pre-enrollment',
                desc: lang === 'fr' ? 'Déposez votre candidature en 5 minutes directement depuis chez vous.' : 'Submit your application in 5 minutes directly from home.',
                label: lang === 'fr' ? 'Commencer' : 'Start',
                action: handleCTA,
                btnClass: 'bg-white/15 text-white border border-white/25 hover:bg-white/25',
              },
              {
                icon: <BookOpen size={22} className="text-emerald-400" />, iconBg: 'bg-white/10',
                glow: 'rgba(45,140,60,0.18)', border: 'border-emerald-400/25',
                title: lang === 'fr' ? 'Nos Programmes' : 'Our Programs',
                desc: lang === 'fr' ? "Découvrez notre cursus maternelle & primaire bilingue d'excellence." : 'Discover our bilingual kindergarten & primary curriculum.',
                label: lang === 'fr' ? 'Découvrir' : 'Discover',
                action: () => { onNavigate('#/programmes'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
                btnClass: 'bg-white/15 text-white border border-white/25 hover:bg-white/25',
              },
            ] as const).map((tile, i) => (
              <Reveal key={i} delay={i * 100} animation="bounceInUp">
                <motion.div
                  whileHover={{ y: -10, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={tile.action}
                  className={`relative cursor-pointer rounded-sm p-6 overflow-hidden border ${tile.border}
                              bg-white/6 backdrop-blur-sm group`}
                >
                  {/* Radial glow au survol */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${tile.glow}, transparent 70%)` }}
                  />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className={`w-11 h-11 rounded-xl ${tile.iconBg} flex items-center justify-center`}>{tile.icon}</div>
                    <h3 className="font-sans font-bold text-lg text-white">{tile.title}</h3>
                    <p className="text-[12px] text-white/55 font-serif leading-relaxed flex-1">{tile.desc}</p>
                    <span className={`inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${tile.btnClass}`}>
                      {tile.label} <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Boutons principaux */}
          <div className="mt-12 flex justify-center">
            <Button variant="cta" className="px-8 py-3.5 font-bold" onClick={handleCTA}>
              <GraduationCap size={16} /> {lang === 'fr' ? 'Réserver ma Pré-inscription' : 'Reserve my Pre-enrollment'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
