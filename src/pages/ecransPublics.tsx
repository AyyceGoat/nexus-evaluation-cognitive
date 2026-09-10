import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useNavigatePage } from '../app/navigation';
import { SkeletonListe } from '../components/ui/feedback';

/**
 * Enveloppes des écrans publics existants.
 *
 * Ces écrans reçoivent encore une prop `navigate: (page: Page) => void`, héritée de
 * l'ancien routage écrit à la main. Les envelopper ici évite de les réécrire pour
 * passer à react-router : `useNavigatePage` traduit le descripteur de page en URL.
 * Les paramètres d'URL, eux, sont lus ici et transmis en props.
 */

const HomePage = lazy(() => import('../components/HomePage'));
const KnowledgeExplorer = lazy(() => import('../components/KnowledgeExplorer'));
const CountriesExplorer = lazy(() => import('../components/CountriesExplorer'));
const QuizSection = lazy(() => import('../components/QuizSection'));
const ArticleView = lazy(() => import('../components/ArticleView'));
const IQTestRunner = lazy(() =>
  import('../components/iq/IQTestRunner').then((m) => ({ default: m.IQTestRunner }))
);

function Attente() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SkeletonListe lignes={3} />
    </div>
  );
}

/** Met à jour le titre et la meta description par route. */
function useTitre(titre: string, description: string) {
  useEffect(() => {
    document.title = titre;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [titre, description]);
}

export function PageAccueil() {
  const navigate = useNavigatePage();
  useTitre(
    'NEXUS — Évaluation des aptitudes cognitives',
    'Mesurez cinq aptitudes cognitives et obtenez un indice assorti de sa marge d’erreur. 35 questions, environ 25 minutes.'
  );
  return (
    <Suspense fallback={<Attente />}>
      <HomePage navigate={navigate} />
    </Suspense>
  );
}

export function PageEvaluation() {
  useTitre(
    'Évaluation des aptitudes cognitives — NEXUS',
    'Cinq aptitudes évaluées : matrices logiques, séries numériques, analogies verbales, rotation spatiale et mémoire de travail.'
  );
  return (
    <Suspense fallback={<Attente />}>
      <IQTestRunner />
    </Suspense>
  );
}

export function PageSavoir() {
  const { categoryId } = useParams();
  useTitre(
    'Bibliothèque du savoir — NEXUS',
    'Empires africains, neurosciences, intelligence artificielle, physique quantique, religions et philosophie.'
  );
  return (
    <Suspense fallback={<Attente />}>
      <KnowledgeExplorer initialDomainId={categoryId} />
    </Suspense>
  );
}

export function PagePays() {
  useTitre(
    '195 pays du monde — NEXUS',
    'Drapeaux, capitales, langues, monnaies et faits marquants des 195 pays du monde.'
  );
  return (
    <Suspense fallback={<Attente />}>
      <CountriesExplorer />
    </Suspense>
  );
}

export function PageQuiz() {
  useTitre(
    'Quiz de culture générale — NEXUS',
    '464 questions sur neuf domaines, six modes de jeu.'
  );
  return (
    <Suspense fallback={<Attente />}>
      <QuizSection />
    </Suspense>
  );
}

export function PageArticle() {
  const navigate = useNavigatePage();
  const { categoryId, sectionIndex, subIndex } = useParams();
  useTitre('Article — NEXUS', 'Article de la bibliothèque du savoir NEXUS.');

  const section = Number(sectionIndex);
  const sous = subIndex !== undefined ? Number(subIndex) : undefined;

  return (
    <Suspense fallback={<Attente />}>
      <ArticleView
        categoryId={categoryId ?? ''}
        sectionIndex={Number.isFinite(section) ? section : 0}
        subIndex={Number.isFinite(sous) ? sous : undefined}
        navigate={navigate}
      />
    </Suspense>
  );
}

/**
 * Redirection de l'ancienne URL vers la nouvelle, en conservant le domaine.
 *
 * Le site est en production : `/knowledge/:id` figure dans les signets et dans le
 * sitemap. Rediriger vers `/savoir` tout court perdrait le domaine demandé.
 */
export function RedirectionSavoir() {
  const { categoryId } = useParams();
  return <Navigate to={categoryId ? `/savoir/${categoryId}` : '/savoir'} replace />;
}
