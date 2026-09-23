import { useState } from 'react';
import { Link } from 'react-router-dom';
import { backend, LIBELLE_NIVEAU, type EntreeClassement } from '../lib/backend';
import { useAuth } from '../app/auth';
import { useAsync } from '../app/useAsync';
import { CHEMINS } from '../app/navigation';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, SkeletonListe } from '../components/ui/feedback';
import { APTITUDE_LABEL } from '../lib/iq/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Classement public.
 *
 * Ce que cette page affiche : un pseudonyme choisi par la personne, son niveau, son
 * indice avec son intervalle, le détail par aptitude et la date de passation.
 *
 * Ce qu'elle n'affiche pas, et ne peut pas afficher : aucune adresse e-mail, aucun
 * nom, aucun identifiant de compte. La vue `v_classement` ne les expose pas, donc ils
 * ne peuvent pas arriver ici par inadvertance.
 *
 * Un point d'honnêteté, affiché à l'écran et non enfoui dans une documentation : un
 * classement par indice ordonne des mesures dont les intervalles se recouvrent
 * largement. Deux voisins de tableau ne sont pas départagés par la mesure.
 */
export function Classement() {
  const { utilisateur, profil } = useAuth();
  const etat = useAsync<EntreeClassement[]>(() => backend.lireClassement(100), []);
  const [deplie, setDeplie] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-t1 text-craie">Classement</h1>
      <p className="mesure-texte mt-3 text-petit text-texte">
        Les comptes confirmés qui ont choisi d’y figurer. Chacun décide, et seul son
        pseudonyme paraît.
      </p>

      <p className="mesure-texte mt-5 border-l-2 border-ardoise pl-4 text-petit text-texte">
        L’ordre suit l’indice estimé. Les intervalles de confiance se recouvrent
        largement d’une ligne à l’autre : ce tableau range des mesures, il ne départage
        pas deux personnes voisines.
      </p>

      {/* Invitation à figurer, adressée à ceux qui n'y sont pas encore. */}
      {utilisateur && profil && !profil.classementVisible && (
        <div className="mt-8 border-l-2 border-mesure pl-4">
          <p className="mesure-texte text-petit text-texte">
            Vous n’y figurez pas. Choisissez un pseudonyme et activez votre visibilité
            depuis vos paramètres ; votre passation la plus récente y sera publiée.
          </p>
          <div className="mt-3">
            <Link to={CHEMINS.parametres} className="inline-flex">
              <Button variant="secondaire" taille="compact">
                Ouvrir mes paramètres
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-10">
        {etat.statut === 'chargement' && <SkeletonListe lignes={6} />}

        {etat.statut === 'erreur' && (
          <ErrorState
            titre="Le classement n’a pas pu être chargé"
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
            titre="Le classement est vide"
            action={
              <Link to={CHEMINS.evaluation} className="inline-flex">
                <Button variant="principal">Passer l’évaluation</Button>
              </Link>
            }
          >
            Personne n’a encore choisi d’y figurer. Passez l’évaluation, puis activez
            votre visibilité depuis vos paramètres.
          </EmptyState>
        )}

        {etat.statut === 'pret' && etat.donnees.length > 0 && (
          <ol className="flex flex-col gap-2">
            {etat.donnees.map((entree) => {
              const ouvert = deplie === entree.pseudonyme;
              const soi = profil?.pseudonyme === entree.pseudonyme;

              return (
                <li
                  key={entree.pseudonyme}
                  className={`overflow-hidden rounded-2 border ${
                    soi ? 'border-mesure/50 bg-mesure/5' : 'border-ardoise/50 bg-graphite/40'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={ouvert}
                    onClick={() => setDeplie(ouvert ? null : entree.pseudonyme)}
                    className="flex min-h-11 w-full items-center gap-4 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
                  >
                    <span className="nombres w-8 shrink-0 text-petit text-texte">
                      {entree.rang}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-petit text-craie">
                        {entree.pseudonyme}
                        {soi && <span className="ml-2 text-micro text-mesure">vous</span>}
                      </span>
                      <span className="block text-micro text-brume">
                        {LIBELLE_NIVEAU[entree.niveau]}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="nombres block text-t3 text-craie">{entree.score}</span>
                      <span className="nombres block text-micro text-brume">
                        {entree.borneBasse}–{entree.borneHaute}
                      </span>
                    </span>

                    {ouvert ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-brume" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-brume" aria-hidden="true" />
                    )}
                  </button>

                  {ouvert && (
                    <div className="space-y-4 border-t border-ardoise/40 p-4 sm:p-6">
                      <dl className="grid grid-cols-2 gap-4 text-micro">
                        <div>
                          <dt className="text-brume">Passée le</dt>
                          <dd className="nombres mt-0.5 text-craie">
                            {new Date(entree.passeeLe).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-brume">Centile</dt>
                          <dd className="nombres mt-0.5 text-craie">
                            {entree.centile === null ? '—' : `${entree.centile}ᵉ`}
                          </dd>
                        </div>
                      </dl>

                      {entree.aptitudes.length > 0 && (
                        <div>
                          <p className="text-micro text-brume">Détail par aptitude</p>
                          <ul className="mt-3 flex flex-col gap-2">
                            {entree.aptitudes.map((apt) => (
                              <li key={apt.aptitude} className="flex items-center gap-3">
                                <span className="w-40 shrink-0 text-micro text-brume">
                                  {APTITUDE_LABEL[apt.aptitude]}
                                </span>
                                {/* Barre de position, sans chiffre : sept items par
                                    aptitude ne permettent pas d'afficher un
                                    sous-score comme un nombre. */}
                                <span
                                  className="h-1.5 flex-1 rounded-1 bg-ardoise/60"
                                  role="img"
                                  aria-label={`${APTITUDE_LABEL[apt.aptitude]} : ${apt.correctCount} bonnes réponses sur ${apt.itemCount}`}
                                >
                                  <span
                                    className="block h-full rounded-1 bg-mesure/70"
                                    style={{ width: `${Math.round(apt.radarValue)}%` }}
                                  />
                                </span>
                                <span className="nombres w-12 shrink-0 text-right text-micro text-brume">
                                  {apt.correctCount}/{apt.itemCount}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
