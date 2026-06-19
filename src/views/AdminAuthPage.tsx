
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { signInNeon } from '../lib/auth.ts';

interface AdminAuthPageProps {
  onSuccess: (session: any) => void;
  onBack: () => void;
}

/* Champ underline minimaliste, ligne dorée au focus */
function UnderlineInput({
  label, type = 'text', value, onChange, placeholder, children
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1">
      <motion.label
        animate={{ color: focused ? '#F5A623' : 'rgba(255,255,255,0.4)' }}
        transition={{ duration: 0.2 }}
        className="block text-[10px] font-sans uppercase tracking-[0.22em]"
      >
        {label}
      </motion.label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent border-0 border-b py-2.5 pr-10 text-white text-sm font-sans
                     placeholder:text-white/20 focus:outline-none transition-colors"
          style={{ borderBottomColor: focused ? '#F5A623' : 'rgba(255,255,255,0.12)' }}
        />
        {/* Ligne d'illumination */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'center', width: '100%' }}
        />
        {children}
      </div>
    </div>
  );
}

/* Notification d'erreur élégante */
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 backdrop-blur-sm"
    >
      <div className="w-1 self-stretch rounded-full bg-red-400/60 flex-shrink-0" />
      <p className="text-red-300/90 text-xs font-sans flex-1 leading-relaxed">{message}</p>
      <button onClick={onDismiss} className="text-red-400/50 hover:text-red-400 transition-colors text-lg leading-none -mt-0.5 cursor-pointer">×</button>
    </motion.div>
  );
}

/* Bouton simple doré */
function GoldButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3.5 rounded-xl text-[#0D2E5C] font-sans font-bold text-sm
                 uppercase tracking-wide transition-all disabled:opacity-50 cursor-pointer
                 hover:opacity-90 active:scale-[0.99]"
      style={{ background: '#F5A623' }}
    >
      {children}
    </button>
  );
}

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({ onSuccess, onBack }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await signInNeon(email, password);
      if (!data?.token) throw new Error('Authentification échouée.');
      localStorage.setItem('is_admin', 'true');
      onSuccess({ role: 'admin', email });
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #0A1929 0%, #0D2E5C 100%)' }}>

      {/* Bouton retour */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/35 hover:text-white/70
                   text-[10px] font-sans uppercase tracking-[0.22em] transition-colors group cursor-pointer"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour
      </motion.button>

      {/* Carte Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}
        >
          {/* Reflet subtil en haut */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="font-sans font-extrabold text-xl text-white uppercase tracking-[0.08em] mb-1">
              Portail Administrateur
            </h1>
            <p className="text-white/35 text-[11px] font-sans">
              Accès réservé à l'administration EPV
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <ErrorToast key="err" message={error} onDismiss={() => setError(null)} />
              )}
            </AnimatePresence>

            <UnderlineInput label="Email administrateur" type="email" value={email} onChange={setEmail} placeholder="admin@epv.ci" />

            <UnderlineInput label="Mot de passe" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••">
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-0 top-2 text-white/25 hover:text-white/60 transition-colors cursor-pointer"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </UnderlineInput>

            <div className="pt-2">
              <GoldButton disabled={loading}>
                {loading ? 'Vérification...' : 'Accéder au système'}
              </GoldButton>
            </div>
          </form>
        </div>

        <p className="text-center text-[8px] text-white/15 font-sans uppercase tracking-widest mt-5">
          EPV Horizons Savants Abidjan © {new Date().getFullYear()}
        </p>
      </motion.div>

    </div>
  );
};
