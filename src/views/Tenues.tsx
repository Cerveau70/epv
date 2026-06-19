import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Shirt, Award } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

interface Piece {
  label: string;
  color: string;
  colorName: string;
}

interface Kit {
  id: string;
  numero: string;
  categorie: string;
  nom: string;
  sousTitre: string;
  usage: string;
  occasion: string;
  description: string;
  images: string[];
  pieces: Piece[];
  accentColor: string;
}

const KITS: Kit[] = [
  {
    id: 'garcon',
    numero: '01',
    categorie: 'Tenue Académique',
    nom: 'Collection',
    sousTitre: 'Garçon',
    usage: 'Journées scolaires',
    occasion: 'Académique',
    description: 'Chemise en popeline bleue ciel, short chino marine taille élastique et nœud papillon assorti.',
    images: ['/tenue/tenhomme.jpg'],
    pieces: [
      { label: 'Chemise manches courtes', color: '#AED6F1', colorName: 'Bleu ciel' },
      { label: 'Short chino',             color: '#1A2A5E', colorName: 'Marine'    },
      { label: 'Nœud papillon',           color: '#1A2A5E', colorName: 'Marine'    },
    ],
    accentColor: '#60A5FA',
  },
  {
    id: 'fille',
    numero: '02',
    categorie: 'Tenue Académique',
    nom: 'Collection',
    sousTitre: 'Fille',
    usage: 'Journées scolaires',
    occasion: 'Académique',
    description: 'Chemisier à manches bouffantes bleu ciel, jupe plissée marine à taille confortable et nœud papillon coordonné.',
    images: ['/tenue/tenufem.jpg'],
    pieces: [
      { label: 'Chemisier manches bouffantes', color: '#AED6F1', colorName: 'Bleu ciel' },
      { label: 'Jupe plissée',                 color: '#1A2A5E', colorName: 'Marine'    },
      { label: 'Nœud papillon',                color: '#1A2A5E', colorName: 'Marine'    },
    ],
    accentColor: '#F472B6',
  },
  {
    id: 'sport',
    numero: '03',
    categorie: 'Tenue Sportive',
    nom: 'Kit Sport',
    sousTitre: 'Horizons Savants',
    usage: 'EPS & Compétitions',
    occasion: 'Sportif',
    description: 'Tee-shirt sublimation blanc aux liserés vert/or/marine, logo Horizons Savants brodé. Culotte navy bandes tricolores. Glissez pour tourner.',
    images: ['/tenue/teeshirt.jpg', '/tenue/cullote.jpg'],
    pieces: [
      { label: 'Tee-shirt sublimation',    color: '#FFFFFF', colorName: 'Blanc'    },
      { label: 'Culotte bandes tricolores', color: '#1A2A5E', colorName: 'Marine'  },
      { label: 'Liserés décoratifs',        color: '#F5C518', colorName: 'Or / Vert'},
    ],
    accentColor: '#F5C518',
  },
];

/* ─── Drag-to-rotate card (FIFA style) ─────────────────────────────────────── */
function OutfitCard({ kit }: { kit: Kit }) {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [imgIdx,     setImgIdx]     = useState(0);
  const [scaleX,     setScaleX]     = useState(1);
  const [tiltY,      setTiltY]      = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number } | null>(null);
  const multi   = kit.images.length > 1;
  const segSize = 360 / kit.images.length;

  useEffect(() => {
    setImgIdx(0); setScaleX(1); setTiltY(0);
    setIsDragging(false); dragRef.current = null;
  }, [kit.id]);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX };
    setIsDragging(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    if (!multi) {
      setTiltY(Math.max(-22, Math.min(22, delta * 0.12)));
      return;
    }
    const rot      = ((delta * 0.75) % 360 + 360) % 360;
    const seg      = Math.floor(rot / segSize) % kit.images.length;
    const posInSeg = (rot % segSize) / segSize;
    setImgIdx(seg);
    setScaleX(Math.abs(Math.cos(posInSeg * Math.PI)));
  };

  const onUp = () => {
    dragRef.current = null;
    setIsDragging(false);
    setScaleX(1);
    setTiltY(0);
  };

  return (
    /* Taille responsive : plus petite sur mobile, pleine sur desktop */
    <div
      onPointerDown={onDown} onPointerMove={onMove}
      onPointerUp={onUp}    onPointerLeave={onUp}
      className="relative select-none"
      style={{
        width:  'clamp(200px, 68vw, 300px)',
        height: 'clamp(260px, 88vw, 390px)',
        cursor: isDragging ? 'grabbing' : 'grab',
        perspective: '900px',
      }}
    >
      {/* Floor shadow */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"
           style={{
             width: '60%', height: '24px',
             background: 'radial-gradient(ellipse, rgba(0,0,0,0.32) 0%, transparent 75%)',
             filter: 'blur(5px)',
           }} />

      {/* Drag-transform wrapper */}
      <div className="absolute inset-0 flex items-center justify-center"
           style={{
             transform: isDragging
               ? multi ? `scaleX(${scaleX})` : `rotateY(${tiltY}deg)`
               : 'scaleX(1) rotateY(0deg)',
             transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
           }}>
        <motion.img
          key={kit.images[imgIdx]}
          src={kit.images[imgIdx]}
          alt={kit.nom}
          draggable={false}
          initial={{ opacity: 0.7 }}
          animate={isDragging
            ? { y: 0, opacity: 1 }
            : { y: [0, -8, 0], opacity: 1 }}
          transition={isDragging
            ? { duration: 0.1 }
            : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.15 } }}
          className="h-full w-full object-contain pointer-events-none"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.50))' }}
        />
      </div>

      {/* Image dots */}
      {multi && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {kit.images.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-200"
                 style={{
                   width: i === imgIdx ? '16px' : '5px', height: '5px',
                   background: i === imgIdx ? kit.accentColor : 'rgba(255,255,255,0.22)',
                 }} />
          ))}
        </div>
      )}

      {/* Drag hint */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none whitespace-nowrap"
           style={{
             color: 'rgba(255,255,255,0.28)', fontSize: '7px',
             textTransform: 'uppercase', letterSpacing: '0.28em',
             fontFamily: 'Inter, Poppins, sans-serif',
           }}>
        <ChevronLeft size={7} />
        <span>{fr ? 'Glisser pour tourner' : 'Drag to rotate'}</span>
        <ChevronRight size={7} />
      </div>
    </div>
  );
}

/* ─── Piece row ─────────────────────────────────────────────────────────────── */
function PieceRow({ piece, index }: { piece: Piece; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.28 }}
      className="flex items-center gap-2.5 py-2"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
           style={{
             background: piece.color,
             boxShadow: piece.color === '#FFFFFF' ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
           }} />
      <span className="flex-1 text-[11px] text-white/70"
            style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
        {piece.label}
      </span>
      <span className="text-[8.5px] font-semibold uppercase tracking-wider text-white/28"
            style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
        {piece.colorName}
      </span>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */
export const Tenues: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const kit = KITS[activeIdx];

  const goTo = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir); setActiveIdx(idx);
  }, []);

  const prev = () => goTo((activeIdx - 1 + KITS.length) % KITS.length, -1);
  const next = () => goTo((activeIdx + 1) % KITS.length, 1);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeIdx]);

  useEffect(() => {
    const t = setTimeout(() => next(), 9000);
    return () => clearTimeout(t);
  }, [activeIdx]);

  return (
    <div className="min-h-screen relative overflow-hidden select-none"
         style={{ background: 'linear-gradient(148deg, #050E1D 0%, #0A1E3D 50%, #071528 100%)' }}>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{
              width: i % 6 === 0 ? '2px' : '1px', height: i % 6 === 0 ? '2px' : '1px',
              left: `${(i * 41) % 100}%`, top: `${(i * 57) % 100}%`,
              opacity: 0.07 + (i % 4) * 0.04,
            }}
            animate={{ opacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 2.8 + (i % 5) * 0.7, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 pt-6 lg:pt-10 pb-3 lg:pb-6 text-center px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="text-[7px] lg:text-[8px] font-semibold uppercase tracking-[0.5em] mb-1"
             style={{ color: kit.accentColor, fontFamily: 'Inter, Poppins, sans-serif' }}>
            EPV Horizons Savants · Abidjan
          </p>
          <h1 className="text-white font-extrabold text-xl lg:text-3xl leading-tight"
              style={{ fontFamily: 'Inter, Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            {fr ? 'Collection Uniformes' : 'School Uniform Collection'}
          </h1>
          <p className="text-white/28 text-[10px] mt-1"
             style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
            {fr ? 'Année scolaire 2025 – 2026' : 'School Year 2025 – 2026'}
          </p>
        </motion.div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center
                      justify-center gap-6 lg:gap-20 px-4 lg:px-6
                      pb-6 lg:pb-14 max-w-[1100px] mx-auto">

        {/* Left: image */}
        <div className="relative flex items-center justify-center w-full lg:w-auto"
             style={{ minHeight: 'clamp(310px, 100vw, 500px)' }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, x: direction * 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -60, scale: 0.92 }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <OutfitCard kit={kit} />
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows plus petites sur mobile */}
          {[{ fn: prev, Icon: ChevronLeft, side: 'left-0 lg:-left-2' },
            { fn: next, Icon: ChevronRight, side: 'right-0 lg:-right-2' }].map(({ fn, Icon, side }) => (
            <motion.button
              key={side} onClick={fn}
              whileHover={{ scale: 1.10 }} whileTap={{ scale: 0.88 }}
              className={`absolute ${side} top-1/2 -translate-y-1/2 z-20
                         w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center
                         cursor-pointer border border-white/10`}
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
            >
              <Icon size={15} className="text-white/50" />
            </motion.button>
          ))}

        </div>

        {/* Right: details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={kit.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col w-full max-w-[420px] lg:max-w-[380px]"
          >
            {/* Number + name */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="font-black leading-none tabular-nums hidden sm:block"
                    style={{
                      fontSize: 'clamp(28px, 8vw, 44px)',
                      color: kit.accentColor, fontFamily: 'Inter, Poppins, sans-serif',
                      opacity: 0.20, letterSpacing: '-0.04em',
                    }}>
                {kit.numero}
              </span>
              <div>
                <p className="text-[7.5px] lg:text-[8.5px] font-semibold uppercase tracking-[0.35em]"
                   style={{ color: kit.accentColor, fontFamily: 'Inter, Poppins, sans-serif' }}>
                  {kit.categorie}
                </p>
                <h2 className="text-white font-extrabold leading-tight"
                    style={{
                      fontSize: 'clamp(20px, 6vw, 30px)',
                      fontFamily: 'Inter, Poppins, sans-serif', letterSpacing: '-0.025em',
                    }}>
                  {kit.nom}<br />
                  <span style={{ color: kit.accentColor }}>{kit.sousTitre}</span>
                </h2>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               text-[8px] lg:text-[9px] font-semibold uppercase tracking-wider border"
                    style={{
                      background: `${kit.accentColor}18`, borderColor: `${kit.accentColor}35`,
                      color: kit.accentColor, fontFamily: 'Inter, Poppins, sans-serif',
                    }}>
                <Award size={8} />{kit.occasion}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               text-[8px] lg:text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.48)', fontFamily: 'Inter, Poppins, sans-serif',
                    }}>
                <Shirt size={8} />{kit.usage}
              </span>
            </div>

            {/* Description */}
            <p className="text-[11px] lg:text-[12.5px] leading-[1.7] mb-5"
               style={{ color: 'rgba(255,255,255,0.44)', fontFamily: 'Inter, Poppins, sans-serif' }}>
              {kit.description}
            </p>

            {/* Separator */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[7.5px] uppercase tracking-[0.30em] font-semibold"
                    style={{ color: 'rgba(255,255,255,0.20)', fontFamily: 'Inter, Poppins, sans-serif' }}>
                {fr ? 'Pièces incluses' : 'Included items'}
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Pieces */}
            <div className="mb-4">
              {kit.pieces.map((piece, i) => <PieceRow key={piece.label} piece={piece} index={i} />)}
            </div>

            {/* Swatches */}
            <div className="flex items-center gap-3">
              {kit.pieces.map(p => (
                <div key={p.colorName} className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full border border-white/15"
                       style={{
                         background: p.color,
                         boxShadow: p.color === '#FFFFFF'
                           ? '0 0 0 1px rgba(255,255,255,0.25)'
                           : `0 2px 8px ${p.color}55`,
                       }} />
                  <span className="text-[7px] lg:text-[8px] text-white/25"
                        style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
                    {p.colorName.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom tabs scrollables sur mobile ── */}
      <div className="relative z-10 pb-8 pt-6 flex justify-center px-4">
        <div className="flex gap-1.5 lg:gap-2 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl overflow-x-auto max-w-full"
             style={{
               background: 'rgba(255,255,255,0.04)',
               border: '1px solid rgba(255,255,255,0.07)',
               scrollbarWidth: 'none',
             }}>
          {KITS.map((k, i) => (
            <motion.button
              key={k.id}
              onClick={() => goTo(i, i > activeIdx ? 1 : -1)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              className="relative flex flex-col items-center shrink-0
                         px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl cursor-pointer"
              style={{
                background: i === activeIdx ? `${KITS[i].accentColor}18` : 'transparent',
                border: `1px solid ${i === activeIdx ? KITS[i].accentColor + '40' : 'transparent'}`,
              }}
            >
              {i === activeIdx && (
                <motion.div layoutId="kit-tab-glow"
                  className="absolute inset-0 rounded-lg lg:rounded-xl"
                  style={{ background: `${KITS[i].accentColor}08` }} />
              )}
              <span className="relative text-[7px] lg:text-[8px] font-bold uppercase tracking-[0.25em] mb-0.5"
                    style={{
                      color: i === activeIdx ? KITS[i].accentColor : 'rgba(255,255,255,0.22)',
                      fontFamily: 'Inter, Poppins, sans-serif',
                    }}>
                {k.categorie}
              </span>
              <span className="relative text-[10px] lg:text-[11px] font-extrabold whitespace-nowrap"
                    style={{
                      color: i === activeIdx ? '#FFFFFF' : 'rgba(255,255,255,0.32)',
                      fontFamily: 'Inter, Poppins, sans-serif',
                    }}>
                {k.sousTitre}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div className="relative z-10 text-center pb-4">
        <p className="text-[7px] uppercase tracking-[0.30em]"
           style={{ color: 'rgba(255,255,255,0.10)', fontFamily: 'Inter, Poppins, sans-serif' }}>
          EPV Horizons Savants · {fr ? 'Tenues officielles 2025–2026' : 'Official Uniforms 2025–2026'} · Abidjan
        </p>
      </div>
    </div>
  );
};
