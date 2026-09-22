/**
 * Vérification par rendu réel, dans un navigateur.
 *
 * Chrome est installé sur cette machine : plutôt que de supposer, on ouvre les pages et
 * on mesure. Ce script vérifie ce qu'aucun typecheck ne peut voir :
 *
 *  - la page rend-elle réellement quelque chose, ou un écran blanc ;
 *  - y a-t-il un débordement horizontal, de 320 à 2560 px ;
 *  - les cibles tactiles atteignent-elles 44 px ;
 *  - le focus clavier est-il visible ;
 *  - le canvas 3D se monte-t-il, et le site tient-il sans WebGL ;
 *  - une erreur de console est-elle levée au chargement.
 *
 * Usage : node scripts/verifie-rendu.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4230';
const SORTIE = 'verification';

const CHEMINS_CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const LARGEURS = [320, 360, 414, 768, 1024, 1440, 2560];

const PAGES = [
  { chemin: '/', nom: 'accueil' },
  { chemin: '/evaluation', nom: 'evaluation' },
  { chemin: '/classement', nom: 'classement' },
  { chemin: '/inscription', nom: 'inscription' },
  { chemin: '/connexion', nom: 'connexion' },
  { chemin: '/pays', nom: 'pays' },
  { chemin: '/quiz', nom: 'quiz' },
  { chemin: '/savoir', nom: 'savoir' },
  { chemin: '/route-inexistante', nom: '404' },
];

function trouverChrome() {
  const trouve = CHEMINS_CHROME.find((chemin) => existsSync(chemin));
  if (!trouve) throw new Error('Aucun Chrome ni Edge trouvé.');
  return trouve;
}

const resultats = { rendu: [], debordements: [], cibles: [], erreurs: [], focus: null, sansWebgl: null };

const navigateur = await launch({
  executablePath: trouverChrome(),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });

  // ── Rendu et erreurs de console ────────────────────────────────────────
  for (const { chemin, nom } of PAGES) {
    const page = await navigateur.newPage();
    const erreurs = [];
    page.on('console', (message) => {
      if (message.type() === 'error') erreurs.push(message.text());
    });
    page.on('pageerror', (erreur) => erreurs.push(String(erreur)));

    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + chemin, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    const mesure = await page.evaluate(() => {
      const racine = document.getElementById('root');
      const titre = document.querySelector('h1');
      return {
        texte: (racine?.innerText ?? '').trim().length,
        h1: titre?.innerText?.trim() ?? null,
        nombreH1: document.querySelectorAll('h1').length,
        titrePage: document.title,
        boutons: document.querySelectorAll('button, a').length,
      };
    });

    resultats.rendu.push({ nom, chemin, ...mesure });
    if (erreurs.length > 0) resultats.erreurs.push({ nom, erreurs: erreurs.slice(0, 5) });

    await page.screenshot({ path: `${SORTIE}/${nom}-1280.png`, fullPage: false });
    await page.close();
  }

  // ── Débordement horizontal, de 320 à 2560 px ───────────────────────────
  for (const largeur of LARGEURS) {
    const page = await navigateur.newPage();
    await page.setViewport({ width: largeur, height: 900, deviceScaleFactor: 1 });

    for (const { chemin, nom } of PAGES) {
      await page.goto(BASE + chemin, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 400));

      const debordement = await page.evaluate(() => {
        const doc = document.documentElement;
        const coupables = [];
        for (const element of document.querySelectorAll('body *')) {
          const cadre = element.getBoundingClientRect();
          if (cadre.width > 0 && cadre.right > doc.clientWidth + 1) {
            coupables.push({
              balise: element.tagName.toLowerCase(),
              classes: String(element.className).slice(0, 80),
              depasse: Math.round(cadre.right - doc.clientWidth),
            });
          }
        }
        return {
          largeurDefilement: doc.scrollWidth,
          largeurVisible: doc.clientWidth,
          coupables: coupables.slice(0, 5),
        };
      });

      if (debordement.largeurDefilement > debordement.largeurVisible + 1) {
        resultats.debordements.push({ largeur, nom, ...debordement });
      }
    }

    if (largeur === 360) {
      await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
      await page.screenshot({ path: `${SORTIE}/accueil-360.png`, fullPage: true });
    }
    await page.close();
  }

  // ── Cibles tactiles à 360 px ───────────────────────────────────────────
  {
    const page = await navigateur.newPage();
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });

    for (const { chemin, nom } of PAGES) {
      await page.goto(BASE + chemin, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 400));

      const trop = await page.evaluate(() => {
        const petites = [];
        for (const element of document.querySelectorAll('button, a[href], input, select')) {
          const cadre = element.getBoundingClientRect();
          if (cadre.width === 0 || cadre.height === 0) continue; // masqué
          const style = getComputedStyle(element);
          if (style.display === 'contents') continue;
          // Un lien d'evitement est masque aux voyants : il n'a pas de cible tactile.
          if (style.clip === 'rect(0px, 0px, 0px, 0px)' || style.clipPath === 'inset(50%)') continue;
          if (cadre.height <= 2) continue;
          // Un lien à l'intérieur d'une phrase n'est pas une cible tactile : on ne
          // mesure que les commandes autonomes.
          const dansUnParagraphe = element.closest('p') !== null;
          if (dansUnParagraphe) continue;
          // Tolérance sous-pixel : le rendu donne 43,99 px pour une règle de 44 px.
          if (cadre.height < 43.5) {
            petites.push({
              balise: element.tagName.toLowerCase(),
              texte: (element.textContent ?? '').trim().slice(0, 30),
              hauteur: Math.round(cadre.height),
            });
          }
        }
        return petites.slice(0, 8);
      });

      if (trop.length > 0) resultats.cibles.push({ nom, trop });
    }
    await page.close();
  }

  // ── Focus visible ──────────────────────────────────────────────────────
  {
    const page = await navigateur.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + '/inscription', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 400));

    const focus = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      // `transition-colors` de Tailwind v4 transitionne aussi `outline-color` : lire
      // immediatement attrape la valeur en cours d'interpolation, pas la valeur finale.
      await new Promise((r) => setTimeout(r, 250));
      const info = await page.evaluate(() => {
        const actif = document.activeElement;
        if (!actif || actif === document.body) return null;
        const style = getComputedStyle(actif);
        return {
          balise: actif.tagName.toLowerCase(),
          texte: (actif.textContent ?? '').trim().slice(0, 30),
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
        };
      });
      if (info) focus.push(info);
    }
    resultats.focus = focus;
    await page.close();
  }

  // ── Le site sans WebGL ─────────────────────────────────────────────────
  {
    const page = await navigateur.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    // Neutralise getContext pour les contextes WebGL : c'est ce que fait un pilote
    // sur liste noire, et c'est le chemin de repli qu'on veut exercer.
    await page.evaluateOnNewDocument(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...reste) {
        if (String(type).includes('webgl') || String(type).includes('experimental')) return null;
        return original.call(this, type, ...reste);
      };
    });

    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    resultats.sansWebgl = await page.evaluate(() => ({
      texte: (document.getElementById('root')?.innerText ?? '').trim().length,
      canvas: document.querySelectorAll('canvas').length,
      svgPoster: document.querySelectorAll('svg[role="img"]').length,
      h1: document.querySelector('h1')?.innerText?.trim() ?? null,
    }));

    await page.screenshot({ path: `${SORTIE}/accueil-sans-webgl.png` });
    await page.close();
  }

  // ── Le canvas se monte-t-il quand WebGL est disponible ? ───────────────
  //
  // Le montage attend un signe d'interaction, ou un délai de repli : on vérifie donc
  // les deux chemins séparément. Sans cela, on conclurait à tort que le canvas ne
  // s'affiche jamais.
  {
    const page = await navigateur.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });

    // Avant toute interaction : rien ne doit être monté.
    await new Promise((r) => setTimeout(r, 1200));
    const avantInteraction = await page.evaluate(
      () => document.querySelectorAll('canvas').length
    );

    // Un vrai utilisateur bouge la souris. C'est le déclencheur nominal.
    await page.mouse.move(640, 400);
    await page.mouse.move(700, 420);
    await new Promise((r) => setTimeout(r, 3000));

    resultats.avecWebgl = {
      canvasAvantInteraction: avantInteraction,
      ...(await page.evaluate(() => ({
        canvas: document.querySelectorAll('canvas').length,
        largeurCanvas: document.querySelector('canvas')?.clientWidth ?? 0,
        hauteurCanvas: document.querySelector('canvas')?.clientHeight ?? 0,
      }))),
    };

    await page.screenshot({ path: `${SORTIE}/accueil-avec-robot.png` });
    await page.close();
  }

  // ── Le délai de repli monte-t-il le canvas sans aucune interaction ? ───
  {
    const page = await navigateur.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
    // Le délai de repli est de 3,2 s ; on laisse de la marge.
    await new Promise((r) => setTimeout(r, 6000));
    resultats.sansInteraction = await page.evaluate(() => ({
      canvas: document.querySelectorAll('canvas').length,
    }));
    await page.close();
  }
} finally {
  await navigateur.close();
}

writeFileSync(`${SORTIE}/rendu.json`, JSON.stringify(resultats, null, 2));

/* ── Rapport ─────────────────────────────────────────────────────────────── */

console.log('\n=== RENDU DES PAGES ===');
for (const page of resultats.rendu) {
  const verdict = page.texte > 200 ? 'OK' : 'SUSPECT';
  console.log(
    `${verdict.padEnd(8)} ${page.chemin.padEnd(22)} ${String(page.texte).padStart(5)} car.  h1=${page.nombreH1}  "${(page.h1 ?? '—').slice(0, 40)}"`
  );
}

console.log('\n=== DEBORDEMENT HORIZONTAL (320 -> 2560 px) ===');
if (resultats.debordements.length === 0) {
  console.log('AUCUN sur 8 pages x 7 largeurs = 56 combinaisons.');
} else {
  for (const d of resultats.debordements) {
    console.log(`${d.largeur}px ${d.nom} : ${d.largeurDefilement} > ${d.largeurVisible}`);
    for (const c of d.coupables) console.log(`    <${c.balise}> +${c.depasse}px  ${c.classes}`);
  }
}

console.log('\n=== CIBLES TACTILES SOUS 44 px (a 360 px) ===');
if (resultats.cibles.length === 0) {
  console.log('AUCUNE.');
} else {
  for (const c of resultats.cibles) {
    console.log(`${c.nom} :`);
    for (const t of c.trop) console.log(`    <${t.balise}> ${t.hauteur}px  "${t.texte}"`);
  }
}

console.log('\n=== FOCUS CLAVIER (8 tabulations sur /inscription) ===');
for (const f of resultats.focus ?? []) {
  const visible = f.outlineStyle !== 'none' && parseFloat(f.outlineWidth) > 0;
  console.log(
    `${visible ? 'VISIBLE' : 'INVISIBLE'}  <${f.balise}> ${f.outlineWidth} ${f.outlineStyle} ${f.outlineColor}  "${f.texte}"`
  );
}

console.log('\n=== SANS WEBGL ===');
console.log(JSON.stringify(resultats.sansWebgl));
console.log('=== AVEC WEBGL (apres mouvement de souris) ===');
console.log(JSON.stringify(resultats.avecWebgl));
console.log('=== SANS AUCUNE INTERACTION, apres le delai de repli ===');
console.log(JSON.stringify(resultats.sansInteraction));

console.log('\n=== ERREURS DE CONSOLE ===');
if (resultats.erreurs.length === 0) console.log('AUCUNE.');
else for (const e of resultats.erreurs) console.log(`${e.nom} : ${e.erreurs.join(' | ')}`);

console.log(`\nCaptures et rendu.json dans ${SORTIE}/`);
