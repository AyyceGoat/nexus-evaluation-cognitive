import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DEVISE,
  MONTANT_DEBLOCAGE,
  TTL_MINUTES,
  etatPaiement,
  forcerExpirationSandbox,
  paiementEnLocal,
  simulerWebhookNonSigne,
  simulerWebhookSandbox,
  transitionsSandbox,
  type EtatPaiement,
} from '../lib/paiement';
import { CHEMINS } from '../app/navigation';
import { Button } from '../components/ui/Button';
import { ErrorState, Panel, SkeletonResultat } from '../components/ui/feedback';

/**
 * Écran d'état du paiement. Un état affiché par cas, aucun état par défaut.
 *
 * Le sondage côté client est une commodité d'affichage : la source de vérité reste le
 * webhook, vérifié côté serveur. C'est pour cela que l'écran « en attente » dit
 * explicitement que quitter la page ne perd rien.
 */

/** Sondage espacé : trois secondes suffisent, et on s'arrête sur un état terminal. */
const INTERVALLE_SONDAGE_MS = 3000;
const SONDAGES_MAX = 100;

export function Paiement() {
  const { reference } = useParams();
  const [etat, setEtat] = useState<EtatPaiement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [sondages, setSondages] = useState(0);

  const lire = useCallback(async () => {
    if (!reference) return;
    try {
      setEtat(await etatPaiement(reference));
      setErreur(null);
    } catch (e) {
      setErreur(
        e instanceof Error && e.message
          ? e.message
          : 'L’état du paiement n’a pas pu être lu. Réessayez.'
      );
    }
  }, [reference]);

  useEffect(() => {
    void lire();
  }, [lire]);

  const terminal =
    etat !== null && ['succeeded', 'failed', 'expired', 'rejected'].includes(etat.statut);

  useEffect(() => {
    if (!etat || terminal || sondages >= SONDAGES_MAX) return;
    const minuteur = setTimeout(() => {
      setSondages((n) => n + 1);
      void lire();
    }, INTERVALLE_SONDAGE_MS);
    return () => clearTimeout(minuteur);
  }, [etat, terminal, sondages, lire]);

  if (!reference) {
    return (
      <Cadre>
        <ErrorState titre="Référence de paiement absente">
          Le lien est incomplet. Repartez du rapport à débloquer.
        </ErrorState>
      </Cadre>
    );
  }

  if (erreur) {
    return (
      <Cadre>
        <ErrorState
          titre="L’état du paiement est indisponible"
          action={
            <Button variant="secondaire" onClick={() => void lire()}>
              Réessayer
            </Button>
          }
        >
          {erreur}
        </ErrorState>
      </Cadre>
    );
  }

  if (!etat) {
    return (
      <Cadre>
        <SkeletonResultat />
      </Cadre>
    );
  }

  return (
    <Cadre>
      <p className="nombres text-micro text-brume">Référence {etat.reference}</p>

      {etat.statut === 'pending' && <EnAttente montant={etat.montant} devise={etat.devise} />}
      {etat.statut === 'succeeded' && <Reussi />}
      {etat.statut === 'failed' && <Echoue motif={etat.motif} />}
      {etat.statut === 'expired' && <Expire />}
      {etat.statut === 'rejected' && <Rejete motif={etat.motif} />}

      {paiementEnLocal && (
        <GuichetDeTest reference={reference} onChangement={() => void lire()} />
      )}
    </Cadre>
  );
}

function Cadre({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">{children}</div>;
}

function EnAttente({ montant, devise }: { montant: number; devise: string }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-t1 text-craie">Confirmez le paiement sur votre téléphone</h1>
      <p className="mesure-texte text-corps text-brume">
        Un message de votre opérateur mobile money vous demande de valider{' '}
        <span className="nombres text-craie">
          {montant} {devise}
        </span>
        . Saisissez votre code pour confirmer.
      </p>
      <p className="mesure-texte border-l-2 border-ardoise pl-4 text-petit text-brume">
        Vous pouvez fermer cette page : le paiement se poursuit et votre rapport sera
        débloqué dès la confirmation de l’opérateur. La référence reste valable{' '}
        {TTL_MINUTES} minutes.
      </p>
      <p role="status" aria-live="polite" className="text-micro text-brume">
        Vérification de l’état en cours…
      </p>
    </div>
  );
}

function Reussi() {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-t1 text-craie">Paiement confirmé</h1>
      <p className="mesure-texte text-corps text-brume">
        Votre rapport complet est débloqué : corrections détaillées de chaque question et
        attestation de passation.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to={CHEMINS.tableauDeBord} className="inline-flex">
          <Button variant="principal">Voir mon rapport</Button>
        </Link>
        <Link to={CHEMINS.transactions} className="inline-flex">
          <Button variant="secondaire">Voir le reçu</Button>
        </Link>
      </div>
    </div>
  );
}

function Echoue({ motif }: { motif?: string }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-t1 text-craie">Le paiement n’a pas abouti</h1>
      <p className="mesure-texte border-l-2 border-alerte pl-4 text-corps text-brume">
        {motif ?? 'L’opérateur a refusé la transaction.'}
      </p>
      <p className="mesure-texte text-petit text-brume">
        Rien n’a été débité. Un nouvel essai créera une nouvelle référence : celle-ci ne
        peut plus être réutilisée.
      </p>
      <div>
        <Link to={CHEMINS.tableauDeBord} className="inline-flex">
          <Button variant="principal">Réessayer depuis mon rapport</Button>
        </Link>
      </div>
    </div>
  );
}

function Expire() {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-t1 text-craie">Le délai de paiement a expiré</h1>
      <p className="mesure-texte text-corps text-brume">
        Cette référence est restée en attente plus de {TTL_MINUTES} minutes ; elle est
        désormais inutilisable. Rien n’a été débité.
      </p>
      <div>
        <Link to={CHEMINS.tableauDeBord} className="inline-flex">
          <Button variant="principal">Relancer un paiement</Button>
        </Link>
      </div>
    </div>
  );
}

function Rejete({ motif }: { motif?: string }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-t1 text-craie">Paiement rejeté</h1>
      <p className="mesure-texte border-l-2 border-alerte pl-4 text-corps text-brume">
        {motif ??
          'La confirmation reçue ne correspondait pas à cette transaction. Par précaution, rien n’a été débloqué.'}
      </p>
      <p className="mesure-texte text-petit text-brume">
        Si vous avez été débité, contactez-nous en indiquant la référence ci-dessus :
        l’incident est enregistré et horodaté de notre côté.
      </p>
    </div>
  );
}

/**
 * Guichet de test, visible uniquement en mode développement local.
 *
 * Il ne fait pas semblant d'attendre un téléphone qui ne sonnera pas : il demande
 * quelle issue jouer. Chaque bouton envoie un webhook réellement signé, donc le chemin
 * de code exercé est celui de la production.
 */
function GuichetDeTest({
  reference,
  onChangement,
}: {
  reference: string;
  onChangement: () => void;
}) {
  const [journal, setJournal] = useState<string[]>([]);

  const jouer = async (action: () => Promise<void> | void, libelle: string) => {
    try {
      await action();
      setJournal((precedent) => [...precedent, `${libelle} : appliqué`]);
    } catch (e) {
      setJournal((precedent) => [
        ...precedent,
        `${libelle} : rejeté — ${e instanceof Error ? e.message : 'erreur'}`,
      ]);
    }
    onChangement();
  };

  return (
    <Panel className="mt-12 p-5">
      <h2 className="text-t3 text-craie">Guichet de test</h2>
      <p className="mesure-texte mt-2 text-petit text-brume">
        Visible parce qu’aucun agrégateur n’est configuré. Aucun franc n’est déplacé.
        Chaque bouton envoie un webhook signé au provider sandbox, en empruntant le même
        chemin de code que la production — vérification de signature, contrôle du montant
        et verrou d’idempotence compris.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          taille="compact"
          variant="principal"
          onClick={() => void jouer(() => simulerWebhookSandbox(reference, 'succeeded'), 'Succès')}
        >
          Simuler un succès
        </Button>
        <Button
          taille="compact"
          onClick={() =>
            void jouer(
              () =>
                simulerWebhookSandbox(
                  reference,
                  'failed',
                  'Le solde de votre compte mobile money est insuffisant.'
                ),
              'Échec'
            )
          }
        >
          Simuler un échec
        </Button>
        <Button
          taille="compact"
          onClick={() =>
            void jouer(() => {
              forcerExpirationSandbox();
            }, 'Expiration')
          }
        >
          Forcer l’expiration
        </Button>
        <Button
          taille="compact"
          onClick={() =>
            void jouer(() => simulerWebhookSandbox(reference, 'succeeded'), 'Rejeu du webhook')
          }
        >
          Rejouer le webhook
        </Button>
        <Button
          taille="compact"
          variant="danger"
          onClick={() => void jouer(() => simulerWebhookNonSigne(reference), 'Signature absente')}
        >
          Envoyer sans signature
        </Button>
      </div>

      {journal.length > 0 && (
        <ul className="mt-5 flex flex-col gap-1 border-t border-ardoise pt-4">
          {journal.map((ligne, i) => (
            <li key={i} className="text-micro text-brume">
              {ligne}
            </li>
          ))}
        </ul>
      )}

      <details className="mt-5">
        <summary className="cursor-pointer text-petit text-brume">
          Journal des transitions ({transitionsSandbox(reference).length})
        </summary>
        <ul className="mt-3 flex flex-col gap-1">
          {transitionsSandbox(reference).map((transition, i) => (
            <li key={i} className="nombres text-micro text-brume">
              {new Date(transition.survenuLe).toLocaleTimeString('fr-FR')} —{' '}
              {transition.de ?? 'néant'} vers {transition.vers} ({transition.source})
              {transition.detail ? ` — ${transition.detail}` : ''}
            </li>
          ))}
        </ul>
      </details>

      <p className="nombres mt-5 text-micro text-brume">
        Montant du plan : {MONTANT_DEBLOCAGE} {DEVISE}
      </p>
    </Panel>
  );
}
