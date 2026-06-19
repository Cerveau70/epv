// Système de traduction FR / EN EPV Horizons Savants
// Couvre : Navbar, Footer, Home, Admissions, Programmes, Contact, FAQ, Ecole

export type Lang = 'fr' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // ── Navbar / Drawer ──────────────────────────────────────────
    'nav.home':        'Accueil',
    'nav.programmes':  'Nos Programmes',
    'nav.admissions':  'Admissions',
    'nav.ecole':       'Vie scolaire',
    'nav.tenues':      'Tenues Scolaires',
    'nav.visite':      'École en Images',
    'nav.blog':        'Blog',
    'nav.faq':         'FAQ',
    'nav.contact':     'Contact',
    'nav.parent':      'Espace Parent',
    'nav.maternelle':  '· Maternelle',
    'nav.primaire':    '· Cycle Primaire',
    'drawer.nav':      'Navigation',
    'drawer.lang':     'Langue',
    'drawer.cta':      'Espace Parent →',
    'nav.subtitle':    "",

    // ── Mobile Bottom Nav ────────────────────────────────────────
    'bnav.home':       'Accueil',
    'bnav.programmes': 'Programmes',
    'bnav.admission':  'Inscription',
    'bnav.parent':     'Parent',

    // ── Footer ───────────────────────────────────────────────────
    'footer.tagline':  "NOUS FAISONS DES SACHANTS DE DEMAIN",
    'footer.address':  'Bingerville, Ave Konan Kouassi Lambert 38, Abidjan',
    'footer.nav':      'Navigation',
    'footer.programs': 'Programmes',
    'footer.mat':      'Maternelle (PS, MS, GS)',
    'footer.prim':     'Primaire (CP→CM2)',
    'footer.bilingual':'Programme Bilingue',
    'footer.legal':    '© 2026 EPV Horizons Savants. Tous droits réservés.',
    'footer.legal2':   'Agrément MENA N° 2026/SAG',

    // ── Home Hero ──────────────────────────────────────────────
    'hero.badge1':     'Inscriptions Ouvertes',
    'hero.badge2':     'Rentrée Septembre 2026',
    'hero.h1a':        'NOUS FAISONS DES SACHANTS',
    'hero.h1b':        'DE DEMAIN',
    'hero.h1c':        '',
    'hero.vision':     'Notre vision :',
    'hero.desc':       "École maternelle & primaire d'excellence à Abidjan · rigueur internationale, bilinguisme précoce et encadrement bienveillant.",
    'hero.btn.preinsc':'Pré-inscription',
    'hero.btn.rdv':    'Prendre RDV',
    'hero.btn.prog':   'Nos Programmes',

    // ── Home Sections ──────────────────────────────────────────
    'home.pillars':    'Nos Trois Piliers Fondateurs',
    'home.pillar1.title': 'Excellence Académique',
    'home.pillar2.title': 'Bilinguisme Précoce',
    'home.pillar3.title': 'Épanouissement Global',
    'home.stats.title': 'EPV en Chiffres',
    'home.testimonials': 'Ils nous font confiance',
    'home.cta.title':   'Réservez dès maintenant',
    'home.cta.sub':     'Les places sont limitées. Assurez la place de votre enfant.',
    'home.cta.btn':     'Réserver ma Pré-inscription',

    // ── Admissions ───────────────────────────────────────────────
    'adm.hero.sup':    'Candidatures 2026/2027',
    'adm.hero.title':  'Pré-Inscriptions Ouvertes',
    'adm.hero.sub':    "Rejoignez EPV Horizons Savants à Bingerville.",
    'adm.hero.btn1':   'Commencer ma pré-inscription',
    'adm.hero.btn2':   'Télécharger le dossier',
    'adm.process':     'Le Parcours d\'Admission',
    'adm.form.title':  'Commencer ma Pré-inscription',
    'adm.form.sub':    'Rentrée scolaire 2026/2027 · Places contingentées par section.',
    'adm.success.h2':  'Pré-inscription Enregistrée avec Succès !',

    // ── Programmes ───────────────────────────────────────────────
    'prog.hero.sup':   'Curriculum d\'Excellence',
    'prog.hero.title': 'Nos Programmes Académiques',
    'prog.hero.sub':   'Maternelle & Primaire · Approche bilingue et méthodes internationales.',
    'prog.mat.title':  'Programme Maternelle',
    'prog.prim.title': 'Programme Primaire',

    // ── École ────────────────────────────────────────────────────
    'ecole.hero.sup':  "Notre École",
    'ecole.hero.title':'EPV Horizons Savants',
    'ecole.hero.sub':  "Une école à Bingerville, Abidjan.",
    'ecole.mission':   'Notre Mission',
    'ecole.values':    'Nos Valeurs',
    'ecole.team':      'Notre Équipe',

    // ── Contact ──────────────────────────────────────────────────
    'contact.hero.sup':  'Nous contacter',
    'contact.hero.title':'Parlons de votre projet',
    'contact.hero.sub':  'Notre équipe vous répond sous 24h.',
    'contact.form.name': 'Nom et Prénom *',
    'contact.form.email':'Email de contact *',
    'contact.form.phone':'Téléphone mobile (CIV) *',
    'contact.form.objet':'Objet de votre demande *',
    'contact.form.msg':  'Votre Message *',
    'contact.form.btn':  'Transmettre ma demande',

    // ── FAQ ──────────────────────────────────────────────────────
    'faq.hero.sup':    'Foire aux Questions',
    'faq.hero.title':  'Vos questions, nos réponses',
    'faq.hero.sub':    'Tout ce que vous devez savoir sur EPV Horizons Savants.',
    'faq.search':      'Rechercher une question...',
    'faq.all':         'Toutes',

    // ── Loader ───────────────────────────────────────────────────
    'loader.public':   'Chargement…',
    'loader.admin':    'Initialisation…',
    'loader.parent':   'Bienvenue…',
  },

  en: {
    // ── Navbar / Drawer ──────────────────────────────────────────
    'nav.home':        'Home',
    'nav.programmes':  'Our Programs',
    'nav.admissions':  'Admissions',
    'nav.ecole':       'School Life',
    'nav.tenues':      'School Uniforms',
    'nav.visite':      'School in Pictures',
    'nav.blog':        'Blog',
    'nav.faq':         'FAQ',
    'nav.contact':     'Contact',
    'nav.parent':      'Parent Space',
    'nav.maternelle':  '· Kindergarten',
    'nav.primaire':    '· Primary Cycle',
    'drawer.nav':      'Navigation',
    'drawer.lang':     'Language',
    'drawer.cta':      'Parent Space →',
    'nav.subtitle':    'Bingerville · Abidjan',

    // ── Mobile Bottom Nav ────────────────────────────────────────
    'bnav.home':       'Home',
    'bnav.programmes': 'Programs',
    'bnav.admission':  'Enrollment',
    'bnav.parent':     'Parent',

    // ── Footer ───────────────────────────────────────────────────
    'footer.tagline':  "NOUS FAISONS DES SACHANTS DE DEMAIN",
    'footer.address':  'Bingerville, Ave Konan Kouassi Lambert 38, Abidjan',
    'footer.phone':    '07 78 98 14 56 / 05 85 41 51 51',
    'footer.email':    'contact@horizonssavants.com',
    'footer.hours':    'Mon to Fri: 7:30am to 5:00pm',
    'footer.nav':      'Navigation',
    'footer.programs': 'Programs',
    'footer.mat':      'Kindergarten (PS, MS, GS)',
    'footer.prim':     'Primary School (CP→CM2)',
    'footer.bilingual':'Bilingual Program',
    'footer.legal':    '© 2026 EPV Horizons Savants. All rights reserved.',
    'footer.legal2':   'Accreditation MENA No. 2026/SAG',

    // ── Home Hero ──────────────────────────────────────────────
    'hero.badge1':     'Enrollments Open',
    'hero.badge2':     'School Year September 2026',
    'hero.h1a':        'NOUS FAISONS DES SACHANTS',
    'hero.h1b':        'DE DEMAIN',
    'hero.h1c':        '',
    'hero.vision':     'Our vision:',
    'hero.desc':       'Excellence kindergarten & primary school in Abidjan · international standards, early bilingualism and caring guidance.',
    'hero.btn.preinsc':'Pre-enrollment',
    'hero.btn.rdv':    'Book Appointment',
    'hero.btn.prog':   'Our Programs',

    // ── Home Sections ──────────────────────────────────────────
    'home.pillars':    'Our Three Founding Pillars',
    'home.pillar1.title': 'Academic Excellence',
    'home.pillar2.title': 'Early Bilingualism',
    'home.pillar3.title': 'Global Development',
    'home.stats.title': 'EPV in Numbers',
    'home.testimonials': 'Trusted by families',
    'home.cta.title':   'Reserve your spot now',
    'home.cta.sub':     'Places are limited. Secure your child\'s enrollment.',
    'home.cta.btn':     'Reserve my Pre-enrollment',

    // ── Admissions ───────────────────────────────────────────────
    'adm.hero.sup':    'Applications 2026/2027',
    'adm.hero.title':  'Enrollments Are Open',
    'adm.hero.sub':    'Join EPV Horizons Savants in Bingerville.',
    'adm.hero.btn1':   'Start my enrollment',
    'adm.hero.btn2':   'Download the application',
    'adm.process':     'The Admission Process',
    'adm.form.title':  'Start my Pre-enrollment',
    'adm.form.sub':    'School Year 2026/2027 · Limited places per class.',
    'adm.success.h2':  'Pre-enrollment Successfully Registered!',

    // ── Programmes ───────────────────────────────────────────────
    'prog.hero.sup':   'Excellence Curriculum',
    'prog.hero.title': 'Our Academic Programs',
    'prog.hero.sub':   'Kindergarten & Primary · Bilingual approach and international methods.',
    'prog.mat.title':  'Kindergarten Program',
    'prog.prim.title': 'Primary Program',

    // ── École ────────────────────────────────────────────────────
    'ecole.hero.sup':  'Our School',
    'ecole.hero.title':'EPV Horizons Savants',
    'ecole.hero.sub':  'A school in Bingerville, Abidjan.',
    'ecole.mission':   'Our Mission',
    'ecole.values':    'Our Values',
    'ecole.team':      'Our Team',

    // ── Contact ──────────────────────────────────────────────────
    'contact.hero.sup':  'Contact us',
    'contact.hero.title':'Let\'s talk about your project',
    'contact.hero.sub':  'Our team replies within 24 hours.',
    'contact.form.name': 'Full Name *',
    'contact.form.email':'Contact Email *',
    'contact.form.phone':'Mobile Phone (CIV) *',
    'contact.form.objet':'Subject of your request *',
    'contact.form.msg':  'Your Message *',
    'contact.form.btn':  'Send my request',

    // ── FAQ ──────────────────────────────────────────────────────
    'faq.hero.sup':    'Frequently Asked Questions',
    'faq.hero.title':  'Your questions, our answers',
    'faq.hero.sub':    'Everything you need to know about EPV Horizons Savants.',
    'faq.search':      'Search a question...',
    'faq.all':         'All',

    // ── Loader ───────────────────────────────────────────────────
    'loader.public':   'Loading…',
    'loader.admin':    'Initializing…',
    'loader.parent':   'Welcome…',
  },
};

export function t(key: string, lang: Lang): string {
  return translations[lang][key] ?? key;
}
