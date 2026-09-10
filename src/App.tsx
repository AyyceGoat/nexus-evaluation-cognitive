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
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-mesure border-t-transparent animate-spin" />
        <p className="text-brume font-light text-xs sm:text-sm">Chargement de NEXUS...</p>
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

  // Plus d'emoji comme icône structurelle : un emoji change de dessin à chaque
  // système d'exploitation, on ne construit pas une identité dessus (DESIGN.md §11).
  const navItems = useMemo(
    () => [
      { label: 'Accueil', page: { type: 'home' as const } },
      { label: 'Évaluation', page: { type: 'iq' as const }, principal: true },
      { label: 'Savoir', page: { type: 'knowledge' as const, categoryId: undefined } },
      { label: 'Pays', page: { type: 'countries' as const } },
      { label: 'Quiz', page: { type: 'quiz' as const } },
      { label: 'Nexus AI', page: { type: 'ai' as const } },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-noir text-craie">
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

      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-1 focus:bg-mesure focus:px-4 focus:py-2 focus:text-petit focus:text-noir"
      >
        Aller au contenu
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-ardoise bg-noir/95">
        <nav aria-label="Navigation principale" className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate({ type: 'home' })}
              className="font-titre text-t3 tracking-tight text-craie"
            >
              NEXUS
            </button>

            <ul className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const actif = page.type === item.page.type;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => navigate(item.page as Page)}
                      aria-current={actif ? 'page' : undefined}
                      className={`min-h-11 rounded-1 px-3 text-petit transition-colors ${
                        actif
                          ? 'text-craie'
                          : item.principal
                            ? 'text-mesure hover:text-craie'
                            : 'text-brume hover:text-craie'
                      }`}
                    >
                      {item.label}
                      {actif && (
                        <span aria-hidden="true" className="mt-1 block h-px bg-mesure" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex min-h-11 items-center gap-2 rounded-1 px-3 text-petit text-brume transition-colors hover:text-craie"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Rechercher</span>
                <kbd className="nombres hidden rounded-1 border border-ardoise px-1.5 text-micro text-brume sm:inline">
                  Ctrl K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="menu-mobile"
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="flex h-11 w-11 items-center justify-center rounded-1 text-brume transition-colors hover:text-craie lg:hidden"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {menuOpen && (
            <ul id="menu-mobile" className="border-t border-ardoise py-2 lg:hidden">
              {navItems.map((item) => {
                const actif = page.type === item.page.type;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => navigate(item.page as Page)}
                      aria-current={actif ? 'page' : undefined}
                      className={`flex min-h-11 w-full items-center px-1 text-left text-petit transition-colors ${
                        actif ? 'text-craie' : 'text-brume hover:text-craie'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </header>


      <main id="contenu" className="pt-14">
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

      <footer className="mt-24 border-t border-ardoise">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-titre text-t3 text-craie">NEXUS</p>
            <p className="mesure-texte text-petit text-brume">
              Évaluation des aptitudes cognitives, avec la marge d’erreur.
            </p>
          </div>

          <nav aria-label="Pied de page">
            <ul className="flex flex-col gap-2">
              {navItems.slice(1).map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => navigate(item.page as Page)}
                    className="text-petit text-brume transition-colors hover:text-craie"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
