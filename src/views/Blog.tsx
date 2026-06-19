
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { BookOpen, Calendar, Clock, Share2, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

/* ─── Animation variants ──────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Tag → badge color map ───────────────────────────────────── */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Pédagogie active': { bg: 'bg-brand-green/15', text: 'text-brand-green' },
  'Sciences (STEM)':  { bg: 'bg-brand-blue-light/15', text: 'text-brand-blue-medium' },
  'Vie de l\'école':  { bg: 'bg-brand-gold/15', text: 'text-brand-blue-deep' },
  'Notre Vision':     { bg: 'bg-brand-gold/15', text: 'text-brand-blue-deep' },
  'Charte Éthique':   { bg: 'bg-brand-green/15', text: 'text-brand-green' },
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? { bg: 'bg-brand-blue-deep/10', text: 'text-brand-blue-deep' };
}

/* ─── Author avatar ───────────────────────────────────────────── */
function AuthorAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[10px]';
  return (
    <span
      className={`${dim} rounded-full bg-brand-blue-deep text-white font-bold font-sans flex items-center justify-center shrink-0 select-none`}
    >
      {initials}
    </span>
  );
}

export const Blog: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const ALL = fr ? 'Tous' : 'All';

  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [activeFilter, setActiveFilter]   = useState<string>('__all__');

  const isAll = activeFilter === '__all__';
  const [cmsArticles,   setCmsArticles]   = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/articles?statut=publié')
      .then(r => r.json())
      .then(data => setCmsArticles(Array.isArray(data) ? data : []))
      .catch(() => setCmsArticles([]));
  }, []);

  // Articles à publier via l'interface admin (onglet Blog du tableau de bord)
  const articles: any[] = [];

  const [shareCopied, setShareCopied] = React.useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }).catch(() => {
        const el = document.createElement('input');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      });
    }
  };

  /* ─── Derived data ──────────────────────────────────────────── */
  const allTags = ['__all__', ...Array.from(new Set(articles.map((a) => a.tag)))];

  const filtered = isAll ? articles : articles.filter((a) => a.tag === activeFilter);

  const [featured, ...rest] = filtered;

  /* ─── Render ────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-[#F4F8FF] to-white select-none">

      {/* ── Decorative blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(74,144,217,0.22) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-14">

        {/* ════════════════════════════════════════
            HEADER
        ════════════════════════════════════════ */}
        <motion.div
          className="text-left max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight uppercase leading-tight">
            Le Blog{' '}
            <span className="text-brand-gold">d'EPV</span>{' '}
            Horizons Savants
          </h1>

          <p className="mt-4 text-xs md:text-sm text-brand-muted font-serif leading-relaxed max-w-xl">
            {fr
              ? "Astuces parentales, insights d'apprentissage bilingue et actualités d'orientation d'Abidjan écrits par nos experts-éducateurs émérites."
              : "Parenting tips, bilingual learning insights and guidance news from Abidjan written by our distinguished educator-experts."}
          </p>

          {/* Gold underline */}
          <div className="mt-5 flex justify-center">
            <div className="h-1 w-16 bg-brand-gold rounded-full" />
          </div>
        </motion.div>

        {/* ════════════════════════════════════════
            ACTUALITÉS CMS (articles publiés via admin)
        ════════════════════════════════════════ */}
        {cmsArticles.length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-brand-border/40" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-gold">{fr ? 'Dernières actualités' : 'Latest News'}</span>
              <div className="h-px flex-1 bg-brand-border/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cmsArticles.map((a: any) => (
                <div key={a.id} className="bg-white rounded-xl border border-brand-border/40 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-blue-deep/8 text-brand-blue-deep px-2 py-0.5 rounded-full">{a.cat}</span>
                    <span className="text-[10px] text-brand-muted ml-auto">{new Date(a.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug">{a.titre}</h3>
                  <p className="text-[11px] text-brand-muted font-serif mt-1.5">Par {a.auteur} · {a.vues || 0} vues</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            ÉTAT VIDE aucun article publié
        ════════════════════════════════════════ */}
        {articles.length === 0 && cmsArticles.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 px-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Icône */}
            <div className="w-20 h-20 rounded-3xl bg-[#0D2E5C]/6 flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0D2E5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            {/* Trait doré */}
            <div className="w-10 h-0.5 bg-brand-gold rounded-full mb-5" />
            <h2 className="font-sans font-extrabold text-xl text-[#0D2E5C] mb-2">
              {fr ? 'Articles bientôt disponibles' : 'Articles coming soon'}
            </h2>
            <p className="font-serif text-sm text-[#6B7280] max-w-sm leading-relaxed">
              {fr
                ? "Notre équipe rédige actuellement des articles sur la pédagogie bilingue, la vie scolaire et les conseils parentaux. Revenez très bientôt."
                : "Our team is currently writing articles on bilingual pedagogy, school life and parenting tips. Check back very soon."}
            </p>
            <div className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D2E5C]/6 border border-[#0D2E5C]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-[#0D2E5C]/60">
                {fr ? 'Publication prévue prochainement' : 'Publication coming soon'}
              </span>
            </div>
          </motion.div>
        ) : (
        <>
        {/* ════════════════════════════════════════
            CATEGORY FILTER BAR
        ════════════════════════════════════════ */}
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {allTags.map((tag) => {
            const active = activeFilter === tag;
            const displayLabel = tag === '__all__' ? ALL : tag;
            const { bg, text } = tagColor(tag === '__all__' ? '' : tag);
            return (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={[
                  'px-4 py-1.5 rounded-full text-[11px] font-bold font-sans uppercase tracking-wide border transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-brand-blue-deep text-white border-brand-blue-deep shadow-md scale-105'
                    : `${bg} ${text} border-transparent hover:border-brand-blue-deep/20 hover:scale-105`,
                ].join(' ')}
              >
                {displayLabel}
              </button>
            );
          })}
        </motion.div>

        {/* ════════════════════════════════════════
            MAGAZINE GRID
        ════════════════════════════════════════ */}
        {filtered.length === 0 ? (
          <p className="text-center text-brand-muted font-serif py-16">
            {fr ? "Aucun article dans cette catégorie." : "No articles in this category."}
          </p>
        ) : (
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >

            {/* ── FEATURED CARD (col-span-2) ── */}
            {featured && (
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2"
              >
                <article
                  onClick={() => setActiveArticle(featured)}
                  className="group relative rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.12)] overflow-hidden cursor-pointer h-full min-h-[420px] md:min-h-[480px]"
                >
                  {/* Full-bleed image */}
                  <img
                    src={featured.img}
                    alt={featured.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E5C]/90 via-[#0D2E5C]/40 to-transparent" />

                  {/* Tag badge */}
                  <div className="absolute top-5 left-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-sans uppercase tracking-wide ${tagColor(featured.tag).bg} ${tagColor(featured.tag).text} backdrop-blur-sm`}>
                      {featured.tag}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
                    <div className="flex items-center gap-4 text-white/70 text-[10px] font-sans font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-brand-gold" />
                        {featured.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {featured.readTime}
                      </span>
                    </div>

                    <h2 className="font-serif font-bold text-xl md:text-3xl text-white leading-tight drop-shadow-lg">
                      {featured.title}
                    </h2>

                    <p className="text-white/75 text-xs md:text-sm font-serif leading-relaxed line-clamp-2">
                      {featured.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <AuthorAvatar name={featured.author} size="sm" />
                        <span className="text-white/80 text-[11px] font-sans font-semibold">
                          {featured.author}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-brand-gold text-[11px] font-bold font-sans group-hover:gap-2 transition-all">
                        {fr ? "Lire l'article" : 'Read article'} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </motion.div>
            )}

            {/* ── SECONDARY CARDS (right column) ── */}
            <motion.div variants={containerVariants} className="flex flex-col gap-6">
              {rest.slice(0, 2).map((article) => {
                const { bg, text } = tagColor(article.tag);
                return (
                  <motion.div key={article.id} variants={itemVariants} className="flex-1">
                    <article
                      onClick={() => setActiveArticle(article)}
                      className="group rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden cursor-pointer h-full flex flex-col"
                    >
                      {/* Image 16/9 */}
                      <div className="relative aspect-video w-full overflow-hidden shrink-0">
                        <img
                          src={article.img}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${bg} ${text}`}>
                          {article.tag}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3 text-[10px] text-brand-muted font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} className="text-brand-gold" />
                              {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug group-hover:text-brand-gold transition-colors duration-200">
                            {article.title}
                          </h3>
                          <p className="text-[11px] text-brand-muted font-serif leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                          <div className="flex items-center gap-1.5">
                            <AuthorAvatar name={article.author} size="sm" />
                            <span className="text-[10px] text-brand-dark/80 font-sans font-semibold truncate max-w-[120px]">
                              {article.author}
                            </span>
                          </div>
                          <span className="flex items-center gap-0.5 text-brand-blue-deep group-hover:text-brand-gold text-[10px] font-bold font-sans transition-colors">
                            {fr ? 'Lire' : 'Read'} <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── BOTTOM ROW · remaining articles ── */}
            {rest.slice(2).map((article) => {
              const { bg, text } = tagColor(article.tag);
              return (
                <motion.div key={article.id} variants={itemVariants}>
                  <article
                    onClick={() => setActiveArticle(article)}
                    className="group rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-video w-full overflow-hidden shrink-0">
                      <img
                        src={article.img}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${bg} ${text}`}>
                        {article.tag}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 text-[10px] text-brand-muted font-sans">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} className="text-brand-gold" />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug group-hover:text-brand-gold transition-colors duration-200">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-brand-muted font-serif leading-relaxed line-clamp-2">
                          {article.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                        <div className="flex items-center gap-1.5">
                          <AuthorAvatar name={article.author} size="sm" />
                          <span className="text-[10px] text-brand-dark/80 font-sans font-semibold truncate max-w-[140px]">
                            {article.author}
                          </span>
                        </div>
                        <span className="flex items-center gap-0.5 text-brand-blue-deep group-hover:text-brand-gold text-[10px] font-bold font-sans transition-colors">
                          {fr ? 'Lire' : 'Read'} <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                </motion.div>
              );
            })}

          </motion.div>
        )}

        {/* ════════════════════════════════════════
            ARTICLE MODAL
        ════════════════════════════════════════ */}
        {activeArticle && (
          <Modal
            isOpen={!!activeArticle}
            onClose={() => setActiveArticle(null)}
            title={activeArticle.title}
          >
            {/* Modal inner · scrollable body */}
            <div className="flex flex-col gap-5 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar">

              {/* Hero image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={activeArticle.img}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E5C]/60 to-transparent" />
                {/* tag */}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${tagColor(activeArticle.tag).bg} ${tagColor(activeArticle.tag).text} backdrop-blur-sm`}>
                  {activeArticle.tag}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted font-sans font-semibold pb-3 border-b border-brand-border/40">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-gold" />
                  {activeArticle.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-blue-medium" />
                  {activeArticle.readTime} {fr ? 'de lecture' : 'read'}
                </span>
                <span className="flex items-center gap-2 ml-auto">
                  <AuthorAvatar name={activeArticle.author} size="sm" />
                  <strong className="text-brand-dark">{activeArticle.author}</strong>
                </span>
              </div>

              {/* Article content */}
              {activeArticle.content}

              {/* Footer */}
              <div className="shrink-0 border-t border-brand-border/40 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[10px] text-brand-muted italic font-serif leading-relaxed">
                  {fr ? "EPV Horizons Savants d'Abidjan · Éveil culturel & bilingue" : 'EPV Horizons Savants · Cultural & Bilingual Awakening'}
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-[10px] flex items-center gap-1"
                    onClick={handleShare}
                  >
                    <Share2 size={11} />
                    {shareCopied ? (fr ? 'Lien copié !' : 'Copied!') : (fr ? 'Partager' : 'Share')}
                  </Button>
                  <Button
                    variant="primary"
                    className="px-5 py-1.5 text-[10px]"
                    onClick={() => setActiveArticle(null)}
                  >
                    {fr ? 'Fermer' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        </>
        )}

      </div>
    </div>
  );
};
