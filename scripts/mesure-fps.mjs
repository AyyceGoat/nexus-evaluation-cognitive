/**
 * Mesure le nombre d'images par seconde réellement rendues par la scène 3D.
 *
 * ── Ce que ce script mesure, et pourquoi la première version était fausse ──
 *
 * La première version comptait les appels à `gl.clear()`, en supposant un par image.
 * C'était faux : avec une carte d'ombres, three.js efface DEUX fois par image, une
 * passe par cible de rendu. La mesure annonçait donc 24 images/s là où la scène en
 * rendait 12, et retirer les ombres a fait « chuter » le chiffre à 13 alors que le
 * rendu s'était amélioré.
 *
 * On mesure désormais la cadence de `requestAnimationFrame`, qui est celle que l'œil
 * perçoit : quand le travail graphique ne suit pas, le navigateur espace ses images.
 * Le compte d'effacements reste affiché, à titre indicatif, avec son nombre de passes.
 *
 * Deux profils :
 *   - bureau    : 1440 x 900, sans bridage
 *   - téléphone : 390 x 844, dpr 3, tactile, processeur bridé 4x
 *
 * Réserve à connaître : ce navigateur rend en logiciel (SwiftShader), pas sur un GPU
 * de téléphone. Les chiffres du profil téléphone disent si le FIL PRINCIPAL suit, pas
 * ce que ferait un vrai appareil. C'est précisément pourquoi la 3D est désactivée sur
 * tactile plutôt que réglée au jugé.
 *
 * Usage : node scripts/mesure-fps.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const DUREE_MS = 4000;

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');

const PROFILS = [
  {
    nom: 'bureau',
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    bridageCpu: 1,
    tactile: false,
  },
  {
    nom: 'téléphone',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    bridageCpu: 4,
    tactile: true,
  },
];

const navigateur = await launch({
  executablePath: chrome,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
  ],
});

const resultats = [];

for (const profil of PROFILS) {
  const page = await navigateur.newPage();
  await page.setViewport(profil.viewport);

  // L'instrumentation doit être en place AVANT que la scène se monte.
  await page.evaluateOnNewDocument(() => {
    window.__effacements = 0;
    window.__images = 0;
    window.__compte = false;

    for (const proto of [
      window.WebGLRenderingContext?.prototype,
      window.WebGL2RenderingContext?.prototype,
    ]) {
      if (!proto) continue;
      const original = proto.clear;
      proto.clear = function (...args) {
        window.__effacements++;
        return original.apply(this, args);
      };
    }

    // Cadence réellement perçue : une itération par image présentée.
    const boucle = () => {
      if (window.__compte) window.__images++;
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  });

  const session = await page.createCDPSession();
  if (profil.bridageCpu > 1) {
    await session.send('Emulation.setCPUThrottlingRate', { rate: profil.bridageCpu });
  }

  // Attente explicite plutot que silence reseau : l'application garde des minuteurs
  // actifs (chargement differe de l'authentification, montage du canvas), donc le
  // reseau ne se taît pas dans le delai par defaut.
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Le canvas n'est monté qu'à la première interaction : on la produit.
  if (profil.tactile) {
    await page.touchscreen.tap(200, 400).catch(() => {});
  } else {
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(500 + i * 40, 400 + i * 15);
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  const canvas = await page
    .waitForSelector('canvas', { timeout: 12000 })
    .then(() => true)
    .catch(() => false);

  if (!canvas) {
    resultats.push({ ...profil, canvas: false, images: 0, fps: 0 });
    console.log(`${profil.nom.padEnd(10)} : aucun canvas — repli statique servi`);
    await page.close();
    continue;
  }

  // Remise à zéro après le montage, pour ne pas compter le premier rendu.
  await page.evaluate(() => {
    window.__images = 0;
    window.__effacements = 0;
    window.__compte = true;
  });

  const debut = Date.now();
  // Mouvement continu : c'est la condition d'usage, et elle force le suivi.
  const fin = debut + DUREE_MS;
  let i = 0;
  while (Date.now() < fin) {
    const x = 400 + Math.sin(i / 6) * 260;
    const y = 400 + Math.cos(i / 9) * 140;
    if (profil.tactile) {
      await page.touchscreen.tap(Math.round(x), Math.round(y)).catch(() => {});
    } else {
      await page.mouse.move(x, y);
    }
    i++;
    await new Promise((r) => setTimeout(r, 16));
  }
  const ecoule = Date.now() - debut;

  const { images, effacements } = await page.evaluate(() => ({
    images: window.__images,
    effacements: window.__effacements,
  }));
  const fps = (images / ecoule) * 1000;
  const passes = images > 0 ? effacements / images : 0;

  resultats.push({ ...profil, canvas: true, images, fps });
  console.log(
    `${profil.nom.padEnd(10)} : ${fps.toFixed(1)} images/s ` +
      `(${images} images en ${ecoule} ms, ${passes.toFixed(1)} passe(s) de rendu par image)` +
      (profil.bridageCpu > 1 ? `  — processeur bridé ${profil.bridageCpu}x` : '')
  );

  await page.close();
}

await navigateur.close();

console.log('');
const bureau = resultats.find((r) => r.nom === 'bureau');
const mobile = resultats.find((r) => r.nom === 'téléphone');

let echecs = 0;
if (bureau?.canvas) {
  const ok = bureau.fps >= 50;
  console.log(`bureau    : ${bureau.fps.toFixed(1)} images/s`);
  if (ok) {
    console.log('            au-dessus de 50 : conforme.');
  } else {
    console.log('            SOUS 50.');
    console.log('            Réserve : ce navigateur rend en logiciel (SwiftShader), pas');
    console.log('            sur un GPU. Ce chiffre est un plancher, pas un verdict.');
    console.log('            La franchise du suivi, elle, est prouvée sans matériel par le');
    console.log('            temps de stabilisation du ressort, mesuré dans');
    console.log('            src/components/robot/__tests__/ressort.test.ts.');
  }
} else {
  console.log('bureau    : ECHEC — la scène 3D devrait être servie sur bureau');
  echecs++;
}

if (mobile?.canvas) {
  console.log(
    'téléphone : un canvas est servi sur tactile. Décision attendue : repli statique.'
  );
  echecs++;
} else {
  console.log('téléphone : OK — repli statique, aucune boucle de rendu');
}

process.exit(echecs > 0 ? 1 : 0);
