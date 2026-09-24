import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { backend } from '../lib/backend';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { CHEMINS } from '../app/navigation';
import { useAuth } from '../app/auth';

/** Colonne étroite commune aux trois écrans d'authentification. */
function Cadre({ titre, sous, children }: { titre: string; sous: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-t1 text-craie">{titre}</h1>
      <p className="mesure-texte mt-3 text-petit text-texte">{sous}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

interface EtatRetour {
  retourVers?: string;
}

export function Inscription() {
  const navigate = useNavigate();
  const emplacement = useLocation();
  const retour = (emplacement.state as EtatRetour | null)?.retourVers;

  // Session anonyme en cours : l'inscription va la rattacher, pas en créer une
  // autre. On le dit avant, parce que c'est une garantie qui compte pour qui
  // vient de passer l'évaluation.
  const { utilisateur } = useAuth();
  const rattachement = utilisateur?.estAnonyme ?? false;

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [confirmationAttendue, setConfirmationAttendue] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnvoi(true);

    const resultat = await backend.inscrire(email, motDePasse, nom);
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }

    // Le critère est l'adresse CONFIRMÉE, pas la simple existence d'une session.
    //
    // Dans le cas du rattachement, la session anonyme reste ouverte pendant que
    // l'adresse attend sa confirmation : `utilisateurCourant()` rend donc un
    // utilisateur, et tester sa seule présence aurait conduit à l'accueil
    // connecté en sautant l'écran « vérifiez votre boîte mail ».
    const courant = await backend.utilisateurCourant();
    if (courant?.emailConfirme) {
      navigate(retour ?? CHEMINS.bienvenue, { replace: true });
    } else {
      setConfirmationAttendue(true);
    }
  }

  if (confirmationAttendue) {
    return (
      <Cadre
        titre="Vérifiez votre boîte mail"
        sous={`Un lien de confirmation part vers ${email}. Ouvrez-le pour activer votre compte, puis connectez-vous.`}
      >
        <div className="flex flex-col gap-4">
          <p className="mesure-texte text-petit text-texte">
            Sans confirmation, la connexion est refusée : c’est ce qui garantit que
            l’adresse vous appartient. Regardez aussi vos courriers indésirables.
          </p>
          {rattachement && (
            <p className="mesure-texte border-l-2 border-mesure pl-4 text-petit text-texte">
              Votre passation est déjà rattachée à ce compte : elle sera là à votre
              première connexion.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link to={CHEMINS.connexion} className="inline-flex">
              <Button variant="principal">Aller à la connexion</Button>
            </Link>
            <RenvoiConfirmation email={email} />
          </div>
        </div>
      </Cadre>
    );
  }

  return (
    <Cadre
      titre="Créer mon compte"
      sous={
        rattachement
          ? 'Votre passation en cours suivra ce compte : c’est la même session qui devient permanente.'
          : 'Un compte conserve vos passations et permet de suivre votre progression d’une fois sur l’autre.'
      }
    >
      {rattachement && (
        <p className="mesure-texte mb-5 border-l-2 border-mesure pl-4 text-petit text-texte">
          Vous avez passé l’évaluation sans compte. Créez-le ici, depuis cet onglet, et
          votre résultat vous restera acquis — historique compris, et classement si vous
          le souhaitez.
        </p>
      )}

      <form onSubmit={soumettre} noValidate className="flex flex-col gap-5">
        <Field
          label="Nom d’affichage"
          autoComplete="name"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          aide="Celui qui apparaîtra dans l’application."
        />
        <Field
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          aide="Au moins 8 caractères."
          erreur={erreur}
        />

        <Button type="submit" variant="principal" disabled={envoi}>
          {envoi
            ? 'Création du compte…'
            : rattachement
              ? 'Créer mon compte et garder ma passation'
              : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-petit text-texte">
        Vous avez déjà un compte ?{' '}
        <Link to={CHEMINS.connexion} className="text-mesure underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </Cadre>
  );
}

export function Connexion() {
  const navigate = useNavigate();
  const emplacement = useLocation();
  const retour = (emplacement.state as EtatRetour | null)?.retourVers;

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnvoi(true);

    const resultat = await backend.connecter(email, motDePasse);
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }
    // Retour à la page demandée avant la redirection, pas au tableau de bord par défaut.
    navigate(retour ?? CHEMINS.tableauDeBord, { replace: true });
  }

  return (
    <Cadre titre="Se connecter" sous="Retrouvez vos passations et vos rapports.">
      {retour && (
        <p className="mb-6 border-l-2 border-mesure pl-4 text-petit text-texte">
          Connectez-vous pour accéder à cette page. Vous y serez ramené aussitôt.
        </p>
      )}

      <form onSubmit={soumettre} noValidate className="flex flex-col gap-5">
        <Field
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          erreur={erreur}
        />

        <Button type="submit" variant="principal" disabled={envoi}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>

      {/* L'adresse n'est pas confirmée : proposer le renvoi plutôt que de laisser
          l'utilisateur chercher un message qu'il a peut-être perdu. */}
      {erreur?.includes('Confirmez votre adresse') && (
        <div className="mt-5">
          <RenvoiConfirmation email={email} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 text-petit text-texte">
        <Link
          to={CHEMINS.motDePasseOublie}
          className="inline-flex min-h-11 items-center rounded-1 text-mesure underline underline-offset-2"
        >
          Mot de passe oublié
        </Link>
        <p>
          Pas encore de compte ?{' '}
          <Link to={CHEMINS.inscription} className="text-mesure underline underline-offset-2">
            En créer un
          </Link>
        </p>
      </div>
    </Cadre>
  );
}

export function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnvoi(true);

    const resultat = await backend.demanderReinitialisation(email);
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <Cadre
        titre="Lien envoyé"
        sous={`Si un compte existe avec ${email}, un lien de réinitialisation vient d’y être envoyé. Il est valable une heure.`}
      >
        <Link to={CHEMINS.connexion} className="inline-flex">
          <Button variant="secondaire">Retour à la connexion</Button>
        </Link>
      </Cadre>
    );
  }

  return (
    <Cadre
      titre="Réinitialiser mon mot de passe"
      sous="Saisissez votre adresse : vous recevrez un lien pour en choisir un nouveau."
    >
      <form onSubmit={soumettre} noValidate className="flex flex-col gap-5">
        <Field
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erreur={erreur}
        />
        <Button type="submit" variant="principal" disabled={envoi}>
          {envoi ? 'Envoi…' : 'Envoyer le lien'}
        </Button>
      </form>

      <p className="mt-6 text-petit text-texte">
        <Link to={CHEMINS.connexion} className="text-mesure underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </Cadre>
  );
}

/**
 * Renvoi du message de confirmation.
 *
 * Le bouton se désarme après un envoi : Supabase limite la cadence, et proposer un
 * bouton qui échouera à la deuxième pression serait pire que ne rien proposer.
 */
function RenvoiConfirmation({ email }: { email: string }) {
  const [etat, setEtat] = useState<'pret' | 'envoi' | 'envoye'>('pret');
  const [erreur, setErreur] = useState<string | null>(null);

  if (etat === 'envoye') {
    return (
      <p role="status" className="text-petit text-mesure">
        Message renvoyé. Il peut mettre une minute à arriver.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondaire"
        disabled={etat === 'envoi' || !email}
        onClick={() => {
          setErreur(null);
          setEtat('envoi');
          void backend.renvoyerConfirmation(email).then((resultat) => {
            if (resultat.ok) {
              setEtat('envoye');
            } else {
              setEtat('pret');
              setErreur(resultat.message);
            }
          });
        }}
      >
        {etat === 'envoi' ? 'Envoi…' : 'Renvoyer le lien de confirmation'}
      </Button>
      {erreur && (
        <p role="alert" className="text-petit text-alerte">
          {erreur}
        </p>
      )}
    </div>
  );
}

/**
 * Choix d'un nouveau mot de passe, après avoir suivi le lien reçu par e-mail.
 *
 * Le lien porte un jeton de récupération que le client Supabase transforme en session
 * à l'arrivée sur la page. Si cette session n'existe pas — lien périmé, ouvert dans un
 * autre navigateur, ou page atteinte directement — on le dit et on renvoie vers la
 * demande d'un nouveau lien, au lieu d'afficher un formulaire qui échouera.
 */
export function NouveauMotDePasse() {
  const navigate = useNavigate();

  const [session, setSession] = useState<'verification' | 'valide' | 'absente'>(
    'verification'
  );
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let annule = false;
    let minuteur = 0;

    // `detectSessionInUrl` traite le jeton de façon asynchrone : on laisse à
    // l'abonnement le temps de rendre la session avant de conclure à son absence.
    const desabonner = backend.surChangementAuth((utilisateur) => {
      if (!annule && utilisateur) setSession('valide');
    });

    void backend.utilisateurCourant().then((utilisateur) => {
      if (annule) return;
      if (utilisateur) {
        setSession('valide');
        return;
      }
      minuteur = window.setTimeout(() => {
        if (!annule) setSession((etat) => (etat === 'valide' ? etat : 'absente'));
      }, 1500);
    });

    return () => {
      annule = true;
      window.clearTimeout(minuteur);
      desabonner();
    };
  }, []);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit compter au moins 8 caractères.');
      return;
    }

    setEnvoi(true);
    const resultat = await backend.changerMotDePasse(motDePasse);
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }
    navigate(CHEMINS.tableauDeBord, { replace: true });
  }

  if (session === 'verification') {
    return (
      <Cadre titre="Vérification du lien" sous="Un instant.">
        <div className="squelette h-11 w-full rounded-1" aria-hidden="true" />
      </Cadre>
    );
  }

  if (session === 'absente') {
    return (
      <Cadre
        titre="Ce lien n’est plus valable"
        sous="Les liens de réinitialisation expirent au bout d’une heure, et ne fonctionnent que dans le navigateur qui les a demandés."
      >
        <Link to={CHEMINS.motDePasseOublie} className="inline-flex">
          <Button variant="principal">Demander un nouveau lien</Button>
        </Link>
      </Cadre>
    );
  }

  return (
    <Cadre
      titre="Choisir un nouveau mot de passe"
      sous="Il remplacera l’ancien immédiatement, et vous resterez connecté."
    >
      <form onSubmit={soumettre} noValidate className="flex flex-col gap-5">
        <Field
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          aide="Au moins 8 caractères."
        />
        <Field
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          erreur={erreur}
        />
        <Button type="submit" variant="principal" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </Button>
      </form>
    </Cadre>
  );
}
