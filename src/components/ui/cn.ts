import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Fusionne des listes de classes en laissant la dernière gagner sur les conflits.
 *
 * ── Pourquoi `extendTailwindMerge` et non `twMerge` tel quel ──
 *
 * `tailwind-merge` ne connaît que les échelles par défaut de Tailwind. Nos tokens
 * portent des noms maison (`text-petit`, `text-micro`, `text-mesure`…), et la
 * bibliothèque les rangeait au mauvais endroit : `text-petit` était pris pour une
 * couleur de texte et écrasait donc `text-noir`.
 *
 * Conséquence réelle, mesurée par Lighthouse et non supposée : **tous les boutons
 * principaux** rendaient du blanc cassé sur l'accent, soit un contraste de **2,17**
 * au lieu de 8,50 — un échec AA franc, sur l'élément le plus cliqué du produit. Le
 * garde-fou `scripts/verifie-tokens.mjs` ne pouvait rien voir : la classe `text-noir`
 * était bien écrite dans le source, elle disparaissait à l'exécution.
 *
 * Déclarer les deux groupes ci-dessous règle la cause, pas le symptôme.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Échelle typographique de DESIGN.md §3.2.
      'font-size': [{ text: ['display', 't1', 't2', 't3', 'corps', 'petit', 'micro'] }],
      // Palette de DESIGN.md §2.
      'text-color': [{ text: ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure', 'alerte'] }],
      'bg-color': [{ bg: ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure', 'alerte'] }],
      'border-color': [
        { border: ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure', 'alerte'] },
      ],
      rounded: [{ rounded: ['0', '1', '2', '3'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
