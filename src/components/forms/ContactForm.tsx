
import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { Mail, Phone, User, MessageSquare, Send } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext.tsx';

interface ContactFormProps {
  onSuccess: (message: string) => void;
  id?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, id }) => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [objet, setObjet] = useState("Information générale");
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          email,
          telephone,
          objet,
          message
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send inquiry.");
      }

      onSuccess(fr ? "Votre message de contact a bien été transmis au secrétariat académique d'Abidjan. Nous reviendrons vers vous sous 24h." : "Your message has been sent to our academic secretariat in Abidjan. We will reply within 24 hours.");
      // reset
      setNom("");
      setEmail("");
      setTelephone("");
      setMessage("");
    } catch (err) {
      onSuccess(fr ? "Message envoyé avec succès ! Notre secrétariat d'Abidjan vous contactera très rapidement." : "Message sent successfully! Our Abidjan secretariat will contact you very shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={id} className="p-6 md:p-8">
      <h3 className="font-sans font-bold text-lg text-brand-blue-deep mb-5">
        {fr ? 'Envoyer un Message au Secrétariat' : 'Send a Message to the Secretariat'}
      </h3>

      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Nom et Prénom *' : 'Full Name *'}</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-brand-muted" size={13} />
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Dr. Aimé Koffi"
              className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Email de contact *' : 'Contact email *'}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-brand-muted" size={13} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.adresse@domain.com"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Téléphone mobile (CIV) *' : 'Mobile phone (CIV) *'}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-brand-muted" size={13} />
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="ex: +225 05 00 00 00 00"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Objet de votre demande *' : 'Subject of your request *'}</label>
          <select
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
          >
            <option value="Information générale">{fr ? 'Renseignements généraux / Tarifs' : 'General information / Fees'}</option>
            <option value="Recrutement">{fr ? "Postuler aux offres d'emploi (Enseignant d'Élite)" : 'Apply for a job (Elite Teacher)'}</option>
            <option value="Partenariat">{fr ? 'Partenariats scolaires ou associatifs' : 'School or associative partnerships'}</option>
            <option value="Autre">{fr ? 'Autre demande administrative' : 'Other administrative request'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">{fr ? 'Votre Message *' : 'Your Message *'}</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-brand-muted" size={13} />
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={fr ? "Saisissez en détail votre demande..." : "Describe your request in detail..."}
              className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <Send size={14} className="mr-1" />
          {loading ? (fr ? "Transmission en cours..." : "Sending...") : (fr ? "Transmettre ma demande" : "Send my request")}
        </Button>
      </form>
    </Card>
  );
};
