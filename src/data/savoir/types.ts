/**
 * Articles du Savoir : le modèle à deux niveaux.
 *
 * ── Ce qui existait, et pourquoi il fallait le changer ──
 *
 * Chaque sujet portait un `summary` d'environ 180 signes et un `content` d'environ
 * 660 signes — une centaine de mots — rendu d'un bloc sous un onglet intitulé
 * « Article complet ». Mesuré sur les 50 sujets : médiane 661 signes, maximum 915.
 * L'onglet promettait un article et servait un second résumé, un peu plus long que
 * le premier. Quelqu'un qui ouvre un sujet veut apprendre quelque chose.
 *
 * ── Le modèle ──
 *
 * Deux niveaux distincts, avec deux fonctions distinctes :
 *
 *   - le RÉSUMÉ, porté par les métadonnées du sujet, sert à décider si on lit ;
 *   - l'ARTICLE, ici, est le produit : contexte, déroulé daté, personnages,
 *     conséquences, et ce que le sujet change pour qui le comprend.
 *
 * L'article est découpé en sections titrées, pas livré d'un bloc, pour qu'on
 * puisse le parcourir avant de le lire — l'écran en tire un sommaire.
 *
 * ── Pourquoi des paragraphes en tableau plutôt qu'une chaîne ──
 *
 * L'ancien champ reposait sur `whitespace-pre-line` : la mise en forme dépendait
 * de sauts de ligne invisibles dans la donnée, qu'une reformulation pouvait
 * effacer sans que rien ne le signale. Un tableau de paragraphes rend la
 * structure explicite et vérifiable — `scripts/verifie-savoir.mjs` compte les
 * sections et les paragraphes, ce qu'on ne peut pas faire sur un bloc de texte.
 */

/** Une section titrée de l'article. */
export interface SectionArticle {
  /** Titre de section, tel qu'il paraît dans le sommaire. */
  titre: string;
  /** Paragraphes, dans l'ordre. Un paragraphe par élément, sans balisage. */
  paragraphes: string[];
}

/**
 * Un article complet : les sections dans l'ordre de lecture.
 *
 * Indexé par l'identifiant du sujet, celui de `extendedKnowledgeItems`.
 */
export type ArticlesDuDomaine = Record<string, SectionArticle[]>;

/** Vitesse de lecture retenue pour l'estimation, en mots par minute. */
export const MOTS_PAR_MINUTE = 200;

/**
 * Compte les mots d'un article.
 *
 * Sert à deux choses : l'estimation du temps de lecture affichée sur les cartes,
 * et le contrôle de `scripts/verifie-savoir.mjs`. Les deux appellent cette
 * fonction, donc le chiffre affiché et le chiffre vérifié ne peuvent pas diverger.
 */
export function compterMots(sections: SectionArticle[]): number {
  let total = 0;
  for (const section of sections) {
    for (const paragraphe of section.paragraphes) {
      const mots = paragraphe.trim().split(/\s+/).filter(Boolean);
      total += mots.length;
    }
  }
  return total;
}

/** Minutes de lecture, arrondies au supérieur, au moins une. */
export function minutesDeLecture(sections: SectionArticle[]): number {
  return Math.max(1, Math.round(compterMots(sections) / MOTS_PAR_MINUTE));
}
