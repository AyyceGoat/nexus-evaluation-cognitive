import type { SectionArticle } from '../../data/savoir/types.ts';
import { versTexte } from './normaliser.ts';

/**
 * Découpage d'un article en segments à synthétiser.
 *
 * ── Pourquoi un segment par paragraphe, et pas l'article d'un bloc ──
 *
 * Pour surligner le passage en cours, il faut savoir à quelle seconde chaque
 * paragraphe commence. Deux voies existaient :
 *
 *   - envoyer l'article entier, puis retrouver les paragraphes dans les repères
 *     de mots renvoyés par le moteur. C'est un alignement, donc c'est
 *     approximatif : les repères regroupent parfois deux mots, et le
 *     normaliseur réécrit certains mots — « XVIᵉ » devient « seizième » — si
 *     bien qu'une correspondance mot à mot avec le texte affiché n'existe pas ;
 *   - envoyer un segment par paragraphe et cumuler les durées. Le décalage est
 *     alors exact par construction, puisque c'est nous qui découpons.
 *
 * C'est la seconde qui est retenue. Elle coûte plus de requêtes — un millier
 * par voix au lieu de cinquante — mais elles sont gratuites, et le surlignage
 * ne peut pas dériver.
 *
 * ── Le titre de section est un segment à part ──
 *
 * Il est lu comme un jalon, après le silence que crée la fin du segment
 * précédent. C'est ainsi que procède un livre audio pour un titre de chapitre,
 * et cela évite la solution mécanique — « premièrement », « deuxièmement » —
 * qui s'entend comme une énumération au troisième emploi.
 *
 * Un point final lui est ajouté s'il n'en a pas : sans ponctuation terminale,
 * le moteur enchaîne sans la chute de voix qui signale une fin.
 */

export type TypeSegment = 'intro' | 'titre' | 'paragraphe';

export interface SegmentNarration {
  type: TypeSegment;
  /** Rang de la section dans l'article. `-1` pour l'introduction. */
  section: number;
  /** Rang du paragraphe dans sa section. `-1` pour l'introduction et les titres. */
  paragraphe: number;
  /** Texte envoyé au moteur, déjà préparé pour l'oral. */
  dit: string;
  /** Texte tel qu'il paraît à l'écran, pour le surlignage. */
  affiche: string;
}

/** Ajoute un point final à un titre qui n'en a pas. */
function ponctuer(titre: string): string {
  return /[.!?]$/.test(titre.trim()) ? titre.trim() : `${titre.trim()}.`;
}

/**
 * Construit la liste ordonnée des segments d'un article.
 *
 * L'introduction est facultative dans la signature mais pas dans l'usage :
 * `scripts/genere-audio.mjs` refuse un article qui n'en a pas, plutôt que d'en
 * fabriquer une par gabarit.
 */
export function construireNarration(
  sections: readonly SectionArticle[],
  introduction?: string
): SegmentNarration[] {
  const segments: SegmentNarration[] = [];

  if (introduction && introduction.trim().length > 0) {
    segments.push({
      type: 'intro',
      section: -1,
      paragraphe: -1,
      dit: versTexte(introduction),
      affiche: introduction,
    });
  }

  for (const [rangSection, section] of sections.entries()) {
    segments.push({
      type: 'titre',
      section: rangSection,
      paragraphe: -1,
      dit: versTexte(ponctuer(section.titre)),
      affiche: section.titre,
    });

    for (const [rangParagraphe, paragraphe] of section.paragraphes.entries()) {
      segments.push({
        type: 'paragraphe',
        section: rangSection,
        paragraphe: rangParagraphe,
        dit: versTexte(paragraphe),
        affiche: paragraphe,
      });
    }
  }

  return segments;
}

/** Nombre de caractères effectivement envoyés au moteur. */
export function signesDits(segments: readonly SegmentNarration[]): number {
  return segments.reduce((n, s) => n + s.dit.length, 0);
}
