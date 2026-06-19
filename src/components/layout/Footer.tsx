
import React from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Shield } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext.tsx';

interface FooterProps {
  onNavigate: (hash: string) => void;
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, id }) => {
  const { lang } = useLang();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fr = lang === 'fr';

  return (
    <footer id={id} className="relative bg-brand-blue-deep text-brand-border/90 border-t border-brand-blue-medium/50 select-none">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo Brand Frame */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleLinkClick('#')}>
              <img
                src="/img/logo.jpg"
                alt="Logo EPV Horizons Savants"
                className="w-16 h-16 rounded-xl object-contain bg-white p-1 shadow-[0_2px_12px_rgba(0,0,0,0.25)] group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-sans font-extrabold text-sm text-white tracking-wide leading-snug">
                EPV<br />
                <span className="text-brand-gold">Horizons Savants</span>
              </span>
            </div>
            <p className="text-xs font-sans font-bold tracking-widest text-brand-gold/90 leading-relaxed max-w-xs mt-3 uppercase">
              NOUS FAISONS DES SACHANTS DE DEMAIN
            </p>
            <div className="text-[11px] leading-relaxed text-brand-border/60">
              {fr
                ? "École primaire & maternelle agréée par le Ministère de l'Éducation Nationale. Ouverture de rentrée en Septembre 2026."
                : "Accredited primary & kindergarten school by the Ministry of National Education. Opening in September 2026."}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              {fr ? 'Menu Scolaire' : 'School Menu'}
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs text-brand-border/75 font-sans">
              <button onClick={() => handleLinkClick('#')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? 'Accueil' : 'Home'}</button>
              <button onClick={() => handleLinkClick('#/programmes')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? 'Nos Programmes' : 'Our Programs'}</button>
              <button onClick={() => handleLinkClick('#/admissions')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? "Processus d'Admissions" : 'Admission Process'}</button>
              <button onClick={() => handleLinkClick('#/ecole')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? "L'Institution" : 'The Institution'}</button>
              <button onClick={() => handleLinkClick('#/blog')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? "Le Blog d'Élite" : 'The Elite Blog'}</button>
              <button onClick={() => handleLinkClick('#/faq')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? 'Questions Fréquentes (FAQ)' : 'FAQ'}</button>
              <button onClick={() => handleLinkClick('#/contact')} className="hover:text-brand-gold transition-colors text-left cursor-pointer">{fr ? 'Contact & Accès' : 'Contact & Access'}</button>
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-4 font-sans text-xs" id="footer-coord-block">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              {fr ? 'Coordonnées Abidjan' : 'Abidjan Contacts'}
            </h4>
            <div className="space-y-3 leading-relaxed text-brand-border/80">
              <p className="flex items-start gap-2.5">
                <MapPin size={15} className="text-brand-gold shrink-0 mt-0.5" />
                <span>Bingerville, Ave Konan Kouassi Lambert 38, Abidjan</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={15} className="text-brand-gold shrink-0" />
                <span>07 78 98 14 56 / 05 85 41 51 51</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={15} className="text-brand-gold shrink-0" />
                <span>contact@horizonssavants.com</span>
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4 text-xs font-sans" id="footer-hours-block">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              {fr ? 'Secrétariat & Visites' : 'Secretariat & Visits'}
            </h4>
            <div className="space-y-3 leading-relaxed text-brand-border/80">
              <p className="flex items-start gap-2.5">
                <Clock size={15} className="text-brand-gold shrink-0 mt-0.5" />
                <span>
                  {fr
                    ? 'Lu à Ve : 07h30 à 12h30 / 13h30 à 17h30'
                    : 'Mon to Fri: 07:30 to 12:30 / 13:30 to 17:30'}
                  <br />
                  {fr ? 'Mer : 08h00 à 12h30' : 'Wed: 08:00 to 12:30'}
                </span>
              </p>
              <p className="text-[11px] text-brand-gold font-serif italic text-white/90">
                {fr
                  ? 'Lundi, Mardi, Jeudi, Vendredi cours de 07h45 à 12h20 et de 13h30 à 16h00.'
                  : 'Mon, Tue, Thu, Fri classes from 07:45 to 12:20 and 13:30 to 16:00.'}
              </p>
              <div className="flex gap-2 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-lg bg-white/5 hover:bg-brand-gold hover:text-brand-blue-deep transition-all cursor-pointer"
                   aria-label="Facebook">
                  <Facebook size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs select-none">
          <p className="text-brand-border/50 text-center md:text-left leading-normal font-sans text-[11px]">
            &copy; {currentYear} EPV Horizons Savants · {fr ? "Abidjan. Tous droits réservés." : "Abidjan. All rights reserved."}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-brand-border/60 text-[11px] font-sans">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-brand-gold" />
              {fr ? 'Agrément Ministère N° 2026/MENA/SAG' : 'Ministry Accreditation No. 2026/MENA/SAG'}
            </span>
            <span>Abidjan, CIV</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
