
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, BookOpen, Star, Pencil, Globe, Award } from 'lucide-react';

const WORDS = ['Excellence', 'Rigueur', 'Bilinguisme', 'Épanouissement', 'Bienvenue !'];

const FLOATERS = [
  { icon: <GraduationCap size={30} />, x: '7%',  delay: 0,    dur: 4.2 },
  { icon: <BookOpen      size={22} />, x: '17%', delay: 0.6,  dur: 3.8 },
  { icon: <Star          size={16} />, x: '30%', delay: 0.2,  dur: 4.6 },
  { icon: <Pencil        size={20} />, x: '52%', delay: 1.0,  dur: 3.5 },
  { icon: <Globe         size={18} />, x: '68%', delay: 0.4,  dur: 4.0 },
  { icon: <Star          size={24} />, x: '80%', delay: 0.8,  dur: 3.9 },
  { icon: <BookOpen      size={14} />, x: '91%', delay: 0.3,  dur: 4.8 },
  { icon: <GraduationCap size={18} />, x: '42%', delay: 1.3,  dur: 3.6 },
  { icon: <Award         size={16} />, x: '60%', delay: 0.5,  dur: 4.3 },
  { icon: <Star          size={12} />, x: '24%', delay: 1.1,  dur: 3.7 },
];

interface SchoolLoaderProps {
  onComplete: () => void;
}

export const SchoolLoader: React.FC<SchoolLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [wordIdx, setWordIdx]   = useState(0);
  const completedRef            = useRef(false);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIdx(i => (i + 1) % WORDS.length);
    }, 480);

    const progressTimer = setInterval(() => {
      setProgress(p => {
        const next = p + 1.6;
        if (next >= 100 && !completedRef.current) {
          completedRef.current = true;
          clearInterval(progressTimer);
          setTimeout(onComplete, 450);
          return 100;
        }
        return next > 100 ? 100 : next;
      });
    }, 40);

    return () => {
      clearInterval(wordTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[300] bg-[#060d1a] flex flex-col items-center justify-center overflow-hidden select-none"
    >

      {/* Lueurs ambiantes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/7 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/6 blur-[80px] rounded-full pointer-events-none" />

      {/* Icônes flottantes */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-brand-gold/18 pointer-events-none"
          style={{ left: f.x, bottom: '-60px' }}
          animate={{ y: [0, -(window.innerHeight + 120)], opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: f.dur, delay: f.delay, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
        >
          {f.icon}
        </motion.div>
      ))}

      {/* Contenu central */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-8">

        {/* Logo avec halo doré */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-brand-gold/25 blur-3xl rounded-3xl scale-[1.8] pointer-events-none" />
          <div className="absolute inset-0 bg-brand-gold/10 blur-xl rounded-2xl scale-[1.3] pointer-events-none animate-pulse" />
          <img
            src="/img/logo.jpg"
            alt="EPV Horizons Savants"
            className="relative w-28 h-28 rounded-2xl object-contain bg-white p-2.5
                       shadow-[0_0_60px_rgba(245,166,35,0.3),0_20px_40px_rgba(0,0,0,0.4)]"
          />
        </motion.div>

        {/* Nom de l'école */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-center space-y-1"
        >
          <p className="font-sans font-extrabold text-2xl md:text-3xl text-white uppercase tracking-[0.08em]">
            EPV Horizons Savants
          </p>
        </motion.div>

        {/* 5 étoiles en cascade */}
        <motion.div
          className="flex gap-2.5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.65 } } }}
        >
          {[0,1,2,3,4].map(i => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0, rotate: -45 },
                show:   { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 14 } }
              }}
            >
              <Star size={18} className="fill-brand-gold text-brand-gold drop-shadow-[0_0_6px_rgba(245,166,35,0.8)]" />
            </motion.div>
          ))}
        </motion.div>

        {/* Mot rotatif */}
        <div className="h-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={wordIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.24 }}
              className="font-serif italic text-white/55 text-base md:text-lg"
            >
              {WORDS[wordIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Barre de progression */}
        <div className="w-72 md:w-80 flex flex-col gap-2">
          <div className="w-full h-[3px] bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/22 uppercase tracking-[0.25em]">
              Chargement de l'excellence
            </span>
            <span className="text-[9px] font-mono text-white/35 tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

      </div>

      {/* Ligne dorée en bas */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent"
        initial={{ width: '0%', left: '50%' }}
        animate={{ width: '100%', left: '0%' }}
        transition={{ delay: 0.3, duration: 2.4, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};
