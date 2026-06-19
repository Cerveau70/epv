
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminWelcomeLoaderProps { onComplete: () => void; name?: string; }

function Cube3D({ x, y, topColor, leftColor, rightColor, size = 56, delay = 0, label }: {
  x: string; y: string; topColor: string; leftColor: string; rightColor: string;
  size?: number; delay?: number; label?: string;
}) {
  return (
    <motion.div className="absolute pointer-events-none" style={{ left: x, top: y }}
      animate={{ y: [0, -14, 0], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 3.2 + delay * 0.6, repeat: Infinity, ease: 'easeInOut', delay }}>
      <svg viewBox="0 0 70 70" style={{ width: size, height: size }} aria-hidden>
        <ellipse cx="35" cy="66" rx="22" ry="6" fill="rgba(0,0,0,0.09)" />
        <polygon points="35,8 62,22 35,36 8,22" fill={topColor} />
        <polygon points="35,8 62,22 35,36 8,22" fill="white" opacity="0.18" />
        <polygon points="35,11 54,22 42,28 23,17" fill="white" opacity="0.22" />
        <polygon points="8,22 35,36 35,60 8,46" fill={leftColor} />
        <polygon points="62,22 35,36 35,60 62,46" fill={rightColor} />
        {label && <text x="35" y="27" textAnchor="middle" fontSize="13" fontWeight="900"
          fill="white" opacity="0.85" fontFamily="'Nunito', system-ui">{label}</text>}
        <polygon points="35,8 62,22 60,23 35,10" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  );
}

function Star3D({ x, y, color, size = 36, delay = 0 }: {
  x: string; y: string; color: string; size?: number; delay?: number;
}) {
  return (
    <motion.div className="absolute pointer-events-none" style={{ left: x, top: y }}
      animate={{ y: [0, -10, 0], scale: [1, 1.08, 1], rotate: [0, 15, -10, 0] }}
      transition={{ duration: 2.8 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay }}>
      <svg viewBox="0 0 44 44" style={{ width: size, height: size }} aria-hidden>
        <defs>
          <radialGradient id={`sg${delay}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
        </defs>
        <polygon points="22,2 26,15 40,15 29,23 33,37 22,29 11,37 15,23 4,15 18,15" fill={`url(#sg${delay})`} />
        <polygon points="22,5 25,15 37,15 28,21 31,34 22,27 13,34 16,21 7,15 19,15" fill="white" opacity="0.2" />
        <ellipse cx="22" cy="40" rx="10" ry="3" fill="rgba(0,0,0,0.07)" />
      </svg>
    </motion.div>
  );
}

function GradCap3D() {
  return (
    <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
      <svg viewBox="0 0 160 130" className="w-40 h-40" aria-hidden>
        <defs>
          <linearGradient id="dt" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="ds" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="bt" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" /><stop offset="50%" stopColor="#1D4ED8" /><stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <radialGradient id="sh" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" /><stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="sf"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#1E3A8A" floodOpacity="0.25" /></filter>
        </defs>
        <ellipse cx="80" cy="118" rx="44" ry="10" fill="rgba(30,58,138,0.12)" />
        <g filter="url(#sf)">
          <rect x="52" y="60" width="56" height="22" rx="0" fill="url(#ds)" />
          <ellipse cx="80" cy="82" rx="28" ry="10" fill="#1E3A8A" />
          <ellipse cx="80" cy="60" rx="28" ry="11" fill="url(#dt)" />
          <ellipse cx="72" cy="55" rx="12" ry="6" fill="url(#sh)" />
          <polygon points="80,28 128,48 80,60 32,48" fill="url(#bt)" />
          <polygon points="32,48 80,60 80,67 32,55" fill="#1E40AF" />
          <polygon points="128,48 80,60 80,67 128,55" fill="#2563EB" />
          <polygon points="80,30 120,47 105,52 65,35" fill="white" opacity="0.18" />
          <polygon points="80,30 128,48 125,49 80,32" fill="white" opacity="0.28" />
        </g>
        <line x1="128" y1="51" x2="128" y2="80" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
        <circle cx="128" cy="80" r="6" fill="#F59E0B" />
        <circle cx="128" cy="80" r="4" fill="#FCD34D" />
        <line x1="122" y1="85" x2="118" y2="98" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="127" y1="86" x2="126" y2="100" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="132" y1="85" x2="136" y2="98" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="118" cy="99" r="2.5" fill="#FCD34D" />
        <circle cx="126" cy="101" r="2.5" fill="#FCD34D" />
        <circle cx="136" cy="99" r="2.5" fill="#FCD34D" />
      </svg>
    </motion.div>
  );
}

function Crayon3D({ color, highlight, dark, eraser }: { color: string; highlight: string; dark: string; eraser: string }) {
  return (
    <svg viewBox="0 0 22 72" style={{ width: 22, height: 72 }} aria-hidden>
      <rect x="3" y="4" width="16" height="6" rx="3" fill={dark} />
      <rect x="3" y="9" width="16" height="4" rx="1" fill="#CBD5E1" />
      <rect x="3" y="9" width="16" height="2" rx="1" fill="#E2E8F0" />
      <rect x="4" y="3" width="14" height="7" rx="3" fill={eraser} />
      <rect x="5" y="3" width="6" height="5" rx="2" fill="white" opacity="0.35" />
      <rect x="3" y="13" width="16" height="42" rx="2" fill={color} />
      <rect x="4" y="14" width="5" height="40" rx="2" fill={highlight} opacity="0.45" />
      <rect x="15" y="13" width="4" height="42" rx="1" fill={dark} opacity="0.6" />
      <rect x="3" y="30" width="16" height="10" fill="white" opacity="0.18" />
      <polygon points="3,55 19,55 14,64 8,64" fill="#F5DEB3" />
      <polygon points="15,55 19,55 14,64" fill="#DEB887" />
      <polygon points="8,64 14,64 11,72" fill="#555" />
    </svg>
  );
}

const CRAYONS = [
  { color: '#FBBF24', highlight: '#FDE68A', dark: '#D97706', eraser: '#FCA5A5' },
  { color: '#EF4444', highlight: '#FCA5A5', dark: '#B91C1C', eraser: '#86EFAC' },
  { color: '#3B82F6', highlight: '#BFDBFE', dark: '#1D4ED8', eraser: '#FDE68A' },
  { color: '#22C55E', highlight: '#86EFAC', dark: '#15803D', eraser: '#C4B5FD' },
  { color: '#A855F7', highlight: '#DDD6FE', dark: '#7E22CE', eraser: '#FCA5A5' },
];

export const AdminWelcomeLoader: React.FC<AdminWelcomeLoaderProps> = ({ onComplete, name }) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const activeCrayons = Math.ceil((progress / 100) * CRAYONS.length);

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
        const next = p + 1.4;
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true; clearInterval(t);
          setTimeout(onComplete, 500); return 100;
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #FFF7ED 0%, #EFF6FF 55%, #F0FDF4 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.10) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-[-8%] left-[-5%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
      <div className="absolute top-[30%] right-[5%] w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />

      <Cube3D x="4%"  y="8%"  topColor="#FBBF24" leftColor="#D97706" rightColor="#FDE68A"  size={58} delay={0}   label="A" />
      <Cube3D x="78%" y="5%"  topColor="#3B82F6" leftColor="#1D4ED8" rightColor="#93C5FD"  size={50} delay={0.5} label="B" />
      <Cube3D x="82%" y="58%" topColor="#22C55E" leftColor="#15803D" rightColor="#86EFAC"  size={46} delay={1.1} label="C" />
      <Cube3D x="2%"  y="62%" topColor="#EF4444" leftColor="#B91C1C" rightColor="#FCA5A5"  size={52} delay={0.3} label="1" />
      <Cube3D x="40%" y="3%"  topColor="#A855F7" leftColor="#7E22CE" rightColor="#DDD6FE"  size={40} delay={0.8} label="+" />
      <Star3D x="68%" y="22%" color="#FBBF24" size={38} delay={0}   />
      <Star3D x="14%" y="32%" color="#EF4444" size={30} delay={0.6} />
      <Star3D x="58%" y="72%" color="#22C55E" size={34} delay={0.9} />
      <Star3D x="88%" y="40%" color="#A855F7" size={26} delay={0.2} />
      <Star3D x="22%" y="78%" color="#3B82F6" size={28} delay={1.3} />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <GradCap3D />

        <div className="text-center space-y-1.5">
          <motion.h1
            initial={{ opacity: 0, y: 18, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Nunito', 'Fredoka One', system-ui, sans-serif",
              fontSize: 'clamp(1.4rem, 5vw, 1.9rem)', fontWeight: 900, color: '#1E3A8A',
              textShadow: '3px 5px 0px rgba(59,130,246,0.22), 1px 2px 0px rgba(0,0,0,0.07)',
              letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
            Bienvenu,{' '}
            <span style={{ color: '#F59E0B' }}>{name?.split(' ')[0] || 'Admin'}&nbsp;!</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: "'Nunito', system-ui, sans-serif", fontSize: '0.9rem', color: '#64748B', fontWeight: 700 }}>
            Préparation de ton cartable&nbsp;✏️
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-3">
          <div className="flex items-end gap-2 h-20">
            <AnimatePresence>
              {CRAYONS.map((c, i) => i < activeCrayons && (
                <motion.div key={i}
                  initial={{ y: -90, opacity: 0, rotate: -8 }} animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 90, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18, delay: i * 0.08 }}>
                  <Crayon3D {...c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="relative w-64">
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                  style={{ background: i * 5 <= progress ? '#FCD34D' : 'rgba(0,0,0,0.1)' }} />
              ))}
            </div>
            <motion.div className="relative z-10"
              style={{ marginLeft: `calc(${Math.min(progress, 95)}% - 28px)`, transition: 'margin-left 40ms linear' }}>
              <svg viewBox="0 0 56 32" className="w-14 h-8" aria-hidden>
                <rect x="2" y="6" width="50" height="20" rx="4" fill="#FBBF24" />
                <rect x="2" y="6" width="50" height="10" rx="2" fill="#FCD34D" />
                <rect x="38" y="9" width="11" height="8" rx="2" fill="#BAE6FD" />
                <rect x="38" y="9" width="5" height="8" rx="1" fill="white" opacity="0.3" />
                <rect x="8"  y="9" width="8" height="7" rx="1.5" fill="#BAE6FD" />
                <rect x="19" y="9" width="8" height="7" rx="1.5" fill="#BAE6FD" />
                <rect x="30" y="9" width="6" height="7" rx="1.5" fill="#BAE6FD" />
                <rect x="8"  y="9" width="3" height="6" rx="1" fill="white" opacity="0.4" />
                <rect x="19" y="9" width="3" height="6" rx="1" fill="white" opacity="0.4" />
                <rect x="2" y="22" width="50" height="4" rx="1" fill="#D97706" />
                <circle cx="12" cy="27" r="5" fill="#334155" />
                <circle cx="12" cy="27" r="2.5" fill="#64748B" />
                <circle cx="42" cy="27" r="5" fill="#334155" />
                <circle cx="42" cy="27" r="2.5" fill="#64748B" />
                <rect x="50" y="14" width="4" height="5" rx="1" fill="#FEF08A" />
              </svg>
            </motion.div>
          </div>

          <p style={{ fontFamily: "'Nunito', system-ui, sans-serif", fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>
            {Math.round(progress)} %
          </p>
        </motion.div>
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="absolute bottom-6"
        style={{ fontFamily: "'Nunito', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 800, color: '#CBD5E1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        EPV Horizons Savants · Abidjan
      </motion.p>
    </motion.div>
  );
};
