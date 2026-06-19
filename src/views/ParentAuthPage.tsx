import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShieldCheck, RefreshCw, ArrowRight, CheckCircle, BookOpen, GraduationCap, MessageCircle } from 'lucide-react';

/* ─── Design tokens charte EPV ───────────────────────────────────────────── */
const BLUE  = '#0D2E5C';
const BLUEM = '#1A4F8B';
const GOLD  = '#F5A623';
const GOLDC = '#FFD966';

/* ─── WhatsApp icon ─────────────────────────────────────────────────────────── */
function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.054-1.107l-.29-.172-2.952.838.87-2.875-.19-.298A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.425-.703-1.646-.783-.22-.08-.381-.12-.541.12-.16.24-.622.783-.763.944-.14.16-.281.18-.522.06-.241-.12-1.017-.375-1.937-1.195-.716-.638-1.2-1.426-1.341-1.666-.14-.241-.015-.371.106-.49.109-.108.241-.281.362-.422.12-.14.16-.241.24-.401.08-.16.04-.301-.02-.422-.06-.12-.541-1.305-.741-1.786-.195-.469-.394-.405-.541-.413l-.461-.008c-.16 0-.421.06-.642.301-.22.24-.841.822-.841 2.005s.861 2.326.981 2.487c.12.16 1.695 2.588 4.109 3.628.574.248 1.022.396 1.371.507.576.183 1.1.157 1.514.095.462-.069 1.425-.583 1.626-1.146.2-.562.2-1.044.14-1.146-.06-.1-.22-.16-.461-.281z"/>
    </svg>
  );
}

/* ─── Features list ─────────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: BookOpen,       text: 'Suivi scolaire en temps réel' },
  { Icon: MessageCircle,  text: 'Communication directe avec l\'école' },
  { Icon: GraduationCap,  text: 'Bulletins & résultats accessibles' },
  { Icon: ShieldCheck,    text: 'Accès sécurisé via WhatsApp OTP' },
];

/* ─── Left panel ────────────────────────────────────────────────────────────── */
function LeftPanel({ step, parentName }: { step: 'phone' | 'otp'; parentName: string }) {
  const firstName = parentName ? parentName.split(' ')[0] : '';
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-shrink-0 flex-col justify-between relative overflow-hidden py-14 px-14"
      style={{ background: `linear-gradient(150deg, ${BLUE} 0%, #081d3d 100%)` }}
    >
      {/* Lueur or en bas à gauche */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 65%)` }}
      />
      {/* Lueur bleue en haut à droite */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 65%)` }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="p-0.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${GOLD}, rgba(255,217,102,0.4))` }}>
          <img src="/img/logo.jpg" alt="EPV Horizons Savants"
            className="w-11 h-11 rounded-[10px] object-contain bg-white p-1.5 shadow-lg" />
        </div>
        <div>
          <p className="font-sans font-extrabold text-white text-sm leading-tight">EPV Horizons Savants</p>
          <p className="font-sans text-[10px] font-medium tracking-widest uppercase mt-0.5"
            style={{ color: `rgba(255,255,255,0.40)` }}>
            </p>
        </div>
      </motion.div>

      {/* Titre principal */}
      <div className="relative z-10 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 'phone' ? (
              <h1 className="font-sans font-extrabold text-white leading-[1.12]"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
                Votre enfant,<br />
                <span style={{ color: GOLD }}>notre priorité.</span>
              </h1>
            ) : (
              <h1 className="font-sans font-extrabold text-white leading-[1.12]"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
                {firstName
                  ? <>Bonjour,<br /><span style={{ color: GOLD }}>{firstName}.</span></>
                  : <>Bienvenue<br /><span style={{ color: GOLD }}>de retour.</span></>}
              </h1>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Séparateur or */}
        <div className="w-12 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLDC})` }} />

        <p className="font-sans text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.50)', maxWidth: '320px' }}>
          Accédez à l'espace dédié aux familles pour suivre le parcours scolaire de votre enfant au quotidien.
        </p>

        {/* Features */}
        <div className="space-y-3 pt-2">
          {FEATURES.map(({ Icon, text }, i) => (
            <motion.div key={text}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `rgba(245,166,35,0.12)` }}>
                <Icon size={15} style={{ color: GOLD }} />
              </div>
              <span className="font-sans text-xs font-medium" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badge sécurité bas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 flex items-center gap-2"
      >
        <ShieldCheck size={13} style={{ color: 'rgba(255,255,255,0.20)' }} />
      </motion.div>
    </div>
  );
}

/* ─── Mobile header ─────────────────────────────────────────────────────────── */
function MobileHeader() {
  return (
    <div className="lg:hidden flex items-center gap-3 px-6 pt-8 pb-6"
      style={{ background: BLUE }}>
      <div className="p-0.5 rounded-xl shrink-0"
        style={{ background: `linear-gradient(135deg, ${GOLD}, rgba(255,217,102,0.4))` }}>
        <img src="/img/logo.jpg" alt="EPV"
          className="w-9 h-9 rounded-[9px] object-contain bg-white p-1.5 shadow" />
      </div>
      <div>
        <p className="font-sans font-extrabold text-white text-sm leading-tight">EPV Horizons Savants</p>
        <p className="font-sans text-[9px] font-medium tracking-widest uppercase mt-0.5"
          style={{ color: 'rgba(255,255,255,0.40)' }}>
        </p>
      </div>
    </div>
  );
}

/* ─── Phone input ───────────────────────────────────────────────────────────── */
function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative rounded-2xl border-2 transition-all duration-200"
      style={{
        borderColor: focused ? BLUE : '#E5E7EB',
        background: focused ? '#FAFBFF' : '#F9FAFB',
        boxShadow: focused ? `0 0 0 4px rgba(13,46,92,0.08)` : 'none',
      }}>
      <input
        type="tel" required autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="+225 07 78 98 14 56"
        className="w-full bg-transparent border-0 focus:outline-none font-sans text-sm font-medium"
        style={{ color: BLUE, padding: '14px 16px' }}
      />
    </div>
  );
}

/* ─── OTP boxes ─────────────────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange, onComplete }: {
  value: string[]; onChange: (v: string[]) => void; onComplete: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next  = [...value];
    next[i]     = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (digit && i === 5 && next.join('').length === 6) setTimeout(onComplete, 80);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted.length) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(onComplete, 80);
  };

  const boxStyle = (i: number, d: string): React.CSSProperties => {
    if (focusedIdx === i) return {
      borderColor: BLUE,
      background: '#EEF4FF',
      color: BLUE,
      boxShadow: `0 0 0 3px rgba(13,46,92,0.10)`,
      transform: 'translateY(-2px)',
    };
    if (d) return {
      borderColor: BLUE,
      background: BLUE,
      color: 'white',
      boxShadow: `0 4px 12px rgba(13,46,92,0.22)`,
    };
    return { borderColor: '#E5E7EB', background: '#F9FAFB', color: BLUE };
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {value.map((d, i) => (
        <input key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={() => setFocusedIdx(i)}
          onBlur={() => setFocusedIdx(null)}
          className="border-2 rounded-xl focus:outline-none transition-all duration-150
                     text-center text-xl font-bold font-sans"
          style={{ width: '48px', height: '56px', ...boxStyle(i, d) }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/* ─── Alert ─────────────────────────────────────────────────────────────────── */
function Alert({ type, msg }: { type: 'error' | 'info' | 'success'; msg: string }) {
  const cfg = {
    error:   { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)',  text: '#B91C1C',  bar: '#F87171' },
    info:    { bg: 'rgba(13,46,92,0.05)',   border: 'rgba(13,46,92,0.14)',   text: '#1A4F8B',  bar: '#4A90D9' },
    success: { bg: 'rgba(45,140,60,0.06)',  border: 'rgba(45,140,60,0.18)',  text: '#166534',  bar: '#2D8C3C' },
  }[type];
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: cfg.bar }} />
      <p className="font-sans text-xs flex-1 leading-relaxed" style={{ color: cfg.text }}>{msg}</p>
    </motion.div>
  );
}

/* ─── Resend timer ──────────────────────────────────────────────────────────── */
function ResendTimer({ onResend, loading }: { onResend: () => void; loading: boolean }) {
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const reset = () => { setSeconds(60); onResend(); };
  return (
    <div className="text-center">
      {seconds > 0 ? (
        <p className="font-sans text-[11px]" style={{ color: '#9CA3AF' }}>
          Renvoyer dans <span className="font-bold" style={{ color: '#6B7280' }}>{seconds}s</span>
        </p>
      ) : (
        <button type="button" onClick={reset} disabled={loading}
          className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold transition-colors cursor-pointer"
          style={{ color: BLUE }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Renvoyer un nouveau code
        </button>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
interface ParentAuthPageProps {
  onSuccess: (session: any) => void;
  onBack: () => void;
}

export const ParentAuthPage: React.FC<ParentAuthPageProps> = ({ onSuccess, onBack }) => {
  const [step,       setStep]       = useState<'phone' | 'otp'>('phone');
  const [telephone,  setTelephone]  = useState('');
  const [parentName, setParentName] = useState('');
  const [otp,        setOtp]        = useState(Array(6).fill(''));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!telephone.trim()) return;
    setError(null); setInfo(null); setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim() }),
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      setParentName(data.name || '');
      setStep('otp');
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      setError(err instanceof TypeError
        ? 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        : (err.message || "Erreur lors de l'envoi du code."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = useCallback(async (digits?: string[]) => {
    const code = (digits ?? otp).join('');
    if (code.length < 6) return;
    setError(null); setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim(), otp: code }),
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      if (data.token) sessionStorage.setItem('neon_auth_token', data.token);
      const kids = data.children || [data.prospect];
      localStorage.setItem('parent_session',  JSON.stringify(data.prospect));
      localStorage.setItem('parent_children', JSON.stringify(kids));
      onSuccess(data.prospect);
    } catch (err: any) {
      setError(err instanceof TypeError
        ? 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        : (err.message || 'Code invalide.'));
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  }, [otp, telephone, onSuccess]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ background: BLUE }}>

      {/* Mobile header */}
      <MobileHeader />

      {/* ── LEFT PANEL ── */}
      <LeftPanel step={step} parentName={parentName} />

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 bg-white relative flex flex-col items-center justify-center
                   rounded-t-[32px] -mt-6 lg:mt-0 lg:rounded-none
                   min-h-[74vh] lg:min-h-screen
                   px-6 py-12 lg:px-16 lg:py-0"
      >
        {/* Subtle gold accent top right corner */}
        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: `radial-gradient(circle at 100% 0%, rgba(245,166,35,0.07) 0%, transparent 65%)` }} />

        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.30 }}
          onClick={step === 'otp'
            ? () => { setStep('phone'); setError(null); setOtp(Array(6).fill('')); }
            : onBack}
          className="absolute top-5 left-5 lg:left-8 flex items-center gap-2 font-sans
                     text-xs font-semibold transition-all duration-200 group cursor-pointer
                     px-3 py-2 rounded-xl border"
          style={{
            color: BLUE,
            background: '#F4F8FF',
            borderColor: '#E5E7EB',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = BLUE;
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
            (e.currentTarget as HTMLButtonElement).style.borderColor = BLUE;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#F4F8FF';
            (e.currentTarget as HTMLButtonElement).style.color = BLUE;
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB';
          }}
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {step === 'otp' ? 'Changer de numéro' : 'Retour au site'}
        </motion.button>

        {/* Form container */}
        <div className="w-full max-w-[380px]">

          {/* Step indicators */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.40 }}
            className="flex items-center gap-2 mb-10"
          >
            {(['phone', 'otp'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 font-sans"
                    style={{
                      background: (step === s || (i === 0 && step === 'otp')) ? BLUE : '#F4F8FF',
                      color: (step === s || (i === 0 && step === 'otp')) ? 'white' : '#C0CAD8',
                      fontSize: '9px', fontWeight: 700,
                      border: (step === s || (i === 0 && step === 'otp')) ? 'none' : `1.5px solid #E5E7EB`,
                    }}>
                    {i === 0 && step === 'otp'
                      ? <CheckCircle size={13} />
                      : <span>{i + 1}</span>}
                  </div>
                  <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.26em]"
                    style={{ color: '#6B7280' }}>
                    {i === 0 ? 'Téléphone' : 'Code'}
                  </span>
                </div>
                {i === 0 && (
                  <div className="flex-1 max-w-[28px] h-px transition-all duration-500"
                    style={{ background: step === 'otp' ? `${BLUE}50` : '#E5E7EB' }} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mb-8"
            >
              {step === 'phone' ? (
                <>
                  <h1 className="font-sans font-extrabold text-3xl leading-tight mb-2"
                    style={{ color: BLUE, letterSpacing: '-0.02em' }}>
                    Espace Parent
                  </h1>
                  <p className="font-sans text-sm font-normal leading-relaxed"
                    style={{ color: '#2C2C2C' }}>
                    Entrez votre numéro WhatsApp pour recevoir<br />
                    votre code de connexion sécurisé.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-sans font-extrabold text-3xl leading-tight mb-2"
                    style={{ color: BLUE, letterSpacing: '-0.02em' }}>
                    Vérification
                  </h1>
                  <p className="font-sans text-sm font-normal leading-relaxed"
                    style={{ color: '#2C2C2C' }}>
                    Entrez le code à 6 chiffres envoyé via<br />
                    WhatsApp sur votre téléphone.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Alerts */}
          <AnimatePresence>
            {error && <div className="mb-5"><Alert type="error" msg={error} /></div>}
            {info  && <div className="mb-5"><Alert type="info"  msg={info}  /></div>}
          </AnimatePresence>

          {/* ── STEP 1 : Phone ── */}
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.form key="phone-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="block font-sans text-[9px] font-bold uppercase tracking-[0.30em]"
                    style={{ color: BLUE }}>
                    Numéro WhatsApp
                  </label>
                  <PhoneInput value={telephone} onChange={setTelephone} />
                  <p className="font-sans text-[10px]" style={{ color: '#6B7280' }}>
                    Numéro enregistré lors de votre inscription (ex : +225 07 78 98 14 56)
                  </p>
                </div>

                {/* CTA WhatsApp */}
                <motion.button type="submit"
                  disabled={loading || !telephone.trim()}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full flex items-center justify-center gap-2.5 font-sans text-sm font-semibold
                             text-white transition-all duration-200 disabled:opacity-50
                             disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: loading || !telephone.trim()
                      ? '#22c55e'
                      : 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                    boxShadow: loading || !telephone.trim()
                      ? 'none'
                      : '0 6px 20px rgba(34,197,94,0.28)',
                    borderRadius: '100px',
                    padding: '14px 24px',
                  }}
                >
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                        Envoi en cours…</>
                    : <><WhatsAppIcon size={15} /> Recevoir mon code WhatsApp</>}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: '#F0F2F8' }} />
                  <span className="font-sans text-[8px] uppercase tracking-[0.30em]"
                    style={{ color: '#9CA3AF' }}>
                    Authentification sécurisée
                  </span>
                  <div className="h-px flex-1" style={{ background: '#F0F2F8' }} />
                </div>
              </motion.form>
            )}

            {/* ── STEP 2 : OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                {/* Badge WhatsApp envoyé */}
                <div className="flex items-center gap-3 py-3 px-4 rounded-2xl"
                  style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.18)' }}>
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0
                                  shadow-[0_3px_10px_rgba(37,211,102,0.35)]">
                    <WhatsAppIcon size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-[11px] font-bold" style={{ color: '#166534' }}>Code envoyé ✓</p>
                    <p className="font-sans text-[10px]" style={{ color: 'rgba(22,101,52,0.55)' }}>{telephone}</p>
                  </div>
                </div>

                {/* OTP inputs */}
                <OtpBoxes value={otp} onChange={setOtp} onComplete={() => handleVerifyOtp()} />

                {/* CTA Verify */}
                <motion.button type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join('').length < 6}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full flex items-center justify-center gap-2.5 font-sans text-sm font-semibold
                             text-white transition-all duration-200 disabled:opacity-50
                             disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: loading || otp.join('').length < 6
                      ? BLUE
                      : `linear-gradient(135deg, ${BLUE} 0%, ${BLUEM} 100%)`,
                    boxShadow: loading || otp.join('').length < 6
                      ? 'none'
                      : `0 6px 20px rgba(13,46,92,0.25)`,
                    borderRadius: '100px',
                    padding: '14px 24px',
                  }}
                >
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                        Vérification…</>
                    : <>Accéder à mon espace <ArrowRight size={14} /></>}
                </motion.button>

                <ResendTimer onResend={handleSendOtp} loading={loading} />

                <p className="text-center font-sans text-[9px]" style={{ color: '#9CA3AF' }}>
                  Le code expire dans <span className="font-semibold" style={{ color: '#6B7280' }}>10 minutes</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="absolute bottom-5 hidden lg:block font-sans text-[8px] uppercase tracking-[0.28em]"
          style={{ color: '#D1D5DB' }}>
          EPV Horizons Savants · Abidjan © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};
