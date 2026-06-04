/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../lib/LanguageContext.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Toast } from '../components/ui/Toast.tsx';
import { Award, Heart, Users, MapPin, Clock, ShieldAlert, Download, Sparkles } from 'lucide-react';
import { Buildings, Translate } from '@phosphor-icons/react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const pillarBorderColors = [
  'border-t-brand-blue-deep',
  'border-t-[#E02424]',
  'border-t-brand-green',
  'border-t-brand-blue-light',
];

const pillarBgColors = [
  'from-[#0D2E5C]/10 to-[#0D2E5C]/5',
  'from-[#E02424]/10 to-[#E02424]/5',
  'from-brand-green/10 to-brand-green/5',
  'from-brand-blue-light/10 to-brand-blue-light/5',
];

export const Ecole: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [activeRegTab, setActiveRegTab] = useState("horaires");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadReglement = () => {
    setToastMessage(fr
      ? "Le téléchargement du Règlement Intérieur d'EPV Horizons Savants (format PDF) a débuté."
      : "The download of the EPV Horizons Savants Internal Regulations (PDF format) has started.");
  };

  const leadershipTeam = [
    {
      name: "Mme Clarisse Touré Epse KOFFI",
      role: fr ? "Fondatrice d'EPV Horizons Savants" : "Founder of EPV Horizons Savants",
      bio: fr
        ? "Normalienne diplômée de l'ENS Abidjan avec 18 ans d'expertises de direction en écoles privées d'excellence. Convaincue qu'une saine discipline scolaire alliée à un accompagnement profondément bienveillant de l'élève dessine la trajectoire de l'élite de demain."
        : "Graduate of ENS Abidjan with 18 years of leadership experience in elite private schools. Convinced that sound academic discipline combined with deeply caring student support shapes the path to tomorrow's leaders.",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Dr. Marc-André Kouyo",
      role: fr ? "Directeur Académique Primaire & Bilinguisme" : "Academic Director – Primary & Bilingualism",
      bio: fr
        ? "Docteur en Sciences de l'Éducation de l'Université de Lille, ex-conseiller de programmes linguistiques bilingues pour l'Afrique de l'Ouest. Il anime le perfectionnement de notre pédagogie active bilingue."
        : "Doctor in Education Sciences from the University of Lille, former bilingual language program advisor for West Africa. He drives the continuous improvement of our bilingual active pedagogy.",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const valuePillars = [
    {
      title: fr ? "Rigueur Académique" : "Academic Rigor",
      desc: fr
        ? "Assimiler avec rigueur les méthodes de calcul complexes et de lecture fluide pour donner l'aptitude d'excellence dès l'enfance en Côte d'Ivoire."
        : "Rigorously mastering complex calculation methods and fluent reading to build an excellence mindset from childhood in Côte d'Ivoire.",
      icon: <Award className="text-brand-blue-deep" size={22} />
    },
    {
      title: fr ? "Bienveillance Comportementale" : "Caring Approach",
      desc: fr
        ? "Considérer chaque enfant d'Abidjan comme un univers d'éveil de talents unique méritant une écoute bienveillante, active et respectueuse."
        : "Treating every child in Abidjan as a unique universe of emerging talent deserving caring, attentive and respectful guidance.",
      icon: <Heart className="text-[#E02424]" size={22} />
    },
    {
      title: fr ? "Infrastructures d'Élite" : "Elite Facilities",
      desc: fr
        ? "Un campus moderne climatisé de Cocody, sécurisé, à effectif verrouillé, avec un jardin écologique d'orientation d'apprentissage."
        : "A modern air-conditioned campus in Cocody, secured with strict enrollment caps and a guided ecological learning garden.",
      icon: <Buildings className="text-brand-green" size={22} />
    },
    {
      title: fr ? "Pensée Bilingue Globale" : "Global Bilingual Thinking",
      desc: fr
        ? "Former dès la petite section des citoyens d'élites d'Abidjan ouverts sur les opportunités éducatives nationales et internationales."
        : "Shaping global citizens from Nursery class, open to national and international educational opportunities.",
      icon: <Translate className="text-brand-blue-light" size={22} />
    }
  ];

  const regTabs = fr ? [
    { id: "horaires", label: "Horaires Officiels", desc: "Secrétariat & cours" },
    { id: "vestimentaire", label: "Code Vestimentaire", desc: "Uniforme & tenue Mercredi" },
    { id: "evaluations", label: "Évaluation & Absences", desc: "Règles administratives" },
    { id: "sante", label: "Charte de Santé", desc: "Sécurité & déclarations" },
  ] : [
    { id: "horaires", label: "Official Schedule", desc: "Secretariat & classes" },
    { id: "vestimentaire", label: "Dress Code", desc: "Uniform & Wednesday attire" },
    { id: "evaluations", label: "Assessments & Absences", desc: "Administrative rules" },
    { id: "sante", label: "Health Charter", desc: "Safety & declarations" },
  ];

  return (
    <div className="relative select-none bg-gradient-to-br from-[#F4F8FF] to-white min-h-screen">

      {/* ── HERO HEADER — Navy Dark ── */}
      <section className="bg-[#0D2E5C] relative overflow-hidden py-20 px-4 md:px-8">
        {/* Decorative radial glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_60%_40%,#F5A62355,transparent_70%)]" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#F5A623]/80 mb-5 font-sans">
            {fr ? "Une Institution d'Élite en Côte d'Ivoire" : 'An Elite Institution in Ivory Coast'}
          </span>
          <h1 className="font-sans font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight leading-tight">
            {fr ? 'Notre École & ' : 'Our School & '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#F5A623]">{fr ? 'Notre Vision' : 'Our Vision'}</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-[#F5A623]/20 rounded -z-0" />
            </span>
          </h1>
          <p className="mt-6 text-sm md:text-base text-white/70 font-serif leading-relaxed max-w-2xl mx-auto">
            {fr
              ? "EPV Horizons Savants est née de l'ambition d'offrir à la jeunesse ivoirienne une éducation de standing international, enracinée dans les valeurs d'éthique, de travail et d'humanisme."
              : "EPV Horizons Savants was born from the ambition to offer Ivorian youth an internationally-standard education, rooted in the values of ethics, hard work and humanism."}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#F5A623]/40" />
            <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <div className="h-px w-16 bg-[#F5A623]/40" />
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 space-y-20">

        {/* ── LETTRE FONDATRICE ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

              {/* Image fondatrice */}
              <div className="lg:col-span-5 relative flex items-center justify-center bg-gradient-to-br from-[#EBF3FF] to-[#F4F8FF] p-10">
                <div className="relative">
                  {/* Organic blob shape */}
                  <div
                    className="w-64 h-72 md:w-72 md:h-80 overflow-hidden shadow-[0_8px_40px_rgba(13,46,92,0.18)]"
                    style={{ borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%' }}
                  >
                    <img
                      src={leadershipTeam[0].img}
                      alt="Clarisse Touré Koffi"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                  <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[#0D2E5C] font-sans font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                    {fr ? 'Fondatrice & Directrice' : 'Founder & Principal'}
                  </p>
                </div>
              </div>

              {/* Texte lettre */}
              <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-5">
                <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#F5A623]">
                  {fr ? "Mot d'orientation de la Fondatrice" : "Founder's Welcome Message"}
                </span>

                {/* Citation principale */}
                <blockquote className="relative pl-6 border-l-4 border-[#F5A623]">
                  <span className="absolute -top-4 -left-2 font-serif text-7xl text-[#F5A623]/30 leading-none select-none">"</span>
                  <p className="font-serif italic text-xl md:text-2xl text-[#0D2E5C] leading-snug font-semibold">
                    {fr ? "Ouvrir un livre, c'est ouvrir un horizon pour la vie." : 'Opening a book is opening a horizon for life.'}
                  </p>
                  <span className="absolute -bottom-8 right-0 font-serif text-7xl text-[#F5A623]/30 leading-none select-none">"</span>
                </blockquote>

                <div className="space-y-4 font-serif text-brand-muted leading-relaxed text-sm pt-4">
                  {fr ? (
                    <>
                      <p>
                        <span className="float-left font-serif font-bold text-5xl text-[#0D2E5C] leading-[0.8] mr-2 mt-1">C</span>
                        her parent d'excellence d'Abidjan, l'ouverture d'<strong className="text-[#0D2E5C] font-sans">EPV Horizons Savants</strong> pour Septembre 2026 à Cocody Riviera M'Pouto représente l'aboutissement d'un long rêve pédagogique. Notre ambition n'est pas uniquement de dispenser des enseignements d'élite conformes aux examens nationaux, mais de guider des enfants à devenir autonomes, bilingues, curieux et engagés socialement.
                      </p>
                      <p>
                        En limitant nos effectifs scolaires à <strong className="text-[#0D2E5C] font-sans">15 élèves maximum en maternelle</strong>, nous offrons une attention individualisée de tous les instants. Notre école est un havre d'épanouissement vert et climatisé, hautement surveillé, où le plaisir d'apprendre côtoie la rigueur scientifique et linguistique d'Abidjan.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <span className="float-left font-serif font-bold text-5xl text-[#0D2E5C] leading-[0.8] mr-2 mt-1">D</span>
                        ear excellence-minded parent, the opening of <strong className="text-[#0D2E5C] font-sans">EPV Horizons Savants</strong> for September 2026 at Cocody Riviera M'Pouto is the culmination of a long pedagogical dream. Our ambition is not simply to deliver elite teaching aligned with national exams, but to guide children toward becoming autonomous, bilingual, curious, and socially engaged individuals.
                      </p>
                      <p>
                        By limiting our class sizes to <strong className="text-[#0D2E5C] font-sans">a maximum of 15 students in kindergarten</strong>, we provide personalized attention at every moment. Our school is a green, air-conditioned haven under high surveillance, where the joy of learning meets scientific and linguistic rigor in Abidjan.
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <p className="font-sans font-bold text-[#0D2E5C] text-xs">
                    Mme Clarisse Touré Koffi
                  </p>
                  <p className="text-[10px] text-brand-muted font-serif">{fr ? "Fondatrice académique d'EPV Horizons Savants" : 'Academic Founder of EPV Horizons Savants'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── PILIERS DE VALEURS — Bento Grid ── */}
        <section>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C]">
              {fr ? <>Les Valeurs au Cœur de{' '}<span className="text-[#F5A623]">Notre École</span></> : <>Values at the Heart of{' '}<span className="text-[#F5A623]">Our School</span></>}
            </h2>
            <div className="h-1 w-14 bg-[#F5A623] mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {valuePillars.map((v, i) => (
              <motion.div key={i} variants={itemVariants}>
                <div
                  className={`rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border-t-4 ${pillarBorderColors[i]} p-6 h-full flex flex-col gap-4 hover:shadow-[0_8px_40px_rgba(13,46,92,0.14)] transition-shadow duration-300`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillarBgColors[i]} flex items-center justify-center shrink-0`}>
                    {v.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-sans font-bold text-sm text-[#0D2E5C] leading-tight">{v.title}</h3>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif">{v.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── ÉQUIPE DIRECTION ── */}
        <section>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] flex items-center gap-2 justify-center">
              <Users size={24} className="text-[#F5A623]" />
              {fr ? <>Notre{' '}<span className="text-[#F5A623]">Équipe</span></> : <>Our{' '}<span className="text-[#F5A623]">Team</span></>}
            </h2>
            <div className="h-1 w-14 bg-[#F5A623] mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {leadershipTeam.map((member, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start hover:shadow-[0_8px_40px_rgba(13,46,92,0.14)] transition-shadow duration-300 h-full">
                  {/* Photo ronde double ring */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full ring-4 ring-[#F5A623] ring-offset-4 ring-offset-white shadow-lg overflow-hidden">
                      <img
                        src={member.img}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 min-w-0">
                    <h3 className="font-sans font-bold text-sm md:text-base text-[#0D2E5C] leading-tight">
                      {member.name}
                    </h3>
                    <span className="text-[10px] uppercase font-sans font-semibold text-[#F5A623] leading-none">
                      {member.role}
                    </span>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif pt-1">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── RÈGLEMENT INTÉRIEUR ── */}
        <motion.section
          id="reglement-interieur-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-6 md:p-10 space-y-8">

            {/* Section header */}
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C]">
                {fr ? <>Charte Académique &{' '}<span className="text-[#F5A623]">Règlement Intérieur</span></> : <>Academic Charter &{' '}<span className="text-[#F5A623]">Internal Regulations</span></>}
              </h2>
              <p className="text-xs text-brand-muted font-serif mt-2 leading-relaxed">
                {fr
                  ? "La tenue d'une discipline d'excellence sur notre campus d'Abidjan est le gage de l'épanouissement de votre enfant."
                  : 'Maintaining excellent discipline on our Abidjan campus is the foundation of your child\'s flourishing.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Pills Sidebar */}
              <div className="md:col-span-4 flex flex-col gap-2">
                {regTabs.map((tab) => {
                  const isActive = activeRegTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveRegTab(tab.id)}
                      className={`relative p-4 rounded-2xl text-left font-sans cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0D2E5C] text-white shadow-[0_4px_20px_rgba(13,46,92,0.25)]'
                          : 'bg-[#F4F8FF] text-[#0D2E5C] hover:bg-[#EBF3FF]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F5A623] rounded-r-full" />
                      )}
                      <strong className={`block text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-[#0D2E5C]'}`}>
                        {tab.label}
                      </strong>
                      <span className={`text-[10px] block mt-1 ${isActive ? 'text-white/60' : 'text-brand-muted'}`}>
                        {tab.desc}
                      </span>
                    </button>
                  );
                })}

                <Button
                  variant="cta"
                  className="mt-3 uppercase text-xs font-bold font-sans py-3 w-full flex items-center justify-center gap-2 rounded-2xl"
                  onClick={handleDownloadReglement}
                >
                  <Download size={14} /> {fr ? 'Télécharger le PDF Complet' : 'Download Full PDF'}
                </Button>
              </div>

              {/* Tab Content Panel */}
              <div className="md:col-span-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRegTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border border-[#0D2E5C]/8 p-6 md:p-8 min-h-[280px] flex flex-col justify-between"
                  >
                    {activeRegTab === "horaires" && (
                      <div className="space-y-4 text-xs font-sans text-brand-dark">
                        <h3 className="font-sans font-bold text-sm text-[#0D2E5C] border-b border-[#0D2E5C]/10 pb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Clock size={15} className="text-[#F5A623] shrink-0" />
                          {fr ? "Horaires de Fonctionnement d'Abidjan" : 'Operating Hours in Abidjan'}
                        </h3>
                        <div className="space-y-3 leading-relaxed">
                          <div className="p-4 bg-[#F4F8FF] rounded-2xl border border-[#0D2E5C]/8">
                            <strong className="block text-[#0D2E5C] font-sans mb-1">{fr ? 'Le Secrétariat & Accueil Administratif :' : 'Secretariat & Administrative Reception:'}</strong>
                            <span className="text-brand-muted font-serif">
                              {fr
                                ? 'Lundi au Vendredi : 07h30 – 12h30 et 13h30 – 17h00. Samedi : 08h30 – 12h00.'
                                : 'Monday to Friday: 07:30 – 12:30 and 13:30 – 17:00. Saturday: 08:30 – 12:00.'}
                            </span>
                          </div>
                          <div className="p-4 bg-[#F4F8FF] rounded-2xl border border-[#0D2E5C]/8">
                            <strong className="block text-[#0D2E5C] font-sans mb-1">{fr ? 'Cycle Maternelle (Éveil Actif) :' : 'Kindergarten Cycle (Active Awakening):'}</strong>
                            <span className="text-brand-muted font-serif">
                              {fr
                                ? "08h00 – 13h00 (Une garderie gratuite hautement surveillée est assurée jusqu'à 14h00 pour la sérénité des parents)."
                                : '08:00 – 13:00 (Free supervised after-care is provided until 14:00 for parents\' peace of mind).'}
                            </span>
                          </div>
                          <div className="p-4 bg-[#F4F8FF] rounded-2xl border border-[#0D2E5C]/8">
                            <strong className="block text-[#0D2E5C] font-sans mb-1">{fr ? 'Cycle Primaire (CP à CM2) :' : 'Primary Cycle (Grade 1 to Grade 5):'}</strong>
                            <span className="text-brand-muted font-serif">
                              {fr
                                ? "08h00 – 12h30 et 14h30 – 16h30. Pas de classe le Mercredi après-midi pour les activités sportives d'Abidjan."
                                : '08:00 – 12:30 and 14:30 – 16:30. No afternoon classes on Wednesday — reserved for sports and enrichment activities.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeRegTab === "vestimentaire" && (
                      <div className="space-y-4 text-xs font-sans text-brand-dark">
                        <h3 className="font-sans font-bold text-sm text-[#0D2E5C] border-b border-[#0D2E5C]/10 pb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Award size={15} className="text-[#F5A623] shrink-0" />
                          {fr ? 'Tenue Réglementaire & Code Vestimentaire' : 'Regulation Attire & Dress Code'}
                        </h3>
                        <div className="space-y-3 leading-relaxed">
                          <p className="p-4 bg-[#0D2E5C]/5 rounded-2xl border border-[#0D2E5C]/10 text-[#0D2E5C] font-sans font-semibold">
                            {fr
                              ? "L'élégance vestimentaire d'EPV Horizons Savants répercute l'état d'esprit rigoureux et ordonné de notre élite académique."
                              : "EPV Horizons Savants' dress elegance reflects the rigorous and disciplined mindset of our academic elite."}
                          </p>
                          <ul className="list-none pl-0 space-y-2 font-serif text-brand-muted">
                            {(fr ? [
                              { label: "Lundi, Mardi, Jeudi, Vendredi :", text: "Port de l'uniforme officiel obligatoire remis à l'inscription définitive au secrétariat." },
                              { label: "Le Mercredi :", text: "Port obligatoire et systématique du polo officiel Horizons Savants pour un brassage convivial." },
                              { label: "Éducation Physique (EPS) :", text: "Tenue de sport officielle de l'école obligatoire durant les sessions sportives." },
                              { label: "Exigences comportementales :", text: "Coiffure décente et soignée, perçages et tatouages visibles strictement interdits, débardeurs et foulards extravagants proscrits." },
                            ] : [
                              { label: "Monday, Tuesday, Thursday, Friday:", text: "Wearing the official uniform is mandatory — provided at enrollment at the secretariat." },
                              { label: "Wednesday:", text: "Mandatory wearing of the official Horizons Savants polo shirt for community-building activities." },
                              { label: "Physical Education (PE):", text: "Official school sports attire is mandatory during all sports sessions." },
                              { label: "Behavioral requirements:", text: "Neat and tidy hair; visible piercings and tattoos strictly prohibited; extravagant tank tops and scarves banned." },
                            ]).map((item, i) => (
                              <li key={i} className="flex gap-2.5 p-3 bg-[#F4F8FF] rounded-xl border border-[#0D2E5C]/8">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] mt-1.5 shrink-0" />
                                <span><strong className="text-[#0D2E5C] font-sans">{item.label}</strong> {item.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeRegTab === "evaluations" && (
                      <div className="space-y-4 text-xs font-sans text-brand-dark">
                        <h3 className="font-sans font-bold text-sm text-[#0D2E5C] border-b border-[#0D2E5C]/10 pb-3 flex items-center gap-2 uppercase tracking-wider">
                          <ShieldAlert size={15} className="text-[#F5A623] shrink-0" />
                          {fr ? "Assiduité, Absences & Évaluations d'État" : 'Attendance, Absences & Official Assessments'}
                        </h3>
                        <div className="space-y-3 leading-relaxed">
                          <div className="p-4 bg-[#F4F8FF] rounded-2xl border border-[#0D2E5C]/8">
                            <strong className="block text-[#0D2E5C] font-sans mb-1">{fr ? 'Strict Respect des Évaluations :' : 'Strict Assessment Attendance:'}</strong>
                            <span className="text-brand-muted font-serif">
                              {fr
                                ? "La participation de l'élève à l'ensemble des contrôles réguliers et examens blancs est d'obligation absolue pour son orientation d'excellence."
                                : "Student participation in all regular tests and mock exams is an absolute requirement for their excellence pathway."}
                            </span>
                          </div>
                          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900">
                            <strong className="block font-sans mb-1">{fr ? 'Règlement de Justification (Absence) :' : 'Absence Justification Policy:'}</strong>
                            <span className="font-serif leading-relaxed">
                              {fr
                                ? <>Chaque absence à un contrôle doit faire l'objet d'un justificatif officiel (certificat médical) sous 48h au secrétariat, faute de quoi la note de <strong>Zéro (0/20)</strong> sera attribuée sans dérogation. En cas de motif légitime, une épreuve de remplacement sera planifiée.</>
                                : <>Every absence from an assessment must be justified with an official document (medical certificate) within 48 hours at the secretariat; otherwise a grade of <strong>Zero (0/20)</strong> is assigned with no exception. In case of a legitimate reason, a make-up test will be scheduled.</>}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeRegTab === "sante" && (
                      <div className="space-y-4 text-xs font-sans text-brand-dark">
                        <h3 className="font-sans font-bold text-sm text-[#0D2E5C] border-b border-[#0D2E5C]/10 pb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Heart size={15} className="text-[#E02424] shrink-0" />
                          {fr ? "Charte Médicale & Urgence d'Abidjan" : 'Medical Charter & Emergency Protocol'}
                        </h3>
                        <div className="space-y-3 leading-relaxed">
                          <p className="p-4 bg-[#0D2E5C]/5 rounded-2xl border border-[#0D2E5C]/10 text-[#0D2E5C] font-sans font-semibold">
                            {fr
                              ? "Un campus sécurisé d'Abidjan est fondé sur l'implication active de chaque parent d'excellence."
                              : "A safe campus in Abidjan is built on the active involvement of every excellence-minded parent."}
                          </p>
                          <ul className="list-none pl-0 space-y-2 font-serif text-brand-muted">
                            {(fr ? [
                              { label: "Notification d'urgence :", text: "En cas de montée de fièvre supérieure à 38°C, malaise ou accident physique survenu sur le campus, les parents d'élèves sont avisés instantanément au téléphone pour un rapatriement ou une prise en charge rapide." },
                              { label: "Maladies contagieuses :", text: "Les parents ont l'obligation réglementaire d'alerter par écrit la direction scolaire si leur enfant présente des symptômes contagieux, afin de lancer l'isolement prophylactique." },
                            ] : [
                              { label: "Emergency notification:", text: "In case of fever above 38°C, fainting, or physical injury on campus, parents are immediately notified by phone for pickup or rapid medical assistance." },
                              { label: "Contagious illness:", text: "Parents are legally required to notify the school administration in writing if their child shows contagious symptoms, so that prophylactic isolation measures can be implemented." },
                            ]).map((item, i) => (
                              <li key={i} className="flex gap-2.5 p-3 bg-[#F4F8FF] rounded-xl border border-[#0D2E5C]/8">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E02424] mt-1.5 shrink-0" />
                                <span><strong className="text-[#0D2E5C] font-sans">{item.label}</strong> {item.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 border-t border-[#0D2E5C]/8 pt-4 flex items-center gap-1.5 text-[10px] text-brand-muted leading-relaxed italic font-serif">
                      <Sparkles size={11} className="text-[#F5A623]" />
                      <span>{fr ? "EPV Horizons Savants milite pour la rigueur du corps et l'excellence de l'esprit." : 'EPV Horizons Savants champions physical discipline and the excellence of the mind.'}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── LOCALISATION ── */}
        <motion.section
          className="scroll-mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

              {/* Text */}
              <div className="lg:col-span-6 p-8 md:p-12 space-y-5 flex flex-col justify-center">
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] leading-tight">
                  {fr ? <>Emplacement{' '}<span className="text-[#F5A623]">Privilégié</span>{' '}d'Apprentissage</> : <>A{' '}<span className="text-[#F5A623]">Prime</span>{' '}Learning Location</>}
                </h2>
                <div className="h-0.5 w-14 bg-brand-green rounded-full" />
                <p className="text-sm text-brand-muted font-serif leading-relaxed">
                  {fr
                    ? "Notre complexe scolaire bénéficie d'une accessibilité aisée à l'angle du grand Boulevard de l'excellence, Cocody Riviera M'Pouto, en Côte d'Ivoire. Un havre arboré, éloigné des bruits industriels d'Abidjan pour maximiser la quiétude de l'esprit de l'élève."
                    : "Our school complex enjoys easy access at the corner of the grand Boulevard of Excellence, Cocody Riviera M'Pouto, in Côte d'Ivoire. A leafy haven, far from industrial noise, to maximize the student's peace of mind."}
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-[#F4F8FF] rounded-2xl border border-[#0D2E5C]/8">
                    <MapPin size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
                    <span className="text-xs font-sans text-[#0D2E5C] font-medium">{fr ? "Riviera M'Pouto, en face du Club équestre d'Abidjan, CIV" : "Riviera M'Pouto, opposite the Abidjan Equestrian Club, CIV"}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted italic font-serif pl-1">
                    {fr
                      ? "* Un parking privé ombragé est aménagé à l'extérieur pour simplifier le dépôt sécurisé de vos enfants le matin par voiture."
                      : "* A shaded private parking area is available outside to simplify safe morning drop-off by car."}
                  </p>
                </div>
              </div>

              {/* Map visual — Google Maps embed */}
              <div className="lg:col-span-6 overflow-hidden flex flex-col">
                <iframe
                  title="EPV Horizons Savants — Localisation"
                  src="https://maps.google.com/maps?q=Riviera+M%27Pouto+Abidjan+C%C3%B4te+d%27Ivoire&output=embed&hl=fr&z=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', minHeight: 280, flex: 1 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="px-5 py-3 bg-white border-t border-[#0D2E5C]/10 flex items-center justify-between gap-4">
                  <span className="font-sans font-bold text-xs text-[#0D2E5C]">
                    {fr ? "Riviera M'Pouto · Cocody, Abidjan" : "Riviera M'Pouto · Cocody, Abidjan"}
                  </span>
                  <a
                    href="https://maps.google.com/?q=Riviera+M'Pouto+Abidjan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold text-white bg-[#0D2E5C] hover:bg-[#1A4F8B] px-4 py-2 rounded-full shadow-sm transition-all shrink-0"
                  >
                    {fr ? "Ouvrir dans Google Maps" : 'Open in Google Maps'}
                    <span>→</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </motion.section>

      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
