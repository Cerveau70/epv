
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

type ImageSize = 'large' | 'tall' | 'wide' | 'standard';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  size: ImageSize;
}

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: '/img/classe.jpg', alt: 'Salles de classe modernes et épurées',        category: 'Salles de cours', size: 'large'    },
  { id: 2, src: '/img/co.jpeg',    alt: 'Éveil culturel et vie scolaire',              category: 'Vie scolaire',    size: 'tall'     },
  { id: 3, src: '/img/classe.jpg', alt: 'Espace de travail et apprentissage actif',     category: 'Maternelle',      size: 'wide'     },
  { id: 4, src: '/img/co.jpeg',    alt: 'Activités pédagogiques et projets autonomes', category: 'Projets',         size: 'standard' },
  { id: 5, src: '/img/classe.jpg', alt: 'Environnement éducatif bienveillant',          category: 'Primaire',        size: 'standard' },
  { id: 6, src: '/img/co.jpeg',    alt: 'Encadrement et accompagnement personnalisé',  category: 'Encadrement',     size: 'wide'     },
];

const sizeClasses: Record<ImageSize, string> = {
  large:    'col-span-2 row-span-2',
  tall:     'col-span-1 row-span-2',
  wide:     'col-span-2 row-span-1',
  standard: 'col-span-1 row-span-1',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.58, ease: 'easeOut' } },
};

export const PhotoGallery: React.FC = () => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(p => (p !== null ? (p === 0 ? GALLERY_IMAGES.length - 1 : p - 1) : null));
  }, []);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(p => (p !== null ? (p === GALLERY_IMAGES.length - 1 ? 0 : p + 1) : null));
  }, []);

  return (
    <div>
      {/* ── Bento Grid ── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 auto-rows-[155px] md:auto-rows-[210px] gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {GALLERY_IMAGES.map((img, idx) => (
          <motion.div
            key={img.id}
            variants={itemVariants}
            className={`group relative overflow-hidden rounded-3xl shadow-sm cursor-pointer ${sizeClasses[img.size]}`}
            onClick={() => setLightboxIdx(idx)}
          >
            {/* Image */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0
                            bg-gradient-to-t from-[#0D2E5C]/88 via-[#0D2E5C]/25 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            flex flex-col justify-end p-4">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.22em] text-brand-gold font-bold mb-1 block">
                {img.category}
              </span>
              <div className="flex items-end justify-between gap-2">
                <p className="text-white font-sans font-semibold text-[11px] md:text-xs leading-tight">
                  {img.alt}
                </p>
                <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/40
                                flex items-center justify-center shrink-0">
                  <Search size={12} className="text-brand-gold" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] bg-[#060e1c]/97 flex items-center justify-center p-4"
            onClick={() => setLightboxIdx(null)}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
              <div className="flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold">
                  {GALLERY_IMAGES[lightboxIdx].category}
                </span>
                <span className="text-white/25">·</span>
                <span className="text-[11px] text-white/40 font-mono">
                  {lightboxIdx + 1} / {GALLERY_IMAGES.length}
                </span>
              </div>
              <button
                onClick={() => setLightboxIdx(null)}
                className="p-2 text-white/60 hover:text-white bg-white/6 hover:bg-white/12 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav prev */}
            <button
              onClick={goPrev}
              className="absolute left-3 md:left-6 p-3 text-white/65 hover:text-white bg-white/5 hover:bg-white/13 rounded-full z-10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Image animée au changement */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIdx}
                initial={{ opacity: 0, scale: 0.96, x: 18 }}
                animate={{ opacity: 1, scale: 1,    x: 0  }}
                exit={{    opacity: 0, scale: 0.96, x: -18 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4 select-none max-w-5xl w-full"
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={GALLERY_IMAGES[lightboxIdx].src}
                  alt={GALLERY_IMAGES[lightboxIdx].alt}
                  className="max-h-[74vh] w-auto max-w-full rounded-2xl object-contain border border-white/7 shadow-2xl"
                />
                <p className="text-center text-white/72 font-sans text-sm max-w-lg px-4">
                  {GALLERY_IMAGES[lightboxIdx].alt}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Nav next */}
            <button
              onClick={goNext}
              className="absolute right-3 md:right-6 p-3 text-white/65 hover:text-white bg-white/5 hover:bg-white/13 rounded-full z-10 transition-colors cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
