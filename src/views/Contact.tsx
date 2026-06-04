/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ContactForm } from '../components/forms/ContactForm.tsx';
import { useLang } from '../lib/LanguageContext.tsx';
import { Toast } from '../components/ui/Toast.tsx';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Info,
  ExternalLink,
  GraduationCap,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const scheduleRows = [
  { labelFr: 'Lundi · Mardi · Jeudi · Vendredi', labelEn: 'Mon · Tue · Thu · Fri', value: '07h45 – 12h20 · 13h30 – 16h00' },
  { labelFr: 'Mercredi', labelEn: 'Wednesday', value: '08h00 – 12h30' },
  { labelFr: 'Secrétariat (Lu–Ve)', labelEn: 'Secretariat (Mon–Fri)', value: '07h30 – 17h30' },
];

export const Contact: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reasons = [
    {
      Icon: GraduationCap,
      color: 'text-brand-blue-deep',
      title: fr ? 'Admissions & Inscriptions' : 'Admissions & Enrollment',
      text: fr
        ? "Renseignez-vous sur les dossiers d'admission et les ouvertures pour septembre 2026."
        : 'Get information on admission files and openings for September 2026.',
    },
    {
      Icon: BookOpen,
      color: 'text-brand-gold',
      title: fr ? 'Questions Pédagogiques' : 'Pedagogical Questions',
      text: fr
        ? 'Notre équipe académique répond à toutes vos interrogations sur nos programmes.'
        : 'Our academic team answers all your questions about our programs.',
    },
    {
      Icon: HeartHandshake,
      color: 'text-emerald-600',
      title: fr ? 'Partenariats & Visites' : 'Partnerships & Visits',
      text: fr
        ? 'Organisez une visite guidée ou explorez nos opportunités de partenariat.'
        : 'Organize a guided tour or explore our partnership opportunities.',
    },
  ];

  return (
    <div className="select-none">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative pattern-topo overflow-hidden" style={{ backgroundColor: '#0b1d3a' }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(245,166,35,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans font-extrabold text-4xl md:text-6xl uppercase tracking-tight text-white leading-tight"
          >
            {fr ? 'Contactez ' : 'Contact '}
            <span style={{ color: '#F5A623' }}>{fr ? 'Notre Équipe' : 'Our Team'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-5 font-serif text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {fr
              ? "Une question d'ordre pédagogique ou d'admissions ? Contactez-nous par courrier, par téléphone, ou visitez nos locaux à Bingerville Mtn Kro."
              : 'A pedagogical or admission question? Contact us by email, phone, or visit our premises in Bingerville Mtn Kro.'}
          </motion.p>
        </div>
      </section>

      {/* ══ BODY ══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#F4F8FF] to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-20">

          {/* ── 2 COLONNES : Info gauche · Formulaire droite ─────── */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {/* ── COLONNE GAUCHE : informations ─────────────────── */}
            <motion.div variants={fadeUp} className="space-y-6">

              <div>
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] tracking-tight mb-1">
                  {fr ? 'Nos Coordonnées' : 'Contact Information'}
                </h2>
                <p className="font-serif text-sm text-gray-400">
                  {fr ? 'Disponibles du lundi au samedi' : 'Available Monday to Saturday'}
                </p>
              </div>

              {/* Info list — 3 colonnes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white shadow-[0_2px_16px_rgba(13,46,92,0.07)]">
                  <MapPin size={20} className="text-[#0D2E5C]" />
                  <div>
                    <p className="font-sans font-bold text-xs text-[#0D2E5C] uppercase tracking-wide mb-1">
                      {fr ? 'Adresse' : 'Address'}
                    </p>
                    <p className="font-serif text-xs text-gray-500 leading-relaxed">
                      Bingerville Mtn Kro<br />Cité Côtes de Grâces<br />Abidjan, Côte d'Ivoire
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white shadow-[0_2px_16px_rgba(13,46,92,0.07)]">
                  <Phone size={20} className="text-[#F5A623]" />
                  <div>
                    <p className="font-sans font-bold text-xs text-[#0D2E5C] uppercase tracking-wide mb-1">
                      {fr ? 'Téléphone' : 'Phone'}
                    </p>
                    <p className="font-mono text-xs text-gray-500">07 78 98 14 56</p>
                    <p className="font-mono text-xs text-gray-500">05 85 41 51 51</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white shadow-[0_2px_16px_rgba(13,46,92,0.07)]">
                  <Mail size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-sans font-bold text-xs text-[#0D2E5C] uppercase tracking-wide mb-1">Email</p>
                    <a href="mailto:contact@horizonssavants.com"
                      className="font-serif text-xs text-emerald-600 hover:text-emerald-700 transition-colors break-all">
                      contact@horizonssavants.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Horaires */}
              <div className="p-5 rounded-2xl bg-white shadow-[0_2px_16px_rgba(13,46,92,0.07)]">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-[#0D2E5C]" />
                  <h3 className="font-sans font-bold text-sm text-[#0D2E5C] uppercase tracking-wide">
                    {fr ? 'Horaires' : 'Opening Hours'}
                  </h3>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {scheduleRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#F4F8FF]' : 'bg-white'}>
                        <td className="font-sans font-semibold text-[#0D2E5C] px-3 py-2 rounded-l-lg">
                          {fr ? row.labelFr : row.labelEn}
                        </td>
                        <td className="font-serif text-gray-500 px-3 py-2 rounded-r-lg text-right">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex gap-2 text-xs text-emerald-700 font-serif">
                  <Info size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    {fr
                      ? "Visites sans rendez-vous suspendues en période d'évaluations."
                      : 'Walk-in visits suspended during assessment periods.'}
                  </span>
                </div>
              </div>

              {/* Map — Google Maps embed */}
              <div className="rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(13,46,92,0.07)]">
                <iframe
                  title="EPV Horizons Savants — Localisation"
                  src="https://maps.google.com/maps?q=Bingerville+Mtn+Kro+Cit%C3%A9+C%C3%B4tes+de+Gr%C3%A2ces+Abidjan+C%C3%B4te+d%27Ivoire&output=embed&hl=fr"
                  width="100%"
                  height="240"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="px-5 py-3 bg-white border-t border-[#0D2E5C]/10 flex items-center justify-between gap-4">
                  <p className="font-sans font-bold text-xs text-[#0D2E5C]">EPV Horizons Savants · Bingerville Mtn Kro</p>
                  <a href="https://maps.google.com/?q=Bingerville+Mtn+Kro+Cité+Côtes+de+Grâces+Abidjan"
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-sans font-semibold text-xs text-white px-4 py-2 rounded-full shrink-0"
                    style={{ backgroundColor: '#0D2E5C' }}>
                    <ExternalLink size={12} />
                    {fr ? 'Ouvrir Maps' : 'Open Maps'}
                  </a>
                </div>
              </div>

              {/* Pourquoi nous contacter — 3 colonnes */}
              <div className="space-y-3 pt-2">
                <h3 className="font-sans font-bold text-sm text-[#0D2E5C] uppercase tracking-wide">
                  {fr ? 'Nous pouvons vous aider pour :' : 'We can help you with:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {reasons.map((r) => (
                    <div key={r.title} className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,46,92,0.06)] border border-[#0D2E5C]/6 hover:shadow-[0_4px_20px_rgba(13,46,92,0.10)] transition-shadow">
                      <r.Icon size={18} className={r.color} />
                      <div>
                        <p className="font-sans font-bold text-xs text-[#0D2E5C] leading-tight">{r.title}</p>
                        <p className="font-serif text-[10px] text-gray-400 leading-relaxed mt-1">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>

            {/* ── COLONNE DROITE : formulaire ───────────────────── */}
            <motion.div variants={fadeUp} transition={{ delay: 0.1 }}>
              <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white p-6 md:p-10 sticky top-24">
                <h2 className="font-sans font-extrabold text-xl text-[#0D2E5C] tracking-tight mb-1">
                  {fr ? 'Envoyez-nous un message' : 'Send us a message'}
                </h2>
                <p className="font-serif text-sm text-gray-400 mb-6">
                  {fr
                    ? 'Notre secrétariat vous répond sous 24h ouvrables.'
                    : 'Our secretariat will reply within 24 working hours.'}
                </p>
                <ContactForm onSuccess={(msg) => setToastMessage(msg)} />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
