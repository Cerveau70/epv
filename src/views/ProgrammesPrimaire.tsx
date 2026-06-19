
import React from 'react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

export const ProgrammesPrimaire: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  return (
    <div className="relative animate-fade-in py-12 px-4 md:px-8 bg-white select-none">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb & Intro header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-brand-muted uppercase font-bold tracking-wider">
            <a href="#/programmes" className="hover:text-brand-blue-deep transition-colors">{fr ? 'Nos Programmes' : 'Our Programs'}</a>
            <span>/</span>
            <span className="text-brand-blue-medium">{fr ? 'Cycle Primaire' : 'Primary Cycle'}</span>
          </div>

          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight leading-tight">
            {fr ? "Programme Primaire d'Élite d'Abidjan · EPV Horizons Savants" : 'Elite Primary Program in Abidjan · EPV Horizons Savants'}
          </h1>
          <p className="font-serif text-sm md:text-base text-brand-muted leading-relaxed max-w-4xl">
            {fr
              ? "Découvrez comment notre enseignement élémentaire d'excellence d'Abidjan prépare intellectuellement et méthodologiquement les plus doués des élèves de Côte d'Ivoire à l'accès aux plus prestigieux collèges mondiaux."
              : "Discover how our elite primary education in Abidjan intellectually and methodologically prepares Côte d'Ivoire's most gifted students for access to the world's most prestigious secondary schools."}
          </p>
          <div className="h-1 w-20 bg-brand-blue-medium rounded-full" />
        </div>

        {/* Hero content card */}
        <Card className="bg-brand-blue-medium text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 text-brand-gold/10 pointer-events-none select-none">
            <BookOpen size={200} strokeWidth={1} />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl font-serif">
            <p className="text-sm md:text-md italic leading-relaxed">
              {fr
                ? '« L\'école primaire ne doit pas seulement transférer des faits mémorisés de façon mécanique, elle doit aiguiser la curiosité analytique, installer l\'éloquence orale publique et donner le goût de l\'abstraction mathématique. C\'est l\'essence de notre programme d\'excellence académique à Abidjan. »'
                : '"Primary school must not simply transfer mechanically memorized facts it must sharpen analytical curiosity, build public oral eloquence and cultivate a taste for mathematical abstraction. This is the essence of our academic excellence program in Abidjan."'}
            </p>
            <div className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold">
              {fr ? '· Conseil de l\'Élite Académique, EPV Horizons Savants' : '· Academic Excellence Council, EPV Horizons Savants'}
            </div>
          </div>
        </Card>

        {/* Long content article block (divided into clear headings for Local SEO Google Ivory Coast) */}
        <div className="font-serif text-xs md:text-sm text-brand-dark/95 space-y-6 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-sans font-bold text-lg md:text-xl text-brand-blue-deep">
              {fr ? "La Redéfinition de l'Excellence du Premier Cycle Primaire en Côte d'Ivoire" : "Redefining Primary Excellence in Côte d'Ivoire"}
            </h2>
            <p>
              {fr
                ? "EPV Horizons Savants à Abidjan applique les exigences académiques strictes agréées par le Ministère de l'Éducation Nationale de Côte d'Ivoire, enrichies de méthodes actives mondiales : Singapour pour les mathématiques et la Finlande pour l'accompagnement comportemental bienveillant."
                : "EPV Horizons Savants in Abidjan applies the strict academic requirements approved by Côte d'Ivoire's Ministry of National Education, enriched with world-class active methods: Singapore for mathematics and Finland for caring behavioral support."}
            </p>
            <p>
              {fr
                ? <>Sous la conduite d'un corps professoral d'élite, notre enseignement primaire garantit des classes limitées à <strong>25 élèves maximum</strong>. Cette densité d'élite permet d'allouer à chaque enfant le temps d'assimilation requis, éradiquant l'échec et stimulant le dépassement de soi.</>
                : <>Under the guidance of a handpicked elite faculty, our primary teaching guarantees classes limited to <strong>25 students maximum</strong>. This elite ratio allows each child the time needed for assimilation, eradicating failure and stimulating self-improvement.</>}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              {fr ? "1. Mathématiques d'Élite : La Méthode Concrète, Imagée, Abstraite de Singapour" : '1. Elite Mathematics: The Singapore Concrete-Pictorial-Abstract Method'}
            </h3>
            <p>
              {fr
                ? <>Les mathématiques sont souvent sources d'anxiété scolaire. Chez EPV Horizons Savants, nous avons brisé ce cycle en instaurant la <strong>Méthode de Singapour</strong> du CP au CM2.</>
                : <>Mathematics is often a source of academic anxiety. At EPV Horizons Savants, we have broken this cycle by implementing the <strong>Singapore Method</strong> from Grade 1 to Grade 5.</>}
            </p>
            <p>
              {fr
                ? <>Cette approche en trois étapes commence par le <strong>Concret</strong> (manipulations d'objets), se poursuit par l'<strong>Imagé</strong> (modélisation graphique), et s'achève par l'<strong>Abstrait</strong> (notations algébriques). Nos élèves abordent ainsi sereinement le calcul complexe et la résolution de problèmes.</>
                : <>This three-step approach always starts with the <strong>Concrete</strong> (object manipulations), continues with the <strong>Pictorial</strong> (bar model representations), and concludes with the <strong>Abstract</strong> (algebraic notation). Our students thus calmly approach complex calculations and problem solving.</>}
            </p>
          </section>

          {/* Grids with classes details */}
          <section className="space-y-4 pt-2">
            <h2 className="font-sans font-bold text-md md:text-lg text-brand-blue-deep border-b border-brand-border/60 pb-1.5">
              {fr ? 'Notre Parcours Pédagogique par Cycles du CP au CM2' : 'Our Pedagogical Journey by Cycles from Grade 1 to Grade 5'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-blue-medium shrink-0">CP</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'CPI / CP (6-7 ans)' : 'Grade 1 CP (6-7 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? "Le cycle de lecture phonique active et d'acquisition de l'écriture cursive impeccable en Français et en Anglais." : "The cycle of active phonics reading and impeccable cursive writing acquisition in French and English."}</p>
                  <p><strong>{fr ? 'Piliers :' : 'Pillars:'}</strong> {fr ? 'Méthode phonique bilingue, mathématiques Singapour (sommes jusqu\'à 100), projets nature dans notre potager écologique.' : 'Bilingual phonics method, Singapore math (sums up to 100), nature discovery projects in our ecological garden.'}</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-gold shrink-0">CE</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'CE1 & CE2 (7-9 ans)' : 'Grades 2 & 3 CE (7-9 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? "La phase de consolidation orthographique, de grammaire et de structuration du raisonnement scientifique et d'éloquence." : "The phase of spelling consolidation, grammar and structuring of scientific reasoning and eloquence."}</p>
                  <p><strong>{fr ? 'Piliers :' : 'Pillars:'}</strong> {fr ? 'Dictées programmées, géométrie de précision, théâtre d\'expression orale, robotique éducative Lego Education.' : 'Scheduled dictations, precision geometry, oral expression theater, Lego Education robotics.'}</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-blue-deep shrink-0">CM</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'CM1 & CM2 (9-11 ans)' : 'Grades 4 & 5 CM (9-11 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? "Le cycle d'élargissement critique, de bilinguisme soutenu et de préparation aux concours prestigieux d'admission." : "The cycle of critical expansion, sustained bilingualism and preparation for prestigious entrance exams."}</p>
                  <p><strong>{fr ? 'Piliers :' : 'Pillars:'}</strong> {fr ? 'Analyse grammaticale avancée, mathématiques d\'équations, codage Scratch, géopolitique africaine, leadership social.' : 'Advanced grammar analysis, equation mathematics, Scratch coding, African geopolitics, social leadership workshops.'}</p>
                </div>
              </div>

            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              {fr ? '2. Bilinguisme Académique Réfléchi et Littérature' : '2. Thoughtful Academic Bilingualism & Literature'}
            </h3>
            <p>
              {fr
                ? "Au cycle primaire, le bilinguisme dépasse les rituels d'expression orale pour devenir académique solide. Nos cours de sciences, STEM et d'histoire-géographie sont alternativement en Français et en Anglais. Les élèves lisent régulièrement des ouvrages de référence dans les deux langues et rédigent des dissertations de haut niveau."
                : "In the primary cycle, bilingualism goes beyond oral expression rituals to become solid academic bilingualism. Our science, STEM and geography-history classes alternate between French and English. Students regularly read reference works in both languages and write high-level essays."}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-gold font-bold">
              {fr ? '3. STEM et Technologie Computationnelle Lego Education' : '3. STEM & Lego Education Computational Technology'}
            </h3>
            <p>
              {fr
                ? "EPV Horizons Savants d'Abidjan prépare ses élèves à exceller dans un univers numérique. Notre atelier robotique et de programmation Scratch permet d'appréhender la logique mathématique appliquée. Les enfants construisent leurs capteurs Lego Education, testent les boucles et variables mécaniques et apprennent à travailler en groupe de projet."
                : "EPV Horizons Savants in Abidjan prepares its students to excel in an increasingly digital world. Our Scratch programming and robotics workshop develops applied mathematical logic. Children build their own Lego Education motorized sensors, test mechanical loops and variables, and learn collaborative project work."}
            </p>
          </section>

        </div>

        {/* Highlights summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 font-sans text-center select-none border-t border-brand-border/40">
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-blue-medium">25 max</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Élèves par classe' : 'Students per class'}</span>
          </div>
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-gold">100%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Méthode Singapour' : 'Singapore Method'}</span>
          </div>
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-green">10</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Clubs parascolaires' : 'Extracurricular clubs'}</span>
          </div>
        </div>

        {/* Call to action panel */}
        <Card className="bg-brand-gold-light/15 border border-brand-gold-light/45 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="font-sans font-extrabold text-lg md:text-xl text-brand-blue-deep leading-tight">
              {fr ? "Prendre rendez-vous avec le Conseil Pédagogique d'Abidjan" : 'Book an Appointment with the Academic Council in Abidjan'}
            </h3>
            <p className="text-xs text-brand-muted font-serif leading-relaxed">
              {fr
                ? "Le passage du test d'évaluation gratuit est nécessaire pour valider l'excellence et le plan d'accueil individualisé de l'élève en CP, CE1, CE2, CM1 ou CM2. Planifiez votre entretien physique."
                : "The free evaluation test is necessary to validate excellence and create an individualized reception plan for each student in Grades 1 through 5. Schedule your in-person interview."}
            </p>
          </div>
          <a href="#/admissions" className="shrink-0">
            <Button variant="cta" className="font-bold gap-2 px-6">
              {fr ? "S'inscrire aux Évaluations" : 'Register for Evaluations'} <ArrowRight size={14} />
            </Button>
          </a>
        </Card>

      </div>
    </div>
  );
};
