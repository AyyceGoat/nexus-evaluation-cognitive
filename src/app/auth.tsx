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
import { backend } from '../lib/backend';
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

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);

  const rafraichirProfil = useCallback(async () => {
    setProfil(await backend.lireProfil());
  }, []);

  useEffect(() => {
    let annule = false;

    // Premier état connu, puis abonnement aux changements.
    void (async () => {
      const courant = await backend.utilisateurCourant();
      if (annule) return;
      setUtilisateur(courant);
      if (courant) setProfil(await backend.lireProfil());
      if (!annule) setChargement(false);
    })();

    const desabonner = backend.surChangementAuth((suivant) => {
      setUtilisateur(suivant);
      setChargement(false);
      if (suivant) {
        void backend.lireProfil().then(setProfil);
      } else {
        setProfil(null);
      }
    });

    return () => {
      annule = true;
      desabonner();
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
  if (utilisateur) return <Navigate to={CHEMINS.tableauDeBord} replace />;
  return <>{children}</>;
}
