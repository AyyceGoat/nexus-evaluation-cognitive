import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { backend, modeDeveloppementLocal, type Transaction } from '../lib/backend';
import { useAuth } from '../app/auth';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { EmptyState, ErrorState, SkeletonListe } from '../components/ui/feedback';

function Entete({ titre, sous }: { titre: string; sous: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-t1 text-craie">{titre}</h1>
      <p className="mesure-texte text-petit text-brume">{sous}</p>
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
        <section className="flex flex-col gap-3">
          <h2 className="text-t3 text-craie">Session</h2>
          <p className="mesure-texte text-petit text-brume">
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
          <p className="mesure-texte text-petit text-brume">
            La suppression définitive du compte et des passations n’est pas encore
            disponible depuis l’application. Elle exige une fonction serveur qui reste à
            déployer. En attendant, la demande se fait par courrier électronique.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── Transactions ────────────────────────────────────────────────────────── */

const LIBELLE_STATUT: Record<Transaction['statut'], string> = {
  pending: 'En attente',
  // Verrou serveur, de durée très brève. Affiché comme « en attente » plutôt que
  // d'exposer un mot de vocabulaire interne.
  processing: 'En attente',
  succeeded: 'Réussi',
  failed: 'Échoué',
  expired: 'Expiré',
  rejected: 'Rejeté',
};

export function Transactions() {
  const etat = useAsync<Transaction[]>(() => backend.listerTransactions(), []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Entete
        titre="Transactions"
        sous="Historique de vos paiements et de leur état."
      />

      <div className="mt-8">
        {etat.statut === 'chargement' && <SkeletonListe lignes={3} />}

        {etat.statut === 'erreur' && (
          <ErrorState
            titre="L’historique n’a pas pu être chargé"
            action={
              <Button variant="secondaire" onClick={etat.recharger}>
                Réessayer
              </Button>
            }
          >
            {etat.message}
          </ErrorState>
        )}

        {etat.statut === 'pret' && etat.donnees.length === 0 && (
          <EmptyState
            titre="Aucune transaction"
            action={
              <Link to={CHEMINS.tableauDeBord} className="inline-flex">
                <Button variant="secondaire">Retour au tableau de bord</Button>
              </Link>
            }
          >
            {modeDeveloppementLocal
              ? 'Le mode développement local n’enregistre les transactions que dans ce navigateur. Le paiement sandbox de la Phase 5 en créera ici.'
              : 'Vos paiements apparaîtront ici dès le premier déblocage de rapport.'}
          </EmptyState>
        )}

        {etat.statut === 'pret' && etat.donnees.length > 0 && (
          <ul className="flex flex-col gap-2">
            {etat.donnees.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col gap-2 border border-ardoise bg-graphite p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="nombres text-petit text-craie">
                    {transaction.montant} {transaction.devise}
                  </span>
                  <span className="nombres text-micro text-brume">
                    {transaction.reference}
                  </span>
                </div>

                <div className="flex flex-col gap-1 sm:items-end">
                  <span
                    className={
                      transaction.statut === 'succeeded'
                        ? 'text-petit text-mesure'
                        : transaction.statut === 'pending'
                          ? 'text-petit text-brume'
                          : 'text-petit text-alerte'
                    }
                  >
                    {LIBELLE_STATUT[transaction.statut]}
                  </span>
                  <span className="text-micro text-brume">
                    {new Date(transaction.creeeLe).toLocaleString('fr-FR')}
                  </span>
                  {transaction.motifEchec && (
                    <span className="text-micro text-brume">{transaction.motifEchec}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
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
