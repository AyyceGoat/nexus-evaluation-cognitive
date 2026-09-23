import type { AptitudeResult } from '../../lib/iq/types';

interface AptitudeProfileProps {
  aptitudes: readonly AptitudeResult[];
  /** Aptitudes dont l'écart survit à 1,645 erreur type. */
  forces: readonly string[];
  faiblesses: readonly string[];
}

/**
 * Profil relatif par aptitude, en bandes larges. Remplace l'ancienne toile en étoile.
 *
 * Trois décisions, toutes imposées par le modèle et non par le goût :
 *
 * 1. **Aucun chiffre par aptitude.** L'erreur type mesurée par aptitude est de 0,619 sur
 *    l'échelle de θ, soit un intervalle d'environ 36 points. Un sous-score chiffré serait
 *    du bruit habillé en mesure.
 * 2. **Des bandes, pas une toile.** Une toile en étoile suggère une surface et invite à
 *    comparer des aires, ce qui amplifie visuellement des écarts non significatifs.
 * 3. **Un axe relatif.** La position est l'écart à la moyenne des aptitudes *de ce
 *    répondant*, pas une valeur absolue : c'est la seule comparaison que les données
 *    autorisent sur sept items.
 *
 * La largeur de la bande est l'incertitude. Elle est large, et c'est le message.
 */

/** Demi-étendue de l'axe, en écarts-types de θ. */
const AXE = 1.6;

export function AptitudeProfile({ aptitudes, forces, faiblesses }: AptitudeProfileProps) {
  const mesurees = aptitudes.filter((a) => a.itemCount > 0);
  if (mesurees.length === 0) return null;

  const moyenne =
    mesurees.reduce((somme, a) => somme + a.estimate.theta, 0) / mesurees.length;

  const enPourcent = (theta: number) =>
    ((Math.min(AXE, Math.max(-AXE, theta)) + AXE) / (2 * AXE)) * 100;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-t3 text-craie">Profil par aptitude</h3>
        <p className="mesure-texte text-petit text-texte">
          Chaque bande situe une aptitude par rapport à vos autres aptitudes. Sa largeur est
          la marge d’erreur, et elle est large : sept questions ne suffisent pas à départager
          finement cinq aptitudes.
        </p>
      </div>

      <ul className="flex flex-col gap-5">
        {mesurees.map((aptitude) => {
          const ecart = aptitude.estimate.theta - moyenne;
          const centre = enPourcent(ecart);
          const demiLargeur =
            (aptitude.estimate.standardError / (2 * AXE)) * 100;
          const gauche = Math.max(0, centre - demiLargeur);
          const largeur = Math.min(100 - gauche, demiLargeur * 2);

          const estForce = forces.includes(aptitude.aptitude);
          const estFaiblesse = faiblesses.includes(aptitude.aptitude);

          return (
            <li key={aptitude.aptitude} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-petit text-craie">{aptitude.label}</span>
                {estForce && <span className="text-micro text-mesure">Ressort nettement</span>}
                {estFaiblesse && (
                  <span className="text-micro text-brume">En retrait nettement</span>
                )}
              </div>

              <div
                className="relative h-8 border border-ardoise bg-graphite"
                role="img"
                aria-label={
                  estForce
                    ? `${aptitude.label} : ressort nettement par rapport à vos autres aptitudes`
                    : estFaiblesse
                      ? `${aptitude.label} : en retrait par rapport à vos autres aptitudes`
                      : `${aptitude.label} : pas d’écart significatif avec vos autres aptitudes`
                }
              >
                {/* Repère central : la moyenne des aptitudes du répondant. */}
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ardoise" />
                <div
                  className="absolute inset-y-1.5 bg-mesure/35"
                  style={{ left: `${gauche}%`, width: `${Math.max(2, largeur)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between text-micro text-brume">
        <span>Plus faible que vos autres aptitudes</span>
        <span>Plus fort</span>
      </div>

      <p className="mesure-texte border-l-2 border-ardoise pl-4 text-micro text-brume">
        Le détail par aptitude est indicatif. Seul l’indice global est estimé avec une
        précision suffisante pour être lu comme un nombre.
      </p>
    </section>
  );
}
