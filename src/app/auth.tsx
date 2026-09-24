import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { backend, sessionProbable } from '../lib/backend';
import type { Profil, Utilisateur } from '../lib/backend/types';
import { CHEMINS } from './navigation';

interface EtatAuth {
  /** `true` tant qu'on ne sait pas encore si une session existe. */
  chargement: boolean;
  utilisateur: Utilisateur | null;
  profil: Profil | null;
  rafraichirProfil: () => Promise<void>;
  deconnecter: () => Promise<void>;
}

const ContexteAuth = createContext<EtatAuth | null>(null);

/** Chemins qui ne peuvent rien afficher sans savoir qui est connecté. */
const PREFIXES_AVEC_COMPTE = [
  CHEMINS.tableauDeBord,
  CHEMINS.profil,
  CHEMINS.parametres,
  CHEMINS.bienvenue,
  CHEMINS.nouveauMotDePasse,
  '/rapport',
];

function pageExigeantUnCompte(chemin: string): boolean {
  return PREFIXES_AVEC_COMPTE.some((prefixe) => chemin.startsWith(prefixe));
}

/** Première interaction : c'est le moment où l'on peut avoir besoin d'un compte. */
const EVENEMENTS = ['pointerdown', 'keydown', 'touchstart'] as const;

/** Filet, si personne n'interagit. */
const DELAI_CHARGEMENT_MS = 4000;

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);

  const rafraichirProfil = useCallback(async () => {
    setProfil(await backend.lireProfil());
  }, []);

  useEffect(() => {
    let annule = false;
    let desabonner: (() => void) | null = null;

    const initialiser = () => {
      // Premier état connu, puis abonnement aux changements.
      void (async () => {
        const courant = await backend.utilisateurCourant();
        if (annule) return;
        setUtilisateur(courant);
        if (courant) setProfil(await backend.lireProfil());
        if (!annule) setChargement(false);
      })();

      desabonner = backend.surChangementAuth((suivant) => {
        setUtilisateur(suivant);
        setChargement(false);
        if (suivant) {
          void backend.lireProfil().then(setProfil);
        } else {
          setProfil(null);
        }
      });
    };

    // Un écran qui exige un compte a besoin de savoir tout de suite, comme
    // quelqu'un dont un jeton est déjà stocké.
    if (sessionProbable() || pageExigeantUnCompte(window.location.pathname)) {
      initialiser();
      return () => {
        annule = true;
        desabonner?.();
      };
    }

    // Personne n'est connecté, et aucun écran ne l'exige : on l'affiche
    // immédiatement, et la bibliothèque n'est chargée qu'à la première
    // interaction. Un visiteur qui lit la landing ne la télécharge jamais.
    //
    // L'abonnement doit tout de même finir par exister : sans lui, une connexion
    // réussie ne serait pas vue par cet état, et la route protégée renverrait
    // aussitôt vers le formulaire. Se connecter demande d'interagir, donc
    // l'abonnement est en place à temps ; le délai n'est qu'un filet.
    setUtilisateur(null);
    setProfil(null);
    setChargement(false);

    let fait = false;
    // Déclaré avant `lancer`, qui s'en sert : une référence en zone morte
    // temporelle passe inaperçue jusqu'au jour où l'ordre d'exécution change.
    let minuteur = 0;

    const lancer = () => {
      if (fait || annule) return;
      fait = true;
      for (const nom of EVENEMENTS) window.removeEventListener(nom, lancer);
      window.clearTimeout(minuteur);
      initialiser();
    };

    for (const nom of EVENEMENTS) {
      window.addEventListener(nom, lancer, { once: true, passive: true });
    }
    minuteur = window.setTimeout(lancer, DELAI_CHARGEMENT_MS);

    return () => {
      annule = true;
      for (const nom of EVENEMENTS) window.removeEventListener(nom, lancer);
      window.clearTimeout(minuteur);
      desabonner?.();
    };
  }, []);

  const deconnecter = useCallback(async () => {
    await backend.deconnecter();
    setUtilisateur(null);
    setProfil(null);
  }, []);

  const valeur = useMemo(
    () => ({ chargement, utilisateur, profil, rafraichirProfil, deconnecter }),
    [chargement, utilisateur, profil, rafraichirProfil, deconnecter]
  );

  return <ContexteAuth.Provider value={valeur}>{children}</ContexteAuth.Provider>;
}

export function useAuth(): EtatAuth {
  const contexte = useContext(ContexteAuth);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans un FournisseurAuth.');
  }
  return contexte;
}

/**
 * Garde de route.
 *
 * Mémorise la page demandée dans l'état de navigation, pour y revenir après la
 * connexion : envoyer systématiquement au tableau de bord ferait perdre l'intention
 * de l'utilisateur, par exemple un lien vers un rapport précis.
 */
export function RouteProtegee({ children }: { children: ReactNode }) {
  const { chargement, utilisateur, profil } = useAuth();
  const emplacement = useLocation();

  if (chargement) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" role="status" aria-live="polite">
        <span className="sr-only">Vérification de votre session</span>
        <div className="squelette h-6 w-48 rounded-1" aria-hidden="true" />
      </div>
    );
  }

  if (!utilisateur) {
    return (
      <Navigate
        to={CHEMINS.connexion}
        replace
        state={{ retourVers: emplacement.pathname + emplacement.search }}
      />
    );
  }

  // L'onboarding est passable, mais il doit avoir été vu une fois.
  if (profil && !profil.onboardeLe && emplacement.pathname !== CHEMINS.bienvenue) {
    return <Navigate to={CHEMINS.bienvenue} replace />;
  }

  return <>{children}</>;
}

/** Pour les écrans d'authentification : un utilisateur déjà connecté n'y a rien à faire. */
export function RouteInvite({ children }: { children: ReactNode }) {
  const { chargement, utilisateur } = useAuth();

  if (chargement) return null;

  // Une session ANONYME reste un invité.
  //
  // Cette garde renvoyait au tableau de bord dès qu'une session existait, sans
  // distinguer un compte d'une session anonyme. Conséquence : quelqu'un qui
  // passait l'évaluation sans compte était expulsé de la page d'inscription.
  // Il ne pouvait donc pas créer de compte depuis la session qui portait sa
  // passation — et c'est précisément par là que la passation se rattache.
  if (utilisateur && !utilisateur.estAnonyme) {
    return <Navigate to={CHEMINS.tableauDeBord} replace />;
  }
  return <>{children}</>;
}
