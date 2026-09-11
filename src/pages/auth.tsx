import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { backend, modeDeveloppementLocal } from '../lib/backend';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { CHEMINS } from '../app/navigation';

/** Colonne étroite commune aux trois écrans d'authentification. */
function Cadre({ titre, sous, children }: { titre: string; sous: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-t1 text-craie">{titre}</h1>
      <p className="mesure-texte mt-3 text-petit text-brume">{sous}</p>
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

    // En mode Supabase, la session n'existe qu'après confirmation de l'adresse.
    const utilisateur = await backend.utilisateurCourant();
    if (utilisateur) {
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
        <Link to={CHEMINS.connexion} className="inline-flex">
          <Button variant="secondaire">Aller à la connexion</Button>
        </Link>
      </Cadre>
    );
  }

  return (
    <Cadre
      titre="Créer mon compte"
      sous="Un compte conserve vos passations et permet de suivre votre progression d’une fois sur l’autre."
    >
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
          {envoi ? 'Création du compte…' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-petit text-brume">
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
        <p className="mb-6 border-l-2 border-mesure pl-4 text-petit text-brume">
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

      <div className="mt-6 flex flex-col gap-2 text-petit text-brume">
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
      {modeDeveloppementLocal && (
        <p className="mb-6 border-l-2 border-alerte pl-4 text-petit text-brume">
          En mode développement local, aucun e-mail n’est envoyé. Cette fonction exige un
          projet Supabase configuré.
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
          erreur={erreur}
        />
        <Button type="submit" variant="principal" disabled={envoi}>
          {envoi ? 'Envoi…' : 'Envoyer le lien'}
        </Button>
      </form>

      <p className="mt-6 text-petit text-brume">
        <Link to={CHEMINS.connexion} className="text-mesure underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </Cadre>
  );
}
