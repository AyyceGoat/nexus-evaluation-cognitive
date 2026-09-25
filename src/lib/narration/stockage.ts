import { VOIX_PAR_DEFAUT, voixConnue } from './voix.ts';

/**
 * Accès aux fichiers de narration, et mémoire des réglages.
 *
 * ── Où vit l'audio ──
 *
 * Dans Supabase Storage, bucket `narration`, lecture publique. Ni dans Git, ni
 * dans le déploiement : 281 Mo pour trois voix resteraient définitivement dans
 * l'historique d'un dépôt public, et alourdiraient chaque déploiement de
 * prévisualisation.
 *
 * Deux dossiers : `audio/` pour les MP3, `sync/` pour les repères de
 * synchronisation. La séparation vient d'une contrainte de l'outil de dépôt,
 * qui fixe un seul type MIME par commande, et elle se révèle commode à la
 * lecture.
 *
 * ── Un mot sur le cache ──
 *
 * Les objets sont servis avec `no-cache`, et non avec le cache immuable d'un an
 * qui conviendrait : le drapeau de la CLI de dépôt n'atteint pas le service.
 * Vérifié plutôt que supposé, la conséquence est modeste — `no-cache` autorise
 * la revalidation, et une seconde écoute renvoie un 304 sans un seul octet de
 * corps. Les requêtes de plage fonctionnent aussi, ce dont le déplacement dans
 * la lecture a besoin. Le coût réel est donc un aller-retour, pas un
 * téléchargement.
 */

/** Racine publique du bucket, dérivée de l'URL du projet. */
function racine(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) return null;
  return `${String(url).replace(/\/+$/, '')}/storage/v1/object/public/narration`;
}

/** URL du MP3 d'un article dans une voix donnée. `null` si non configuré. */
export function urlAudio(sujetId: string, voixId: string): string | null {
  const base = racine();
  return base ? `${base}/audio/${sujetId}-${voixId}.mp3` : null;
}

/** URL des repères de synchronisation. `null` si non configuré. */
export function urlSynchronisation(sujetId: string, voixId: string): string | null {
  const base = racine();
  return base ? `${base}/sync/${sujetId}-${voixId}.json` : null;
}

/* ── Forme des repères ────────────────────────────────────────────────── */

export interface SegmentAudio {
  type: 'intro' | 'titre' | 'paragraphe';
  /** Rang de la section. `-1` pour l'introduction. */
  section: number;
  /** Rang du paragraphe dans sa section. `-1` pour l'introduction et les titres. */
  paragraphe: number;
  affiche: string;
  /** Début dans le fichier complet, en secondes. */
  debut: number;
  duree: number;
}

export interface Narration {
  article: string;
  titre: string;
  voix: string;
  duree: number;
  segments: SegmentAudio[];
}

/**
 * Charge les repères d'un article, avec cache en mémoire.
 *
 * Le fichier pèse une centaine de kilo-octets : le recharger à chaque montage
 * de l'écran serait inutile, et changer de voix puis revenir est un geste
 * courant.
 */
const enMemoire = new Map<string, Narration>();

export async function chargerNarration(
  sujetId: string,
  voixId: string
): Promise<Narration | null> {
  const cle = `${sujetId}|${voixId}`;
  const deja = enMemoire.get(cle);
  if (deja) return deja;

  const url = urlSynchronisation(sujetId, voixId);
  if (!url) return null;

  const reponse = await fetch(url);
  if (!reponse.ok) return null;

  const donnees = (await reponse.json()) as Narration;
  if (!Array.isArray(donnees.segments) || donnees.segments.length === 0) return null;

  enMemoire.set(cle, donnees);
  return donnees;
}

/* ── Réglages conservés ───────────────────────────────────────────────── */

const CLE_VOIX = 'nexus.narration.voix';
const PREFIXE_POSITION = 'nexus.narration.position.';

/**
 * Toute lecture et toute écriture sont protégées.
 *
 * Le stockage local lève en navigation privée sur certains navigateurs, et
 * peut être vidé ou bloqué. Un réglage perdu doit dégrader l'expérience, pas
 * empêcher l'écoute : en cas d'échec, on retombe sur la voix par défaut et sur
 * le début de l'article.
 */
export function lireVoix(): string {
  try {
    const gardee = window.localStorage.getItem(CLE_VOIX);
    return voixConnue(gardee) ? (gardee as string) : VOIX_PAR_DEFAUT;
  } catch {
    return VOIX_PAR_DEFAUT;
  }
}

export function ecrireVoix(voixId: string): void {
  try {
    window.localStorage.setItem(CLE_VOIX, voixId);
  } catch {
    // Sans mémoire, le choix vaut pour la session en cours. C'est acceptable.
  }
}

/**
 * Position de reprise d'un article.
 *
 * Elle n'est pas rangée par voix : quelqu'un qui change de voix au milieu d'un
 * article veut reprendre où il en était, pas au début. Les fichiers des trois
 * voix suivent le même découpage, donc la position reste pertinente à quelques
 * secondes près.
 */
export function lirePosition(sujetId: string): number {
  try {
    const brut = window.localStorage.getItem(PREFIXE_POSITION + sujetId);
    const valeur = brut === null ? Number.NaN : Number.parseFloat(brut);
    return Number.isFinite(valeur) && valeur > 0 ? valeur : 0;
  } catch {
    return 0;
  }
}

export function ecrirePosition(sujetId: string, secondes: number): void {
  try {
    // Sous deux secondes, on considère qu'il n'y a rien à reprendre : garder la
    // position ferait proposer une reprise à quelqu'un qui vient de commencer.
    if (secondes < 2) window.localStorage.removeItem(PREFIXE_POSITION + sujetId);
    else window.localStorage.setItem(PREFIXE_POSITION + sujetId, secondes.toFixed(1));
  } catch {
    // Sans mémoire, pas de reprise. L'écoute fonctionne quand même.
  }
}

export function oublierPosition(sujetId: string): void {
  try {
    window.localStorage.removeItem(PREFIXE_POSITION + sujetId);
  } catch {
    // Rien à faire.
  }
}

/** Rang du segment contenant un instant donné. `-1` avant le premier. */
export function segmentA(segments: readonly SegmentAudio[], instant: number): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (instant >= segments[i].debut) return i;
  }
  return -1;
}
