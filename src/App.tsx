import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { configurationManquante } from './lib/backend';
import { useAuth } from './app/auth';
import { CHEMINS, useNavigatePage } from './app/navigation';
import { Button } from './components/ui/Button';

export type { Page } from './app/navigation';

// Les données de l'omnisearch pèsent environ 260 ko : la modale n'est montée qu'à la
// première ouverture, donc seuls les utilisateurs qui s'en servent les téléchargent.
const OmnisearchModal = lazy(() =>
  import('./components/search/OmnisearchModal').then((m) => ({ default: m.OmnisearchModal }))
);

const LIENS_PUBLICS = [
  { to: CHEMINS.evaluation, libelle: 'Évaluation' },
  { to: CHEMINS.classement, libelle: 'Classement' },
  { to: '/savoir', libelle: 'Savoir' },
  { to: '/pays', libelle: 'Pays' },
  { to: '/quiz', libelle: 'Quiz' },
];

export default function App() {
  const { utilisateur, chargement } = useAuth();
  const emplacement = useLocation();
  const navigatePage = useNavigatePage();

  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);

  // Ferme le menu à chaque changement de page : le laisser ouvert masque le contenu
  // vers lequel on vient de naviguer.
  useEffect(() => setMenuOuvert(false), [emplacement.pathname]);

  useEffect(() => {
    const onKeyDown = (evenement: KeyboardEvent) => {
      if ((evenement.ctrlKey || evenement.metaKey) && evenement.key.toLowerCase() === 'k') {
        evenement.preventDefault();
        setRechercheOuverte((ouvert) => !ouvert);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const classeLien = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center rounded-1 px-3 text-petit transition-colors ${
      isActive ? 'text-craie' : 'text-brume hover:text-craie'
    }`;

  return (
    <div className="min-h-screen bg-noir text-craie">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-1 focus:bg-mesure focus:px-4 focus:py-2 focus:text-petit focus:text-noir"
      >
        Aller au contenu
      </a>

      {rechercheOuverte && (
        <Suspense fallback={null}>
          <OmnisearchModal
            isOpen
            onClose={() => setRechercheOuverte(false)}
            navigate={navigatePage}
          />
        </Suspense>
      )}

      <BandeauConfiguration />

      <header className="sticky top-0 z-40 border-b border-ardoise bg-noir/95">
        <nav aria-label="Navigation principale" className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-2">
            <Link
              to={CHEMINS.accueil}
              className="flex min-h-11 items-center rounded-1 font-titre text-t3 tracking-tight text-craie"
            >
              NEXUS
            </Link>

            <ul className="hidden items-center gap-1 lg:flex">
              {LIENS_PUBLICS.map((lien) => (
                <li key={lien.to}>
                  <NavLink to={lien.to} className={classeLien}>
                    {lien.libelle}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRechercheOuverte(true)}
                className="flex min-h-11 items-center gap-2 rounded-1 px-3 text-petit text-texte transition-colors hover:text-craie"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Rechercher</span>
              </button>

              {!chargement && (
                <div className="hidden lg:block">
                  {utilisateur ? (
                    <NavLink to={CHEMINS.tableauDeBord} className={classeLien}>
                      Mon espace
                    </NavLink>
                  ) : (
                    <Link to={CHEMINS.inscription}>
                      <Button variant="principal" taille="compact">
                        Créer mon compte
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuOuvert(!menuOuvert)}
                aria-expanded={menuOuvert}
                aria-controls="menu-mobile"
                aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="flex h-11 w-11 items-center justify-center rounded-1 text-brume transition-colors hover:text-craie lg:hidden"
              >
                {menuOuvert ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {menuOuvert && (
            <ul id="menu-mobile" className="border-t border-ardoise py-2 lg:hidden">
              {LIENS_PUBLICS.map((lien) => (
                <li key={lien.to}>
                  <NavLink to={lien.to} className={classeLien}>
                    {lien.libelle}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to={utilisateur ? CHEMINS.tableauDeBord : CHEMINS.inscription}
                  className={classeLien}
                >
                  {utilisateur ? 'Mon espace' : 'Créer mon compte'}
                </NavLink>
              </li>
            </ul>
          )}
        </nav>
      </header>

      {/* `min-h-screen` sur `<main>`, et pas seulement sur le squelette d'attente.
          Mesuré deux fois : c'est bien cette réserve permanente qui ramène le CLS de
          0,324 à 0,000. Sans elle, le pied de page est peint dans le viewport puis
          chassé vers le bas quand le contenu s'étoffe — polices remplacées, canvas
          monté. Je l'avais retirée en trouvant l'espace sous le hero trop généreux ;
          le CLS est remonté, donc elle reste. L'espace négatif est de toute façon ce
          que DESIGN.md demande. */}
      <main id="contenu" className="min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<AttentePage />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="mt-24 border-t border-ardoise">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="flex flex-col gap-2">
            <p className="font-titre text-t3 text-craie">NEXUS</p>
            <p className="mesure-texte text-petit text-texte">
              Évaluation des aptitudes cognitives, avec la marge d’erreur.
            </p>
          </div>

          <nav aria-label="Pied de page">
            <ul className="flex flex-col gap-2">
              {LIENS_PUBLICS.map((lien) => (
                <li key={lien.to}>
                  <Link
                    to={lien.to}
                    className="flex min-h-11 items-center rounded-1 text-petit text-texte transition-colors hover:text-craie"
                  >
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/**
 * Squelette d'attente pendant le chargement du module de page.
 *
 * `min-h-screen` est porté par le squelette et non par `<main>` : il faut réserver la
 * hauteur **pendant** le chargement, pour que le pied de page ne soit pas peint haut
 * puis chassé vers le bas — c'est ce qui donnait un CLS de 0,484 en 3G. Le poser sur
 * `<main>` en permanence marchait aussi, mais laissait un grand vide sous le hero sur
 * les écrans hauts. Constaté sur capture.
 */
function AttentePage() {
  return (
    <div
      className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Chargement de la page</span>
      <div className="squelette h-8 w-64 rounded-1" aria-hidden="true" />
      <div className="squelette mt-6 h-4 w-full max-w-md rounded-1" aria-hidden="true" />
    </div>
  );
}

/**
 * Bandeau affiché quand le serveur n'est pas configuré.
 *
 * Il n'annonce PAS un mode dégradé : il n'y en a plus. L'ancien adaptateur local
 * acceptait n'importe quel mot de passe, et une fausse authentification qui ressemble
 * à une vraie n'a rien à faire dans un produit en ligne. Sans configuration, les
 * écrans publics restent lisibles et tout ce qui demande un compte échoue avec un
 * message explicite — ce qui est la vérité, et non un contournement.
 */
function BandeauConfiguration() {
  if (!configurationManquante) return null;

  return (
    <div role="status" className="border-b border-alerte bg-noir">
      <p className="mx-auto max-w-6xl px-4 py-2 text-micro text-brume sm:px-6">
        <span className="text-alerte">Serveur non configuré.</span> Les comptes,
        l’enregistrement des passations et le classement sont indisponibles. Renseignez{' '}
        <span className="nombres">VITE_SUPABASE_URL</span> et{' '}
        <span className="nombres">VITE_SUPABASE_ANON_KEY</span> — voir docs/SUPABASE.md.
      </p>
    </div>
  );
}
