import type { ArticlesDuDomaine, SectionArticle } from './types';

export type { SectionArticle, ArticlesDuDomaine } from './types';
export { compterMots, minutesDeLecture, MOTS_PAR_MINUTE } from './types';

/**
 * Chargement des articles du Savoir, par domaine et à la demande.
 *
 * ── Pourquoi ce découpage ──
 *
 * Les cinquante articles représentent environ 45 000 mots. Les inclure dans le
 * module de l'écran ferait télécharger l'intégralité de la bibliothèque à qui
 * ouvre la grille des sujets, alors qu'on en lit un à la fois. Chaque domaine
 * est donc un module séparé, chargé au moment où l'on ouvre un de ses sujets —
 * soit environ un cinquième du texte, et rien du tout si l'on se contente de
 * parcourir les cartes.
 *
 * Ce n'est pas seulement une économie d'octets : c'est aussi ce qui garde
 * l'onglet Savoir rapide à l'ouverture, puisque son module d'entrée ne porte
 * plus que les métadonnées et les résumés.
 *
 * ── Pourquoi un cache ──
 *
 * Une fois un domaine chargé, ses dix articles restent en mémoire. Revenir sur
 * un sujet déjà ouvert, ou ouvrir un autre sujet du même domaine, n'entraîne
 * alors aucune attente : `articleEnMemoire` rend la donnée immédiatement et
 * l'écran s'affiche sans état de chargement. Sans ce cache, chaque retour en
 * arrière rejouerait une promesse et ferait clignoter un squelette pour une
 * donnée déjà disponible.
 */

/** Un chargeur par domaine. Les clés sont les `domainId` des sujets. */
const CHARGEURS: Record<string, () => Promise<ArticlesDuDomaine>> = {
  history_geopolitics: () => import('./histoire').then((m) => m.articlesHistoire),
  economy_finance: () => import('./economie').then((m) => m.articlesEconomie),
  science_tech: () => import('./science').then((m) => m.articlesScience),
  psychology_philosophy: () => import('./pensee').then((m) => m.articlesPensee),
  legendary_figures: () => import('./figures').then((m) => m.articlesFigures),
};

/** Domaines déjà chargés. */
const enMemoire = new Map<string, ArticlesDuDomaine>();

/** Chargements en cours, pour ne pas lancer deux fois la même requête. */
const enCours = new Map<string, Promise<ArticlesDuDomaine>>();

/** Liste des domaines pour lesquels un article existe. */
export const DOMAINES_AVEC_ARTICLES = Object.keys(CHARGEURS);

/**
 * Rend l'article s'il est déjà en mémoire, sinon `null`.
 *
 * L'écran appelle d'abord ceci : quand la réponse n'est pas nulle, il affiche
 * directement, sans passer par un état d'attente.
 */
export function articleEnMemoire(domaineId: string, sujetId: string): SectionArticle[] | null {
  return enMemoire.get(domaineId)?.[sujetId] ?? null;
}

/** Charge le domaine, puis rend l'article demandé. `null` s'il n'existe pas. */
export async function chargerArticle(
  domaineId: string,
  sujetId: string
): Promise<SectionArticle[] | null> {
  const articles = await chargerDomaine(domaineId);
  return articles?.[sujetId] ?? null;
}

/**
 * Charge un domaine entier.
 *
 * Rend `null` pour un domaine inconnu plutôt que de lever : un identifiant
 * venu d'une URL ne doit pas pouvoir casser l'écran.
 */
export async function chargerDomaine(domaineId: string): Promise<ArticlesDuDomaine | null> {
  const deja = enMemoire.get(domaineId);
  if (deja) return deja;

  const chargeur = CHARGEURS[domaineId];
  if (!chargeur) return null;

  let promesse = enCours.get(domaineId);
  if (!promesse) {
    promesse = chargeur();
    enCours.set(domaineId, promesse);
  }

  try {
    const articles = await promesse;
    enMemoire.set(domaineId, articles);
    return articles;
  } finally {
    enCours.delete(domaineId);
  }
}

/**
 * Déclenche le chargement d'un domaine sans attendre le résultat.
 *
 * Appelé quand on survole ou qu'on met au clavier une carte de sujet : le
 * module part pendant que la personne décide, et le clic trouve la donnée déjà
 * là. L'échec est volontairement ignoré — un préchargement qui rate ne doit
 * rien signaler, puisque le chargement réel réessaiera.
 */
export function prechargerDomaine(domaineId: string): void {
  if (enMemoire.has(domaineId) || enCours.has(domaineId)) return;
  void chargerDomaine(domaineId).catch(() => undefined);
}
