import { useNavigate, useParams } from 'react-router-dom';
import { backend } from '../lib/backend';
import type { RapportStocke } from '../lib/backend';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { IQResultsView } from '../components/iq/IQResultsView';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, SkeletonResultat } from '../components/ui/feedback';

/**
 * Rapport d'une passation, par son identifiant.
 *
 * Tout vient du serveur : le résultat, les énoncés et le corrigé. Il n'y a plus de
 * repli sur le stockage du navigateur, et c'est volontaire — un rapport lu dans
 * `localStorage` pouvait être réécrit à la main, et le navigateur ne détient de
 * toute façon plus les énoncés.
 *
 * Le rapport est intégralement accessible : corrections et attestation comprises.
 */
export function Rapport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const etat = useAsync<RapportStocke | null>(async () => {
    if (!id) return null;
    return backend.lireRapport(id);
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

  const { rapport, questions, corrections } = etat.donnees;

  return (
    <IQResultsView
      report={rapport}
      questions={questions}
      corrections={corrections}
      onRestart={() => navigate(CHEMINS.evaluation)}
    />
  );
}
