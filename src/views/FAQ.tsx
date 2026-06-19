
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../lib/LanguageContext.tsx';
import {
  Search,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Utensils,
  Smartphone,
  MessageSquare,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string | React.ReactNode;
}

const CATEGORY_META_FR: Record<string, { icon: React.ReactNode; color: string }> = {
  "Admissions & Inscriptions": { icon: <GraduationCap size={16} />, color: "text-brand-blue-medium" },
  "Programme Pédagogique":     { icon: <BookOpen size={16} />,      color: "text-brand-green" },
  "Vie Pratique & Logistique": { icon: <Utensils size={16} />,      color: "text-brand-gold" },
  "Espace Parent digital":     { icon: <Smartphone size={16} />,    color: "text-brand-blue-light" },
};
const CATEGORY_META_EN: Record<string, { icon: React.ReactNode; color: string }> = {
  "Admissions & Enrollment":   { icon: <GraduationCap size={16} />, color: "text-brand-blue-medium" },
  "Academic Program":          { icon: <BookOpen size={16} />,      color: "text-brand-green" },
  "Practical Life & Logistics":{ icon: <Utensils size={16} />,      color: "text-brand-gold" },
  "Digital Parent Space":      { icon: <Smartphone size={16} />,    color: "text-brand-blue-light" },
};

export const FAQ: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["adm-1", "ped-1"]);
  const [cmsFaq, setCmsFaq]   = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/faq')
      .then(r => r.json())
      .then((data: any[]) => setCmsFaq(Array.isArray(data) ? data.filter(f => f.publie) : []))
      .catch(() => setCmsFaq([]));
  }, []);

  const CATEGORY_META = fr ? CATEGORY_META_FR : CATEGORY_META_EN;

  const catMap = (cat: string) => {
    if (fr) {
      return cat === 'Admission' ? 'Admissions & Inscriptions'
           : cat === 'Pédagogie' ? 'Programme Pédagogique'
           : cat === 'Services'  ? 'Vie Pratique & Logistique'
           : 'Admissions & Inscriptions';
    }
    return cat === 'Admission' ? 'Admissions & Enrollment'
         : cat === 'Pédagogie' ? 'Academic Program'
         : cat === 'Services'  ? 'Practical Life & Logistics'
         : 'Admissions & Enrollment';
  };

  const faqItems: FaqItem[] = [
    ...cmsFaq.map(f => ({
      id: f.id,
      category: catMap(f.cat),
      question: f.question,
      answer: f.reponse,
    })),
    ...([] as FaqItem[])
  ];

  const staticItems: FaqItem[] = fr ? [
    {
      id: "adm-1",
      category: "Admissions & Inscriptions",
      question: "Quelle est la taille maximale des effectifs par classe ?",
      answer: "À EPV Horizons Savants, nous croyons à l'accompagnement d'excellence sur-mesure. C'est pourquoi nous appliquons un numerus clausus extrêmement strict de 25 élèves maximum par section de Maternelle et de Primaire. Ce format restreint garantit une surveillance bienveillante et un suivi comportemental individualisé."
    },
    {
      id: "adm-2",
      category: "Admissions & Inscriptions",
      question: "Quelles sont les pièces requises pour le dépôt du dossier de pré-inscription ?",
      answer: "Pour soumettre valablement une pré-inscription, vous devez renseigner notre formulaire en ligne. Par la suite, lors de l'entretien d'orientation, vous devrez fournir une copie de l'acte de naissance de l'enfant, son carnet de santé (vaccinations à jour obligatoire), et les bulletins trimestriels de l'année précédente (uniquement pour l'accès au cycle primaire)."
    },
    {
      id: "adm-3",
      category: "Admissions & Inscriptions",
      question: "Comment se déroule l'entretien d'évaluation académique ?",
      answer: "L'entretien d'admission est un moment d'écoute bienveillante de 30 minutes avec notre direction pédagogique. Il nous permet d'évaluer la maturité motrice et le language bilingue pour la maternelle, ou de tester les prérequis élémentaires d'abstraction mathématique pour le primaire, afin d'assurer l'ajustement pédagogique optimal."
    },
    {
      id: "ped-1",
      category: "Programme Pédagogique",
      question: "Comment fonctionne l'immersion bilingue (Français/Anglais) dès la Petite Section ?",
      answer: "L'enseignement est dispensé suivant la règle du bilinguisme précoce simultané. Les cours s'organisent à parts égales entre le français et l'anglais. Nos éducateurs diplômés et natifs transmettent l'anglais à travers les activités de développement cognitif, les chants rythmés, les ateliers d'éveil sensoriel et la vie de classe pour une assimilation organique sans barrière psychologique."
    },
    {
      id: "ped-2",
      category: "Programme Pédagogique",
      question: "Qu'est-ce que la méthode de Singapour pour l'apprentissage des calculs ?",
      answer: "C'est une méthode active reconnue mondialement. Elle repose sur trois phases incontournables : le Concret, l'Imagé puis l'Abstrait. Elle évite le par cœur mécanique et développe le sens inné de la logique mathématique."
    },
    {
      id: "ped-3",
      category: "Programme Pédagogique",
      question: "Les programmes respectent-ils les directives du Ministère de l'Éducation Nationale ?",
      answer: "Absolument. EPV Horizons Savants est agréée et dispense l'intégralité du programme officiel de Côte d'Ivoire, enrichi d'immersion anglophone continue, de la méthode Singapour pour les STEM et d'ateliers de robotique."
    },
    {
      id: "log-1",
      category: "Vie Pratique & Logistique",
      question: "L'école propose-t-elle un service de cantine saine et de garderie tardive ?",
      answer: "Oui. Nous mettons à disposition un service de restauration scolaire équilibrée. Une garderie périscolaire sécurisée est disponible chaque soir de 16h00 à 18h30."
    },
    {
      id: "log-2",
      category: "Vie Pratique & Logistique",
      question: "Où se situe exactement le campus d'EPV Horizons Savants à Abidjan ?",
      answer: "Notre campus d'élite sécurisé se situe à Bingerville, Ave Konan Kouassi Lambert 38, Abidjan. Clôturé, ombragé, avec CCTV et sécurité à l'entrée."
    },
    {
      id: "esp-1",
      category: "Espace Parent digital",
      question: "Comment utiliser l'Espace Parent en ligne ?",
      answer: "Dès la formalisation de l'inscription, un compte sécurisé (via OTP SMS/WhatsApp) vous est créé. Vous pouvez suivre les présences, consulter les évaluations et prendre rendez-vous en ligne."
    }
  ] : [
    {
      id: "adm-1",
      category: "Admissions & Enrollment",
      question: "What is the maximum class size?",
      answer: "At EPV Horizons Savants, we believe in bespoke excellence. That is why we enforce a strict quota of 25 students per class at both Kindergarten and Primary levels. This small format guarantees caring supervision and individualized behavioral monitoring."
    },
    {
      id: "adm-2",
      category: "Admissions & Enrollment",
      question: "What documents are required for the pre-enrollment application?",
      answer: "To submit a valid pre-enrollment, fill in our online form. At the orientation interview, you will need to provide a copy of the child's birth certificate, up-to-date vaccination record, and previous year's report cards (for primary school entry only)."
    },
    {
      id: "adm-3",
      category: "Admissions & Enrollment",
      question: "How does the academic assessment interview work?",
      answer: "The admission interview is a 30-minute caring listening session with our academic director. It evaluates motor maturity and bilingual language for kindergarten, or basic mathematical prerequisites for primary, to ensure optimal pedagogical alignment."
    },
    {
      id: "ped-1",
      category: "Academic Program",
      question: "How does the bilingual (French/English) immersion work from Nursery class?",
      answer: "Teaching follows simultaneous early bilingualism. Classes are organized equally in French and English. Our qualified native educators convey English through cognitive development activities, rhythmic songs, sensory workshops and daily classroom life."
    },
    {
      id: "ped-2",
      category: "Academic Program",
      question: "What is the Singapore Method for learning mathematics?",
      answer: "It is a globally recognized active method with three key phases: Concrete (hands-on manipulation), Pictorial (graphical representation), and Abstract (introduction of numbers and operators). It avoids rote learning and builds innate mathematical reasoning."
    },
    {
      id: "ped-3",
      category: "Academic Program",
      question: "Do your programs follow the national Ministry of Education guidelines?",
      answer: "Absolutely. EPV Horizons Savants is accredited and delivers the full official Ivory Coast curriculum, enriched with continuous English immersion, the Singapore STEM method, and robotics workshops."
    },
    {
      id: "log-1",
      category: "Practical Life & Logistics",
      question: "Does the school offer a canteen and after-school care?",
      answer: "Yes. We provide a balanced school catering service. A supervised after-school club is available every evening from 4:00 PM to 6:30 PM."
    },
    {
      id: "log-2",
      category: "Practical Life & Logistics",
      question: "Where exactly is the EPV Horizons Savants campus in Abidjan?",
      answer: "Our secure elite campus is located in Bingerville, Ave Konan Kouassi Lambert 38, Abidjan. The grounds are fenced, shaded, with CCTV cameras and a security officer at the entrance."
    },
    {
      id: "esp-1",
      category: "Digital Parent Space",
      question: "How do I use the online Parent Space?",
      answer: "Once enrollment is formalized, a secure account (via OTP sent by SMS/WhatsApp) is created for you. You can track your child's attendance, view bilingual assessments, and book appointments online in one click."
    }
  ];

  // Merge CMS items + static items (CMS items first)
  const allFaqItems = [...faqItems, ...staticItems];
  const categories = Array.from(new Set(allFaqItems.map(item => item.category)));

  const toggleOpen = (id: string) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter(x => x !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  const filteredItems = allFaqItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return item.question.toLowerCase().includes(query) ||
           item.answer.toString().toLowerCase().includes(query) ||
           item.category.toLowerCase().includes(query);
  });

  return (
    <div className="relative select-none min-h-[75vh] bg-gradient-to-br from-[#F4F8FF] to-white">

      {/* Decorative aurora blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(74,144,217,0.13) 0%, rgba(245,166,35,0.05) 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(45,140,60,0.09) 0%, transparent 75%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto py-14 px-4 md:px-8 space-y-12">

        {/* ── HEADER ── */}
        <motion.div
          className="text-left max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold font-sans">
            {fr ? 'Vos Questions · Nos Réponses Claires' : 'Your Questions · Clear Answers'}
          </span>

          <h1 className="font-sans font-extrabold text-3xl md:text-[2.6rem] leading-tight text-brand-blue-deep uppercase tracking-tight">
            {fr ? 'Foire Aux' : 'Frequently'}{' '}
            <span className="relative inline-block">
              <span className="relative z-10">{fr ? 'Questions' : 'Asked Questions'}</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-[10px] rounded-sm -z-0"
                style={{ background: "rgba(245,166,35,0.28)" }}
              />
            </span>
          </h1>

          <p className="font-serif text-sm text-brand-muted max-w-lg mx-auto leading-relaxed">
            {fr
              ? "Méthode bilingue précoce, restauration, portail parent… Retrouvez toutes les réponses de l'administration d'EPV Horizons Savants."
              : "Early bilingualism, canteen, parent portal… Find all the answers from the EPV Horizons Savants administration."}
          </p>

          {/* Gold rule */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="h-px w-10 bg-brand-gold/40 rounded-full" />
            <div className="h-1.5 w-8 bg-brand-gold rounded-full" />
            <div className="h-px w-10 bg-brand-gold/40 rounded-full" />
          </div>
        </motion.div>

        {/* ── SEARCH BAR ── */}
        <motion.div
          className="relative max-w-lg mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={fr ? 'Rechercher une question ou un mot-clé…' : 'Search for a question or keyword…'}
            className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-brand-border bg-white text-sm font-sans text-brand-dark shadow-[0_2px_20px_rgba(13,46,92,0.07)] placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-blue-deep text-xs font-bold font-sans transition-colors"
            >
              ✕
            </button>
          )}
        </motion.div>

        {/* ── FAQ CATEGORIES ── */}
        <motion.div
          className="space-y-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {categories.map((cat) => {
            const itemsInCat = filteredItems.filter((item) => item.category === cat);
            if (itemsInCat.length === 0) return null;
            const meta = CATEGORY_META[cat] ?? { icon: <MessageSquare size={16} />, color: "text-brand-muted" };

            return (
              <motion.div
                key={cat}
                className="space-y-4"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3">
                  {/* Badge pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold font-sans uppercase tracking-wide ${meta.color}`}
                  >
                    {meta.icon}
                    {cat}
                  </span>
                  {/* Separator line with gold dot */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/50 to-transparent rounded-full" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/60 shrink-0" />
                  </div>
                </div>

                {/* FAQ items */}
                <div className="space-y-3">
                  {itemsInCat.map((item) => {
                    const isOpen = openIds.includes(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                          isOpen
                            ? "shadow-[0_4px_20px_rgba(13,46,92,0.10)]"
                            : "shadow-[0_2px_20px_rgba(13,46,92,0.07)]"
                        } bg-white`}
                        style={
                          isOpen
                            ? { borderLeft: "3px solid #F5A623" }
                            : { borderLeft: "3px solid transparent" }
                        }
                      >
                        {/* Question row / trigger */}
                        <button
                          type="button"
                          onClick={() => toggleOpen(item.id)}
                          className={`w-full px-5 py-4 flex justify-between items-center text-left gap-4 focus:outline-none cursor-pointer transition-colors duration-200 ${
                            isOpen ? "bg-brand-pale/30" : "bg-white hover:bg-slate-50/60"
                          }`}
                        >
                          <span className="font-sans font-bold text-sm text-brand-blue-deep leading-snug">
                            {item.question}
                          </span>
                          <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className={`shrink-0 transition-colors duration-200 ${
                              isOpen ? "text-brand-gold" : "text-brand-muted"
                            }`}
                          >
                            <ChevronDown size={18} />
                          </motion.span>
                        </button>

                        {/* Answer AnimatePresence for smooth open/close */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="answer"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="px-5 pb-5 pt-1 font-serif text-sm leading-relaxed text-brand-dark/85 bg-brand-pale/30 border-t border-brand-border/30">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-14 text-center bg-white rounded-2xl shadow-[0_2px_20px_rgba(13,46,92,0.07)] border border-brand-border/50"
            >
              <p className="font-serif text-sm text-brand-muted">
                {fr ? 'Aucune réponse ne correspond à votre recherche actuelle.' : 'No answers match your current search.'}
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-bold font-sans text-brand-blue-medium hover:text-brand-gold transition-colors"
              >
                {fr ? 'Réinitialiser la recherche' : 'Reset search'}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ── CTA FINAL section navy ── */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="relative overflow-hidden bg-[#0D2E5C] border-0 rounded-2xl shadow-premium-lg p-0">

            {/* Gold accent line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-brand-gold/60 via-brand-gold to-brand-gold/60" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-9">
              {/* Left text block */}
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold font-sans">
                  {fr ? "Besoin d'un conseil personnalisé ?" : 'Need personalized guidance?'}
                </p>
                <h4 className="font-sans font-extrabold text-lg md:text-xl text-white leading-snug">
                  {fr ? 'Vous ne trouvez pas la réponse à vos questions ?' : "Can't find the answer to your question?"}
                </h4>
                <p className="font-serif text-[13px] text-slate-300 max-w-md leading-relaxed">
                  {fr
                    ? "Notre équipe d'admissions est disponible pour vous guider : dossier, visite de campus ou entretien d'orientation."
                    : 'Our admissions team is available to guide you: application, campus visit, or orientation interview.'}
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href="#/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-deep font-sans font-bold text-xs uppercase tracking-wide rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {fr ? 'Formulaire de Contact' : 'Contact Form'}
                  <ArrowRight size={14} />
                </a>
                <a
                  href="#/preinscription"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-xs uppercase tracking-wide rounded-xl border border-white/20 transition-all duration-200 whitespace-nowrap"
                >
                  {fr ? 'Pré-inscription en ligne' : 'Online Pre-enrollment'}
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};
