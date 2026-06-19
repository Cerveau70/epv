
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Navbar }           from './components/layout/Navbar.tsx';
import { Footer }           from './components/layout/Footer.tsx';
import { WhatsAppButton }   from './components/ui/WhatsAppButton.tsx';
import { MobileBottomNav }  from './components/ui/MobileBottomNav.tsx';
import { PublicLoader }          from './components/ui/PublicLoader.tsx';
import { ParentWelcomeLoader }   from './components/ui/ParentWelcomeLoader.tsx';
import { AdminWelcomeLoader }    from './components/ui/AdminWelcomeLoader.tsx';
import { AdminAuthPage } from './views/AdminAuthPage.tsx';
import { ParentAuthPage } from './views/ParentAuthPage.tsx';

// Public views
import { Home }               from './views/Home.tsx';
import { Programmes }         from './views/Programmes.tsx';
import { ProgrammesMaternelle } from './views/ProgrammesMaternelle.tsx';
import { ProgrammesPrimaire } from './views/ProgrammesPrimaire.tsx';
import { Admissions }         from './views/Admissions.tsx';
import { Ecole }              from './views/Ecole.tsx';
import { Contact }            from './views/Contact.tsx';
import { Blog }               from './views/Blog.tsx';
import { FAQ }                from './views/FAQ.tsx';
import { Tenues }            from './views/Tenues.tsx';
import { Visite }            from './views/Visite.tsx';

// Protected views (rendus SANS navbar/footer publics)
import { EspaceParent }   from './views/EspaceParent.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';

type ProtectedPhase = 'auth' | 'loading' | 'ready';

const PROTECTED_ROUTES = ['#/espace-parent', '#/admin'] as const;
type ProtectedRoute = typeof PROTECTED_ROUTES[number];

const isProtected = (hash: string): hash is ProtectedRoute =>
  (PROTECTED_ROUTES as readonly string[]).includes(hash);

export default function App() {
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#');

  /* Préchargement global joue à l'ouverture du site */
  const [showGlobalLoader, setShowGlobalLoader] = useState(true);

  /* Machine d'état pour les espaces protégés */
  const [protectedPhase,   setProtectedPhase]   = useState<ProtectedPhase>('auth');
  const [protectedSession, setProtectedSession] = useState<any>(null);

  /* Sync sur le hashchange natif (retour arrière navigateur, etc.) */
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash || '#';
      setCurrentHash(hash);
      if (isProtected(hash)) {
        // Si on atterrit sur une route protégée sans session → auth
        if (hash === '#/admin' || !localStorage.getItem('parent_session')) {
          setProtectedPhase('auth');
          setProtectedSession(null);
        }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /* ── Navigation ── */
  const handleNavigate = (newHash: string) => {
    if (isProtected(newHash)) {
      if (newHash === '#/espace-parent') {
        // Session existante → on passe directement au chargement
        const saved = localStorage.getItem('parent_session');
        if (saved) {
          setProtectedSession(JSON.parse(saved));
          setProtectedPhase('loading');
        } else {
          setProtectedPhase('auth');
          setProtectedSession(null);
        }
      } else {
        // Admin : toujours demander les identifiants
        setProtectedPhase('auth');
        setProtectedSession(null);
      }
    }
    window.location.hash = newHash;
    setCurrentHash(newHash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Callbacks de la machine d'état */
  const handleAuthSuccess = (session: any) => {
    setProtectedSession(session);
    setProtectedPhase('loading');
  };

  const handleBackToPublic = () => {
    setProtectedPhase('auth');
    setProtectedSession(null);
    window.location.hash = '#';
    setCurrentHash('#');
  };

  /* Gestionnaire commun pour les deux loaders */
  const handleLoaderComplete = () => {
    if (showGlobalLoader) {
      setShowGlobalLoader(false);
    } else {
      setProtectedPhase('ready');
    }
  };

  /* ── Rendu des vues publiques ── */
  const renderPublicView = () => {
    switch (currentHash) {
      case '#':
      case '':
        return <Home onNavigate={handleNavigate} />;
      case '#/programmes':
        return <Programmes />;
      case '#/programmes/maternelle':
        return <ProgrammesMaternelle />;
      case '#/programmes/primaire':
        return <ProgrammesPrimaire />;
      case '#/admissions':
        return <Admissions />;
      case '#/ecole':
        return <Ecole />;
      case '#/contact':
        return <Contact />;
      case '#/blog':
        return <Blog />;
      case '#/faq':
        return <FAQ />;
      case '#/tenues':
        return <Tenues />;
      case '#/visite':
        return <Visite />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const inProtectedRoute = isProtected(currentHash);

  return (
    <>
      {/* ═══ Site public ═══════════════════════════════════ */}
      {!inProtectedRoute && (
        <motion.div
          key="public-site"
          initial={{ opacity: 0 }}
          animate={{ opacity: showGlobalLoader ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen flex flex-col bg-slate-50 text-[#2C2C2C]
                     selection:bg-brand-gold selection:text-brand-blue-deep font-lora"
        >
          <Navbar currentHash={currentHash} onNavigate={handleNavigate} />
          <main className="flex-grow pt-22 relative z-10">
            {renderPublicView()}
          </main>
          <WhatsAppButton />
          {(currentHash === '#' || currentHash === '') && <Footer onNavigate={handleNavigate} />}
          {/* Bottom nav mobile toutes pages publiques */}
          <MobileBottomNav
            currentHash={currentHash}
            onNavigate={handleNavigate}
            isMenuOpen={false}
          />
        </motion.div>
      )}

      {/* ═══ Espaces protégés (sans navbar/footer publics) ═ */}
      {inProtectedRoute && (
        <AnimatePresence mode="wait">
          {protectedPhase === 'auth' && currentHash === '#/admin' && (
            <motion.div key="admin-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminAuthPage onSuccess={handleAuthSuccess} onBack={handleBackToPublic} />
            </motion.div>
          )}

          {protectedPhase === 'auth' && currentHash === '#/espace-parent' && (
            <motion.div key="parent-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ParentAuthPage onSuccess={handleAuthSuccess} onBack={handleBackToPublic} />
            </motion.div>
          )}

          {protectedPhase === 'ready' && (
            <motion.div
              key="protected-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="min-h-screen"
            >
              {currentHash === '#/espace-parent' && <EspaceParent />}
              {currentHash === '#/admin'         && <AdminDashboard />}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ═══ Loaders contextuels ════════════════════════════ */}
      <AnimatePresence>
        {showGlobalLoader && (
          <PublicLoader key="public-loader" onComplete={handleLoaderComplete} />
        )}
        {!showGlobalLoader && protectedPhase === 'loading' && currentHash === '#/admin' && (
          <AdminWelcomeLoader
            key="admin-welcome-loader"
            onComplete={handleLoaderComplete}
            name={protectedSession?.name || protectedSession?.email?.split('@')[0] || 'Administrateur'}
          />
        )}
        {!showGlobalLoader && protectedPhase === 'loading' && currentHash === '#/espace-parent' && (
          <ParentWelcomeLoader
            key="parent-welcome-loader"
            onComplete={handleLoaderComplete}
            name={protectedSession?.prenomParent || protectedSession?.name || ''}
          />
        )}
      </AnimatePresence>
    </>
  );
}
