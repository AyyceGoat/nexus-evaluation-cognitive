import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RobotHero } from './robot/RobotHero';
import { Button } from './ui/Button';
import { CHEMINS } from '../app/navigation';
import { DEFAULT_SESSION_LENGTH } from '../lib/iq/selection';
import { TAILLE_BANQUE } from '../lib/iq/types';

/**
 * Landing.
 *
 * Structure imposée par DESIGN.md §8. Trois partis pris qui expliquent ce qui n'y est
 * pas :
 *
 * - **Aucune carte.** Les trois promesses sont des colonnes séparées par des filets,
 *   pas trois panneaux au même rayon avec la même ombre.
 * - **L'audace est concentrée en un seul endroit**, le robot. Le reste de la page est
 *   du texte sur du noir, avec un unique accent réservé aux chiffres et à leur marge.
 * - **Rien n'apparaît au défilement.** L'ancienne version déclenchait un fondu-montée
 *   sur chaque section.
 */
function HomePage() {
  const refCta = useRef<HTMLAnchorElement>(null);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-24">
        <div className="flex flex-col gap-8">
          <h1 className="max-w-[18ch] text-t1 text-craie sm:text-display">
            Mesurez vos aptitudes cognitives. Avec la marge d’erreur.
          </h1>

          <p className="mesure-texte text-corps text-texte">
            {DEFAULT_SESSION_LENGTH} questions, environ 25 minutes. Vous obtenez un indice
            estimé, son intervalle de confiance, et un profil sur cinq aptitudes. Gratuit,
            sans compte.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link ref={refCta} to={CHEMINS.evaluation} className="rounded-1">
              <Button variant="principal">Commencer l’évaluation</Button>
            </Link>
            <Link
              to={CHEMINS.inscription}
              className="inline-flex min-h-11 items-center rounded-1 text-petit text-texte transition-colors hover:text-craie"
            >
              Créer un compte pour suivre ma progression
            </Link>
          </div>
        </div>

        {/* Le conteneur porte une hauteur fixe : le poster et le canvas se
            superposent en absolu, donc rien ne décale la mise en page au chargement
            de la 3D. */}
        <div className="relative mx-auto h-[280px] w-[240px] sm:h-[380px] sm:w-[320px] lg:h-[440px] lg:w-[380px]">
          <RobotHero refCta={refCta} />
        </div>
      </section>

      {/* ── Ce que vous obtenez ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="text-t2 text-craie">Ce que vous obtenez</h2>

        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-0">
          <Promesse titre="Un indice estimé" premier>
            <p className="nombres flex flex-wrap items-baseline gap-3">
              <span className="font-titre text-t1 text-craie">112</span>
              <span className="text-corps text-mesure">104 – 120</span>
            </p>
            <p className="mt-3 text-petit text-texte">
              L’intervalle fait partie du résultat. Il n’est ni en petit, ni relégué en
              note.
            </p>
          </Promesse>

          <Promesse titre="Un profil par aptitude">
            <p className="text-petit text-texte">
              Cinq aptitudes, en bandes larges dont l’épaisseur est la marge d’erreur.
              Aucun sous-score chiffré : sur sept questions par aptitude, un classement
              serait dicté par le bruit.
            </p>
          </Promesse>

          <Promesse titre="Un centile situé">
            <p className="text-petit text-texte">
              La population de référence est nommée en toutes lettres, pour que vous
              sachiez à qui vous êtes comparé.
            </p>
          </Promesse>
        </div>
      </section>

      {/* ── Le refus de score ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-l-2 border-mesure bg-graphite py-8 pl-6 pr-6 sm:pl-10">
          <p className="mesure-texte text-t3 text-craie">
            Si vos réponses ne se distinguent pas d’un tirage au hasard, aucun score n’est
            affiché.
          </p>
          <p className="mesure-texte mt-3 text-petit text-texte">
            Un test d’aptitude qui annonce un chiffre flatteur à quelqu’un qui a cliqué au
            hasard ne mesure rien. NEXUS compare vos réponses à ce que produirait le
            hasard, et vous montre les deux nombres.
          </p>
        </div>
      </section>

      {/* ── Explorer aussi ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="text-t2 text-craie">Explorer aussi</h2>

        <ul className="mt-8 border-t border-ardoise">
          {[
            {
              to: '/pays',
              titre: '195 pays',
              detail: 'Capitales, langues, monnaies et faits marquants.',
            },
            {
              to: '/savoir',
              titre: 'Bibliothèque du savoir',
              detail: 'Cinquante et un sujets, des empires africains à la physique quantique.',
            },
            {
              to: '/quiz',
              titre: 'Quiz de culture générale',
              detail: '464 questions, neuf domaines, six modes de jeu.',
            },
          ].map((entree) => (
            <li key={entree.to} className="border-b border-ardoise">
              <Link
                to={entree.to}
                className="flex min-h-16 flex-col justify-center gap-1 py-4 transition-colors hover:bg-graphite sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <span className="text-t3 text-craie">{entree.titre}</span>
                <span className="text-petit text-texte">{entree.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Méthode ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="mesure-texte text-petit text-texte">
          L’estimation repose sur un modèle de réponse à l’item à trois paramètres, sur une
          banque de {TAILLE_BANQUE} questions. Ce n’est pas un diagnostic psychologique et
          cela ne remplace pas un bilan conduit par un psychologue.
        </p>
      </section>
    </>
  );
}

/**
 * Une promesse du hero.
 *
 * Séparée de sa voisine par un filet, pas par une bordure de carte : la hiérarchie
 * vient de l'espace et d'un trait, jamais d'un panneau posé sur le fond.
 */
function Promesse({
  titre,
  premier = false,
  children,
}: {
  titre: string;
  premier?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        premier
          ? 'sm:pr-8'
          : 'border-t border-ardoise pt-10 sm:border-l sm:border-t-0 sm:pl-8 sm:pr-8 sm:pt-0'
      }
    >
      <h3 className="text-t3 text-craie">{titre}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default memo(HomePage);
