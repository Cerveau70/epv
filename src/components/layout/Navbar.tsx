
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, BookOpen, GraduationCap, UserCircle,
  Home, Mail, HelpCircle, Newspaper, UserPlus, ChevronRight, Globe, Shirt, Camera,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext.tsx';
import { t } from '../../lib/i18n.ts';

interface NavbarProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
  id?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentHash, onNavigate, id }) => {
  const { lang, setLang } = useLang();
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => { setIsOpen(false); }, [currentHash]);

  const go = (hash: string) => {
    onNavigate(hash);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Labels courts pour le desktop (évite le débordement avec 7 items)
  const NAV = [
    { key: 'nav.home',       hash: '#',             Icon: Home,          short: { fr: 'Accueil',    en: 'Home'       } },
    { key: 'nav.programmes', hash: '#/programmes',  Icon: GraduationCap, short: { fr: 'Programmes', en: 'Programs'   } },
    { key: 'nav.admissions', hash: '#/admissions',  Icon: UserPlus,      short: { fr: 'Admissions', en: 'Admissions' } },
    { key: 'nav.ecole',      hash: '#/ecole',       Icon: BookOpen,      short: { fr: 'Vie scolaire', en: 'School Life' } },
    { key: 'nav.tenues',     hash: '#/tenues',      Icon: Shirt,         short: { fr: 'Tenues',     en: 'Uniforms'   } },
    { key: 'nav.visite',     hash: '#/visite',      Icon: Camera,        short: { fr: 'École en Images', en: 'School in Pictures' } },
    { key: 'nav.contact',    hash: '#/contact',     Icon: Mail,          short: { fr: 'Contact',    en: 'Contact'    } },
  ];

  const DRAWER = [
    { key: 'nav.home',       hash: '#',                       Icon: Home,          sub: false },
    { key: 'nav.programmes', hash: '#/programmes',            Icon: GraduationCap, sub: false },
    { key: 'nav.maternelle', hash: '#/programmes/maternelle', Icon: GraduationCap, sub: true  },
    { key: 'nav.primaire',   hash: '#/programmes/primaire',   Icon: GraduationCap, sub: true  },
    { key: 'nav.admissions', hash: '#/admissions',            Icon: UserPlus,      sub: false },
    { key: 'nav.ecole',      hash: '#/ecole',                 Icon: BookOpen,      sub: false },
    { key: 'nav.tenues',     hash: '#/tenues',                Icon: Shirt,         sub: false },
    { key: 'nav.visite',     hash: '#/visite',                Icon: Camera,        sub: false },
    { key: 'nav.contact',    hash: '#/contact',               Icon: Mail,          sub: false },
  ];

  return (
    <>
      {/* ── Barre de navigation ── */}
      <nav
        id={id}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full ${
          scrolled
            ? 'bg-brand-blue-deep/95 backdrop-blur-md shadow-premium py-2 border-b border-brand-blue-medium/50'
            : 'bg-brand-blue-deep py-3'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 h-14">

            {/* Logo */}
            <div onClick={() => go('#')} className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-brand-gold/40 group-hover:ring-brand-gold group-hover:scale-105 transition-all shadow-sm">
                <img src="/img/logo.jpg" alt="Logo EPV" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="font-sans font-extrabold text-sm block tracking-wide text-white leading-tight group-hover:text-brand-gold transition-colors">
                  EPV Horizons Savants
                </span>
                <span className="text-[9px] font-sans tracking-widest text-brand-gold-light font-medium block uppercase">
                </span>
              </div>
            </div>

            {/* Nav desktop visible seulement à xl (1280px+) */}
            <div className="hidden xl:flex items-center justify-center gap-0.5">
              {NAV.map(({ hash, Icon, short }) => {
                const active = currentHash === hash || (hash === '#' && !currentHash);
                return (
                  <button key={hash} onClick={() => go(hash)}
                    className={`px-2.5 py-2 rounded-lg font-sans font-medium text-[10.5px] tracking-wide transition-all uppercase cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      active ? 'bg-brand-gold text-brand-blue-deep font-bold shadow-sm'
                             : 'text-white/75 hover:bg-white/8 hover:text-white'
                    }`}>
                    <Icon size={12} /> {short[lang as 'fr' | 'en']}
                  </button>
                );
              })}
            </div>

            {/* Actions desktop + burger mobile */}
            <div className="flex items-center gap-2 justify-end">
              {/* Desktop : langue + espace parent */}
              <div className="hidden xl:flex items-center gap-2">
                {/* Toggle langue */}
                <button
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
                >
                  <Globe size={13} />
                  {lang === 'fr' ? 'EN' : 'FR'}
                </button>
                <span className="w-px h-5 bg-white/20" />
                <button onClick={() => go('#/espace-parent')}
                  className={`px-4 py-2 rounded-lg font-sans font-semibold text-[11px] tracking-wide transition-all uppercase border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentHash === '#/espace-parent'
                      ? 'bg-white text-brand-blue-deep font-bold border-transparent'
                      : 'bg-brand-blue-medium hover:bg-brand-blue-light/20 border-brand-blue-light/40 text-white'
                  }`}>
                  <UserCircle size={13} className="text-brand-gold shrink-0" />
                  {t('nav.parent', lang)}
                </button>
              </div>

              {/* Burger visible sous xl (< 1280px) */}
              <button className="header-burger xl:hidden" onClick={() => setIsOpen(v => !v)}
                aria-label={isOpen ? 'Fermer' : 'Menu'}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isOpen ? 'x' : 'm'}
                    initial={{ rotate: isOpen ? -90 : 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{   rotate: isOpen ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Drawer mobile premium ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay flouté */}
            <motion.div
              className="drawer-overlay xl:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel droit avec bords arrondis */}
            <motion.aside
              className="header-drawer xl:hidden"
              style={{ borderRadius: '1.5rem 0 0 1.5rem' }}
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* ── Header drawer ── */}
              <div className="flex items-center justify-between px-5 py-5"
                   style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-brand-gold/30">
                    <img src="/img/logo.jpg" alt="EPV" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-sm text-brand-blue-deep leading-tight">EPV Horizons Savants</p>
                    <p className="text-[9px] font-sans text-brand-gold uppercase tracking-widest">
                      {'Excellence · Abidjan'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* ── Sélecteur de langue ── */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-slate-400 mb-2.5">
                  {t('drawer.lang', lang)}
                </p>
                <div className="flex gap-2">
                  {(['fr', 'en'] as const).map(l => (
                    <motion.button
                      key={l}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLang(l)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
                      style={{
                        background: lang === l ? '#0D2E5C' : '#F8FAFF',
                        color: lang === l ? 'white' : '#94A3B8',
                        border: `1.5px solid ${lang === l ? '#0D2E5C' : '#E2EAFA'}`,
                      }}
                    >
                      <Globe size={13} />
                      {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ── Liens de navigation ── */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <p className="px-2 mb-3 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-slate-400">
                  {t('drawer.nav', lang)}
                </p>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
                  className="space-y-1"
                >
                  {DRAWER.map(({ key, hash, Icon, sub }) => {
                    const active = currentHash === hash || (hash === '#' && !currentHash);
                    return (
                      <motion.button
                        key={hash + key}
                        variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                        whileHover={{ x: sub ? 2 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => go(hash)}
                        className={`w-full flex items-center gap-3 text-left cursor-pointer transition-colors
                          ${sub ? 'pl-8 py-2.5 rounded-xl text-[0.76rem]' : 'px-3.5 py-3 rounded-2xl text-[0.82rem]'}
                          ${active
                            ? 'bg-[#EFF6FF] text-[#1E40AF] font-bold'
                            : sub
                              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                              : 'text-[#1E3A8A] font-semibold hover:bg-[#EFF6FF] hover:text-[#1E40AF]'
                          }`}
                      >
                        <Icon size={sub ? 14 : 17} className="shrink-0" />
                        <span className="flex-1">{t(key, lang)}</span>
                        {!sub && (
                          <ChevronRight size={14}
                            className={active ? 'text-[#1E40AF]' : 'text-slate-300'}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              {/* ── CTA Footer ── */}
              <div className="px-5 py-5" style={{ borderTop: '1px solid #f1f5f9' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => go('#/espace-parent')}
                  className="w-full py-4 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0D2E5C 0%, #1A4F8B 100%)',
                           boxShadow: '0 8px 24px rgba(13,46,92,0.30)' }}
                >
                  <UserCircle size={17} className="text-brand-gold" />
                  {t('drawer.cta', lang)}
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
