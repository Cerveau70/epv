/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Accordion } from '../components/ui/Accordion.tsx';
import { Card } from '../components/ui/Card.tsx';
import { BookOpen, Clock, Heart, Cpu, Calculator, Utensils } from 'lucide-react';
import { House, Translate, Baby, Student } from '@phosphor-icons/react';
import { useLang } from '../lib/LanguageContext.tsx';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const Programmes: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';

  const schoolLevels = fr ? [
    {
      title: "Petite Section (Maternelle | 2-3 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Pédagogie et Éveil :</strong> Introduction à l'acquisition du langage matériel, socialisation bienveillante intensive, motricité fine et manipulation active inspirée des méthodes Montessori.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Effectif : 15 élèves maximum par éducateur</li>
            <li>Immersion : Comptines, histoires de contes et rituels quotidiens d'éveil en Anglais (30%)</li>
            <li>Infrastructures : Dortoirs climatisés douillets, salle de motricité fine, aire de jeux extérieure ombragée</li>
          </ul>
        </div>
      )
    },
    {
      title: "Moyenne Section (Maternelle | 3-4 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Structures Logiques et Autonomie :</strong> Apprentissage du graphisme, exercices préparatoires d'écriture précoce de l'alphabet, exploration d'exercices spatiaux et logiques d'éveil.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Immersion Anglais : Récits partagés, vocabulaire thématique et conversations élémentaires (40% de la journée)</li>
            <li>Ateliers phares : Initiation artistique à la poterie d'argile, rythmique corporelle, parcours d'éveil sportif</li>
            <li>Pédagogie active : Conceptions mathématiques par objets d'éveil</li>
          </ul>
        </div>
      )
    },
    {
      title: "Grande Section (Maternelle | 5-6 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Passerelle vers l'Écriture Active :</strong> Consolidation intense du graphisme, déchiffrage syllabique phonique préparant à l'entrée au CP, écriture complète cursive et manipulations numériques structurées.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Bilinguisme : Journées alternées d'activités scolaires en Anglais et Français (50/50)</li>
            <li>Introduction STEM : Ateliers d'initiation à la logique du codage informatique par blocs tactiles</li>
            <li>Objectif : Épanouissement comportemental et mental pour aborder sereinement le cycle élémentaire</li>
          </ul>
        </div>
      )
    },
    {
      title: "CPI / CP (Élémentaire | 6-7 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Le Cycle Fondamental d'Excellence :</strong> Maîtrise du décodage fluide de lecture, écriture cursive, et mémorisation mathématique fondamentale.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Méthode Singapour : Modélisation en 3 étapes (Concret → Imagé → Abstrait)</li>
            <li>Lecture : Récits littéraires authentiques en français et en anglais</li>
            <li>Projets de Découverte : Sciences de la terre et botanique dans le jardin écologique</li>
          </ul>
        </div>
      )
    },
    {
      title: "CE1 & CE2 (Élémentaire | 7-9 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Consolidation et Analyse Critique :</strong> Orthographe rigoureuse, résolution de problèmes mathématiques complexes, étude géographique structurée.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Grammaire & Vocabulaire : Systématisation active de textes complexes</li>
            <li>Sciences appliquées : Ingénierie et robotique pédagogique hebdomadaire</li>
            <li>Activités : Théâtre d'expression orale, piscine sous surveillance d'éducateurs expérimentés</li>
          </ul>
        </div>
      )
    },
    {
      title: "CM1 & CM2 (Élémentaire | 9-11 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Cycle de Liaison et Préparation d'Élite :</strong> Littérature enrichie, géométrie, philosophie pour enfants, histoire d'Afrique et du Monde, programmation avancée.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Littérature : Échanges argumentés sur des lectures intégrales en Français et en Anglais</li>
            <li>Préparation intense : Entraînement aux examens des collèges d'excellence régionaux</li>
            <li>Leadership social : Prise de parole publique et projets collaboratifs de citoyenneté</li>
          </ul>
        </div>
      )
    }
  ] : [
    {
      title: "Nursery Class — PS (2-3 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Pedagogy & Awakening:</strong> Introduction to language acquisition, intensive caring socialization, fine motor skills and active manipulation inspired by Montessori methods.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Class size: 15 students maximum per educator</li>
            <li>Immersion: Nursery rhymes, storytelling and daily English awakening rituals (30%)</li>
            <li>Facilities: Air-conditioned dormitories, fine motor skills room, shaded outdoor play area</li>
          </ul>
        </div>
      )
    },
    {
      title: "Middle Kindergarten — MS (3-4 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Logic Structures & Autonomy:</strong> Handwriting learning, preparatory early alphabet exercises, spatial and logical awakening exploration.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>English Immersion: Shared stories, thematic vocabulary and elementary conversations (40% of the day)</li>
            <li>Key Workshops: Clay pottery, body rhythm, sports awakening</li>
            <li>Active Pedagogy: Mathematical concepts through awakening objects</li>
          </ul>
        </div>
      )
    },
    {
      title: "Senior Kindergarten — GS (5-6 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Gateway to Active Writing:</strong> Intense handwriting consolidation, phonetic syllabic decoding preparing for primary school, full cursive writing and structured digital manipulations.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Bilingualism: Alternating school activity days in English and French (50/50)</li>
            <li>STEM Introduction: Coding logic workshops using tactile blocks (screen-free)</li>
            <li>Goal: Behavioral and mental development to smoothly transition to primary school</li>
          </ul>
        </div>
      )
    },
    {
      title: "Grade 1 — CP (6-7 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>The Fundamental Cycle of Excellence:</strong> Full mastery of fluent reading decoding, structured cursive writing, and foundational mathematical memorization.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Singapore Method: 3-step modeling (Concrete → Pictorial → Abstract)</li>
            <li>Language: Literary reading in French and international-level English</li>
            <li>Discovery Projects: Earth sciences and botany in the school's ecological garden</li>
          </ul>
        </div>
      )
    },
    {
      title: "Grades 2 & 3 — CE1 & CE2 (7-9 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Consolidation & Critical Analysis:</strong> Rigorous spelling and grammar, complex multi-step math problem solving, structured geopolitical and geographical study.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Grammar & Vocabulary: Active systematization of complex texts</li>
            <li>Applied Sciences: Weekly engineering and educational robotics experiments</li>
            <li>Activities: Oral expression theater, supervised swimming at Abidjan pool</li>
          </ul>
        </div>
      )
    },
    {
      title: "Grades 4 & 5 — CM1 & CM2 (9-11 years)",
      content: (
        <div className="space-y-3 font-serif">
          <p><strong>Elite Preparation Cycle:</strong> Enriched literature, geometry, children's philosophy, African and World history, advanced algorithm programming.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Literature: Argued discussions based on full readings in French and English</li>
            <li>Intensive Preparation: Training for prestigious regional college entrance exams</li>
            <li>Social Leadership: Public speaking and collaborative citizenship projects</li>
          </ul>
        </div>
      )
    }
  ];

  const calendarEvents = fr ? [
    { period: "Août 2026", text: "Visites privées d'orientation du campus et rendez-vous d'évaluation académique sur réservation.", color: "bg-brand-blue-deep" },
    { period: "Mardi 1er Septembre 2026", text: "Grande Rentrée Scolaire solennelle des élèves de Maternelle et Primaire.", color: "bg-brand-gold" },
    { period: "Octobre 2026", text: "Congés scolaires de la Toussaint (1 semaine d'activités optionnelles de loisir).", color: "bg-brand-blue-medium" },
    { period: "Décembre 2026", text: "Vacances d'Hiver académique & grande fête artistique de fin d'année.", color: "bg-brand-green" },
    { period: "Février 2027", text: "Semaine de l'entrepreneuriat et de l'innovation robotique (exposition parentale).", color: "bg-brand-blue-deep" },
    { period: "Avril 2027", text: "Congés scolaires de Pâques (fouilles archéologiques simulées sur l'aire de jeux).", color: "bg-brand-gold" },
    { period: "Juin 2027", text: "Kermesse de l'excellence académique & distribution solennelle des bulletins annuels.", color: "bg-brand-green" },
  ] : [
    { period: "August 2026", text: "Private campus orientation visits and academic evaluation appointments by reservation.", color: "bg-brand-blue-deep" },
    { period: "Tuesday, September 1, 2026", text: "Solemn Grand School Opening for Kindergarten and Primary students.", color: "bg-brand-gold" },
    { period: "October 2026", text: "All Saints holiday break (1 week of optional leisure and awakening activities).", color: "bg-brand-blue-medium" },
    { period: "December 2026", text: "Academic Winter break & grand artistic year-end celebration in Abidjan.", color: "bg-brand-green" },
    { period: "February 2027", text: "Entrepreneurship and Robotics Innovation Week (parent exhibition).", color: "bg-brand-blue-deep" },
    { period: "April 2027", text: "Easter school break (simulated archaeological excavations on the playground).", color: "bg-brand-gold" },
    { period: "June 2027", text: "Academic Excellence Festival & solemn distribution of annual school reports.", color: "bg-brand-green" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#F4F8FF] to-white min-h-screen">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden bg-brand-blue-deep py-20 px-4 md:px-8">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F5A623 0%, transparent 60%), radial-gradient(circle at 80% 20%, #2D8C3C 0%, transparent 55%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-br from-[#F4F8FF] to-white"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />

        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-sans font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight leading-[1.05]">
            {fr ? 'Programmes' : 'Academic'}{' '}
            <span className="text-brand-gold">
              {fr ? 'Scolaires' : 'Programs'}
            </span>
            <br />{fr ? '& Pédagogie' : '& Pedagogy'}
          </h1>
          <p className="mt-6 text-sm text-white/65 font-serif leading-relaxed max-w-2xl mx-auto">
            {fr
              ? "Notre projet éducatif réconcilie exigence intellectuelle et bienveillance comportementale. L'organisation en petits collectifs d'Abidjan de 15 élèves max assure une totale assimilation académique quotidienne."
              : "Our educational project reconciles intellectual rigor with caring pedagogy. Small class sizes of 15 students maximum ensure complete daily academic assimilation."}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">

        {/* ── BENTO CARDS MATERNELLE / PRIMAIRE ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              {fr ? 'Une École, Deux' : 'One School, Two'}{' '}
              <span className="text-brand-gold">{fr ? 'Ambitions' : 'Ambitions'}</span>
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Maternelle Bento Card */}
            <motion.div variants={staggerItem} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden flex flex-col h-full border-0 p-0">
                <div className="relative h-44 bg-gradient-to-br from-brand-blue-deep to-[#1a4a8a] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #F5A623 0%, transparent 50%)' }}
                  />
                  <div className="relative flex flex-col items-center gap-4">
                    <Baby size={44} weight="fill" className="text-brand-gold" />
                    <div className="flex gap-4">
                      {[
                        { code: 'PS', label: fr ? 'Petite Section' : 'Nursery' },
                        { code: 'MS', label: fr ? 'Moyenne Section' : 'Middle Class' },
                        { code: 'GS', label: fr ? 'Grande Section' : 'Senior Class' },
                      ].map(({ code, label }) => (
                        <span key={code} className="flex flex-col items-center text-white">
                          <span className="text-[12px] font-extrabold tracking-wider leading-none">{code}</span>
                          <span className="text-[8px] font-medium opacity-75 leading-none mt-0.5">{label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-green">{fr ? '2 à 6 ans · Bilinguisme Immersif' : '2 to 6 years · Immersive Bilingualism'}</span>
                    <h2 className="font-sans font-extrabold text-xl text-brand-blue-deep leading-tight mt-1">
                      {fr ? 'Cycle Maternelle' : 'Kindergarten Cycle'}
                    </h2>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif mt-3">
                      {fr
                        ? "La maternelle est la fondation essentielle du devenir d'excellence de l'enfant. Notre approche s'articule autour de l'estime de soi, du respect collectif, et d'un apprentissage progressif par le mouvement tactile."
                        : "Kindergarten is the essential foundation of a child's excellence. Our approach focuses on self-esteem, collective respect, and progressive learning through tactile movement."}
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      { icon: House,     text: fr ? <><strong>Espaces climatisés douillets :</strong> Salles aérées avec sanitaires intégrés pour la sécurité et propreté autonome.</> : <><strong>Cozy air-conditioned spaces:</strong> Airy rooms with integrated facilities for child safety and autonomy.</> },
                      { icon: Translate, text: fr ? <><strong>Double langue précoce :</strong> Conversations d'éveil, chants en français et initiation en anglais parlé.</> : <><strong>Early bilingualism:</strong> Awakening conversations, songs in French and spoken English initiation.</> },
                      { icon: Utensils, text: fr ? <><strong>Nutrition saine :</strong> Collations composées de fruits d'Abidjan, sous suivi diététique académique.</> : <><strong>Healthy nutrition:</strong> Snacks made from Abidjan fruits, under academic dietary supervision.</> },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-blue-deep/[0.03] hover:bg-brand-blue-deep/[0.06] transition-colors">
                        <Icon size={15} className="text-brand-gold shrink-0 mt-0.5" />
                        <span className="text-xs text-brand-muted font-sans leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-blue-medium">{fr ? '15 élèves max / classe' : '15 students max / class'}</span>
                    <a href="#/programmes/maternelle" className="text-brand-green hover:text-brand-blue-deep font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors">
                      {fr ? 'Voir le programme →' : 'View program →'}
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Primaire Bento Card */}
            <motion.div variants={staggerItem} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden flex flex-col h-full border-0 p-0">
                <div className="relative h-44 bg-gradient-to-br from-[#B07D10] to-brand-gold flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-25"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #0D2E5C 0%, transparent 55%)' }}
                  />
                  <div className="relative flex flex-col items-center gap-4">
                    <Student size={44} weight="fill" className="text-brand-blue-deep" />
                    <div className="flex gap-3 flex-wrap justify-center">
                      {[
                        { code: 'CP',  label: fr ? '6-7 ans' : 'Grade 1' },
                        { code: 'CE1', label: fr ? '7-8 ans' : 'Grade 2' },
                        { code: 'CE2', label: fr ? '8-9 ans' : 'Grade 3' },
                        { code: 'CM1', label: fr ? '9-10 ans' : 'Grade 4' },
                        { code: 'CM2', label: fr ? '10-11 ans' : 'Grade 5' },
                      ].map(({ code, label }) => (
                        <span key={code} className="flex flex-col items-center text-brand-blue-deep">
                          <span className="text-[12px] font-extrabold tracking-wider leading-none">{code}</span>
                          <span className="text-[8px] font-medium opacity-60 leading-none mt-0.5">{label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-blue-medium">{fr ? '6 à 11 ans · Excellence & STEM' : '6 to 11 years · Excellence & STEM'}</span>
                    <h2 className="font-sans font-extrabold text-xl text-brand-blue-deep leading-tight mt-1">
                      {fr ? 'Cycle Primaire' : 'Primary Cycle'}
                    </h2>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif mt-3">
                      {fr
                        ? "Le cycle élémentaire scelle le parcours académique. Nous offrons les bases nationales officielles enrichies par les meilleures méthodes internationales."
                        : "The primary cycle builds the academic journey. We offer official national foundations enhanced by the best international methods: analytical thinking, bilingualism, and practical projects."}
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      { icon: Calculator, text: fr ? <><strong>Méthodes Mathématiques actives :</strong> Modélisation intuitive Singapour pour appréhender l'abstraction.</> : <><strong>Active Math Methods:</strong> Singapore intuitive modeling to grasp abstract thinking.</> },
                      { icon: Translate,  text: fr ? <><strong>Anglais académique soutenu :</strong> Écritures, expressions orales, lectures d'excellence.</> : <><strong>Academic English:</strong> Writing, public eloquence, excellence-level reading.</> },
                      { icon: Cpu,        text: fr ? <><strong>Initiations technologiques :</strong> Robotique active Lego Education pour le raisonnement logique.</> : <><strong>Technology initiation:</strong> Lego Education active robotics for logical reasoning.</> },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-gold/[0.04] hover:bg-brand-gold/[0.08] transition-colors">
                        <Icon size={15} className="text-brand-blue-deep shrink-0 mt-0.5" />
                        <span className="text-xs text-brand-muted font-sans leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-blue-medium">{fr ? '20 élèves max / classe' : '20 students max / class'}</span>
                    <a href="#/programmes/primaire" className="text-brand-blue-deep hover:text-brand-gold font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors">
                      {fr ? 'Voir le programme →' : 'View program →'}
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ── SÉPARATEUR ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          <div className="w-2 h-2 rounded-full bg-brand-gold" />
          <div className="w-2 h-2 rounded-full bg-brand-blue-deep/30" />
          <div className="w-2 h-2 rounded-full bg-brand-gold" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        {/* ── ACCORDION SECTION ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              {fr ? 'Programme par' : 'Program by'}{' '}
              <span className="text-brand-gold">{fr ? 'Niveau' : 'Level'}</span>
            </h2>
            <p className="text-xs text-brand-muted mt-4 font-serif max-w-xl mx-auto leading-relaxed">
              {fr
                ? "Cliquez sur les niveaux ci-dessous pour découvrir le projet d'excellence de la maternelle au CM2 d'Abidjan."
                : "Click on the levels below to discover the excellence program from Kindergarten to Grade 5 in Abidjan."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">

            {/* ── Sidebar gauche — chiffres clés ── */}
            <div className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-brand-blue-deep p-6 text-white space-y-5">
                <h3 className="font-sans font-bold text-[10px] uppercase tracking-widest text-brand-gold">
                  {fr ? 'Chiffres Clés' : 'Key Facts'}
                </h3>
                {([
                  { val: '2', label: fr ? 'Cycles scolaires' : 'School cycles' },
                  { val: '6', label: fr ? 'Niveaux au total' : 'Total levels' },
                  { val: '15', label: fr ? 'Élèves max · Maternelle' : 'Students max · Kindergarten' },
                  { val: '20', label: fr ? 'Élèves max · Primaire' : 'Students max · Primary' },
                ] as { val: string; label: string }[]).map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-3xl text-brand-gold leading-none w-12 shrink-0">{s.val}</span>
                    <span className="font-serif text-xs text-white/70 leading-snug">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-white shadow-[0_4px_30px_rgba(13,46,92,0.08)] p-5 space-y-3">
                <p className="font-sans font-bold text-[10px] text-brand-blue-deep uppercase tracking-widest">
                  {fr ? 'Détail des programmes' : 'Program details'}
                </p>
                <a href="#/programmes/maternelle" className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-brand-blue-deep/5 transition-colors group">
                  <span className="font-sans text-xs font-semibold text-brand-blue-deep">{fr ? 'Cycle Maternelle' : 'Kindergarten Cycle'}</span>
                  <span className="text-brand-gold group-hover:translate-x-1 transition-transform text-sm">→</span>
                </a>
                <a href="#/programmes/primaire" className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-brand-blue-deep/5 transition-colors group">
                  <span className="font-sans text-xs font-semibold text-brand-blue-deep">{fr ? 'Cycle Primaire' : 'Primary Cycle'}</span>
                  <span className="text-brand-gold group-hover:translate-x-1 transition-transform text-sm">→</span>
                </a>
              </div>
            </div>

            {/* ── Accordion droite ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div
                variants={staggerItem}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-6 md:p-8"
              >
                <Accordion items={schoolLevels} />
              </motion.div>
            </motion.div>

          </div>
        </motion.section>

        {/* ── SÉPARATEUR ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          <div className="w-2 h-2 rounded-full bg-brand-green" />
          <div className="w-2 h-2 rounded-full bg-brand-blue-deep/30" />
          <div className="w-2 h-2 rounded-full bg-brand-green" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        {/* ── TIMELINE CALENDRIER ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              {fr ? 'Calendrier' : 'Academic'}{' '}
              <span className="text-brand-gold">{fr ? 'Scolaire' : 'Calendar'}</span>
            </h2>
            <p className="text-[11px] text-brand-muted mt-3 font-serif">
              {fr ? "Année Scolaire 2026/2027 · Conforme au Ministère de l'Éducation de Côte d'Ivoire" : 'School Year 2026/2027 · In accordance with the Côte d\'Ivoire Ministry of Education'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* ── Colonne gauche — dates clés ── */}
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-brand-blue-deep text-white p-7 space-y-5">
                <h3 className="font-sans font-bold text-[10px] uppercase tracking-widest text-brand-gold">
                  {fr ? 'Dates à retenir' : 'Key Dates'}
                </h3>
                {([
                  { color: 'bg-brand-gold', date: fr ? '1er Sept 2026' : 'Sept 1, 2026', label: fr ? 'Grande Rentrée Scolaire solennelle' : 'Solemn School Opening Day' },
                  { color: 'bg-brand-green', date: fr ? 'Décembre 2026' : 'December 2026', label: fr ? "Vacances d'Hiver & fête artistique de fin d'année" : 'Winter Break & Year-End Celebration' },
                  { color: 'bg-brand-blue-light', date: fr ? 'Juin 2027' : 'June 2027', label: fr ? "Kermesse de l'Excellence & bulletins annuels" : 'Excellence Festival & Annual Report Cards' },
                ] as { color: string; date: string; label: string }[]).map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${d.color} shrink-0 mt-1`} />
                    <div>
                      <span className="font-mono font-bold text-xs text-brand-gold block">{d.date}</span>
                      <span className="font-serif text-xs text-white/70 leading-snug">{d.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-white shadow-[0_4px_30px_rgba(13,46,92,0.08)] p-6 space-y-2">
                <p className="font-sans font-bold text-[10px] text-brand-blue-deep uppercase tracking-widest">
                  {fr ? 'Année Scolaire 2026/2027' : 'School Year 2026/2027'}
                </p>
                <p className="font-serif text-xs text-brand-muted leading-relaxed">
                  {fr
                    ? "Calendrier provisoire conforme au programme officiel du Ministère de l'Éducation Nationale de Côte d'Ivoire."
                    : "Provisional schedule aligned with the official curriculum of Côte d'Ivoire's Ministry of Education."}
                </p>
              </div>
            </div>

            {/* ── Colonne droite — timeline ── */}
            <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border-0 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-brand-green/10 rounded-2xl">
                  <Clock size={22} className="text-brand-green" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-brand-blue-deep">{fr ? 'Grand Calendrier Académique' : 'Full Academic Calendar'}</h3>
                  <span className="text-[11px] font-semibold text-brand-muted">{fr ? 'Rentrée 2026/2027 · Provisoire' : 'School Year 2026/2027 · Provisional'}</span>
                </div>
              </div>

              <motion.div
                className="relative"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-blue-deep/20 via-brand-gold/30 to-brand-green/20" />

                <div className="space-y-8">
                  {calendarEvents.map((ev, idx) => (
                    <motion.div
                      key={idx}
                      variants={staggerItem}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex items-start gap-5 pl-1"
                    >
                      <div className={`relative z-10 w-6 h-6 rounded-full ${ev.color} flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_white,0_0_0_5px_rgba(13,46,92,0.1)]`}>
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                      </div>

                      <div className="flex-1 pb-1">
                        <span className="font-sans font-extrabold text-xs text-brand-blue-deep tracking-wide uppercase block mb-1">
                          {ev.period}
                        </span>
                        <p className="text-xs text-brand-muted leading-relaxed font-serif">
                          {ev.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Card>
          </div>
        </motion.section>

        {/* ── BOTTOM SPACING ── */}
        <div className="pb-4" />
      </div>
    </div>
  );
};
