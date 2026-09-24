/**
 * Préchargement des modules d'onglet.
 *
 * ── Le problème mesuré ──
 *
 * `scripts/mesure-navigation.mjs`, en 4G bridée sur un téléphone à 390 px,
 * relevait sur l'état précédent :
 *
 *   premier passage sur un onglet : 263 à 442 ms, moyenne 400
 *   retour sur un onglet visité   :  35 à 712 ms
 *
 * Les 400 ms du premier passage ne sont pas du calcul : c'est l'aller-retour
 * réseau du module de la page, qui n'est demandé qu'au moment du clic. Le
 * découpage du bundle est une bonne chose — il évite de tout télécharger au
 * démarrage — mais il déplace l'attente sur le premier clic. Le préchargement
 * la supprime en demandant le module AVANT le clic.
 *
 * ── Deux déclencheurs, par ordre de valeur ──
 *
 * 1. L'INTENTION. Survol, mise au clavier, ou début d'appui tactile sur un lien
 *    d'onglet : le module part immédiatement. Un `pointerdown` précède le clic
 *    de plusieurs dizaines de millisecondes, et un survol de plusieurs
 *    centaines ; c'est autant de pris. Ce déclencheur ne gaspille presque rien,
 *    puisqu'il ne charge que ce que la personne s'apprête à ouvrir.
 *
 * 2. LE REPOS. Une fois la page d'arrivée peinte et le fil d'exécution libre,
 *    les modules des onglets sont demandés en tâche de fond.
 *
 * ── Pourquoi le repos est conditionnel ──
 *
 * Précharger les cinq onglets représente quelques centaines de kilo-octets.
 * Sur une connexion lente ou limitée, c'est de la bande passante prise à
 * quelqu'un qui n'ouvrira peut-être aucun de ces onglets. Le préchargement au
 * repos est donc écarté quand le navigateur signale une économie de données
 * demandée ou un réseau de type 2G. Le préchargement à l'intention, lui, reste
 * actif dans tous les cas : il répond à un geste.
 */

/**
 * Un chargeur par chemin d'onglet.
 *
 * Ce sont exactement les mêmes expressions d'import que celles des routes.
 * C'est ce qui fait fonctionner le mécanisme : le bundler les reconnaît comme
 * le même module, donc précharger remplit le cache que la route consommera. Un
 * chemin d'import différent créerait un second chunk et ne servirait à rien.
 */
const CHARGEURS: Record<string, Array<() => Promise<unknown>>> = {
  '/evaluation': [() => import('../components/iq/IQTestRunner')],
  '/classement': [() => import('../pages/Classement')],
  '/savoir': [() => import('../components/KnowledgeExplorer')],
  '/pays': [() => import('../components/CountriesExplorer')],
  '/quiz': [() => import('../components/QuizSection')],
};

/** Chemins déjà demandés. Un module ne se précharge qu'une fois. */
const demandes = new Set<string>();

/** Précharge le module d'un onglet. Sans effet si déjà fait. */
export function prechargerRoute(chemin: string): void {
  if (demandes.has(chemin)) return;
  const chargeurs = CHARGEURS[chemin];
  if (!chargeurs) return;

  demandes.add(chemin);
  for (const chargeur of chargeurs) {
    // L'échec est ignoré : un préchargement raté doit être silencieux, la
    // navigation réelle réessaiera et affichera l'erreur si elle persiste.
    void chargeur().catch(() => undefined);
  }
}

/** Vrai si le navigateur signale une connexion qu'il ne faut pas encombrer. */
function reseauEconome(): boolean {
  const connexion = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!connexion) return false;
  if (connexion.saveData) return true;
  return connexion.effectiveType === '2g' || connexion.effectiveType === 'slow-2g';
}

/**
 * Précharge les modules d'onglet pendant un temps mort.
 *
 * ── Ce qui a été essayé, et mesuré ──
 *
 * Trois variantes ont été comparées sur le même protocole — téléphone à 390 px,
 * 4G bridée, processeur x4, trois passes par onglet, médiane retenue. Les
 * chiffres sont les moyennes du scénario « clic après quatre secondes sur
 * l'accueil », celui que le préchargement doit améliorer :
 *
 *   sans préchargement                     707 ms
 *   `import()` sérialisé, départ à 1,2 s   389 ms   ← retenu
 *   `<link rel="prefetch">`, départ à 1,5 s  566 ms
 *   `<link rel="prefetch">`, départ à 0,4 s  763 ms
 *
 * Le résultat est contre-intuitif : `rel="prefetch"` est pourtant l'outil prévu
 * pour cet usage, programmé par le navigateur en dernière priorité. Il perd ici
 * pour une raison propre à cette application — l'accueil télécharge encore la
 * scène 3D, près d'un mégaoctet, pendant plusieurs secondes après la première
 * peinture. Sur un lien à 2 Mb/s, la priorité ne change rien au fait qu'un octet
 * préchargé est un octet qui n'arrive pas ailleurs : plus on précharge tôt, plus
 * on retarde la fin du chargement en cours. Poser les balises à 0,4 s est la
 * pire des options pour cette raison exacte.
 *
 * L'`import()` sérialisé gagne parce qu'il demande UN module, attend un temps
 * mort, puis le suivant : il s'insère dans les creux au lieu de réclamer tout
 * d'un coup.
 *
 * La variante par balises demandait un greffon Vite pour publier la liste des
 * fichiers emis — leurs noms portent une empreinte de contenu. Il a été retiré
 * avec elle : garder un greffon dont plus personne ne lit la sortie aurait été
 * du code mort déguisé en documentation.
 *
 * Rend une fonction d'annulation, pour que le composant qui l'a lancé puisse
 * arrêter la série à son démontage.
 */
export function prechargerOngletsAuRepos(): () => void {
  if (reseauEconome()) return () => undefined;

  const chemins = Object.keys(CHARGEURS);
  let index = 0;
  let annule = false;
  let minuteur = 0;

  const planifier = (rappel: () => void) => {
    const auRepos = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (auRepos) return auRepos(rappel, { timeout: 3000 });
    return window.setTimeout(rappel, 300);
  };

  const suivant = () => {
    if (annule || index >= chemins.length) return;
    prechargerRoute(chemins[index++]);
    minuteur = planifier(suivant);
  };

  // 1,2 s avant de commencer : la page d'arrivée doit avoir fini son propre
  // travail. Mesuré — commencer plus tôt dégrade ce qu'on cherche à améliorer.
  minuteur = window.setTimeout(() => planifier(suivant), 1200);

  return () => {
    annule = true;
    window.clearTimeout(minuteur);
  };
}
