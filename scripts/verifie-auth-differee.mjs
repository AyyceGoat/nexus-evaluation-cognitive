/**
 * Vérifie que le chargement différé de l'authentification ne casse rien.
 *
 * Pourquoi ce script existe : pour qu'un visiteur non connecté ne télécharge pas
 * `@supabase/supabase-js` en lisant la landing, le contexte d'authentification
 * n'initialise le backend qu'à la première interaction. Le risque est précis : si
 * l'abonnement aux changements de session arrivait trop tard, une connexion réussie
 * ne serait pas vue, et une route protégée renverrait aussitôt vers le formulaire.
 *
 * Le test emprunte la session anonyme, qui ne demande que la clé publique — donc
 * aucun secret, et pas besoin de compte confirmé.
 *
 * Usage : node scripts/verifie-auth-differee.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');

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
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await navigateur.newPage();
await page.setViewport({ width: 1280, height: 1000 });

const requetes = [];
page.on('request', (r) => requetes.push(r.url()));

const texte = () => page.evaluate(() => document.getElementById('root')?.innerText ?? '');

/** Attend que la page contienne le motif, ou rend le texte au bout du délai. */
async function attendre(motif, limiteMs = 20000) {
  const debut = Date.now();
  while (Date.now() - debut < limiteMs) {
    const t = await texte();
    if (motif.test(t)) return t;
    await new Promise((r) => setTimeout(r, 300));
  }
  return texte();
}

try {
  // ── 1. Landing : la bibliothèque n'est pas chargée ──────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const accueil = await texte();
  verifier(
    'La landing affiche son titre sans attendre le backend',
    accueil.includes('Mesurez vos aptitudes')
  );
  verifier(
    'L’en-tête propose de créer un compte',
    accueil.includes('Créer mon compte'),
    accueil.includes('Mon espace') ? 'affiche « Mon espace » alors que personne n’est connecté' : ''
  );

  const jetonStocke = await page.evaluate(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle && /^sb-.*-auth-token$/.test(cle)) return cle;
      }
    } catch {
      return 'stockage inaccessible';
    }
    return null;
  });
  verifier('Aucun jeton de session n’est stocké au départ', jetonStocke === null, String(jetonStocke));

  const appelsAuth = requetes.filter((u) => u.includes('/auth/v1/')).length;
  verifier(
    'Aucun appel au service d’authentification au chargement',
    appelsAuth === 0,
    `${appelsAuth} appel(s)`
  );

  // ── 2. Une session anonyme s'ouvre à l'interaction ─────────────────────
  await page.goto(`${BASE}/evaluation`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) =>
      /Commencer/.test(x.textContent ?? '')
    );
    b?.click();
  });

  // On attend la PREMIÈRE QUESTION, pas l'écran de chargement : accepter
  // « Préparation des questions » comme condition de sortie faisait sortir
  // l'attente trop tôt, puis échouer sur un texte qui n'était pas encore là.
  const enCours = await attendre(/Question 1 sur/, 30000);
  verifier(
    'L’évaluation démarre sans compte',
    /Question 1 sur/.test(enCours),
    /Serveur non configuré|n’est pas configuré/.test(enCours)
      ? 'serveur non configuré'
      : enCours.slice(0, 80).replace(/\s+/g, ' ')
  );

  const jetonApres = await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle && /^sb-.*-auth-token$/.test(cle)) return true;
    }
    return false;
  });
  verifier('Une session anonyme a bien été ouverte', jetonApres);

  // ── 3. L'abonnement a vu la session : c'est le point critique ──────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  const apresSession = await attendre(/Mon espace/, 15000);
  verifier(
    'L’en-tête reflète la session ouverte',
    apresSession.includes('Mon espace'),
    apresSession.includes('Créer mon compte') ? 'affiche encore « Créer mon compte »' : ''
  );

  await page.goto(`${BASE}/tableau-de-bord`, { waitUntil: 'networkidle2' });
  const tableau = await attendre(/évaluation|Bonjour|pas encore/, 20000);
  verifier(
    'Une route protégée s’ouvre sans renvoyer vers la connexion',
    !page.url().includes('/connexion'),
    page.url().replace(BASE, '')
  );
  verifier('Le tableau de bord affiche son contenu', tableau.length > 50, `${tableau.length} signes`);
} catch (erreur) {
  console.error('INTERROMPU :', erreur instanceof Error ? erreur.message : String(erreur));
  echecs++;
} finally {
  await navigateur.close();
}

console.log('');
console.log(`${resultats.length - echecs}/${resultats.length} vérifications passées`);
if (echecs > 0) {
  console.log('');
  console.log('A CORRIGER :');
  for (const r of resultats.filter((x) => !x.ok)) {
    console.log(`  - ${r.nom}${r.detail ? ' (' + r.detail + ')' : ''}`);
  }
}
process.exit(echecs > 0 ? 1 : 0);
