/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../../lib/auth.ts';
import {
  BookOpen, Plus, Trash2, Send, Download, FileText,
  CheckCircle, Clock, Users, BarChart2, Save,
  Bell, FileSpreadsheet, Printer, RefreshCw, Eye, EyeOff
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Eleve {
  id: string;
  prenomEnfant: string; nomEnfant: string;
  dateNaissance: string; commune: string;
  prenomParent: string; nomParent: string;
  lienParente: string; telephone: string; email: string;
  sectionVisee: string; statut: string;
}
interface NoteRow { matiere: string; t1?: number; t2?: number; t3?: number; coef: number; }
interface Bulletin {
  id: string; prospectId: string;
  prenomEnfant: string; nomEnfant: string;
  trimestre: string; moyenneGenerale: number; rang: number;
  effectifClasse: number; mention: string; notesDetail: any[];
  publie: boolean;
}
interface Composition {
  id: string; titre: string; section: string; trimestre: string;
  dateDebut: string; statut: string; matieres: string[]; notifEnvoye: boolean;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const SECTIONS = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2'];
const TRIMESTRES = ['T1','T2','T3'];
const SECTION_LABEL: Record<string,string> = {
  PS:'Petite Section (PS)', MS:'Moyenne Section (MS)', GS:'Grande Section (GS)',
  CP:'CP (CPI)', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};
const MATIERES: Record<string,string[]> = {
  mat: ['Éveil','Langage oral','Anglais','Mathématiques','Arts plastiques','EPS','Vie collective'],
  prim:['Français','Mathématiques','Anglais','Sciences','Histoire-Géo','Éd. civique','Arts plastiques','EPS'],
};

const isMat = (s: string) => ['PS','MS','GS'].includes(s);
const getMatieres = (s: string) => isMat(s) ? MATIERES.mat : MATIERES.prim;

function noteColor(n?: number) {
  if (n === undefined || n === null) return '#94a3b8';
  if (n >= 16) return '#16a34a';
  if (n >= 12) return '#2563eb';
  if (n >= 10) return '#d97706';
  return '#dc2626';
}
function noteLabel(n?: number) {
  if (n === undefined || n === null) return '—';
  return n.toFixed(2);
}
function mentionClass(m: string) {
  if (m === 'Félicitations') return 'bg-amber-50 text-amber-700 border-amber-300';
  if (m === 'Très bien')     return 'bg-blue-50 text-blue-700 border-blue-300';
  if (m === 'Bien')          return 'bg-emerald-50 text-emerald-700 border-emerald-300';
  if (m === 'Assez bien')    return 'bg-sky-50 text-sky-600 border-sky-300';
  return 'bg-slate-50 text-slate-500 border-slate-300';
}
function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(rows: any[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Impression HTML → PDF ────────────────────────────────────────────────────

const PRINT_BASE_CSS = `
  @page { size: A4 landscape; margin: 12mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; font-size: 9pt; color: #1e293b; }
  .epv-header { display: flex; justify-content: space-between; align-items: center;
    border-bottom: 3px solid #0D2E5C; padding-bottom: 8px; margin-bottom: 12px; }
  .epv-header h1 { font-size: 14pt; font-weight: 900; color: #0D2E5C; margin: 0; }
  .epv-header p  { font-size: 8pt; color: #475569; margin: 2px 0; }
  .epv-header .badge { background: #0D2E5C; color: white; padding: 5px 12px;
    border-radius: 6px; font-size: 9pt; font-weight: 700; }
  .meta { background: #F8FAFF; border: 1px solid #e2e8f0; border-radius: 6px;
    padding: 8px 12px; margin-bottom: 10px; font-size: 8pt; }
  .meta span { font-weight: 700; color: #0D2E5C; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #0D2E5C; color: white; }
  th { padding: 6px 8px; text-align: left; font-size: 8pt; font-weight: 700;
    border: 1px solid #1A4F8B; white-space: nowrap; }
  td { padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 8pt; vertical-align: middle; }
  tr:nth-child(even) td { background: #F8FAFF; }
  tr:nth-child(odd)  td { background: #ffffff; }
  .num { text-align: center; font-weight: 700; color: #0D2E5C; }
  .g { color: #16a34a; font-weight: 700; }
  .b { color: #2563eb; font-weight: 600; }
  .a { color: #d97706; }
  .r { color: #dc2626; }
  .footer { margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px;
    font-size: 7pt; color: #94a3b8; display: flex; justify-content: space-between; }
`;

function printClasseList(eleves: Eleve[], section: string) {
  const rows = eleves.map((e, i) => `
    <tr>
      <td class="num">${String(i+1).padStart(2,'0')}</td>
      <td style="font-weight:700">${e.nomEnfant}</td>
      <td>${e.prenomEnfant}</td>
      <td class="num">${fmtDate(e.dateNaissance)}</td>
      <td>${e.commune || '—'}</td>
      <td>${e.nomParent} ${e.prenomParent}</td>
      <td>${e.lienParente || '—'}</td>
      <td>${e.telephone || '—'}</td>
      <td class="num"><span style="background:${e.statut==='Inscrit'?'#dcfce7':'#fef9c3'};color:${e.statut==='Inscrit'?'#15803d':'#ca8a04'};padding:2px 6px;border-radius:10px;font-size:7pt;font-weight:700">${e.statut}</span></td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Liste de classe — ${SECTION_LABEL[section]} 2026-2027</title>
  <style>${PRINT_BASE_CSS}</style></head><body>
  <div class="epv-header">
    <div><h1>EPV Horizons Savants</h1>
    <p>École Maternelle & Primaire d'Excellence bilingue · Bingerville, Abidjan</p>
    <p>Agrément MENA N° 2026/SAG · contact@horizonssavants.com</p></div>
    <div class="badge">LISTE DE CLASSE</div>
  </div>
  <div class="meta">
    Classe : <span>${SECTION_LABEL[section]}</span> &nbsp;·&nbsp;
    Année scolaire : <span>2026 / 2027</span> &nbsp;·&nbsp;
    Effectif total : <span>${eleves.length} élève${eleves.length>1?'s':''}</span> &nbsp;·&nbsp;
    Imprimé le : <span>${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
  </div>
  <table>
    <thead><tr>
      <th style="width:30px">N°</th>
      <th>NOM</th><th>Prénom</th>
      <th>Date de naissance</th><th>Commune / Lieu de résidence</th>
      <th>Parent / Tuteur</th><th>Lien</th><th>Téléphone</th><th>Statut</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span>EPV Horizons Savants — Document administratif officiel — Année 2026/2027</span>
    <span>Page 1</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px">
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;min-height:50px">
      <div style="font-size:7pt;color:#94a3b8;margin-bottom:4px">Signature de l'enseignant(e)</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;min-height:50px">
      <div style="font-size:7pt;color:#94a3b8;margin-bottom:4px">Cachet & Signature de la Direction</div>
    </div>
  </div>
  </body></html>`;

  const w = window.open('','_blank')!;
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

function printBulletinsClasse(bulletins: Bulletin[], section: string, trimestre: string) {
  const matieres = getMatieres(section);
  const colWidth = Math.floor(60 / matieres.length);

  const rows = bulletins.map((b, i) => {
    const noteCls = (n: number) => n >= 16 ? 'g' : n >= 12 ? 'b' : n >= 10 ? 'a' : 'r';
    const noteCells = matieres.map(mat => {
      const n = (b.notesDetail || []).find((x: any) => x.matiere === mat);
      const val = n?.note;
      return `<td class="num ${val !== undefined ? noteCls(val) : ''}">${val !== undefined ? val.toFixed(2) : '—'}</td>`;
    }).join('');
    return `<tr>
      <td class="num">${b.rang ?? '—'}</td>
      <td style="font-weight:700">${b.nomEnfant}</td>
      <td>${b.prenomEnfant}</td>
      ${noteCells}
      <td class="num" style="color:${noteColor(b.moyenneGenerale)};font-weight:700">${b.moyenneGenerale?.toFixed(2) ?? '—'}</td>
      <td class="num"><span style="background:${b.mention==='Félicitations'?'#fef3c7':b.mention==='Très bien'?'#dbeafe':b.mention==='Bien'?'#dcfce7':'#f1f5f9'};padding:2px 7px;border-radius:10px;font-size:7pt;font-weight:700;color:#1e293b">${b.mention || '—'}</span></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Tableau de bord — ${SECTION_LABEL[section]} ${trimestre} 2026-2027</title>
  <style>${PRINT_BASE_CSS.replace('landscape','portrait')}</style></head><body>
  <div class="epv-header">
    <div><h1>EPV Horizons Savants</h1>
    <p>École Maternelle & Primaire d'Excellence bilingue · Bingerville, Abidjan</p>
    <p>Agrément MENA N° 2026/SAG</p></div>
    <div class="badge">TABLEAU DE BORD DES NOTES</div>
  </div>
  <div class="meta">
    Classe : <span>${SECTION_LABEL[section]}</span> &nbsp;·&nbsp;
    Trimestre : <span>${trimestre}</span> &nbsp;·&nbsp;
    Effectif : <span>${bulletins.length} élèves</span> &nbsp;·&nbsp;
    Année : <span>2026/2027</span> &nbsp;·&nbsp;
    Généré le : <span>${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
  </div>
  <table>
    <thead><tr>
      <th style="width:30px">Rang</th>
      <th>NOM</th><th>Prénom</th>
      ${matieres.map(m => `<th style="width:${colWidth}px;text-align:center">${m}</th>`).join('')}
      <th style="text-align:center">MOY.</th>
      <th style="width:80px">Mention</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:8pt">
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px">
      <div style="color:#94a3b8;font-size:7pt">Moyenne de classe</div>
      <div style="font-weight:700;font-size:11pt;color:#0D2E5C">
        ${bulletins.length ? (bulletins.reduce((s,b) => s + (b.moyenneGenerale || 0), 0) / bulletins.length).toFixed(2) : '—'} / 20
      </div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px">
      <div style="color:#94a3b8;font-size:7pt">Meilleure moyenne</div>
      <div style="font-weight:700;font-size:11pt;color:#16a34a">
        ${bulletins.length ? Math.max(...bulletins.map(b => b.moyenneGenerale || 0)).toFixed(2) : '—'} / 20
      </div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px">
      <div style="color:#94a3b8;font-size:7pt">Taux de réussite ≥10</div>
      <div style="font-weight:700;font-size:11pt;color:#2563eb">
        ${bulletins.length ? Math.round(bulletins.filter(b => b.moyenneGenerale >= 10).length / bulletins.length * 100) : 0} %
      </div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px">
      <div style="color:#94a3b8;font-size:7pt">Félicitations</div>
      <div style="font-weight:700;font-size:11pt;color:#d97706">
        ${bulletins.filter(b => b.mention === 'Félicitations').length} élève(s)
      </div>
    </div>
  </div>
  <div class="footer" style="margin-top:20px">
    <span>Document officiel EPV Horizons Savants · 2026-2027</span>
    <span>Cachet de la Direction : ________________</span>
  </div>
  </body></html>`;

  const w = window.open('','_blank')!;
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

function printBulletinIndividuel(b: Bulletin, eleve?: Eleve) {
  const detail: any[] = b.notesDetail || [];
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Bulletin ${b.prenomEnfant} ${b.nomEnfant} — ${b.trimestre}</title>
  <style>
    @page { size: A4 portrait; margin: 16mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #1e293b; }
    .hd { display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #0D2E5C; padding-bottom: 10px; margin-bottom: 14px; }
    .hd h1 { font-size: 15pt; font-weight: 900; color: #0D2E5C; }
    .hd p  { font-size: 8.5pt; color: #475569; margin: 2px 0; }
    .badge { background: #0D2E5C; color: white; padding: 6px 14px; border-radius: 7px; font-weight: 700; font-size: 10pt; text-align: center; }
    .badge small { display: block; font-size: 7pt; opacity: .7; margin-top: 2px; }
    .student-card { background: linear-gradient(135deg,#F0F7FF,#F8FAFF); border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; }
    .student-card .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .field label { font-size: 7.5pt; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; display: block; }
    .field span  { font-weight: 700; color: #0D2E5C; font-size: 10pt; }
    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 14px; }
    .stat-box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center; }
    .stat-box .val { font-size: 22pt; font-weight: 900; color: #0D2E5C; line-height: 1.1; }
    .stat-box .lbl { font-size: 7.5pt; color: #94a3b8; text-transform: uppercase; margin-top: 3px; }
    .mention-box { display: inline-block; padding: 4px 14px; border-radius: 20px; font-weight: 700;
      border: 2px solid #F5A623; background: #FFF7ED; color: #c2410c; font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    thead tr { background: #0D2E5C; color: white; }
    th { padding: 7px 10px; text-align: left; font-size: 8.5pt; font-weight: 700; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }
    tr:nth-child(even) td { background: #F8FAFF; }
    .note { font-weight: 700; text-align: center; }
    .g { color: #16a34a; } .b { color: #2563eb; } .a { color: #d97706; } .r { color: #dc2626; }
    .appr { color: #475569; font-style: italic; }
    .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
    .sig-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; min-height: 65px; }
    .sig-box label { font-size: 8pt; color: #94a3b8; display: block; margin-bottom: 3px; }
    .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 10px;
      font-size: 7.5pt; color: #94a3b8; display: flex; justify-content: space-between; }
  </style></head><body>
  <div class="hd">
    <div>
      <h1>EPV Horizons Savants</h1>
      <p>École Maternelle & Primaire d'Excellence bilingue</p>
      <p>Bingerville Mtn Kro, Cité Côtes de Grâces — Abidjan, Côte d'Ivoire</p>
      <p>Agrément MENA N° 2026/SAG &nbsp;·&nbsp; contact@horizonssavants.com</p>
    </div>
    <div class="badge">BULLETIN SCOLAIRE<small>${b.trimestre} — 2026/2027</small></div>
  </div>

  <div class="student-card">
    <div class="grid">
      <div class="field"><label>Nom et Prénom de l'élève</label>
        <span style="font-size:12pt">${b.nomEnfant} ${b.prenomEnfant}</span></div>
      <div class="field"><label>Classe</label><span>${SECTION_LABEL[eleve?.sectionVisee || ''] || eleve?.sectionVisee || '—'}</span></div>
      <div class="field"><label>Effectif de la classe</label><span>${b.effectifClasse ?? '—'} élèves</span></div>
      ${eleve ? `
      <div class="field"><label>Date de naissance</label><span>${fmtDate(eleve.dateNaissance)}</span></div>
      <div class="field"><label>Commune / Résidence</label><span>${eleve.commune || '—'}</span></div>
      <div class="field"><label>Parent / Tuteur</label><span>${eleve.prenomParent} ${eleve.nomParent}</span></div>
      ` : ''}
    </div>
  </div>

  <div class="stats">
    <div class="stat-box">
      <div class="val" style="color:${noteColor(b.moyenneGenerale)}">${b.moyenneGenerale?.toFixed(2) ?? '—'}</div>
      <div class="lbl">Moyenne / 20</div>
    </div>
    <div class="stat-box">
      <div class="val">${b.rang ?? '—'}<span style="font-size:11pt;color:#94a3b8"> / ${b.effectifClasse ?? '?'}</span></div>
      <div class="lbl">Classement</div>
    </div>
    <div class="stat-box" style="grid-column:span 2">
      <div class="lbl" style="margin-bottom:6px">Mention obtenue</div>
      <div><span class="mention-box">${b.mention || '—'}</span></div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="width:30%">Matière</th>
      <th style="width:15%;text-align:center">Note / 20</th>
      <th style="width:10%;text-align:center">Coeff.</th>
      <th>Appréciation du professeur</th>
    </tr></thead>
    <tbody>
      ${detail.map(n => {
        const cls = n.note >= 16 ? 'g' : n.note >= 12 ? 'b' : n.note >= 10 ? 'a' : 'r';
        return `<tr>
          <td><strong>${n.matiere}</strong></td>
          <td class="note ${cls}">${n.note?.toFixed(2) ?? '—'}</td>
          <td style="text-align:center">${n.coef}</td>
          <td class="appr">${n.appreciation || ''}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="sig">
    <div class="sig-box"><label>Signature & observations du parent / tuteur</label></div>
    <div class="sig-box"><label>Cachet & Signature de la Direction</label></div>
  </div>
  <div class="footer">
    <span>EPV Horizons Savants · Abidjan 2026-2027 · Document officiel</span>
    <span>Imprimé le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
  </div>
  </body></html>`;

  const w = window.open('','_blank')!;
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

// ─── Sous-onglets ─────────────────────────────────────────────────────────────

type SubTab = 'liste' | 'notes' | 'bulletins' | 'compositions';
const SUBTABS: { id: SubTab; label: string; Icon: any }[] = [
  { id: 'liste',        label: 'Liste de classe',   Icon: Users       },
  { id: 'notes',        label: 'Saisie des notes',  Icon: BookOpen    },
  { id: 'bulletins',    label: 'Bulletins',          Icon: FileText    },
  { id: 'compositions', label: 'Compositions',       Icon: Clock       },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function BulletinsTab({ onToast }: { onToast: (m: string) => void }) {
  const [sub,       setSub]       = useState<SubTab>('liste');
  const [section,   setSection]   = useState('CP');
  const [trimestre, setTrimestre] = useState('T1');
  const [loading,   setLoading]   = useState(false);

  const [eleves,      setEleves]      = useState<Eleve[]>([]);
  const [classeData,  setClasseData]  = useState<{ prospects: Eleve[]; notes: Record<string,NoteRow[]> }>({ prospects:[], notes:{} });
  const [bulletins,   setBulletins]   = useState<Bulletin[]>([]);
  const [compositions,setCompositions]= useState<Composition[]>([]);
  const [notesEdit,   setNotesEdit]   = useState<Record<string,Record<string,number|undefined>>>({});
  const [saving,      setSaving]      = useState<string|null>(null);
  const [showNewComp, setShowNewComp] = useState(false);
  const [newComp,     setNewComp]     = useState({ titre:'', section:'CP', trimestre:'T1', dateDebut:'', matieres:[] as string[] });
  const [showNotes,   setShowNotes]   = useState<Record<string,boolean>>({});

  const matieres = getMatieres(section);

  // ── Chargements ────────────────────────────────────────────────────────────

  async function loadEleves() {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/classes/${section}`);
      setEleves(await r.json());
    } finally { setLoading(false); }
  }

  async function loadNotes() {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/notes/classe/${section}/${trimestre}`);
      const d = await r.json();
      setClasseData(d);
      const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
      const init: Record<string,Record<string,number|undefined>> = {};
      for (const p of (d.prospects || [])) {
        init[p.id] = {};
        for (const mat of matieres) {
          const ex = (d.notes[p.id] || []).find((n: any) => n.matiere === mat);
          init[p.id][mat] = ex ? (ex as any)[noteField] : undefined;
        }
      }
      setNotesEdit(init);
    } finally { setLoading(false); }
  }

  async function loadBulletins() {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/bulletins/classe/${section}/${trimestre}`);
      setBulletins(await r.json());
    } finally { setLoading(false); }
  }

  async function loadCompositions() {
    setLoading(true);
    try {
      const r = await apiFetch('/api/compositions');
      setCompositions(await r.json());
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (sub === 'liste')        loadEleves();
    if (sub === 'notes')        loadNotes();
    if (sub === 'bulletins')    loadBulletins();
    if (sub === 'compositions') loadCompositions();
  }, [sub, section, trimestre]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function saveNotes(prospectId: string) {
    setSaving(prospectId);
    const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
    const payload = matieres.map(mat => ({ matiere: mat, [noteField]: notesEdit[prospectId]?.[mat] ?? null, coef: 1 }));
    await apiFetch(`/api/notes/eleve/${prospectId}`, { method:'PUT', body: JSON.stringify({ notes: payload }) });
    setSaving(null);
    onToast('Notes sauvegardées ✓');
  }

  async function genererBulletins() {
    setLoading(true);
    try {
      const r = await apiFetch('/api/bulletins/generer', { method:'POST', body: JSON.stringify({ section, trimestre }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      onToast(`${d.generated} bulletins générés ✓`);
      loadBulletins();
    } catch(e: any) { onToast('Erreur: '+e.message); }
    finally { setLoading(false); }
  }

  async function publierBulletin(id: string) {
    const r = await apiFetch(`/api/bulletins/${id}/publier`, { method:'POST' });
    const d = await r.json();
    if (d.error) { onToast('Erreur: '+d.error); return; }
    onToast('Bulletin publié + parent notifié WhatsApp ✓');
    loadBulletins();
  }

  async function createComp() {
    if (!newComp.titre || !newComp.dateDebut) { onToast('Titre et date obligatoires'); return; }
    await apiFetch('/api/compositions', { method:'POST', body: JSON.stringify(newComp) });
    onToast('Composition créée ✓');
    setShowNewComp(false);
    setNewComp({ titre:'', section:'CP', trimestre:'T1', dateDebut:'', matieres:[] });
    loadCompositions();
  }

  async function notifyComp(id: string) {
    const r = await apiFetch(`/api/compositions/${id}/notify`, { method:'POST' });
    const d = await r.json();
    if (d.error) { onToast('Erreur: '+d.error); return; }
    onToast(`${d.sent} parents notifiés ✓`);
    loadCompositions();
  }

  async function deleteComp(id: string) {
    if (!confirm('Supprimer cette composition ?')) return;
    await apiFetch(`/api/compositions/${id}`, { method:'DELETE' });
    loadCompositions();
  }

  // ── Export CSV liste de classe ──────────────────────────────────────────────
  function exportElevesCSV() {
    const header = ['N°','NOM','Prénom','Date de naissance','Commune','Parent / Tuteur','Lien de parenté','Téléphone','Email','Statut'];
    const rows = eleves.map((e,i) => [
      i+1, e.nomEnfant, e.prenomEnfant, fmtDate(e.dateNaissance),
      e.commune, `${e.prenomParent} ${e.nomParent}`, e.lienParente,
      e.telephone, e.email, e.statut
    ]);
    exportCSV([header,...rows], `liste_classe_${section}_2026-2027.csv`);
    onToast('Export Excel téléchargé ✓');
  }

  // ── Export CSV bulletins ────────────────────────────────────────────────────
  function exportBulletinsCSV() {
    const header = ['Rang','NOM','Prénom','Moyenne /20','Mention',...matieres];
    const rows = bulletins.map(b => [
      b.rang, b.nomEnfant, b.prenomEnfant,
      b.moyenneGenerale?.toFixed(2) ?? '', b.mention,
      ...matieres.map(mat => {
        const n = (b.notesDetail||[]).find((x:any) => x.matiere===mat);
        return n ? n.note?.toFixed(2) ?? '' : '';
      }),
    ]);
    exportCSV([header,...rows], `bulletins_${section}_${trimestre}_2026-2027.csv`);
    onToast('Export Excel téléchargé ✓');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-5">

      {/* Sous-onglets */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {SUBTABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setSub(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sub === id ? 'bg-[#0D2E5C] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      {sub !== 'compositions' && (
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 rounded-2xl p-3 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Section :</span>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                section === s ? 'bg-brand-gold text-white shadow' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
              }`}>{s}</button>
          ))}
          {sub !== 'liste' && <>
            <div className="w-px h-5 bg-slate-300 mx-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Trimestre :</span>
            {TRIMESTRES.map(t => (
              <button key={t} onClick={() => setTrimestre(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trimestre === t ? 'bg-[#0D2E5C] text-white shadow' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                }`}>{t}</button>
            ))}
          </>}
          <button onClick={() => { if(sub==='liste') loadEleves(); else if(sub==='notes') loadNotes(); else if(sub==='bulletins') loadBulletins(); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 cursor-pointer">
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      )}

      {loading && <div className="text-center py-10 text-slate-400 text-sm animate-pulse">Chargement…</div>}

      {/* ══ LISTE DE CLASSE ══════════════════════════════════════════════════ */}
      {!loading && sub === 'liste' && (
        <div className="space-y-4">
          {/* En-tête officiel */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-[#0D2E5C] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base">Liste de Classe Officielle</h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {SECTION_LABEL[section]} &nbsp;·&nbsp; Année scolaire 2026 / 2027 &nbsp;·&nbsp;
                  <span className="text-white/80 font-semibold">{eleves.length} élève{eleves.length>1?'s':''}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportElevesCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow">
                  <FileSpreadsheet size={13} /> Excel
                </button>
                <button onClick={() => printClasseList(eleves, section)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-gold text-white hover:brightness-105 cursor-pointer shadow">
                  <Printer size={13} /> PDF
                </button>
              </div>
            </div>

            {eleves.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Aucun élève inscrit ou pré-inscrit dans cette section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10">N°</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prénom</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date de naissance</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commune / Résidence</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parent / Tuteur</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lien</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eleves.map((e, i) => (
                      <tr key={e.id} className={`hover:bg-blue-50/40 transition-colors ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-xs font-bold text-slate-400 text-center">{String(i+1).padStart(2,'0')}</td>
                        <td className="px-4 py-3 font-bold text-[#0D2E5C] text-sm">{e.nomEnfant}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{e.prenomEnfant}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{fmtDate(e.dateNaissance)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.commune || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-700 font-medium">{e.prenomParent} {e.nomParent}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{e.lienParente || '—'}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{e.telephone}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            e.statut === 'Inscrit'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{e.statut}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pied de tableau */}
            {eleves.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  EPV Horizons Savants · Classe {section} · Année 2026-2027
                </span>
                <span className="text-xs font-bold text-[#0D2E5C]">{eleves.length} élève{eleves.length>1?'s':''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SAISIE DES NOTES ═════════════════════════════════════════════════ */}
      {!loading && sub === 'notes' && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-[#0D2E5C] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base">Saisie des Notes</h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {SECTION_LABEL[section]} &nbsp;·&nbsp; {trimestre} &nbsp;·&nbsp;
                  {classeData.prospects.length} élève{classeData.prospects.length>1?'s':''}
                </p>
              </div>
              <button onClick={() => {
                const noteField = trimestre==='T1'?'t1':trimestre==='T2'?'t2':'t3';
                const header = ['NOM','Prénom',...matieres];
                const rows = classeData.prospects.map(p => [
                  p.nomEnfant, p.prenomEnfant,
                  ...matieres.map(m => String(notesEdit[p.id]?.[m] ?? ''))
                ]);
                exportCSV([header,...rows], `notes_${section}_${trimestre}.csv`);
                onToast('Export téléchargé ✓');
              }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer">
                <FileSpreadsheet size={13} /> Export Excel
              </button>
            </div>

            {classeData.prospects.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">Aucun élève inscrit.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase w-8">N°</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Élève</th>
                      {matieres.map(m => (
                        <th key={m} className="px-2 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider" style={{ minWidth: 80 }}>
                          {m}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classeData.prospects.map((p, i) => (
                      <tr key={p.id} className={`${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                        <td className="px-4 py-2 text-xs text-slate-400 font-bold text-center">{i+1}</td>
                        <td className="px-4 py-2">
                          <div className="font-bold text-[#0D2E5C] text-sm">{p.nomEnfant} {p.prenomEnfant}</div>
                          <div className="text-[10px] text-slate-400">{fmtDate(p.dateNaissance)}</div>
                        </td>
                        {matieres.map(mat => (
                          <td key={mat} className="px-1 py-2">
                            <input
                              type="number" min="0" max="20" step="0.25"
                              value={notesEdit[p.id]?.[mat] ?? ''}
                              onChange={e => setNotesEdit(prev => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], [mat]: e.target.value==='' ? undefined : parseFloat(e.target.value) }
                              }))}
                              placeholder="—"
                              style={{ color: noteColor(notesEdit[p.id]?.[mat]) }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-center focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          <button onClick={() => saveNotes(p.id)} disabled={saving===p.id}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-[#0D2E5C] text-white hover:bg-[#1A4F8B] cursor-pointer disabled:opacity-50">
                            {saving===p.id ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />} Sauv.
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ BULLETINS ════════════════════════════════════════════════════════ */}
      {!loading && sub === 'bulletins' && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-[#0D2E5C] px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base">Tableau de Bord des Bulletins</h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {SECTION_LABEL[section]} &nbsp;·&nbsp; {trimestre} &nbsp;·&nbsp; 2026-2027
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={genererBulletins}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-gold text-white hover:brightness-105 cursor-pointer shadow">
                  <BarChart2 size={13} /> Générer les bulletins
                </button>
                {bulletins.length > 0 && <>
                  <button onClick={exportBulletinsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow">
                    <FileSpreadsheet size={13} /> Excel
                  </button>
                  <button onClick={() => printBulletinsClasse(bulletins, section, trimestre)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/15 text-white hover:bg-white/25 cursor-pointer shadow">
                    <Printer size={13} /> Tableau PDF
                  </button>
                </>}
              </div>
            </div>

            {/* Stats rapides */}
            {bulletins.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-200 border-b border-slate-200">
                {[
                  { label: 'Effectif', val: bulletins.length, color: 'text-[#0D2E5C]' },
                  { label: 'Moy. de classe', val: (bulletins.reduce((s,b)=>s+(b.moyenneGenerale||0),0)/bulletins.length).toFixed(2)+' /20', color: 'text-blue-600' },
                  { label: 'Taux réussite', val: Math.round(bulletins.filter(b=>b.moyenneGenerale>=10).length/bulletins.length*100)+'%', color: 'text-emerald-600' },
                  { label: 'Félicitations', val: bulletins.filter(b=>b.mention==='Félicitations').length, color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="px-5 py-3 text-center">
                    <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {bulletins.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Aucun bulletin. Saisissez les notes puis cliquez sur "Générer les bulletins".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase w-14">Rang</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Nom</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Prénom</th>
                      {matieres.map(m => (
                        <th key={m} className="px-2 py-3 text-center text-[9px] font-bold text-slate-400 uppercase" style={{ minWidth: 60 }}>{m}</th>
                      ))}
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase">Moy.</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase">Mention</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulletins.map((b, i) => (
                      <tr key={b.id} className={`hover:bg-blue-50/30 transition-colors ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-center">
                          {b.rang && b.rang <= 3 ? (
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mx-auto ${
                              b.rang===1?'bg-amber-100 text-amber-700':b.rang===2?'bg-slate-200 text-slate-700':'bg-orange-100 text-orange-700'
                            }`}>{b.rang}</span>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold">{b.rang ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#0D2E5C] text-sm">{b.nomEnfant}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.prenomEnfant}</td>
                        {matieres.map(mat => {
                          const n = (b.notesDetail||[]).find((x:any) => x.matiere===mat);
                          return (
                            <td key={mat} className="px-2 py-3 text-center">
                              <span className="text-xs font-bold" style={{ color: noteColor(n?.note) }}>
                                {n ? noteLabel(n.note) : '—'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-black" style={{ color: noteColor(b.moyenneGenerale) }}>
                            {b.moyenneGenerale?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${mentionClass(b.mention)}`}>
                            {b.mention || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => printBulletinIndividuel(b)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer border border-slate-200">
                              <Printer size={11} /> PDF
                            </button>
                            {!b.publie && (
                              <button onClick={() => publierBulletin(b.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer border border-blue-200">
                                <Send size={11} /> Publier
                              </button>
                            )}
                            {b.publie && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold px-2">
                                <CheckCircle size={11} /> Publié
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {bulletins.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                <span>EPV Horizons Savants · {section} · {trimestre} · 2026-2027</span>
                <span>{bulletins.length} bulletin{bulletins.length>1?'s':''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ COMPOSITIONS ═════════════════════════════════════════════════════ */}
      {!loading && sub === 'compositions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-700">Compositions planifiées</h2>
              <p className="text-xs text-slate-400 mt-0.5">Planifiez les évaluations et notifiez les parents via WhatsApp</p>
            </div>
            <button onClick={() => setShowNewComp(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-gold text-white hover:brightness-105 cursor-pointer shadow">
              <Plus size={13} /> Nouvelle composition
            </button>
          </div>

          <AnimatePresence>
            {showNewComp && (
              <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-3">Nouvelle composition</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Titre *</label>
                    <input value={newComp.titre} onChange={e => setNewComp(p=>({...p,titre:e.target.value}))}
                      placeholder="ex: Composition N°1 — Trimestre 1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Section *</label>
                    <select value={newComp.section} onChange={e => setNewComp(p=>({...p,section:e.target.value}))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold">
                      {SECTIONS.map(s => <option key={s} value={s}>{s} — {SECTION_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Trimestre *</label>
                    <select value={newComp.trimestre} onChange={e => setNewComp(p=>({...p,trimestre:e.target.value}))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold">
                      {TRIMESTRES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date de début *</label>
                    <input type="date" value={newComp.dateDebut} onChange={e => setNewComp(p=>({...p,dateDebut:e.target.value}))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Matières évaluées</label>
                  <div className="flex flex-wrap gap-2">
                    {getMatieres(newComp.section).map(mat => (
                      <button key={mat} type="button"
                        onClick={() => setNewComp(p=>({ ...p, matieres: p.matieres.includes(mat)?p.matieres.filter(m=>m!==mat):[...p.matieres,mat] }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                          newComp.matieres.includes(mat)
                            ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}>{mat}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={createComp} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D2E5C] text-white cursor-pointer hover:bg-[#1A4F8B]">Créer</button>
                  <button onClick={() => setShowNewComp(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200">Annuler</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {compositions.length === 0 && !showNewComp && (
              <div className="text-center py-12 text-slate-400 text-sm">Aucune composition planifiée.</div>
            )}
            {compositions.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-700">{c.titre}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">{c.section}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{c.trimestre}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    📅 {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'}) : '—'}
                    {c.matieres?.length > 0 && ` · ${c.matieres.join(', ')}`}
                  </p>
                  {c.notifEnvoye && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle size={10} /> Parents notifiés via WhatsApp
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!c.notifEnvoye && (
                    <button onClick={() => notifyComp(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer border border-green-200">
                      <Bell size={12} /> Notifier parents WhatsApp
                    </button>
                  )}
                  <button onClick={() => deleteComp(c.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer border border-red-200">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
