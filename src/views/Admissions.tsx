/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PreInscriptionForm } from '../components/forms/PreInscriptionForm.tsx';
import { AppointmentForm } from '../components/forms/AppointmentForm.tsx';
import { Accordion } from '../components/ui/Accordion.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Stepper } from '../components/ui/Stepper.tsx';
import { Toast } from '../components/ui/Toast.tsx';
import { useLang } from '../lib/LanguageContext.tsx';
import {
  CheckCircle, ShieldAlert, FileText, Gift, Calendar, Phone,
  Award, HelpCircle, Download, AlertCircle, Sparkles, Clock, FilePlus,
  ChevronRight, Lock, Mail
} from 'lucide-react';
import { Baby, Books, Student } from '@phosphor-icons/react';

/* ─── Animation variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const Admissions: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [createdProspect, setCreatedProspect] = useState<any | null>(null);
  const [showRdvBooking, setShowRdvBooking] = useState(false);
  const [rdvBooked, setRdvBooked] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 6, minutes: 5, seconds: 50 });
  const [selectedDocTab, setSelectedDocTab] = useState("maternelle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadStub = (fileName: string) => {
    setToastMessage(`Le téléchargement du document "${fileName}" a commencé (Dépôt d'Abidjan).`);
  };

  useEffect(() => {
    const targetDate = new Date("2026-06-15T18:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/places")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load quotas.");
        return res.json();
      })
      .then((data) => setPlaces(data))
      .catch((err) => console.error("Error loading places:", err));
  }, []);

  const stepsAdmissions = fr
    ? [
        { label: "1. Pré-inscription", description: "Formulaire en 2 minutes" },
        { label: "2. Évaluation Enfant", description: "Test gratuit & entretien" },
        { label: "3. Validation Dossier", description: "Dépôt des documents physiques" },
        { label: "4. Confirmation", description: "Règlement & validation" },
      ]
    : [
        { label: "1. Pre-enrollment", description: "2-minute form" },
        { label: "2. Child Assessment", description: "Free test & interview" },
        { label: "3. File Validation", description: "Physical document submission" },
        { label: "4. Confirmation", description: "Payment & validation" },
      ];

  const tuitionFees = [
    {
      section: fr ? "Maternelle" : "Kindergarten",
      subtitle: fr ? "Petite Section • Moyenne Section • Grande Section" : "Nursery • Middle Class • Senior Class",
      droitIns: "150 000",
      scolarite: "1 200 000",
      fournitures: "120 000",
      total: "1 470 000",
      accent: "from-violet-500 to-purple-600",
      icon: <Baby size={32} weight="fill" className="text-white" />,
    },
    {
      section: fr ? "Primaire Cycle 1" : "Primary Cycle 1",
      subtitle: "CPI/CP • CE1 • CE2",
      droitIns: "150 000",
      scolarite: "1 500 000",
      fournitures: "150 000",
      total: "1 800 000",
      accent: "from-brand-blue-medium to-brand-blue-deep",
      icon: <Books size={32} weight="fill" className="text-white" />,
    },
    {
      section: fr ? "Primaire Cycle 2" : "Primary Cycle 2",
      subtitle: "CM1 • CM2",
      droitIns: "150 000",
      scolarite: "1 700 000",
      fournitures: "180 000",
      total: "2 030 000",
      accent: "from-brand-gold to-amber-500",
      icon: <Student size={32} weight="fill" className="text-white" />,
    },
  ];

  const faqList = fr ? [
    {
      title: "Quels sont les documents obligatoires pour l'inscription définitive ?",
      content: "Pour que l'inscription physique soit validée, vous devez fournir au secrétariat : l'extrait d'acte de naissance original de l'enfant, une copie de son carnet de vaccination à jour, 4 photos d'identité couleur récentes de l'enfant, les bulletins scolaires de l'année précédente (pour l'accès au primaire), et une pièce d'identité du parent/tuteur légal.",
    },
    {
      title: "Quel est le programme d'enseignement officiel suivi ?",
      content: "EPV Horizons Savants suit rigoureusement le programme officiel de l'Éducation Nationale de Côte d'Ivoire, garantissant l'accès à tous les examens et équivalences de l'État. Toutefois, nous l'enrichissons de façon significative avec le bilinguisme immersif précoce, l'anglais renforcé écrit, les mathématiques par la méthode active de Singapour, et des ateliers robotiques/informatiques spécifiques.",
    },
    {
      title: "Quelles sont les modalités de règlement de la scolarité d'Abidjan ?",
      content: "Par souci de commodité, la scolarité d'EPV Horizons Savants est payable en 3 versements (trimestriels) : un premier versement lors de la confirmation physique d'inscription en août, un deuxième en décembre, et le dernier versement en mars. Pour le moment, les transactions s'effectuent par chèque de banque certifié ou dépôt/virement physique d'Abidjan, aucun paiement direct en ligne n'est traité.",
    },
    {
      title: "En quoi consiste le test d'évaluation de l'enfant ?",
      content: "Le test d'évaluation est gratuit et bienveillant. Pour la maternelle, il s'agit d'observer la motricité, le langage spontané, et de vérifier sa socialisation collective. Pour le primaire, il évalue le niveau de lecture phonique et d'écriture en français ainsi que les bases logiques des mathématiques. Ce test n'est pas éliminatoire, mais permet à notre équipe d'harmoniser le suivi individuel.",
    },
    {
      title: "Comment fonctionne l'avantage de parrainage de 10% ?",
      content: "Chaque parent dispose à la pré-inscription d'un code unique (ex : EPV-AKA01). Lorsque vous partagez ce code avec des proches, et qu'ils le saisissent dans leur formulaire, vous êtes lié. Dès que l'inscription de votre filleul est confirmée physiquement et ses droits acquittés, vous bénéficiez de 10% de réduction immédiate sur la scolarité de vos enfants. L'avantage est cumulable jusqu'à 4 filleuls (soit 40% de réduction) !",
    },
    {
      title: "Le transport scolaire et la cantine d'Abidjan sont-ils fournis ?",
      content: "Oui, un service de cantine saine et équilibrée cuisinée sur place est proposé individuellement aux parents (facturé séparément). Nous desservons également un circuit de transport scolaire sécurisé et climatisé couvrant en priorité les zones d'Abidjan : Cocody, Riviera Palmeraie, M'Pouto, Bingerville, Marcory et Plateau.",
    },
    {
      title: "Vos locaux scolaires d'Abidjan disposent-ils d'une surveillance ?",
      content: "La sécurité est notre priorité absolue. L'enceinte de notre complexe éducatif est dotée d'une enceinte fermée, d'un contrôle d'accès vigile 24h/24, et d'une couverture de télésurveillance CCTV des cours extérieurs. Les entrées et sorties des élèves font l'objet d'un émargement obligatoire.",
    },
    {
      title: "Proposez-vous une garderie ou des activités après les classes ?",
      content: "Oui, une garderie animée et surveillée est ouverte le soir jusqu'à 18h00 pour accompagner les parents qui travaillent. Durant cet intervalle, de multiples clubs d'éveil parascolaires (peinture, échecs, anglais d'éloquence, club d'écriture, judo) sont ouverts aux enfants.",
    },
    {
      title: "Mon enfant peut-il s'inscrire s'il est de nationalité étrangère ?",
      content: "Tout à fait. Notre école est ouverte à tous les enfants d'excellence, ivoiriens ou résidents internationaux. Nos équivalences facilitent l'intégration future dans n'importe quel système scolaire mondial (francophone, anglophone).",
    },
    {
      title: "Quels sont les effectifs admis par classe ?",
      content: "Afin de privilégier l'excellence pédagogique, nous bloquons strictement les effectifs à 15 élèves maximum en classe de Maternelle (PS, MS, GS) et 20 élèves maximum en classe de Primaire (CP au CM2). Les inscriptions cessent automatiquement dès que les capacités limites d'Abidjan sont atteintes.",
    },
  ] : [
    {
      title: "What documents are required for final enrollment?",
      content: "For physical enrollment to be validated, you must provide at the secretariat: the child's original birth certificate, an up-to-date vaccination record, 4 recent color passport photos of the child, previous year's report cards (for primary school entry), and a valid ID of the parent/legal guardian.",
    },
    {
      title: "What official curriculum do you follow?",
      content: "EPV Horizons Savants rigorously follows the official curriculum of Côte d'Ivoire's National Ministry of Education, guaranteeing access to all state exams and equivalences. However, we significantly enrich it with early immersive bilingualism, advanced English writing, Singapore active math methods, and dedicated robotics/computing workshops.",
    },
    {
      title: "How can tuition fees be paid?",
      content: "For convenience, EPV Horizons Savants tuition is payable in 3 quarterly installments: a first payment at physical enrollment confirmation in August, a second in December, and the final installment in March. Transactions are currently processed by certified bank cheque or physical bank transfer — no direct online payment is processed.",
    },
    {
      title: "What does the child evaluation test involve?",
      content: "The evaluation test is free and caring. For kindergarten, it observes motor skills, spontaneous language, and collective socialization. For primary school, it assesses phonics reading level, French writing, and basic mathematical logic. The test is not eliminatory; it simply allows our team to tailor individualized monitoring.",
    },
    {
      title: "How does the 10% referral discount work?",
      content: "Each parent receives a unique code at pre-enrollment (e.g. EPV-AKA01). When you share this code with friends or family and they enter it in their form, you are linked. Once your referral's enrollment is physically confirmed and fees paid, you receive an immediate 10% discount on your child's tuition. The benefit is cumulative up to 4 referrals (40% total discount)!",
    },
    {
      title: "Is school transport and canteen provided?",
      content: "Yes, a healthy and balanced canteen cooked on-site is offered to parents individually (billed separately). We also operate a secure, air-conditioned school transport service covering priority areas of Abidjan: Cocody, Riviera Palmeraie, M'Pouto, Bingerville, Marcory and Plateau.",
    },
    {
      title: "Is your school campus in Abidjan under surveillance?",
      content: "Security is our absolute priority. Our educational complex is fully enclosed with 24/7 security guard access control and comprehensive CCTV surveillance of outdoor areas. Student entry and exit are subject to mandatory sign-in/sign-out.",
    },
    {
      title: "Do you offer after-school care or extracurricular activities?",
      content: "Yes, a supervised and animated after-school club is open every evening until 18:00 to support working parents. During this time, multiple extracurricular clubs (painting, chess, English eloquence, writing club, judo) are open to children.",
    },
    {
      title: "Can my child enroll if they are a foreign national?",
      content: "Absolutely. Our school is open to all excellence-minded children, whether Ivorian or international residents. Our equivalences facilitate future integration into any global school system (French-speaking or English-speaking).",
    },
    {
      title: "What are the class sizes?",
      content: "To prioritize pedagogical excellence, we strictly cap class sizes at 15 students maximum in Kindergarten classes (PS, MS, GS) and 20 students maximum in Primary classes (Grade 1 to Grade 5). Enrollment automatically closes once maximum capacity is reached.",
    },
  ];

  const handleFormSuccess = (code: string, prospect: any) => {
    setSuccessCode(code);
    setCreatedProspect(prospect);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRdvSuccess = (appointment: any) => {
    setRdvBooked(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-br from-[#F4F8FF] to-white select-none">

      {/* ══════════════════════════════════════════════════════
          HERO · fond navy avec badge animé
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0b1d3a] py-24 px-4 md:px-8">
        {/* Dot-grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(245,166,35,0.10)_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.18),transparent_70%)]" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
            {fr ? 'Inscriptions Ouvertes · Rentrée Septembre 2026' : 'Enrollments Open · September 2026'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-sans font-extrabold text-4xl md:text-6xl uppercase tracking-tight text-white leading-[1.1]"
          >
            {fr ? 'Admissions & ' : 'Admissions & '}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-gold">{fr ? 'Tarifs' : 'Tuition'}</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-brand-gold/20 rounded-sm -z-0" />
            </span>{' '}
            {fr ? "d'Excellence" : 'of Excellence'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="font-serif text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
          >
            {fr
              ? "Découvrez notre processus d'admissions rigoureux, la grille tarifaire complète pour la rentrée 2026, et déposez votre dossier en ligne depuis Abidjan."
              : "Discover our rigorous admission process, the complete tuition schedule for September 2026, and submit your application online from Abidjan."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center pt-2"
          >
            <a
              href="#inscription-anchor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-gold text-[#0b1d3a] font-bold text-sm shadow-lg hover:brightness-105 transition-all"
            >
              <FilePlus size={15} /> {fr ? 'Déposer ma pré-inscription' : 'Submit my pre-enrollment'}
            </a>
            <a
              href="#admission-documents-section"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              <FileText size={15} /> {fr ? 'Voir les documents requis' : 'View required documents'}
            </a>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">

        {/* ══════════════════════════════════════════════════════
            1. PROCESSUS EN 4 ÉTAPES · Stepper premium
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">

            {/* ── Colonne gauche — contexte & chiffres ── */}
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-[#0b1d3a] text-white p-7 space-y-1">
                <h2 className="font-sans font-extrabold text-xl md:text-2xl text-white leading-tight">
                  {fr ? "Processus d'Inscription" : 'Enrollment Process'}
                  <span className="block text-brand-gold">{fr ? 'en 4 Étapes' : 'in 4 Steps'}</span>
                </h2>
                <div className="h-0.5 w-12 bg-brand-gold/60 rounded-full mt-3 mb-5" />
                {([
                  { val: '4',    label: fr ? 'étapes simples' : 'simple steps' },
                  { val: '15',   label: fr ? 'élèves max · Maternelle' : 'students max · Kindergarten' },
                  { val: '20',   label: fr ? 'élèves max · Primaire' : 'students max · Primary' },
                  { val: '30m',  label: fr ? 'confirmation de rendez-vous' : 'appointment confirmed' },
                ] as { val: string; label: string }[]).map((s) => (
                  <div key={s.label} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                    <span className="font-mono font-extrabold text-2xl text-brand-gold leading-none w-14 shrink-0">{s.val}</span>
                    <span className="font-serif text-xs text-white/65 leading-snug">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-white shadow-[0_4px_30px_rgba(13,46,92,0.08)] p-5 border border-brand-border/40 space-y-3">
                <p className="font-sans font-bold text-[10px] text-brand-blue-deep uppercase tracking-widest">
                  {fr ? 'Rentrée Septembre 2026' : 'September 2026 Enrollment'}
                </p>
                <p className="font-serif text-xs text-brand-muted leading-relaxed">
                  {fr
                    ? "Les places sont limitées et attribuées par ordre de dossier. Déposez votre candidature dès maintenant."
                    : "Spots are limited and assigned in order of application. Submit your file now to secure your place."}
                </p>
                <a href="#inscription-anchor" className="inline-flex items-center gap-1.5 font-sans font-bold text-xs text-brand-gold hover:text-brand-blue-deep transition-colors">
                  {fr ? 'Je dépose ma pré-inscription →' : 'Submit my pre-enrollment →'}
                </a>
              </div>
            </div>

            {/* ── Colonne droite — stepper ── */}
            <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-8 md:p-12 border border-brand-border/40">
              <Stepper steps={stepsAdmissions} currentStep={0} />
            </div>

          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            2. TARIFS · Bento Cards (pas de table HTML)
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-brand-blue-deep tracking-tight">
              {fr ? 'Grille Tarifaire · Rentrée 2026' : 'Tuition Schedule · September 2026'}
            </h2>
            <p className="font-serif text-sm text-brand-muted mt-2 max-w-xl mx-auto">
              {fr
                ? "Un investissement réfléchi pour une éducation d'excellence bilingue individualisée en Côte d'Ivoire."
                : "A thoughtful investment in individualized bilingual excellence education in Côte d'Ivoire."}
            </p>
            <div className="h-1 w-16 bg-brand-gold mx-auto mt-4 rounded-full" />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {tuitionFees.map((fee, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden border border-brand-border/40 flex flex-col"
              >
                {/* Card accent header */}
                <div className={`bg-gradient-to-r ${fee.accent} p-5 text-white`}>
                  <span className="block mb-2">{fee.icon}</span>
                  <h3 className="font-sans font-extrabold text-lg leading-tight">{fee.section}</h3>
                  <p className="text-xs text-white/75 mt-0.5 font-serif">{fee.subtitle}</p>
                </div>

                {/* Price lines */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Total · mis en avant */}
                  <div className="text-center py-3 rounded-2xl bg-gradient-to-br from-[#F4F8FF] to-white border border-brand-border/50">
                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-sans block">{fr ? 'Budget global estimé' : 'Estimated total budget'}</span>
                    <span className="font-mono font-extrabold text-2xl text-brand-blue-deep block mt-0.5">
                      {fee.total} <span className="text-xs font-sans font-semibold text-brand-muted">FCFA</span>
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    {[
                      { label: fr ? "Droit d'inscription unique" : "One-time enrollment fee", val: fee.droitIns },
                      { label: fr ? "Scolarité annuelle" : "Annual tuition", val: fee.scolarite },
                      { label: fr ? "Trousseau & fournitures" : "Kit & supplies", val: fee.fournitures },
                    ].map((line) => (
                      <div key={line.label} className="flex justify-between items-center border-b border-brand-border/40 pb-2.5">
                        <span className="font-serif text-brand-muted text-xs">{line.label}</span>
                        <span className="font-mono font-semibold text-brand-blue-deep text-xs">{line.val} <span className="text-[10px] text-brand-muted font-sans">FCFA</span></span>
                      </div>
                    ))}
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${fee.badgeColor}`}>
                    <Award size={10} /> {fr ? 'Places limitées' : 'Limited spots'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-5xl mx-auto mt-6 p-5 rounded-2xl bg-white shadow-[0_4px_30px_rgba(13,46,92,0.06)] border border-brand-border/40 flex gap-3 items-start"
          >
            <ShieldAlert size={18} className="text-brand-gold shrink-0 mt-0.5" />
            <p className="font-serif text-xs text-brand-dark/90 leading-relaxed">
              {fr ? (
                <><strong>Remarque :</strong> Les droits d'inscription comprennent l'assurance scolaire obligatoire, l'accès permanent aux plateformes numériques et l'infirmerie d'Abidjan.
                Une réduction de <strong>10% cumulable</strong> est appliquée sur la scolarité pour chaque enfant d'un parrainage confirmé.</>
              ) : (
                <><strong>Note:</strong> Enrollment fees include mandatory school insurance, permanent access to digital platforms, and the Abidjan campus infirmary.
                A <strong>cumulative 10% discount</strong> is applied to tuition for each child enrolled through a confirmed referral.</>
              )}
            </p>
          </motion.div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            3. DOCUMENTS REQUIS · pills + ✓ stylés
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="admission-documents-section"
          className="scroll-mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-brand-blue-deep tracking-tight">
              {fr ? "Pièces à Fournir pour l'Inscription" : 'Documents Required for Enrollment'}
            </h2>
            <p className="font-serif text-sm text-brand-muted mt-2 max-w-xl mx-auto">
              {fr
                ? "Sélectionnez la section scolaire de votre enfant pour consulter la liste officielle."
                : "Select your child's school level to view the official required document list."}
            </p>
            <div className="h-1 w-16 bg-brand-gold mx-auto mt-4 rounded-full" />
          </div>

          <div className="max-w-5xl mx-auto rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border border-brand-border/40 overflow-hidden">
            {/* Pill tabs header */}
            <div className="p-6 border-b border-brand-border/40 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "maternelle", label: fr ? "Maternelle" : "Kindergarten", sub: "PS · MS · GS" },
                  { id: "primaire", label: fr ? "Primaire" : "Primary", sub: "CP → CM1" },
                  { id: "cm2", label: "CM2", sub: fr ? "Fin de cycle" : "End of cycle" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedDocTab(tab.id)}
                    className={`px-4 py-2 rounded-full font-sans font-bold text-xs transition-all cursor-pointer border ${
                      selectedDocTab === tab.id
                        ? "bg-brand-blue-deep text-white border-brand-blue-deep shadow-md"
                        : "bg-[#F4F8FF] text-brand-blue-deep border-brand-border/60 hover:border-brand-blue-medium"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-[9px] font-normal ${selectedDocTab === tab.id ? "text-slate-300" : "text-brand-muted"}`}>
                      {tab.sub}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleDownloadStub("dossier_admissions_epv_2026.pdf")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-brand-blue-medium/50 text-brand-blue-medium bg-[#F4F8FF] hover:bg-brand-blue-deep hover:text-white hover:border-brand-blue-deep transition-all text-xs font-bold font-sans cursor-pointer shrink-0"
              >
                <Download size={13} />
                Checklist PDF
              </button>
            </div>

            {/* Document items */}
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-sans font-bold text-sm text-brand-blue-deep uppercase tracking-wider">
                  {selectedDocTab === "maternelle" && (fr ? "Pièces Exigées · Maternelle" : "Required Documents · Kindergarten")}
                  {selectedDocTab === "primaire" && (fr ? "Pièces Exigées · Primaire (CP à CM1)" : "Required Documents · Primary (Grade 1 to Grade 4)")}
                  {selectedDocTab === "cm2" && (fr ? "Pièces Exigées · Classe de CM2" : "Required Documents · Grade 5 (CM2)")}
                </h4>
                <span className="text-[10px] font-mono text-brand-gold font-bold">
                  Rentrée Sep 2026
                </span>
              </div>

              <motion.div
                key={selectedDocTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {selectedDocTab === "maternelle" && (
                  <>
                    {(fr ? [
                      "01 Extrait de Naissance original",
                      "01 Certificat de Vaccination ou Carnet de Vaccination à jour",
                      "08 Photos d'identité de même tirage",
                    ] : [
                      "01 Original Birth Certificate",
                      "01 Vaccination Certificate or up-to-date Vaccination Record",
                      "08 Passport-size photos (identical print)",
                    ]).map((doc, i) => (
                      <DocItem key={i} index={i + 1} text={doc} />
                    ))}
                  </>
                )}

                {selectedDocTab === "primaire" && (
                  <>
                    {(fr ? [
                      "01 Extrait de Naissance original",
                      "04 Photos d'identité de même tirage",
                      "Relevé de notes de la classe précédente",
                    ] : [
                      "01 Original Birth Certificate",
                      "04 Passport-size photos (identical print)",
                      "Previous year's school report card",
                    ]).map((doc, i) => (
                      <DocItem key={i} index={i + 1} text={doc} />
                    ))}
                  </>
                )}

                {selectedDocTab === "cm2" && (
                  <>
                    {(fr ? [
                      "01 Extrait de Naissance original",
                      "04 Photos d'identité de même tirage",
                      "Relevé de notes de la classe précédente",
                    ] : [
                      "01 Original Birth Certificate",
                      "04 Passport-size photos (identical print)",
                      "Previous year's school report card",
                    ]).map((doc, i) => (
                      <DocItem key={i} index={i + 1} text={doc} />
                    ))}
                    {/* Special CM2 item */}
                    <div className="flex gap-3 items-start p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/30">
                      <div className="w-8 h-8 rounded-full bg-brand-gold/25 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5">04</div>
                      <div>
                        <strong className="block text-brand-blue-deep text-sm font-sans">{fr ? "Droit d'examen obligatoire" : 'Mandatory exam fee'}</strong>
                        <span className="font-serif text-xs text-brand-dark/90 leading-relaxed">
                          {fr
                            ? <>Montant réglementaire de <strong>3 000 FCFA</strong> payable obligatoirement lors de l'inscription physique.</>
                            : <>Regulatory amount of <strong>3,000 FCFA</strong> payable at physical enrollment.</>}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              <div className="mt-6 pt-4 border-t border-brand-border/40 flex gap-2 items-start text-[10px] text-brand-muted leading-relaxed font-serif">
                <AlertCircle size={14} className="text-brand-gold shrink-0 mt-0.5" />
                <span>{fr
                  ? "Tous les documents physiques originaux doivent être présentés sous chemise cartonnée (Maternelle : Bleue, Primaire : Jaune)."
                  : "All original physical documents must be presented in a cardboard folder (Kindergarten: Blue, Primary: Yellow)."}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            4. COUNTDOWN + JAUGES DE PLACES
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-red-600 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              {fr ? 'Places extrêmement limitées' : 'Extremely limited spots'}
            </span>
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-brand-blue-deep mt-3 tracking-tight">
              {fr ? 'Compte à Rebours des Places' : 'Enrollment Countdown'}
            </h2>
            <p className="font-serif text-sm text-brand-muted mt-2 max-w-xl mx-auto">
              {fr
                ? <>Effectifs restreints à <strong>15 élèves max</strong> en Maternelle et <strong>20 max</strong> en Primaire.</>
                : <>Class sizes capped at <strong>15 students max</strong> in Kindergarten and <strong>20 max</strong> in Primary.</>}
            </p>
          </div>

          {/* Countdown clock · grand format, fond navy avec glow */}
          <div className="relative max-w-3xl mx-auto mb-12 rounded-3xl overflow-hidden bg-[#0b1d3a] shadow-[0_20px_60px_rgba(11,29,58,0.40)] border border-white/5">
            {/* Dot grid */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(245,166,35,0.12)_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* Gold glow center */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-96 h-56 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.22),transparent_65%)]" />

            <div className="relative py-10 px-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} className="text-brand-gold" />
              </div>

              <p className="font-serif text-slate-300 text-xs max-w-sm mx-auto leading-relaxed">
                {fr
                  ? "Le traitement prioritaire des dossiers parentaux d'Abidjan s'achève automatiquement à la fin de ce décompte."
                  : "Priority processing of parent applications in Abidjan ends automatically when this countdown reaches zero."}
              </p>

              {/* Digits */}
              <div className="flex justify-center items-end gap-3 md:gap-5 select-none py-3">
                {[
                  { val: timeLeft.days, label: fr ? "Jours" : "Days", gold: true },
                  { val: timeLeft.hours, label: fr ? "Heures" : "Hours", gold: false },
                  { val: timeLeft.minutes, label: "Min", gold: false },
                  { val: timeLeft.seconds, label: "Sec", gold: false },
                ].map((unit, i) => (
                  <React.Fragment key={unit.label}>
                    {i > 0 && (
                      <span className="text-brand-gold font-extrabold text-3xl md:text-5xl pb-5 animate-pulse">:</span>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative px-4 py-3 md:px-6 md:py-4 rounded-2xl border min-w-[60px] md:min-w-[80px] text-center ${
                        unit.gold
                          ? "bg-brand-gold/20 border-brand-gold/40 shadow-[0_0_24px_rgba(245,166,35,0.25)]"
                          : "bg-white/8 border-white/10"
                      }`}>
                        <span className={`font-mono font-extrabold text-3xl md:text-5xl block leading-none ${
                          unit.gold ? "text-brand-gold" : "text-white"
                        }`}>
                          {String(unit.val).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{unit.label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0" />
                {fr ? 'Attribution en flux continu à Abidjan' : 'Rolling allocation in Abidjan'}
              </div>
            </div>
          </div>

          {/* Gauge cards */}
          {places.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {places.map((item: any, idx: number) => {
                const specName =
                  item.section === "PS" ? "Petite Section (PS)" :
                  item.section === "MS" ? "Moyenne Section (MS)" :
                  item.section === "GS" ? "Grande Section (GS)" :
                  item.section === "CP" ? "CPI / CP" :
                  item.section === "CE1" ? "CE1" :
                  item.section === "CE2" ? "CE2" :
                  item.section === "CM1" ? "CM1" : "CM2";

                const remaining = item.capaciteMax - item.inscritsConfirmes;
                const filledRatio = Math.round((item.inscritsConfirmes / item.capaciteMax) * 100);

                let gaugeColor = "bg-brand-green";
                let badgeStyle = "bg-green-50 text-brand-green border-green-200";
                let dotColor = "bg-brand-green";
                let alertLabel = fr ? `${remaining} places disponibles` : `${remaining} spots available`;
                let statusLabel = fr ? "Dispo" : "Open";

                if (remaining <= 3) {
                  gaugeColor = "bg-red-500";
                  badgeStyle = "bg-red-50 text-red-600 border-red-200";
                  dotColor = "bg-red-500 animate-ping";
                  alertLabel = remaining === 0
                    ? (fr ? "Complet" : "Full")
                    : (fr ? `Plus que ${remaining} places !` : `Only ${remaining} spots left!`);
                  statusLabel = remaining === 0 ? (fr ? "Complet" : "Full") : (fr ? "Tension" : "Urgent");
                } else if (remaining <= 6) {
                  gaugeColor = "bg-brand-gold";
                  badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                  dotColor = "bg-brand-gold";
                  alertLabel = fr ? `Remplissage rapide : ${remaining} places` : `Filling fast: ${remaining} spots`;
                  statusLabel = fr ? "Rapide" : "Fast";
                }

                return (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    transition={{ duration: 0.45 }}
                    className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border border-brand-border/40 p-5 space-y-4 hover:shadow-[0_8px_40px_rgba(13,46,92,0.14)] transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-brand-blue-deep font-sans text-sm font-bold block leading-tight">{specName}</strong>
                        <span className="text-[10px] text-brand-muted font-mono">{item.capaciteMax} élèves max</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase shrink-0 ${badgeStyle}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Animated gauge bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-brand-muted">
                        <span>{item.inscritsConfirmes} confirmés</span>
                        <span>{filledRatio}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${gaugeColor}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${filledRatio}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-serif text-brand-dark/80 font-semibold">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                      {alertLabel}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center text-xs text-brand-muted font-sans py-8">
              {fr ? 'Mise à jour en temps réel des quotas académiques...' : 'Real-time update of academic quotas...'}
            </div>
          )}
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            5. FORMULAIRE PRÉ-INSCRIPTION · Card premium
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="inscription-anchor"
          className="scroll-mt-20"
        >
          {!successCode ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Colonne gauche — contexte */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-brand-blue-deep tracking-tight">
                    {fr ? 'Commencer ma Pré-inscription' : 'Start my Pre-enrollment'}
                  </h2>
                  <p className="font-serif text-sm text-brand-muted mt-3 leading-relaxed">
                    {fr
                      ? "Remplissez le formulaire en quelques minutes. Un code parrainage unique vous sera alloué après validation."
                      : "Fill in the form in a few minutes. A unique referral code will be assigned after validation."}
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { step: '01', title: fr ? 'Pré-inscription en ligne' : 'Online pre-enrollment', desc: fr ? 'Formulaire rapide, 2 minutes chrono.' : 'Quick form, 2 minutes.' },
                    { step: '02', title: fr ? 'Évaluation de l\'enfant' : 'Child assessment', desc: fr ? 'Test gratuit et bienveillant sur rendez-vous.' : 'Free caring test by appointment.' },
                    { step: '03', title: fr ? 'Validation du dossier' : 'File validation', desc: fr ? 'Dépôt des pièces physiques au secrétariat.' : 'Physical documents submitted at secretariat.' },
                    { step: '04', title: fr ? 'Confirmation' : 'Confirmation', desc: fr ? 'Règlement et validation définitive.' : 'Payment and final validation.' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <span className="font-mono font-extrabold text-sm text-brand-gold shrink-0 mt-0.5">{s.step}</span>
                      <div>
                        <p className="font-sans font-bold text-xs text-brand-blue-deep">{s.title}</p>
                        <p className="font-serif text-xs text-brand-muted leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-brand-gold/8 border border-brand-gold/20">
                  <p className="font-sans font-bold text-xs text-brand-blue-deep mb-1">
                    {fr ? 'Avantage parrainage 10%' : '10% referral benefit'}
                  </p>
                  <p className="font-serif text-xs text-brand-muted leading-relaxed">
                    {fr
                      ? "À la validation, vous recevez un code parrainage personnel. Pour chaque filleul inscrit, obtenez 10% de réduction cumulable sur la scolarité."
                      : "Upon validation, you receive a personal referral code. For each referred family enrolled, earn a cumulative 10% tuition discount."}
                  </p>
                </div>
              </div>

              {/* Colonne droite — formulaire */}
              <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white border border-brand-border/40 p-6 md:p-10 sticky top-24">
                <PreInscriptionForm onSuccess={handleFormSuccess} />
              </div>
            </div>
          ) : (
            <div className="animate-fade-in max-w-4xl mx-auto">
              {!showRdvBooking ? (
                <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white border border-emerald-200 overflow-hidden">
                  {/* Success header stripe */}
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 py-6 px-8 text-center text-white">
                    <CheckCircle size={48} className="mx-auto mb-3 stroke-[2]" />
                    <h2 className="font-sans font-extrabold text-2xl">
                      {fr ? 'Pré-inscription Enregistrée avec Succès !' : 'Pre-enrollment Successfully Registered!'}
                    </h2>
                  </div>

                  <div className="p-8 space-y-6 text-center">
                    <p className="font-serif text-sm text-brand-dark/90 max-w-xl mx-auto leading-relaxed">
                      {fr
                        ? <>Félicitations parent <strong>{createdProspect?.prenomParent} {createdProspect?.nomParent}</strong>, le dossier de{' '}<strong>{createdProspect?.prenomEnfant} {createdProspect?.nomEnfant}</strong> est inscrit sous le statut <strong>Prospect</strong>.</>
                        : <>Congratulations <strong>{createdProspect?.prenomParent} {createdProspect?.nomParent}</strong>, the file for{' '}<strong>{createdProspect?.prenomEnfant} {createdProspect?.nomEnfant}</strong> has been registered with <strong>Prospect</strong> status.</>}
                    </p>

                    {/* Parrainage showcase */}
                    <div className="rounded-2xl bg-[#F4F8FF] border border-brand-border/50 p-6 max-w-lg mx-auto space-y-4">
                      <p className="flex items-center gap-1.5 text-brand-blue-deep text-xs font-bold uppercase tracking-wider">
                        <Gift size={12} />
                        {fr ? 'Votre avantage parrainage' : 'Your referral benefit'}
                      </p>
                      <p className="font-serif text-xs text-brand-muted leading-relaxed">
                        {fr
                          ? <>Partagez votre code personnel avec vos proches. Pour chaque enfant inscrit avec votre code, vous obtenez <strong>10% de réduction cumulable</strong> sur la scolarité !</>
                          : <>Share your personal code with family and friends. For each child enrolled with your code, you receive a <strong>cumulative 10% discount</strong> on tuition!</>}
                      </p>
                      <div className="bg-white border border-brand-border/80 rounded-xl p-4 text-center">
                        <span className="text-[10px] text-brand-muted uppercase tracking-widest block font-sans mb-1">{fr ? 'Votre code personnel' : 'Your personal code'}</span>
                        <strong className="font-mono text-3xl text-brand-blue-deep font-extrabold tracking-widest">{successCode}</strong>
                      </div>
                    </div>

                    {/* Identifiants Espace Parent */}
                    <div className="rounded-2xl bg-[#0D2E5C]/5 border border-[#0D2E5C]/20 p-6 max-w-lg mx-auto space-y-3 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock size={14} className="text-[#0D2E5C]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0D2E5C] font-sans">
                          {fr ? 'Vos identifiants Espace Parent' : 'Your Parent Space credentials'}
                        </span>
                      </div>
                      <div className="bg-white border border-brand-border/60 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[9px] font-semibold text-brand-muted uppercase tracking-widest mb-0.5">{fr ? 'Identifiant (email)' : 'Login (email)'}</p>
                            <p className="text-xs font-mono font-semibold text-brand-blue-deep">{createdProspect?.email}</p>
                          </div>
                          <Mail size={16} className="text-slate-300 shrink-0" />
                        </div>
                        <div className="border-t border-brand-border/40" />
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[9px] font-semibold text-brand-muted uppercase tracking-widest mb-0.5">{fr ? 'Mot de passe initial' : 'Initial password'}</p>
                            <p className="text-xs font-mono font-semibold text-brand-blue-deep">{createdProspect?.telephone}</p>
                          </div>
                          <Phone size={16} className="text-slate-300 shrink-0" />
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        {fr
                          ? "Conservez ces informations. Vous pouvez changer votre mot de passe depuis l'Espace Parent après connexion."
                          : "Keep this information safe. You can change your password from the Parent Space after logging in."}
                      </p>
                    </div>

                    <p className="font-serif text-xs text-brand-muted max-w-md mx-auto leading-normal">
                      {fr
                        ? "Une notification email et un rappel WhatsApp ont été envoyés à votre destination."
                        : "An email notification and a WhatsApp reminder have been sent to your contact."}
                    </p>

                    <div className="flex justify-center pt-2">
                      <Button variant="cta" className="px-6 font-bold" onClick={() => setShowRdvBooking(true)}>
                        <Calendar size={14} /> {fr ? 'Planifier mon Entretien Physique' : 'Schedule my In-Person Interview'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in space-y-4">
                  {!rdvBooked ? (
                    <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white border border-brand-border/40 p-8 md:p-12 space-y-6">
                      <div className="text-center">
                        <h2 className="font-sans font-extrabold text-xl md:text-2xl text-brand-blue-deep">
                          {fr ? "Planifier votre entretien d'évaluation" : 'Schedule your evaluation interview'}
                        </h2>
                        <p className="font-serif text-xs text-brand-muted max-w-md mx-auto mt-2 leading-normal">
                          {fr
                            ? "Les dates d'évaluation et de visite des locaux d'Abidjan sont attribuées sous 30 minutes."
                            : "Evaluation and campus visit dates in Abidjan are confirmed within 30 minutes."}
                        </p>
                      </div>
                      <AppointmentForm initialProspect={createdProspect} onSuccess={handleRdvSuccess} />
                    </div>
                  ) : (
                    <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white border border-emerald-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 py-6 px-8 text-center text-white">
                        <CheckCircle size={48} className="mx-auto mb-3 stroke-[2]" />
                        <h2 className="font-sans font-extrabold text-xl">
                          {fr ? 'Rendez-vous Planifié avec Succès !' : 'Appointment Successfully Scheduled!'}
                        </h2>
                      </div>
                      <div className="p-8 text-center space-y-4">
                        <p className="font-serif text-xs text-brand-dark/90 max-w-md mx-auto leading-relaxed">
                          {fr
                            ? "Votre entretien d'excellence physique d'Abidjan est officiellement réservé. Le secrétariat vous envoie les coordonnées par SMS/WhatsApp."
                            : "Your in-person excellence interview in Abidjan is officially booked. The secretariat will send you the details by SMS/WhatsApp."}
                        </p>
                        <Button variant="primary" onClick={() => setSuccessCode(null)}>
                          {fr ? 'Faire un nouveau dépôt de dossier parent' : 'Submit a new parent application'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            6. RENDEZ-VOUS DIRECT · sans pré-inscription
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="rdv-anchor"
          className="scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Colonne gauche — contexte */}
            <div className="space-y-6">
              <div>
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-brand-blue-deep tracking-tight">
                  {fr ? 'Planifier une Visite ou un Entretien' : 'Schedule a Visit or an Interview'}
                </h2>
                <p className="font-serif text-sm text-brand-muted mt-3 leading-relaxed">
                  {fr
                    ? "Visitez nos locaux ou rencontrez notre équipe pédagogique sans passer par la pré-inscription. Créneaux disponibles du lundi au samedi."
                    : "Visit our premises or meet our academic team without going through pre-enrollment. Slots available Monday to Saturday."}
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: fr ? 'Visite des locaux' : 'Campus tour', desc: fr ? 'Découvrez nos salles, le jardin pédagogique et les espaces de vie.' : 'Discover our classrooms, ecological garden and living spaces.' },
                  { title: fr ? 'Entretien pédagogique' : 'Pedagogical interview', desc: fr ? 'Échangez avec notre directrice académique sur le projet éducatif.' : 'Meet our academic director about our educational project.' },
                  { title: fr ? 'Évaluation de l\'enfant' : 'Child assessment', desc: fr ? 'Test gratuit et bienveillant pour placer votre enfant dans la bonne section.' : 'Free caring test to place your child in the right class.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,46,92,0.06)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" />
                    <div>
                      <p className="font-sans font-bold text-xs text-brand-blue-deep">{item.title}</p>
                      <p className="font-serif text-xs text-brand-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-serif text-xs text-brand-muted italic">
                {fr
                  ? '* Les créneaux sont confirmés par SMS/WhatsApp dans les 30 minutes suivant votre demande.'
                  : '* Slots are confirmed by SMS/WhatsApp within 30 minutes of your request.'}
              </p>
            </div>

            {/* Colonne droite — formulaire */}
            <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white border border-brand-border/40 p-6 md:p-10 sticky top-24">
              <AppointmentForm onSuccess={() => {}} />
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            7. FAQ · overline + uppercase + design premium
        ══════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pb-8"
        >
          <div className="text-center mb-12">
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              {fr ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="font-serif text-sm text-brand-muted mt-2 max-w-lg mx-auto leading-relaxed">
              {fr
                ? "Retrouvez l'essentiel des réponses aux interrogations sur l'excellence éducative en Côte d'Ivoire."
                : "Find the key answers to your questions about educational excellence in Côte d'Ivoire."}
            </p>
            <div className="h-1 w-16 bg-brand-gold mx-auto mt-5 rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border border-brand-border/40 overflow-hidden">
            {/* FAQ header band */}
            <div className="px-8 py-5 border-b border-brand-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/15 flex items-center justify-center">
                <HelpCircle size={18} className="text-brand-gold" />
              </div>
              <div>
                <span className="font-sans font-bold text-brand-blue-deep text-sm block">{fr ? 'Questions fréquentes' : 'Frequently asked questions'}</span>
                <span className="text-[10px] text-brand-muted font-serif">{faqList.length} {fr ? 'questions répondues par notre équipe' : 'questions answered by our team'}</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <Accordion items={faqList} />
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

/* ─── Helper: Document checklist item ─────────────────────────────── */
function DocItem({ index, text }: { index: number; text: string }) {
  return (
    <div className="flex gap-3 items-center p-3 rounded-2xl bg-[#F4F8FF] border border-brand-border/40 group hover:border-brand-green/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 font-mono group-hover:bg-brand-green group-hover:text-white transition-colors">
        {String(index).padStart(2, '0')}
      </div>
      <span className="font-sans text-xs text-brand-dark/90 leading-snug">{text}</span>
      <CheckCircle size={14} className="text-brand-green/40 shrink-0 ml-auto group-hover:text-brand-green transition-colors" />
    </div>
  );
}
