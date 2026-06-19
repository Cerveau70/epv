
import React from 'react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Heart, ArrowRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

export const ProgrammesMaternelle: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  return (
    <div className="relative animate-fade-in py-12 px-4 md:px-8 bg-white select-none">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb & Intro header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-brand-muted uppercase font-bold tracking-wider">
            <a href="#/programmes" className="hover:text-brand-blue-deep transition-colors">
              {fr ? "Nos Programmes" : "Our Programs"}
            </a>
            <span>/</span>
            <span className="text-brand-green">
              {fr ? "Maternelle" : "Kindergarten"}
            </span>
          </div>

          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight leading-tight">
            {fr
              ? "Programme Maternelle d'Excellence à Abidjan EPV Horizons Savants"
              : "Excellence Kindergarten Program in Abidjan EPV Horizons Savants"}
          </h1>
          <p className="font-serif text-sm md:text-base text-brand-muted leading-relaxed max-w-4xl">
            {fr
              ? "Découvrez notre cursus de maternelle précoce agréé, conçu spécifiquement à Bingerville pour éveiller l'estime de soi, propulser la socialisation bienveillante, et ancrer un bilinguisme franco-anglais d'élite dès 2 ans."
              : "Discover our accredited early kindergarten curriculum, specifically designed in Bingerville to awaken self-esteem, foster caring socialization, and establish elite French-English bilingualism from age 2."}
          </p>
          <div className="h-1 w-20 bg-brand-gold rounded-full" />
        </div>

        {/* Hero image or big citation card */}
        <Card className="bg-brand-blue-deep text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 text-brand-gold/10 pointer-events-none select-none">
            <Heart size={200} strokeWidth={1} />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl font-serif">
            <p className="text-sm md:text-md italic leading-relaxed">
              {fr
                ? '« Les premières années de vie constituent un âge d\'or pour la plasticité cérébrale. C\'est à cet instant précis que se dessinent les fondations d\'un parcours exceptionnel. Chez EPV Horizons Savants, nous offrons à chaque enfant l\'environnement idéal pour explorer son potentiel infini. »'
                : '"The early years of life are a golden age for brain plasticity. It is at this precise moment that the foundations of an exceptional journey are shaped. At EPV Horizons Savants, we provide each child with the ideal environment to explore their infinite potential."'}
            </p>
            <div className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold">
              {fr ? '— Direction Pédagogique, EPV Horizons Savants Abidjan' : '— Academic Leadership, EPV Horizons Savants Abidjan'}
            </div>
          </div>
        </Card>

        {/* Long content article block (divided into clear headings for Local SEO Google Ivory Coast) */}
        <div className="font-serif text-xs md:text-sm text-brand-dark/95 space-y-6 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-sans font-bold text-lg md:text-xl text-brand-blue-deep">
              {fr ? "Pourquoi la Maternelle d'Horizons Savants est Unique en Côte d'Ivoire ?" : "Why EPV Horizons Savants Kindergarten is Unique in Côte d'Ivoire?"}
            </h2>
            <p>
              {fr
                ? <>À Abidjan, la quête d'une institution préscolaire alliant rigueur et bienveillance est une priorité pour les familles d'excellence. Le Programme Maternelle d'EPV Horizons Savants répond à ce besoin crucial en mariant les requis officiels de l'Éducation Nationale avec d'immenses enrichissements internationaux. Notre école se démarque par un effectif de <strong>25 élèves maximum par classe</strong>, garantissant un suivi hautement personnalisé.</>
                : <>In Abidjan, finding a preschool institution combining rigor and caring is a priority for excellence-minded families. EPV Horizons Savants' Kindergarten Program meets this crucial need by blending official national requirements with extensive international enrichment. Our school stands out with <strong>a maximum of 25 students per class</strong>, ensuring highly personalized monitoring.</>}
            </p>
            <p>
              {fr
                ? "Notre pédagogie s'inspire activement de la philosophie Montessori, du socio-constructivisme et de la bienveillance active. Nous considérons le jeu libre dirigé, les manipulations physiques d'objets tridimensionnels et le contact régulier avec la nature comme les moteurs primaires de l'intelligence cognitive et émotionnelle de l'élève."
                : "Our pedagogy is actively inspired by Montessori philosophy, socio-constructivism and caring practice. We consider directed free play, physical manipulations of three-dimensional objects and regular contact with nature as the primary drivers of a student's cognitive and emotional intelligence."}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              {fr ? "1. L'Immersion Linguistique Bilingue Précoce d'Abidjan" : "1. Early Bilingual Language Immersion in Abidjan"}
            </h3>
            <p>
              {fr
                ? "Le cerveau préscolaire absorbe les sonorités linguistiques avec une fluidité extraordinaire. Notre cursus maternelle propose une immersion d'usage totale : la moitié de la journée d'éveil se déroule intégralement en langue anglaise, l'autre moitié en langue française. À travers des comptines théâtralisées, des récits partagés de grands contes, et des interactions quotidiennes naturelles, nos élèves s'approprient les structures verbales fondamentales et entrent au primaire de façon bilingue spontanée."
                : "The preschool brain absorbs linguistic sounds with extraordinary fluency. Our kindergarten curriculum offers total immersion: half the awakening day takes place entirely in English, the other half in French. Through theatrical nursery rhymes, shared story readings and natural daily interactions, our students assimilate fundamental verbal structures and enter primary school spontaneously bilingual."}
            </p>
          </section>

          {/* Grids with classes details */}
          <section className="space-y-4 pt-2">
            <h2 className="font-sans font-bold text-md md:text-lg text-brand-blue-deep border-b border-brand-border/60 pb-1.5">
              {fr ? 'Nos Trois Sections d\'Éveil Pédagogique d\'Élite' : 'Our Three Elite Early Learning Classes'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-green shrink-0">PS</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'Petite Section (2-3 ans)' : 'Nursery Class (2-3 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? "L'objectif prioritaire est l'affirmation sereine du langage verbal et l'acquisition d'une autonomie motrice." : "The primary objective is the serene development of verbal language and the acquisition of motor autonomy."}</p>
                  <p><strong>{fr ? 'Ateliers Spécifiques :' : 'Key Workshops:'}</strong> {fr ? 'Motricité fine tridimensionnelle, conscience du corps, socialisation guidée, comptines d\'immersion bilingue quotidienne.' : 'Three-dimensional fine motor skills, body awareness, guided socialization, daily bilingual immersion nursery rhymes.'}</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-gold shrink-0">MS</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'Moyenne Section (3-4 ans)' : 'Middle Class (3-4 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? 'La Moyenne Section structure le graphisme fin, l\'appréhension spatiale des volumes, et le raisonnement logique élémentaire.' : 'The Middle Class structures fine handwriting, spatial understanding of volumes, and elementary logical reasoning.'}</p>
                  <p><strong>{fr ? 'Ateliers Spécifiques :' : 'Key Workshops:'}</strong> {fr ? 'Tracés d\'orientation, pré-phonique de l\'alphabet, poterie d\'argile, exploration rythmique sonore active.' : 'Orientation tracing, alphabet pre-phonics, clay pottery, active sound rhythm exploration.'}</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-extrabold text-sm text-brand-blue-deep shrink-0">GS</span>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">{fr ? 'Grande Section (5-6 ans)' : 'Senior Class (5-6 years)'}</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>{fr ? 'La Grande Section agit comme une passerelle d\'excellence vers le cycle primaire littéraire et STEM.' : 'The Senior Class acts as a bridge of excellence toward the literary and STEM primary cycle.'}</p>
                  <p><strong>{fr ? 'Ateliers Spécifiques :' : 'Key Workshops:'}</strong> {fr ? 'Consolidation du graphisme cursif, déchiffrage syllabique bilingue, et logique computationnelle de blocs tactiles.' : 'Cursive handwriting consolidation, bilingual syllabic decoding, and Lego Education tactile block computational logic.'}</p>
                </div>
              </div>

            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              {fr ? '2. Développement Socio-Émotionnel et Psychomotricité Active' : '2. Socio-Emotional Development & Active Psychomotor Skills'}
            </h3>
            <p>
              {fr
                ? "Pour Horizons Savants, le cœur intellectuel de l'enfant ne saurait s'épanouir sans l'équilibre du corps. Notre campus premium d'Abidjan est doté d'aires de jeux ombragées, d'une salle de motricité climatisée et d'outils d'éveil ludiques. Chaque élève bénéficie d'activités guidées régulières et d'ateliers de yoga pour enfants."
                : "For Horizons Savants, a child's intellectual core cannot flourish without physical balance. Our premium Abidjan campus features shaded playgrounds, an air-conditioned motor skills room and playful awakening tools. Each student benefits from regular guided activities and children's yoga workshops."}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-green">
              {fr ? "3. Infrastructures d'Exception et Sécurité Sanitaire Rigoureuse" : '3. Exceptional Facilities & Rigorous Health Safety'}
            </h3>
            <p>
              {fr
                ? "Situé dans un havre de paix à Bingerville, notre établissement maternelle respecte les normes ergonomiques et de sécurité les plus strictes. Les salles de classe sont lumineuses, climatisées et équipées de sanitaires intérieurs privatifs. L'enceinte fait l'objet d'une télésurveillance permanente CCTV."
                : "Located in a peaceful haven in Bingerville, our kindergarten meets the strictest ergonomic and safety standards. Classrooms are bright, air-conditioned and equipped with private indoor restrooms. The premises are under permanent CCTV surveillance and strict elite security."}
            </p>
          </section>

        </div>

        {/* Highlights summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 font-sans text-center select-none border-t border-brand-border/40">
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-green">25 max</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Élèves par classe' : 'Students per class'}</span>
          </div>
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-gold">50% / 50%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Immersion Bilingue' : 'Bilingual Immersion'}</span>
          </div>
          <div className="pt-4">
            <strong className="block text-2xl font-extrabold text-brand-blue-deep">100%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">{fr ? 'Salles climatisées' : 'Air-conditioned classrooms'}</span>
          </div>
        </div>

        {/* Call to action panel */}
        <Card className="bg-brand-gold-light/15 border border-brand-gold-light/45 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="font-sans font-extrabold text-lg md:text-xl text-brand-blue-deep leading-tight">
              {fr ? "Garantir une place d'excellence en Maternelle pour Septembre 2026" : 'Secure an Excellence Kindergarten Spot for September 2026'}
            </h3>
            <p className="text-xs text-brand-muted font-serif leading-relaxed">
              {fr
                ? "En raison de la stricte limitation à 25 élèves par section de maternelle, les inscriptions se clôturent promptement. Déposez votre pré-inscription d'admission en 2 minutes dès aujourd'hui."
                : "Due to the strict limit of 25 students per kindergarten class, enrollments close quickly. Submit your pre-enrollment application in 2 minutes starting today."}
            </p>
          </div>
          <a href="#/admissions" className="shrink-0">
            <Button variant="cta" className="font-bold gap-2 px-6">
              {fr ? 'Déposer le Dossier parent' : 'Submit Application'} <ArrowRight size={14} />
            </Button>
          </a>
        </Card>

      </div>
    </div>
  );
};

