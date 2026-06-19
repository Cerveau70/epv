
import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { CalendarPicker } from '../ui/CalendarPicker.tsx';
import { Calendar, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext.tsx';

interface AppointmentFormProps {
  onSuccess: (appointment: any) => void;
  initialProspect?: any; // optional prepopulated details
  id?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSuccess,
  initialProspect,
  id
}) => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time details
  const [selectedDateTime, setSelectedDateTime] = useState("");

  // Fields
  const [prenomParent, setPrenomParent] = useState(initialProspect?.prenomParent || "");
  const [nomParent, setNomParent] = useState(initialProspect?.nomParent || "");
  const [telephone, setTelephone] = useState(initialProspect?.telephone || "");
  const [email, setEmail] = useState(initialProspect?.email || "");
  const [prenomEnfant, setPrenomEnfant] = useState(initialProspect?.prenomEnfant || "");
  const [sectionEnfant, setSectionEnfant] = useState(initialProspect?.sectionVisee || "PS");
  const [typeRdv, setTypeRdv] = useState<'Visite des locaux' | 'Entretien pédagogique' | 'Évaluation enfant' | 'Question administrative'>("Visite des locaux");
  const [notes, setNotes] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDateTime) {
      setError(fr ? "Veuillez sélectionner un créneau horaire disponible sur le calendrier." : "Please select an available time slot on the calendar.");
      return;
    }

    if (!prenomParent.trim() || !nomParent.trim() || !telephone.trim() || !email.trim()) {
      setError(fr ? "Veuillez remplir vos coordonnées de contact obligatoires." : "Please fill in all required contact details.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/rendezvous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenomParent,
          nomParent,
          telephone,
          email,
          prenomEnfant: prenomEnfant || undefined,
          sectionEnfant: sectionEnfant || undefined,
          dateHeure: selectedDateTime,
          typeRdv,
          notes: notes || undefined,
          prospectId: initialProspect?.id
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de la réservation.");
      }

      onSuccess(result.data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la prise de rendez-vous en ligne.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={id} className="p-6 md:p-8 select-none">
      <div className="border-b border-brand-border/40 pb-4 mb-6">
        <h3 className="font-sans font-bold text-lg text-brand-blue-deep flex items-center gap-2">
          <Calendar className="text-brand-gold" size={20} />
          {fr ? "Planifier un Rendez-vous d'Excellence" : 'Book an Excellence Appointment'}
        </h3>
        <p className="text-xs text-brand-muted mt-1 leading-normal leading-relaxed">
          {fr
            ? "Planifiez votre visite physique, entretien pédagogique d'admission ou l'évaluation d'apprentissage de votre enfant."
            : "Schedule your in-person visit, academic admission interview, or your child's learning assessment."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-400 text-red-600 text-xs font-semibold leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-6">
        {/* Step 1: Calendar Selection */}
        <div>
          <label className="block text-xs font-bold text-brand-blue-deep uppercase tracking-wider mb-3">
            {fr ? "Étape 1 : Choisir la Date et l'Heure *" : 'Step 1: Choose Date & Time *'}
          </label>
          <CalendarPicker
            selectedDateTime={selectedDateTime}
            onSelectDateTime={(iso) => setSelectedDateTime(iso)}
          />
        </div>

        {/* Step 2: Informational entries */}
        <div className="border-t border-brand-border/40 pt-5 space-y-4">
          <label className="block text-xs font-bold text-brand-blue-deep uppercase tracking-wider">
            {fr ? 'Étape 2 : Vos Coordonnées Académiques' : 'Step 2: Your Contact Details'}
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Objet du rendez-vous *' : 'Appointment purpose *'}</label>
              <select
                value={typeRdv}
                onChange={(e) => setTypeRdv(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
              >
                <option value="Visite des locaux">{fr ? 'Visite guidée des locaux scolaires' : 'Guided school tour'}</option>
                <option value="Entretien pédagogique">{fr ? 'Entretien pédagogique direction' : 'Pedagogical interview with management'}</option>
                <option value="Évaluation enfant">{fr ? "Évaluation de l'enfant (test d'excellence gratuit)" : 'Child assessment (free excellence test)'}</option>
                <option value="Question administrative">{fr ? "Clarification d'ordre administrative" : 'Administrative inquiry'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Adresse e-mail de contact *' : 'Contact email *'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-brand-muted" size={13} />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={!!initialProspect}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Votre Prénom *' : 'First Name *'}</label>
              <input
                type="text"
                required
                value={prenomParent}
                disabled={!!initialProspect}
                onChange={(e) => setPrenomParent(e.target.value)}
                placeholder={fr ? 'Prénom' : 'First name'}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Votre Nom *' : 'Last Name *'}</label>
              <input
                type="text"
                required
                value={nomParent}
                disabled={!!initialProspect}
                onChange={(e) => setNomParent(e.target.value)}
                placeholder={fr ? 'Nom de famille' : 'Last name'}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? "Téléphone d'urgence *" : 'Emergency Phone *'}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-brand-muted" size={13} />
                <input
                  type="tel"
                  required
                  value={telephone}
                  disabled={!!initialProspect}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225..."
                  className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? "Section de l'enfant (optionnel)" : "Child's class (optional)"}</label>
              <select
                value={sectionEnfant}
                onChange={(e) => setSectionEnfant(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
              >
                <option value="PS">{fr ? 'Petite Section' : 'Nursery (PS)'}</option>
                <option value="MS">{fr ? 'Moyenne Section' : 'Middle Kindergarten (MS)'}</option>
                <option value="GS">{fr ? 'Grande Section' : 'Senior Kindergarten (GS)'}</option>
                <option value="CP1">{fr ? 'CP1 CPI' : 'Grade 1 (CP1)'}</option>
                <option value="CP2">{fr ? 'CP2 CPII' : 'Grade 2 (CP2)'}</option>
                <option value="CE1">{fr ? 'Classe de CE1' : 'Grade 3 (CE1)'}</option>
                <option value="CE2">{fr ? 'Classe de CE2' : 'Grade 3 (CE2)'}</option>
                <option value="CM1">{fr ? 'Classe de CM1' : 'Grade 4 (CM1)'}</option>
                <option value="CM2">{fr ? 'Classe de CM2' : 'Grade 5 (CM2)'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? "Prénom de l'enfant (optionnel)" : "Child's first name (optional)"}</label>
              <input
                type="text"
                value={prenomEnfant}
                onChange={(e) => setPrenomEnfant(e.target.value)}
                placeholder={fr ? 'Saisissez son prénom' : "Enter child's first name"}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Demandes particulières / Commentaires' : 'Special requests / Comments'}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={fr ? "ex: Difficultés d'apprentissage, carnet scolaire précédent dispo." : "e.g., Learning difficulties, previous report card available."}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-brand-border/40 pt-4 flex justify-end shrink-0">
          <Button type="submit" variant="cta" className="px-8 py-3.5 text-sm font-bold shadow-md" disabled={loading}>
            <CheckCircle size={16} className="mr-1" />
            {loading ? (fr ? "Confirmation du créneau..." : "Booking...") : (fr ? "Planifier mon Entretien d'Excellence" : 'Book my Excellence Appointment')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
