
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { checkSession, signOutNeon, apiFetch as authFetch } from '../lib/auth.ts';
import { BulletinsTab } from './admin/BulletinsTab.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Badge }       from '../components/ui/Badge.tsx';
import { KanbanBoard } from '../components/ui/KanbanBoard.tsx';
import { Toast }       from '../components/ui/Toast.tsx';
import { Prospect, RendezVous, NotificationLog, SectionPlace, StatutProspect, StatutRendezVous } from '../types.js';
import {
  LayoutGrid, Users, Calendar, GraduationCap, MessageSquare,
  BarChart2, Scan, Settings, RefreshCw, LogOut, Menu, X,
  ChevronLeft, ChevronRight, Search, Kanban, CheckCircle,
  AlertCircle, Clock, TrendingUp, Award, FileText, Bell,
  Download, Mail, Phone, MapPin, CreditCard, Activity,
  BookOpen, Briefcase, Wallet, Image, HelpCircle, Star,
  Terminal, PenTool, Target, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownRight, Minus, Eye, Filter,
  MoreHorizontal, UserCheck, Archive, XCircle, Layers,
  Globe, PieChart, Zap, AlertTriangle, Info, Send, Printer,
  Plus, Trash2, Edit2, Upload, ThumbsUp, ThumbsDown, Pin,
  BadgeCheck, ExternalLink, ToggleLeft, ToggleRight, Hash,
  Coffee, Wrench, Megaphone, BookMarked
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab =
  | 'dashboard'    | 'statistiques'
  | 'annuaire'     | 'inscriptions' | 'classes'    | 'assiduite' | 'bulletins'
  | 'enseignants'  | 'rh'
  | 'scolarites'   | 'facturation'  | 'depenses'
  | 'newsletters'  | 'messages'     | 'notif-log'
  | 'blog'         | 'faq'          | 'galerie'    | 'temoignages'
  | 'configuration'| 'qrmarketing'  | 'logs';

type SortDir = 'asc' | 'desc' | null;

interface DataProps {
  prospects:     Prospect[];
  appointments:  RendezVous[];
  quotas:        SectionPlace[];
  notifications: NotificationLog[];
  contacts:      any[];
  tarifs:        Record<string,number>;
  config:        Record<string,any>;
  onProspectStatus: (id: string, s: StatutProspect) => void;
  onRdvStatus:      (id: string, s: StatutRendezVous) => void;
  onContactStatus:  (id: string, s: string) => void;
  onToast:          (msg: string) => void;
  onRefresh:        () => void;
  onTabChange:      (t: AdminTab) => void;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_GROUPS: { group: string; items: { id: AdminTab; label: string; Icon: React.FC<any> }[] }[] = [
  {
    group: 'GÉNÉRAL',
    items: [
      { id: 'dashboard',    label: 'Tableau de bord', Icon: LayoutGrid  },
      { id: 'statistiques', label: 'Statistiques',    Icon: BarChart2   },
    ],
  },
  {
    group: 'GESTION ÉLÈVES',
    items: [
      { id: 'annuaire',     label: 'Annuaire',           Icon: Users          },
      { id: 'inscriptions', label: 'Inscriptions',     Icon: FileText       },
      { id: 'classes',      label: 'Classes & Quotas', Icon: GraduationCap  },
      { id: 'bulletins',    label: 'Notes & Bulletins', Icon: BookMarked    },
      { id: 'assiduite',    label: 'Assiduité',        Icon: Activity       },
    ],
  },
  {
    group: 'PERSONNEL',
    items: [
      { id: 'enseignants', label: 'Enseignants',    Icon: BookOpen  },
      { id: 'rh',          label: 'Administration', Icon: Briefcase },
    ],
  },
  {
    group: 'FINANCES',
    items: [
      { id: 'scolarites',  label: 'Scolarités',  Icon: GraduationCap },
      { id: 'facturation', label: 'Facturation', Icon: CreditCard    },
      { id: 'depenses',    label: 'Dépenses',    Icon: Wallet        },
    ],
  },
  {
    group: 'COMMUNICATION',
    items: [
      { id: 'newsletters', label: 'Newsletters',       Icon: Mail          },
      { id: 'messages',    label: 'Messages Parents',  Icon: MessageSquare },
      { id: 'notif-log',   label: 'Notifications',     Icon: Bell          },
    ],
  },
  {
    group: 'SITE WEB (CMS)',
    items: [
      { id: 'blog',         label: 'Blog',         Icon: PenTool    },
      { id: 'faq',          label: 'FAQ',          Icon: HelpCircle },
      { id: 'galerie',      label: 'Galerie',      Icon: Image      },
      { id: 'temoignages',  label: 'Témoignages',  Icon: Star       },
    ],
  },
  {
    group: 'PARAMÈTRES',
    items: [
      { id: 'configuration', label: 'Configuration', Icon: Settings  },
      { id: 'qrmarketing',   label: 'QR Marketing',  Icon: Scan      },
      { id: 'logs',          label: 'Logs système',  Icon: Terminal  },
    ],
  },
];

// ─── Helpers & constants ──────────────────────────────────────────────────────

const MONTH_ABBR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DAY_ABBR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const SECTION_LABEL: Record<string, string> = {
  PS:'Petite Section', MS:'Moyenne Section', GS:'Grande Section',
  CP1:'CP1 (CPI)', CP2:'CP2 (CPII)', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};

const statutColor = (s: StatutProspect) =>
  s === StatutProspect.PROSPECT   ? 'bg-amber-50 text-amber-700 border-amber-200'  :
  s === StatutProspect.PRE_INSCRIT ? 'bg-blue-50 text-blue-700 border-blue-200'    :
  s === StatutProspect.INSCRIT     ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                     'bg-slate-50 text-slate-500 border-slate-200';

const rdvColor = (s: StatutRendezVous) =>
  s === StatutRendezVous.CONFIRME ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  s === StatutRendezVous.ANNULE   ? 'bg-red-50 text-red-600 border-red-200'            :
  s === StatutRendezVous.FAIT     ? 'bg-slate-50 text-slate-500 border-slate-200'      :
                                    'bg-blue-50 text-blue-700 border-blue-200';

const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('fr-FR', opts || { day:'numeric', month:'short', year:'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

const TARIFS_DEFAUT: Record<string, number> = {
  PS:1350000, MS:1350000, GS:1350000,
  CP1:1650000, CP2:1650000, CE1:1650000, CE2:1650000,
  CM1:1880000, CM2:1880000,
};

// ─── Export CSV client-side ───────────────────────────────────────────────────

function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(';');
  const body = rows.map(r =>
    keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(';')
  );
  const csv = '﻿' + [header, ...body].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Helper fetch générique
async function apiFetch(path: string) {
  const r = await authFetch(path);
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}
async function apiPatch(path: string, body: any) {
  return authFetch(path, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
}
async function apiPost(path: string, body: any) {
  return authFetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
}
async function apiDelete(path: string) {
  return authFetch(path, { method:'DELETE' });
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
      <div>
        <h3 className="text-sm font-semibold text-[#2C2C2C]">{title}</h3>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function StatBadge({ label, statut }: { label: string; statut: string }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${statut}`}>
      {label}
    </span>
  );
}

function MiniChart({ values, color = '#0D2E5C', fill = false }: { values: number[]; color?: string; fill?: boolean }) {
  if (values.length < 2) return null;
  const W = 80; const H = 28; const P = 3;
  const min = Math.min(...values); const max = Math.max(...values);
  const rng = max - min || 1;
  const pts = values.map((v, i) => ({
    x: P + (i / (values.length - 1)) * (W - 2 * P),
    y: H - P - ((v - min) / rng) * (H - 2 * P),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = fill ? `${d} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z` : '';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      {fill && <path d={fillD} fill={color} opacity="0.08" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={color} />
    </svg>
  );
}

function KpiCard({ label, value, sub, trend, Icon, chart }: {
  label: string; value: string | number; sub?: string;
  trend?: { val: string; up: boolean | null };
  Icon: React.FC<any>; chart?: number[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon size={15} className="text-slate-400" />
        </div>
        {chart && <MiniChart values={chart} color="#0D2E5C" fill />}
      </div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-[#2C2C2C] mt-1">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
            trend.up === null ? 'text-slate-400' : trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.up === null ? <Minus size={10} /> : trend.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend.val}
          </span>
        )}
        {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
      </div>
    </Card>
  );
}

function SortBtn({ col, current, dir, onClick }: { col: string; current: string; dir: SortDir; onClick: () => void }) {
  const active = current === col;
  return (
    <button onClick={onClick} className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
      <span>{col}</span>
      <span className="flex flex-col">
        <ChevronUp size={8} className={active && dir === 'asc' ? 'text-slate-800' : 'text-slate-300'} />
        <ChevronDown size={8} className={active && dir === 'desc' ? 'text-slate-800' : 'text-slate-300'} />
      </span>
    </button>
  );
}

function ComingSoon({ module }: { module: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <Layers size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{module}</p>
      <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
        Ce module est en cours de développement et sera disponible dans une prochaine version.
      </p>
      <span className="mt-4 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
        En développement
      </span>
    </div>
  );
}

function PageLayout({ title, sub, actions, children }: {
  title: string; sub?: string; actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[#2C2C2C]">{title}</h1>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Prospect Detail Drawer ───────────────────────────────────────────────────

function ProspectDrawer({ prospect, appointments, onClose, onStatus, onToast, onRefresh }: {
  prospect: Prospect; appointments: RendezVous[];
  onClose: () => void; onStatus: (id: string, s: StatutProspect) => void;
  onToast: (m: string) => void; onRefresh: () => void;
}) {
  const rdvs = appointments.filter(r =>
    r.email?.toLowerCase() === prospect.email.toLowerCase() || r.telephone === prospect.telephone
  ).sort((a, b) => +new Date(b.dateHeure) - +new Date(a.dateHeure));

  const STEPS = [
    { s: StatutProspect.PROSPECT,    label: 'Prospect',     desc: 'Dossier soumis' },
    { s: StatutProspect.PRE_INSCRIT, label: 'Pré-inscrit',  desc: 'Évaluation planifiée' },
    { s: StatutProspect.INSCRIT,     label: 'Inscrit',      desc: 'Place confirmée' },
  ];
  const stepIdx = STEPS.findIndex(s => s.s === prospect.statut);

  const [photoUrl,     setPhotoUrl]     = useState(prospect.photoUrl ?? null);
  const [uploading,    setUploading]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { onToast('Fichier non valide. Choisissez une image.'); return; }
    if (file.size > 5 * 1024 * 1024) { onToast('Image trop lourde (max 5 Mo).'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const r = await authFetch(`/api/prospects/${prospect.id}/photo`, { method: 'POST', body: form });
      const data = await r.json();
      if (data.url) { setPhotoUrl(data.url); onToast('Photo mise à jour ✓'); onRefresh(); }
      else onToast('Erreur upload.');
    } catch { onToast('Erreur upload.'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDeletePhoto = async () => {
    if (!photoUrl) return;
    setUploading(true);
    try {
      await authFetch(`/api/prospects/${prospect.id}/photo`, { method: 'DELETE' });
      setPhotoUrl(null); onToast('Photo supprimée.'); onRefresh();
    } catch { onToast('Erreur suppression.'); }
    finally { setUploading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <motion.div initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header avec photo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {/* Avatar photo */}
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt={prospect.prenomEnfant}
                    className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-slate-400 select-none">
                    {prospect.prenomEnfant[0]}{prospect.nomEnfant[0]}
                  </span>
                )}
              </div>
              {/* Overlay caméra au survol */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                {uploading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Upload size={14} className="text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{prospect.prenomEnfant} {prospect.nomEnfant}</p>
              <p className="text-[11px] text-slate-400">{SECTION_LABEL[prospect.sectionVisee] || prospect.sectionVisee}</p>
              {photoUrl && (
                <button onClick={handleDeletePhoto} disabled={uploading}
                  className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer transition-colors mt-0.5">
                  Supprimer photo
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Statut & actions */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Statut du dossier</p>
            <div className="flex items-center gap-3 mb-4">
              {STEPS.map((step, i) => {
                const done = i <= stepIdx;
                return (
                  <React.Fragment key={step.s}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${done ? 'bg-[#0D2E5C] border-[#0D2E5C]' : 'bg-white border-slate-200'}`}>
                        {done && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={`text-[9px] font-semibold ${done ? 'text-[#0D2E5C]' : 'text-slate-300'}`}>{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mb-4 ${i < stepIdx ? 'bg-[#0D2E5C]' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { onStatus(prospect.id, StatutProspect.PRE_INSCRIT); onToast('Statut → Pré-inscrit'); }}
                disabled={prospect.statut === StatutProspect.PRE_INSCRIT}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold hover:bg-blue-100 cursor-pointer disabled:opacity-40 transition-colors">
                <UserCheck size={11} /> Pré-inscrire
              </button>
              <button onClick={() => { onStatus(prospect.id, StatutProspect.INSCRIT); onToast('Statut → Inscrit'); }}
                disabled={prospect.statut === StatutProspect.INSCRIT}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer disabled:opacity-40 transition-colors">
                <CheckCircle size={11} /> Inscrire
              </button>
              <button onClick={() => { onStatus(prospect.id, StatutProspect.ARCHIVE); onToast('Dossier archivé'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold hover:bg-slate-100 cursor-pointer transition-colors">
                <Archive size={11} /> Archiver
              </button>
            </div>
          </Card>

          {/* Infos enfant */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Profil de l'enfant</p>
            <div className="space-y-2">
              {[
                { l: 'Nom complet',   v: `${prospect.prenomEnfant} ${prospect.nomEnfant}` },
                { l: 'Date de naissance', v: fmtDate(prospect.dateNaissance) },
                { l: 'Classe visée', v: `${SECTION_LABEL[prospect.sectionVisee] || prospect.sectionVisee} (${prospect.sectionVisee})` },
                { l: 'Dossier créé', v: fmtDate(prospect.createdAt) },
                { l: 'Dernière MàJ', v: fmtDate(prospect.updatedAt) },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-[11px] text-slate-400">{r.l}</span>
                  <span className="text-[11px] font-semibold text-slate-800">{r.v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Infos parent */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Responsable légal</p>
            <div className="space-y-2">
              {[
                { l: 'Identité', v: `${prospect.prenomParent} ${prospect.nomParent} (${prospect.lienParente})` },
                { l: 'Téléphone', v: prospect.telephone },
                { l: 'Email', v: prospect.email },
                { l: 'Commune', v: `${prospect.commune}, Abidjan` },
                { l: 'Source', v: prospect.source || '—' },
                { l: 'Code parrainage', v: prospect.codeParrainagePersonnel },
              ].map(r => (
                <div key={r.l} className="flex items-start justify-between py-1.5 border-b border-slate-50 gap-3">
                  <span className="text-[11px] text-slate-400 shrink-0">{r.l}</span>
                  <span className="text-[11px] font-semibold text-slate-800 text-right break-all">{r.v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Rendez-vous */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Rendez-vous ({rdvs.length})
            </p>
            {rdvs.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3">Aucun rendez-vous enregistré</p>
            ) : (
              <div className="space-y-2">
                {rdvs.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">{r.typeRdv}</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(r.dateHeure, { day:'numeric', month:'short' })} · {fmtTime(r.dateHeure)}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${rdvColor(r.statut)}`}>{r.statut}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notes admin */}
          {prospect.notesAdmin && (
            <Card className="p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Notes internes</p>
              <p className="text-xs text-slate-700 leading-relaxed">{prospect.notesAdmin}</p>
            </Card>
          )}

          {/* ── Notes & résultats ── */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Notes & Résultats</p>
            <NotesSection prospectId={prospect.id} />
          </Card>

          {/* ── Scolarité / paiements ── */}
          <Card className="p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Scolarité</p>
            <ScolariteSection prospect={prospect} />
          </Card>

          {/* ── Saisie pédagogique rapide ── */}
          <SaisiePedagogique prospect={prospect} onToast={onToast} onRefresh={onRefresh} />

          {/* ── Envoyer un message au parent ── */}
          <EnvoyerMessageParent prospect={prospect} onToast={onToast} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Saisie notes + devoirs par élève ──────────────────────────── */
const MATIERES_DEFAUT = ['Français','Mathématiques','Anglais','Sciences','Éducation civique','Arts plastiques','EPS'];

function SaisiePedagogique({ prospect, onToast, onRefresh }: {
  prospect: Prospect; onToast: (m: string) => void; onRefresh: () => void;
}) {
  const [matieres, setMatieres] = useState<string[]>(MATIERES_DEFAUT);
  const [sub, setSub]           = useState<'note'|'devoir'>('note');
  const [matiere, setMatiere]   = useState(MATIERES_DEFAUT[0]);

  useEffect(() => {
    fetch('/api/configuration').then(r => r.json()).then(cfg => {
      if (Array.isArray(cfg.matieres) && cfg.matieres.length > 0) {
        setMatieres(cfg.matieres);
        setMatiere(cfg.matieres[0]);
      }
    }).catch(() => {});
  }, []);
  const [t1, setT1]           = useState('');
  const [t2, setT2]           = useState('');
  const [sujet, setSujet]     = useState('');
  const [rendu, setRendu]     = useState('Demain');

  const submitNote = async () => {
    if (!t1 && !t2) { onToast('Renseignez au moins une note.'); return; }
    await apiPost('/api/notes', {
      prospectId: prospect.id, matiere,
      t1: t1 ? parseFloat(t1) : null,
      t2: t2 ? parseFloat(t2) : null,
      coef: matiere === 'Français' || matiere === 'Mathématiques' ? 4 : matiere === 'Anglais' ? 3 : matiere === 'Sciences' ? 2 : 1,
    });
    onToast(`Note ${matiere} enregistrée pour ${prospect.prenomEnfant}.`);
    setT1(''); setT2(''); onRefresh();
  };

  const submitDevoir = async () => {
    if (!sujet.trim()) { onToast('Renseignez le sujet du devoir.'); return; }
    await apiPost('/api/devoirs', { prospectId: prospect.id, matiere, sujet, rendu, statut: 'pending' });
    onToast(`Devoir ${matiere} ajouté pour ${prospect.prenomEnfant}.`);
    setSujet(''); onRefresh();
  };

  return (
    <Card className="p-4">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Saisie pédagogique</p>
      <div className="flex gap-1 mb-3">
        {[['note','Note'],['devoir','Devoir']].map(([v,l]) => (
          <button key={v} onClick={() => setSub(v as any)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-colors
              ${sub===v?'bg-[#0D2E5C] text-white border-[#0D2E5C]':'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        <select value={matiere} onChange={e => setMatiere(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
          {matieres.map(m => <option key={m}>{m}</option>)}
        </select>
        {sub === 'note' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">T1 /20</label>
              <input type="number" min="0" max="20" step="0.5" value={t1} onChange={e => setT1(e.target.value)}
                placeholder="ex: 15.5"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">T2 /20</label>
              <input type="number" min="0" max="20" step="0.5" value={t2} onChange={e => setT2(e.target.value)}
                placeholder="ex: 16.0"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
            </div>
          </div>
        ) : (
          <>
            <input value={sujet} onChange={e => setSujet(e.target.value)} placeholder="Sujet du devoir..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
            <select value={rendu} onChange={e => setRendu(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
              {['Demain','Jeudi','Vendredi','Lundi','Mardi'].map(j => <option key={j}>{j}</option>)}
            </select>
          </>
        )}
        <button onClick={sub === 'note' ? submitNote : submitDevoir}
          className="w-full py-2 rounded-md bg-[#0D2E5C] text-white text-[10px] font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors flex items-center justify-center gap-1.5">
          <CheckCircle size={12} /> Enregistrer {sub === 'note' ? 'la note' : 'le devoir'}
        </button>
      </div>
    </Card>
  );
}

/* ─── Envoyer un message au parent depuis l'admin ───────────────── */
function EnvoyerMessageParent({ prospect, onToast }: {
  prospect: Prospect; onToast: (m: string) => void;
}) {
  const [contenu, setContenu] = useState('');
  const [expediteur, setExpediteur] = useState('Direction EPV Horizons Savants');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!contenu.trim()) return;
    setSending(true);
    await apiPost('/api/messages', {
      prospectId: prospect.id,
      de: expediteur,
      date: new Date().toISOString(),
      lu: false,
      contenu: contenu.trim(),
    });
    onToast(`Message envoyé à ${prospect.prenomParent} ${prospect.nomParent}.`);
    setContenu('');
    setSending(false);
  };

  return (
    <Card className="p-4">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Envoyer un message au parent</p>
      <div className="space-y-2.5">
        <select value={expediteur} onChange={e => setExpediteur(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
          {['Direction EPV Horizons Savants','Service Infirmerie EPV','Mme Bamba — Titulaire CP'].map(e => <option key={e}>{e}</option>)}
        </select>
        <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={3}
          placeholder={`Message pour ${prospect.prenomParent} ${prospect.nomParent}...`}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md resize-none focus:outline-none focus:border-slate-400" />
        <button onClick={send} disabled={sending || !contenu.trim()}
          className="w-full py-2 rounded-md bg-[#0D2E5C] text-white text-[10px] font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
          <Send size={12} /> {sending ? 'Envoi...' : `Envoyer à ${prospect.prenomParent}`}
        </button>
      </div>
    </Card>
  );
}

/* ─── Notes d'un élève dans le drawer ───────────────────────── */
function NotesSection({ prospectId }: { prospectId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/notes/eleve/${prospectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setNotes(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [prospectId]);

  if (loading) return <p className="text-[11px] text-slate-400 text-center py-3">Chargement…</p>;
  if (!notes.length) return <p className="text-[11px] text-slate-400 text-center py-3">Aucune note enregistrée pour cet élève.</p>;

  const fmtNote = (v: any) => v != null && v !== '' ? Number(v).toFixed(1) : '—';
  const moy = (n: any) => {
    const vals = [n.t1, n.t2, n.t3].filter(v => v != null && v !== '').map(Number);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[260px]">
        <thead>
          <tr className="border-b border-slate-100">
            {['Matière','T1','T2','T3','Moy.'].map(h => (
              <th key={h} className={`py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide ${h === 'Matière' ? 'text-left' : 'text-center'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {notes.map(n => (
            <tr key={n.matiere}>
              <td className="py-2 text-slate-700 font-medium pr-2">{n.matiere}</td>
              {[n.t1, n.t2, n.t3].map((v, i) => (
                <td key={i} className={`py-2 text-center font-mono ${v != null ? (v >= 10 ? 'text-emerald-700' : 'text-red-600') : 'text-slate-300'}`}>
                  {fmtNote(v)}
                </td>
              ))}
              <td className="py-2 text-center font-mono font-bold text-slate-800">{moy(n)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Scolarité / paiements dans le drawer ───────────────────── */
function ScolariteSection({ prospect }: { prospect: Prospect }) {
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/paiements')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        setPaiements(Array.isArray(d) ? d.filter((p: any) => p.prospectId === prospect.id) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [prospect.id]);

  const annuel = TARIFS_DEFAUT[prospect.sectionVisee] || 1500000;
  const t1v = Math.round(annuel / 3);
  const t2v = Math.round(annuel / 3);
  const t3v = annuel - t1v - t2v;
  const hasPay = (trim: string) => paiements.some(p => p.trimestre === trim && p.statut === 'validé');
  const totalPayé = paiements.filter(p => ['T1','T2','T3'].includes(p.trimestre) && p.statut === 'validé')
    .reduce((s: number, p: any) => s + Number(p.montant), 0);
  const solde = annuel - totalPayé;
  const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' F';

  if (loading) return <p className="text-[11px] text-slate-400 text-center py-3">Chargement…</p>;

  return (
    <div className="space-y-1.5">
      {([['T1', t1v], ['T2', t2v], ['T3', t3v]] as [string, number][]).map(([k, v]) => {
        const paid = hasPay(k);
        return (
          <div key={k} className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 w-6">{k}</span>
            <span className="text-[11px] font-mono text-slate-600 flex-1 text-center">{fmtF(v)}</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${paid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {paid ? 'Payé' : 'En attente'}
            </span>
          </div>
        );
      })}
      <div className={`flex items-center justify-between p-2.5 rounded-md border mt-2 ${solde > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
        <span className="text-xs font-bold text-slate-700">Solde restant</span>
        <span className={`text-sm font-bold ${solde > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {solde > 0 ? fmtF(solde) : 'À jour ✓'}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 text-right">Total annuel : {fmtF(annuel)}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

function DashboardTab({ prospects, appointments, quotas, contacts, tarifs, onTabChange }: DataProps) {
  const total     = prospects.length;
  const inscrits  = prospects.filter(p => p.statut === StatutProspect.INSCRIT).length;
  const preInsc   = prospects.filter(p => p.statut === StatutProspect.PRE_INSCRIT).length;
  const prospect  = prospects.filter(p => p.statut === StatutProspect.PROSPECT).length;
  const msgPending = contacts.filter(c => c.statut !== 'Traité').length;
  const rdvVenir  = appointments.filter(r => r.statut !== StatutRendezVous.ANNULE && new Date(r.dateHeure) >= new Date()).length;

  const recent   = useMemo(() => [...prospects].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8), [prospects]);
  const upcoming = useMemo(() => [...appointments].filter(r => new Date(r.dateHeure) >= new Date() && r.statut !== StatutRendezVous.ANNULE)
    .sort((a,b) => +new Date(a.dateHeure) - +new Date(b.dateHeure)).slice(0, 6), [appointments]);

  const revenusEstimes = useMemo(() => {
    const inscrits = prospects.filter(p => p.statut === StatutProspect.INSCRIT || p.statut === StatutProspect.PRE_INSCRIT);
    const total = inscrits.reduce((s, p) => s + (tarifs[p.sectionVisee] || TARIFS_DEFAUT[p.sectionVisee] || 1500000), 0);
    return total > 0 ? total.toLocaleString('fr-FR') + ' F' : '—';
  }, [prospects]);

  // Moy. jours entre soumission dossier (createdAt) et inscription confirmée (updatedAt du prospect INSCRIT)
  const moyJoursInscrit = useMemo(() => {
    const inscrits = prospects.filter(p => p.statut === StatutProspect.INSCRIT && p.createdAt && p.updatedAt);
    if (inscrits.length === 0) return '—';
    const diffs = inscrits.map(p => (+new Date(p.updatedAt) - +new Date(p.createdAt)) / 86_400_000).filter(d => d >= 0 && d < 365);
    if (!diffs.length) return '—';
    return `${Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)} j`;
  }, [prospects]);

  return (
    <PageLayout title="Tableau de bord"
      sub={`${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} · EPV Horizons Savants`}>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total dossiers"   value={total}    sub={`dont ${inscrits} inscrits`}
          trend={{ val: `${prospect} prospects`, up: null }} Icon={Users} />
        <KpiCard label="En attente"       value={preInsc}  sub="Pré-inscrits à traiter"
          trend={{ val: `${prospect} prospects`, up: null }} Icon={Clock} />
        <KpiCard label="Revenus estimés"  value={revenusEstimes} sub="FCFA · scolarités cumulées"
          Icon={CreditCard} />
        <KpiCard label="Taux de présence" value="—" sub="Données à configurer"
          Icon={Activity} />
      </div>

      {/* Row 2: Funnel + RDV */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Entonnoir de conversion" sub="Prospects → Pré-inscrits → Inscrits"
            action={
              <button onClick={() => onTabChange('statistiques')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                Statistiques <ChevronRight size={12} />
              </button>
            }
          />
          <div className="p-5 space-y-4">
            {[
              { label:'Prospects',   count: prospect,  pct: total>0?Math.round((prospect/total)*100):0,   color:'bg-amber-400' },
              { label:'Pré-inscrits', count: preInsc,  pct: total>0?Math.round((preInsc/total)*100):0,    color:'bg-blue-500'  },
              { label:'Inscrits',    count: inscrits,  pct: total>0?Math.round((inscrits/total)*100):0,   color:'bg-emerald-500' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{s.label}</span>
                  <span className="font-mono text-slate-500">{s.count} — {s.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${s.color}`}
                    initial={{ width:0 }} animate={{ width:`${s.pct}%` }} transition={{ duration:0.7, delay:i*0.1 }} />
                </div>
              </div>
            ))}
            <div className="pt-2 grid grid-cols-3 gap-3 text-center">
              {[
                { l:'Taux conv. global', v: total>0?`${Math.round((inscrits/total)*100)}%`:'0%' },
                { l:'Moy. jours → inscrit', v: moyJoursInscrit },
                { l:'Taux abandon', v: total>0?`${Math.round(((total-inscrits-preInsc-prospect)/total)*100) || 0}%`:'0%' },
              ].map(s => (
                <div key={s.l} className="bg-slate-50 rounded-md p-3 border border-slate-100">
                  <p className="font-bold text-base text-slate-900">{s.v}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quotas sections */}
        <Card>
          <CardHeader title="Occupation des classes"
            action={
              <button onClick={() => onTabChange('classes')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                Détail
              </button>
            }
          />
          <div className="p-5 space-y-3">
            {quotas.map(q => {
              const pct = Math.round((q.inscritsConfirmes / q.capaciteMax) * 100);
              const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500';
              return (
                <div key={q.section}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-600">{q.section}</span>
                    <span className="font-mono text-slate-400">{q.inscritsConfirmes}/{q.capaciteMax}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width:`${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3: Recent dossiers + Upcoming RDV */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent dossiers — mini table */}
        <Card>
          <CardHeader title="Derniers dossiers reçus"
            action={
              <button onClick={() => onTabChange('annuaire')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                Voir tout <ChevronRight size={12} />
              </button>
            }
          />
          <div className="divide-y divide-slate-50">
            {recent.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Aucun dossier</p>
            ) : recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-md bg-[#0D2E5C] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {p.sectionVisee}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.prenomEnfant} {p.nomEnfant}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.prenomParent} {p.nomParent} · {p.commune}</p>
                </div>
                <StatBadge label={p.statut} statut={statutColor(p.statut)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming RDV */}
        <Card>
          <CardHeader title="Prochains rendez-vous"
            action={
              <button onClick={() => onTabChange('inscriptions')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                Calendrier <ChevronRight size={12} />
              </button>
            }
          />
          <div className="divide-y divide-slate-50">
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Aucun RDV à venir</p>
            ) : upcoming.map(r => {
              const d = new Date(r.dateHeure);
              return (
                <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 flex flex-col items-center justify-center shrink-0">
                    <span className="font-bold text-xs text-slate-800 leading-none">{d.getDate()}</span>
                    <span className="text-[8px] text-slate-400 uppercase">{MONTH_ABBR[d.getMonth()]}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-semibold text-slate-800 truncate">{r.prenomParent} {r.nomParent}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} /> {fmtTime(r.dateHeure)} · {r.typeRdv}
                    </p>
                  </div>
                  <StatBadge label={r.statut} statut={rdvColor(r.statut)} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Alerts bar */}
      {(msgPending > 0 || rdvVenir > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {msgPending > 0 && (
            <Card className="border-l-4 border-l-amber-400">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={15} className="text-amber-500" />
                  <p className="text-xs font-semibold text-slate-800">
                    {msgPending} message{msgPending > 1 ? 's' : ''} en attente de traitement
                  </p>
                </div>
                <button onClick={() => onTabChange('messages')}
                  className="text-[11px] font-semibold text-slate-600 hover:underline cursor-pointer flex items-center gap-1">
                  Traiter <ChevronRight size={11} />
                </button>
              </div>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANNUAIRE (Data Grid)
// ════════════════════════════════════════════════════════════════════════════

function AnnuaireTab({ prospects, appointments, onProspectStatus, onToast, onRefresh }: DataProps) {
  const [search,    setSearch]    = useState('');
  const [section,   setSection]   = useState('ALL');
  const [statut,    setStatut]    = useState('ALL');
  const [commune,   setCommune]   = useState('ALL');
  const [sortCol,   setSortCol]   = useState('createdAt');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [selected,  setSelected]  = useState<Prospect | null>(null);
  const [page,      setPage]      = useState(0);
  const PER_PAGE = 15;

  const communes = useMemo(() => [...new Set(prospects.map(p => p.commune))].sort(), [prospects]);

  const sort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let data = prospects.filter(p => {
      const matchSearch = !q ||
        [p.nomEnfant, p.prenomEnfant, p.nomParent, p.prenomParent, p.email, p.telephone, p.commune].some(v => v?.toLowerCase().includes(q));
      const matchSection = section === 'ALL' || p.sectionVisee === section;
      const matchStatut  = statut  === 'ALL' || p.statut === statut;
      const matchCommune = commune === 'ALL' || p.commune === commune;
      return matchSearch && matchSection && matchStatut && matchCommune;
    });
    data.sort((a, b) => {
      let va: any = (a as any)[sortCol] || '';
      let vb: any = (b as any)[sortCol] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return data;
  }, [prospects, search, section, statut, commune, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const thClass = "px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap";
  const tdClass = "px-4 py-3.5 text-xs";

  return (
    <PageLayout title="Annuaire des dossiers"
      sub={`${filtered.length} enregistrement${filtered.length > 1 ? 's' : ''} · Année scolaire 2026`}
      actions={
        <button onClick={() => downloadCSV(filtered.map(p => ({
          'Prénom enfant': p.prenomEnfant, 'Nom enfant': p.nomEnfant,
          'Date naissance': fmtDate(p.dateNaissance), 'Section': p.sectionVisee,
          'Prénom parent': p.prenomParent, 'Nom parent': p.nomParent,
          'Lien': p.lienParente, 'Téléphone': p.telephone, 'Email': p.email,
          'Commune': p.commune, 'Source': p.source || '', 'Statut': p.statut,
          'Code parrainage': p.codeParrainagePersonnel, 'Date dossier': fmtDate(p.createdAt),
        })), `prospects_epv_${new Date().toISOString().slice(0,10)}.csv`)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
          <Download size={13} /> Exporter CSV ({filtered.length})
        </button>
      }
    >

      {/* Filter bar */}
      <Card className="p-3.5 flex flex-wrap gap-2.5 items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher nom, email, téléphone..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { val: section, setter: setSection, opts: [['ALL','Toutes sections'], ...['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'].map(s => [s,s])] },
            { val: statut,  setter: setStatut,  opts: [['ALL','Tous statuts'], [StatutProspect.PROSPECT,'Prospect'], [StatutProspect.PRE_INSCRIT,'Pré-inscrit'], [StatutProspect.INSCRIT,'Inscrit'], [StatutProspect.ARCHIVE,'Archivé']] },
            { val: commune, setter: setCommune, opts: [['ALL','Toutes communes'], ...communes.map(c => [c,c])] },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => { f.setter(e.target.value); setPage(0); }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white cursor-pointer">
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
        {(search || section !== 'ALL' || statut !== 'ALL' || commune !== 'ALL') && (
          <button onClick={() => { setSearch(''); setSection('ALL'); setStatut('ALL'); setCommune('ALL'); setPage(0); }}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer">
            <X size={12} /> Réinitialiser
          </button>
        )}
      </Card>

      {/* Data grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className={thClass}>
                  <SortBtn col="nomEnfant" current={sortCol} dir={sortDir} onClick={() => sort('nomEnfant')} />
                </th>
                <th className={thClass}>Section</th>
                <th className={thClass}>
                  <SortBtn col="nomParent" current={sortCol} dir={sortDir} onClick={() => sort('nomParent')} />
                </th>
                <th className={thClass}>Contact</th>
                <th className={thClass}>
                  <SortBtn col="commune" current={sortCol} dir={sortDir} onClick={() => sort('commune')} />
                </th>
                <th className={thClass}>
                  <SortBtn col="statut" current={sortCol} dir={sortDir} onClick={() => sort('statut')} />
                </th>
                <th className={thClass}>
                  <SortBtn col="createdAt" current={sortCol} dir={sortDir} onClick={() => sort('createdAt')} />
                </th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-slate-400">
                  <Users size={24} className="mx-auto mb-2 text-slate-300" />
                  Aucun dossier correspondant aux critères
                </td></tr>
              ) : paginated.map(p => (
                <tr key={p.id}
                  onClick={() => setSelected(p)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className={tdClass}>
                    <p className="font-semibold text-slate-800">{p.prenomEnfant} {p.nomEnfant}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(p.dateNaissance)}</p>
                  </td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center justify-center w-9 h-6 rounded bg-[#0D2E5C] text-white text-[10px] font-bold">
                      {p.sectionVisee}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <p className="font-medium text-slate-700">{p.prenomParent} {p.nomParent}</p>
                    <p className="text-[10px] text-slate-400">{p.lienParente}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="font-mono text-[11px] text-slate-600">{p.telephone}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{p.email}</p>
                  </td>
                  <td className={`${tdClass} text-slate-500`}>{p.commune}</td>
                  <td className={tdClass}>
                    <StatBadge label={p.statut} statut={statutColor(p.statut)} />
                  </td>
                  <td className={`${tdClass} text-slate-400 text-[11px]`}>{fmtDate(p.createdAt, { day:'numeric', month:'short' })}</td>
                  <td className={`${tdClass} text-right`} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onProspectStatus(p.id, StatutProspect.PRE_INSCRIT)}
                        className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" title="Pré-inscrire">
                        <UserCheck size={13} />
                      </button>
                      <button onClick={() => onProspectStatus(p.id, StatutProspect.INSCRIT)}
                        className="p-1.5 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors" title="Inscrire">
                        <CheckCircle size={13} />
                      </button>
                      <button onClick={() => setSelected(p)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" title="Détail">
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Affichage {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                <ChevronLeft size={14} className="text-slate-500" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded border text-[11px] font-semibold cursor-pointer transition-colors
                    ${page === i ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Prospect Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <ProspectDrawer
            prospect={selected}
            appointments={appointments}
            onClose={() => setSelected(null)}
            onStatus={(id, s) => { onProspectStatus(id, s); setSelected(null); }}
            onToast={onToast}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSCRIPTIONS (Calendrier RDV)
// ════════════════════════════════════════════════════════════════════════════

function InscriptionsTab({ appointments, prospects, onRdvStatus, onToast }: DataProps) {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [view, setView] = useState<'calendar'|'kanban'>('calendar');

  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay    = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rdvByDay = useMemo(() => {
    const map: Record<number, RendezVous[]> = {};
    appointments.forEach(r => {
      const d = new Date(r.dateHeure);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        map[day] = [...(map[day] || []), r];
      }
    });
    return map;
  }, [appointments, year, month]);

  const dayRdv = selectedDay
    ? (rdvByDay[selectedDay] || [])
    : appointments.filter(r => new Date(r.dateHeure) >= new Date() && r.statut !== StatutRendezVous.ANNULE)
        .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure)).slice(0, 10);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - firstDay + 1;
    return (d >= 1 && d <= daysInMonth) ? d : null;
  });

  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && year === today.getFullYear() && month === today.getMonth();

  return (
    <PageLayout title="Inscriptions & Calendrier RDV"
      sub="Gestion des rendez-vous et suivi du processus d'inscription"
      actions={
        <div className="flex items-center gap-1 border border-slate-200 rounded-md overflow-hidden">
          {[{id:'calendar',label:'Calendrier'},{id:'kanban',label:'Kanban'}].map(v => (
            <button key={v.id} onClick={() => setView(v.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer
                ${view === v.id ? 'bg-[#0D2E5C] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              {v.label}
            </button>
          ))}
        </div>
      }
    >
      {view === 'kanban' ? (
        <KanbanBoard prospects={prospects} onStatusChange={(id, s) => { onRdvStatus(id, s as any); }} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                  <ChevronLeft size={16} className="text-slate-500" />
                </button>
                <h3 className="text-sm font-semibold text-slate-800">
                  {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][month]} {year}
                </h3>
                <button onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {DAY_ABBR.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wide pb-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const hasRdv = !!rdvByDay[d];
                  const active = selectedDay === d;
                  const count  = rdvByDay[d]?.length || 0;
                  return (
                    <button key={i} onClick={() => setSelectedDay(active ? null : d)}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-md text-xs font-semibold cursor-pointer transition-all
                        ${active  ? 'bg-[#0D2E5C] text-white' :
                          isToday(d) ? 'border-2 border-[#0D2E5C] text-[#0D2E5C]' :
                          hasRdv ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                          'hover:bg-slate-50 text-slate-600'}`}>
                      {d}
                      {hasRdv && (
                        <span className={`text-[8px] font-bold leading-none ${active ? 'text-white/70' : 'text-blue-500'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* RDV panel */}
          <Card className="flex flex-col max-h-[520px]">
            <CardHeader title={selectedDay ? `${selectedDay} ${MONTH_ABBR[month]}` : 'Prochains RDV'} sub={`${dayRdv.length} rendez-vous`} />
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {dayRdv.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Calendar size={24} className="mb-2 text-slate-300" />
                  <p className="text-xs">Aucun rendez-vous{selectedDay ? ' ce jour' : ' à venir'}</p>
                </div>
              ) : dayRdv.map(r => {
                const d = new Date(r.dateHeure);
                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{r.prenomParent} {r.nomParent}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.typeRdv}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })} · {fmtTime(r.dateHeure)}
                        </p>
                      </div>
                      <StatBadge label={r.statut} statut={rdvColor(r.statut)} />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => onRdvStatus(r.id, StatutRendezVous.CONFIRME)}
                        className="flex-1 py-1.5 text-[10px] font-semibold rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors">
                        Confirmer
                      </button>
                      <button onClick={() => onRdvStatus(r.id, StatutRendezVous.FAIT)}
                        className="flex-1 py-1.5 text-[10px] font-semibold rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                        Effectué
                      </button>
                      <button onClick={() => onRdvStatus(r.id, StatutRendezVous.ANNULE)}
                        className="flex-1 py-1.5 text-[10px] font-semibold rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CLASSES & QUOTAS
// ════════════════════════════════════════════════════════════════════════════

function ClassesTab({ quotas, prospects, appointments, onProspectStatus, onToast, onRefresh }: DataProps) {
  const totalCap      = quotas.reduce((s, q) => s + q.capaciteMax, 0);
  const totalInscrits = quotas.reduce((s, q) => s + q.inscritsConfirmes, 0);
  const totalDispo    = totalCap - totalInscrits;

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedStudent,  setSelectedStudent]  = useState<Prospect | null>(null);

  const studentsInSection = (section: string) =>
    prospects.filter(p => p.sectionVisee === section &&
      (p.statut === StatutProspect.INSCRIT || p.statut === StatutProspect.PRE_INSCRIT));

  return (
    <PageLayout title="Classes & Quotas" sub="Capacité d'accueil par niveau — Rentrée 2026/2027">
      <div className="grid grid-cols-3 gap-4">
        {[
          { l:'Capacité totale', v:totalCap,     Icon:Layers      },
          { l:'Places occupées', v:totalInscrits, Icon:CheckCircle },
          { l:'Places libres',   v:totalDispo,    Icon:Activity    },
        ].map(s => (
          <KpiCard key={s.l} label={s.l} value={s.v} Icon={s.Icon} />
        ))}
      </div>
      <Card>
        <CardHeader title="Détail par section" sub="Cliquez sur une ligne pour voir les élèves" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Section','Niveau','Inscrits','Pré-inscrits','Capacité max','Places libres','Occupation',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotas.map(q => {
                const pct    = Math.round((q.inscritsConfirmes / q.capaciteMax) * 100);
                const dispo  = q.capaciteMax - q.inscritsConfirmes;
                const status = pct >= 80 ? 'text-red-600' : pct >= 60 ? 'text-amber-600' : 'text-emerald-600';
                const open   = expandedSection === q.section;
                const students = studentsInSection(q.section);
                return (
                  <React.Fragment key={q.section}>
                    <tr
                      onClick={() => setExpandedSection(open ? null : q.section)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>
                          <ChevronRight size={13} className="text-slate-400" />
                        </span>
                        {q.section}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{SECTION_LABEL[q.section] || q.section}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">{q.inscritsConfirmes}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">{q.preInscrits}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">{q.capaciteMax}</td>
                      <td className={`px-5 py-4 font-mono font-semibold ${dispo <= 3 ? 'text-red-600' : 'text-slate-700'}`}>{dispo}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                            <div className={`h-full rounded-full ${pct>=80?'bg-red-500':pct>=60?'bg-amber-400':'bg-emerald-500'}`} style={{ width:`${pct}%` }} />
                          </div>
                          <span className={`font-mono font-semibold text-[11px] ${status}`}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[10px] text-slate-400">{students.length} élève{students.length > 1 ? 's' : ''}</span>
                      </td>
                    </tr>

                    {/* Rangée dépliée — liste des élèves */}
                    {open && (
                      <tr>
                        <td colSpan={8} className="bg-slate-50/70 px-0 py-0 border-b border-slate-100">
                          {students.length === 0 ? (
                            <p className="px-10 py-4 text-xs text-slate-400 italic">Aucun élève inscrit dans cette section.</p>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {students.map(p => (
                                <div key={p.id}
                                  onClick={e => { e.stopPropagation(); setSelectedStudent(p); }}
                                  className="flex items-center gap-4 px-10 py-2.5 hover:bg-blue-50/40 cursor-pointer transition-colors group">
                                  <div className="flex-1">
                                    <span className="font-semibold text-slate-800 text-xs group-hover:text-brand-blue-medium transition-colors">
                                      {p.prenomEnfant} {p.nomEnfant}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-2">{p.prenomParent} {p.nomParent}</span>
                                  </div>
                                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                                    p.statut === StatutProspect.INSCRIT
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>{p.statut}</span>
                                  <Eye size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {selectedStudent && (
          <ProspectDrawer
            prospect={selectedStudent}
            appointments={appointments}
            onClose={() => setSelectedStudent(null)}
            onStatus={(id, s) => { onProspectStatus(id, s); setSelectedStudent(null); }}
            onToast={onToast}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATISTIQUES
// ════════════════════════════════════════════════════════════════════════════

function StatistiquesTab({ prospects }: DataProps) {
  const total = prospects.length;

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    prospects.forEach(p => { const s = p.source || 'Autre'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [prospects]);

  const sectionData = useMemo(() =>
    ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'].map(s => ({
      s, count: prospects.filter(p => p.sectionVisee === s).length,
    })).sort((a, b) => b.count - a.count),
  [prospects]);

  const maxSrc = Math.max(...sourceData.map(s => s[1]), 1);
  const maxSec = Math.max(...sectionData.map(s => s.count), 1);

  const conv = [
    { l:'Entrées',     n:total,                                                                      c:'bg-slate-300' },
    { l:'Pré-inscrits', n:prospects.filter(p=>p.statut===StatutProspect.PRE_INSCRIT).length,         c:'bg-blue-400'  },
    { l:'Inscrits',    n:prospects.filter(p=>p.statut===StatutProspect.INSCRIT).length,              c:'bg-emerald-500' },
  ];

  return (
    <PageLayout title="Statistiques & Analytics" sub="Données de conversion, sources et répartition par niveau">
      <div className="grid lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader title="Sources d'acquisition" sub="Origine des familles inscrites" />
          <div className="p-5 space-y-3.5">
            {sourceData.map(([src, count]) => (
              <div key={src}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 truncate flex-1 mr-4">{src}</span>
                  <span className="font-mono text-slate-500 shrink-0">{count} ({total>0?Math.round((count/total)*100):0}%)</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#0D2E5C]"
                    initial={{ width:0 }} animate={{ width:`${Math.round((count/maxSrc)*100)}%` }} transition={{ duration:0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Demande par niveau" sub="Nombre de dossiers par classe" />
          <div className="p-5 space-y-3.5">
            {sectionData.map(({ s, count }) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-9 h-6 rounded bg-[#0D2E5C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{s}</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-[#1A4F8B]"
                      initial={{ width:0 }} animate={{ width:`${Math.round((count/maxSec)*100)}%` }} transition={{ duration:0.6 }} />
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-500 w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Entonnoir de conversion global" />
        <div className="p-6">
          <div className="flex items-end gap-8 justify-center pb-4">
            {conv.map((c, i) => {
              const pct = conv[0].n > 0 ? Math.round((c.n / conv[0].n) * 100) : 0;
              const H   = Math.max(pct * 1.6, 20);
              return (
                <div key={i} className="flex flex-col items-center gap-3 min-w-[80px]">
                  <div className="text-center">
                    <p className="font-bold text-2xl text-slate-900">{c.n}</p>
                    <p className="text-[11px] text-slate-400">{pct}%</p>
                  </div>
                  <motion.div className={`w-16 rounded-md ${c.c}`}
                    initial={{ height:0 }} animate={{ height:`${H}px` }} transition={{ duration:0.7, delay:i*0.15 }} />
                  <p className="text-xs font-semibold text-slate-600 text-center">{c.l}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGERIE
// ════════════════════════════════════════════════════════════════════════════

const SECTIONS_MSG = ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'];
const EXPEDITEURS  = ['Direction EPV Horizons Savants','Service Scolarité','Service Infirmerie EPV','Équipe Pédagogique'];

function MessagerieTab({ contacts, notifications, prospects, onContactStatus, onToast }: DataProps) {
  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [tab,        setTab]        = useState<'contacts'|'notifs'>('contacts');
  const [showCompose,setShowCompose] = useState(false);
  const [msgDe,      setMsgDe]      = useState(EXPEDITEURS[0]);
  const [msgSection, setMsgSection] = useState('ALL');
  const [msgContenu, setMsgContenu] = useState('');
  const [sending,    setSending]    = useState(false);

  const unread = contacts.filter(c => c.statut !== 'Traité').length;
  const nbDest = msgSection === 'ALL'
    ? prospects.length
    : prospects.filter(p => p.sectionVisee === msgSection).length;

  const handleBroadcast = async () => {
    if (!msgContenu.trim()) { onToast('Veuillez rédiger un message.'); return; }
    setSending(true);
    try {
      const r = await apiPost('/api/messages/broadcast', {
        de: msgDe, contenu: msgContenu.trim(), section: msgSection,
      });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data.error || 'Erreur lors de l\'envoi.');
      onToast(`Message envoyé à ${data.sent} parent${data.sent > 1 ? 's' : ''}.`);
      setShowCompose(false);
      setMsgContenu('');
    } catch (err: any) {
      onToast(err.message || 'Erreur lors de l\'envoi.');
    } finally { setSending(false); }
  };

  return (
    <PageLayout title="Messages & Notifications"
      sub="Communication avec les familles et journal des notifications"
      actions={
        <button onClick={() => setShowCompose(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
          {showCompose ? <><X size={13} /> Annuler</> : <><Send size={13} /> Nouveau message</>}
        </button>
      }
    >
      {/* ── Formulaire broadcast ── */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <p className="text-sm font-semibold text-slate-800 mb-4">Envoyer un message groupé aux parents</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Expéditeur</label>
                  <select value={msgDe} onChange={e => setMsgDe(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {EXPEDITEURS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Destinataires — <span className="text-slate-600 font-bold">{nbDest} parent{nbDest > 1 ? 's' : ''}</span>
                  </label>
                  <select value={msgSection} onChange={e => setMsgSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    <option value="ALL">Tous les parents</option>
                    {SECTIONS_MSG.map(s => {
                      const n = prospects.filter(p => p.sectionVisee === s).length;
                      return <option key={s} value={s}>{s} — {SECTION_LABEL[s]} ({n})</option>;
                    })}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Message</label>
                  <textarea value={msgContenu} onChange={e => setMsgContenu(e.target.value)} rows={5}
                    placeholder="Rédigez votre message aux familles..."
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 resize-none font-sans" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleBroadcast} disabled={sending || !msgContenu.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  {sending
                    ? <><div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi…</>
                    : <><Send size={13} /> Envoyer à {nbDest} parent{nbDest > 1 ? 's' : ''}</>}
                </button>
                <button onClick={() => { setShowCompose(false); setMsgContenu(''); }}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {[
          { id:'contacts', label:`Messages reçus${unread > 0 ? ` (${unread} non traités)` : ''}` },
          { id:'notifs',   label:'Journal de notifications' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer
              ${tab === t.id ? 'border-[#0D2E5C] text-[#0D2E5C]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
          {tab === 'contacts' && (
            <Card>
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <MessageSquare size={28} className="mb-2 text-slate-300" />
                  <p className="text-sm">Aucun message reçu</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {contacts.map((msg: any) => {
                    const isOpen   = activeId === msg.id;
                    const treated  = msg.statut === 'Traité';
                    return (
                      <div key={msg.id} className={`${!treated ? 'bg-blue-50/30' : ''}`}>
                        <button onClick={() => setActiveId(isOpen ? null : msg.id)}
                          className="w-full px-5 py-3.5 text-left flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold
                            ${treated ? 'bg-slate-100 text-slate-400' : 'bg-[#0D2E5C] text-white'}`}>
                            {(msg.nom || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 justify-between">
                              <p className={`text-xs truncate ${!treated ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>{msg.nom}</p>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate">{msg.objet}</p>
                            <p className="text-[11px] text-slate-400 truncate">{msg.message}</p>
                          </div>
                          {!treated && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                              exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
                              <div className="px-5 pb-5 space-y-3">
                                <div className="bg-slate-50 border border-slate-100 rounded-md p-4 text-xs text-slate-700 leading-relaxed">
                                  {msg.message}
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><Phone size={11} /> {msg.telephone}</span>
                                    <span className="flex items-center gap-1"><Mail size={11} /> {msg.email}</span>
                                  </div>
                                  <button onClick={() => { onContactStatus(msg.id, treated ? 'A traiter' : 'Traité'); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors
                                      ${treated ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                                    <CheckCircle size={11} /> {treated ? 'Remettre en attente' : 'Marquer traité'}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {tab === 'notifs' && (
            <Card>
              <CardHeader title="Journal des notifications envoyées" sub="Email · WhatsApp — Mode sandbox" />
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Aucune notification enregistrée</p>
                ) : notifications.map(n => (
                  <div key={n.id} className="px-5 py-3.5 flex items-start gap-4">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded shrink-0 mt-0.5
                      ${n.type === 'email' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {n.type.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 truncate">→ {n.destinataire}</p>
                      {n.sujet && <p className="text-[10px] text-slate-500 truncate">{n.sujet}</p>}
                      <p className="text-[10px] text-slate-400 italic leading-relaxed mt-0.5 line-clamp-2">{n.contenu}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                      {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QR MARKETING
// ════════════════════════════════════════════════════════════════════════════

function QRTab({ onToast }: DataProps) {
  const [qrUrl,    setQrUrl]    = useState('https://horizonssavants.com/#/admissions');
  const [qrSource, setQrSource] = useState('flyer_terrain');
  const [nom,      setNom]      = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const fullUrl = `${qrUrl}?utm_source=${qrSource}`;
  const qrSrc   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=0D2E5C&data=${encodeURIComponent(fullUrl)}`;

  useEffect(() => {
    apiFetch('/api/qr_campaigns').then(setCampaigns).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!nom.trim() || !qrSource.trim()) { onToast('Renseignez un nom et un identifiant UTM.'); return; }
    try {
      await apiPost('/api/qr_campaigns', { nom: nom.trim(), url: qrUrl, utmSource: qrSource, fullUrl });
      onToast('Campagne enregistrée.');
      setNom('');
      const fresh = await apiFetch('/api/qr_campaigns');
      setCampaigns(Array.isArray(fresh) ? fresh : []);
    } catch { onToast('Erreur lors de la sauvegarde.'); }
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/api/qr_campaigns/${id}`);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    onToast('Campagne supprimée.');
  };

  return (
    <PageLayout title="QR Marketing" sub="Génération de QR codes tracés pour les campagnes terrain">
      <div className="space-y-4 max-w-3xl">
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Nom de la campagne</label>
                <input value={nom} onChange={e => setNom(e.target.value)} placeholder="ex: Flyer Paroisse Cocody"
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Page de destination</label>
                <select value={qrUrl} onChange={e => setQrUrl(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                  <option value="https://horizonssavants.com/#/admissions">Admissions — Pré-inscription</option>
                  <option value="https://horizonssavants.com/#/programmes/maternelle">Programmes Maternelle</option>
                  <option value="https://horizonssavants.com/#/programmes/primaire">Programmes Primaire</option>
                  <option value="https://horizonssavants.com/#/contact">Page Contact</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Identifiant UTM (utm_source)</label>
                <input value={qrSource} onChange={e => setQrSource(e.target.value.trim().toLowerCase().replace(/\s+/g,'_'))}
                  placeholder="ex: flyer_paroisse_cocody"
                  className="w-full px-3 py-2.5 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">URL générée</p>
                <p className="text-[11px] font-mono text-slate-700 break-all leading-relaxed">{fullUrl}</p>
              </div>
              <button onClick={handleSave}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
                <CheckCircle size={13} /> Enregistrer la campagne
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 bg-slate-50 rounded-md p-6 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Aperçu QR Code</p>
              <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                <img src={qrSrc} alt="QR Code" className="w-40 h-40" referrerPolicy="no-referrer" />
              </div>
              <div className="flex gap-2">
                <a href={qrSrc} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
                  <Download size={12} /> Télécharger
                </a>
                <button onClick={() => onToast('Lien copié dans le presse-papiers.')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                  <Printer size={12} /> Imprimer
                </button>
              </div>
            </div>
          </div>
        </Card>

        {campaigns.length > 0 && (
          <Card>
            <CardHeader title="Historique des campagnes" sub={`${campaigns.length} campagne${campaigns.length > 1 ? 's' : ''} enregistrée${campaigns.length > 1 ? 's' : ''}`} />
            <table className="w-full text-xs">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {['Nom','UTM source','URL','Créée le','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{c.nom}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{c.utmSource}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[180px]" title={c.fullUrl}>{c.url}</td>
                    <td className="px-4 py-3 text-slate-400">{fmtDate(c.createdAt, { day:'numeric', month:'short', year:'numeric' })}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 cursor-pointer transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

// ─── Gestionnaire de documents (URLs) ────────────────────────────────────────

const DOC_CATS = ['Réglementaire','Administratif','Scolaire','Médical'];

function AdminDocuments({ onToast }: { onToast: (m: string) => void }) {
  const [docs,    setDocs]    = useState<any[]>([]);
  const [form,    setForm]    = useState<any | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch('/api/documents').then(setDocs).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!form.titre?.trim()) { onToast('Titre requis.'); return; }
    setSaving(true);
    try {
      if (form.id) {
        // Mise à jour : si nouveau fichier → upload R2 d'abord
        if (docFile) {
          const fd = new FormData();
          fd.append('fichier', docFile);
          fd.append('titre', form.titre);
          fd.append('cat', form.cat ?? 'Général');
          fd.append('ordre', String(form.ordre ?? 0));
          const r = await authFetch('/api/documents/upload', { method: 'POST', body: fd });
          const data = await r.json();
          if (r.ok) {
            await apiDelete(`/api/documents/${form.id}`);
            setDocs(prev => prev.filter(d => d.id !== form.id).concat(data));
          }
        } else {
          await apiPatch(`/api/documents/${form.id}`, form);
          setDocs(prev => prev.map(d => d.id === form.id ? { ...d, ...form } : d));
        }
        onToast('Document mis à jour.');
      } else {
        if (docFile) {
          // Upload fichier vers R2
          const fd = new FormData();
          fd.append('fichier', docFile);
          fd.append('titre', form.titre);
          fd.append('cat', form.cat ?? 'Général');
          fd.append('ordre', String(form.ordre ?? docs.length + 1));
          const r = await authFetch('/api/documents/upload', { method: 'POST', body: fd });
          const data = await r.json();
          if (r.ok) setDocs(prev => [...prev, data]);
          onToast('Document uploadé dans R2.');
        } else if (form.fichier?.trim()) {
          // URL externe (Google Drive, etc.)
          const r = await apiPost('/api/documents', { ...form, actif: true });
          let data: any = {};
          try { data = await r.json(); } catch {}
          if (r.ok) setDocs(prev => [...prev, data]);
          onToast('Document ajouté (URL externe).');
        } else {
          onToast('Sélectionnez un fichier ou entrez une URL.');
          setSaving(false);
          return;
        }
      }
      setForm(null);
      setDocFile(null);
      if (docFileRef.current) docFileRef.current.value = '';
    } catch { onToast('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    await apiDelete(`/api/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
    onToast('Document supprimé.');
  };

  const toggleActif = async (id: string) => {
    const doc = docs.find(d => d.id === id);
    if (!doc) return;
    await apiPatch(`/api/documents/${id}`, { actif: !doc.actif });
    setDocs(prev => prev.map(d => d.id === id ? { ...d, actif: !d.actif } : d));
  };

  return (
    <Card>
      <CardHeader title="Bibliothèque de documents"
        sub="Documents téléchargeables par les parents dans leur Espace"
        action={
          <button onClick={() => setForm({ titre: '', fichier: '', cat: 'Administratif', ordre: docs.length + 1 })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0D2E5C] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
            <Plus size={12} /> Ajouter
          </button>
        }
      />

      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 space-y-3 bg-slate-50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Titre</label>
                  <input value={form.titre} onChange={e => setForm((f: any) => ({...f, titre: e.target.value}))}
                    placeholder="ex: Règlement intérieur 2025/2026"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Uploader un fichier vers R2 (PDF, Word, etc. — max 20 Mo)</label>
                  <input ref={docFileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg"
                    onChange={e => setDocFile(e.target.files?.[0] ?? null)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0D2E5C] file:text-white cursor-pointer" />
                  {docFile && <p className="text-[10px] text-[#2D8C3C] mt-1 font-semibold">✓ {docFile.name} ({(docFile.size/1024).toFixed(0)} Ko)</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">— ou — URL externe (Google Drive, Dropbox…)</label>
                  <input value={form.fichier || ''} onChange={e => setForm((f: any) => ({...f, fichier: e.target.value}))}
                    placeholder="https://drive.google.com/file/d/..."
                    disabled={!!docFile}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 disabled:opacity-40 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
                  <select value={form.cat} onChange={e => setForm((f: any) => ({...f, cat: e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {DOC_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Ordre d'affichage</label>
                  <input type="number" value={form.ordre} onChange={e => setForm((f: any) => ({...f, ordre: parseInt(e.target.value)||1}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={12} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-3 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {['#','Titre','Catégorie','URL','Visible','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {docs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400 text-xs">Aucun document.</td></tr>
            )}
            {[...docs].sort((a,b)=>(a.ordre||0)-(b.ordre||0)).map(d => (
              <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${!d.actif ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-slate-400">{d.ordre || '—'}</td>
                <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{d.titre}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{d.cat}</span>
                </td>
                <td className="px-4 py-3">
                  {d.fichier ? (
                    <a href={d.fichier} target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline text-[10px] font-mono flex items-center gap-1">
                      <ExternalLink size={11} /> Voir
                    </a>
                  ) : <span className="text-slate-300 text-[10px]">Non définie</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActif(d.id)}
                    className="cursor-pointer">
                    {d.actif
                      ? <ToggleRight size={18} className="text-emerald-500" />
                      : <ToggleLeft  size={18} className="text-slate-300" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setForm({ ...d })}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const SECTIONS_ORDER = ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'];

function ConfigurationTab({ onToast, onRefresh, config, tarifs }: DataProps) {
  const etab = config.etablissement || {};
  const adminEmail = config.adminEmail || 'admin@horizonssavants.com';
  const adminNom   = etab.directeur || 'Directeur Académique EPV';

  const [editTarifs, setEditTarifs] = useState(false);
  const [localTarifs, setLocalTarifs] = useState<Record<string,number>>(tarifs);
  const [savingT, setSavingT] = useState(false);

  const handleSaveTarifs = async () => {
    setSavingT(true);
    try {
      await authFetch('/api/configuration/tarifs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valeur: localTarifs }),
      });
      onToast('Tarifs mis à jour.');
      setEditTarifs(false);
      onRefresh();
    } catch { onToast('Erreur lors de la mise à jour.'); }
    finally { setSavingT(false); }
  };

  return (
    <PageLayout title="Configuration système" sub="Paramètres de l'école, grille tarifaire et compte administrateur">
      <div className="grid lg:grid-cols-2 gap-4">

        <Card className="p-5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Informations de l'établissement</p>
          <div className="space-y-2">
            {[
              { l:'Nom',          v: etab.nom          || '—' },
              { l:'Type',         v: etab.type         || '—' },
              { l:'Localisation', v: etab.localisation || '—' },
              { l:'Agrément',     v: etab.agrement     || '—' },
              { l:'Téléphone',    v: etab.telephone    || '—' },
              { l:'Email',        v: etab.email        || '—' },
              { l:'Rentrée',      v: etab.rentree      || '—' },
              { l:'Effectif max', v: etab.effectifMax  || '—' },
            ].map(r => (
              <div key={r.l} className="flex items-start justify-between py-2 border-b border-slate-50 gap-4">
                <span className="text-[11px] text-slate-400 shrink-0">{r.l}</span>
                <span className="text-[11px] font-semibold text-slate-800 text-right">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Compte administrateur</p>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-md bg-[#0D2E5C] flex items-center justify-center text-white font-bold text-sm">
              {adminNom[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{adminNom}</p>
              <p className="text-xs font-mono text-slate-400">{adminEmail}</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">Actif</span>
          </div>
          <div className="space-y-2">
            {[
              { l:'Dernière connexion', v: new Date().toLocaleDateString('fr-FR') },
              { l:'Niveau d\'accès',    v: 'Administrateur système' },
              { l:'2FA',                v: 'Non activé' },
            ].map(r => (
              <div key={r.l} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-[11px] text-slate-400">{r.l}</span>
                <span className="text-[11px] font-semibold text-slate-800">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tarifs éditables */}
      <Card>
        <CardHeader title="Tarifs de scolarité par section (FCFA/an)"
          action={
            editTarifs ? (
              <div className="flex gap-2">
                <button onClick={handleSaveTarifs} disabled={savingT}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0D2E5C] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={12} /> {savingT ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => { setLocalTarifs(tarifs); setEditTarifs(false); }}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            ) : (
              <button onClick={() => { setLocalTarifs(tarifs); setEditTarifs(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                <Edit2 size={12} /> Modifier les tarifs
              </button>
            )
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Section','Cycle','Scolarité annuelle (FCFA)','Trimestre (÷3)'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {SECTIONS_ORDER.map(s => {
                const val = editTarifs ? (localTarifs[s] || 0) : (tarifs[s] || 0);
                const cycle = ['PS','MS','GS'].includes(s) ? 'Maternelle' : ['CP1','CP2','CE1','CE2'].includes(s) ? 'Primaire C1' : 'Primaire C2';
                return (
                  <tr key={s} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[10px] bg-[#0D2E5C] text-white px-2 py-0.5 rounded">{s}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{cycle}</td>
                    <td className="px-5 py-3.5">
                      {editTarifs ? (
                        <input type="number" value={localTarifs[s] || 0}
                          onChange={e => setLocalTarifs(t => ({...t, [s]: parseInt(e.target.value) || 0}))}
                          className="w-36 px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:border-slate-500" />
                      ) : (
                        <span className="font-mono font-semibold text-slate-800">{val.toLocaleString('fr-FR')} F</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{Math.round(val / 3).toLocaleString('fr-FR')} F</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Bibliothèque documents (URLs) ── */}
      <AdminDocuments onToast={onToast} />

      <Card className="border-red-200 bg-red-50">
        <div className="p-5">
          <p className="text-sm font-semibold text-red-700 mb-1">Zone de danger</p>
          <p className="text-xs text-red-500 mb-4">Ces opérations sont irréversibles. À utiliser uniquement en mode démonstration.</p>
          <button onClick={() => {
            if (window.confirm('Réinitialiser la base de données aux données de démonstration ?')) {
              authFetch('/api/parent/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'mariam.kone@hotmail.com' }) })
                .then(() => { onToast('Base réinitialisée.'); onRefresh(); })
                .catch(() => onToast('Erreur de réinitialisation.'));
            }
          }}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer transition-colors">
            <AlertTriangle size={13} /> Réinitialiser les données démo
          </button>
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ASSIDUITÉ
// ════════════════════════════════════════════════════════════════════════════

function AssiduiteTab({ prospects, appointments, onProspectStatus, onToast, onRefresh }: DataProps) {
  const sections = ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'];
  const [selectedSection, setSelectedSection] = useState('CP1');
  const [selectedDate,    setSelectedDate]    = useState(new Date().toISOString().slice(0, 10));
  const [saving,          setSaving]          = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Prospect | null>(null);

  const students = useMemo(() =>
    prospects.filter(p => p.sectionVisee === selectedSection && p.statut === StatutProspect.INSCRIT),
  [prospects, selectedSection]);

  const [attendance, setAttendance] = useState<Record<string, 'present'|'absent'|'retard'>>({});
  const [dbRecords,  setDbRecords]  = useState<any[]>([]);

  // Charger les enregistrements existants depuis la BD quand la date ou la section change
  useEffect(() => {
    setAttendance({});
    apiFetch(`/api/assiduite?date=${selectedDate}`)
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        setDbRecords(data);
        const ids = new Set(students.map(s => s.id));
        const map: Record<string, 'present'|'absent'|'retard'> = {};
        data.forEach(r => {
          if (ids.has(r.prospectId)) map[r.prospectId] = r.type === 'Absence' ? 'absent' : 'retard';
        });
        setAttendance(map);
      })
      .catch(() => {});
  }, [selectedDate, selectedSection]);

  const mark = (id: string, val: 'present'|'absent'|'retard') =>
    setAttendance(prev => ({ ...prev, [id]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const student of students) {
        const newStatus = attendance[student.id];
        const existing  = dbRecords.find(r => r.prospectId === student.id);
        if (!newStatus || newStatus === 'present') {
          if (existing) await apiDelete(`/api/assiduite/${existing.id}`);
        } else {
          const type = newStatus === 'absent' ? 'Absence' : 'Retard';
          if (existing) {
            if (existing.type !== type) await apiPatch(`/api/assiduite/${existing.id}`, { type });
          } else {
            await apiPost('/api/assiduite', { prospectId: student.id, date: selectedDate, type });
          }
        }
      }
      const fresh = await apiFetch(`/api/assiduite?date=${selectedDate}`);
      setDbRecords(Array.isArray(fresh) ? fresh : []);
      onToast('Pointage enregistré avec succès.');
    } catch {
      onToast('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const countP = students.filter(s => !attendance[s.id] || attendance[s.id] === 'present').length;
  const countA = Object.values(attendance).filter(v => v === 'absent').length;
  const countR = Object.values(attendance).filter(v => v === 'retard').length;
  const total  = students.length;

  const btnCls = (active: boolean, color: string) =>
    `px-2.5 py-1 rounded text-[10px] font-semibold border cursor-pointer transition-all ${active ? color : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`;

  return (
    <PageLayout title="Suivi de l'assiduité" sub="Pointage quotidien par classe"
      actions={
        <button onClick={() => downloadCSV(students.map(s => ({
          'Élève': `${s.prenomEnfant} ${s.nomEnfant}`,
          'Section': s.sectionVisee,
          'Date': selectedDate,
          'Présence': attendance[s.id] === 'absent' ? 'Absent' : attendance[s.id] === 'retard' ? 'Retard' : 'Présent',
          'Responsable': `${s.prenomParent} ${s.nomParent}`,
          'Téléphone': s.telephone,
        })), `assiduite_${selectedSection}_${selectedDate}.csv`)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Download size={13} /> Exporter CSV
        </button>
      }
    >
      {/* Filtres */}
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Classe</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white cursor-pointer">
            {sections.map(s => <option key={s} value={s}>{s} — {SECTION_LABEL[s]}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <div className="flex gap-4 text-center">
          {[
            { l:'Présents', v:countP, color:'text-emerald-600' },
            { l:'Absents',  v:countA, color:'text-red-600'     },
            { l:'Retards',  v:countR, color:'text-amber-600'   },
            { l:'Total',    v:total,  color:'text-slate-900'   },
          ].map(s => (
            <div key={s.l} className="bg-slate-50 border border-slate-100 rounded-md px-4 py-2">
              <p className={`font-bold text-lg ${s.color}`}>{s.v}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {students.length === 0 ? (
        <Card className="p-8 text-center">
          <Users size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Aucun élève inscrit en {selectedSection} pour l'instant.</p>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`${SECTION_LABEL[selectedSection] || selectedSection} — ${new Date(selectedDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}`}
            sub={`${total} élève${total > 1 ? 's' : ''} inscrits`}
          />
          <div className="overflow-x-auto"><table className="w-full text-xs min-w-[540px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Élève','Date de naissance','Responsable','Présence'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(p => {
                const a = attendance[p.id];
                return (
                  <tr key={p.id} className={`transition-colors ${a === 'absent' ? 'bg-red-50/40' : a === 'retard' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelectedStudent(p)}
                        className="font-semibold text-slate-800 hover:text-brand-blue-medium cursor-pointer text-left flex items-center gap-1.5 group">
                        {p.prenomEnfant} {p.nomEnfant}
                        <Eye size={11} className="text-slate-300 group-hover:text-brand-blue-medium transition-colors" />
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{fmtDate(p.dateNaissance)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.prenomParent} {p.nomParent}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => mark(p.id, 'present')} className={btnCls(a==='present', 'bg-emerald-50 border-emerald-300 text-emerald-700')}>Présent</button>
                        <button onClick={() => mark(p.id, 'absent')}  className={btnCls(a==='absent',  'bg-red-50 border-red-300 text-red-600')}>Absent</button>
                        <button onClick={() => mark(p.id, 'retard')}  className={btnCls(a==='retard',  'bg-amber-50 border-amber-300 text-amber-700')}>Retard</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
          <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
              <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer le pointage'}
            </button>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {selectedStudent && (
          <ProspectDrawer
            prospect={selectedStudent}
            appointments={appointments}
            onClose={() => setSelectedStudent(null)}
            onStatus={(id, s) => { onProspectStatus(id, s); setSelectedStudent(null); }}
            onToast={onToast}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. ENSEIGNANTS
// ════════════════════════════════════════════════════════════════════════════

const EMPTY_TEACHER = { prenom:'', nom:'', email:'', tel:'', matieres:'', classes:'', entree: new Date().toISOString().slice(0,10), statut:'actif' };

function EnseignantsTab({ onToast }: DataProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search,   setSearch]   = useState('');
  const [form,     setForm]     = useState<any | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { apiFetch('/api/teachers').then(setTeachers).catch(console.error); }, []);

  const filtered = teachers.filter(t =>
    !search || [t.nom, t.prenom, ...(t.matieres||[]), ...(t.classes||[])].some((v: string) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!form.prenom?.trim() || !form.nom?.trim()) { onToast('Prénom et nom requis.'); return; }
    setSaving(true);
    const payload = {
      ...form,
      matieres: typeof form.matieres === 'string' ? form.matieres.split(',').map((s: string) => s.trim()).filter(Boolean) : form.matieres,
      classes:  typeof form.classes  === 'string' ? form.classes.split(',').map((s: string) => s.trim()).filter(Boolean) : form.classes,
    };
    try {
      if (form.id) {
        await apiPatch(`/api/teachers/${form.id}`, payload);
        setTeachers(prev => prev.map(t => t.id === form.id ? { ...t, ...payload } : t));
        onToast('Enseignant mis à jour.');
      } else {
        const r = await apiPost('/api/teachers', payload);
        let data: any = {};
        try { data = await r.json(); } catch {}
        if (r.ok) setTeachers(prev => [data, ...prev]);
        onToast('Enseignant ajouté.');
      }
      setForm(null);
    } catch { onToast('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet enseignant ?')) return;
    await apiDelete(`/api/teachers/${id}`);
    setTeachers(prev => prev.filter(t => t.id !== id));
    onToast('Enseignant supprimé.');
  };

  return (
    <PageLayout title="Enseignants" sub={`${teachers.length} membres du corps enseignant — Année 2025/2026`}
      actions={
        <button onClick={() => setForm({ ...EMPTY_TEACHER })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Ajouter un enseignant
        </button>
      }
    >
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">{form.id ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}</p>
                <button onClick={() => setForm(null)} className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"><X size={15} className="text-slate-400" /></button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { key:'prenom', label:'Prénom', ph:'Marie' },
                  { key:'nom',    label:'Nom',    ph:'Kouassi' },
                  { key:'email',  label:'Email',  ph:'m.kouassi@epv.ci' },
                  { key:'tel',    label:'Téléphone', ph:'+225 07 …' },
                  { key:'matieres', label:'Matières (séparées par virgule)', ph:'Français, Mathématiques' },
                  { key:'classes',  label:'Classes (séparées par virgule)', ph:'CP, CE1' },
                ].map(f => (
                  <div key={f.key} className={f.key === 'matieres' || f.key === 'classes' ? 'md:col-span-1' : ''}>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{f.label}</label>
                    <input value={typeof form[f.key] === 'object' ? (form[f.key]||[]).join(', ') : form[f.key] || ''} onChange={e => setForm((v: any) => ({...v, [f.key]:e.target.value}))}
                      placeholder={f.ph}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Date d'entrée</label>
                  <input type="date" value={form.entree} onChange={e => setForm((v: any) => ({...v, entree:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm((v: any) => ({...v, statut:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    <option value="actif">Actif</option>
                    <option value="conge">En congé</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        {[
          { l:'Enseignants actifs',  v:teachers.filter(t=>t.statut==='actif').length,  Icon:CheckCircle },
          { l:'En congé / absent',   v:teachers.filter(t=>t.statut!=='actif').length,  Icon:Clock       },
          { l:'Classes couvertes',   v:[...new Set(teachers.flatMap((t:any)=>(t.classes||[])))].length, Icon:GraduationCap },
        ].map(s => <KpiCard key={s.l} label={s.l} value={s.v} Icon={s.Icon} />)}
      </div>

      <Card className="p-3.5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matière ou classe..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 max-w-sm" />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[600px]">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {['Enseignant','Matières','Classes','Contact','Entrée','Statut','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-sm text-slate-400">Aucun enseignant enregistré.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">{t.prenom} {t.nom}</td>
                <td className="px-5 py-3.5 text-slate-600 max-w-[160px]">{(t.matieres||[]).join(', ')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {(t.classes||[]).slice(0, 4).map((c: string) => (
                      <span key={c} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                    {(t.classes||[]).length > 4 && <span className="text-[9px] text-slate-400">+{t.classes.length - 4}</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-mono text-[11px] text-slate-600">{t.tel}</p>
                  <p className="text-[10px] text-slate-400">{t.email}</p>
                </td>
                <td className="px-5 py-3.5 text-slate-400">{t.entree ? fmtDate(t.entree, { month:'short', year:'numeric' }) : '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${t.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {t.statut === 'actif' ? 'Actif' : 'En congé'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => setForm({ ...t, matieres: (t.matieres||[]).join(', '), classes: (t.classes||[]).join(', ') })}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. ADMINISTRATION (RH)
// ════════════════════════════════════════════════════════════════════════════

const POSTES_STAFF = ['Direction','Secrétariat','Comptabilité','Support technique','Maintenance','Garderie','Cantine'];
const EMPTY_STAFF  = { prenom:'', nom:'', poste:'Secrétariat', tel:'', email:'', entree: new Date().toISOString().slice(0,10), statut:'actif' };

function RhTab({ onToast }: DataProps) {
  const [staff,  setStaff]  = useState<any[]>([]);
  const [form,   setForm]   = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { apiFetch('/api/staff').then(setStaff).catch(console.error); }, []);

  const handleSave = async () => {
    if (!form.prenom?.trim() || !form.nom?.trim()) { onToast('Prénom et nom requis.'); return; }
    setSaving(true);
    try {
      if (form.id) {
        await apiPatch(`/api/staff/${form.id}`, form);
        setStaff(prev => prev.map(s => s.id === form.id ? { ...s, ...form } : s));
        onToast('Membre mis à jour.');
      } else {
        const r = await apiPost('/api/staff', form);
        let data: any = {};
        try { data = await r.json(); } catch {}
        if (r.ok) setStaff(prev => [data, ...prev]);
        onToast('Membre ajouté.');
      }
      setForm(null);
    } catch { onToast('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce membre du personnel ?')) return;
    await apiDelete(`/api/staff/${id}`);
    setStaff(prev => prev.filter(s => s.id !== id));
    onToast('Membre supprimé.');
  };

  return (
    <PageLayout title="Personnel administratif" sub={`${staff.length} membres du personnel non-enseignant`}
      actions={
        <button onClick={() => setForm({ ...EMPTY_STAFF })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Ajouter un membre
        </button>
      }
    >
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">{form.id ? 'Modifier le membre' : 'Nouveau membre du personnel'}</p>
                <button onClick={() => setForm(null)} className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"><X size={15} className="text-slate-400" /></button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { key:'prenom', label:'Prénom', ph:'Aminata' },
                  { key:'nom',    label:'Nom',    ph:'Diallo' },
                  { key:'email',  label:'Email',  ph:'a.diallo@epv.ci' },
                  { key:'tel',    label:'Téléphone', ph:'+225 05 …' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => setForm((v: any) => ({...v, [f.key]:e.target.value}))}
                      placeholder={f.ph}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Poste</label>
                  <select value={form.poste} onChange={e => setForm((v: any) => ({...v, poste:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {POSTES_STAFF.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Date d'entrée</label>
                  <input type="date" value={form.entree} onChange={e => setForm((v: any) => ({...v, entree:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Direction',    Icon:Award,    poste:'Direction'    },
          { l:'Secrétariat',  Icon:FileText, poste:'Secrétariat'  },
          { l:'Comptabilité', Icon:Wallet,   poste:'Comptabilité' },
          { l:'Support',      Icon:Wrench,   poste:'Support'      },
        ].map(s => <KpiCard key={s.l} label={s.l} value={staff.filter((m:any)=>m.poste?.includes(s.poste)).length || 0} Icon={s.Icon} />)}
      </div>

      <Card>
        <CardHeader title="Annuaire du personnel" />
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[600px]">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {['Poste','Nom complet','Téléphone','Email','Date d\'entrée','Statut','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-sm text-slate-400">Aucun membre enregistré.</td></tr>
            )}
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">{s.poste}</td>
                <td className="px-5 py-3.5 text-slate-700">{s.prenom} {s.nom}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{s.tel}</td>
                <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                <td className="px-5 py-3.5 text-slate-400">{s.entree ? fmtDate(s.entree) : '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">Actif</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => setForm({ ...s })}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. SCOLARITÉS
// ════════════════════════════════════════════════════════════════════════════

function ScolaritesTab({ prospects, tarifs, appointments, onProspectStatus, onToast, onRefresh }: DataProps) {
  const [filter, setFilter] = useState('ALL');
  const [allPaiements, setAllPaiements] = useState<any[]>([]);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const inscrits = prospects.filter(p => p.statut === StatutProspect.INSCRIT || p.statut === StatutProspect.PRE_INSCRIT);

  useEffect(() => {
    authFetch('/api/paiements').then(r => r.ok ? r.json() : []).then(setAllPaiements).catch(() => {});
  }, []);

  const data = useMemo(() => inscrits.map(p => {
    const annuel = tarifs[p.sectionVisee] || TARIFS_DEFAUT[p.sectionVisee] || 1500000;
    const t1 = Math.round(annuel / 3);
    const t2 = Math.round(annuel / 3);
    const t3 = annuel - t1 - t2;
    const pays = allPaiements.filter(pay => pay.prospectId === p.id && pay.statut === 'validé');
    const hasPay = (trim: string) => pays.some((pay: any) => pay.trimestre === trim);
    const statPay = (trim: string): 'payé'|'en_attente'|'non_dû' =>
      hasPay(trim) ? 'payé' : p.statut === StatutProspect.INSCRIT ? 'en_attente' : 'non_dû';
    const paiements = { t1: statPay('T1'), t2: statPay('T2'), t3: statPay('T3') };
    const totalPayé = pays.filter((pay: any) => ['T1','T2','T3'].includes(pay.trimestre))
      .reduce((s: number, pay: any) => s + Number(pay.montant), 0);
    const totalDu = annuel;
    return { p, annuel, t1, t2, t3, paiements, totalDu, totalPayé, solde: totalDu - totalPayé };
  }), [inscrits, allPaiements]);

  const filtered = data.filter(d => filter === 'ALL' || (filter === 'solde' ? d.solde > 0 : d.solde === 0));
  const totalAnnuel = data.reduce((s, d) => s + d.annuel, 0);
  const totalPayé   = data.reduce((s, d) => s + d.totalPayé, 0);
  const totalSolde  = data.reduce((s, d) => s + d.solde, 0);

  const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' F';

  return (
    <PageLayout title="Scolarités" sub="Suivi des paiements par élève — Année 2025/2026">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total attendu"  value={fmtF(totalAnnuel)} Icon={Wallet}     />
        <KpiCard label="Total encaissé" value={fmtF(totalPayé)}   Icon={CheckCircle} />
        <KpiCard label="Solde restant"  value={fmtF(totalSolde)}  Icon={AlertCircle} accent />
      </div>

      <Card className="p-3.5 flex items-center gap-3">
        {[['ALL','Tous'],['solde','Avec solde'],['ok','À jour']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors
              ${filter === v ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
        <span className="text-[11px] text-slate-400 ml-auto">{filtered.length} élève{filtered.length > 1 ? 's' : ''}</span>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Élève','Classe','T1','T2','T3','Total annuel','Solde','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(({ p, t1, t2, t3, paiements, annuel, solde }) => (
                <tr key={p.id}
                  onClick={() => setSelected(p)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${solde > 0 ? 'bg-amber-50/20' : ''}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{p.prenomEnfant} {p.nomEnfant}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.prenomParent} {p.nomParent}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[10px] bg-[#0D2E5C] text-white px-2 py-0.5 rounded">{p.sectionVisee}</span>
                  </td>
                  {[{v:t1,s:paiements.t1},{v:t2,s:paiements.t2},{v:t3,s:paiements.t3}].map((tr,i) => (
                    <td key={i} className="px-4 py-3.5">
                      <p className="font-mono text-[11px] text-slate-700">{fmtF(tr.v)}</p>
                      <span className={`text-[9px] font-semibold ${tr.s==='payé'?'text-emerald-600':tr.s==='en_attente'?'text-amber-600':'text-slate-300'}`}>
                        {tr.s==='payé'?'Payé':tr.s==='en_attente'?'En attente':'Non dû'}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">{fmtF(annuel)}</td>
                  <td className={`px-4 py-3.5 font-mono font-bold ${solde > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {solde > 0 ? fmtF(solde) : 'À jour'}
                  </td>
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" title="Imprimer">
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {selected && (
          <ProspectDrawer
            prospect={selected}
            appointments={appointments}
            onClose={() => setSelected(null)}
            onStatus={(id, s) => { onProspectStatus(id, s); setSelected(null); }}
            onToast={onToast}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. FACTURATION
// ════════════════════════════════════════════════════════════════════════════

function FacturationTab({ prospects, tarifs, onToast }: DataProps) {
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [allPaiements, setAllPaiements] = useState<any[]>([]);

  useEffect(() => {
    authFetch('/api/paiements').then(r => r.ok ? r.json() : []).then(d => setAllPaiements(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const factures = useMemo(() => {
    const hasPay = (prospectId: string, trim: string) =>
      allPaiements.some(p => p.prospectId === prospectId && p.trimestre === trim && p.statut === 'validé');

    return prospects
      .filter(p => p.statut === StatutProspect.INSCRIT || p.statut === StatutProspect.PRE_INSCRIT)
      .flatMap(p => {
        const annuel  = tarifs[p.sectionVisee] || TARIFS_DEFAUT[p.sectionVisee] || 1500000;
        const t = Math.round(annuel / 3);
        const actif = p.statut === StatutProspect.INSCRIT;
        return [
          { id:`${p.id}-T1`, ref:`FAC-${p.id.slice(-4)}-T1`, nom:`${p.prenomEnfant} ${p.nomEnfant}`, classe:p.sectionVisee, libelle:'Scolarité 1er trimestre', montant:t,          date:'2025-09-05', statut: hasPay(p.id,'T1') ? 'payée' : actif ? 'en_attente' : 'non_émise' },
          { id:`${p.id}-T2`, ref:`FAC-${p.id.slice(-4)}-T2`, nom:`${p.prenomEnfant} ${p.nomEnfant}`, classe:p.sectionVisee, libelle:'Scolarité 2e trimestre',  montant:t,          date:'2026-01-08', statut: hasPay(p.id,'T2') ? 'payée' : actif ? 'en_attente' : 'non_émise' },
          { id:`${p.id}-T3`, ref:`FAC-${p.id.slice(-4)}-T3`, nom:`${p.prenomEnfant} ${p.nomEnfant}`, classe:p.sectionVisee, libelle:'Scolarité 3e trimestre',  montant:annuel-t*2, date:'2026-04-01', statut: hasPay(p.id,'T3') ? 'payée' : actif ? 'en_attente' : 'non_émise' },
          { id:`${p.id}-FN`, ref:`FAC-${p.id.slice(-4)}-FN`, nom:`${p.prenomEnfant} ${p.nomEnfant}`, classe:p.sectionVisee, libelle:'Fournitures scolaires',    montant:Math.round(annuel*0.07), date:'2025-09-01', statut: hasPay(p.id,'FOURNITURES') ? 'payée' : actif ? 'en_attente' : 'non_émise' },
        ];
      });
  }, [prospects, allPaiements, tarifs]);

  const filtered = factures.filter(f => filterStatut === 'ALL' || f.statut === filterStatut);
  const totalPayé = factures.filter(f=>f.statut==='payée').reduce((s,f)=>s+f.montant,0);
  const totalDu   = factures.filter(f=>f.statut==='en_attente').reduce((s,f)=>s+f.montant,0);
  const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' F';

  return (
    <PageLayout title="Facturation" sub="Historique et état des factures — Toutes classes"
      actions={
        <button onClick={() => onToast('Génération de facture groupée...')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Émettre factures
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total encaissé"    value={fmtF(totalPayé)} Icon={CheckCircle} />
        <KpiCard label="En attente"         value={fmtF(totalDu)}  Icon={Clock}       accent />
        <KpiCard label="Factures émises"    value={factures.filter(f=>f.statut!=='non_émise').length} Icon={FileText} />
      </div>

      <Card className="p-3.5 flex gap-2 flex-wrap items-center">
        {[['ALL','Toutes'],['payée','Payées'],['en_attente','En attente'],['non_émise','Non émises']].map(([v,l]) => (
          <button key={v} onClick={() => setFilterStatut(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors
              ${filterStatut === v ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
        <span className="text-[11px] text-slate-400 ml-auto">{filtered.length} facture{filtered.length > 1 ? 's' : ''}</span>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Référence','Élève','Classe','Libellé','Montant','Date','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice(0, 30).map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{f.ref}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{f.nom}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{f.classe}</span></td>
                  <td className="px-4 py-3 text-slate-600">{f.libelle}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">{fmtF(f.montant)}</td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(f.date, { day:'numeric', month:'short' })}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${f.statut==='payée'?'bg-emerald-50 text-emerald-700 border-emerald-200':f.statut==='en_attente'?'bg-amber-50 text-amber-700 border-amber-200':'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {f.statut==='payée'?'Payée':f.statut==='en_attente'?'En attente':'Non émise'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onToast(`Impression facture ${f.ref}`)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. DÉPENSES
// ════════════════════════════════════════════════════════════════════════════

const DEPENSE_CATS = ['Salaires','Fournitures scolaires','Entretien','Électricité/Eau','Loyer','Assurance','Matériel','Communication','Autre'];
const EMPTY_DEPENSE = { date: new Date().toISOString().slice(0,10), categorie:'Fournitures scolaires', libelle:'', montant:'', statut:'en_attente' };

function DepensesTab({ onToast }: DataProps) {
  const [depenses, setDepenses] = useState<any[]>([]);
  const [filter,   setFilter]   = useState('ALL');
  const [form,     setForm]     = useState<any | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { apiFetch('/api/depenses').then(setDepenses).catch(console.error); }, []);

  const handleSave = async () => {
    if (!form.libelle?.trim() || !form.montant) { onToast('Libellé et montant requis.'); return; }
    setSaving(true);
    try {
      const r = await apiPost('/api/depenses', { ...form, montant: parseFloat(form.montant) });
      let data: any = {};
      try { data = await r.json(); } catch {}
      if (r.ok) setDepenses(prev => [data, ...prev]);
      setForm(null);
      onToast('Dépense enregistrée.');
    } catch { onToast('Erreur lors de l\'enregistrement.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    await apiDelete(`/api/depenses/${id}`);
    setDepenses(prev => prev.filter(d => d.id !== id));
    onToast('Dépense supprimée.');
  };

  const cats = [...new Set(depenses.map((d: any) => d.categorie))];
  const filtered = depenses.filter((d: any) => filter === 'ALL' || d.categorie === filter);
  const totalPayé = depenses.filter((d: any)=>d.statut==='payée').reduce((s: number,d: any)=>s+d.montant, 0);
  const totalDu   = depenses.filter((d: any)=>d.statut==='en_attente').reduce((s: number,d: any)=>s+d.montant, 0);
  const fmtF = (n: number) => n.toLocaleString('fr-FR') + ' F';

  const catTotals = cats.map(c => ({
    cat: c,
    total: depenses.filter((d: any)=>d.categorie===c).reduce((s: number,d: any)=>s+d.montant,0),
  })).sort((a,b)=>b.total-a.total);
  const maxTotal = catTotals[0]?.total || 1;

  return (
    <PageLayout title="Dépenses" sub="Suivi des charges de l'établissement"
      actions={
        <button onClick={() => setForm({ ...EMPTY_DEPENSE })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Enregistrer une dépense
        </button>
      }
    >
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">Nouvelle dépense</p>
                <button onClick={() => setForm(null)} className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"><X size={15} className="text-slate-400" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm((f: any) => ({...f, date:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((f: any) => ({...f, categorie:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {DEPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</label>
                  <input value={form.libelle} onChange={e => setForm((f: any) => ({...f, libelle:e.target.value}))}
                    placeholder="ex: Achat de cahiers CP..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Montant (FCFA)</label>
                  <input type="number" value={form.montant} onChange={e => setForm((f: any) => ({...f, montant:e.target.value}))}
                    placeholder="ex: 150000"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm((f: any) => ({...f, statut:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    <option value="payée">Payée</option>
                    <option value="en_attente">En attente</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <KpiCard label="Total réglé"      value={fmtF(totalPayé)} Icon={CheckCircle} />
          <KpiCard label="En attente paiement" value={fmtF(totalDu)} Icon={Clock} accent />
          <KpiCard label="Total du mois"    value={fmtF(totalPayé+totalDu)} Icon={Wallet} />
          <KpiCard label="Postes de dépense" value={cats.length} Icon={Layers} />
        </div>
        <Card className="p-5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Répartition par catégorie</p>
          <div className="space-y-3">
            {catTotals.map(c => (
              <div key={c.cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600">{c.cat}</span>
                  <span className="font-mono text-slate-500">{fmtF(c.total)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-slate-700 rounded-full"
                    initial={{ width:0 }} animate={{ width:`${Math.round((c.total/maxTotal)*100)}%` }} transition={{ duration:0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-3.5 flex gap-2 flex-wrap items-center">
        {[['ALL','Toutes catégories'], ...cats.map(c=>[c,c])].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors
              ${filter === v ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </Card>

      <Card>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[600px]">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {['Date','Catégorie','Description','Montant','Statut','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-slate-500">{fmtDate(d.date, { day:'numeric', month:'short' })}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{d.categorie}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-700 font-medium">{d.libelle}</td>
                <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">{fmtF(d.montant)}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${d.statut==='payée'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {d.statut === 'payée' ? 'Payée' : 'En attente'}
                  </span>
                </td>
                <td className="px-5 py-3.5 flex gap-1">
                  <button onClick={() => onToast(`Reçu : ${d.libelle}`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors"><Printer size={13} /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. NEWSLETTERS
// ════════════════════════════════════════════════════════════════════════════

function NewslettersTab({ prospects, onToast }: DataProps) {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [view, setView] = useState<'list'|'compose'>('list');
  const [objet, setObjet]       = useState('');
  const [contenu, setContenu]   = useState('');
  const [cible, setCible]       = useState('ALL');
  const sections = ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'];
  const nbDest = cible === 'ALL' ? prospects.length : prospects.filter(p=>p.sectionVisee===cible).length;

  useEffect(() => { apiFetch('/api/newsletters').then(setNewsletters).catch(console.error); }, []);

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!objet.trim() || !contenu.trim()) { onToast('Veuillez renseigner l\'objet et le contenu.'); return; }
    setSending(true);
    try {
      // 1. Créer le brouillon
      const r = await apiPost('/api/newsletters', {
        objet: objet.trim(), contenu: contenu.trim(), cible,
        statut: 'brouillon', envois: 0, ouvertures: 0,
        date: new Date().toISOString(),
      });
      let nl: any = {};
      try { nl = await r.json(); } catch {}
      if (!r.ok || !nl.id) throw new Error('Erreur création newsletter.');

      // 2. Envoyer via Infobip
      const rs = await authFetch(`/api/newsletters/${nl.id}/send`, { method: 'POST' });
      let result: any = {};
      try { result = await rs.json(); } catch {}

      const sent = result.sent ?? 0;
      nl = { ...nl, statut: 'envoyée', envois: sent };
      setNewsletters(prev => [nl, ...prev]);
      onToast(`Newsletter envoyée à ${sent} destinataire${sent > 1 ? 's' : ''}.`);
      setView('list'); setObjet(''); setContenu('');
    } catch (e: any) {
      onToast(e.message || 'Erreur lors de l\'envoi.');
    } finally { setSending(false); }
  };

  return (
    <PageLayout title="Newsletters" sub="Communication groupée vers les familles"
      actions={
        <button onClick={() => setView(v => v === 'list' ? 'compose' : 'list')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          {view === 'list' ? <><Plus size={13} /> Rédiger</> : <><X size={13} /> Annuler</>}
        </button>
      }
    >
      <AnimatePresence mode="wait">
        {view === 'compose' ? (
          <motion.div key="compose" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-6 max-w-2xl space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Destinataires</label>
                <select value={cible} onChange={e => setCible(e.target.value)}
                  className="px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                  <option value="ALL">Tous les parents ({prospects.length})</option>
                  {sections.map(s => {
                    const n = prospects.filter(p=>p.sectionVisee===s).length;
                    return <option key={s} value={s}>{s} — {SECTION_LABEL[s]} ({n})</option>;
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">{nbDest} destinataire{nbDest>1?'s':''} sélectionné{nbDest>1?'s':''}</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Objet</label>
                <input value={objet} onChange={e => setObjet(e.target.value)} placeholder="Objet de la newsletter..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Contenu</label>
                <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={8}
                  placeholder="Rédigez le contenu de votre newsletter ici..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 resize-none font-sans" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSend} disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  {sending
                    ? <><div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi en cours…</>
                    : <><Send size={13} /> Envoyer à {nbDest} destinataire{nbDest>1?'s':''}</> }
                </button>
                <button onClick={() => onToast('Brouillon sauvegardé.')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Sauvegarder brouillon
                </button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <KpiCard label="Envoyées"   value={newsletters.filter((n:any)=>n.statut==='envoyée').length}  Icon={Send} />
              <KpiCard label="Brouillons" value={newsletters.filter((n:any)=>n.statut==='brouillon').length} Icon={FileText} />
              <KpiCard label="Taux d\'ouverture moyen" value={newsletters.filter((n:any)=>n.envois>0).length > 0 ? `${Math.round(newsletters.filter((n:any)=>n.envois>0).reduce((s:number,n:any)=>s+Math.round((n.ouvertures/n.envois)*100),0)/newsletters.filter((n:any)=>n.envois>0).length)} %` : '—'} Icon={TrendingUp} />
            </div>
            <Card>
              <CardHeader title="Historique des newsletters" />
              <div className="divide-y divide-slate-50">
                {newsletters.map((n: any) => (
                  <div key={n.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.objet}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(n.date)} · {n.cible}</p>
                    </div>
                    {n.statut === 'envoyée' && (
                      <div className="flex gap-4 text-center shrink-0">
                        <div><p className="font-bold text-sm text-slate-800">{n.envois}</p><p className="text-[9px] text-slate-400">Envois</p></div>
                        <div><p className="font-bold text-sm text-emerald-700">{n.ouvertures}</p><p className="text-[9px] text-slate-400">Ouvertures</p></div>
                        <div><p className="font-bold text-sm text-slate-600">{Math.round((n.ouvertures/n.envois)*100)}%</p><p className="text-[9px] text-slate-400">Taux</p></div>
                      </div>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${n.statut==='envoyée'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {n.statut==='envoyée'?'Envoyée':'Brouillon'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. BLOG
// ════════════════════════════════════════════════════════════════════════════

const BLOG_CATS = ['Pédagogie','Vie scolaire','Événements','Conseils parents','Bilingue'];
const EMPTY_ARTICLE = { titre:'', auteur:'Direction EPV Horizons Savants', cat:'Pédagogie', contenu:'', statut:'brouillon' };

function BlogTab({ onToast }: DataProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [form,     setForm]     = useState<any | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { apiFetch('/api/articles').then(setArticles).catch(console.error); }, []);

  const toggleStatut = async (id: string) => {
    const a = articles.find(x => x.id === id);
    if (!a) return;
    const next = a.statut === 'publié' ? 'brouillon' : 'publié';
    await apiPatch(`/api/articles/${id}`, { statut: next });
    setArticles(prev => prev.map(x => x.id === id ? { ...x, statut: next } : x));
    onToast(`Article ${next === 'publié' ? 'publié' : 'dépublié'}.`);
  };

  const handleSave = async () => {
    if (!form.titre?.trim() || !form.contenu?.trim()) { onToast('Titre et contenu requis.'); return; }
    setSaving(true);
    try {
      if (form.id) {
        await apiPatch(`/api/articles/${form.id}`, form);
        setArticles(prev => prev.map(a => a.id === form.id ? { ...a, ...form } : a));
        onToast('Article mis à jour.');
      } else {
        const r = await apiPost('/api/articles', { ...form, vues: 0, date: new Date().toISOString().slice(0,10) });
        let data: any = {};
        try { data = await r.json(); } catch {}
        if (r.ok) setArticles(prev => [data, ...prev]);
        onToast('Article créé.');
      }
      setForm(null);
    } catch { onToast('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet article définitivement ?')) return;
    await apiDelete(`/api/articles/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
    onToast('Article supprimé.');
  };

  return (
    <PageLayout title="Blog — CMS" sub="Gestion des articles publiés sur le site public"
      actions={
        <button onClick={() => setForm({ ...EMPTY_ARTICLE })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Nouvel article
        </button>
      }
    >
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">{form.id ? 'Modifier l\'article' : 'Nouvel article'}</p>
                <button onClick={() => setForm(null)} className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"><X size={15} className="text-slate-400" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Titre</label>
                  <input value={form.titre} onChange={e => setForm((f: any) => ({...f, titre:e.target.value}))}
                    placeholder="Titre de l'article..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Auteur</label>
                  <input value={form.auteur} onChange={e => setForm((f: any) => ({...f, auteur:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
                  <select value={form.cat} onChange={e => setForm((f: any) => ({...f, cat:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {BLOG_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm((f: any) => ({...f, statut:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    <option value="brouillon">Brouillon</option>
                    <option value="publié">Publié</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Contenu</label>
                  <textarea value={form.contenu} onChange={e => setForm((f: any) => ({...f, contenu:e.target.value}))} rows={10}
                    placeholder="Rédigez le contenu de l'article ici..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 resize-y font-sans" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Articles publiés" value={articles.filter(a=>a.statut==='publié').length}   Icon={Globe}    />
        <KpiCard label="Brouillons"       value={articles.filter(a=>a.statut==='brouillon').length} Icon={FileText} />
        <KpiCard label="Vues totales"     value={articles.reduce((s,a)=>s+(a.vues||0),0)}          Icon={Eye}      />
      </div>
      <Card>
        <CardHeader title="Articles" />
        <div className="divide-y divide-slate-50">
          {articles.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Aucun article. Créez votre premier article ci-dessus.</p>
          )}
          {articles.map(a => (
            <div key={a.id} className="px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{a.titre}</p>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{a.cat}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{a.auteur} · {fmtDate(a.date)} · {a.vues||0} vues</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${a.statut==='publié'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {a.statut==='publié'?'Publié':'Brouillon'}
                </span>
                <button onClick={() => toggleStatut(a.id)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" title={a.statut==='publié'?'Dépublier':'Publier'}>
                  {a.statut==='publié' ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => setForm({ ...a })}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. FAQ
// ════════════════════════════════════════════════════════════════════════════

const FAQ_CATS = ['Admissions','Pédagogie','Finances','Services','Vie scolaire'];
const EMPTY_FAQ = { question:'', reponse:'', cat:'Admissions', ordre:1, publie:true };

function FaqTab({ onToast }: DataProps) {
  const [faqs,      setFaqs]      = useState<any[]>([]);
  const [openId,    setOpenId]    = useState<string|null>(null);
  const [filterCat, setFilterCat] = useState('ALL');
  const [form,      setForm]      = useState<any | null>(null);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { apiFetch('/api/faq').then(setFaqs).catch(console.error); }, []);

  const cats = [...new Set(faqs.map((f: any) => f.cat))];

  const toggle = async (id: string) => {
    const f = faqs.find(x => x.id === id);
    if (!f) return;
    await apiPatch(`/api/faq/${id}`, { publie: !f.publie });
    setFaqs(prev => prev.map(x => x.id === id ? { ...x, publie: !f.publie } : x));
    onToast(f.publie ? 'Question dépubliée.' : 'Question publiée.');
  };

  const handleSave = async () => {
    if (!form.question?.trim() || !form.reponse?.trim()) { onToast('Question et réponse requises.'); return; }
    setSaving(true);
    try {
      if (form.id) {
        await apiPatch(`/api/faq/${form.id}`, form);
        setFaqs(prev => prev.map(f => f.id === form.id ? { ...f, ...form } : f));
        onToast('Question mise à jour.');
      } else {
        const r = await apiPost('/api/faq', form);
        let data: any = {};
        try { data = await r.json(); } catch {}
        if (r.ok) setFaqs(prev => [...prev, data]);
        onToast('Question créée.');
      }
      setForm(null);
    } catch { onToast('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    await apiDelete(`/api/faq/${id}`);
    setFaqs(prev => prev.filter(f => f.id !== id));
    if (openId === id) setOpenId(null);
    onToast('Question supprimée.');
  };

  const filtered = faqs.filter((f: any) => filterCat === 'ALL' || f.cat === filterCat);

  return (
    <PageLayout title="FAQ — CMS" sub="Questions fréquentes affichées sur le site public"
      actions={
        <button onClick={() => setForm({ ...EMPTY_FAQ, ordre: faqs.length + 1 })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          <Plus size={13} /> Nouvelle question
        </button>
      }
    >
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">{form.id ? 'Modifier la question' : 'Nouvelle question'}</p>
                <button onClick={() => setForm(null)} className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"><X size={15} className="text-slate-400" /></button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Question</label>
                  <input value={form.question} onChange={e => setForm((f: any) => ({...f, question:e.target.value}))}
                    placeholder="Question fréquemment posée..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
                  <select value={form.cat} onChange={e => setForm((f: any) => ({...f, cat:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {FAQ_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Réponse</label>
                  <textarea value={form.reponse} onChange={e => setForm((f: any) => ({...f, reponse:e.target.value}))} rows={5}
                    placeholder="Réponse détaillée..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 resize-y font-sans" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Publiée</label>
                  <input type="checkbox" checked={form.publie} onChange={e => setForm((f: any) => ({...f, publie:e.target.checked}))} className="cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                  <CheckCircle size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Questions publiées" value={faqs.filter(f=>f.publie).length}   Icon={CheckCircle} />
        <KpiCard label="Non publiées"        value={faqs.filter(f=>!f.publie).length} Icon={XCircle}     />
        <KpiCard label="Catégories"          value={cats.length}                       Icon={Hash}        />
      </div>

      <Card className="p-3.5 flex gap-2 flex-wrap items-center">
        {[['ALL','Toutes'], ...cats.map(c=>[c,c])].map(([v,l]) => (
          <button key={v} onClick={() => setFilterCat(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors
              ${filterCat===v?'bg-[#0D2E5C] text-white border-[#0D2E5C]':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </Card>

      <Card>
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Aucune question. Créez votre première question ci-dessus.</p>
          )}
          {filtered.map(f => (
            <div key={f.id} className={`${!f.publie ? 'opacity-60' : ''}`}>
              <button onClick={() => setOpenId(openId === f.id ? null : f.id)}
                className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-[9px] font-bold text-slate-400 w-5 shrink-0">{String(f.ordre).padStart(2,'0')}</span>
                <p className="flex-1 text-xs font-semibold text-slate-800">{f.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{f.cat}</span>
                  {openId === f.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </button>
              <AnimatePresence>
                {openId === f.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-4 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-md p-3">{f.reponse}</p>
                      <div className="flex gap-2">
                        <button onClick={() => toggle(f.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors
                            ${f.publie?'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200':'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                          {f.publie ? <><ToggleRight size={12}/> Dépublier</> : <><ToggleLeft size={12}/> Publier</>}
                        </button>
                        <button onClick={() => { setForm({ ...f }); setOpenId(null); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(f.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors">
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10. GALERIE
// ════════════════════════════════════════════════════════════════════════════

const GALERIE_CATS = ['Vie de classe','Événements','Installations','Sports','Arts'];

function GalerieTab({ onToast }: DataProps) {
  const [galerie,   setGalerie]   = useState<any[]>([]);
  const [filterCat, setFilterCat] = useState('ALL');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ titre:'', cat:'Vie de classe', classe:'', date: new Date().toISOString().slice(0,10) });
  const [galFile,   setGalFile]   = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const galFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { apiFetch('/api/galerie').then(setGalerie).catch(console.error); }, []);

  const cats = [...new Set(galerie.map((g: any) => g.cat))];
  const filtered = galerie.filter((g: any) => filterCat === 'ALL' || g.cat === filterCat);

  const handleAdd = async () => {
    if (!form.titre.trim()) { onToast('Titre requis.'); return; }
    if (!galFile) { onToast('Sélectionnez une photo à uploader.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('photo', galFile);
      fd.append('titre', form.titre);
      fd.append('cat',   form.cat);
      fd.append('classe', form.classe);
      const r = await authFetch('/api/galerie/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (r.ok) setGalerie(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ titre:'', cat:'Vie de classe', classe:'', date: new Date().toISOString().slice(0,10) });
      setGalFile(null);
      if (galFileRef.current) galFileRef.current.value = '';
      onToast('Photo uploadée dans R2 et ajoutée à la galerie.');
    } catch { onToast('Erreur upload.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    await apiDelete(`/api/galerie/${id}`);
    setGalerie(prev => prev.filter(g => g.id !== id));
    onToast('Photo supprimée.');
  };

  return (
    <PageLayout title="Galerie — CMS" sub="Médiathèque photographique de l'établissement"
      actions={
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
          {showForm ? <><X size={13} /> Annuler</> : <><Plus size={13} /> Ajouter une photo</>}
        </button>
      }
    >
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Card className="p-5 border-2 border-[#0D2E5C]">
              <p className="text-sm font-semibold text-[#2C2C2C] mb-4">Uploader une photo vers R2</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Fichier image (JPG, PNG, WebP — max 20 Mo)</label>
                  <input ref={galFileRef} type="file" accept="image/*"
                    onChange={e => setGalFile(e.target.files?.[0] ?? null)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0D2E5C] file:text-white cursor-pointer" />
                  {galFile && <p className="text-[10px] text-[#2D8C3C] mt-1 font-semibold">✓ {galFile.name} ({(galFile.size/1024).toFixed(0)} Ko)</p>}
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Titre</label>
                  <input value={form.titre} onChange={e => setForm(f => ({...f, titre:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
                  <select value={form.cat} onChange={e => setForm(f => ({...f, cat:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white">
                    {GALERIE_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Classe / Niveau</label>
                  <input value={form.classe} onChange={e => setForm(f => ({...f, classe:e.target.value}))}
                    placeholder="ex: CP, GS…"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400" />
                </div>
              </div>
              <button onClick={handleAdd} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors disabled:opacity-50">
                <CheckCircle size={13} /> {saving ? 'Ajout…' : 'Ajouter à la galerie'}
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total photos"  value={galerie.length} Icon={Image}   />
        <KpiCard label="Catégories"    value={cats.length}    Icon={Layers}  />
        <KpiCard label="Médias indexés" value={galerie.length} Icon={Download}/>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['ALL','Toutes'], ...cats.map(c=>[c,c])].map(([v,l]) => (
          <button key={v} onClick={() => setFilterCat(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors
              ${filterCat===v?'bg-[#0D2E5C] text-white border-[#0D2E5C]':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center">
          <Image size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Aucune photo. Ajoutez votre première photo ci-dessus.</p>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(g => (
          <div key={g.id} className="group relative bg-slate-100 border border-slate-200 rounded-lg overflow-hidden aspect-video">
            {g.url ? (
              <img src={g.url} alt={g.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3">
                <Image size={24} className="text-slate-300 mb-1.5" />
                <p className="text-[10px] font-semibold text-slate-600 text-center line-clamp-2">{g.titre}</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-[9px] text-white font-semibold truncate">{g.titre}</p>
              <span className="text-[8px] text-white/60">{g.cat}</span>
            </div>
            <div className="absolute inset-0 bg-[#0D2E5C]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {g.url && (
                <a href={g.url} target="_blank" rel="noreferrer"
                  className="p-1.5 rounded bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors">
                  <Eye size={13} />
                </a>
              )}
              <button onClick={() => handleDelete(g.id)}
                className="p-1.5 rounded bg-white/20 text-white hover:bg-red-500/80 cursor-pointer transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11. TÉMOIGNAGES
// ════════════════════════════════════════════════════════════════════════════

function TemoignagesTab({ onToast }: DataProps) {
  const [temos, setTemos] = useState<any[]>([]);
  useEffect(() => { apiFetch('/api/temoignages').then(setTemos).catch(console.error); }, []);

  const update = async (id: string, patch: any) => {
    await apiPatch(`/api/temoignages/${id}`, patch);
    setTemos(p => p.map(t => t.id === id ? { ...t, ...patch } : t));
  };
  const approve = (id: string) => { update(id, { statut:'publié'  }); onToast('Témoignage approuvé et publié.'); };
  const refuse  = (id: string) => { update(id, { statut:'refusé'  }); onToast('Témoignage refusé.'); };
  const toggleV = (id: string) => {
    const t = temos.find(x => x.id === id);
    if (t) update(id, { vedette: !t.vedette });
  };

  const publiés  = temos.filter(t=>t.statut==='publié');
  const avgNote  = publiés.length > 0 ? (publiés.reduce((s,t)=>s+t.note,0)/publiés.length).toFixed(1) : '—';

  return (
    <PageLayout title="Témoignages — CMS" sub="Avis de parents affichés sur le site public">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total reçus"    value={temos.length}                              Icon={MessageSquare} />
        <KpiCard label="Publiés"        value={temos.filter(t=>t.statut==='publié').length}  Icon={CheckCircle}   />
        <KpiCard label="En attente"     value={temos.filter(t=>t.statut==='en_attente').length} Icon={Clock}      />
        <KpiCard label="Note moyenne"   value={`${avgNote}/5`}                            Icon={Star}          />
      </div>

      <div className="grid gap-4">
        {temos.map(t => (
          <Card key={t.id} className={`p-5 ${t.statut==='refusé'?'opacity-50':''}`}>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-md bg-[#0D2E5C] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {t.parent[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{t.parent}</p>
                  <p className="text-[11px] text-slate-400">{t.enfant}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s<=t.note?'text-amber-400 fill-amber-400':'text-slate-200'} />
                    ))}
                  </div>
                  {t.vedette && <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">Vedette</span>}
                  <p className="text-[10px] text-slate-400 ml-auto">{fmtDate(t.date)}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 font-serif">{t.texte}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${t.statut==='publié'?'bg-emerald-50 text-emerald-700 border-emerald-200':t.statut==='en_attente'?'bg-amber-50 text-amber-700 border-amber-200':'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {t.statut==='publié'?'Publié':t.statut==='en_attente'?'En attente':'Refusé'}
                  </span>
                  {t.statut === 'en_attente' && (
                    <>
                      <button onClick={() => approve(t.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold cursor-pointer hover:bg-emerald-100 transition-colors">
                        <ThumbsUp size={11} /> Approuver
                      </button>
                      <button onClick={() => refuse(t.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold cursor-pointer hover:bg-red-100 transition-colors">
                        <ThumbsDown size={11} /> Refuser
                      </button>
                    </>
                  )}
                  {t.statut === 'publié' && (
                    <button onClick={() => { toggleV(t.id); onToast(t.vedette?'Retrait vedette.':'Mis en vedette.'); }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer border transition-colors ${t.vedette?'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100':'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <Pin size={11} /> {t.vedette?'Retirer la vedette':'Mettre en vedette'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12. LOGS SYSTÈME
// ════════════════════════════════════════════════════════════════════════════

function LogsTab({ onToast }: DataProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    apiFetch('/api/logs').then((data: any[]) =>
      setLogs([...data].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()))
    ).catch(console.error);
  }, []);

  const actionTypes = [...new Set(logs.map((l: any) => l.action))];
  const filtered = logs.filter((l: any) => filterAction === 'ALL' || l.action === filterAction);

  const actionStyle: Record<string, string> = {
    LOGIN:  'bg-blue-50 text-blue-700 border-blue-200',
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-red-50 text-red-600 border-red-200',
    SEND:   'bg-violet-50 text-violet-700 border-violet-200',
    EXPORT: 'bg-slate-50 text-slate-600 border-slate-200',
    APPROVE:'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <PageLayout title="Logs système" sub="Journal d'activité de la console d'administration"
      actions={
        <button onClick={() => onToast('Export des logs en cours...')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
          <Download size={13} /> Exporter
        </button>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        {['LOGIN','CREATE','UPDATE','DELETE'].map(a => (
          <KpiCard key={a} label={a} value={logs.filter((l:any)=>l.action===a).length} Icon={Terminal} />
        ))}
      </div>

      <Card className="p-3.5 flex gap-2 flex-wrap items-center">
        <button onClick={() => setFilterAction('ALL')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${filterAction==='ALL'?'bg-[#0D2E5C] text-white border-[#0D2E5C]':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Toutes les actions
        </button>
        {actionTypes.map(a => (
          <button key={a} onClick={() => setFilterAction(a)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${filterAction===a?'bg-[#0D2E5C] text-white border-[#0D2E5C]':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {a}
          </button>
        ))}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Horodatage','Utilisateur','Action','Module','Détail'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(l.ts).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                    {' · '}
                    {new Date(l.ts).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{l.user}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${actionStyle[l.action] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{l.module}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[320px] truncate">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">Affichage des {filtered.length} derniers événements · Conservation : 90 jours</p>
        </div>
      </Card>
    </PageLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => {
  const [isAdmin,  setIsAdmin]  = useState<boolean | null>(null); // null = en cours de vérification
  const checkedRef = useRef(false);

  const [prospects,     setProspects]     = useState<Prospect[]>([]);
  const [appointments,  setAppointments]  = useState<RendezVous[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [quotas,        setQuotas]        = useState<SectionPlace[]>([]);
  const [contacts,      setContacts]      = useState<any[]>([]);

  const [tarifs, setTarifs] = useState<Record<string,number>>(TARIFS_DEFAUT);
  const [config, setConfig] = useState<Record<string,any>>({});

  const [tab,          setTab]          = useState<AdminTab>('dashboard');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [refresh,      setRefresh]      = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [bulletinDrawerProspect, setBulletinDrawerProspect] = useState<Prospect | null>(null);

  // Vérification de session Neon Auth au montage
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkSession().then(valid => {
      setIsAdmin(valid || localStorage.getItem('is_admin') === 'true');
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const load = (path: string, setter: (d: any) => void) =>
      authFetch(path).then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(setter).catch(console.error);
    load('/api/prospects',     setProspects);
    load('/api/rendezvous',    setAppointments);
    load('/api/notifications', setNotifications);
    load('/api/places',        setQuotas);
    load('/api/contacts',      setContacts);

    fetch('/api/configuration').then(r => r.json()).then(cfg => {
      setConfig(cfg);
      if (cfg.tarifs) setTarifs(cfg.tarifs);
    }).catch(() => {});
  }, [isAdmin, refresh]);

  const handleProspectStatus = useCallback(async (id: string, s: StatutProspect) => {
    await authFetch(`/api/prospects/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ statut:s }) });
    setToast(`Statut mis à jour → ${s}`); setRefresh(r => !r);
  }, []);

  const handleRdvStatus = useCallback(async (id: string, s: StatutRendezVous) => {
    await authFetch(`/api/rendezvous/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ statut:s }) });
    setToast(`RDV → ${s}`); setRefresh(r => !r);
  }, []);

  const handleContactStatus = useCallback(async (id: string, s: string) => {
    await authFetch(`/api/contacts/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ statut:s }) });
    setToast(`Message → ${s}`); setRefresh(r => !r);
  }, []);

  const handleLogout = async () => {
    await signOutNeon();
    window.location.hash = '#';
  };

  // Global search → navigate to annuaire
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      setTab('annuaire');
    }
  };

  const msgCount = contacts.filter(c => c.statut !== 'Traité').length;
  const rdvCount = appointments.filter(r => r.statut === StatutRendezVous.PLANIFIE).length;

  const badges: Partial<Record<AdminTab, number>> = {
    annuaire:  prospects.length,
    messages:  msgCount,
    inscriptions: rdvCount,
  };

  const dataProps: DataProps = {
    prospects, appointments, quotas, notifications, contacts,
    tarifs, config,
    onProspectStatus: handleProspectStatus,
    onRdvStatus:      handleRdvStatus,
    onContactStatus:  handleContactStatus,
    onToast:    m => setToast(m),
    onRefresh:  () => setRefresh(r => !r),
    onTabChange: (t) => setTab(t),
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D2E5C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">Session expirée</p>
          <p className="text-xs text-slate-400 mb-5">Reconnectez-vous pour accéder à la console d'administration.</p>
          <button onClick={() => { window.location.hash='#/admin'; }}
            className="w-full py-2.5 rounded-md bg-[#0D2E5C] text-white text-sm font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  const currentLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === tab)?.label || tab;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">

      {/* ══ SIDEBAR ════════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[220px] bg-[#0D2E5C] flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-[52px] border-b border-white/6 shrink-0">
          <img src="/img/logo.jpg" alt="EPV" className="w-7 h-7 rounded-md object-contain bg-white/90 p-0.5" />
          <div>
            <p className="text-[11.5px] font-bold text-white leading-tight">Console Admin</p>
            <p className="text-[8.5px] text-white/30 uppercase tracking-wider">EPV Horizons Savants</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
          {NAV_GROUPS.map(group => (
            <div key={group.group} className="mb-3">
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest px-3 mb-1">{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map(({ id, label, Icon }) => {
                  const badge  = badges[id];
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12px] font-medium transition-all cursor-pointer
                        ${active
                          ? 'bg-[#F5A623]/15 text-white border-l-2 border-[#F5A623]'
                          : 'text-white/50 hover:text-white hover:bg-white/8'}`}>
                      <Icon size={13} className="shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center
                          ${active ? 'bg-[#F5A623] text-[#0D2E5C]' : 'bg-white/15 text-white'}`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2 border-t border-white/6 shrink-0">
          <button onClick={() => setRefresh(r => !r)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-white/35 hover:text-white/70 hover:bg-white/5 text-[12px] cursor-pointer transition-all">
            <RefreshCw size={13} /> Actualiser
          </button>
          <button onClick={() => { window.location.hash = '#'; }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-white/35 hover:text-white/70 hover:bg-white/5 text-[12px] cursor-pointer transition-all">
            <Globe size={13} /> Voir le site
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-[12px] cursor-pointer transition-all">
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:ml-[220px]">

        {/* Top header */}
        <header className="sticky top-0 z-20 h-[52px] bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={17} className="text-slate-500" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span>EPV Admin</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-semibold text-slate-700">{currentLabel}</span>
          </div>

          {/* Global search */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Rechercher élève, parent, facture... (↵)"
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setRefresh(r => !r)}
              className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors" title="Actualiser">
              <RefreshCw size={15} className="text-slate-400" />
            </button>
            {msgCount > 0 && (
              <button onClick={() => setTab('messages')}
                className="relative p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                <Bell size={15} className="text-slate-400" />
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {msgCount}
                </span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700">
              <div className="w-5 h-5 rounded bg-[#0D2E5C] flex items-center justify-center text-white text-[9px] font-bold">A</div>
              admin@epv.ci
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-red-500 border border-red-100 hover:bg-red-50 text-[11px] font-semibold cursor-pointer transition-colors">
              <LogOut size={13} /> <span className="hidden sm:inline">Déco</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity:0, y:5 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-5 }}
              transition={{ duration:0.18 }}>

              {tab === 'dashboard'    && <DashboardTab       {...dataProps} />}
              {tab === 'statistiques' && <StatistiquesTab    {...dataProps} />}
              {tab === 'annuaire'     && <AnnuaireTab        {...dataProps} />}
              {tab === 'inscriptions' && <InscriptionsTab    {...dataProps} />}
              {tab === 'classes'      && <ClassesTab         {...dataProps} />}
              {tab === 'bulletins'    && <BulletinsTab onToast={dataProps.onToast}
                onSelectEleve={id => {
                  const p = prospects.find(pr => pr.id === id);
                  if (p) setBulletinDrawerProspect(p);
                }} />}
              {tab === 'messages'     && <MessagerieTab      {...dataProps} />}
              {tab === 'notif-log'    && <MessagerieTab      {...dataProps} />}
              {tab === 'configuration'&& <ConfigurationTab   {...dataProps} />}
              {tab === 'qrmarketing'  && <QRTab              {...dataProps} />}

              {tab === 'assiduite'    && <AssiduiteTab    {...dataProps} />}
              {tab === 'enseignants'  && <EnseignantsTab  {...dataProps} />}
              {tab === 'rh'           && <RhTab           {...dataProps} />}
              {tab === 'scolarites'   && <ScolaritesTab   {...dataProps} />}
              {tab === 'facturation'  && <FacturationTab  {...dataProps} />}
              {tab === 'depenses'     && <DepensesTab     {...dataProps} />}
              {tab === 'newsletters'  && <NewslettersTab  {...dataProps} />}
              {tab === 'blog'         && <BlogTab         {...dataProps} />}
              {tab === 'faq'          && <FaqTab          {...dataProps} />}
              {tab === 'galerie'      && <GalerieTab      {...dataProps} />}
              {tab === 'temoignages'  && <TemoignagesTab  {...dataProps} />}
              {tab === 'logs'         && <LogsTab         {...dataProps} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Drawer élève — depuis Bulletins/Notes */}
      <AnimatePresence>
        {bulletinDrawerProspect && (
          <ProspectDrawer
            prospect={bulletinDrawerProspect}
            appointments={appointments}
            onClose={() => setBulletinDrawerProspect(null)}
            onStatus={(id, s) => { handleProspectStatus(id, s); setBulletinDrawerProspect(null); }}
            onToast={m => setToast(m)}
            onRefresh={() => setRefresh(r => !r)}
          />
        )}
      </AnimatePresence>

      {toast && <Toast message={toast} type="info" onClose={() => setToast(null)} />}
    </div>
  );
};
