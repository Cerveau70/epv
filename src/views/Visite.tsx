import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Utensils, Monitor, HeartPulse, Camera, Sun, BookOpen, Star, PencilLine } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

/* ─── Data ───────────────────────────────────────────────────────────────────── */

interface Space {
  id: string;
  label: { fr: string; en: string };
  description: { fr: string; en: string };
  Icon: React.FC<{ size?: number; className?: string }>;
  images: string[];
  tag: { fr: string; en: string };
}

const SPACES: Space[] = [
  {
    id: 'cour',
    label:       { fr: 'Cour de l\'École',       en: 'School Courtyard'    },
    description: { fr: 'Un espace de vie et de jeu spacieux où les élèves s\'épanouissent pendant les récréations, dans un environnement sécurisé.', en: 'A spacious play and social area where students thrive during recess, in a safe and secure environment.' },
    Icon: Sun,
    images: ['/visite/cour-ecole.jpg'],
    tag: { fr: 'Vie scolaire', en: 'School Life' },
  },
  {
    id: 'petite-section',
    label:       { fr: 'Petite Section',          en: 'Nursery Class'       },
    description: { fr: 'Des salles de classe chaleureuses et colorées, aménagées pour éveiller la curiosité des plus jeunes (PS, MS) dans un cadre bienveillant.', en: 'Warm and colorful classrooms designed to spark curiosity in our youngest learners (PS, MS) in a nurturing environment.' },
    Icon: Star,
    images: ['/visite/petite_section.jpg', '/visite/petit-section-2.jpg', '/visite/salle_petite%20section.jpg'],
    tag: { fr: 'Maternelle · PS / MS', en: 'Kindergarten · PS / MS' },
  },
  {
    id: 'grande-section',
    label:       { fr: 'Grande Section',          en: 'Senior Kindergarten' },
    description: { fr: 'Des espaces d\'apprentissage adaptés à la Grande Section, favorisant l\'autonomie et la préparation à l\'entrée au primaire.', en: 'Learning spaces tailored for the Senior Kindergarten level, fostering independence and readiness for primary school.' },
    Icon: BookOpen,
    images: ['/visite/grande_sections.jpg'],
    tag: { fr: 'Maternelle · GS', en: 'Kindergarten · GS' },
  },
  {
    id: 'primaire',
    label:       { fr: 'Classes du Primaire',     en: 'Primary Classrooms'  },
    description: { fr: 'Des salles de classe équipées et bien aménagées pour accompagner les élèves du CP au CM2 vers l\'excellence académique.', en: 'Well-equipped and thoughtfully arranged classrooms guiding students from CP1 to CM2 towards academic excellence.' },
    Icon: PencilLine,
    images: ['/visite/classe-cm1.jpg', '/visite/classe-cm2.jpg'],
    tag: { fr: 'Primaire · CM1 / CM2', en: 'Primary · CM1 / CM2' },
  },
  {
    id: 'cantine',
    label:       { fr: 'Cantine',                 en: 'Cafeteria'           },
    description: { fr: 'Un espace de restauration lumineux et agréable, conçu pour offrir aux élèves des repas équilibrés dans un cadre convivial.', en: 'A bright and welcoming dining space designed to offer students balanced meals in a friendly atmosphere.' },
    Icon: Utensils,
    images: ['/visite/cantine.jpg', '/visite/cantine-2.jpg'],
    tag: { fr: 'Restauration', en: 'Dining' },
  },
  {
    id: 'informatique',
    label:       { fr: 'Salle Informatique',      en: 'Computer Lab'        },
    description: { fr: 'Salle équipée de matériel récent pour initier les élèves aux technologies du numérique dès le plus jeune âge.', en: 'A room equipped with modern technology to introduce students to digital skills from an early age.' },
    Icon: Monitor,
    images: ['/visite/salle_informatique.jpg'],
    tag: { fr: 'Numérique', en: 'Digital' },
  },
  {
    id: 'infirmerie',
    label:       { fr: 'Infirmerie',              en: 'Medical Room'        },
    description: { fr: 'Suivi médical et bien-être des élèves assurés par un personnel qualifié. Un espace sûr et rassurant pour chaque enfant.', en: 'Medical monitoring and student well-being ensured by qualified staff. A safe and reassuring space for every child.' },
    Icon: HeartPulse,
    images: ['/visite/infimerie.jpg', '/visite/infimerie-2.jpg', '/visite/infimerie-3.jpg'],
    tag: { fr: 'Santé & Bien-être', en: 'Health & Well-being' },
  },
];

const ACCENT = '#C9A84C'; // or doré unique, sobre

/* Ken Burns patterns */
const KB = [
  { scale: [1, 1.09], x: ['0%', '-2%'], y: ['0%', '-1.5%'] },
  { scale: [1.05, 1], x: ['-1%', '1.5%'], y: ['-1%', '0.5%'] },
  { scale: [1, 1.07], x: ['1%', '-1%'], y: ['0.5%', '-1%'] },
  { scale: [1.04, 1.01], x: ['0%', '1%'], y: ['-0.5%', '1%'] },
];

/* ─── Main page ───────────────────────────────────────────────────────────────── */
export const Visite: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const L = (o: { fr: string; en: string }) => o[lang as 'fr' | 'en'];
  const [spaceIdx, setSpaceIdx] = useState(0);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [dir,      setDir]      = useState<1 | -1>(1);
  const [imgDir,   setImgDir]   = useState<1 | -1>(1);

  const space = SPACES[spaceIdx];

  const goSpace = useCallback((idx: number, d: 1 | -1) => {
    setDir(d);
    setSpaceIdx(idx);
    setImgIdx(0);
  }, []);

  const prevImg = () => {
    setImgDir(-1);
    setImgIdx(i => (i - 1 + space.images.length) % space.images.length);
  };
  const nextImg = () => {
    setImgDir(1);
    setImgIdx(i => (i + 1) % space.images.length);
  };

  useEffect(() => {
    if (space.images.length < 2) return;
    const t = setTimeout(() => nextImg(), 6000);
    return () => clearTimeout(t);
  }, [spaceIdx, imgIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp')    goSpace((spaceIdx - 1 + SPACES.length) % SPACES.length, -1);
      if (e.key === 'ArrowDown')  goSpace((spaceIdx + 1) % SPACES.length, 1);
      if (e.key === 'ArrowLeft')  prevImg();
      if (e.key === 'ArrowRight') nextImg();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [spaceIdx, imgIdx]);

  const kb = KB[(spaceIdx * 2 + imgIdx) % KB.length];
  const imgKey = `${spaceIdx}-${imgIdx}`;

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 5.5rem)', background: '#050E1D', display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-5.5rem)]">

        {/* ══ LEFT PANEL ══ */}
        <div
          className="relative z-10 flex flex-col justify-between lg:justify-start
                     w-full lg:w-[360px] shrink-0
                     px-6 py-8 lg:px-10 lg:py-10 overflow-y-auto"
          style={{
            background: 'linear-gradient(160deg, #060F1F 0%, #0A1E3D 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Camera size={11} style={{ color: 'rgba(255,255,255,0.28)' }} />
              <span className="text-[8px] font-semibold uppercase tracking-[0.45em]"
                    style={{ color: 'rgba(255,255,255,0.28)' }}>
                {fr ? 'Visite de l\'établissement' : 'School Tour'}
              </span>
            </div>
            <h1 className="text-white font-extrabold text-2xl lg:text-3xl leading-tight"
                style={{ letterSpacing: '-0.02em' }}>
              {fr ? <>École en<br /><span style={{ color: ACCENT }}>Images</span></> : <>School in<br /><span style={{ color: ACCENT }}>Pictures</span></>}
            </h1>
            <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              EPV Horizons Savants · Abidjan
            </p>
          </div>

          {/* Space selector */}
          <div className="flex flex-row lg:flex-col gap-1.5 mb-7 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
               style={{ scrollbarWidth: 'none' }}>
            {SPACES.map((s, i) => {
              const active = i === spaceIdx;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => goSpace(i, i > spaceIdx ? 1 : -1)}
                  whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer shrink-0 text-left transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: active ? 'rgba(201,168,76,0.20)' : 'rgba(255,255,255,0.06)' }}>
                    <s.Icon size={13}
                      style={{ color: active ? ACCENT : 'rgba(255,255,255,0.35)' }} />
                  </div>
                  <div className="relative min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] leading-none mb-0.5 truncate"
                       style={{ color: active ? ACCENT : 'rgba(255,255,255,0.25)' }}>
                      {L(s.tag)}
                    </p>
                    <p className="text-[12px] font-bold leading-tight truncate"
                       style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                      {L(s.label)}
                    </p>
                  </div>
                  {s.images.length > 1 && (
                    <span className="relative ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: active ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.06)',
                            color: active ? ACCENT : 'rgba(255,255,255,0.28)',
                          }}>
                      {s.images.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Description espace actif */}
          <AnimatePresence mode="wait">
            <motion.div key={space.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center"
                     style={{ background: 'rgba(201,168,76,0.18)' }}>
                  <space.Icon size={11} style={{ color: ACCENT }} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                      style={{ color: ACCENT }}>
                  {L(space.tag)}
                </span>
              </div>
              <h2 className="text-white font-extrabold text-lg mb-2"
                  style={{ letterSpacing: '-0.01em' }}>
                {L(space.label)}
              </h2>
              <p className="text-[12px] leading-[1.75]"
                 style={{ color: 'rgba(255,255,255,0.38)' }}>
                {L(space.description)}
              </p>

              {space.images.length > 1 && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[9px] uppercase tracking-[0.28em]"
                        style={{ color: 'rgba(255,255,255,0.20)' }}>
                    {fr ? 'Photo' : 'Photo'}
                  </span>
                  {space.images.map((_, i) => (
                    <button key={i} onClick={() => { setImgDir(i > imgIdx ? 1 : -1); setImgIdx(i); }}
                            className="rounded-full cursor-pointer transition-all duration-300"
                            style={{
                              width: i === imgIdx ? '18px' : '5px', height: '5px',
                              background: i === imgIdx ? ACCENT : 'rgba(255,255,255,0.18)',
                            }} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows desktop */}
          <div className="hidden lg:flex items-center gap-2 mt-auto pt-4">
            <motion.button
              onClick={() => goSpace((spaceIdx - 1 + SPACES.length) % SPACES.length, -1)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.92 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)' }}>
              <ChevronLeft size={11} /> {fr ? 'Préc.' : 'Prev.'}
            </motion.button>
            <motion.button
              onClick={() => goSpace((spaceIdx + 1) % SPACES.length, 1)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.92 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)' }}>
              {fr ? 'Suiv.' : 'Next'} <ChevronRight size={11} />
            </motion.button>
          </div>
        </div>

        {/* ══ RIGHT PANEL image immersive ══ */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: '55vw' }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={imgKey}
              className="absolute inset-0"
              initial={{ opacity: 0, x: imgDir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: imgDir * -40 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={space.images[imgIdx]}
                alt={`${L(space.label)} photo ${imgIdx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ scale: kb.scale as any, x: kb.x as any, y: kb.y as any }}
                transition={{ duration: 14, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              />
              {/* Gradients sombres sans surbrillance colorée */}
              <div className="absolute inset-0"
                   style={{ background: 'linear-gradient(to right, rgba(5,14,29,0.55) 0%, rgba(5,14,29,0.10) 45%, transparent 70%)' }} />
              <div className="absolute inset-0"
                   style={{ background: 'linear-gradient(to top, rgba(5,14,29,0.70) 0%, transparent 40%)' }} />
            </motion.div>
          </AnimatePresence>

          {/* Label espace bas gauche */}
          <AnimatePresence mode="wait">
            <motion.div
              key={space.id}
              className="absolute bottom-8 left-6 lg:bottom-10 lg:left-10 z-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, delay: 0.12 }}
            >
              <p className="text-[8px] font-semibold uppercase tracking-[0.40em] mb-1"
                 style={{ color: 'rgba(201,168,76,0.85)' }}>
                {L(space.tag)}
              </p>
              <h3 className="text-white font-extrabold text-2xl lg:text-3xl"
                  style={{ letterSpacing: '-0.02em', textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}>
                {L(space.label)}
              </h3>
            </motion.div>
          </AnimatePresence>

          {/* Flèches navigation photos */}
          {space.images.length > 1 && (
            <>
              <motion.button
                onClick={prevImg}
                whileHover={{ scale: 1.10, x: -2 }} whileTap={{ scale: 0.90 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <ChevronLeft size={16} className="text-white/70" />
              </motion.button>
              <motion.button
                onClick={nextImg}
                whileHover={{ scale: 1.10, x: 2 }} whileTap={{ scale: 0.90 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <ChevronRight size={16} className="text-white/70" />
              </motion.button>
            </>
          )}

          {/* Compteur photos haut droite */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5"
               style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-white font-bold text-[11px]">{imgIdx + 1}</span>
            <span className="text-white/35 text-[11px]">/ {space.images.length}</span>
          </div>

          {/* Barre de progression */}
          {space.images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 z-10"
                 style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                key={imgKey}
                className="h-full"
                style={{ background: ACCENT }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 6, ease: 'linear' }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
