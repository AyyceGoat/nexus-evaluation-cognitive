/**
 * Les voix proposées à l'écoute.
 *
 * Trois, choisies à l'oreille parmi les vingt-trois essayées : les treize voix
 * françaises du catalogue et les dix voix multilingues d'une autre langue de
 * base. Ces dernières partagent le modèle de Vivienne et de Rémy, mais leur
 * accent d'origine s'entend et fatigue sur une lecture longue.
 *
 * ── Pourquoi une description d'une ligne ──
 *
 * Une liste de prénoms ne permet pas de choisir : personne ne sait ce que
 * « Rémy » va donner avant de l'entendre. La description dit en quoi la voix
 * diffère des autres, et le bouton d'essai tranche. Les deux sont nécessaires :
 * la description oriente, l'essai décide.
 *
 * Les descriptions portent sur le timbre et l'usage, pas sur une qualité
 * supposée. Dire d'une voix qu'elle est « agréable » n'aide personne à choisir
 * entre trois voix toutes retenues pour cela.
 */

export interface VoixNarration {
  /** Identifiant du moteur, tel qu'il figure dans le nom des fichiers. */
  id: string;
  /** Prénom affiché. */
  nom: string;
  /** Une ligne : ce qui distingue cette voix des deux autres. */
  description: string;
}

/**
 * Dans l'ordre d'affichage. La première est la voix par défaut.
 *
 * L'ordre n'est pas alphabétique : il va du choix le plus sûr pour une écoute
 * longue au plus particulier.
 */
export const VOIX: readonly VoixNarration[] = [
  {
    id: 'fr-FR-VivienneMultilingualNeural',
    nom: 'Vivienne',
    description: 'Posée et chaleureuse, la plus à l’aise sur les longues lectures.',
  },
  {
    id: 'fr-FR-RemyMultilingualNeural',
    nom: 'Rémy',
    description: 'Voix masculine, naturelle et calme, au débit régulier.',
  },
  {
    id: 'fr-FR-EloiseNeural',
    nom: 'Éloïse',
    description: 'Timbre plus jeune, ton de conte.',
  },
];

export const VOIX_PAR_DEFAUT = VOIX[0].id;

/** Durée de l'essai, en secondes. La phrase d'introduction tient dedans. */
export const DUREE_ESSAI = 8;

export function voixConnue(id: string | null | undefined): boolean {
  return VOIX.some((v) => v.id === id);
}
