import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../lib/backend';
import { useAuth } from '../app/auth';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';

function Entete({ titre, sous }: { titre: string; sous: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-t1 text-craie">{titre}</h1>
      <p className="mesure-texte text-petit text-texte">{sous}</p>
    </div>
  );
}

/* ── Profil ──────────────────────────────────────────────────────────────── */

export function Profil() {
  const { utilisateur, profil, rafraichirProfil } = useAuth();

  const [nomAffiche, setNomAffiche] = useState(profil?.nomAffiche ?? '');
  const [nomLegal, setNomLegal] = useState(profil?.nomLegal ?? '');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnregistre(false);
    setEnvoi(true);

    const resultat = await backend.majProfil({
      nomAffiche: nomAffiche.trim() || null,
      nomLegal: nomLegal.trim() || null,
    });
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }
    await rafraichirProfil();
    setEnregistre(true);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Entete
        titre="Profil"
        sous="Le nom d’affichage vous identifie dans l’application. Le nom complet est celui qui figure sur vos attestations."
      />

      <form onSubmit={soumettre} noValidate className="mt-8 flex flex-col gap-5">
        <Field
          label="Adresse e-mail"
          type="email"
          value={utilisateur?.email ?? ''}
          readOnly
          aide="L’adresse ne se modifie pas depuis cet écran."
          className="text-brume"
        />
        <Field
          label="Nom d’affichage"
          autoComplete="nickname"
          value={nomAffiche}
          onChange={(e) => setNomAffiche(e.target.value)}
        />
        <Field
          label="Nom complet"
          autoComplete="name"
          value={nomLegal}
          onChange={(e) => setNomLegal(e.target.value)}
          aide="Apparaît sur l’attestation de passation."
          erreur={erreur}
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="principal" disabled={envoi}>
            {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {enregistre && (
            <p role="status" className="text-petit text-mesure">
              Profil enregistré.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Paramètres ──────────────────────────────────────────────────────────── */

export function Parametres() {
  const { deconnecter } = useAuth();

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Entete titre="Paramètres" sous="Réglages du compte et de la session." />

      <div className="mt-10 flex flex-col gap-10">
        <ReglagesClassement />

        <section className="flex flex-col gap-3 border-t border-ardoise pt-10">
          <h2 className="text-t3 text-craie">Session</h2>
          <p className="mesure-texte text-petit text-texte">
            Vous déconnecter ne supprime rien : vos passations restent enregistrées.
          </p>
          <div>
            <Button variant="secondaire" onClick={() => void deconnecter()}>
              Me déconnecter
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-ardoise pt-10">
          <h2 className="text-t3 text-craie">Supprimer mon compte</h2>
          <p className="mesure-texte text-petit text-texte">
            La suppression définitive du compte et des passations n’est pas encore
            disponible depuis l’application. Elle exige une fonction serveur qui reste à
            déployer. En attendant, la demande se fait par courrier électronique.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── 404 ─────────────────────────────────────────────────────────────────── */

export function NonTrouve() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-6">
      <Entete
        titre="Cette page n’existe pas"
        sous="Le lien est peut-être incomplet, ou la page a été déplacée."
      />
      <div className="mt-8">
        <Link to={CHEMINS.accueil} className="inline-flex">
          <Button variant="principal">Retour à l’accueil</Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Consentement au classement public, et choix du pseudonyme.
 *
 * Deux principes, tous deux appliqués cote serveur et pas seulement ici :
 *
 * 1. Rien n'est publié par défaut. La case est décochée à la création du compte, et
 *    l'activer est un geste explicite.
 * 2. Ni le pseudonyme ni le consentement ne sont modifiables par une écriture
 *    directe : les privilèges de colonne l'interdisent, et la fonction serveur
 *    vérifie que l'adresse e-mail est confirmée avant de publier quoi que ce soit.
 *
 * -- Ce que cet écran a cessé de faire --
 *
 * Le bouton « Figurer au classement » était simplement `disabled` quand une des conditions
 * manquait. Rien ne disait laquelle. On appuyait, il ne se passait rien, et la
 * conclusion raisonnable était que la fonction est cassée.
 *
 * Désormais : les trois conditions sont affichées avec leur état, le bouton reste
 * actif, et une pression produit toujours une réponse — le succès, ou la phrase du
 * serveur qui dit ce qui manque. Un bouton inerte n'est pas un message d'erreur.
 */
function ReglagesClassement() {
  const { utilisateur, profil, rafraichirProfil } = useAuth();

  const [pseudonyme, setPseudonyme] = useState(profil?.pseudonyme ?? '');
  const [erreurPseudo, setErreurPseudo] = useState<string | null>(null);
  const [erreurAction, setErreurAction] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const visible = profil?.classementVisible ?? false;
  const confirme = utilisateur?.emailConfirme ?? false;

  // Éligibilité de la passation, lue depuis ses propres passations — le même
  // filtre que celui de la fonction serveur, pour que l'ecran annonce ce que le
  // serveur décidera et non l'inverse.
  const passations = useAsync(() => backend.listerPassations(), []);
  const publiable =
    passations.statut === 'pret'
      ? passations.donnees.some(
          (item) =>
            item.termineeLe !== null &&
            item.verdict !== 'not_interpretable' &&
            item.indice !== null &&
            item.niveau !== null
        )
      : null;

  async function basculer(prochain: boolean) {
    setErreurPseudo(null);
    setErreurAction(null);
    setSucces(null);
    setEnvoi(true);

    const resultat = await backend.definirVisibiliteClassement(
      prochain,
      pseudonyme.trim() || undefined
    );
    setEnvoi(false);

    if (!resultat.ok) {
      setErreurAction(resultat.message);
      return;
    }
    await rafraichirProfil();
    setSucces(
      prochain
        ? 'Vous figurez au classement avec votre passation la plus récente.'
        : 'Vous ne figurez plus au classement, et votre ligne a été supprimée.'
    );
  }

  async function enregistrerPseudonyme(evenement: FormEvent) {
    evenement.preventDefault();
    setErreurPseudo(null);
    setErreurAction(null);
    setSucces(null);
    setEnvoi(true);

    const resultat = await backend.definirPseudonyme(pseudonyme.trim());
    setEnvoi(false);

    if (!resultat.ok) {
      setErreurPseudo(resultat.message);
      return;
    }
    await rafraichirProfil();
    setSucces('Pseudonyme enregistré.');
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-t3 text-craie">Classement public</h2>

      <p className="mesure-texte text-petit text-texte">
        Si vous y figurez, sont publiés : votre pseudonyme, votre niveau, votre indice
        avec son intervalle, le détail par aptitude et la date de passation. Ni votre
        adresse e-mail, ni votre nom, ni aucune autre donnée.
      </p>

      {/* Les trois conditions, et laquelle manque. */}
      <ul className="flex flex-col gap-2 text-petit">
        <Condition remplie={confirme} lien={null}>
          Adresse e-mail confirmée
        </Condition>
        <Condition remplie={Boolean(pseudonyme.trim())} lien={null}>
          Pseudonyme choisi
        </Condition>
        <Condition
          remplie={publiable}
          lien={
            publiable === false
              ? { vers: CHEMINS.evaluation, texte: 'Passer l’évaluation' }
              : null
          }
        >
          Une passation exploitable rattachée a ce compte
        </Condition>
      </ul>

      {!confirme && (
        <p className="mesure-texte border-l-2 border-alerte pl-4 text-petit text-texte">
          Confirmez d’abord votre adresse e-mail : seuls les comptes confirmés
          peuvent figurer au classement.
        </p>
      )}

      {publiable === false && (
        <p className="mesure-texte border-l-2 border-alerte pl-4 text-petit text-texte">
          Aucune passation n’est rattachée à ce compte. Si vous avez passé
          l’évaluation sans être connecté, le resultat est resté sur cette session-là :
          repassez-la une fois connecté, elle sera cette fois enregistrée sur votre
          compte.
        </p>
      )}

      <form onSubmit={enregistrerPseudonyme} noValidate className="flex flex-col gap-4">
        <Field
          label="Pseudonyme"
          value={pseudonyme}
          onChange={(e) => setPseudonyme(e.target.value)}
          aide="3 à 24 lettres, chiffres, tirets ou tirets bas. Évitez votre vrai nom."
          erreur={erreurPseudo}
        />
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="secondaire"
            disabled={envoi || !pseudonyme.trim() || pseudonyme.trim() === profil?.pseudonyme}
          >
            {envoi ? 'Enregistrement…' : 'Enregistrer le pseudonyme'}
          </Button>

          {/* Actif même quand une condition manque : le refus du serveur est une
              phrase, et une phrase renseigne. */}
          <Button
            variant={visible ? 'secondaire' : 'principal'}
            disabled={envoi}
            onClick={() => void basculer(!visible)}
          >
            {visible ? 'Me retirer du classement' : 'Figurer au classement'}
          </Button>
        </div>
      </form>

      {erreurAction && (
        <p
          role="alert"
          className="mesure-texte border-l-2 border-alerte pl-4 text-petit text-texte"
        >
          {erreurAction}
        </p>
      )}

      <p className="text-petit text-texte">
        État actuel :{' '}
        <span className={visible ? 'text-mesure' : 'text-craie'}>
          {visible ? 'vous figurez au classement' : 'vous n’y figurez pas'}
        </span>
        .
      </p>

      {succes && (
        <p role="status" className="text-petit text-mesure">
          {succes}{' '}
          <Link to={CHEMINS.classement} className="text-mesure underline underline-offset-2">
            Voir le classement
          </Link>
        </p>
      )}
    </section>
  );
}

/**
 * Une condition et son état.
 *
 * `remplie` vaut `null` tant que la réponse n'est pas connue : on affiche alors un
 * état d’attente plutôt qu'une croix, parce qu'annoncer un manque qu'on n’a pas
 * encore vérifié est un mensonge par empressement.
 */
function Condition({
  remplie,
  lien,
  children,
}: {
  remplie: boolean | null;
  lien: { vers: string; texte: string } | null;
  children: ReactNode;
}) {
  const etat = remplie === null ? 'vérification…' : remplie ? 'satisfaite' : 'manquante';

  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          remplie === null ? 'bg-ardoise' : remplie ? 'bg-mesure' : 'bg-alerte'
        }`}
      />
      <span className={remplie ? 'text-texte' : 'text-craie'}>
        {children} <span className="sr-only">: {etat}</span>
        {lien && (
          <>
            {' -- '}
            <Link to={lien.vers} className="text-mesure underline underline-offset-2">
              {lien.texte}
            </Link>
          </>
        )}
      </span>
    </li>
  );
}
