
export enum StatutProspect {
  PROSPECT = 'Prospect',
  PRE_INSCRIT = 'Pré-inscrit',
  INSCRIT = 'Inscrit',
  ARCHIVE = 'Archivé'
}

export interface Prospect {
  id: string;
  createdAt: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  sectionVisee: string; // PS, MS, GS, CP, CE1, CE2, CM1, CM2
  prenomParent: string;
  nomParent: string;
  lienParente: 'Père' | 'Mère' | 'Tuteur';
  telephone: string; // Formatted as +225...
  email: string;
  commune: string; // Cocody, Marcory, Plateau, Yopougon, Abobo, Adjame, Treichville, Port-Bouet, Koumassi, Bingerville, etc.
  source: string;
  statut: StatutProspect;
  notesAdmin?: string;
  photoUrl?: string;
  updatedAt: string;
}

export enum StatutRendezVous {
  PLANIFIE = 'planifie',
  CONFIRME = 'confirme',
  ANNULE = 'annule',
  FAIT = 'fait'
}

export interface RendezVous {
  id: string;
  prospectId?: string; // Optional if booked without pre-inscription
  prenomParent: string;
  nomParent: string;
  telephone: string;
  email: string;
  prenomEnfant?: string;
  sectionEnfant?: string;
  dateHeure: string; // ISO String
  typeRdv: 'Visite des locaux' | 'Entretien pédagogique' | 'Évaluation enfant' | 'Question administrative';
  statut: StatutRendezVous;
  notes?: string;
  createdAt: string;
}


export interface SectionPlace {
  section: string; // PS, MS, GS, CP, CE1, CE2, CM1, CM2
  capaciteMax: number;
  inscritsConfirmes: number;
  preInscrits: number;
}

export interface NotificationLog {
  id: string;
  type: 'email' | 'whatsapp';
  timestamp: string;
  destinataire: string;
  sujet?: string;
  contenu: string;
  lu?: boolean;
}

export interface ParentSession {
  prospect: Prospect;
  submitedDocuments: {
    acteNaissance: boolean;
    carnetSante: boolean;
    photosProfil: boolean;
    bulletinPrecedent: boolean;
  };
}
