/**
 * Rendu statique du buste, servi quand la 3D n'est pas accordée.
 *
 * ── Pourquoi un SVG et non un WebP ──
 *
 * Le cahier des charges demandait « un rendu statique de qualité (WebP) ». Je n'ai pas
 * de navigateur dans cet environnement, donc aucun moyen de rendre la scène puis de
 * l'exporter. Produire un WebP aurait voulu dire fabriquer une image qui ne correspond
 * pas au modèle — exactement le genre d'artefact que le cahier des charges interdit
 * ailleurs.
 *
 * Un SVG répond mieux à l'intention, et pas seulement par défaut : il pèse moins de
 * 2 ko, reste net à toute densité, hérite des couleurs du thème par `currentColor`, et
 * ne déclenche aucune requête. Le jour où une capture du modèle existe, il suffira de
 * remplacer ce composant.
 *
 * Consigné dans docs/3D.md et docs/JOURNAL.md.
 */
export function PosterRobot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      className={className}
      role="img"
      aria-label="Buste robotique stylisé, de face"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* L'arête lumineuse : le seul endroit où l'accent apparaît. */}
        <linearGradient id="arete" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-mesure)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-mesure)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-mesure)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g fill="none" stroke="var(--color-ardoise)" strokeWidth="1.5">
        {/* Épaules */}
        <path d="M40 372 C 40 300, 96 268, 160 268 C 224 268, 280 300, 280 372" />
        <path d="M74 372 C 74 320, 112 300, 160 300 C 208 300, 246 320, 246 372" />

        {/* Colonne cervicale */}
        <rect x="146" y="212" width="28" height="60" rx="2" />
        <path d="M152 224 H168 M152 238 H168 M152 252 H168" />

        {/* Crâne */}
        <path d="M100 152 C 100 106, 126 84, 160 84 C 194 84, 220 106, 220 152 L 220 196 C 220 214, 196 224, 160 224 C 124 224, 100 214, 100 196 Z" />

        {/* Visière */}
        <path d="M112 140 H208 L200 178 H120 Z" fill="var(--color-noir)" />
      </g>

      {/* Regard : deux fentes, pas des yeux — un robot, pas un personnage. */}
      <g fill="var(--color-mesure)">
        <rect x="128" y="154" width="26" height="4" rx="2" opacity="0.85" />
        <rect x="166" y="154" width="26" height="4" rx="2" opacity="0.85" />
      </g>

      {/* L'arête lumineuse court sur le sommet du crâne. */}
      <path
        d="M104 122 C 118 96, 138 86, 160 86 C 182 86, 202 96, 216 122"
        fill="none"
        stroke="url(#arete)"
        strokeWidth="2"
      />

      {/* Plaques de mâchoire */}
      <g fill="none" stroke="var(--color-ardoise)" strokeWidth="1.5">
        <path d="M124 190 H196" />
        <path d="M136 204 H184" />
      </g>
    </svg>
  );
}
