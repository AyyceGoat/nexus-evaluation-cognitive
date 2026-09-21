import { useNavigate, useParams } from 'react-router-dom';
import { backend } from '../lib/backend';
import { itemsById } from '../data/iq';
import { getReports } from '../lib/iq/storage';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { IQResultsView } from '../components/iq/IQResultsView';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, SkeletonResultat } from '../components/ui/feedback';
import type { IQItem, IQReport } from '../lib/iq/types';

interface Charge {
  rapport: IQReport;
  items: IQItem[];
}

/**
 * Rapport d'une passation, par son identifiant.
 *
 * Le rapport est intégralement accessible : corrections et attestation comprises.
 */
export function Rapport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const etat = useAsync<Charge | null>(async () => {
    if (!id) return null;

    const stocke = await backend.lireRapport(id);

    // Repli sur le stockage local : une passation faite sans compte y réside, et
    // reste consultable dans le même navigateur.
    const rapport = stocke?.rapport ?? getReports().find((r) => r.sessionId === id) ?? null;
    if (!rapport) return null;

    const identifiants = stocke?.itemIds ?? rapport.responses.map((r) => r.itemId);
    const items = identifiants
      .map((itemId) => itemsById.get(itemId))
      .filter((item): item is IQItem => Boolean(item));

    return { rapport, items };
  }, [id]);

  if (etat.statut === 'chargement') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <SkeletonResultat />
      </div>
    );
  }

  if (etat.statut === 'erreur') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ErrorState
          titre="Ce rapport n’a pas pu être chargé"
          action={
            <Button variant="secondaire" onClick={etat.recharger}>
              Réessayer
            </Button>
          }
        >
          {etat.message}
        </ErrorState>
      </div>
    );
  }

  if (!etat.donnees) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState
          titre="Rapport introuvable"
          action={
            <Button variant="principal" onClick={() => navigate(CHEMINS.evaluation)}>
              Commencer une évaluation
            </Button>
          }
        >
          Aucune passation ne correspond à cet identifiant. Elle a peut-être été faite dans
          un autre navigateur, ou sans compte.
        </EmptyState>
      </div>
    );
  }

  const { rapport, items } = etat.donnees;

  return (
    <IQResultsView
      report={rapport}
      items={items}
      onRestart={() => navigate(CHEMINS.evaluation)}
    />
  );
}
