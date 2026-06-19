
import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { Mail, Lock, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { signInNeon } from '../../lib/auth.ts';

interface LoginFormProps {
  onSuccess: (parentSession: any) => void;
  id?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, id }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<{ status?: number; raw?: string } | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // States
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const data = await signInNeon(email, telephone);
      const prospect = data?.prospect ?? data?.data?.prospect;
      if (prospect) {
        localStorage.setItem('parent_session', JSON.stringify(prospect));
        onSuccess(prospect);
      } else {
        throw new Error('Dossier introuvable.');
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects.");
      setDebug({ status: err.status, raw: err.raw });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const response = await fetch("/api/parent/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      setInfo("Un code d'accès temporaire a été généré dans le bac à sable de notifications (voir Menu Admin!). Loggez-vous à l'aide de vos coordonnées d'inscription.");
      setIsReset(false);
    } catch (err: any) {
      setError(err.message || "Aucun dossier trouvé associé à cette adresse e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={id} className="p-6 md:p-8 max-w-md w-full mx-auto select-none">
      <div className="text-center mb-6 border-b border-brand-border/40 pb-4">
        <h3 className="font-sans font-bold text-lg text-brand-blue-deep">
          {isReset ? "Réinitialiser mon accès" : "Connexion Espace Parent"}
        </h3>
        <p className="text-xs text-brand-muted mt-1 leading-normal">
          {isReset
            ? "Saisissez votre e-mail pour recevoir un code temporaire"
            : "Suivez votre dossier d'excellence pour Septembre 2026"}
        </p>
      </div>

      {error && (
        <div className="mb-4 space-y-2">
          <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-600 text-xs font-semibold leading-relaxed">
            {error}
          </div>
          {debug && (
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Debug Réponse serveur
              </p>
              {debug.status && (
                <p className="text-[10px] font-mono text-slate-400">
                  HTTP <span className="text-red-400 font-bold">{debug.status}</span>
                </p>
              )}
              {debug.raw && (
                <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
                  {debug.raw}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {info && (
        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 text-xs font-medium leading-relaxed">
          {info}
        </div>
      )}

      {!isReset ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Adresse e-mail du parent *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-brand-muted" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: mariam.kone@hotmail.com"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-brand-muted" size={14} />
              <input
                type="password"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Votre numéro de téléphone"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <span className="text-[10px] text-brand-muted mt-1.5 block leading-relaxed">
              Mot de passe initial = votre numéro de téléphone d'inscription (ex: +225 07 07 07 07 07)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-brand-blue-medium">
            <button
              type="button"
              onClick={() => setIsReset(true)}
              className="hover:text-brand-gold hover:underline transition-colors cursor-pointer"
            >
              Identifiants oubliés ?
            </button>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-2" disabled={loading}>
            Accéder à mon Espace <ArrowRight size={14} />
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5 font-sans">Adresse e-mail du parent *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-brand-muted" size={14} />
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

          <Button type="submit" variant="cta" className="w-full py-3" disabled={loading}>
            <Send size={13} className="mr-1" />
            {loading ? "Génération du code..." : "M'envoyer le code d'accès"}
          </Button>

          <button
            type="button"
            onClick={() => setIsReset(false)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-muted hover:text-brand-dark transition-colors py-2 mt-2 font-semibold cursor-pointer"
          >
            <ArrowLeft size={13} /> Retourner à la connexion
          </button>
        </form>
      )}
    </Card>
  );
};
