import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import { FournisseurAuth, RouteInvite, RouteProtegee } from './app/auth';
import { CHEMINS } from './app/navigation';
// La landing est importée statiquement, contrairement à toutes les autres pages.
//
// En 3G simulée, son chargement paresseux remplaçait un squelette de deux lignes par
// une page entière : le pied de page sautait, et Lighthouse mesurait un CLS de 0,484
// pour une cible de 0,1. Le décalage était nul sans bridage réseau, ce qui explique
// qu'il ait échappé à tous les autres contrôles. Elle pèse 4 ko gzip : l'inclure dans
// le chunk d'entrée coûte moins que le décalage qu'elle provoquait.
import { PageAccueil } from './pages/ecransPublics';

// Toutes les pages sont en import dynamique, sans exception.
//
// Ce n'est pas une optimisation cosmétique : `Rapport` importe la banque de 120 items
// et le rendu SVG des matrices. Chargée statiquement, elle faisait passer le chunk
// d'entrée de 66 à 176 ko gzip, soit au-delà du budget, pour une page que la plupart
// des visiteurs n'ouvriront jamais.
const PageEvaluation = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.PageEvaluation })));
const PageSavoir = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.PageSavoir })));
const PagePays = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.PagePays })));
const PageQuiz = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.PageQuiz })));
const PageArticle = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.PageArticle })));
const RedirectionSavoir = lazy(() => import('./pages/ecransPublics').then((m) => ({ default: m.RedirectionSavoir })));

const Classement = lazy(() => import('./pages/Classement').then((m) => ({ default: m.Classement })));

const Inscription = lazy(() => import('./pages/auth').then((m) => ({ default: m.Inscription })));
const Connexion = lazy(() => import('./pages/auth').then((m) => ({ default: m.Connexion })));
const MotDePasseOublie = lazy(() => import('./pages/auth').then((m) => ({ default: m.MotDePasseOublie })));
const NouveauMotDePasse = lazy(() =>
  import('./pages/auth').then((m) => ({ default: m.NouveauMotDePasse }))
);

const Bienvenue = lazy(() => import('./pages/Bienvenue').then((m) => ({ default: m.Bienvenue })));
const TableauDeBord = lazy(() => import('./pages/TableauDeBord').then((m) => ({ default: m.TableauDeBord })));
const Rapport = lazy(() => import('./pages/Rapport').then((m) => ({ default: m.Rapport })));
const Profil = lazy(() => import('./pages/compte').then((m) => ({ default: m.Profil })));
const Parametres = lazy(() => import('./pages/compte').then((m) => ({ default: m.Parametres })));
const NonTrouve = lazy(() => import('./pages/compte').then((m) => ({ default: m.NonTrouve })));

/**
 * Jalons d'amorçage, signalés à l'écran de lancement.
 *
 * La jauge avance sur deux sources : les octets reçus, relevés par
 * `public/lancement.js`, et ces jalons. Ils sont signalés au moment où l'étape est
 * réellement franchie, jamais par anticipation.
 *
 * `terminer()` attend deux images : `render` ne fait qu'ordonnancer le travail, et
 * retirer l'écran dans la foulée découvrirait une page encore vide. On aurait
 * remplacé un écran noir par un clignotement, ce qui est pire.
 */
interface Lancement {
  jalon(nom: 'module' | 'racine' | 'peint'): void;
  terminer(): void;
}

const lancement = (window as unknown as { __lancement?: Lancement }).__lancement;

lancement?.jalon('module');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurAuth>
        <Routes>
          <Route element={<App />}>
            {/* ── Public ──────────────────────────────────────────────── */}
            <Route path={CHEMINS.accueil} element={<PageAccueil />} />
            <Route path={CHEMINS.evaluation} element={<PageEvaluation />} />
            <Route path="/savoir" element={<PageSavoir />} />
            <Route path="/savoir/:categoryId" element={<PageSavoir />} />
            <Route path="/pays" element={<PagePays />} />
            <Route path="/quiz" element={<PageQuiz />} />
            {/* Le classement est public : il se consulte sans compte. */}
            <Route path={CHEMINS.classement} element={<Classement />} />
            <Route
              path="/article/:categoryId/:sectionIndex/:subIndex?"
              element={<PageArticle />}
            />

            {/* Le rapport est accessible par son identifiant : une passation faite
                sans compte doit rester consultable. Le contenu réservé, lui, dépend
                du droit d'accès vérifié côté serveur. */}
            <Route path="/rapport/:id" element={<Rapport />} />

            {/* ── Authentification ────────────────────────────────────── */}
            <Route
              path={CHEMINS.inscription}
              element={
                <RouteInvite>
                  <Inscription />
                </RouteInvite>
              }
            />
            <Route
              path={CHEMINS.connexion}
              element={
                <RouteInvite>
                  <Connexion />
                </RouteInvite>
              }
            />
            <Route
              path={CHEMINS.motDePasseOublie}
              element={
                <RouteInvite>
                  <MotDePasseOublie />
                </RouteInvite>
              }
            />
            {/* Sans garde `RouteInvite` : le lien de réinitialisation ouvre une
                session de récupération, donc la personne EST connectée en arrivant.
                Une garde « invité » la renverrait au tableau de bord sans qu'elle
                ait pu choisir son nouveau mot de passe. */}
            <Route path={CHEMINS.nouveauMotDePasse} element={<NouveauMotDePasse />} />

            {/* ── Espace connecté ─────────────────────────────────────── */}
            <Route
              path={CHEMINS.bienvenue}
              element={
                <RouteProtegee>
                  <Bienvenue />
                </RouteProtegee>
              }
            />
            <Route
              path={CHEMINS.tableauDeBord}
              element={
                <RouteProtegee>
                  <TableauDeBord />
                </RouteProtegee>
              }
            />
            <Route
              path={CHEMINS.profil}
              element={
                <RouteProtegee>
                  <Profil />
                </RouteProtegee>
              }
            />
            <Route
              path={CHEMINS.parametres}
              element={
                <RouteProtegee>
                  <Parametres />
                </RouteProtegee>
              }
            />

            {/* ── Redirections des anciennes URL ──────────────────────── */}
            {/* Le site est en production : ces chemins existent dans les signets
                et dans l'index des moteurs de recherche. */}
            <Route path="/iq" element={<Navigate to={CHEMINS.evaluation} replace />} />
            <Route path="/knowledge" element={<Navigate to="/savoir" replace />} />
            <Route path="/knowledge/:categoryId" element={<RedirectionSavoir />} />
            <Route path="/countries" element={<Navigate to="/pays" replace />} />
            <Route path="/ai" element={<Navigate to={CHEMINS.accueil} replace />} />

            <Route path="*" element={<NonTrouve />} />
          </Route>
        </Routes>
      </FournisseurAuth>
    </BrowserRouter>
  </StrictMode>
);

lancement?.jalon('racine');

requestAnimationFrame(() => {
  lancement?.jalon('peint');
  requestAnimationFrame(() => lancement?.terminer());
});
