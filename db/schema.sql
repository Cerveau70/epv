-- EPV Horizons Savants — Schéma PostgreSQL (Neon)
-- Lancer via : psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'parent',  -- 'admin' | 'parent'
  nom           TEXT NOT NULL,
  prospect_id   TEXT,
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  derniere_cnx  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paiements (
  id               TEXT PRIMARY KEY,
  prospect_id      TEXT NOT NULL,
  trimestre        TEXT NOT NULL,          -- T1 | T2 | T3 | FOURNITURES | INSCRIPTION
  montant          NUMERIC NOT NULL,
  date_paiement    DATE NOT NULL,
  mode_paiement    TEXT DEFAULT 'Espèces', -- Espèces | Mobile Money | Virement
  reference        TEXT,
  statut           TEXT NOT NULL DEFAULT 'validé', -- validé | annulé
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuration (
  cle          TEXT PRIMARY KEY,
  valeur       JSONB NOT NULL,
  description  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospects (
  id                        TEXT PRIMARY KEY,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prenom_enfant             TEXT NOT NULL,
  nom_enfant                TEXT NOT NULL,
  date_naissance            DATE NOT NULL,
  section_visee             TEXT NOT NULL,
  prenom_parent             TEXT NOT NULL,
  nom_parent                TEXT NOT NULL,
  lien_parente              TEXT NOT NULL,
  telephone                 TEXT NOT NULL,
  email                     TEXT NOT NULL,
  commune                   TEXT NOT NULL,
  source                    TEXT,
  code_parrainage_utilise   TEXT,
  code_parrainage_personnel TEXT NOT NULL,
  statut                    TEXT NOT NULL DEFAULT 'Prospect',
  notes_admin               TEXT
);

CREATE TABLE IF NOT EXISTS rendezvous (
  id              TEXT PRIMARY KEY,
  prospect_id     TEXT,
  prenom_parent   TEXT NOT NULL,
  nom_parent      TEXT NOT NULL,
  telephone       TEXT NOT NULL,
  email           TEXT NOT NULL,
  prenom_enfant   TEXT,
  section_enfant  TEXT,
  date_heure      TIMESTAMPTZ NOT NULL,
  type_rdv        TEXT NOT NULL,
  statut          TEXT NOT NULL DEFAULT 'planifie',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parrainages (
  id                    TEXT PRIMARY KEY,
  code_parrain          TEXT NOT NULL,
  prospect_id_parrain   TEXT,
  prospect_id_filleul   TEXT,
  statut                TEXT NOT NULL DEFAULT 'en_attente',
  reduction_appliquee   NUMERIC DEFAULT 10,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS places (
  section               TEXT PRIMARY KEY,
  capacite_max          INTEGER NOT NULL,
  inscrits_confirmes    INTEGER NOT NULL DEFAULT 0,
  pre_inscrits          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notifications (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  destinataire  TEXT NOT NULL,
  sujet         TEXT,
  contenu       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id          TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  email       TEXT NOT NULL,
  telephone   TEXT NOT NULL,
  objet       TEXT,
  message     TEXT NOT NULL,
  statut      TEXT NOT NULL DEFAULT 'A traiter',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT,
  de          TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lu          BOOLEAN NOT NULL DEFAULT FALSE,
  contenu     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id      TEXT PRIMARY KEY,
  ts      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usr     TEXT NOT NULL,
  action  TEXT NOT NULL,
  module  TEXT NOT NULL,
  detail  TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id          TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  matieres    JSONB DEFAULT '[]',
  classes     JSONB DEFAULT '[]',
  tel         TEXT,
  email       TEXT,
  entree      DATE,
  statut      TEXT DEFAULT 'actif',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id          TEXT PRIMARY KEY,
  poste       TEXT NOT NULL,
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  tel         TEXT,
  email       TEXT,
  entree      DATE,
  statut      TEXT DEFAULT 'actif',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depenses (
  id          TEXT PRIMARY KEY,
  date        DATE NOT NULL,
  categorie   TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  montant     NUMERIC NOT NULL,
  statut      TEXT NOT NULL DEFAULT 'en_attente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletters (
  id          TEXT PRIMARY KEY,
  objet       TEXT NOT NULL,
  contenu     TEXT,
  cible       TEXT NOT NULL DEFAULT 'ALL',
  statut      TEXT NOT NULL DEFAULT 'brouillon',
  date        TIMESTAMPTZ DEFAULT NOW(),
  envois      INTEGER DEFAULT 0,
  ouvertures  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id          TEXT PRIMARY KEY,
  titre       TEXT NOT NULL,
  contenu     TEXT,
  auteur      TEXT,
  cat         TEXT,
  statut      TEXT NOT NULL DEFAULT 'brouillon',
  vues        INTEGER DEFAULT 0,
  date        TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq (
  id          TEXT PRIMARY KEY,
  question    TEXT NOT NULL,
  reponse     TEXT NOT NULL,
  cat         TEXT,
  ordre       INTEGER DEFAULT 0,
  publie      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temoignages (
  id          TEXT PRIMARY KEY,
  parent      TEXT NOT NULL,
  enfant      TEXT,
  note        INTEGER,
  texte       TEXT NOT NULL,
  statut      TEXT NOT NULL DEFAULT 'en_attente',
  vedette     BOOLEAN DEFAULT FALSE,
  date        TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS galerie (
  id          TEXT PRIMARY KEY,
  titre       TEXT NOT NULL,
  url         TEXT,
  cat         TEXT,
  classe      TEXT,
  date        DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devoirs (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT,
  matiere     TEXT NOT NULL,
  sujet       TEXT NOT NULL,
  rendu       TEXT,
  statut      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cantine (
  id          TEXT PRIMARY KEY,
  jour        TEXT NOT NULL,
  plat        TEXT NOT NULL,
  accomp      TEXT,
  dessert     TEXT,
  semaine     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evenements (
  id          TEXT PRIMARY KEY,
  titre       TEXT NOT NULL,
  date        DATE NOT NULL,
  heure       TEXT,
  lieu        TEXT,
  type        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT,
  matiere     TEXT NOT NULL,
  t1          NUMERIC,
  t2          NUMERIC,
  t3          NUMERIC,
  coef        INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assiduite (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT,
  date        DATE NOT NULL,
  type        TEXT NOT NULL,
  motif       TEXT,
  duree       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport (
  id          TEXT PRIMARY KEY,
  ligne       TEXT,
  numero      TEXT,
  operateur   TEXT,
  arrets      JSONB DEFAULT '[]',
  statut      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sante_eleve (
  id              TEXT PRIMARY KEY,
  prospect_id     TEXT,
  groupe_sanguin  TEXT,
  allergies       TEXT,
  vaccinations    TEXT,
  medecin         TEXT,
  infirmerie      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bilinguisme (
  id          TEXT PRIMARY KEY,
  prospect_id TEXT,
  niveau      TEXT,
  commentaire TEXT,
  competences JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_campaigns (
  id          TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  url         TEXT NOT NULL,
  utm_source  TEXT NOT NULL,
  full_url    TEXT NOT NULL,
  scans       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  titre       TEXT NOT NULL,
  fichier     TEXT NOT NULL,
  cat         TEXT NOT NULL DEFAULT 'Général',
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compositions (
  id            TEXT PRIMARY KEY,
  titre         TEXT NOT NULL,
  section       TEXT NOT NULL,
  trimestre     TEXT NOT NULL,
  date_debut    DATE NOT NULL,
  date_fin      DATE,
  matieres      JSONB NOT NULL DEFAULT '[]',
  statut        TEXT NOT NULL DEFAULT 'planifie',
  notif_envoye  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bulletins (
  id                    TEXT PRIMARY KEY,
  prospect_id           TEXT NOT NULL,
  trimestre             TEXT NOT NULL,
  annee_scolaire        TEXT NOT NULL DEFAULT '2026-2027',
  notes_detail          JSONB NOT NULL DEFAULT '[]',
  moyenne_generale      NUMERIC,
  rang                  INTEGER,
  effectif_classe       INTEGER,
  mention               TEXT,
  appreciation_generale TEXT,
  publie                BOOLEAN NOT NULL DEFAULT FALSE,
  date_publication      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
