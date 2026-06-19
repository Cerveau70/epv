
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicLoaderProps { onComplete: () => void; }

const CARTOON_CSS = `
  /* ── Fond animé ── */
  @keyframes bg-pulse {
    0%,100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* ── Livre 3D qui se balance ── */
  @keyframes book-rock {
    0%   { transform: rotateY(-30deg) rotateX(12deg) translateY(0px);   }
    25%  { transform: rotateY(0deg)   rotateX(5deg)  translateY(-12px); }
    50%  { transform: rotateY(28deg)  rotateX(-8deg) translateY(0px);   }
    75%  { transform: rotateY(0deg)   rotateX(5deg)  translateY(-8px);  }
    100% { transform: rotateY(-30deg) rotateX(12deg) translateY(0px);   }
  }

  /* ── Pages qui tournent ── */
  @keyframes page-turn {
    0%,15%  { transform: perspective(220px) rotateY(0deg)    scaleX(1);    }
    40%,55% { transform: perspective(220px) rotateY(-170deg) scaleX(0.05); }
    80%,100%{ transform: perspective(220px) rotateY(0deg)    scaleX(1);    }
  }
  .cartoon-page { animation: page-turn 2.4s ease-in-out infinite; transform-origin: left center; }

  /* ── Crayon qui rebondit ── */
  @keyframes pencil-bounce {
    0%,100% { transform: translateY(0)   rotate(-18deg) scale(1);    }
    20%     { transform: translateY(-28px) rotate(-5deg)  scale(1.08); }
    35%     { transform: translateY(-32px) rotate(8deg)   scale(1.1);  }
    55%     { transform: translateY(-8px)  rotate(-12deg) scale(0.98); }
    70%     { transform: translateY(-18px) rotate(5deg)   scale(1.04); }
  }

  /* ── Toque qui flotte ── */
  @keyframes cap-float {
    0%,100% { transform: translateY(0)   rotate(-6deg) scale(1);    }
    30%     { transform: translateY(-18px) rotate(6deg)  scale(1.06); }
    60%     { transform: translateY(-10px) rotate(-3deg) scale(1.02); }
  }

  /* ── Pompon de la toque ── */
  @keyframes tassel-swing {
    0%,100% { transform: rotate(-20deg); }
    50%     { transform: rotate(25deg);  }
  }

  /* ── Étoiles clignotantes ── */
  @keyframes star-twinkle {
    0%,100% { transform: scale(1)   rotate(0deg);   opacity: 0.9; }
    40%     { transform: scale(1.5) rotate(15deg);  opacity: 1;   }
    70%     { transform: scale(0.7) rotate(-10deg); opacity: 0.5; }
  }
  @keyframes star-orbit {
    from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
  }

  /* ── Règle ── */
  @keyframes ruler-sway {
    0%,100% { transform: translateX(0) rotate(5deg);  }
    50%     { transform: translateX(6px) rotate(-5deg); }
  }

  /* ── Rebond d'entrée ── */
  @keyframes pop-in {
    0%  { transform: scale(0) rotate(-15deg); opacity: 0; }
    65% { transform: scale(1.15) rotate(4deg); opacity: 1; }
    85% { transform: scale(0.95) rotate(-2deg); }
    100%{ transform: scale(1) rotate(0deg); opacity: 1; }
  }

  /* ── Barre de progression ── */
  @keyframes bar-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.4); }
    50%     { box-shadow: 0 0 16px 4px rgba(245,166,35,0.5); }
  }

  /* ── Titre ── */
  @keyframes title-bounce {
    0%  { transform: translateY(20px); opacity: 0; }
    60% { transform: translateY(-4px); opacity: 1; }
    80% { transform: translateY(2px); }
    100%{ transform: translateY(0); opacity: 1; }
  }

  .book-3d-group {
    animation: book-rock 3.5s cubic-bezier(0.45,0,0.55,1) infinite;
    transform-style: preserve-3d;
  }
  .pencil-anim  { animation: pencil-bounce 1.8s cubic-bezier(0.34,1.56,0.64,1) infinite; }
  .cap-anim     { animation: cap-float 2.2s cubic-bezier(0.45,0,0.55,1) 0.4s infinite; }
  .tassel-anim  { animation: tassel-swing 1.1s ease-in-out 0.4s infinite; transform-origin: top center; }
  .ruler-anim   { animation: ruler-sway 2s ease-in-out 0.6s infinite; }
  .star-1 { animation: star-twinkle 1.4s ease-in-out 0s   infinite; }
  .star-2 { animation: star-twinkle 1.7s ease-in-out 0.3s infinite; }
  .star-3 { animation: star-twinkle 1.2s ease-in-out 0.6s infinite; }
  .star-4 { animation: star-twinkle 1.9s ease-in-out 0.9s infinite; }
  .star-5 { animation: star-twinkle 1.5s ease-in-out 0.15s infinite; }
  .star-6 { animation: star-twinkle 2.0s ease-in-out 0.5s infinite; }
  .pop-in-1 { animation: pop-in 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
  .pop-in-2 { animation: pop-in 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
  .pop-in-3 { animation: pop-in 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.7s both; }
  .title-in { animation: title-bounce 0.7s cubic-bezier(0.34,1.3,0.64,1) 0.6s both; }
  .bar-glow-anim { animation: bar-glow 1.6s ease-in-out infinite; }
`;

/* ─── SVG Étoile cartoon ─── */
const StarSVG = ({ size = 20, color = '#F5A623' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
    <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" />
  </svg>
);

/* ─── Livre 3D cartoon ─── */
function Book3D({ progress }: { progress: number }) {
  return (
    <div style={{ perspective: '700px', perspectiveOrigin: '50% 45%' }}>
      <div className="book-3d-group" style={{ position: 'relative', width: 148, height: 110 }}>

        {/* ── Tranche (pages visibles côté droit) ── */}
        <div style={{
          position: 'absolute', right: -10, top: 6,
          width: 10, height: 98,
          background: 'repeating-linear-gradient(to bottom, #F8F4E8 0px, #F8F4E8 6px, #E8E2CE 7px, #F8F4E8 7px)',
          border: '2px solid #bbb',
          borderLeft: 'none',
          borderRadius: '0 3px 3px 0',
          transform: 'translateZ(-8px)',
          boxShadow: '4px 0 8px rgba(0,0,0,0.18)',
        }} />

        {/* ── Dos du livre ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 148, height: 110,
          background: 'linear-gradient(160deg, #1A3F7A 0%, #0D2E5C 100%)',
          border: '4px solid #000a24',
          borderRadius: 6,
          transform: 'translateZ(-8px)',
        }} />

        {/* ── Tranche gauche (reliure) ── */}
        <div style={{
          position: 'absolute', left: -12, top: 0,
          width: 12, height: 110,
          background: 'linear-gradient(to right, #C88A00, #F5A623, #FFDA6A)',
          border: '3px solid #000a24',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          transform: 'translateZ(0px)',
          boxShadow: '-3px 3px 8px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-evenly', padding: '8px 0'
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#000a24', opacity: 0.4 }} />
          ))}
        </div>

        {/* ── Couverture principale (avant) ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 148, height: 110,
          background: 'linear-gradient(150deg, #1156C0 0%, #0D2E5C 60%, #06192e 100%)',
          border: '4px solid #000a24',
          borderRadius: 6,
          transform: 'translateZ(8px)',
          boxShadow: '0 10px 30px rgba(0,0,20,0.45)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4
        }}>
          {/* Reflet */}
          <div style={{
            position: 'absolute', top: -20, left: -20, width: 80, height: 80,
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          {/* Logo étoile */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => (
              <StarSVG key={i} size={18} color={i === 1 ? '#F5A623' : '#FFD966'} />
            ))}
          </div>
          {/* Titre sur la couverture */}
          <div style={{
            background: 'rgba(245,166,35,0.22)',
            border: '2px solid rgba(245,166,35,0.55)',
            borderRadius: 4,
            padding: '3px 8px',
            marginTop: 2
          }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 9, color: '#FFD966', letterSpacing: 2, textTransform: 'uppercase' }}>
              EPV
            </p>
          </div>
          <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>
            Horizons Savants
          </p>

          {/* ── Pages qui tournent sur la couverture ── */}
          <div className="cartoon-page" style={{
            position: 'absolute', right: 4, top: 4,
            width: 44, height: 102,
            background: 'white',
            borderRadius: '0 3px 3px 0',
            border: '2px solid #e0e0e0',
            overflow: 'hidden',
          }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 1, background: '#c8e0ff', marginTop: 12, marginLeft: 4, marginRight: 4 }} />
            ))}
            <div style={{ position: 'absolute', top: 8, left: 6, fontSize: 14 }}>📚</div>
          </div>
        </div>

        {/* ── Ombre portée sous le livre ── */}
        <div style={{
          position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 12, borderRadius: '50%',
          background: 'rgba(13,46,92,0.25)',
          filter: 'blur(6px)',
          animation: 'cap-float 3.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}

/* ─── Crayon 3D cartoon ─── */
function Pencil3D() {
  return (
    <div className="pencil-anim" style={{ position: 'relative', width: 22, height: 110 }}>
      {/* Corps hexagonal (simplifié en rect arrondi) */}
      <div style={{
        width: 22, height: 80,
        background: 'linear-gradient(to right, #FFB800, #FFD700, #FFE55C, #FFD700, #FFB800)',
        border: '3px solid #222',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        boxShadow: '3px 3px 0 #333',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Lignes hexagonales */}
        <div style={{ position: 'absolute', top: 0, left: 6, width: 1, height: '100%', background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ position: 'absolute', top: 0, left: 12, width: 1, height: '100%', background: 'rgba(0,0,0,0.1)' }} />
        {/* Métal argenté */}
        <div style={{
          position: 'absolute', bottom: 0, left: -2, right: -2, height: 12,
          background: 'linear-gradient(to right, #aaa, #eee, #aaa)',
          border: '2px solid #555',
        }} />
      </div>
      {/* Gomme rose */}
      <div style={{
        width: 22, height: 14,
        background: 'linear-gradient(to right, #FF8FAB, #FFB3C6, #FF8FAB)',
        border: '3px solid #222',
        borderTop: '2px solid #555',
        borderBottom: 'none',
        boxShadow: '3px 2px 0 #333',
      }} />
      {/* Pointe - trapèze */}
      <svg width="22" height="18" viewBox="0 0 22 18">
        <polygon points="0,0 22,0 11,18" fill="#FFE0B0" stroke="#222" strokeWidth="3" strokeLinejoin="round"/>
        <polygon points="7,0 15,0 11,14" fill="#C8763A" stroke="#222" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      {/* Petites étoiles autour */}
      <div className="star-5" style={{ position: 'absolute', top: 10, left: -18, fontSize: 12 }}>✨</div>
      <div className="star-6" style={{ position: 'absolute', top: 35, right: -16, fontSize: 10 }}>⭐</div>
    </div>
  );
}

/* ─── Toque 3D cartoon ─── */
function Cap3D() {
  return (
    <div className="cap-anim" style={{ position: 'relative', width: 90, textAlign: 'center' }}>
      {/* Plateau carré de la toque */}
      <div style={{
        width: 88, height: 14,
        background: 'linear-gradient(160deg, #1B3F7A 30%, #0D2E5C 100%)',
        border: '3.5px solid #000a24',
        borderRadius: 4,
        boxShadow: '3px 3px 0 rgba(0,0,30,0.4)',
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Pompon + cordon */}
        <div style={{ position: 'absolute', top: -16, right: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="tassel-anim" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 2, height: 14, background: '#F5A623', borderRadius: 1 }} />
            <div style={{
              width: 16, height: 16,
              background: 'radial-gradient(circle, #FFD700, #F5A623)',
              border: '2.5px solid #222',
              borderRadius: '50%',
              boxShadow: '1px 1px 0 #333',
            }} />
          </div>
        </div>
        {/* Ligne déco */}
        <div style={{ position: 'absolute', inset: 3, border: '1.5px solid rgba(245,166,35,0.35)', borderRadius: 2 }} />
      </div>

      {/* Calotte cylindrique */}
      <div style={{
        width: 52, height: 24,
        background: 'linear-gradient(160deg, #234A90 0%, #0D2E5C 100%)',
        border: '3.5px solid #000a24',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        margin: '0 auto',
        boxShadow: '3px 0 0 rgba(0,0,30,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Reflet sur la calotte */}
        <div style={{
          position: 'absolute', top: 4, left: 8, width: 16, height: 8,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%',
          transform: 'rotate(-15deg)',
        }} />
      </div>

      {/* Bord inférieur de la toque */}
      <div style={{
        width: 52, height: 8,
        background: 'linear-gradient(to bottom, #0D2E5C, #06192e)',
        border: '3px solid #000a24',
        borderRadius: '0 0 6px 6px',
        margin: '0 auto',
        boxShadow: '3px 3px 0 rgba(0,0,30,0.3)',
      }} />
    </div>
  );
}

/* ─── Règle cartoon ─── */
function Ruler() {
  return (
    <div className="ruler-anim" style={{ position: 'relative', width: 140, height: 26 }}>
      <div style={{
        width: 140, height: 22,
        background: 'linear-gradient(to bottom, #A3D977, #7EC855)',
        border: '3px solid #222',
        borderRadius: 4,
        boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: 2,
        paddingLeft: 8,
        gap: 0,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Graduations */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{
            width: 1, height: i % 5 === 0 ? 10 : 6,
            background: 'rgba(0,0,0,0.4)',
            marginRight: 7,
            flexShrink: 0,
          }} />
        ))}
        {/* Trous décoratifs */}
        <div style={{ position: 'absolute', top: 4, left: 14, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.2)' }} />
        <div style={{ position: 'absolute', top: 4, left: 30, width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

export const PublicLoader: React.FC<PublicLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        const next = p + 1.6;
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #FFF9E6 0%, #FFFBE8 40%, #FFF5D0 80%, #FFF0B8 100%)',
      }}
    >
      <style>{CARTOON_CSS}</style>

      {/* ── Motif papier pointillé en fond ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(13,46,92,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* ── Lignes de cahier en fond ── */}
      {[15, 30, 45, 60, 75, 85].map(pct => (
        <div key={pct} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${pct}%`, height: 1,
          background: 'rgba(173,210,255,0.22)',
        }} />
      ))}

      {/* ── Étoiles décoratives ── */}
      <div className="star-1" style={{ position: 'absolute', top: '10%', left: '8%' }}><StarSVG size={26} /></div>
      <div className="star-2" style={{ position: 'absolute', top: '14%', right: '10%' }}><StarSVG size={22} color="#FFD700" /></div>
      <div className="star-3" style={{ position: 'absolute', bottom: '18%', left: '12%' }}><StarSVG size={20} color="#FF8C42" /></div>
      <div className="star-4" style={{ position: 'absolute', bottom: '22%', right: '8%' }}><StarSVG size={24} /></div>
      <div className="star-5" style={{ position: 'absolute', top: '40%', left: '4%', fontSize: 18 }}>✏️</div>
      <div className="star-6" style={{ position: 'absolute', top: '35%', right: '4%', fontSize: 16 }}>📐</div>

      {/* ══ SCÈNE PRINCIPALE ══ */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 10 }}>

        {/* ── Toque flottante au-dessus ── */}
        <div className="pop-in-3" style={{ marginBottom: -10 }}>
          <Cap3D />
        </div>

        {/* ── Ligne : Crayon + Livre ── */}
        <div className="pop-in-1" style={{ display: 'flex', alignItems: 'flex-end', gap: 20, position: 'relative' }}>

          {/* Crayon gauche */}
          <div style={{ marginBottom: 8 }}>
            <Pencil3D />
          </div>

          {/* Livre 3D central */}
          <Book3D progress={progress} />

          {/* Règle droite */}
          <div className="pop-in-2" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <div style={{ transform: 'rotate(90deg)' }}>
              <Ruler />
            </div>
          </div>
        </div>

        {/* ── Nom de l'école ── */}
        <div className="title-in" style={{ textAlign: 'center', marginTop: 4 }}>
          <p style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 900,
            fontSize: 18,
            color: '#0D2E5C',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            textShadow: '2px 2px 0 rgba(13,46,92,0.12)',
          }}>
            EPV Horizons Savants
          </p>
          <p style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700,
            fontSize: 9,
            color: '#F5A623',
            textTransform: 'uppercase',
            letterSpacing: '0.32em',
            marginTop: 2,
          }} />
        </div>

        {/* ── Barre de progression cartoon ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {/* Mortier glissant */}
          <div style={{ position: 'relative', width: 240, height: 20 }}>
            <div style={{
              position: 'absolute',
              bottom: 4,
              left: `calc(${progress}% - 12px)`,
              transition: 'left 50ms linear',
              fontSize: 18,
              lineHeight: 1,
            }}>
              🎓
            </div>
          </div>

          {/* Barre épaisse cartoon */}
          <div style={{
            width: 240, height: 18,
            background: 'white',
            border: '3.5px solid #0D2E5C',
            borderRadius: 99,
            overflow: 'hidden',
            boxShadow: '3px 3px 0 rgba(13,46,92,0.25)',
            position: 'relative',
          }}>
            {/* Fond rayé */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(13,46,92,0.04) 0px, rgba(13,46,92,0.04) 4px, transparent 4px, transparent 10px)',
            }} />
            {/* Remplissage */}
            <div
              className="bar-glow-anim"
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0D2E5C 0%, #1A4F8B 40%, #F5A623 100%)',
                borderRadius: 99,
                transition: 'width 50ms linear',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Reflet */}
              <div style={{
                position: 'absolute', top: 2, left: 8, right: 8, height: 5,
                background: 'rgba(255,255,255,0.35)',
                borderRadius: 99,
              }} />
            </div>
          </div>

          <p style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 800,
            fontSize: 10,
            color: '#0D2E5C',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            opacity: 0.45,
          }}>
            Chargement…
          </p>
        </div>
      </div>
    </motion.div>
  );
};
