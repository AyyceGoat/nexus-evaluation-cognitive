/**
 * Parcours tactile systématique, aux dimensions d'un téléphone.
 *
 * ── Ce que ce script est, et ce qu'il n'est pas ──
 *
 * Il n'est PAS un test sur appareil réel. Aucun téléphone n'est branché à cette
 * machine, et je n'ai aucun moyen d'en simuler un honnêtement. Ce qu'il fait :
 *
 *   - un vrai moteur Chromium, aux dimensions et à la densité d'un téléphone ;
 *   - de vrais événements tactiles (`touchstart`, `touchend`), et non des clics
 *     de souris à une fenêtre étroite — la distinction compte, car le produit
 *     décide du repli statique du robot sur `pointer: coarse` ;
 *   - chaque page visitée, chaque bouton visible touché, chaque champ rempli.
 *
 * Ce qu'il ne dira jamais : le comportement de Safari iOS, la fluidité sur un GPU
 * de téléphone, le clavier logiciel qui recouvre un champ, la latence d'un réseau
 * mobile réel. Ces quatre points restent à vérifier sur un appareil.
 *
 * Usage : node scripts/verifie-mobile.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const SORTIE = 'verification';

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');
if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });

/** Deux tailles réelles : le plus petit Android courant, et un iPhone récent. */
const APPAREILS = [
  { nom: 'Android 360', largeur: 360, hauteur: 800, dpr: 3 },
  { nom: 'iPhone 390', largeur: 390, hauteur: 844, dpr: 3 },
];

const PAGES = [
  { chemin: '/', nom: 'accueil' },
  { chemin: '/evaluation', nom: 'evaluation' },
  { chemin: '/classement', nom: 'classement' },
  { chemin: '/inscription', nom: 'inscription' },
  { chemin: '/connexion', nom: 'connexion' },
  { chemin: '/mot-de-passe', nom: 'mot-de-passe' },
  { chemin: '/savoir', nom: 'savoir' },
  { chemin: '/pays', nom: 'pays' },
  { chemin: '/quiz', nom: 'quiz' },
  { chemin: '/route-inexistante', nom: '404' },
];

let echecs = 0;
const resultats = [];

function verifier(nom, ok, detail = '') {
  if (!ok) echecs++;
  resultats.push({ nom, ok, detail });
  console.log(`${ok ? 'OK     ' : 'ECHEC  '} ${nom}${detail ? '  — ' + detail : ''}`);
}

const navigateur = await launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

try {
  for (const appareil of APPAREILS) {
    console.log('');
    console.log(`══ ${appareil.nom} (${appareil.largeur}×${appareil.hauteur}, dpr ${appareil.dpr}) ══`);

    const page = await navigateur.newPage();
    await page.setViewport({
      width: appareil.largeur,
      height: appareil.hauteur,
      deviceScaleFactor: appareil.dpr,
      isMobile: true,
      hasTouch: true,
    });

    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e).slice(0, 120)));
    page.on('console', (m) => {
      if (m.type() === 'error') erreurs.push(m.text().slice(0, 120));
    });

    for (const { chemin, nom } of PAGES) {
      await page.goto(BASE + chemin, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 900));

      const etat = await page.evaluate(() => {
        const doc = document.documentElement;
        const racine = document.getElementById('root');

        // Le pointeur doit être vu comme grossier : c'est ce qui déclenche le
        // repli statique du robot et les cibles tactiles.
        const grossier = window.matchMedia('(pointer: coarse)').matches;

        // Un champ sous 16 px déclenche le zoom automatique d'iOS.
        const champsTropPetits = [...document.querySelectorAll('input, select, textarea')]
          .filter((c) => c.getBoundingClientRect().height > 0)
          .filter((c) => parseFloat(getComputedStyle(c).fontSize) < 16)
          .map((c) => ({ type: c.type ?? c.tagName, taille: parseFloat(getComputedStyle(c).fontSize) }));

        // Un élément interactif recouvert par l'en-tête collant est inatteignable.
        const entete = document.querySelector('header');
        const basEntete = entete ? entete.getBoundingClientRect().bottom : 0;
        const recouverts = [...document.querySelectorAll('main button, main a[href]')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.top < basEntete && r.bottom > 0;
          })
          .map((el) => (el.textContent ?? '').trim().slice(0, 30));

        return {
          texte: (racine?.innerText ?? '').trim().length,
          debordement: doc.scrollWidth - doc.clientWidth,
          grossier,
          champsTropPetits,
          recouverts: recouverts.slice(0, 3),
          boutons: document.querySelectorAll('main button, main a[href]').length,
          canvas: document.querySelectorAll('canvas').length,
        };
      });

      verifier(`${nom} : la page affiche du contenu`, etat.texte > 80, `${etat.texte} signes`);
      verifier(`${nom} : aucun débordement horizontal`, etat.debordement <= 1, `${etat.debordement} px`);
      verifier(
        `${nom} : aucun champ sous 16 px (zoom iOS)`,
        etat.champsTropPetits.length === 0,
        etat.champsTropPetits.map((c) => `${c.type} ${c.taille}px`).join(', ')
      );
      verifier(
        `${nom} : rien d'interactif sous l'en-tête collant`,
        etat.recouverts.length === 0,
        etat.recouverts.join(' / ')
      );

      if (nom === 'accueil') {
        verifier('le pointeur est reconnu comme tactile', etat.grossier);
        verifier(
          'aucun canvas 3D sur tactile : le poster statique est servi',
          etat.canvas === 0,
          `${etat.canvas} canvas`
        );
      }
    }

    // ── Le menu de navigation ──────────────────────────────────────────
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 800));

    const boiteMenu = await page.evaluate(() => {
      const b = document.querySelector('button[aria-controls="menu-mobile"]');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, hauteur: r.height };
    });

    verifier('le bouton de menu existe et fait au moins 44 px', Boolean(boiteMenu) && boiteMenu.hauteur >= 43.5,
      boiteMenu ? `${Math.round(boiteMenu.hauteur)} px` : 'introuvable');

    if (boiteMenu) {
      await page.touchscreen.tap(boiteMenu.x, boiteMenu.y);
      await new Promise((r) => setTimeout(r, 500));
      const ouvert = await page.evaluate(
        () => document.getElementById('menu-mobile') !== null
      );
      verifier('le menu s’ouvre au toucher', ouvert);

      await page.touchscreen.tap(boiteMenu.x, boiteMenu.y);
      await new Promise((r) => setTimeout(r, 500));
      const ferme = await page.evaluate(
        () => document.getElementById('menu-mobile') === null
      );
      verifier('le menu se referme au toucher', ferme);
    }

    // ── Les formulaires : saisie réelle ────────────────────────────────
    for (const { chemin, nom, valeurs } of [
      { chemin: '/inscription', nom: 'inscription', valeurs: ['Essai Tactile', 'tactile@exemple.ci', 'motdepasse-long'] },
      { chemin: '/connexion', nom: 'connexion', valeurs: ['tactile@exemple.ci', 'motdepasse-long'] },
      { chemin: '/mot-de-passe', nom: 'mot de passe oublié', valeurs: ['tactile@exemple.ci'] },
    ]) {
      await page.goto(BASE + chemin, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 800));

      const champs = await page.$$('input');
      verifier(`${nom} : le formulaire a ${valeurs.length} champ(s)`, champs.length === valeurs.length, `${champs.length}`);

      let saisieOk = true;
      for (const [i, champ] of champs.entries()) {
        if (i >= valeurs.length) break;
        const boite = await champ.boundingBox();
        if (!boite) { saisieOk = false; continue; }
        // Toucher le champ, puis saisir : c'est le geste réel.
        await page.touchscreen.tap(boite.x + boite.width / 2, boite.y + boite.height / 2);
        await champ.type(valeurs[i], { delay: 8 });
        const lu = await champ.evaluate((el) => el.value);
        if (lu !== valeurs[i]) saisieOk = false;
      }
      verifier(`${nom} : chaque champ reçoit la saisie au toucher`, saisieOk);

      // Le bouton d'envoi doit être atteignable sans que rien ne le recouvre.
      const envoi = await page.evaluate(() => {
        const b = document.querySelector('button[type="submit"]');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        const dessus = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return {
          hauteur: r.height,
          atteignable: b.contains(dessus) || b === dessus,
        };
      });
      verifier(
        `${nom} : le bouton d’envoi est atteignable et fait 44 px`,
        Boolean(envoi) && envoi.atteignable && envoi.hauteur >= 43.5,
        envoi ? `${Math.round(envoi.hauteur)} px, atteignable ${envoi.atteignable}` : 'introuvable'
      );
    }

    // ── Toucher chaque bouton de la landing, sans provoquer d'erreur ───
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 900));
    const avant = erreurs.length;

    const boutons = await page.evaluate(() =>
      [...document.querySelectorAll('main button')]
        .filter((b) => b.getBoundingClientRect().height > 0)
        .map((b) => {
          const r = b.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, texte: (b.textContent ?? '').trim().slice(0, 24) };
        })
        .slice(0, 8)
    );

    for (const b of boutons) {
      if (b.y < 0 || b.y > appareil.hauteur) continue;
      await page.touchscreen.tap(b.x, b.y).catch(() => {});
      await new Promise((r) => setTimeout(r, 250));
    }
    verifier(
      `${boutons.length} bouton(s) de la landing touchés sans erreur`,
      erreurs.length === avant,
      erreurs.slice(avant).join(' | ').slice(0, 90)
    );

    await page.screenshot({ path: `${SORTIE}/mobile-${appareil.largeur}.png`, fullPage: true });

    verifier(
      `${appareil.nom} : aucune erreur de console sur le parcours`,
      erreurs.length === 0,
      [...new Set(erreurs)].slice(0, 2).join(' | ').slice(0, 110)
    );

    await page.close();
  }
} catch (erreur) {
  console.error('');
  console.error('INTERROMPU :', erreur instanceof Error ? erreur.message : String(erreur));
  echecs++;
} finally {
  await navigateur.close();
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`${resultats.length - echecs}/${resultats.length} vérifications passées`);
if (echecs > 0) {
  console.log('');
  console.log('A CORRIGER :');
  for (const r of resultats.filter((x) => !x.ok)) {
    console.log(`  - ${r.nom}${r.detail ? ' (' + r.detail + ')' : ''}`);
  }
}
console.log('');
console.log('Rappel : aucun appareil réel n’a été utilisé. Safari iOS, la fluidité sur');
console.log('GPU de téléphone, le clavier logiciel et le réseau mobile restent à voir');
console.log('sur un vrai appareil.');
process.exit(echecs > 0 ? 1 : 0);
