/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../../lib/auth.ts';
import {
  BookOpen, Plus, Trash2, Send, Download, FileText,
  CheckCircle, Clock, AlertCircle, Users, BarChart2,
  ChevronDown, Save, Eye, Bell, FileSpreadsheet,
  Printer, GraduationCap, Star, RefreshCw
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Prospect { id: string; prenomEnfant: string; nomEnfant: string; }
interface NoteRow { matiere: string; t1?: number; t2?: number; t3?: number; coef: number; }
interface Bulletin {
  id: string; prospectId: string; prenomEnfant: string; nomEnfant: string;
  trimestre: string; moyenneGenerale: number; rang: number; effectifClasse: number;
  mention: string; notesDetail: any[]; publie: boolean; appreciation_generale?: string;
}
interface Composition {
  id: string; titre: string; section: string; trimestre: string;
  dateDebut: string; statut: string; matieres: string[]; notifEnvoye: boolean;
}

const SECTIONS = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2'];
const TRIMESTRES = ['T1','T2','T3'];
const SECTION_LABEL: Record<string,string> = {
  PS:'Petite Section', MS:'Moyenne Section', GS:'Grande Section',
  CP:'CP', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};
const MATIERES_PAR_CYCLE: Record<string,string[]> = {
  maternelle: ['Éveil','Langage','Anglais','Mathématiques','Arts plastiques','EPS','Vie collective'],
  primaire:   ['Français','Mathématiques','Anglais','Sciences','Histoire-Géo','Éducation civique','Arts plastiques','EPS'],
};

const mention_color = (m: string) => {
  if (m === 'Félicitations') return 'text-amber-600 bg-amber-50 border-amber-200';
  if (m === 'Très bien')     return 'text-blue-600 bg-blue-50 border-blue-200';
  if (m === 'Bien')          return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (m === 'Assez bien')    return 'text-sky-600 bg-sky-50 border-sky-200';
  return 'text-slate-500 bg-slate-50 border-slate-200';
};

function noteColor(n?: number) {
  if (n === undefined || n === null) return 'text-slate-400';
  if (n >= 16) return 'text-emerald-600 font-bold';
  if (n >= 12) return 'text-blue-600 font-semibold';
  if (n >= 10) return 'text-amber-600';
  return 'text-red-500';
}

// ─── Sous-onglets ─────────────────────────────────────────────────────────────

type SubTab = 'liste' | 'notes' | 'bulletins' | 'compositions';

const SUBTABS: { id: SubTab; label: string; Icon: any }[] = [
  { id: 'liste',        label: 'Liste de classe',   Icon: Users        },
  { id: 'notes',        label: 'Saisie des notes',  Icon: BookOpen     },
  { id: 'bulletins',    label: 'Bulletins',          Icon: FileText     },
  { id: 'compositions', label: 'Compositions',       Icon: Clock        },
];

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(rows: any[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

// ─── Impression PDF bulletin ──────────────────────────────────────────────────

function printBulletin(b: Bulletin, section: string) {
  const detail: any[] = b.notesDetail || [];
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Bulletin ${b.prenomEnfant} ${b.nomEnfant} — ${b.trimestre}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: 'Arial', sans-serif; color: #1e293b; font-size: 11pt; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0D2E5C; padding-bottom:10px; margin-bottom:16px; }
    .school { color:#0D2E5C; }
    .school h1 { margin:0; font-size:15pt; }
    .school p  { margin:2px 0; font-size:9pt; color:#475569; }
    .badge { background:#0D2E5C; color:white; padding:6px 14px; border-radius:8px; font-size:10pt; font-weight:bold; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; background:#F8FAFF; padding:10px; border-radius:8px; border:1px solid #e2e8f0; }
    .info-item label { font-size:8pt; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; display:block; }
    .info-item span { font-weight:700; color:#0D2E5C; font-size:10pt; }
    table { width:100%; border-collapse:collapse; margin-bottom:16px; }
    th { background:#0D2E5C; color:white; padding:7px 10px; text-align:left; font-size:9pt; }
    td { padding:6px 10px; border-bottom:1px solid #e2e8f0; font-size:10pt; }
    tr:nth-child(even) td { background:#F8FAFF; }
    .note { font-weight:700; }
    .good { color:#16a34a; } .ok { color:#2563eb; } .avg { color:#d97706; } .low { color:#dc2626; }
    .summary { display:flex; gap:12px; margin-bottom:16px; }
    .sum-card { flex:1; text-align:center; border:1px solid #e2e8f0; border-radius:10px; padding:10px; }
    .sum-card .val { font-size:22pt; font-weight:900; color:#0D2E5C; }
    .sum-card .lbl { font-size:8pt; color:#94a3b8; text-transform:uppercase; }
    .mention { display:inline-block; padding:5px 14px; border-radius:20px; font-weight:700; font-size:11pt; border:2px solid #F5A623; background:#FFF7ED; color:#c2410c; }
    .footer { margin-top:24px; border-top:1px solid #e2e8f0; padding-top:12px; font-size:8pt; color:#94a3b8; text-align:center; }
    .signature { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:30px; }
    .sig-box { border:1px solid #e2e8f0; border-radius:8px; padding:10px; min-height:60px; }
    .sig-box label { font-size:8pt; color:#94a3b8; display:block; margin-bottom:4px; }
  </style></head><body>
  <div class="header">
    <div class="school">
      <h1>EPV Horizons Savants</h1>
      <p>École Maternelle & Primaire d'Excellence · Abidjan</p>
      <p>Bingerville Mtn Kro, Côte d'Ivoire · contact@horizonssavants.com</p>
    </div>
    <div class="badge">BULLETIN SCOLAIRE</div>
  </div>
  <div class="info-grid">
    <div class="info-item"><label>Élève</label><span>${b.prenomEnfant} ${b.nomEnfant}</span></div>
    <div class="info-item"><label>Section</label><span>${SECTION_LABEL[section] || section}</span></div>
    <div class="info-item"><label>Trimestre</label><span>${b.trimestre} — Année 2026-2027</span></div>
    <div class="info-item"><label>Effectif classe</label><span>${b.effectifClasse} élèves</span></div>
  </div>
  <div class="summary">
    <div class="sum-card"><div class="val">${b.moyenneGenerale?.toFixed(2) ?? '—'}</div><div class="lbl">Moyenne / 20</div></div>
    <div class="sum-card"><div class="val">${b.rang ?? '—'}</div><div class="lbl">Classement</div></div>
    <div class="sum-card"><div class="val">${b.effectifClasse ?? '—'}</div><div class="lbl">Élèves</div></div>
    <div class="sum-card"><div class="val"><span class="mention">${b.mention || '—'}</span></div><div class="lbl">Mention</div></div>
  </div>
  <table>
    <thead><tr><th>Matière</th><th>Note / 20</th><th>Coeff.</th><th>Appréciation</th></tr></thead>
    <tbody>
      ${detail.map(n => {
        const cls = n.note >= 16 ? 'good' : n.note >= 12 ? 'ok' : n.note >= 10 ? 'avg' : 'low';
        return `<tr><td>${n.matiere}</td><td class="note ${cls}">${n.note?.toFixed(2) ?? '—'}</td><td>${n.coef}</td><td>${n.appreciation || ''}</td></tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="signature">
    <div class="sig-box"><label>Signature du parent / tuteur</label></div>
    <div class="sig-box"><label>Cachet & Signature de la Direction</label></div>
  </div>
  <div class="footer">EPV Horizons Savants · Abidjan 2026-2027 · Document officiel</div>
  </body></html>`;
  const w = window.open('', '_blank')!;
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function BulletinsTab({ onToast }: { onToast: (m: string) => void }) {
  const [sub, setSub]       = useState<SubTab>('liste');
  const [section, setSection]   = useState('CP');
  const [trimestre, setTrimestre] = useState('T1');
  const [loading, setLoading]   = useState(false);

  // Liste de classe
  const [classeData, setClasseData] = useState<{ prospects: Prospect[]; notes: Record<string, NoteRow[]> }>({ prospects: [], notes: {} });
  // Bulletins
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  // Compositions
  const [compositions, setCompositions] = useState<Composition[]>([]);
  // Saisie notes — édition locale
  const [notesEdit, setNotesEdit] = useState<Record<string, Record<string, number | undefined>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  // Nouvelle compo
  const [newComp, setNewComp] = useState({ titre: '', section: 'CP', trimestre: 'T1', dateDebut: '', matieres: [] as string[] });
  const [showNewComp, setShowNewComp] = useState(false);

  const matieres = ['PS','MS','GS'].includes(section) ? MATIERES_PAR_CYCLE.maternelle : MATIERES_PAR_CYCLE.primaire;

  // ── Chargements ───────────────────────────────────────────────────────────

  async function loadClasse() {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/notes/classe/${section}/${trimestre}`);
      const d = await r.json();
      setClasseData(d);
      // Init notesEdit depuis les notes existantes
      const init: Record<string, Record<string, number | undefined>> = {};
      for (const p of (d.prospects || [])) {
        init[p.id] = {};
        const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
        for (const mat of matieres) {
          const existing = (d.notes[p.id] || []).find((n: NoteRow) => n.matiere === mat);
          init[p.id][mat] = existing ? (existing as any)[noteField] : undefined;
        }
      }
      setNotesEdit(init);
    } finally { setLoading(false); }
  }

  async function loadBulletins() {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/bulletins/classe/${section}/${trimestre}`);
      const d = await r.json();
      setBulletins(d);
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
    if (sub === 'liste' || sub === 'notes') loadClasse();
    if (sub === 'bulletins') loadBulletins();
    if (sub === 'compositions') loadCompositions();
  }, [sub, section, trimestre]);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function saveNotes(prospectId: string) {
    setSaving(prospectId);
    const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
    const payload = matieres.map(mat => ({
      matiere: mat,
      [noteField]: notesEdit[prospectId]?.[mat] ?? null,
      coef: 1,
    }));
    await apiFetch(`/api/notes/eleve/${prospectId}`, { method: 'PUT', body: JSON.stringify({ notes: payload }) });
    setSaving(null);
    onToast('Notes sauvegardées ✓');
  }

  async function genererBulletins() {
    setLoading(true);
    try {
      const r = await apiFetch('/api/bulletins/generer', { method: 'POST', body: JSON.stringify({ section, trimestre }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      onToast(`${d.generated} bulletins générés ✓`);
      loadBulletins();
    } catch (e: any) { onToast('Erreur: ' + e.message); }
    finally { setLoading(false); }
  }

  async function publisherBulletin(id: string) {
    const r = await apiFetch(`/api/bulletins/${id}/publier`, { method: 'POST' });
    const d = await r.json();
    if (d.error) { onToast('Erreur: ' + d.error); return; }
    onToast('Bulletin publié + parent notifié via WhatsApp ✓');
    loadBulletins();
  }

  async function createComposition() {
    if (!newComp.titre || !newComp.dateDebut) { onToast('Titre et date obligatoires'); return; }
    await apiFetch('/api/compositions', { method: 'POST', body: JSON.stringify(newComp) });
    onToast('Composition créée ✓');
    setShowNewComp(false);
    setNewComp({ titre: '', section: 'CP', trimestre: 'T1', dateDebut: '', matieres: [] });
    loadCompositions();
  }

  async function notifyComposition(id: string) {
    const r = await apiFetch(`/api/compositions/${id}/notify`, { method: 'POST' });
    const d = await r.json();
    if (d.error) { onToast('Erreur: ' + d.error); return; }
    onToast(`${d.sent} parents notifiés via WhatsApp ✓`);
    loadCompositions();
  }

  async function deleteComposition(id: string) {
    if (!confirm('Supprimer cette composition ?')) return;
    await apiFetch(`/api/compositions/${id}`, { method: 'DELETE' });
    loadCompositions();
  }

  // ── Export Excel (CSV) ────────────────────────────────────────────────────

  function exportBulletinsCSV() {
    const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
    const header = ['Élève', 'Section', 'Trimestre', 'Moyenne', 'Rang', 'Effectif', 'Mention', ...matieres];
    const rows = bulletins.map(b => [
      `${b.prenomEnfant} ${b.nomEnfant}`,
      SECTION_LABEL[section] || section,
      b.trimestre,
      b.moyenneGenerale?.toFixed(2) ?? '',
      b.rang ?? '',
      b.effectifClasse ?? '',
      b.mention ?? '',
      ...matieres.map(mat => {
        const n = (b.notesDetail || []).find((x: any) => x.matiere === mat);
        return n ? n.note?.toFixed(2) ?? '' : '';
      }),
    ]);
    exportCSV([header, ...rows], `bulletins_${section}_${trimestre}.csv`);
    onToast('Export Excel téléchargé ✓');
  }

  function exportClasseCSV() {
    const noteField = trimestre === 'T1' ? 't1' : trimestre === 'T2' ? 't2' : 't3';
    const header = ['Élève', 'Section', ...matieres];
    const rows = classeData.prospects.map(p => [
      `${p.prenomEnfant} ${p.nomEnfant}`,
      section,
      ...matieres.map(mat => String(notesEdit[p.id]?.[mat] ?? '')),
    ]);
    exportCSV([header, ...rows], `notes_${section}_${trimestre}.csv`);
    onToast('Export Excel téléchargé ✓');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">

      {/* Sous-onglets */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {SUBTABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setSub(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sub === id ? 'bg-[#0D2E5C] text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Filtres section + trimestre (sauf compositions) */}
      {sub !== 'compositions' && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setSection(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  section === s ? 'bg-brand-gold text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>{s}</button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex gap-2">
            {TRIMESTRES.map(t => (
              <button key={t} onClick={() => setTrimestre(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trimestre === t ? 'bg-[#0D2E5C] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>{t}</button>
            ))}
          </div>
          <button onClick={() => { if (sub === 'notes') loadClasse(); else if (sub === 'bulletins') loadBulletins(); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-slate-400 text-sm">Chargement…</div>
      )}

      {/* ── LISTE DE CLASSE ─────────────────────────────────────────────── */}
      {!loading && sub === 'liste' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700">{SECTION_LABEL[section]} — {classeData.prospects.length} élèves inscrits</h3>
            <button onClick={exportClasseCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border border-emerald-200">
              <FileSpreadsheet size={13} /> Export Excel
            </button>
          </div>
          {classeData.prospects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun élève inscrit dans cette section.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[500px]">
                <thead><tr className="bg-[#0D2E5C] text-white">
                  <th className="text-left px-4 py-3 text-xs font-bold">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Élève</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Section</th>
                </tr></thead>
                <tbody>
                  {classeData.prospects.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 text-sm">{p.prenomEnfant} {p.nomEnfant}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">{section}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SAISIE DES NOTES ────────────────────────────────────────────── */}
      {!loading && sub === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700">
              Saisie — {SECTION_LABEL[section]} · {trimestre}
            </h3>
            <button onClick={exportClasseCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border border-emerald-200">
              <FileSpreadsheet size={13} /> Export Excel
            </button>
          </div>

          {classeData.prospects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun élève inscrit dans cette section.</div>
          ) : (
            <div className="space-y-4">
              {classeData.prospects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <span className="font-bold text-slate-700 text-sm">{p.prenomEnfant} {p.nomEnfant}</span>
                    <button onClick={() => saveNotes(p.id)} disabled={saving === p.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0D2E5C] text-white hover:bg-[#1A4F8B] cursor-pointer disabled:opacity-50">
                      {saving === p.id ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                      Sauvegarder
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {matieres.map(mat => (
                      <div key={mat}>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{mat}</label>
                        <input
                          type="number" min="0" max="20" step="0.25"
                          value={notesEdit[p.id]?.[mat] ?? ''}
                          onChange={e => setNotesEdit(prev => ({
                            ...prev,
                            [p.id]: { ...prev[p.id], [mat]: e.target.value === '' ? undefined : parseFloat(e.target.value) }
                          }))}
                          placeholder="—"
                          className={`w-full px-3 py-2 border rounded-lg text-sm font-bold text-center transition-colors
                            ${notesEdit[p.id]?.[mat] !== undefined ? noteColor(notesEdit[p.id]?.[mat]) : 'text-slate-300'}
                            border-slate-200 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BULLETINS ───────────────────────────────────────────────────── */}
      {!loading && sub === 'bulletins' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h3 className="font-bold text-slate-700">
              Bulletins — {SECTION_LABEL[section]} · {trimestre}
            </h3>
            <div className="flex gap-2">
              <button onClick={genererBulletins}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D2E5C] text-white hover:bg-[#1A4F8B] cursor-pointer shadow">
                <BarChart2 size={13} /> Générer les bulletins
              </button>
              {bulletins.length > 0 && (
                <button onClick={exportBulletinsCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border border-emerald-200">
                  <FileSpreadsheet size={13} /> Export Excel
                </button>
              )}
            </div>
          </div>

          {bulletins.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Aucun bulletin généré. Cliquez sur "Générer les bulletins" après avoir saisi les notes.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[700px]">
                <thead><tr className="bg-[#0D2E5C] text-white">
                  <th className="text-left px-4 py-3 text-xs font-bold">Rang</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Élève</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Moyenne</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Mention</th>
                  <th className="text-left px-4 py-3 text-xs font-bold">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-bold">Actions</th>
                </tr></thead>
                <tbody>
                  {bulletins.map((b, i) => (
                    <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3">
                        <span className="w-7 h-7 rounded-full bg-[#0D2E5C]/10 text-[#0D2E5C] text-xs font-bold flex items-center justify-center">
                          {b.rang ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 text-sm">{b.prenomEnfant} {b.nomEnfant}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${noteColor(b.moyenneGenerale)}`}>
                          {b.moyenneGenerale?.toFixed(2) ?? '—'} / 20
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${mention_color(b.mention)}`}>
                          {b.mention || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.publie
                          ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle size={12} /> Publié</span>
                          : <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold"><Clock size={12} /> En attente</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => printBulletin(b, section)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                            <Printer size={11} /> PDF
                          </button>
                          {!b.publie && (
                            <button onClick={() => publisherBulletin(b.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer border border-blue-200">
                              <Send size={11} /> Publier
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── COMPOSITIONS ────────────────────────────────────────────────── */}
      {!loading && sub === 'compositions' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Compositions planifiées</h3>
            <button onClick={() => setShowNewComp(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-gold text-white hover:brightness-105 cursor-pointer shadow">
              <Plus size={13} /> Nouvelle composition
            </button>
          </div>

          {/* Formulaire nouvelle compo */}
          <AnimatePresence>
            {showNewComp && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h4 className="font-bold text-slate-700 text-sm">Nouvelle composition</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Titre *</label>
                    <input value={newComp.titre} onChange={e => setNewComp(p => ({ ...p, titre: e.target.value }))}
                      placeholder="ex: Composition N°1 · T1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Section *</label>
                    <select value={newComp.section} onChange={e => setNewComp(p => ({ ...p, section: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold">
                      {SECTIONS.map(s => <option key={s} value={s}>{s} — {SECTION_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Trimestre *</label>
                    <select value={newComp.trimestre} onChange={e => setNewComp(p => ({ ...p, trimestre: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold">
                      {TRIMESTRES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date de début *</label>
                    <input type="date" value={newComp.dateDebut} onChange={e => setNewComp(p => ({ ...p, dateDebut: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Matières évaluées</label>
                  <div className="flex flex-wrap gap-2">
                    {(['PS','MS','GS'].includes(newComp.section) ? MATIERES_PAR_CYCLE.maternelle : MATIERES_PAR_CYCLE.primaire).map(mat => (
                      <button key={mat} type="button"
                        onClick={() => setNewComp(p => ({
                          ...p, matieres: p.matieres.includes(mat) ? p.matieres.filter(m => m !== mat) : [...p.matieres, mat]
                        }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                          newComp.matieres.includes(mat)
                            ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}>{mat}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={createComposition}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D2E5C] text-white cursor-pointer hover:bg-[#1A4F8B]">
                    Créer
                  </button>
                  <button onClick={() => setShowNewComp(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200">
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Liste des compositions */}
          <div className="space-y-3">
            {compositions.length === 0 && !showNewComp && (
              <div className="text-center py-12 text-slate-400 text-sm">Aucune composition planifiée.</div>
            )}
            {compositions.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-sm">{c.titre}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">{c.section}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{c.trimestre}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    📅 {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString('fr-FR') : '—'}
                    {c.matieres?.length > 0 && ` · ${c.matieres.join(', ')}`}
                  </p>
                  {c.notifEnvoye && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle size={10} /> Parents notifiés
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!c.notifEnvoye && (
                    <button onClick={() => notifyComposition(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer border border-green-200">
                      <Bell size={12} /> Notifier parents
                    </button>
                  )}
                  <button onClick={() => deleteComposition(c.id)}
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
