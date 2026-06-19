
import React, { useEffect, useRef, useState } from 'react';
import { Home, GraduationCap, UserPlus, UserCircle } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext.tsx';
import { t } from '../../lib/i18n.ts';

interface MobileBottomNavProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
  isMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentHash, onNavigate, isMenuOpen,
}) => {
  const { lang } = useLang();
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavVisible(y < lastScrollY.current || y < 60);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hidden = !navVisible || isMenuOpen;

  const ITEMS = [
    { hash: '#',              labelKey: 'bnav.home',       Icon: Home,         cta: false },
    { hash: '#/programmes',   labelKey: 'bnav.programmes', Icon: GraduationCap, cta: false },
    { hash: '#/admissions',   labelKey: 'bnav.admission',  Icon: UserPlus,      cta: false },
    { hash: '#/espace-parent', labelKey: 'bnav.parent',   Icon: UserCircle,    cta: true  },
  ];

  return (
    <nav
      className={`mobile-bottom-nav${hidden ? ' mobile-bottom-nav--hidden' : ''}`}
      aria-label="Navigation mobile"
    >
      {ITEMS.map(({ hash, labelKey, Icon, cta }) => {
        const isActive = currentHash === hash || (hash === '#' && !currentHash);
        return (
          <button
            key={hash}
            onClick={() => { onNavigate(hash); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`mbn-item${cta ? ' mbn-item--cta' : ''}${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </nav>
  );
};
