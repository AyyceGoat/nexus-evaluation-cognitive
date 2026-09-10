import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Search, Menu, X } from 'lucide-react';

// `knowledge.ts` (67 kB) et les données de l'omnisearch (~260 kB au total) restent
// hors du chunk d'entrée : la modale est chargée à l'ouverture, et le titre SEO des
// pages « knowledge » / « article » est affiné via un import dynamique.
const OmnisearchModal = lazy(() =>
  import('./components/search/OmnisearchModal').then((m) => ({ default: m.OmnisearchModal }))
);

const HomePage = lazy(() => import('./components/HomePage'));
const KnowledgeExplorer = lazy(() => import('./components/KnowledgeExplorer'));
const CountriesExplorer = lazy(() => import('./components/CountriesExplorer'));
const QuizSection = lazy(() => import('./components/QuizSection'));
const ArticleView = lazy(() => import('./components/ArticleView'));
const IQTestRunner = lazy(() => import('./components/iq/IQTestRunner').then(m => ({ default: m.IQTestRunner })));
const NexusAITutor = lazy(() => import('./components/ai/NexusAITutor').then(m => ({ default: m.NexusAITutor })));

export type Page = 
  | { type: 'home' }
  | { type: 'iq' }
  | { type: 'ai' }
  | { type: 'knowledge'; categoryId?: string }
  | { type: 'countries' }
  | { type: 'quiz' }
  | { type: 'article'; categoryId: string; sectionIndex: number; subIndex?: number };

function pageToPath(p: Page): string {
  switch (p.type) {
    case 'home':
      return '/';
    case 'iq':
      return '/iq';
    case 'ai':
      return '/ai';
    case 'knowledge':
      return p.categoryId ? `/knowledge/${p.categoryId}` : '/knowledge';
    case 'countries':
      return '/countries';
    case 'quiz':
      return '/quiz';
    case 'article':
      return p.subIndex !== undefined
        ? `/article/${p.categoryId}/${p.sectionIndex}/${p.subIndex}`
        : `/article/${p.categoryId}/${p.sectionIndex}`;
    default:
      return '/';
  }
}

function pathToPage(pathname: string): Page {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { type: 'home' };

  const [first, second, third, fourth] = parts;

  if (first === 'iq') {
    return { type: 'iq' };
  }
  if (first === 'ai') {
    return { type: 'ai' };
  }
  if (first === 'knowledge') {
    return { type: 'knowledge', categoryId: second };
  }
  if (first === 'countries') {
    return { type: 'countries' };
  }
  if (first === 'quiz') {
    return { type: 'quiz' };
  }
  if (first === 'article' && second && third !== undefined) {
    const sectionIndex = parseInt(third, 10);
    const subIndex = fourth !== undefined ? parseInt(fourth, 10) : undefined;
    if (!isNaN(sectionIndex)) {
      return {
        type: 'article',
        categoryId: second,
        sectionIndex,
        subIndex: subIndex !== undefined && !isNaN(subIndex) ? subIndex : undefined,
      };
    }
  }

  return { type: 'home' };
}

function LoadingFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-nexus-accent border-t-transparent animate-spin" />
        <p className="text-nexus-muted font-light text-xs sm:text-sm">Chargement de NEXUS...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => pathToPage(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Synchronisation avec l'historique du navigateur (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setPage(pathToPage(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Écouteur de raccourci global Ctrl+K / Cmd+K pour Omnisearch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mise à jour dynamique du titre et de la description meta pour le SEO
  useEffect(() => {
    let cancelled = false;

    const apply = (title: string, description: string) => {
      if (cancelled) return;
      document.title = title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    };

    switch (page.type) {
      case 'home':
        apply(
          "NEXUS — Savoir, Intelligence & Tests de QI",
          "Une encyclopédie interactive futuriste et banc d'évaluation psychométrique. Testez votre QI, découvrez les civilisations et dialoguez avec Nexus AI."
        );
        break;
      case 'iq':
        apply(
          'Évaluation des aptitudes cognitives — NEXUS',
          "Évaluez cinq aptitudes cognitives : matrices logiques, séries numériques, analogies verbales, rotation spatiale et mémoire de travail. Résultat assorti de sa marge d'erreur."
        );
        break;
      case 'ai':
        apply(
          "Nexus AI — Tuteur d'Apprentissage & Vulgarisation Intelligente",
          "Posez vos questions à Nexus AI. Vulgarisation (ELI5), fiches de synthèse express et analyses approfondies sur tous les domaines du savoir."
        );
        break;
      case 'countries':
        apply(
          "195 Pays du Monde — Encyclopédie Géographique NEXUS",
          "Explorez 195 pays avec drapeaux, capitales, dirigeants, populations, faits fascinants et cultures uniques."
        );
        break;
      case 'quiz':
        apply(
          "Quiz du Savoir & Culture Générale — NEXUS",
          "Testez vos connaissances avec nos quiz intelligents. 6 modes de jeu (Chronométré, Survie, Défi) sur 9 thématiques encyclopédiques."
        );
        break;
      case 'knowledge': {
        // Valeur immédiate, puis affinée si la catégorie est connue.
        apply(
          "Bibliothèque du Savoir & Knowledge Graph — NEXUS",
          "Explorez les empires africains, neurosciences, intelligence artificielle, physique quantique, religions et philosophie."
        );
        const { categoryId } = page;
        if (categoryId) {
          void import('./data/knowledge').then(({ knowledgeCategories }) => {
            const cat = knowledgeCategories.find((c) => c.id === categoryId);
            if (cat) {
              apply(
                `${cat.title} — Bibliothèque du Savoir NEXUS`,
                `${cat.description}. Découvrez tous nos articles dédiés à ${cat.title.toLowerCase()}.`
              );
            }
          });
        }
        break;
      }
      case 'article': {
        apply("Article — NEXUS", "Article complet sur la plateforme NEXUS.");
        const { categoryId, sectionIndex, subIndex } = page;
        void import('./data/knowledge').then(({ knowledgeCategories }) => {
          const cat = knowledgeCategories.find((c) => c.id === categoryId);
          const sec = cat?.sections[sectionIndex];
          const sub = subIndex !== undefined && sec?.subsections?.[subIndex] ? sec.subsections[subIndex] : null;
          const articleTitle = sub ? sub.title : sec ? sec.title : 'Article';
          const contentSnippet = (sub ? sub.content : sec ? sec.content : '')
            .substring(0, 155)
            .replace(/\n/g, ' ');
          apply(
            `${articleTitle} | ${cat ? cat.title : 'Savoir'} — NEXUS`,
            contentSnippet ? `${contentSnippet}...` : 'Article complet sur la plateforme NEXUS.'
          );
        });
        break;
      }
    }

    return () => {
      cancelled = true;
    };
  }, [page]);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setMenuOpen(false);
    const targetPath = pageToPath(p);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(p, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const navItems = useMemo(() => [
    { label: 'Accueil', icon: '◈', page: { type: 'home' as const } },
    { label: 'Aptitudes', icon: '🧠', isSpecial: true, page: { type: 'iq' as const } },
    { label: 'Nexus AI', icon: '✨', page: { type: 'ai' as const } },
    { label: 'Savoir', icon: '📚', page: { type: 'knowledge' as const, categoryId: undefined } },
    { label: 'Pays', icon: '🌍', page: { type: 'countries' as const } },
    { label: 'Quiz', icon: '🎮', page: { type: 'quiz' as const } },
  ], []);

  return (
    <div className="min-h-screen bg-nexus-bg bg-mesh text-nexus-text">
      {/* Omnisearch : monté à la première ouverture seulement, pour que ses données
          ne soient téléchargées que par les utilisateurs qui s'en servent. */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <OmnisearchModal
            isOpen
            onClose={() => setIsSearchOpen(false)}
            navigate={navigate}
          />
        </Suspense>
      )}

      {/* Navigation Principale */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-nexus-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <button onClick={() => navigate({ type: 'home' })} className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                N
              </div>
              <span className="font-display text-base sm:text-lg font-bold tracking-tight">
                <span className="text-gradient">NEXUS</span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">2.0</span>
              </span>
            </button>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = page.type === item.page.type;
                if (item.isSpecial) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.page as Page)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 ring-1 ring-amber-400'
                          : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.page as Page)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-nexus-accent/20 text-nexus-glow border border-nexus-accent/40'
                        : 'text-nexus-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions à Droite : Recherche & Menu Mobile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-xs text-nexus-muted hover:text-white transition-colors border border-nexus-border/50"
                title="Rechercher (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-nexus-accent" />
                <span className="hidden sm:inline">Recherche</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] font-mono">
                  Ctrl K
                </kbd>
              </button>

              {/* Bouton Menu Mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-nexus-muted hover:text-white transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Déroulant */}
        {menuOpen && (
          <div className="lg:hidden border-t border-nexus-border/50 bg-nexus-surface/95 backdrop-blur-xl animate-fadeIn">
            <div className="px-4 py-3 space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.page as Page)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    page.type === item.page.type
                      ? 'bg-nexus-accent/20 text-nexus-glow border border-nexus-accent/40'
                      : 'text-nexus-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Contenu Principal avec Suspense & ErrorBoundary */}
      <main className="pt-14 sm:pt-16">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {page.type === 'home' && <HomePage navigate={navigate} />}
            {page.type === 'iq' && <IQTestRunner />}
            {page.type === 'ai' && <NexusAITutor />}
            {page.type === 'knowledge' && <KnowledgeExplorer navigate={navigate} />}
            {page.type === 'countries' && <CountriesExplorer />}
            {page.type === 'quiz' && <QuizSection />}
            {page.type === 'article' && (
              <ArticleView
                categoryId={page.categoryId}
                sectionIndex={page.sectionIndex}
                subIndex={page.subIndex}
                navigate={navigate}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Pied de Page Futuriste */}
      <footer className="border-t border-nexus-border/30 mt-20 bg-nexus-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                N
              </div>
              <div>
                <p className="text-sm font-bold text-gradient">NEXUS 2.0</p>
                <p className="text-xs text-nexus-muted">Plateforme d'Intelligence, Savoir & Évaluation Cognitive</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-nexus-muted">
              <button onClick={() => navigate({ type: 'iq' })} className="hover:text-white transition-colors">Test de QI</button>
              <span>•</span>
              <button onClick={() => navigate({ type: 'ai' })} className="hover:text-white transition-colors">Nexus AI</button>
              <span>•</span>
              <button onClick={() => navigate({ type: 'knowledge' })} className="hover:text-white transition-colors">Bibliothèque</button>
              <span>•</span>
              <button onClick={() => navigate({ type: 'countries' })} className="hover:text-white transition-colors">195 Pays</button>
            </div>

            <p className="text-xs text-nexus-muted/70 font-light text-center sm:text-right">
              Conçu pour l'Afrique et le Monde — <span className="text-gradient-gold font-medium">L'Homme Ultime</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
