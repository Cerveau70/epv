/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ParentLoaderProps { onComplete: () => void; }

/* ── Maison 3D isométrique ───────────────────────────────────────────── */
function House3D() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 160 140" className="w-40 h-36" aria-hidden>
        <defs>
          <linearGradient id="roofTop" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="roofLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BE123C" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="wallLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE8D8" />
            <stop offset="100%" stopColor="#FFF1E9" />
          </linearGradient>
          <linearGradient id="wallRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF1E9" />
            <stop offset="100%" stopColor="#FFDDD1" />
          </linearGradient>
          <radialGradient id="houseSheen" cx="30%" cy="25%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ombre */}
        <ellipse cx="80" cy="128" rx="50" ry="10" fill="rgba(0,0,0,0.09)" />

        {/* Mur gauche */}
        <polygon points="28,72 80,88 80,118 28,102" fill="url(#wallLeft)" />
        {/* Mur droit */}
        <polygon points="132,72 80,88 80,118 132,102" fill="url(#wallRight)" />
        {/* Sol/base */}
        <polygon points="28,102 80,118 132,102 80,86" fill="#FFDDD1" />

        {/* Toit — face gauche */}
        <polygon points="28,72 80,44 80,72 28,72" fill="url(#roofLeft)" />
        {/* Toit — face droite */}
        <polygon points="132,72 80,44 80,72 132,72" fill="url(#roofTop)" />
        {/* Toit — dessus (arête) */}
        <polygon points="28,72 80,44 132,72 80,72" fill="#FB7185" />
        {/* Reflet toit */}
        <polygon points="80,46 116,68 108,70 80,50" fill="white" opacity="0.22" />
        {/* Cheminée */}
        <rect x="58" y="36" width="10" height="18" rx="2" fill="#BE123C" />
        <rect x="55" y="32" width="16" height="6" rx="2" fill="#E11D48" />
        {/* Fumée */}
        <motion.ellipse cx="63" cy="26" rx="5" ry="4" fill="#CBD5E1" opacity="0.5"
          animate={{ y: [0, -8, 0], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.ellipse cx="67" cy="18" rx="4" ry="3" fill="#CBD5E1" opacity="0.35"
          animate={{ y: [0, -6, 0], opacity: [0.35, 0.05, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} />

        {/* Porte */}
        <rect x="68" y="98" width="24" height="20" rx="3" fill="#A16207" />
        <rect x="68" y="98" width="11" height="20" rx="2" fill="#CA8A04" />
        <circle cx="89" cy="109" r="2" fill="#FCD34D" />

        {/* Fenêtre gauche */}
        <rect x="34" y="80" width="20" height="16" rx="2" fill="#BAE6FD" />
        <rect x="34" y="80" width="9" height="16" rx="1" fill="white" opacity="0.3" />
        <line x1="44" y1="80" x2="44" y2="96" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="34" y1="88" x2="54" y2="88" stroke="white" strokeWidth="1" opacity="0.5" />

        {/* Fenêtre droite */}
        <rect x="106" y="80" width="20" height="16" rx="2" fill="#BAE6FD" />
        <rect x="106" y="80" width="9" height="16" rx="1" fill="white" opacity="0.3" />
        <line x1="116" y1="80" x2="116" y2="96" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="106" y1="88" x2="126" y2="88" stroke="white" strokeWidth="1" opacity="0.5" />

        {/* Reflet mur gauche */}
        <polygon points="28,72 80,88 80,118 28,102" fill="url(#houseSheen)" />
      </svg>
    </motion.div>
  );
}

/* ── Cœur 3D flottant ────────────────────────────────────────────────── */
function Heart3D({ x, y, color, size = 36, delay = 0 }: {
  x: string; y: string; color: string; size?: number; delay?: number;
}) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -12, 0], scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 2.8 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg viewBox="0 0 44 40" style={{ width: size, height: size }} aria-hidden>
        <defs>
          <radialGradient id={`hg-${delay}`} cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
        </defs>
        <path d="M22 36 C22 36 4 24 4 13 C4 7 9 3 15 4 C18 4 22 7 22 7 C22 7 26 4 29 4 C35 3 40 7 40 13 C40 24 22 36 22 36 Z"
          fill={`url(#hg-${delay})`} />
        <path d="M22 33 C22 33 7 22 7 13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
        <ellipse cx="15" cy="8" rx="4" ry="3" fill="white" opacity="0.25" transform="rotate(-25 15 8)" />
        <ellipse cx="22" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.08)" />
      </svg>
    </motion.div>
  );
}

/* ── Livre 3D flottant ───────────────────────────────────────────────── */
function Book3D({ x, y, color, darkColor, size = 48, delay = 0 }: {
  x: string; y: string; color: string; darkColor: string; size?: number; delay?: number;
}) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
      transition={{ duration: 3.2 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg viewBox="0 0 54 64" style={{ width: size, height: size }} aria-hidden>
        {/* Ombre */}
        <ellipse cx="27" cy="61" rx="18" ry="5" fill="rgba(0,0,0,0.08)" />
        {/* Couverture arrière */}
        <rect x="8" y="6" width="36" height="50" rx="3" fill={darkColor} />
        {/* Pages (tranche) */}
        <rect x="10" y="6" width="34" height="50" rx="2" fill="#F1F5F9" />
        <rect x="11" y="7" width="4" height="48" rx="1" fill="#E2E8F0" />
        {/* Lignes de pages */}
        {[14,18,22,26,30,34,38,42,46].map((y, i) => (
          <line key={i} x1="16" y1={y} x2="42" y2={y} stroke="#CBD5E1" strokeWidth="0.8" />
        ))}
        {/* Couverture avant */}
        <rect x="6" y="4" width="36" height="52" rx="3" fill={color} />
        {/* Reflet couverture */}
        <rect x="7" y="5" width="12" height="50" rx="2" fill="white" opacity="0.2" />
        {/* Titre sur couverture */}
        <rect x="12" y="16" width="24" height="3" rx="1.5" fill="white" opacity="0.5" />
        <rect x="14" y="22" width="20" height="2" rx="1" fill="white" opacity="0.35" />
        <rect x="16" y="27" width="16" height="2" rx="1" fill="white" opacity="0.25" />
        {/* Étoile déco */}
        <polygon points="24,34 26,29 28,34 33,34 29,37 31,42 26,38 21,42 23,37 19,34"
          fill="white" opacity="0.4" transform="scale(0.6) translate(16,20)" />
        {/* Tranche spine */}
        <rect x="6" y="4" width="6" height="52" rx="3" fill={darkColor} />
        <rect x="7" y="4" width="3" height="52" rx="2" fill="white" opacity="0.15" />
      </svg>
    </motion.div>
  );
}

/* ── Pomme 3D ────────────────────────────────────────────────────────── */
function Apple3D({ x, y, size = 40, delay = 0 }: {
  x: string; y: string; size?: number; delay?: number;
}) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -9, 0], rotate: [-5, 5, -5] }}
      transition={{ duration: 2.5 + delay * 0.3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg viewBox="0 0 44 48" style={{ width: size, height: size }} aria-hidden>
        <defs>
          <radialGradient id={`appleG-${delay}`} cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="60%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </radialGradient>
        </defs>
        {/* Ombre */}
        <ellipse cx="22" cy="46" rx="13" ry="4" fill="rgba(0,0,0,0.1)" />
        {/* Corps */}
        <path d="M22 10 C10 10 5 20 5 28 C5 38 12 44 22 44 C32 44 39 38 39 28 C39 20 34 10 22 10 Z"
          fill={`url(#appleG-${delay})`} />
        {/* Encoche haut gauche */}
        <path d="M16 12 C16 8 20 6 22 10" fill={`url(#appleG-${delay})`} />
        {/* Reflet */}
        <ellipse cx="15" cy="18" rx="5" ry="7" fill="white" opacity="0.3" transform="rotate(-20 15 18)" />
        {/* Queue */}
        <path d="M22 10 C22 6 26 2 28 4" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Petite feuille */}
        <ellipse cx="28" cy="5" rx="5" ry="3" fill="#22C55E" transform="rotate(-30 28 5)" />
        <ellipse cx="28" cy="5" rx="2" ry="1.5" fill="#86EFAC" opacity="0.5" transform="rotate(-30 28 5)" />
      </svg>
    </motion.div>
  );
}

/* ── Livre empilé pour la barre de chargement ────────────────────────── */
function StackBook({ color, highlight, spine }: { color: string; highlight: string; spine: string }) {
  return (
    <svg viewBox="0 0 28 20" style={{ width: 28, height: 20 }} aria-hidden>
      <rect x="2" y="2" width="24" height="16" rx="2" fill={color} />
      <rect x="2" y="2" width="5" height="16" rx="2" fill={spine} />
      <rect x="3" y="3" width="2" height="14" rx="1" fill="white" opacity="0.2" />
      <rect x="9" y="6" width="14" height="2" rx="1" fill={highlight} opacity="0.6" />
      <rect x="9" y="10" width="10" height="1.5" rx="1" fill={highlight} opacity="0.4" />
    </svg>
  );
}

/* ── Données des livres ──────────────────────────────────────────────── */
const BOOKS = [
  { color: '#FB7185', highlight: '#FDE4E8', spine: '#E11D48' },
  { color: '#F97316', highlight: '#FED7AA', spine: '#C2410C' },
  { color: '#FBBF24', highlight: '#FEF08A', spine: '#D97706' },
  { color: '#22C55E', highlight: '#BBF7D0', spine: '#15803D' },
  { color: '#A855F7', highlight: '#E9D5FF', spine: '#7E22CE' },
];

/* ── Loader principal ─────────────────────────────────────────────────── */
export const ParentLoader: React.FC<ParentLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + 1.6;
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          setTimeout(onComplete, 500);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  const activeBooks = Math.ceil((progress / 100) * BOOKS.length);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #FFF1F2 0%, #FFF7ED 45%, #F0FDF4 100%)' }}
    >
      {/* Pattern pois */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(251,113,133,0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Blobs de couleur */}
      <div className="absolute top-[-6%] right-[-4%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-8%] left-[-4%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
      <div className="absolute top-[35%] left-[8%] w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)' }} />

      {/* Objets 3D flottants */}
      <Heart3D x="3%"  y="7%"  color="#FB7185" size={52} delay={0}   />
      <Heart3D x="80%" y="5%"  color="#F97316" size={40} delay={0.7} />
      <Heart3D x="85%" y="62%" color="#A855F7" size={44} delay={1.2} />
      <Heart3D x="5%"  y="65%" color="#FBBF24" size={36} delay={0.4} />
      <Heart3D x="45%" y="2%"  color="#22C55E" size={32} delay={0.9} />

      <Book3D x="72%" y="20%" color="#3B82F6" darkColor="#1D4ED8" size={50} delay={0}   />
      <Book3D x="10%" y="30%" color="#22C55E" darkColor="#15803D" size={44} delay={0.6} />
      <Book3D x="75%" y="72%" color="#FBBF24" darkColor="#D97706" size={42} delay={1.0} />
      <Book3D x="0%"  y="52%" color="#A855F7" darkColor="#7E22CE" size={38} delay={0.3} />

      <Apple3D x="62%" y="68%" size={42} delay={0}   />
      <Apple3D x="18%" y="72%" size={36} delay={0.8} />
      <Apple3D x="86%" y="30%" size={34} delay={0.5} />

      {/* Contenu central */}
      <div className="relative z-10 flex flex-col items-center gap-5">

        {/* Maison 3D flottante */}
        <House3D />

        {/* Textes */}
        <div className="text-center space-y-1.5">
          <motion.h1
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Nunito', 'Fredoka One', system-ui, sans-serif",
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: 900,
              color: '#9F1239',
              textShadow: '3px 5px 0px rgba(251,113,133,0.25), 1px 2px 0px rgba(0,0,0,0.06)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Bienvenu, parent&nbsp;! 🏠
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: '0.9rem',
              color: '#6B7280',
              fontWeight: 700,
            }}
          >
            Chargement du suivi de votre enfant&nbsp;📚
          </motion.p>
        </div>

        {/* Barre de livres empilés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Pile de livres */}
          <div className="flex flex-col-reverse items-center gap-0.5" style={{ minHeight: 110 }}>
            <AnimatePresence>
              {BOOKS.map((b, i) => (
                i < activeBooks && (
                  <motion.div key={i}
                    initial={{ x: -60, opacity: 0, rotate: -12 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 20, delay: i * 0.07 }}
                  >
                    <StackBook {...b} />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Barre de progression avec petite pomme */}
          <div className="relative w-60">
            <motion.div
              className="absolute -top-5 -translate-x-1/2"
              style={{ left: `${Math.min(progress, 95)}%`, transition: 'left 40ms linear' }}
            >
              <svg viewBox="0 0 22 24" className="w-5 h-5" aria-hidden>
                <path d="M11 5 C6 5 3 10 3 14 C3 19 6 22 11 22 C16 22 19 19 19 14 C19 10 16 5 11 5 Z" fill="#EF4444" />
                <ellipse cx="8" cy="9" rx="2.5" ry="3.5" fill="white" opacity="0.3" transform="rotate(-20 8 9)" />
                <path d="M11 5 C11 3 13 1 14 2" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <ellipse cx="14" cy="2.5" rx="3" ry="1.5" fill="#22C55E" transform="rotate(-25 14 2)" />
              </svg>
            </motion.div>

            <div className="w-60 h-3 rounded-full overflow-hidden border border-rose-100"
              style={{ background: 'rgba(251,113,133,0.12)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FB7185, #F97316, #FBBF24, #22C55E, #A855F7)',
                  transition: 'width 40ms linear',
                }}
              />
            </div>
          </div>

          {/* Pourcentage */}
          <p style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#9CA3AF',
            letterSpacing: '0.06em',
          }}>
            {Math.round(progress)} %
          </p>
        </motion.div>
      </div>

      {/* Badge EPV */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6"
        style={{
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#D1D5DB',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        EPV Horizons Savants · Abidjan
      </motion.p>

    </motion.div>
  );
};
