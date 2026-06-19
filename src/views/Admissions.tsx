
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
  CheckCircle, ShieldAlert, FileText, Calendar, Phone,
  Award, HelpCircle, Download, AlertCircle, Sparkles, FilePlus,
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
  const [selectedDocTab, setSelectedDocTab] = useState("maternelle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadStub = (fileName: string) => {
    setToastMessage(`Le téléchargement du document "${fileName}" a commencé (Dépôt d'Abidjan).`);
  };

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
      content: "Afin de privilégier l'excellence pédagogique, nous bloquons strictement les effectifs à 25 élèves maximum par classe, toutes sections confondues (Maternelle PS/MS/GS et Primaire CP au CM2). Les inscriptions cessent automatiquement dès que les capacités limites sont atteintes.",
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
      content: "For convenience, EPV Horizons Savants tuition is payable in 3 quarterly installments: a first payment at physical enrollment confirmation in August, a second in December, and the final installment in March. Transactions are currently processed by certified bank cheque or physical bank transfer no direct online payment is processed.",
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
      content: "To prioritize pedagogical excellence, we strictly cap class sizes at 25 students maximum per class, across all levels (Kindergarten PS/MS/GS and Primary Grade 1 to Grade 5). Enrollment automatically closes once maximum capacity is reached.",
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

        <div className="relative max-w-4xl mx-auto text-left space-y-6">
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
            className="font-serif text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl"
          >
            {fr
              ? "Découvrez notre processus d'admissions rigoureux, la grille tarifaire complète pour la rentrée 2026, et déposez votre dossier en ligne depuis Abidjan."
              : "Discover our rigorous admission process, the complete tuition schedule for September 2026, and submit your application online from Abidjan."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-start pt-2"
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

            {/* ── Colonne gauche contexte & chiffres ── */}
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-[#0b1d3a] text-white p-7 space-y-1">
                <h2 className="font-sans font-extrabold text-xl md:text-2xl text-white leading-tight">
                  {fr ? "Processus d'Inscription" : 'Enrollment Process'}
                  <span className="block text-brand-gold">{fr ? 'en 4 Étapes' : 'in 4 Steps'}</span>
                </h2>
                <div className="h-0.5 w-12 bg-brand-gold/60 rounded-full mt-3 mb-5" />
                {([
                  { val: '4',    label: fr ? 'étapes simples' : 'simple steps' },
                  { val: '25',   label: fr ? 'élèves max · Maternelle' : 'students max · Kindergarten' },
                  { val: '25',   label: fr ? 'élèves max · Primaire' : 'students max · Primary' },
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

            {/* ── Colonne droite stepper ── */}
            <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-8 md:p-12 border border-brand-border/40">
              <Stepper steps={stepsAdmissions} currentStep={0} />
            </div>

          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            2. FORMULAIRE PRÉ-INSCRIPTION layout horizontal
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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 items-start">
              {/* ── Gauche : contexte ── */}
              <div className="space-y-6 lg:sticky lg:top-28">
                <div>
                  <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-brand-blue-deep tracking-tight">
                    {fr ? 'Pré-inscription' : 'Pre-enrollment'}
                  </h2>
                  <div className="h-1 w-14 bg-brand-gold mt-3 rounded-full" />
                  <p className="font-serif text-sm text-brand-muted mt-4 leading-relaxed">
                    {fr
                      ? "Remplissez le formulaire en quelques minutes. Votre dossier sera traité rapidement."
                      : "Fill in the form in a few minutes. Your file will be processed quickly."}
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { step: '01', title: fr ? 'Pré-inscription en ligne' : 'Online pre-enrollment', desc: fr ? 'Formulaire rapide, 2 minutes.' : 'Quick form, 2 minutes.' },
                    { step: '02', title: fr ? 'Évaluation de l\'enfant' : 'Child assessment', desc: fr ? 'Test gratuit sur rendez-vous.' : 'Free test by appointment.' },
                    { step: '03', title: fr ? 'Dépôt du dossier' : 'File submission', desc: fr ? 'Documents au secrétariat.' : 'Documents at secretariat.' },
                    { step: '04', title: fr ? 'Confirmation' : 'Confirmation', desc: fr ? 'Règlement & validation.' : 'Payment & validation.' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="font-mono font-extrabold text-sm text-brand-gold shrink-0 mt-0.5">{s.step}</span>
                      <div>
                        <p className="font-sans font-bold text-xs text-brand-blue-deep">{s.title}</p>
                        <p className="font-serif text-xs text-brand-muted">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* ── Droite : formulaire ── */}
              <div>
                <PreInscriptionForm onSuccess={handleFormSuccess} />
              </div>
            </div>
          ) : (
            <div className="animate-fade-in max-w-2xl mx-auto">
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


                    {/* Identifiants Espace Parent */}
                    <div className="rounded-2xl bg-[#0D2E5C]/5 border border-[#0D2E5C]/20 p-6 space-y-3 text-left">
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

                    <p className="font-serif text-xs text-brand-muted leading-normal">
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
            3. RENDEZ-VOUS / RÉSERVATION layout horizontal
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 items-start">
            {/* ── Gauche : contexte ── */}
            <div className="space-y-6 lg:sticky lg:top-28">
              <div>
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-brand-blue-deep tracking-tight">
                  {fr ? 'Rendez-vous / Réservation' : 'Appointment / Booking'}
                </h2>
                <div className="h-1 w-14 bg-brand-gold mt-3 rounded-full" />
                <p className="font-serif text-sm text-brand-muted mt-4 leading-relaxed">
                  {fr
                    ? "Planifiez une visite ou un entretien sans passer par la pré-inscription. Créneaux disponibles du lundi au samedi."
                    : "Schedule a visit or interview without pre-enrollment. Slots available Monday to Saturday."}
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { title: fr ? 'Visite des locaux' : 'Campus tour', desc: fr ? 'Salles, jardin pédagogique, espaces de vie.' : 'Classrooms, ecological garden, living spaces.' },
                  { title: fr ? 'Entretien pédagogique' : 'Academic interview', desc: fr ? 'Échangez avec notre directrice académique.' : 'Meet our academic director.' },
                  { title: fr ? 'Évaluation de l\'enfant' : 'Child assessment', desc: fr ? 'Test gratuit et bienveillant.' : 'Free and caring assessment test.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-white shadow-[0_2px_12px_rgba(13,46,92,0.06)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" />
                    <div>
                      <p className="font-sans font-bold text-xs text-brand-blue-deep">{item.title}</p>
                      <p className="font-serif text-xs text-brand-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-serif text-xs text-brand-muted italic">
                {fr
                  ? '* Confirmation par SMS/WhatsApp dans les 30 min.'
                  : '* Confirmed by SMS/WhatsApp within 30 min.'}
              </p>
            </div>
            {/* ── Droite : formulaire ── */}
            <div>
              <AppointmentForm onSuccess={() => {}} />
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            4. TARIFS · Bento Cards (pas de table HTML)
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

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200">
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
                <><strong>Remarque :</strong> Les droits d'inscription comprennent l'assurance scolaire obligatoire, l'accès permanent aux plateformes numériques et l'infirmerie d'Abidjan.</>
              ) : (
                <><strong>Note:</strong> Enrollment fees include mandatory school insurance, permanent access to digital platforms, and the Abidjan campus infirmary.</>
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
