
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

const SECTIONS = ['PS','MS','GS','CP1','CP2','CE1','CE2','CM1','CM2'];
const TRIMESTRES = ['T1','T2','T3'];
const SECTION_LABEL: Record<string,string> = {
  PS:'Petite Section (PS)', MS:'Moyenne Section (MS)', GS:'Grande Section (GS)',
  CP1:'CP1 (CPI)', CP2:'CP2 (CPII)', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
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
function noteLabel(n?: any) {
  if (n === undefined || n === null || n === '') return '';
  return Number(n).toFixed(2);
}
function mentionClass(m: string) {
  if (m === 'Félicitations') return 'bg-amber-50 text-amber-700 border-amber-300';
  if (m === 'Très bien')     return 'bg-blue-50 text-blue-700 border-blue-300';
  if (m === 'Bien')          return 'bg-emerald-50 text-emerald-700 border-emerald-300';
  if (m === 'Assez bien')    return 'bg-sky-50 text-sky-600 border-sky-300';
  return 'bg-slate-50 text-slate-500 border-slate-300';
}
function fmtDate(d?: string) {
  if (!d) return '';
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

const LOGO_URL = () => `${window.location.origin}/img/logo.jpg`;

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

function openPrint(html: string) {
  const w = window.open('', '_blank')!;
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

const PDF_COMMON_CSS = `
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #1e293b; background: white; }
`;

const HEADER_HTML = (logo: string, badge: string, badgeSub: string) => `
  <div style="background:#0D2E5C;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:10px 10px 0 0">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="${logo}" alt="EPV" style="width:52px;height:52px;border-radius:8px;object-fit:cover;border:2px solid rgba(255,255,255,0.3)" />
      <div>
        <div style="color:white;font-size:15pt;font-weight:900;letter-spacing:-.3px">EPV Horizons Savants</div>
        <div style="color:rgba(255,255,255,0.7);font-size:8pt;margin-top:2px">École Maternelle & Primaire d'Excellence bilingue · Bingerville, Abidjan</div>
        <div style="color:rgba(255,255,255,0.55);font-size:7.5pt;margin-top:1px">Agrément MENA N° 2026/SAG · contact@horizonssavants.com · +225 07 78 98 14 56</div>
      </div>
    </div>
    <div style="text-align:center">
      <div style="background:#F5A623;color:#0D2E5C;font-size:10pt;font-weight:900;padding:8px 18px;border-radius:8px;letter-spacing:.5px">${badge}</div>
      ${badgeSub ? `<div style="color:rgba(255,255,255,0.6);font-size:8pt;margin-top:5px">${badgeSub}</div>` : ''}
    </div>
  </div>
`;

function printClasseList(eleves: Eleve[], section: string) {
  const logo = LOGO_URL();
  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  const rows = eleves.map((e, i) => `
    <tr style="background:${i%2===0?'#ffffff':'#F8FAFF'}">
      <td style="text-align:center;font-weight:700;color:#0D2E5C;width:30px">${String(i+1).padStart(2,'0')}</td>
      <td style="font-weight:800;color:#0D2E5C;font-size:9.5pt">${e.nomEnfant}</td>
      <td style="font-size:9pt">${e.prenomEnfant}</td>
      <td style="text-align:center;font-size:8.5pt;color:#334155">${fmtDate(e.dateNaissance)}</td>
      <td style="font-size:8.5pt;color:#334155">${e.commune || ''}</td>
      <td style="font-size:8.5pt">${e.nomParent} ${e.prenomParent}</td>
      <td style="text-align:center;font-size:8pt;color:#64748b">${e.lienParente || ''}</td>
      <td style="font-size:8.5pt;color:#334155">${e.telephone || ''}</td>
      <td style="text-align:center">
        <span style="background:${e.statut==='Inscrit'?'#dcfce7':'#fef9c3'};color:${e.statut==='Inscrit'?'#15803d':'#a16207'};padding:2px 8px;border-radius:20px;font-size:7.5pt;font-weight:700;border:1px solid ${e.statut==='Inscrit'?'#86efac':'#fde68a'}">${e.statut}</span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Liste de classe ${SECTION_LABEL[section]} 2026-2027</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    ${PDF_COMMON_CSS}
    table { width:100%; border-collapse:collapse; }
    th { background:#0D2E5C; color:white; padding:7px 10px; font-size:8pt; font-weight:700; text-align:left; border:1px solid #1A4F8B; }
    td { padding:6px 10px; border:1px solid #e2e8f0; font-size:9pt; vertical-align:middle; }
  </style></head><body style="padding:0">
  <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:10px">
    ${HEADER_HTML(logo, 'LISTE DE CLASSE', `Année scolaire 2026 / 2027`)}
    <div style="background:#EFF6FF;padding:10px 20px;display:flex;gap:30px;border-bottom:1px solid #e2e8f0">
      <div><span style="font-size:7.5pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Classe</span><br><strong style="color:#0D2E5C;font-size:10pt">${SECTION_LABEL[section]}</strong></div>
      <div><span style="font-size:7.5pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Effectif</span><br><strong style="color:#0D2E5C;font-size:10pt">${eleves.length} élève${eleves.length>1?'s':''}</strong></div>
      <div><span style="font-size:7.5pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Inscrits</span><br><strong style="color:#15803d;font-size:10pt">${eleves.filter(e=>e.statut==='Inscrit').length}</strong></div>
      <div style="margin-left:auto"><span style="font-size:7.5pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Imprimé le</span><br><strong style="color:#0D2E5C;font-size:9pt">${today}</strong></div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="width:32px;text-align:center">N°</th>
      <th>NOM</th><th>Prénom</th>
      <th style="text-align:center">Date de naissance</th>
      <th>Commune / Lieu de résidence</th>
      <th>Parent / Tuteur légal</th>
      <th style="text-align:center">Lien</th>
      <th>Téléphone</th>
      <th style="text-align:center">Statut</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${eleves.length===0?`<div style="text-align:center;padding:30px;color:#94a3b8;font-size:9pt">Aucun élève enregistré dans cette section.</div>`:''}
  <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:60px">
      <div style="font-size:7pt;color:#94a3b8;margin-bottom:6px;font-weight:700;text-transform:uppercase">Signature de l'enseignant(e)</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:60px">
      <div style="font-size:7pt;color:#94a3b8;margin-bottom:6px;font-weight:700;text-transform:uppercase">Signature du Directeur Académique</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:60px">
      <div style="font-size:7pt;color:#94a3b8;margin-bottom:6px;font-weight:700;text-transform:uppercase">Cachet officiel de l'école</div>
    </div>
  </div>
  <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:7pt;color:#94a3b8">
    <span>EPV Horizons Savants · Bingerville Abidjan · Document administratif officiel · Année 2026-2027</span>
    <span>Page 1 / 1</span>
  </div>
  </body></html>`;
  openPrint(html);
}

function printBulletinsClasse(bulletins: Bulletin[], section: string, trimestre: string) {
  const logo = LOGO_URL();
  const matieres = getMatieres(section);
  const moyClasse = bulletins.length ? (bulletins.reduce((s,b) => s+(Number(b.moyenneGenerale)||0),0)/bulletins.length).toFixed(2) : '';
  const meilleure = bulletins.length ? Math.max(...bulletins.map(b=>Number(b.moyenneGenerale)||0)).toFixed(2) : '';
  const tauxReussite = bulletins.length ? Math.round(bulletins.filter(b=>b.moyenneGenerale>=10).length/bulletins.length*100) : 0;

  const nc = (n: number) => n>=16?'#16a34a':n>=12?'#2563eb':n>=10?'#d97706':'#dc2626';
  const mentionBg = (m: string) => m==='Félicitations'?'#fef3c7':m==='Très bien'?'#dbeafe':m==='Bien'?'#dcfce7':'#f1f5f9';
  const mentionFg = (m: string) => m==='Félicitations'?'#92400e':m==='Très bien'?'#1e40af':m==='Bien'?'#14532d':'#475569';

  const rows = bulletins.map((b,i) => {
    const noteCells = matieres.map(mat => {
      const n = (b.notesDetail||[]).find((x:any) => x.matiere===mat);
      return `<td style="text-align:center;font-weight:700;color:${n?.note!=null?nc(Number(n.note)):'#94a3b8'};font-size:8.5pt">${n?.note!=null?Number(n.note).toFixed(2):''}</td>`;
    }).join('');
    return `<tr style="background:${i%2===0?'#ffffff':'#F8FAFF'}">
      <td style="text-align:center;font-weight:900;color:${b.rang<=3?'#d97706':'#0D2E5C'};font-size:10pt">${b.rang??''}</td>
      <td style="font-weight:800;color:#0D2E5C;font-size:9.5pt">${b.nomEnfant}</td>
      <td style="font-size:9pt">${b.prenomEnfant}</td>
      ${noteCells}
      <td style="text-align:center;font-weight:900;font-size:11pt;color:${nc(b.moyenneGenerale)}">${b.moyenneGenerale!=null?Number(b.moyenneGenerale).toFixed(2):''}</td>
      <td style="text-align:center"><span style="background:${mentionBg(b.mention)};color:${mentionFg(b.mention)};padding:3px 8px;border-radius:12px;font-size:7.5pt;font-weight:700">${b.mention||''}</span></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Tableau des Notes ${section} ${trimestre} 2026-2027</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    ${PDF_COMMON_CSS}
    table { width:100%; border-collapse:collapse; }
    th { background:#0D2E5C; color:white; padding:7px 8px; font-size:8pt; font-weight:700; text-align:left; border:1px solid #1A4F8B; }
    td { padding:5px 8px; border:1px solid #e2e8f0; vertical-align:middle; }
  </style></head><body>
  <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:10px">
    ${HEADER_HTML(logo, 'TABLEAU DES NOTES', `${trimestre} · 2026-2027`)}
    <div style="background:#EFF6FF;padding:10px 20px;display:flex;gap:24px;border-bottom:1px solid #e2e8f0;flex-wrap:wrap">
      ${[
        ['Classe', SECTION_LABEL[section], '#0D2E5C'],
        ['Trimestre', trimestre, '#0D2E5C'],
        ['Effectif', `${bulletins.length} élèves`, '#0D2E5C'],
        ['Moy. de classe', `${moyClasse} /20`, '#2563eb'],
        ['Meilleure moy.', `${meilleure} /20`, '#16a34a'],
        ['Taux réussite', `${tauxReussite} %`, '#2563eb'],
        ['Félicitations', `${bulletins.filter(b=>b.mention==='Félicitations').length}`, '#d97706'],
      ].map(([l,v,c]) => `<div><span style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.04em;display:block">${l}</span><strong style="color:${c};font-size:10.5pt">${v}</strong></div>`).join('')}
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="width:36px;text-align:center">Rang</th>
      <th style="width:130px">NOM</th>
      <th style="width:110px">Prénom</th>
      ${matieres.map(m=>`<th style="text-align:center;font-size:7.5pt">${m}</th>`).join('')}
      <th style="text-align:center;width:50px">MOY.</th>
      <th style="width:90px;text-align:center">Mention</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:55px">
      <div style="font-size:7pt;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:4px">Signature de l'enseignant(e)</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:55px">
      <div style="font-size:7pt;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:4px">Cachet & Signature de la Direction</div>
    </div>
  </div>
  <div style="margin-top:10px;display:flex;justify-content:space-between;font-size:7pt;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px">
    <span>EPV Horizons Savants · Document officiel · Année 2026-2027</span>
    <span>${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
  </div>
  </body></html>`;
  openPrint(html);
}

function printBulletinIndividuel(b: Bulletin, eleve?: Eleve) {
  const logo = LOGO_URL();
  const detail: any[] = b.notesDetail || [];
  const nc = (n: number) => n>=16?'#16a34a':n>=12?'#2563eb':n>=10?'#d97706':'#dc2626';
  const mentionBg = b.mention==='Félicitations'?'#FEF3C7':b.mention==='Très bien'?'#DBEAFE':b.mention==='Bien'?'#DCFCE7':'#F1F5F9';
  const mentionFg = b.mention==='Félicitations'?'#92400E':b.mention==='Très bien'?'#1E40AF':b.mention==='Bien'?'#14532D':'#475569';

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Bulletin ${b.prenomEnfant} ${b.nomEnfant} ${b.trimestre}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Arial','Helvetica',sans-serif; color:#1e293b; background:white; }
    .wrap { padding:12mm; }
    table { width:100%; border-collapse:collapse; }
    th { background:#0D2E5C; color:white; padding:8px 10px; font-size:8.5pt; font-weight:700; text-align:left; }
    td { padding:7px 10px; border-bottom:1px solid #e2e8f0; font-size:9.5pt; vertical-align:middle; }
    tr:nth-child(even) td { background:#F8FAFF; }
  </style></head><body>
  <!-- BANDEAU HAUT -->
  <div style="background:#0D2E5C;padding:14px 16mm;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="${logo}" alt="EPV" style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:2px solid rgba(255,255,255,0.3)"/>
      <div>
        <div style="color:white;font-size:14pt;font-weight:900">EPV Horizons Savants</div>
        <div style="color:rgba(255,255,255,0.7);font-size:8pt;margin-top:2px">École Maternelle & Primaire d'Excellence bilingue · Abidjan</div>
        <div style="color:rgba(255,255,255,0.5);font-size:7.5pt;margin-top:1px">Agrément MENA N° 2026/SAG · contact@horizonssavants.com</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="background:#F5A623;color:#0D2E5C;font-size:11pt;font-weight:900;padding:7px 16px;border-radius:8px">BULLETIN SCOLAIRE</div>
      <div style="color:rgba(255,255,255,0.7);font-size:9pt;margin-top:5px;font-weight:700">${b.trimestre} Année 2026 / 2027</div>
    </div>
  </div>

  <!-- BANDE BLEUE INFOS ÉLÈVE -->
  <div style="background:#EFF6FF;border-bottom:2px solid #BFDBFE;padding:10px 16mm;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px">
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Nom & Prénom de l'élève</div>
      <div style="font-size:13pt;font-weight:900;color:#0D2E5C">${b.nomEnfant} ${b.prenomEnfant}</div>
    </div>
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Classe</div>
      <div style="font-size:10pt;font-weight:700;color:#0D2E5C">${SECTION_LABEL[eleve?.sectionVisee||'']||''}</div>
    </div>
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Date de naissance</div>
      <div style="font-size:9.5pt;font-weight:700;color:#0D2E5C">${eleve?fmtDate(eleve.dateNaissance):''}</div>
    </div>
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Effectif classe</div>
      <div style="font-size:10pt;font-weight:700;color:#0D2E5C">${b.effectifClasse??''} élèves</div>
    </div>
  </div>
  ${eleve?`
  <div style="background:#F8FAFF;border-bottom:1px solid #e2e8f0;padding:8px 16mm;display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px">
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:1px">Parent / Tuteur légal</div>
      <div style="font-size:9.5pt;font-weight:700;color:#334155">${eleve.prenomParent} ${eleve.nomParent} <span style="color:#94a3b8;font-weight:400">(${eleve.lienParente||''})</span></div>
    </div>
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:1px">Commune</div>
      <div style="font-size:9.5pt;font-weight:700;color:#334155">${eleve.commune||''}</div>
    </div>
    <div>
      <div style="font-size:7pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:1px">Téléphone</div>
      <div style="font-size:9.5pt;font-weight:700;color:#334155">${eleve.telephone||''}</div>
    </div>
  </div>`:''}

  <div class="wrap">
    <!-- STATS GLOBALES -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:10px;margin-bottom:16px">
      <div style="border:2px solid ${noteColor(b.moyenneGenerale)};border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:26pt;font-weight:900;color:${nc(b.moyenneGenerale)};line-height:1">${b.moyenneGenerale!=null?Number(b.moyenneGenerale).toFixed(2):''}</div>
        <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Moyenne / 20</div>
      </div>
      <div style="border:2px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:26pt;font-weight:900;color:#0D2E5C;line-height:1">${b.rang??''}</div>
        <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Rang / ${b.effectifClasse??'?'}</div>
      </div>
      <div style="border:2px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:26pt;font-weight:900;color:#0D2E5C;line-height:1">${b.effectifClasse??''}</div>
        <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-top:4px">Effectif</div>
      </div>
      <div style="border:2px solid ${mentionBg};border-radius:10px;padding:12px;background:${mentionBg};display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:7.5pt;color:#64748b;text-transform:uppercase;margin-bottom:6px">Mention obtenue</div>
        <div style="font-size:16pt;font-weight:900;color:${mentionFg}">${b.mention||''}</div>
      </div>
    </div>

    <!-- TABLEAU DES NOTES -->
    <table style="margin-bottom:16px">
      <thead><tr>
        <th style="width:32%">Matière</th>
        <th style="width:18%;text-align:center">Note / 20</th>
        <th style="width:12%;text-align:center">Coeff.</th>
        <th>Appréciation du professeur</th>
      </tr></thead>
      <tbody>
        ${detail.map((n,i) => `
          <tr style="background:${i%2===0?'white':'#F8FAFF'}">
            <td style="font-weight:700;font-size:9.5pt">${n.matiere}</td>
            <td style="text-align:center;font-size:11pt;font-weight:900;color:${nc(n.note)}">${n.note!=null?Number(n.note).toFixed(2):''}</td>
            <td style="text-align:center;color:#64748b">${n.coef}</td>
            <td style="color:#475569;font-style:italic;font-size:9pt">${n.appreciation||''}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <!-- SIGNATURES -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:70px">
        <div style="font-size:7.5pt;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:4px">Signature & observations du parent / tuteur légal</div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:70px">
        <div style="font-size:7.5pt;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:4px">Cachet & Signature de la Direction</div>
      </div>
    </div>

    <!-- PIED DE PAGE -->
    <div style="margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:7.5pt;color:#94a3b8">
      <span>EPV Horizons Savants · Bingerville, Abidjan · Document officiel 2026-2027</span>
      <span>Imprimé le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
    </div>
  </div>
  </body></html>`;
  openPrint(html);
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

export function BulletinsTab({ onToast, onSelectEleve }: { onToast: (m: string) => void; onSelectEleve?: (id: string) => void }) {
  const [sub,       setSub]       = useState<SubTab>('liste');
  const [section,   setSection]   = useState('CP1');
  const [trimestre, setTrimestre] = useState('T1');
  const [loading,   setLoading]   = useState(false);

  const [eleves,      setEleves]      = useState<Eleve[]>([]);
  const [classeData,  setClasseData]  = useState<{ prospects: Eleve[]; notes: Record<string,NoteRow[]> }>({ prospects:[], notes:{} });
  const [bulletins,   setBulletins]   = useState<Bulletin[]>([]);
  const [compositions,setCompositions]= useState<Composition[]>([]);
  const [notesEdit,   setNotesEdit]   = useState<Record<string,Record<string,number|undefined>>>({});
  const [saving,      setSaving]      = useState<string|null>(null);
  const [showNewComp, setShowNewComp] = useState(false);
  const [newComp,     setNewComp]     = useState({ titre:'', section:'CP1', trimestre:'T1', dateDebut:'', matieres:[] as string[] });
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
    setNewComp({ titre:'', section:'CP1', trimestre:'T1', dateDebut:'', matieres:[] });
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
      b.moyenneGenerale!=null?Number(b.moyenneGenerale).toFixed(2):'', b.mention,
      ...matieres.map(mat => {
        const n = (b.notesDetail||[]).find((x:any) => x.matiere===mat);
        return n ? n.note!=null?Number(n.note).toFixed(2):'' : '';
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
                      <tr key={e.id}
                        onClick={() => onSelectEleve?.(e.id)}
                        className={`hover:bg-blue-50/40 transition-colors ${onSelectEleve ? 'cursor-pointer' : ''} ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-xs font-bold text-slate-400 text-center">{String(i+1).padStart(2,'0')}</td>
                        <td className="px-4 py-3 font-bold text-[#0D2E5C] text-sm flex items-center gap-1.5">
                          {e.nomEnfant}
                          {onSelectEleve && <Eye size={11} className="text-slate-300" />}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{e.prenomEnfant}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{fmtDate(e.dateNaissance)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.commune || ''}</td>
                        <td className="px-4 py-3 text-xs text-slate-700 font-medium">{e.prenomParent} {e.nomParent}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{e.lienParente || ''}</td>
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
                          <button onClick={() => onSelectEleve?.(p.id)}
                            className={`text-left group ${onSelectEleve ? 'cursor-pointer' : ''}`}>
                            <div className="font-bold text-[#0D2E5C] text-sm flex items-center gap-1.5">
                              {p.nomEnfant} {p.prenomEnfant}
                              {onSelectEleve && <Eye size={10} className="text-slate-300 group-hover:text-[#0D2E5C] transition-colors" />}
                            </div>
                            <div className="text-[10px] text-slate-400">{fmtDate(p.dateNaissance)}</div>
                          </button>
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
                              placeholder=""
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
                  { label: 'Moy. de classe', val: (bulletins.reduce((s,b)=>s+(Number(b.moyenneGenerale)||0),0)/bulletins.length).toFixed(2)+' /20', color: 'text-blue-600' },
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
                      <tr key={b.id}
                        className={`hover:bg-blue-50/30 transition-colors ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-center">
                          {b.rang && b.rang <= 3 ? (
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mx-auto ${
                              b.rang===1?'bg-amber-100 text-amber-700':b.rang===2?'bg-slate-200 text-slate-700':'bg-orange-100 text-orange-700'
                            }`}>{b.rang}</span>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold">{b.rang ?? ''}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => onSelectEleve?.(b.prospectId)}
                            className={`font-bold text-[#0D2E5C] text-sm flex items-center gap-1.5 group ${onSelectEleve ? 'cursor-pointer hover:underline' : ''}`}>
                            {b.nomEnfant}
                            {onSelectEleve && <Eye size={10} className="text-slate-300 group-hover:text-[#0D2E5C] transition-colors" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.prenomEnfant}</td>
                        {matieres.map(mat => {
                          const n = (b.notesDetail||[]).find((x:any) => x.matiere===mat);
                          return (
                            <td key={mat} className="px-2 py-3 text-center">
                              <span className="text-xs font-bold" style={{ color: noteColor(n?.note) }}>
                                {n ? noteLabel(n.note) : ''}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-black" style={{ color: noteColor(b.moyenneGenerale) }}>
                            {b.moyenneGenerale!=null?Number(b.moyenneGenerale).toFixed(2):''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${mentionClass(b.mention)}`}>
                            {b.mention || ''}
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
                      placeholder="ex: Composition N°1 Trimestre 1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Section *</label>
                    <select value={newComp.section} onChange={e => setNewComp(p=>({...p,section:e.target.value}))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold">
                      {SECTIONS.map(s => <option key={s} value={s}>{s} {SECTION_LABEL[s]}</option>)}
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
                    📅 {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'}) : ''}
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
