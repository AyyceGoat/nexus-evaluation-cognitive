import type { ScaledScore } from '../../lib/iq/types';
import { cn } from '../ui/cn';

interface IntervalBarProps {
  scaled: ScaledScore;
  /** Bornes de l'axe. Par défaut 55–145, soit ±3 écarts-types. */
  min?: number;
  max?: number;
  className?: string;
}

/**
 * L'indice et son intervalle de confiance, côte à côte.
 *
 * C'est la signature visuelle du produit : partout où un chiffre est avancé, la barre
 * d'incertitude est dessinée juste à côté, dans la seule couleur de la page. L'intervalle
 * n'est ni en petit, ni en gris, ni relégué en note de bas de bloc — cf. DESIGN.md §3.3.
 */
export function IntervalBar({ scaled, min = 55, max = 145, className }: IntervalBarProps) {
  const etendue = max - min;
  const pct = (valeur: number) => ((Math.min(max, Math.max(min, valeur)) - min) / etendue) * 100;

  const gauche = pct(scaled.lower95);
  const droite = pct(scaled.upper95);
  const point = pct(scaled.point);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p className="nombres font-titre text-indice leading-none text-craie">{scaled.point}</p>
        <p className="nombres text-corps text-mesure">
          {scaled.lower95} – {scaled.upper95}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* La barre est une image de la mesure, pas une décoration : elle est donc
            décrite aux lecteurs d'écran, qui n'ont pas accès au tracé. */}
        <div
          className="relative h-6"
          role="img"
          aria-label={`Indice estimé ${scaled.point}, intervalle de confiance à 95 % de ${scaled.lower95} à ${scaled.upper95}`}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ardoise" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-0 bg-mesure/35"
            style={{ left: `${gauche}%`, width: `${Math.max(0.5, droite - gauche)}%` }}
          />
          <div
            className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-mesure"
            style={{ left: `${point}%` }}
          />
        </div>

        <div className="nombres flex justify-between text-micro text-brume">
          <span>{min}</span>
          <span>100</span>
          <span>{max}</span>
        </div>
      </div>

      <p className="text-micro text-brume">
        La barre est la plage dans laquelle se situe le résultat ; le trait, la valeur la
        plus probable. Intervalle de confiance à 95 % : la marge fait partie du résultat.
      </p>
    </div>
  );
}
