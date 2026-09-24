/**
 * Mesure le temps de passage d'un onglet à l'autre.
 *
 * ── Ce qui est mesuré, exactement ──
 *
 * Le temps entre le clic sur un lien d'onglet et le moment où le contenu de la
 * page demandée est réellement peint — pas le changement d'URL, qui est
 * instantané avec un routeur côté client et ne dit donc rien de ce que la
 * personne voit.
 *
 * Le repère de fin est le titre de niveau 1 de la page cible, relevé après une
 * image de rendu. Tant qu'un squelette de chargement est affiché, le titre n'est
 * pas là : le chronomètre continue de tourner, ce qui est bien le but.
 *
 * ── Les trois scénarios ──
 *
 * Un seul chiffre ne veut rien dire ici, parce que le coût change complètement
 * selon ce qui est déjà téléchargé. Trois situations distinctes sont donc
 * mesurées, chacune trois fois, médiane retenue :
 *
 *   1. CLIC IMMÉDIAT : on clique dès la fin du chargement de l'accueil. Le
 *      module de la page cible n'est pas là, et le préchargement au repos n'a
 *      pas encore eu le temps de commencer. C'est le pire cas, et c'est celui
 *      qui mesure l'aller-retour réseau du module.
 *   2. APRÈS UN REPOS : on attend quelques secondes sur l'accueil avant de
 *      cliquer, comme quelqu'un qui lit le premier écran. C'est le cas le plus
 *      courant, et celui où le préchargement au repos doit se voir.
 *   3. ONGLET REVISITÉ : le module est en cache navigateur. Ne reste que le
 *      montage du composant et les requêtes de données que la page relance à
 *      chaque affichage. Un écart important ici désigne du travail refait —
 *      grille entière remise en page, donnée redemandée.
 *
 * La distinction guide le correctif : le scénario 1 se traite en préchargeant
 * sur l'intention, le 2 en préchargeant au repos, le 3 en évitant le travail
 * inutile au montage.
 *
 * La répétition n'est pas un luxe. Une première version mesurait chaque
 * scénario une seule fois et donnait 440 puis 870 ms pour la même page sans
 * qu'aucun code n'ait changé — les images de drapeaux viennent d'un CDN
 * externe, et le réseau bridé rend la variance considérable.
 *
 * ── Bridage ──
 *
 * Sans bridage, tout est rapide sur une machine de développement servant du
 * localhost, et la mesure ne dit rien. Le profil par défaut applique une
 * latence et un débit de type 4G médiocre, plus un ralentissement du processeur,
 * parce que c'est là que le problème se voit.
 *
 * Usage : node scripts/mesure-navigation.mjs [url] [--rapide] [--json <fichier>]
 */

import { launch } from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';

const arguments_ = process.argv.slice(2);
const BASE = arguments_.find((a) => a.startsWith('http')) ?? 'http://localhost:4173';
const SANS_BRIDAGE = arguments_.includes('--rapide');
const iJson = arguments_.indexOf('--json');
const FICHIER_JSON = iJson !== -1 ? arguments_[iJson + 1] : null;

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');

/** 4G médiocre : ce que vit la majorité des visiteurs mobiles. */
const RESEAU = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};
const RALENTI_CPU = 4;

/** Les onglets de la barre de navigation, dans l'ordre où ils y figurent. */
const ONGLETS = [
  { chemin: '/evaluation', nom: 'Évaluation' },
  { chemin: '/classement', nom: 'Classement' },
  { chemin: '/savoir', nom: 'Savoir' },
  { chemin: '/pays', nom: 'Pays' },
  { chemin: '/quiz', nom: 'Quiz' },
];

/** Nombre de passages mesurés, pour lisser le bruit. */
const PASSES_CHAUD = 3;
const PASSES_FROID = 5;

/**
 * Attente avant le clic, dans le scénario « après un temps mort », en ms.
 *
 * Doit dépasser le délai de préchargement au repos (1,2 s) plus le temps de
 * téléchargement des modules sur le réseau bridé. Quatre secondes suffisent et
 * correspondent à un cas courant : quelqu'un arrive sur l'accueil, lit le
 * premier écran, puis choisit un onglet.
 */
const REPOS_MS = 4000;

const navigateur = await launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

/**
 * Navigue en cliquant réellement le lien, et chronomètre jusqu'au titre peint.
 *
 * Le clic passe par le lien de la barre de navigation plutôt que par
 * `page.goto`, sans quoi on mesurerait un rechargement complet de
 * l'application et non un changement d'onglet.
 *
 * Sous 1024 px, les onglets sont derrière le bouton de menu. Il est ouvert
 * AVANT de démarrer le chronomètre : on mesure le passage d'un onglet à
 * l'autre, pas le dépliage du menu. Cette tape supplémentaire est réelle et
 * signalée dans le rapport, mais elle ne relève pas de la vitesse de rendu.
 */
async function mesurerPassage(page, chemin) {
  return page.evaluate(async (cible) => {
    function trouverLien() {
      return [...document.querySelectorAll('header a[href], footer a[href]')].find(
        (a) => new URL(a.href).pathname === cible
      );
    }

    let lien = trouverLien();
    if (!lien) {
      // Menu replié : on le déplie, hors chronomètre.
      const bouton = document.querySelector('header button[aria-controls="menu-mobile"]');
      if (bouton && bouton.getAttribute('aria-expanded') !== 'true') {
        bouton.click();
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        lien = trouverLien();
      }
    }
    if (!lien) return { erreur: 'lien introuvable' };

    /**
     * Titre de la page qu'on QUITTE.
     *
     * Il faut le relever avant le clic. Le routeur change l'URL immédiatement,
     * alors que React n'a pas encore rendu la nouvelle page : le titre de
     * l'ancienne est toujours dans le document. Une première version de ce
     * script s'arrêtait dès que l'URL correspondait et trouvait ce titre-là.
     * Elle annonçait donc 9 à 40 ms pour des passages qui en prennent mille —
     * elle mesurait `history.pushState`, pas l'affichage.
     */
    const titreAvant = document.querySelector('main h1')?.textContent?.trim() ?? '';

    const depart = performance.now();
    lien.click();

    // Attend que le titre de la page CIBLE soit peint, avec une limite.
    const LIMITE = 25000;
    let titre = null;
    while (performance.now() - depart < LIMITE) {
      await new Promise((r) => requestAnimationFrame(() => r()));
      if (location.pathname !== cible) continue;
      const texte = document.querySelector('main h1')?.textContent?.trim() ?? '';
      if (texte.length > 0 && texte !== titreAvant) {
        titre = texte;
        break;
      }
    }

    return titre === null
      ? { erreur: 'titre jamais peint' }
      : { ms: Math.round(performance.now() - depart), titre: titre.slice(0, 40) };
  }, chemin);
}

/**
 * Deux formats : téléphone (onglets sous le menu) et bureau (onglets visibles).
 *
 * `hasTouch` n'est pas un détail de confort. L'application choisit le rendu du
 * robot d'accueil sur `pointer: coarse` : en tactile elle sert une image fixe,
 * sinon elle charge la scène three.js — 916 ko. Sans `hasTouch`, le profil
 * « téléphone » téléchargeait donc près d'un mégaoctet qu'aucun vrai téléphone
 * ne demande, ce qui saturait le lien bridé pendant plusieurs secondes et
 * rendait les mesures à la fois pessimistes et très instables : jusqu'à 200 ms
 * d'écart entre deux exécutions d'un code identique.
 */
const BUREAU = process.argv.includes('--bureau');
const FORMAT = BUREAU
  ? {
      nom: 'bureau 1280',
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    }
  : {
      nom: 'telephone 390',
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    };

async function preparerPage() {
  const page = await navigateur.newPage();
  await page.setViewport({
    width: FORMAT.width,
    height: FORMAT.height,
    deviceScaleFactor: FORMAT.deviceScaleFactor,
    isMobile: FORMAT.isMobile,
    hasTouch: FORMAT.hasTouch,
  });
  const session = await page.createCDPSession();
  if (!SANS_BRIDAGE) {
    await session.send('Network.emulateNetworkConditions', RESEAU);
    await session.send('Emulation.setCPUThrottlingRate', { rate: RALENTI_CPU });
  }
  return page;
}

const resultats = [];

try {
  console.log(`Format : ${FORMAT.nom}.`);
  console.log(
    SANS_BRIDAGE
      ? 'Sans bridage (mesure indicative seulement).'
      : `Bride : 4G ${Math.round((RESEAU.downloadThroughput * 8) / 1024 / 1024)} Mb/s, ${RESEAU.latency} ms de latence, processeur x${RALENTI_CPU}.`
  );
  console.log('');

  /* ── Scenarios sur page neuve ─────────────────────────────────────────
     Chacun part d'un onglet du navigateur neuf, cache vide, et est repete
     PASSES_FROID fois : une mesure unique sur un reseau bride et des images
     servies par un CDN externe varie trop pour conclure. La mediane est
     retenue. */

  for (const scenario of [
    {
      cle: 'froid',
      titre: 'Clic immediat apres le chargement (pire cas)',
      attente: 0,
    },
    {
      cle: 'repos',
      titre: `Clic apres ${REPOS_MS / 1000} s sur la page d'accueil (cas courant)`,
      attente: REPOS_MS,
    },
  ]) {
    console.log(`── ${scenario.titre} ──`);

    for (const onglet of ONGLETS) {
      const temps = [];
      let derniereErreur = null;
      let dernierTitre = null;

      for (let i = 0; i < PASSES_FROID; i++) {
        const page = await preparerPage();
        await page.goto(BASE, { waitUntil: 'networkidle2' });
        if (scenario.attente > 0) {
          await new Promise((r) => setTimeout(r, scenario.attente));
        }
        const mesure = await mesurerPassage(page, onglet.chemin);
        if (mesure.erreur) derniereErreur = mesure.erreur;
        else {
          temps.push(mesure.ms);
          dernierTitre = mesure.titre;
        }
        await page.close();
      }

      let entree = resultats.find((r) => r.onglet === onglet.nom);
      if (!entree) {
        entree = { onglet: onglet.nom };
        resultats.push(entree);
      }

      if (temps.length === 0) {
        console.log(`  ${onglet.nom.padEnd(12)} ECHEC : ${derniereErreur}`);
        entree[scenario.cle] = null;
        entree.erreur = derniereErreur;
        continue;
      }

      temps.sort((a, b) => a - b);
      const median = temps[temps.length >> 1];
      entree[scenario.cle] = median;
      entree[scenario.cle + 'Tous'] = temps;
      console.log(
        `  ${onglet.nom.padEnd(12)} ${String(median).padStart(5)} ms   (${temps.join(', ')})   -> ${dernierTitre}`
      );
    }
    console.log('');
  }

  /* ── À chaud : tout est en cache, on fait des allers-retours ───────────── */

  console.log('');
  console.log('── Retours sur un onglet deja visite (module en cache) ──');

  const page = await preparerPage();
  await page.goto(BASE, { waitUntil: 'networkidle2' });

  // Premier tour, non mesuré : il remplit le cache de modules.
  for (const onglet of ONGLETS) {
    await mesurerPassage(page, onglet.chemin);
    await mesurerPassage(page, '/');
  }

  for (const onglet of ONGLETS) {
    const temps = [];
    for (let i = 0; i < PASSES_CHAUD; i++) {
      await mesurerPassage(page, '/');
      const mesure = await mesurerPassage(page, onglet.chemin);
      if (mesure.ms !== undefined) temps.push(mesure.ms);
    }
    const entree = resultats.find((r) => r.onglet === onglet.nom);
    if (temps.length === 0) {
      console.log(`  ${onglet.nom.padEnd(12)} ECHEC`);
      continue;
    }
    temps.sort((a, b) => a - b);
    const median = temps[temps.length >> 1];
    if (entree) {
      entree.chaud = median;
      entree.chaudTous = temps;
    }
    console.log(
      `  ${onglet.nom.padEnd(12)} ${String(median).padStart(5)} ms   (${temps.join(', ')})`
    );
  }
  await page.close();

  /* ── Synthèse ─────────────────────────────────────────────────────────── */

  const froids = resultats.map((r) => r.froid).filter((n) => typeof n === 'number');
  const repos = resultats.map((r) => r.repos).filter((n) => typeof n === 'number');
  const chauds = resultats.map((r) => r.chaud).filter((n) => typeof n === 'number');
  const moyenne = (t) => (t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null);
  const pire = (t) => (t.length ? Math.max(...t) : null);

  console.log('');
  console.log(`Clic immediat   : ${moyenne(froids)} ms de moyenne   (pire : ${pire(froids)} ms)`);
  console.log(`Apres un repos  : ${moyenne(repos)} ms de moyenne   (pire : ${pire(repos)} ms)`);
  console.log(`Onglet revisite : ${moyenne(chauds)} ms de moyenne   (pire : ${pire(chauds)} ms)`);

  if (FICHIER_JSON) {
    writeFileSync(
      FICHIER_JSON,
      JSON.stringify(
        { base: BASE, format: FORMAT.nom, bride: !SANS_BRIDAGE, onglets: resultats, moyenneFroid: moyenne(froids), moyenneRepos: moyenne(repos), moyenneChaud: moyenne(chauds) },
        null,
        1
      ),
      'utf8'
    );
    console.log(`Mesures ecrites dans ${FICHIER_JSON}`);
  }
} finally {
  await navigateur.close();
}
