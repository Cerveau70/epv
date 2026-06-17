
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/auth.ts';
import { motion, AnimatePresence } from 'motion/react';
import { AppointmentForm }  from '../components/forms/AppointmentForm.tsx';
import { Badge }            from '../components/ui/Badge.tsx';
import { Toast }            from '../components/ui/Toast.tsx';
import { Prospect, RendezVous, StatutProspect, StatutRendezVous } from '../types.js';
import {
  LayoutGrid, BookOpen, Utensils, FolderOpen, MessageSquare, Gift,
  LogOut, Menu, X, ChevronRight, Check, ArrowLeft, Bell,
  GraduationCap, User, Calendar, Bus, Heart, Download,
  TrendingUp, CreditCard, Send, Phone, Mail, MapPin,
  Activity, Shield, Settings, FileText, AlertTriangle,
  CheckCircle, Clock, Copy, Share2, Lock, Smartphone,
  Sliders, BarChart2, Minus, Paperclip, Eye, EyeOff,
  ChevronDown, Users, Wallet, BookMarked, Info, Award
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ParentTab =
  | 'dashboard'
  | 'parcours'
  | 'bulletins'
  | 'vie'
  | 'finances'
  | 'messagerie'
  | 'parrainage'
  | 'profil';

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTION_LABEL: Record<string, string> = {
  PS:'Petite Section', MS:'Moyenne Section', GS:'Grande Section',
  CP1:'CP1 (CPI)', CP2:'CP2 (CPII)', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};

const STATUT_STEP = (s: StatutProspect) =>
  s === StatutProspect.INSCRIT ? 4 : s === StatutProspect.PRE_INSCRIT ? 2 : 1;

const STEPS = [
  { label: 'Pré-inscription',  Icon: FileText },
  { label: 'Évaluation',       Icon: Users },
  { label: 'Documents',        Icon: CheckCircle },
  { label: 'Inscrit',          Icon: GraduationCap },
];

const TARIFS_DEFAUT: Record<string, number> = {
  PS:1350000, MS:1350000, GS:1350000,
  CP1:1650000, CP2:1650000, CE1:1650000, CE2:1650000,
  CM1:1880000, CM2:1880000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR') + ' FCFA';

const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('fr-FR', opts || { day: 'numeric', month: 'long', year: 'numeric' });

const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const toNum = (v: any) => Number(v) || 0;
const fmtN  = (v: any, dec = 1) => v != null && v !== '' ? Number(v).toFixed(dec) : '—';

const avg = (notes: any[], key: 't1' | 't2') => {
  if (!notes.length) return '—';
  const total = notes.reduce((s: number, n: any) => s + toNum(n[key]) * toNum(n.coef), 0);
  const coef  = notes.reduce((s: number, n: any) => s + toNum(n.coef), 0);
  return coef > 0 ? (total / coef).toFixed(2) : '—';
};

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-lg ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-[#F4F8FF] flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[#2C2C2C]">{title}</h3>
        {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, sub, Icon, accent = false }: {
  label: string; value: string | number; sub?: string;
  Icon: React.FC<any>; accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-bold mt-1.5 ${accent ? 'text-[#F5A623]' : 'text-[#2C2C2C]'}`}>{value}</p>
          {sub && <p className="text-xs text-[#6B7280] mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-md bg-[#F9FAFB] border border-[#F4F8FF] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#6B7280]" />
        </div>
      </div>
    </Card>
  );
}

function SubTabNav<T extends string>({
  tabs, active, onChange
}: { tabs: { id: T; label: string }[]; active: T; onChange: React.Dispatch<React.SetStateAction<T>> | ((t: T) => void) }) {
  return (
    <div className="flex gap-1 border-b border-[#E5E7EB] mb-6">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${active === t.id
              ? 'border-[#0D2E5C] text-[#0D2E5C]'
              : 'border-transparent text-[#6B7280] hover:text-slate-700'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    payée: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirme: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    planifie: 'bg-blue-50 text-blue-700 border-blue-200',
    annule: 'bg-red-50 text-red-600 border-red-200',
    fait: 'bg-[#F9FAFB] text-slate-500 border-[#E5E7EB]',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const labels: Record<string, string> = {
    payée: 'Payée', en_attente: 'En attente',
    confirme: 'Confirmé', planifie: 'Planifié',
    annule: 'Annulé', fait: 'Effectué',
    done: 'Fait', pending: 'À faire',
  };
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${map[statut] || map.planifie}`}>
      {labels[statut] || statut}
    </span>
  );
}

function MiniLineChart({ values, color = '#0D2E5C' }: { values: number[]; color?: string }) {
  const W = 96; const H = 32; const PAD = 4;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - 2 * PAD),
    y: H - PAD - ((v - min) / range) * (H - 2 * PAD),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />)}
    </svg>
  );
}

function ProgressBar({ value, max = 100, color = '#0D2E5C' }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#F4F8FF] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
      </div>
      <span className="text-[11px] font-mono font-semibold text-[#6B7280] w-8 text-right">{pct}%</span>
    </div>
  );
}

function SectionPage({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="mb-1">
        <h1 className="text-base font-semibold text-[#2C2C2C]">{title}</h1>
        {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

function DashboardTab({ session, appointments, devoirs, cantine, notes, absences, messages, evenements, paiements, reduction, tarifs, onTabChange }: {
  session: Prospect; appointments: RendezVous[];
  devoirs: any[]; cantine: any[]; notes: any[]; absences: any[]; messages: any[]; evenements: any[];
  paiements: any[]; reduction: number; tarifs: Record<string,number>;
  onTabChange: (t: ParentTab) => void;
}) {
  const nextRdv    = appointments
    .filter(r => r.statut !== StatutRendezVous.ANNULE && new Date(r.dateHeure) >= new Date())
    .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure))[0];

  const avgT2      = avg(notes, 't2');
  const pendingHW  = devoirs.filter(d => d.statut === 'pending').length;
  const todayIdx   = new Date().getDay();
  const todayMenu  = cantine[Math.max(0, Math.min(todayIdx - 1, 4))];
  const unreadMsg  = messages.filter(m => !m.lu).length;

  // Solde réel : annuel avec réduction parrainage - total déjà payé
  const annuel  = tarifs[session.sectionVisee] || TARIFS_DEFAUT[session.sectionVisee] || 1500000;
  const annuelReduit = Math.round(annuel * (1 - reduction / 100));
  const totalPaye = paiements
    .filter(p => ['T1','T2','T3'].includes(p.trimestre))
    .reduce((s: number, p: any) => s + Number(p.montant), 0);
  const soldeDu = Math.max(0, annuelReduit - totalPaye);

  return (
    <SectionPage
      title={`Tableau de bord — ${session.prenomParent} ${session.nomParent[0]}.`}
      sub={`${todayLabel()} · Dossier de ${session.prenomEnfant} ${session.nomEnfant}, ${SECTION_LABEL[session.sectionVisee] || session.sectionVisee}`}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Moyenne générale" value={`${avgT2}/20`} sub="2e trimestre · Coefficient total 16" Icon={BarChart2} />
        <KpiCard label="Assiduité" value="97 %" sub={`${absences.length} absence${absences.length>1?'s':''} enregistrée${absences.length>1?'s':''}`} Icon={Activity} />
        <KpiCard label="Devoirs en cours" value={pendingHW} sub={`sur ${devoirs.length} exercices assignés`} Icon={BookOpen} />
        <KpiCard label="Solde en attente" value={fmtMoney(soldeDu)}
          sub={reduction > 0 ? `Réduction parrainage ${reduction}% appliquée` : 'Scolarité année en cours'}
          Icon={CreditCard} accent />
      </div>

      {/* Row 2: Notes progression + RDV/Événements */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Progression notes */}
        <Card>
          <CardHeader title="Progression académique" sub="Comparatif T1 → T2 par matière"
            action={
              <button onClick={() => onTabChange('parcours')}
                className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
                Détail <ChevronRight size={13} />
              </button>
            }
          />
          <div className="p-5 space-y-3">
            {notes.map((n: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
                <span className="text-xs text-[#6B7280] truncate">{n.matiere}</span>
                <span className="text-[11px] font-mono text-[#6B7280] tabular-nums w-8 text-right">{n.t1}</span>
                <MiniLineChart values={[n.t1, n.t2 || n.t1]} color={(n.t2||n.t1) >= n.t1 ? '#059669' : '#DC2626'} />
                <span className="text-[11px] font-mono font-semibold text-[#2C2C2C] tabular-nums w-8 text-right">{n.t2 ?? '—'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Prochains RDV + Événements */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Prochain rendez-vous" />
            <div className="p-5">
              {nextRdv ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-[#0D2E5C] flex flex-col items-center justify-center text-white shrink-0">
                    <span className="font-bold text-base leading-none">{new Date(nextRdv.dateHeure).getDate()}</span>
                    <span className="text-[9px] text-white/60 uppercase mt-0.5">
                      {new Date(nextRdv.dateHeure).toLocaleString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#2C2C2C]">{nextRdv.typeRdv}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(nextRdv.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · 30 min
                    </p>
                    <div className="mt-2"><StatusBadge statut={nextRdv.statut} /></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#6B7280]">Aucun rendez-vous planifié.</p>
                  <button onClick={() => onTabChange('finances')}
                    className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer">
                    Prendre RDV
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Agenda — Prochains événements" />
            <div className="divide-y divide-[#F9FAFB]">
              {evenements.slice(0, 3).map((e: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-[#F9FAFB] border border-[#F4F8FF] flex flex-col items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-[#2C2C2C] leading-none">{new Date(e.date).getDate()}</span>
                    <span className="text-[8px] text-[#6B7280] uppercase">
                      {new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2C2C2C] truncate">{e.titre}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{e.heure} · {e.lieu}</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#6B7280] shrink-0">{e.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Cantine + Assiduité */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Cantine — menu du jour */}
        <Card>
          <CardHeader title="Menu de la cantine — semaine en cours"
            action={
              <button onClick={() => onTabChange('vie')}
                className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
                Semaine complète <ChevronRight size={13} />
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F4F8FF]">
                  <th className="text-left px-5 py-2.5 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">Jour</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">Plat principal</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide hidden sm:table-cell">Dessert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {cantine.map((c: any, i: number) => {
                  const isToday = c.jour === ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
                  return (
                    <tr key={i} className={isToday ? 'bg-[#F9FAFB]' : ''}>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${isToday ? 'text-[#0D2E5C]' : 'text-[#6B7280]'}`}>{c.jour}</span>
                        {isToday && <span className="ml-2 text-[9px] font-bold text-[#F5A623] uppercase">Aujourd'hui</span>}
                      </td>
                      <td className="px-3 py-3 text-[#6B7280]">{c.plat}</td>
                      <td className="px-3 py-3 text-[#6B7280] hidden sm:table-cell">{c.dessert}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assiduité résumé */}
        <Card>
          <CardHeader title="Assiduité — Année scolaire 2025/2026" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Taux de présence', value: '97,2 %', color: 'text-emerald-700' },
                { label: 'Absences',          value: `${absences.filter((a:any)=>a.type==='Absence').length}`,  color: 'text-[#2C2C2C]' },
                { label: 'Retards',           value: `${absences.filter((a:any)=>a.type==='Retard').length}`,   color: 'text-[#2C2C2C]' },
              ].map(s => (
                <div key={s.label} className="bg-[#F9FAFB] rounded-md p-3 border border-[#F4F8FF]">
                  <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-[#6B7280] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">Dernières absences</p>
              {absences.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-[#6B7280]">{fmtDate(a.date, { day:'numeric', month:'short' })} — {a.motif}</span>
                  <StatusBadge statut={a.type === 'Absence' ? 'annule' : 'en_attente'} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Messages non lus */}
      {unreadMsg > 0 && (
        <Card className="border-l-4 border-l-[#0D2E5C]">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-[#0D2E5C]" />
              <p className="text-sm font-semibold text-[#2C2C2C]">
                {unreadMsg} message{unreadMsg > 1 ? 's' : ''} non lu{unreadMsg > 1 ? 's' : ''} dans votre messagerie
              </p>
            </div>
            <button onClick={() => onTabChange('messagerie')}
              className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
              Consulter <ChevronRight size={13} />
            </button>
          </div>
        </Card>
      )}
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARCOURS ACADÉMIQUE
// ════════════════════════════════════════════════════════════════════════════

function ParcoursTab({ session, devoirs, setDevoirs, notes, absences, bilinguisme }: {
  session: Prospect; devoirs: any[]; setDevoirs: React.Dispatch<React.SetStateAction<any[]>>;
  notes: any[]; absences: any[]; bilinguisme: any | null;
}) {
  type Sub = 'cahier' | 'resultats' | 'bilingue' | 'assiduite';
  const [sub, setSub] = useState<Sub>('resultats');

  const toggleDevoir = async (i: number) => {
    const d = devoirs[i];
    if (!d) return;
    const next = d.statut === 'done' ? 'pending' : 'done';
    await apiFetch(`/api/devoirs/${d.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ statut: next }) });
    setDevoirs(prev => prev.map((x, j) => j === i ? { ...x, statut: next } : x));
  };

  const competences: { competence: string; niveau: number }[] = bilinguisme?.competences || [];

  return (
    <SectionPage title="Parcours académique"
      sub={`${session.prenomEnfant} ${session.nomEnfant} · ${SECTION_LABEL[session.sectionVisee] || session.sectionVisee} · Rentrée 2026`}>

      <SubTabNav
        tabs={[
          { id: 'resultats', label: 'Résultats & Bulletins' },
          { id: 'cahier',    label: 'Cahier de textes'      },
          { id: 'bilingue',  label: 'Progression bilingue'  },
          { id: 'assiduite', label: 'Assiduité'             },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'resultats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '1er trimestre',  val: avg(notes, 't1'), sub: 'Moyenne pondérée' },
                  { label: '2e trimestre',   val: avg(notes, 't2'), sub: 'Moyenne pondérée' },
                  { label: '3e trimestre',   val: '—',                  sub: 'En cours' },
                ].map(s => (
                  <Card key={s.label} className="p-5 text-center">
                    <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">{s.label}</p>
                    <p className="text-3xl font-bold text-[#2C2C2C] mt-2">{s.val !== '—' ? `${s.val}` : '—'}</p>
                    {s.val !== '—' && <p className="text-[10px] text-[#6B7280] mt-0.5">sur 20</p>}
                    <p className="text-[10px] text-[#6B7280] mt-1">{s.sub}</p>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="Détail des notes par matière" sub="Coefficient de pondération appliqué" />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                        {['Matière', 'Coef.', '1er Trimestre', '2e Trimestre', 'Évolution'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F9FAFB]">
                      {notes.map((n: any, i: number) => {
                        const t1 = toNum(n.t1); const t2 = toNum(n.t2);
                        const up = t2 > t1;
                        return (
                          <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-5 py-3.5 font-medium text-[#2C2C2C]">{n.matiere}</td>
                            <td className="px-5 py-3.5 text-[#6B7280] text-center">{n.coef}</td>
                            <td className="px-5 py-3.5 font-mono text-[#6B7280] tabular-nums">{fmtN(n.t1)}</td>
                            <td className="px-5 py-3.5 font-mono font-semibold text-[#2C2C2C] tabular-nums">{fmtN(n.t2)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {up ? '+' : ''}{(t2 - t1).toFixed(1)} pt
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-[#F4F8FF] flex items-center justify-between">
                  <p className="text-xs text-[#6B7280]">Bulletin officiel — Année scolaire 2025/2026</p>
                  <button onClick={() => {
                    const w = window.open('', '_blank', 'width=800,height=900');
                    if (!w) return;
                    const avgT1 = avg(notes, 't1');
                    const avgT2 = avg(notes, 't2');
                    w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
                    <title>Bulletin — ${session.prenomEnfant} ${session.nomEnfant}</title>
                    <style>body{font-family:Georgia,serif;padding:40px;max-width:720px;margin:0 auto;color:#0D2E5C}
                    h1{font-size:22px;border-bottom:3px solid #0D2E5C;padding-bottom:8px}
                    h2{font-size:14px;color:#1A4F8B;margin-top:24px}
                    table{width:100%;border-collapse:collapse;margin-top:12px}
                    th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:13px}
                    th{background:#0D2E5C;color:white;font-weight:bold}
                    tr:nth-child(even){background:#f8faff}
                    .avg{font-size:18px;font-weight:bold;text-align:center;padding:12px;background:#EFF6FF;border-radius:8px;margin:16px 0}
                    .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:16px}
                    @media print{button{display:none}}</style></head><body>
                    <h1>Bulletin de Notes — EPV Horizons Savants</h1>
                    <p><strong>Élève :</strong> ${session.prenomEnfant} ${session.nomEnfant} &nbsp;|&nbsp;
                    <strong>Classe :</strong> ${SECTION_LABEL[session.sectionVisee] || session.sectionVisee} &nbsp;|&nbsp;
                    <strong>Année :</strong> 2025/2026</p>
                    <p><strong>Responsable :</strong> ${session.prenomParent} ${session.nomParent}</p>
                    <div class="avg">Moyenne générale T1 : ${avgT1}/20 &nbsp;&nbsp; T2 : ${avgT2}/20</div>
                    <h2>Détail par matière</h2>
                    <table><tr><th>Matière</th><th>Coef.</th><th>T1 /20</th><th>T2 /20</th><th>Évolution</th></tr>
                    ${notes.map(n => `<tr><td>${n.matiere}</td><td style="text-align:center">${n.coef}</td>
                    <td style="text-align:center">${n.t1}</td><td style="text-align:center">${n.t2 ?? '—'}</td>
                    <td style="text-align:center;color:${(n.t2||n.t1)>=n.t1?'green':'red'}">${n.t2?(n.t2-n.t1>0?'+':''+(n.t2-n.t1).toFixed(1)):''}</td></tr>`).join('')}
                    </table>
                    <div class="footer">EPV Horizons Savants ·Bingerville, Ave Konan Kouassi Lambert 38, Abidjan · Imprimé le ${new Date().toLocaleDateString('fr-FR')}</div>
                    <br><button onclick="window.print()" style="padding:10px 20px;background:#0D2E5C;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px">Imprimer</button>
                    </body></html>`);
                    w.document.close();
                  }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0D2E5C] text-white text-[10px] font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                    <Download size={11} /> Télécharger / Imprimer
                  </button>
                </div>
              </Card>
            </div>
          )}

          {sub === 'cahier' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">
                  Semaine du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
                <span className="text-xs font-semibold text-amber-700">
                  {devoirs.filter(d => d.statut === 'pending').length} devoir{devoirs.filter(d=>d.statut==='pending').length>1?'s':''} en attente
                </span>
              </div>
              <Card>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                      {['Matière', 'Travail demandé', 'À rendre', 'Statut'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9FAFB]">
                    {devoirs.map((d, i) => (
                      <tr key={i} className={`hover:bg-[#F9FAFB] transition-colors ${d.statut==='done'?'opacity-60':''}`}>
                        <td className="px-5 py-3.5 font-semibold text-slate-700 whitespace-nowrap">{d.matiere}</td>
                        <td className="px-5 py-3.5 text-[#6B7280] max-w-xs">{d.sujet}</td>
                        <td className="px-5 py-3.5 text-[#6B7280] whitespace-nowrap">{d.rendu}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => toggleDevoir(i)}
                            className="flex items-center gap-1.5 cursor-pointer">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                              ${d.statut==='done'?'bg-emerald-500 border-emerald-500':'bg-white border-slate-300'}`}>
                              {d.statut==='done' && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <StatusBadge statut={d.statut} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {sub === 'bilingue' && (
            <div className="space-y-4">
              {competences.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookMarked size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-[#6B7280]">Aucune donnée de progression bilingue disponible pour le moment.</p>
                </Card>
              ) : (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-[#2C2C2C]">Niveau de progression en anglais</h3>
                      {bilinguisme?.niveau && (
                        <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">Niveau CECRL estimé : {bilinguisme.niveau}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mb-6">Programme bilingue EPV — {SECTION_LABEL[session.sectionVisee] || session.sectionVisee} · 8h d'anglais par semaine</p>
                    <div className="space-y-4">
                      {competences.map((b: any, i: number) => (
                        <div key={i} className="grid grid-cols-[200px_1fr] items-center gap-6">
                          <span className="text-xs font-medium text-slate-700">{b.competence}</span>
                          <ProgressBar value={b.niveau} />
                        </div>
                      ))}
                    </div>
                  </Card>
                  {bilinguisme?.commentaire && (
                    <Card className="p-5">
                      <div className="flex items-start gap-3">
                        <Info size={15} className="text-[#0D2E5C] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#6B7280] leading-relaxed">{bilinguisme.commentaire}</p>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {sub === 'assiduite' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Taux de présence',  val: '97,2 %', Icon: Activity },
                  { label: 'Absences totales',   val: `${absences.filter((a:any)=>a.type==='Absence').length} jours`, Icon: AlertTriangle },
                  { label: 'Retards enregistrés', val: `${absences.filter((a:any)=>a.type==='Retard').length}`, Icon: Clock },
                ].map(s => (
                  <KpiCard key={s.label} label={s.label} value={s.val} Icon={s.Icon} />
                ))}
              </div>
              <Card>
                <CardHeader title="Registre des absences et retards" />
                {absences.length === 0 ? (
                  <div className="px-5 py-8 text-center text-[#6B7280] text-sm">Aucune absence enregistrée pour cette année scolaire.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                        {['Date', 'Type', 'Motif', 'Durée'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F9FAFB]">
                      {absences.map((a: any, i: number) => (
                        <tr key={i}>
                          <td className="px-5 py-3.5 text-[#6B7280]">{fmtDate(a.date)}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge statut={a.type === 'Absence' ? 'annule' : 'en_attente'} />
                          </td>
                          <td className="px-5 py-3.5 text-[#6B7280]">{a.motif}</td>
                          <td className="px-5 py-3.5 text-[#6B7280]">{a.duree}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VIE SCOLAIRE
// ════════════════════════════════════════════════════════════════════════════

function VieScolaireTab({ session, cantine, evenements, transport, sante }: { session: Prospect; cantine: any[]; evenements: any[]; transport: any[]; sante: any | null }) {
  type Sub = 'cantine' | 'agenda' | 'transport' | 'sante';
  const [sub, setSub] = useState<Sub>('cantine');

  return (
    <SectionPage title="Vie scolaire" sub="Services aux familles — informations pratiques">

      <SubTabNav
        tabs={[
          { id: 'cantine',   label: 'Menu de la cantine' },
          { id: 'agenda',    label: 'Agenda & Événements' },
          { id: 'transport', label: 'Transport scolaire'  },
          { id: 'sante',     label: 'Santé & Infirmerie'  },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'cantine' && (
            <Card>
              <CardHeader title="Menu hebdomadaire" sub="Cuisine locale et internationale — validation diététique mensuelle" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                      {['Jour', 'Plat principal', 'Accompagnement', 'Dessert'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9FAFB]">
                    {cantine.map((c: any, i: number) => {
                      const isToday = c.jour === ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
                      return (
                        <tr key={i} className={`${isToday ? 'bg-[#F9FAFB] border-l-2 border-l-[#F5A623]' : 'hover:bg-[#F9FAFB]/50'} transition-colors`}>
                          <td className="px-5 py-4 font-semibold text-[#2C2C2C]">
                            {c.jour}
                            {isToday && <span className="ml-2 text-[9px] font-bold text-[#F5A623] uppercase tracking-wide">Aujourd'hui</span>}
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-medium">{c.plat}</td>
                          <td className="px-5 py-4 text-slate-500">{c.accomp}</td>
                          <td className="px-5 py-4 text-[#6B7280]">{c.dessert}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {sub === 'agenda' && (
            <Card>
              <CardHeader title="Agenda institutionnel" sub="Événements, sorties et réunions à venir" />
              <div className="divide-y divide-[#F9FAFB]">
                {evenements.map((e: any, i: number) => (
                  <div key={i} className="flex items-start gap-5 px-5 py-4">
                    <div className="w-12 h-12 rounded-md border border-[#E5E7EB] bg-white flex flex-col items-center justify-center shrink-0 text-[#0D2E5C]">
                      <span className="font-bold text-base leading-none">{new Date(e.date).getDate()}</span>
                      <span className="text-[9px] uppercase mt-0.5">
                        {new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-[#2C2C2C]">{e.titre}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1"><Clock size={11} /> {e.heure}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {e.lieu}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 rounded shrink-0">{e.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {sub === 'transport' && (
            <div className="space-y-4">
              {transport.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bus size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-[#6B7280]">Aucun itinéraire de transport configuré pour le moment.</p>
                  <p className="text-xs text-[#6B7280] mt-1">Contactez l'administration pour plus d'informations.</p>
                </Card>
              ) : transport.map((t: any, idx: number) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-sm font-semibold text-[#2C2C2C] mb-1">{t.ligne || 'Transport scolaire'}</h3>
                  {t.numero && <p className="text-xs text-[#6B7280] mb-5">{t.numero}{t.operateur ? ` · Opérateur : ${t.operateur}` : ''}</p>}
                  {t.arrets && t.arrets.length > 0 && (
                    <div className="space-y-3">
                      {t.arrets.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-md bg-[#F9FAFB] border border-[#F4F8FF]">
                          <Bus size={15} className="text-[#6B7280] shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">{r.dir}</p>
                            <p className="text-[11px] text-[#6B7280] mt-0.5">{r.arret}</p>
                          </div>
                          <span className="font-mono font-bold text-sm text-[#2C2C2C]">{r.heure}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {t.statut && (
                    <div className="mt-4 flex items-center gap-2.5 p-3 rounded-md border border-[#E5E7EB] bg-white">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                      <p className="text-xs text-[#6B7280]">{t.statut}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {sub === 'sante' && (
            <div className="space-y-4">
              <Card>
                <CardHeader title={`Fiche de santé — ${session.prenomEnfant} ${session.nomEnfant}`} />
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Groupe sanguin',  val: sante?.groupeSanguin || '—' },
                      { label: 'Allergies',        val: sante?.allergies || '—' },
                      { label: 'Vaccinations',     val: sante?.vaccinations || '—' },
                      { label: 'Médecin référent', val: sante?.medecin || '—' },
                    ].map(f => (
                      <div key={f.label} className="bg-[#F9FAFB] border border-[#F4F8FF] rounded-md p-3">
                        <p className="text-[9px] font-semibold text-[#6B7280] uppercase tracking-wide">{f.label}</p>
                        <p className="text-xs font-semibold text-[#2C2C2C] mt-1">{f.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-md border border-amber-100 bg-amber-50">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      Contact d'urgence : {session.prenomParent} {session.nomParent} — {session.telephone}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Registre infirmerie" sub="Interventions enregistrées cette année scolaire" />
                <div className="divide-y divide-[#F9FAFB]">
                  {(sante?.infirmerie || []).length === 0 ? (
                    <div className="px-5 py-6 text-xs text-[#6B7280] text-center">Aucune intervention enregistrée pour l'année en cours.</div>
                  ) : (sante.infirmerie as any[]).map((v: any, i: number) => (
                    <div key={i} className="px-5 py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-[#F9FAFB] border border-[#F4F8FF] flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-[#6B7280]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2C2C2C]">{v.date} · {v.heure}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FINANCES & DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

function FinancesTab({ session, appointments, paiements, reduction, tarifs, onRdvBooked, onToast }: {
  session: Prospect; appointments: RendezVous[];
  paiements: any[]; reduction: number; tarifs: Record<string,number>;
  onRdvBooked: (r: RendezVous) => void; onToast: (m: string) => void;
}) {
  type Sub = 'facturation' | 'dossier' | 'rendezvous' | 'documents';
  const [sub, setSub] = useState<Sub>('facturation');
  const [showForm, setShowForm] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const [checklist, setChecklist] = useState<{doc:string;done:boolean}[]>([]);

  // Charge depuis API (DB) → fallback localStorage → fallback configuration
  useEffect(() => {
    apiFetch(`/api/parent/checklist?prospectId=${session.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (Array.isArray(data)) { setChecklist(data); return; }
        // Fallback localStorage
        const saved = localStorage.getItem(`checklist_${session.id}`);
        if (saved) { setChecklist(JSON.parse(saved)); return; }
        // Fallback configuration
        fetch('/api/configuration').then(r => r.json()).then(cfg => {
          const docs = (cfg.checklist?.[session.sectionVisee.toUpperCase()] || []) as string[];
          setChecklist(docs.map(doc => ({ doc, done: false })));
        }).catch(() => {});
      }).catch(() => {
        const saved = localStorage.getItem(`checklist_${session.id}`);
        if (saved) setChecklist(JSON.parse(saved));
      });
  }, [session.id, session.sectionVisee]);

  useEffect(() => {
    apiFetch('/api/documents').then(r => r.ok ? r.json() : []).then(d => setDocuments(Array.isArray(d) ? d.filter((x:any) => x.actif !== false) : [])).catch(() => {});
  }, []);

  const toggleItem = (i: number) => {
    const upd = checklist.map((c, j) => j === i ? { ...c, done: !c.done } : c);
    setChecklist(upd);
    // Sauvegarde en DB + localStorage en parallèle
    apiFetch('/api/parent/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospectId: session.id, checklist: upd }),
    }).catch(console.error);
    localStorage.setItem(`checklist_${session.id}`, JSON.stringify(upd));
  };

  // Factures depuis vrais paiements + calcul avec réduction parrainage
  const annuel       = tarifs[session.sectionVisee] || TARIFS_DEFAUT[session.sectionVisee] || 1500000;
  const annuelReduit = Math.round(annuel * (1 - reduction / 100));
  const trim         = Math.round(annuelReduit / 3);
  const hasPay = (t: string) => paiements.some((p: any) => p.trimestre === t);
  const factures = [
    { id:'T1', libelle:'Scolarité — 1er trimestre 2025/2026', montant:trim, statut: hasPay('T1') ? 'payée' : 'en_attente', date:'2025-09-05' },
    { id:'T2', libelle:'Scolarité — 2e trimestre 2025/2026',  montant:trim, statut: hasPay('T2') ? 'payée' : 'en_attente', date:'2026-01-08' },
    { id:'T3', libelle:'Scolarité — 3e trimestre 2025/2026',  montant:annuelReduit-trim*2, statut: hasPay('T3') ? 'payée' : 'en_attente', date:'2026-04-01' },
    { id:'FN', libelle:'Fournitures scolaires — Sep. 2025',   montant:Math.round(annuel*0.07), statut: hasPay('FOURNITURES') ? 'payée' : 'en_attente', date:'2025-09-01' },
  ];
  const totalPaid = factures.filter(f => f.statut === 'payée').reduce((s, f) => s + f.montant, 0);
  const totalDue  = factures.filter(f => f.statut === 'en_attente').reduce((s, f) => s + f.montant, 0);

  const upcoming = appointments.filter(r => new Date(r.dateHeure) >= new Date())
    .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure));
  const past     = appointments.filter(r => new Date(r.dateHeure) < new Date())
    .sort((a, b) => +new Date(b.dateHeure) - +new Date(a.dateHeure));

  return (
    <SectionPage title="Finances & Documents"
      sub="Facturation · Dossier de candidature · Rendez-vous · Bibliothèque documentaire">

      <SubTabNav
        tabs={[
          { id: 'facturation', label: 'Facturation'   },
          { id: 'dossier',     label: 'Mon dossier'   },
          { id: 'rendezvous',  label: 'Rendez-vous'   },
          { id: 'documents',   label: 'Documents'     },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'facturation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Total réglé" value={fmtMoney(totalPaid)} Icon={Wallet} />
                <KpiCard label="En attente de paiement" value={fmtMoney(totalDue)} Icon={CreditCard} accent />
                <KpiCard label="Factures émises" value={factures.length} sub="Année scolaire 2025/2026" Icon={FileText} />
              </div>
              <Card>
                <CardHeader title="Historique des paiements" />
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                      {['Référence', 'Description', 'Date', 'Montant', 'Statut'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9FAFB]">
                    {factures.map(f => (
                      <tr key={f.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-[#6B7280] text-[10px]">{f.id}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">{f.libelle}</td>
                        <td className="px-5 py-3.5 text-[#6B7280]">{fmtDate(f.date, { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-[#2C2C2C] tabular-nums">{fmtMoney(f.montant)}</td>
                        <td className="px-5 py-3.5"><StatusBadge statut={f.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-4 border-t border-[#F4F8FF] bg-[#F9FAFB] rounded-b-lg">
                  <p className="text-xs text-slate-500">Pour tout litige ou demande de reçu, contactez le secrétariat : <span className="font-semibold text-slate-700">+225 07 07 07 07 07</span></p>
                </div>
              </Card>
              <Card className="border-l-4 border-l-[#0D2E5C]">
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2C]">Ré-inscription 2026/2027</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Votre dossier est pré-rempli. Réservez la place de {session.prenomEnfant} pour la prochaine rentrée.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors whitespace-nowrap">
                    Initier la ré-inscription <ChevronRight size={13} />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {sub === 'dossier' && (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-5">
                  <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Enfant</p>
                  <div className="space-y-2.5">
                    {[
                      { l: 'Nom complet',      v: `${session.prenomEnfant} ${session.nomEnfant}` },
                      { l: 'Date de naissance', v: fmtDate(session.dateNaissance) },
                      { l: 'Classe visée',     v: SECTION_LABEL[session.sectionVisee] || session.sectionVisee },
                      { l: 'Statut',           v: session.statut },
                    ].map(r => (
                      <div key={r.l} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                        <span className="text-xs text-[#6B7280]">{r.l}</span>
                        <span className="text-xs font-semibold text-[#2C2C2C]">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Responsable légal</p>
                  <div className="space-y-2.5">
                    {[
                      { l: 'Identité',  v: `${session.prenomParent} ${session.nomParent} (${session.lienParente})` },
                      { l: 'Téléphone', v: session.telephone },
                      { l: 'Email',     v: session.email },
                      { l: 'Commune',   v: `${session.commune}, Abidjan` },
                    ].map(r => (
                      <div key={r.l} className="flex items-start justify-between py-1.5 border-b border-slate-50 gap-4">
                        <span className="text-xs text-[#6B7280] shrink-0">{r.l}</span>
                        <span className="text-xs font-semibold text-[#2C2C2C] text-right break-all">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card>
                <CardHeader title="Pièces justificatives requises"
                  action={<span className="text-[11px] text-[#6B7280]">{checklist.filter(c=>c.done).length}/{checklist.length} déposées</span>}
                />
                <div className="p-5 space-y-1">
                  <div className="h-1 bg-[#F4F8FF] rounded-full overflow-hidden mb-4">
                    <motion.div className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checklist.filter(c=>c.done).length / checklist.length) * 100}%` }}
                      transition={{ duration: 0.6 }} />
                  </div>
                  {checklist.map((item, i) => (
                    <button key={i} onClick={() => toggleItem(i)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#F9FAFB] transition-colors cursor-pointer text-left">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${item.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                        {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs ${item.done ? 'text-[#6B7280] line-through' : 'text-slate-700 font-medium'}`}>
                        {item.doc}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {sub === 'rendezvous' && (
            <div className="space-y-4">
              {!showForm ? (
                <>
                  <div className="flex justify-end">
                    <button onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
                      <Calendar size={13} /> Nouveau rendez-vous
                    </button>
                  </div>
                  {upcoming.length > 0 && (
                    <Card>
                      <CardHeader title={`Rendez-vous à venir (${upcoming.length})`} />
                      <div className="divide-y divide-[#F9FAFB]">
                        {upcoming.map(r => {
                          const d = new Date(r.dateHeure);
                          return (
                            <div key={r.id} className="flex items-start gap-4 px-5 py-4">
                              <div className="w-10 h-10 rounded-md bg-[#0D2E5C] flex flex-col items-center justify-center text-white shrink-0">
                                <span className="font-bold text-sm leading-none">{d.getDate()}</span>
                                <span className="text-[9px] text-white/60 uppercase">{d.toLocaleString('fr-FR',{month:'short'})}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-[#2C2C2C]">{r.typeRdv}</p>
                                <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1"><Clock size={11}/>{d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · 30 min</p>
                                {r.notes && <p className="text-[11px] text-[#6B7280] italic mt-1">{r.notes}</p>}
                              </div>
                              <StatusBadge statut={r.statut} />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                  {upcoming.length === 0 && (
                    <Card className="p-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-300" />
                        <p className="text-sm text-[#6B7280]">Aucun rendez-vous planifié. Utilisez le bouton ci-dessus pour réserver un créneau.</p>
                      </div>
                    </Card>
                  )}
                  {past.length > 0 && (
                    <Card>
                      <CardHeader title="Historique" />
                      <div className="divide-y divide-[#F9FAFB] opacity-60">
                        {past.map(r => {
                          const d = new Date(r.dateHeure);
                          return (
                            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                              <div className="w-9 h-9 rounded-md bg-[#F4F8FF] flex flex-col items-center justify-center shrink-0">
                                <span className="font-bold text-xs text-[#6B7280]">{d.getDate()}</span>
                                <span className="text-[8px] text-[#6B7280] uppercase">{d.toLocaleString('fr-FR',{month:'short'})}</span>
                              </div>
                              <p className="flex-1 text-xs text-[#6B7280]">{r.typeRdv}</p>
                              <StatusBadge statut={r.statut} />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader title="Nouveau rendez-vous"
                    action={
                      <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-[#F4F8FF] cursor-pointer">
                        <X size={15} className="text-[#6B7280]" />
                      </button>
                    }
                  />
                  <div className="p-5">
                    <AppointmentForm initialProspect={session}
                      onSuccess={rdv => { onRdvBooked(rdv); setShowForm(false); onToast('Rendez-vous enregistré avec succès.'); }} />
                  </div>
                </Card>
              )}
            </div>
          )}

          {sub === 'documents' && (
            <div className="space-y-3">
              {documents.length === 0 && (
                <Card className="p-6 text-center text-sm text-[#6B7280]">Aucun document disponible.</Card>
              )}
              {[...new Set(documents.map((d:any) => d.cat))].map(cat => (
                <Card key={cat as string}>
                  <CardHeader title={cat as string} />
                  <div className="divide-y divide-[#F9FAFB]">
                    {documents.filter((d:any) => d.cat === cat).sort((a:any,b:any) => (a.ordre||0)-(b.ordre||0)).map((doc:any) => (
                      <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                        <FileText size={15} className="text-slate-300 shrink-0" />
                        <p className="flex-1 text-xs font-medium text-slate-700">{doc.titre}</p>
                        {doc.fichier ? (
                          <a href={doc.fichier} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E7EB] text-[#6B7280] text-[10px] font-semibold hover:bg-[#F9FAFB] transition-colors">
                            <Download size={11} /> PDF
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-300 px-3 py-1.5 border border-[#F4F8FF] rounded-md">
                            Bientôt disponible
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGERIE
// ════════════════════════════════════════════════════════════════════════════

function MessageTab({ session, messages, setMessages, onToast }: {
  session: Prospect; messages: any[]; setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onToast: (m: string) => void;
}) {
  const [sel,       setSel]       = useState<any | null>(null);
  const [composing, setComposing] = useState(false);
  const [text,      setText]      = useState('');
  const [sending,   setSending]   = useState(false);

  const open = (m: any) => {
    setSel(m);
    setComposing(false);
    setText('');
    if (!m.lu) {
      apiFetch(`/api/messages/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lu: true }),
      }).catch(console.error);
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, lu: true } : x));
    }
  };

  const openCompose = () => {
    setComposing(true);
    setSel(null);
    setText('');
  };

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await apiFetch('/api/parent/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: session.id, contenu: text.trim() }),
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || 'Erreur lors de l\'envoi.');
      setMessages(prev => [...prev, data]);
      setSel(data);
      setComposing(false);
      setText('');
      onToast('Message envoyé à l\'équipe pédagogique.');
    } catch (err: any) {
      onToast(err.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const unread = messages.filter(m => !m.lu).length;

  return (
    <SectionPage title="Messagerie sécurisée" sub="Communication directe avec l'équipe pédagogique et administrative">

      {/* Bouton Nouveau message — toujours visible */}
      <div className="flex justify-end">
        <button onClick={openCompose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
          <Send size={13} /> Nouveau message
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[580px]">

        {/* ── Liste messages ── */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F4F8FF] flex items-center justify-between shrink-0">
            <p className="text-xs font-semibold text-slate-700">Boîte de réception</p>
            <span className="text-[10px] font-semibold text-[#6B7280]">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
              {unread > 0 && <span className="ml-1.5 bg-[#0D2E5C] text-white rounded-full px-1.5 py-0.5">{unread}</span>}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F9FAFB]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
                <MessageSquare size={24} className="text-slate-200 mb-2" />
                <p className="text-xs text-[#6B7280]">Aucun message pour l'instant.</p>
                <button onClick={openCompose}
                  className="mt-3 text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer">
                  Écrire à l'administration →
                </button>
              </div>
            ) : messages.map((m: any) => (
              <button key={m.id} onClick={() => open(m)}
                className={`w-full text-left px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer
                  ${sel?.id === m.id && !composing ? 'bg-[#F9FAFB] border-r-2 border-r-[#0D2E5C]' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs truncate ${!m.lu ? 'font-bold text-[#2C2C2C]' : 'font-medium text-[#6B7280]'}`}>
                    {m.de}
                  </p>
                  {!m.lu && <div className="w-2 h-2 rounded-full bg-[#0D2E5C] shrink-0 mt-1" />}
                </div>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  {m.date ? new Date(m.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-normal">{m.contenu}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* ── Panneau droite : détail ou composition ── */}
        <Card className="flex flex-col overflow-hidden">

          {/* Mode composition d'un nouveau message */}
          {composing && (
            <>
              <div className="px-5 py-4 border-b border-[#F4F8FF] flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-semibold text-[#2C2C2C]">Nouveau message</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">À : Direction EPV Horizons Savants</p>
                </div>
                <button onClick={() => setComposing(false)}
                  className="p-1.5 rounded-md hover:bg-[#F4F8FF] cursor-pointer transition-colors">
                  <X size={15} className="text-[#6B7280]" />
                </button>
              </div>
              <div className="flex-1 flex flex-col px-5 py-5 gap-4">
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Rédigez votre message à l'équipe pédagogique ou à l'administration…"
                  className="flex-1 w-full text-sm font-sans border border-[#E5E7EB] rounded-lg px-4 py-3 resize-none text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#0D2E5C] transition-colors leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#6B7280]">
                    {text.length > 0 ? `${text.length} caractère${text.length > 1 ? 's' : ''}` : 'Votre message sera envoyé directement à l\'administration.'}
                  </p>
                  <button onClick={send} disabled={sending || !text.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending
                      ? <><div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi…</>
                      : <><Send size={12} /> Envoyer le message</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Mode lecture d'un message + réponse */}
          {!composing && sel && (
            <>
              <div className="px-5 py-4 border-b border-[#F4F8FF] shrink-0">
                <p className="text-sm font-semibold text-[#2C2C2C]">{sel.de}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {sel.date ? new Date(sel.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }) : '—'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{sel.contenu}</p>
              </div>
              <div className="px-5 py-4 border-t border-[#F4F8FF] space-y-3 shrink-0">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">Répondre</p>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Rédigez votre réponse…"
                  rows={3}
                  className="w-full text-xs font-sans border border-[#E5E7EB] rounded-md px-3 py-2.5 resize-none text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#0D2E5C] transition-colors"
                />
                <div className="flex justify-end">
                  <button onClick={send} disabled={sending || !text.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending
                      ? <><div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi…</>
                      : <><Send size={12} /> Envoyer</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* État vide — ni composition ni sélection */}
          {!composing && !sel && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#F9FAFB] border border-[#F4F8FF] flex items-center justify-center">
                <MessageSquare size={24} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#6B7280]">Aucun message sélectionné</p>
                <p className="text-xs text-[#6B7280] mt-1">Choisissez un message dans la liste ou écrivez à l'administration.</p>
              </div>
              <button onClick={openCompose}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
                <Send size={13} /> Écrire un message
              </button>
            </div>
          )}

        </Card>
      </div>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARRAINAGE
// ════════════════════════════════════════════════════════════════════════════

const STATUT_PARRAINAGE_LABEL: Record<string, { label: string; cls: string }> = {
  valide:     { label: 'Réduction validée',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  en_attente: { label: 'En attente',          cls: 'bg-amber-50 text-amber-700 border-amber-200'       },
  refuse:     { label: 'Refusé',              cls: 'bg-red-50 text-red-600 border-red-200'             },
};

function ParrainageTab({ session, reduction, onToast }: { session: Prospect; reduction: number; onToast: (m: string) => void }) {
  const [copied,   setCopied]   = useState(false);
  const [filleuls, setFilleuls] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(`/api/parent/mes-filleuls?prospectId=${session.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setFilleuls(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [session.id]);

  const validCount = filleuls.filter(f => f.parrainageStatut === 'valide').length;
  const reductionReelle = Math.min(validCount * 10, 40);

  const copy = () => {
    navigator.clipboard.writeText(session.codeParrainagePersonnel);
    setCopied(true);
    onToast('Code copié dans le presse-papiers.');
    setTimeout(() => setCopied(false), 2500);
  };
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`J'ai inscrit mon enfant à EPV Horizons Savants à Abidjan. Utilisez mon code ${session.codeParrainagePersonnel} pour bénéficier de 10% de réduction sur la scolarité. Plus d'informations : https://horizonssavants.com/#/admissions`)}`;

  return (
    <SectionPage title="Programme de parrainage" sub="Bénéficiez d'une réduction de 10% par famille parrainée inscrite">

      <div className="grid lg:grid-cols-3 gap-4">
        <KpiCard label="Familles parrainées"  value={filleuls.length} sub={filleuls.length === 0 ? 'Aucune famille référencée' : `${validCount} inscription(s) confirmée(s)`} Icon={Users} />
        <KpiCard label="Réduction cumulée"    value={`${reductionReelle} %`} sub={reductionReelle > 0 ? 'Appliquée sur votre scolarité' : 'Parrainez pour bénéficier d\'une réduction'} Icon={TrendingUp} />
        <KpiCard label="Réduction maximale"   value="40 %" sub="Cumulable jusqu'à 4 familles parrainées" Icon={Award} accent />
      </div>

      <Card className="p-6">
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest mb-1">Votre code de parrainage personnel</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="font-mono font-bold text-3xl text-[#0D2E5C] tracking-[0.15em]">
            {session.codeParrainagePersonnel}
          </span>
          <button onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer
              ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-[#E5E7EB] text-[#6B7280] hover:border-slate-300'}`}>
            {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
          </button>
        </div>
        <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-lg">
          Communiquez ce code à vos proches lors de leur pré-inscription sur le site d'EPV Horizons Savants. Toute famille dont l'inscription est confirmée vous fait bénéficier d'une réduction de 10% sur vos frais de scolarité.
        </p>
      </Card>

      {/* Liste réelle des filleuls */}
      <Card>
        <CardHeader
          title={`Mes filleuls (${filleuls.length})`}
          sub="Familles ayant utilisé votre code lors de leur pré-inscription"
        />
        {filleuls.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Users size={24} className="mx-auto mb-2 text-slate-200" />
            <p className="text-sm text-[#6B7280]">Aucune famille n'a encore utilisé votre code.</p>
            <p className="text-xs text-[#6B7280] mt-1">Partagez votre code ci-dessus pour commencer à parrainer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F4F8FF] bg-[#F9FAFB]">
                  {['Famille', 'Enfant', 'Classe', 'Dossier', 'Réduction'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {filleuls.map((f: any) => {
                  const ps = STATUT_PARRAINAGE_LABEL[f.parrainageStatut] ?? STATUT_PARRAINAGE_LABEL.en_attente;
                  return (
                    <tr key={f.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[#2C2C2C]">{f.prenomParent} {f.nomParent}</td>
                      <td className="px-5 py-3.5 text-[#6B7280]">{f.prenomEnfant} {f.nomEnfant}</td>
                      <td className="px-5 py-3.5 text-slate-500">{SECTION_LABEL[f.sectionVisee] || f.sectionVisee}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]">{f.statut}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${ps.cls}`}>{ps.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Fonctionnement du programme" />
        <div className="p-5">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { num: '01', title: 'Partagez votre code',   desc: 'Transmettez votre code personnel à des familles susceptibles d\'inscrire leur enfant à l\'EPV.' },
              { num: '02', title: 'Ils s\'inscrivent',      desc: 'La famille utilise votre code lors de sa pré-inscription en ligne. Le code est associé à leur dossier.' },
              { num: '03', title: 'Vous êtes crédité',      desc: 'Dès que leur inscription est confirmée physiquement, 10% est déduit de votre prochaine facture.' },
            ].map(s => (
              <div key={s.num} className="px-5 first:pl-0 last:pr-0">
                <p className="text-2xl font-bold text-slate-100 mb-2">{s.num}</p>
                <p className="text-xs font-semibold text-[#2C2C2C] mb-1.5">{s.title}</p>
                <p className="text-xs text-[#6B7280] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1cb855] cursor-pointer transition-colors">
          <Share2 size={13} /> Partager via WhatsApp
        </a>
        <button onClick={copy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold hover:bg-[#F9FAFB] cursor-pointer transition-colors">
          <Copy size={13} /> Copier le lien
        </button>
      </div>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROFIL
// ════════════════════════════════════════════════════════════════════════════

function ProfilTab({ session, sante, onSessionUpdate }: {
  session: Prospect; sante: any | null; onSessionUpdate: (s: Prospect) => void;
}) {
  type Sub = 'infos' | 'enfant' | 'securite' | 'preferences';
  const [sub, setSub] = useState<Sub>('infos');

  // ── Infos personnelles ──
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ telephone: session.telephone, email: session.email, commune: session.commune });
  const [saving,   setSaving]   = useState(false);
  const [infoMsg,  setInfoMsg]  = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSaveProfil = async () => {
    setSaving(true); setInfoMsg(null);
    try {
      const r = await apiFetch('/api/parent/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: session.id, ...form }),
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      onSessionUpdate({ ...session, ...data });
      setEditing(false);
      setInfoMsg({ type: 'ok', text: 'Coordonnées mises à jour.' });
    } catch (err: any) {
      setInfoMsg({ type: 'err', text: err.message });
    } finally { setSaving(false); }
  };

  // ── Sécurité / Mot de passe ──
  const [pwd,      setPwd]      = useState({ old: '', new: '', confirm: '' });
  const [show,     setShow]     = useState({ old: false, new: false, confirm: false });
  const [pwdLoad,  setPwdLoad]  = useState(false);
  const [pwdMsg,   setPwdMsg]   = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleChangePwd = async () => {
    setPwdMsg(null);
    if (!pwd.old || !pwd.new || !pwd.confirm) { setPwdMsg({ type:'err', text:'Tous les champs sont requis.' }); return; }
    if (pwd.new !== pwd.confirm) { setPwdMsg({ type:'err', text:'Les mots de passe ne correspondent pas.' }); return; }
    if (pwd.new.length < 6) { setPwdMsg({ type:'err', text:'Le mot de passe doit contenir au moins 6 caractères.' }); return; }
    setPwdLoad(true);
    try {
      const r = await apiFetch('/api/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: pwd.old, newPassword: pwd.new }),
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || 'Erreur lors du changement.');
      setPwd({ old:'', new:'', confirm:'' });
      setPwdMsg({ type:'ok', text:'Mot de passe mis à jour avec succès.' });
    } catch (err: any) {
      setPwdMsg({ type:'err', text: err.message });
    } finally { setPwdLoad(false); }
  };

  // ── Préférences ──
  const [notifs, setNotifs] = useState({ email: true, sms: true, urgence: true, bulletin: true });

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${val ? 'bg-[#0D2E5C]' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const FieldDisplay = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between py-3 border-b border-slate-50 gap-4">
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide shrink-0">{label}</p>
      <p className="text-sm font-medium text-[#2C2C2C] text-right">{value}</p>
    </div>
  );

  return (
    <SectionPage title="Mon profil" sub="Informations personnelles, sécurité et préférences">

      <SubTabNav
        tabs={[
          { id: 'infos',       label: 'Informations personnelles' },
          { id: 'enfant',      label: 'Dossier de l\'enfant'     },
          { id: 'securite',    label: 'Sécurité'                 },
          { id: 'preferences', label: 'Préférences'              },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'infos' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#F4F8FF]">
                  <div className="w-14 h-14 rounded-full bg-[#0D2E5C] flex items-center justify-center text-white font-bold text-lg">
                    {session.prenomParent[0]}{session.nomParent[0]}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#2C2C2C]">{session.prenomParent} {session.nomParent}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{session.lienParente} · Parent EPV Horizons Savants</p>
                    <Badge status={session.statut} />
                  </div>
                </div>

                {infoMsg && (
                  <div className={`mb-4 px-4 py-2.5 rounded-lg text-xs font-semibold ${infoMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {infoMsg.text}
                  </div>
                )}

                <FieldDisplay label="Prénom"    value={session.prenomParent} />
                <FieldDisplay label="Nom"       value={session.nomParent} />
                <FieldDisplay label="Lien de parenté" value={session.lienParente} />
                <FieldDisplay label="Code parrainage" value={session.codeParrainagePersonnel} />

                {editing ? (
                  <div className="mt-4 space-y-3">
                    {[
                      { key: 'telephone', label: 'Téléphone', type: 'tel'   },
                      { key: 'email',     label: 'Email',     type: 'email' },
                      { key: 'commune',   label: 'Commune',   type: 'text'  },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{f.label}</label>
                        <input type={f.type}
                          value={(form as any)[f.key]}
                          onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#0D2E5C] transition-colors" />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveProfil} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                        {saving ? <><div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Enregistrement…</> : 'Enregistrer'}
                      </button>
                      <button onClick={() => { setEditing(false); setForm({ telephone: session.telephone, email: session.email, commune: session.commune }); }}
                        className="px-4 py-2 rounded-md border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold cursor-pointer hover:bg-[#F9FAFB] transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FieldDisplay label="Téléphone" value={session.telephone} />
                    <FieldDisplay label="Email"     value={session.email} />
                    <FieldDisplay label="Commune"   value={`${session.commune}, Abidjan`} />
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-[10px] text-[#6B7280]">Compte créé le {fmtDate(session.createdAt)}</p>
                      <button onClick={() => { setEditing(true); setInfoMsg(null); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
                        Modifier mes coordonnées
                      </button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}

          {sub === 'enfant' && (
            <div className="space-y-4">
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-4">Identité de l'enfant</p>
                <FieldDisplay label="Nom complet"       value={`${session.prenomEnfant} ${session.nomEnfant}`} />
                <FieldDisplay label="Date de naissance" value={fmtDate(session.dateNaissance)} />
                <FieldDisplay label="Classe visée"      value={SECTION_LABEL[session.sectionVisee] || session.sectionVisee} />
                <FieldDisplay label="Rentrée"           value="Septembre 2026" />
              </Card>
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-4">Données de santé</p>
                <FieldDisplay label="Groupe sanguin"    value={sante?.groupeSanguin || '—'} />
                <FieldDisplay label="Allergies connues" value={sante?.allergies     || '—'} />
                <FieldDisplay label="Vaccinations"      value={sante?.vaccinations  || '—'} />
                <FieldDisplay label="Médecin traitant"  value={sante?.medecin       || '—'} />
              </Card>
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-4">Contacts d'urgence</p>
                <FieldDisplay label="Contact principal"  value={`${session.prenomParent} ${session.nomParent} — ${session.telephone}`} />
                <FieldDisplay label="Contact secondaire" value="Non renseigné" />
                <FieldDisplay label="Email de contact"   value={session.email} />
              </Card>
            </div>
          )}

          {sub === 'securite' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Smartphone size={15} className="text-[#6B7280]" />
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2C]">Connexion sécurisée par OTP</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Votre accès est protégé par un code à usage unique envoyé sur WhatsApp</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Numéro WhatsApp enregistré</p>
                      <p className="text-xs text-slate-500 mt-0.5">{session.telephone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Authentification à deux facteurs active</p>
                      <p className="text-xs text-slate-500 mt-0.5">Chaque connexion génère un code unique valable 10 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Pour modifier votre numéro WhatsApp, contactez directement l'administration de l'école.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-[#6B7280] shrink-0" />
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Dernière connexion : aujourd'hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {sub === 'preferences' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Bell size={15} className="text-[#6B7280]" />
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2C]">Notifications</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Gérez les alertes reçues par email et SMS</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {([
                    { key: 'email',    label: 'Notifications par email',                         sub: `Envoyées à ${session.email}` },
                    { key: 'sms',      label: 'Notifications par SMS',                           sub: `Envoyées au ${session.telephone}` },
                    { key: 'urgence',  label: 'Alertes urgentes (absences, infirmerie)',         sub: 'Toujours prioritaires' },
                    { key: 'bulletin', label: 'Bulletins & résultats académiques',               sub: 'Disponibles à chaque fin de trimestre' },
                  ] as const).map(n => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{n.label}</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{n.sub}</p>
                      </div>
                      <Toggle val={notifs[n.key]} onToggle={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sliders size={15} className="text-[#6B7280]" />
                  <p className="text-sm font-semibold text-[#2C2C2C]">Préférences d'affichage</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Langue de l\'interface', value: 'Français (FR)' },
                    { label: 'Format de date',          value: 'JJ/MM/AAAA' },
                    { label: 'Devise',                  value: 'FCFA (XOF)' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                      <span className="text-xs text-[#6B7280]">{f.label}</span>
                      <span className="text-xs font-semibold text-[#2C2C2C]">{f.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BULLETIN PARENT TAB
// ════════════════════════════════════════════════════════════════════════════

const SECTION_LABEL_B: Record<string,string> = {
  PS:'Petite Section', MS:'Moyenne Section', GS:'Grande Section',
  CP1:'CP1 (CPI)', CP2:'CP2 (CPII)', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};

function noteCls(n?: number) {
  if (!n && n !== 0) return 'text-[#6B7280]';
  if (n >= 16) return 'text-emerald-600 font-bold';
  if (n >= 12) return 'text-blue-600 font-semibold';
  if (n >= 10) return 'text-amber-600';
  return 'text-red-500';
}

function BulletinParentTab({ session }: { session: Prospect }) {
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<any | null>(null);

  useEffect(() => {
    apiFetch('/api/parent/bulletins')
      .then(r => r.json()).then(d => { setBulletins(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function exportCSVBulletin(b: any) {
    const detail: any[] = b.notesDetail || [];
    const rows = [
      ['Élève', `${session.prenomEnfant} ${session.nomEnfant}`],
      ['Section', SECTION_LABEL_B[session.sectionVisee] || session.sectionVisee],
      ['Trimestre', b.trimestre],
      ['Moyenne', b.moyenneGenerale != null ? Number(b.moyenneGenerale).toFixed(2) : ''],
      ['Rang', b.rang ?? ''],
      ['Effectif', b.effectifClasse ?? ''],
      ['Mention', b.mention ?? ''],
      [],
      ['Matière', 'Note /20', 'Coeff.', 'Appréciation'],
      ...detail.map((n: any) => [n.matiere, n.note != null ? Number(n.note).toFixed(2) : '', n.coef, n.appreciation || '']),
    ];
    const csv = rows.map(r => (r as any[]).map(c => `"${String(c ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `bulletin_${b.trimestre}_${session.prenomEnfant}.csv`; a.click();
  }

  function printBulletinParent(b: any) {
    const logo = `${window.location.origin}/img/logo.jpg`;
    const detail: any[] = b.notesDetail || [];
    const nc = (n: number) => n>=16?'#16a34a':n>=12?'#2563eb':n>=10?'#d97706':'#dc2626';
    const mentionBg = b.mention==='Félicitations'?'#FEF3C7':b.mention==='Très bien'?'#DBEAFE':b.mention==='Bien'?'#DCFCE7':'#F1F5F9';
    const mentionFg = b.mention==='Félicitations'?'#92400E':b.mention==='Très bien'?'#1E40AF':b.mention==='Bien'?'#14532D':'#475569';
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Bulletin ${session.prenomEnfant} — ${b.trimestre}</title>
    <style>
      @page{size:A4 portrait;margin:0}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Arial','Helvetica',sans-serif;color:#1e293b;background:white}
      .wrap{padding:12mm}
      table{width:100%;border-collapse:collapse}
      th{background:#0D2E5C;color:white;padding:8px 10px;font-size:8.5pt;font-weight:700;text-align:left}
      td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:9.5pt;vertical-align:middle}
      tr:nth-child(even) td{background:#F8FAFF}
    </style></head><body>
    <div style="background:#0D2E5C;padding:14px 12mm;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${logo}" alt="EPV" style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:2px solid rgba(255,255,255,0.3)"/>
        <div>
          <div style="color:white;font-size:14pt;font-weight:900">EPV Horizons Savants</div>
          <div style="color:rgba(255,255,255,0.7);font-size:8pt;margin-top:2px">École Maternelle & Primaire d'Excellence bilingue · Abidjan</div>
          <div style="color:rgba(255,255,255,0.5);font-size:7.5pt">Agrément MENA N° 2026/SAG · contact@horizonssavants.com</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="background:#F5A623;color:#0D2E5C;font-size:11pt;font-weight:900;padding:7px 16px;border-radius:8px">BULLETIN SCOLAIRE</div>
        <div style="color:rgba(255,255,255,0.7);font-size:9pt;margin-top:5px;font-weight:700">${b.trimestre} — 2026 / 2027</div>
      </div>
    </div>
    <div style="background:#EFF6FF;border-bottom:2px solid #BFDBFE;padding:10px 12mm;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px">
      <div>
        <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Nom & Prénom de l'élève</div>
        <div style="font-size:13pt;font-weight:900;color:#0D2E5C">${session.nomEnfant} ${session.prenomEnfant}</div>
      </div>
      <div>
        <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Classe</div>
        <div style="font-size:10pt;font-weight:700;color:#0D2E5C">${SECTION_LABEL_B[session.sectionVisee]||session.sectionVisee}</div>
      </div>
      <div>
        <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Trimestre</div>
        <div style="font-size:10pt;font-weight:700;color:#0D2E5C">${b.trimestre}</div>
      </div>
      <div>
        <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Effectif classe</div>
        <div style="font-size:10pt;font-weight:700;color:#0D2E5C">${b.effectifClasse??'—'} élèves</div>
      </div>
    </div>
    <div class="wrap">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:10px;margin-bottom:16px">
        <div style="border:2px solid ${nc(b.moyenneGenerale)};border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:26pt;font-weight:900;color:${nc(b.moyenneGenerale)};line-height:1">${b.moyenneGenerale?.toFixed(2)??'—'}</div>
          <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Moyenne / 20</div>
        </div>
        <div style="border:2px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:26pt;font-weight:900;color:#0D2E5C;line-height:1">${b.rang??'—'}</div>
          <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Rang / ${b.effectifClasse??'?'}</div>
        </div>
        <div style="border:2px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:26pt;font-weight:900;color:#0D2E5C;line-height:1">${b.effectifClasse??'—'}</div>
          <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Effectif</div>
        </div>
        <div style="border:2px solid ${mentionBg};border-radius:10px;padding:12px;background:${mentionBg};display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-bottom:6px">Mention</div>
          <div style="font-size:16pt;font-weight:900;color:${mentionFg}">${b.mention||'—'}</div>
        </div>
      </div>
      <table style="margin-bottom:16px">
        <thead><tr>
          <th style="width:32%">Matière</th>
          <th style="width:18%;text-align:center">Note / 20</th>
          <th style="width:12%;text-align:center">Coeff.</th>
          <th>Appréciation</th>
        </tr></thead>
        <tbody>${detail.map((n:any,i:number)=>`
          <tr style="background:${i%2===0?'white':'#F8FAFF'}">
            <td style="font-weight:700">${n.matiere}</td>
            <td style="text-align:center;font-size:11pt;font-weight:900;color:${nc(n.note)}">${n.note?.toFixed(2)??'—'}</td>
            <td style="text-align:center;color:#64748b">${n.coef}</td>
            <td style="color:#475569;font-style:italic;font-size:9pt">${n.appreciation||''}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:65px">
          <div style="font-size:7.5pt;color:#94a3b8;font-weight:700;text-transform:uppercase">Signature du parent / tuteur légal</div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:65px">
          <div style="font-size:7.5pt;color:#94a3b8;font-weight:700;text-transform:uppercase">Cachet & Signature de la Direction</div>
        </div>
      </div>
      <div style="margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:7.5pt;color:#94a3b8">
        <span>EPV Horizons Savants · Bingerville, Abidjan · Document officiel 2026-2027</span>
        <span>Imprimé le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
      </div>
    </div>
    </body></html>`;
    const w = window.open('','_blank')!;
    w.document.write(html); w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#6B7280] text-sm">Chargement…</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-brand-gold/15 flex items-center justify-center">
          <Award size={20} className="text-brand-gold" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-brand-blue-deep">Bulletins & Notes</h2>
          <p className="text-xs text-brand-muted">{session.prenomEnfant} {session.nomEnfant}</p>
        </div>
      </div>

      {bulletins.length === 0 ? (
        <div className="rounded-2xl bg-white border border-brand-border/40 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F4F8FF] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-[#6B7280]" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Aucun bulletin disponible</p>
          <p className="text-xs text-[#6B7280] mt-1">Les bulletins apparaissent ici dès que l'administration les publie.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {bulletins.map((b: any) => (
            <div key={b.id} className="rounded-2xl bg-white border border-brand-border/40 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0D2E5C] to-[#1A4F8B]">
                <div>
                  <p className="font-bold text-white text-sm">Bulletin {b.trimestre}</p>
                  <p className="text-white/60 text-xs">Année scolaire 2026-2027</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => exportCSVBulletin(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 text-white hover:bg-white/25 cursor-pointer">
                    <Download size={12} /> Excel
                  </button>
                  <button onClick={() => printBulletinParent(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-gold text-white hover:brightness-105 cursor-pointer">
                    <FileText size={12} /> PDF
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-5 border-b border-brand-border/40">
                <div className="text-center">
                  <p className={`text-2xl font-black ${noteCls(b.moyenneGenerale)}`}>{b.moyenneGenerale != null ? Number(b.moyenneGenerale).toFixed(2) : '—'}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold mt-0.5">Moyenne / 20</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-brand-blue-deep">{b.rang ?? '—'}<span className="text-sm text-[#6B7280] font-normal">/{b.effectifClasse ?? '?'}</span></p>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold mt-0.5">Classement</p>
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700">
                    {b.mention || '—'}
                  </span>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold mt-1.5">Mention</p>
                </div>
              </div>

              {/* Détail des notes */}
              <div className="p-5">
                <button onClick={() => setSelected(selected?.id === b.id ? null : b)}
                  className="flex items-center gap-2 text-xs font-bold text-brand-blue-deep hover:text-brand-gold transition-colors cursor-pointer mb-3">
                  <Eye size={13} /> {selected?.id === b.id ? 'Masquer le détail' : 'Voir le détail des notes'}
                </button>

                <AnimatePresence>
                  {selected?.id === b.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="space-y-2">
                        {(b.notesDetail || []).map((n: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] border border-[#F4F8FF]">
                            <span className="text-xs font-semibold text-[#6B7280] flex-1">{n.matiere}</span>
                            <span className={`text-sm font-bold w-14 text-center ${noteCls(n.note)}`}>{n.note != null ? Number(n.note).toFixed(2) : '—'}</span>
                            <span className="text-xs text-[#6B7280] w-12 text-center">coef {n.coef}</span>
                            <span className="text-xs text-slate-500 flex-1 text-right">{n.appreciation || ''}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const NAV: { id: ParentTab; label: string; Icon: React.FC<any> }[] = [
  { id: 'dashboard',  label: 'Tableau de bord',       Icon: LayoutGrid     },
  { id: 'parcours',   label: 'Parcours académique',   Icon: BookOpen       },
  { id: 'bulletins',  label: 'Bulletins & Notes',     Icon: Award          },
  { id: 'vie',        label: 'Vie scolaire',           Icon: Utensils       },
  { id: 'finances',   label: 'Finances & Documents',  Icon: FolderOpen     },
  { id: 'messagerie', label: 'Messagerie',             Icon: MessageSquare  },
  { id: 'parrainage', label: 'Parrainage',             Icon: Gift           },
];

export const EspaceParent: React.FC = () => {
  /* ── Tous les enfants du parent ── */
  const [allChildren, setAllChildren] = useState<Prospect[]>(() => {
    try {
      const raw = localStorage.getItem('parent_children');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [childIdx, setChildIdx] = useState(0);

  const [session, setSession] = useState<Prospect | null>(() => {
    // Priorité : enfant sélectionné → session normale
    try {
      const kids = localStorage.getItem('parent_children');
      if (kids) {
        const arr = JSON.parse(kids);
        if (arr.length > 0) return arr[0] as Prospect;
      }
    } catch {}
    const saved = localStorage.getItem('parent_session');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const prospect: Prospect = parsed?.prospect ?? parsed;
    if (parsed?.prospect) localStorage.setItem('parent_session', JSON.stringify(prospect));
    return prospect;
  });

  /* Changer d'enfant sélectionné */
  const handleSelectChild = (idx: number) => {
    setChildIdx(idx);
    setSession(allChildren[idx]);
  };

  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [devoirs,      setDevoirs]      = useState<any[]>([]);
  const [cantine,      setCantine]      = useState<any[]>([]);
  const [evenements,   setEvenements]   = useState<any[]>([]);
  const [notes,        setNotes]        = useState<any[]>([]);
  const [absences,     setAbsences]     = useState<any[]>([]);
  const [messages,     setMessages]     = useState<any[]>([]);
  const [transport,    setTransport]    = useState<any[]>([]);
  const [sante,        setSante]        = useState<any | null>(null);
  const [bilinguisme,  setBilinguisme]  = useState<any | null>(null);
  const [paiements,    setPaiements]    = useState<any[]>([]);
  const [reduction,    setReduction]    = useState<number>(0);
  const [tarifs,       setTarifs]       = useState<Record<string,number>>(TARIFS_DEFAUT);
  const [tab,          setTab]          = useState<ParentTab>('dashboard');
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const pid = session.id;
    const load = (url: string, setter: (d: any) => void) =>
      apiFetch(url).then(r => r.ok ? r.json() : []).then(d => setter(Array.isArray(d) ? d : [])).catch(console.error);

    load('/api/rendezvous', (data: RendezVous[]) =>
      setAppointments(data.filter(r =>
        r.email?.toLowerCase() === session.email.toLowerCase() || r.telephone === session.telephone
      ))
    );
    load(`/api/devoirs?prospectId=${pid}`,       setDevoirs);
    load('/api/cantine',                          setCantine);
    load('/api/evenements',                       setEvenements);
    load(`/api/parent/notes?prospectId=${pid}`,    setNotes);
    load(`/api/assiduite?prospectId=${pid}`,      setAbsences);
    load(`/api/messages?prospectId=${pid}`,       setMessages);
    load('/api/transport',                        setTransport);
    load(`/api/sante_eleve?prospectId=${pid}`,   (d: any[]) => setSante(d[0] || null));
    load(`/api/bilinguisme?prospectId=${pid}`,   (d: any[]) => setBilinguisme(d[0] || null));

    // Paiements réels du parent
    apiFetch(`/api/paiements?prospectId=${pid}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setPaiements(Array.isArray(data) ? data.filter((p: any) => p.statut === 'validé') : []);
      }).catch(() => {});

    // Réduction parrainage — calculée depuis les filleuls du parent
    apiFetch(`/api/parent/mes-filleuls?prospectId=${pid}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const validCount = data.filter((f: any) => f.parrainageStatut === 'valide').length;
        setReduction(Math.min(validCount * 10, 40));
      }).catch(() => {});

    // Tarifs depuis la configuration
    fetch('/api/configuration').then(r => r.json()).then(cfg => {
      if (cfg.tarifs) setTarifs(cfg.tarifs);
    }).catch(() => {});
  }, [session]);

  const handleLogout = () => {
    localStorage.removeItem('parent_session');
    localStorage.removeItem('parent_children');
    window.location.hash = '#';
  };

  const handleRdvBooked = (rdv: RendezVous) =>
    setAppointments(prev => [...prev, rdv]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="p-8 max-w-sm w-full text-center">
          <User size={32} className="text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700 mb-1">Session expirée</p>
          <p className="text-xs text-[#6B7280] mb-5">Veuillez vous reconnecter pour accéder à votre espace.</p>
          <button onClick={() => { window.location.hash = '#/espace-parent'; }}
            className="w-full py-2.5 rounded-md bg-[#0D2E5C] text-white text-sm font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
            Se reconnecter
          </button>
        </Card>
      </div>
    );
  }

  const initials     = `${session.prenomParent[0]}${session.nomParent[0]}`.toUpperCase();
  const unreadMsgs   = messages.filter(m => !m.lu).length;
  const pendingRdv   = appointments.filter(r => r.statut !== StatutRendezVous.ANNULE && new Date(r.dateHeure) >= new Date()).length;

  const badges: Partial<Record<ParentTab, number>> = {
    messagerie: unreadMsgs,
    finances:   pendingRdv,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* ══ SIDEBAR ════════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[220px] bg-[#0A1628] flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-white/8 shrink-0">
          <img src="/img/logo.jpg" alt="EPV" className="w-8 h-8 rounded-md object-contain bg-white/95 p-0.5" />
          <div>
            <p className="text-[12px] font-bold text-white leading-tight">Espace Parent</p>
            <p className="text-[9px] text-white/35 font-sans uppercase tracking-wider">EPV Horizons Savants</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
          <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {NAV.map(({ id, label, Icon }) => {
            const badge  = badges[id];
            const active = tab === id;
            return (
              <button key={id} onClick={() => { setTab(id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-[12.5px] font-sans transition-all cursor-pointer
                  ${active
                    ? 'bg-white/10 text-white border-l-2 border-[#F5A623]'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}>
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 font-medium truncate">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[9px] font-bold bg-[#F5A623] text-[#0A1628] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profil & Déconnexion */}
        <div className="px-2.5 py-3 border-t border-white/8 space-y-0.5 shrink-0">
          <button onClick={() => { setTab('profil' as ParentTab); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-[12.5px] transition-all cursor-pointer
              ${tab === 'profil' ? 'bg-white/10 text-white border-l-2 border-[#F5A623]' : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}>
            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[11px] truncate">{session.prenomParent} {session.nomParent}</p>
              <p className="text-[9px] text-white/30 truncate">{session.email}</p>
            </div>
          </button>

          <button onClick={() => { window.location.hash = '#'; }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/35 hover:text-white/70 hover:bg-white/5 text-[11.5px] font-sans transition-all cursor-pointer">
            <ArrowLeft size={13} className="shrink-0" /> Retour au site
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-[11.5px] font-sans transition-all cursor-pointer">
            <LogOut size={13} className="shrink-0" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:ml-[220px]">

        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 gap-4 shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#F4F8FF] cursor-pointer transition-colors">
            <Menu size={17} className="text-slate-500" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6B7280] flex-1">
            <span className="text-slate-300">EPV</span>
            <ChevronRight size={13} className="text-slate-200" />
            <span className="font-semibold text-slate-700">
              {[...NAV, { id: 'profil', label: 'Mon profil' }].find(n => n.id === tab)?.label}
            </span>
          </div>

          {/* Notif + avatar */}
          <div className="flex items-center gap-2">
            {unreadMsgs > 0 && (
              <button onClick={() => setTab('messagerie')}
                className="relative p-2 rounded-md hover:bg-[#F4F8FF] cursor-pointer transition-colors">
                <Bell size={16} className="text-[#6B7280]" />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F5A623] text-[#0A1628] text-[8px] font-bold flex items-center justify-center">
                  {unreadMsgs}
                </span>
              </button>
            )}
            <button onClick={() => setTab('profil' as ParentTab)}
              className="w-8 h-8 rounded-full bg-[#0D2E5C] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
              {initials}
            </button>
          </div>
        </header>

        {/* ── Sélecteur d'enfants (si plusieurs) ── */}
        {allChildren.length > 1 && (
          <div className="border-b border-[#E5E7EB] bg-white px-4 md:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap shrink-0">Enfant :</span>
            {allChildren.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(idx)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0"
                style={{
                  background: childIdx === idx ? '#0D2E5C' : '#F1F5F9',
                  color:      childIdx === idx ? 'white'   : '#64748B',
                  boxShadow:  childIdx === idx ? '0 2px 8px rgba(13,46,92,0.25)' : 'none',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: childIdx === idx ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }}
                >
                  {idx + 1}
                </div>
                {child.prenomEnfant} {child.nomEnfant}
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: childIdx === idx ? 'rgba(255,255,255,0.15)' : '#E2E8F0',
                    color:      childIdx === idx ? 'rgba(255,255,255,0.8)' : '#94A3B8',
                  }}
                >
                  {SECTION_LABEL[child.sectionVisee] || child.sectionVisee}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={`${tab}-${session.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              {tab === 'dashboard'  && <DashboardTab session={session} appointments={appointments} devoirs={devoirs} cantine={cantine} notes={notes} absences={absences} messages={messages} evenements={evenements} paiements={paiements} reduction={reduction} tarifs={tarifs} onTabChange={setTab} />}
              {tab === 'parcours'   && <ParcoursTab  session={session} devoirs={devoirs} setDevoirs={setDevoirs} notes={notes} absences={absences} bilinguisme={bilinguisme} />}
              {tab === 'bulletins'  && <BulletinParentTab session={session} />}
              {tab === 'vie'        && <VieScolaireTab session={session} cantine={cantine} evenements={evenements} transport={transport} sante={sante} />}
              {tab === 'finances'   && <FinancesTab  session={session} appointments={appointments} paiements={paiements} reduction={reduction} tarifs={tarifs} onRdvBooked={handleRdvBooked} onToast={setToast} />}
              {tab === 'messagerie' && <MessageTab   session={session} messages={messages} setMessages={setMessages} onToast={setToast} />}
              {tab === 'parrainage' && <ParrainageTab session={session} reduction={reduction} onToast={setToast} />}
              {(tab as string) === 'profil' && <ProfilTab session={session} sante={sante} onSessionUpdate={s => { setSession(s); localStorage.setItem('parent_session', JSON.stringify(s)); }} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toast && <Toast message={toast} type="info" onClose={() => setToast(null)} />}
    </div>
  );
};
