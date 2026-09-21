import { Link } from 'react-router-dom';
import { backend, type PassationResume } from '../lib/backend';
import { useAuth } from '../app/auth';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, Panel, SkeletonListe, SkeletonResultat } from '../components/ui/feedback';
import { IntervalBar } from '../components/iq/IntervalBar';

/**
 * Trois niveaux de lecture, pas une grille de cartes identiques (DESIGN.md §9).
 *
 * 1. La dernière passation, en grand : c'est ce qu'on vient voir.
 * 2. L'historique, en liste.
 * 3. Profil, transactions, paramètres : liens discrets en bas.
 */
export function TableauDeBord() {
  const { profil } = useAuth();
  const etat = useAsync<PassationResume[]>(() => backend.listerPassations(), []);

  const prenom = profil?.nomAffiche?.split(' ')[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-t1 text-craie">
        {prenom ? `Bonjour ${prenom}` : 'Votre tableau de bord'}
      </h1>

      {etat.statut === 'chargement' && (
        <div className="mt-10 flex flex-col gap-10">
          <SkeletonResultat />
          <SkeletonListe lignes={2} />
        </div>
      )}

      {etat.statut === 'erreur' && (
        <div className="mt-10">
          <ErrorState
            titre="Vos passations n’ont pas pu être chargées"
            action={
              <Button variant="secondaire" onClick={etat.recharger}>
                Réessayer
              </Button>
            }
          >
            {etat.message}
          </ErrorState>
        </div>
      )}

      {etat.statut === 'pret' && etat.donnees.length === 0 && (
        <div className="mt-10">
          <EmptyState
            titre="Vous n’avez pas encore passé d’évaluation"
            action={
              <Link to={CHEMINS.evaluation} className="inline-flex">
                <Button variant="principal">Commencer l’évaluation</Button>
              </Link>
            }
          >
            Une évaluation compte 35 questions et dure environ 25 minutes. Vous obtiendrez un
            indice avec sa marge d’erreur, et un profil par aptitude.
          </EmptyState>
        </div>
      )}

      {etat.statut === 'pret' && etat.donnees.length > 0 && (
        <Contenu passations={etat.donnees} />
      )}

      {/* Niveau 3 : ce qui se cherche rarement. */}
      <nav aria-label="Réglages du compte" className="mt-20 border-t border-ardoise pt-6">
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {[
            [CHEMINS.profil, 'Profil'],
            [CHEMINS.parametres, 'Paramètres'],
          ].map(([chemin, libelle]) => (
            <li key={chemin}>
              <Link
                to={chemin}
                className="flex min-h-11 items-center rounded-1 text-petit text-brume transition-colors hover:text-craie"
              >
                {libelle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Contenu({ passations }: { passations: PassationResume[] }) {
  const [derniere, ...precedentes] = passations;

  return (
    <>
      {/* ── Niveau 1 ─────────────────────────────────────────────────────── */}
      <Panel className="mt-10 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-t3 text-craie">Votre dernière évaluation</h2>
          <p className="text-micro text-brume">{formaterDate(derniere.commenceeLe)}</p>
        </div>

        <div className="mt-6">
          {derniere.verdict === 'not_interpretable' || derniere.indice === null ? (
            <div className="border-l-2 border-alerte pl-4">
              <p className="text-t3 text-craie">Profil non interprétable</p>
              <p className="mesure-texte mt-2 text-petit text-brume">
                Vos réponses ne se distinguaient pas d’un tirage au hasard, donc aucun score
                n’a été calculé. Reprenez l’évaluation en prenant le temps de lire chaque
                énoncé.
              </p>
            </div>
          ) : (
            <IntervalBar
              scaled={{
                point: derniere.indice,
                lower95: derniere.borneBasse ?? derniere.indice,
                upper95: derniere.borneHaute ?? derniere.indice,
              }}
            />
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={CHEMINS.rapport(derniere.id)} className="inline-flex">
            <Button variant="principal">Voir le rapport</Button>
          </Link>
          <Link to={CHEMINS.evaluation} className="inline-flex">
            <Button variant="secondaire">Repasser une évaluation</Button>
          </Link>
        </div>
      </Panel>

      {/* ── Niveau 2 ─────────────────────────────────────────────────────── */}
      {precedentes.length > 0 && (
        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-t3 text-craie">Vos évaluations précédentes</h2>
            <p className="nombres text-micro text-brume">
              {passations.length} passation{passations.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Un tableau à cinq colonnes est illisible à 360 px, et le faire défiler
              horizontalement est un aveu d'échec : c'est une liste de blocs. */}
          <ul className="mt-4 flex flex-col gap-2">
            {precedentes.map((passation) => (
              <li key={passation.id}>
                <Link
                  to={CHEMINS.rapport(passation.id)}
                  className="flex flex-col gap-3 border border-ardoise bg-graphite p-4 transition-colors hover:border-brume sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-petit text-brume">
                    {formaterDate(passation.commenceeLe)}
                  </span>

                  {passation.indice === null ? (
                    <span className="text-petit text-brume">Profil non interprétable</span>
                  ) : (
                    <span className="nombres flex items-baseline gap-3">
                      <span className="text-t3 text-craie">{passation.indice}</span>
                      <span className="text-petit text-mesure">
                        {passation.borneBasse} – {passation.borneHaute}
                      </span>
                    </span>
                  )}

                  <span className="nombres text-micro text-brume">
                    {passation.nombreReussites}/{passation.nombreItems} réussies
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
