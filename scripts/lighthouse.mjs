/**
 * Lighthouse, réellement lancé.
 *
 * Chrome est installé sur cette machine, donc les scores ci-dessous sont mesurés et
 * non estimés. Profil mobile, throttling simulé 3G rapide — le réglage par défaut de
 * Lighthouse en mode mobile.
 *
 * Usage : node scripts/lighthouse.mjs [url] [chemin,chemin,...]
 */

import lighthouse from 'lighthouse';
import { launch } from 'puppeteer-core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4232';
//  est dans la liste par defaut depuis que la bibliotheque porte 50
// articles : c'est desormais la page la plus lourde en contenu, donc celle ou une
// regression de performance se verrait d'abord.
const CHEMINS = (process.argv[3] ?? '/,/evaluation,/savoir,/inscription').split(',');
const SORTIE = 'verification';

const CHEMINS_CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const chrome = CHEMINS_CHROME.find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');

if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });

const navigateur = await launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=9222'],
});

const port = Number(new URL(navigateur.wsEndpoint()).port);
const tout = [];

try {
  for (const chemin of CHEMINS) {
    const resultat = await lighthouse(
      BASE + chemin,
      {
        port,
        output: ['json'],
        logLevel: 'error',
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 360, height: 800, deviceScaleFactor: 2 },
        // Le profil mobile par défaut de Lighthouse : 3G rapide, 4x de bridage CPU.
        throttlingMethod: 'simulate',
      },
      undefined
    );

    const lhr = resultat.lhr;
    const scores = Object.fromEntries(
      Object.entries(lhr.categories).map(([cle, valeur]) => [
        cle,
        Math.round((valeur.score ?? 0) * 100),
      ])
    );

    const metriques = {
      lcp: lhr.audits['largest-contentful-paint']?.numericValue,
      cls: lhr.audits['cumulative-layout-shift']?.numericValue,
      tbt: lhr.audits['total-blocking-time']?.numericValue,
      fcp: lhr.audits['first-contentful-paint']?.numericValue,
      si: lhr.audits['speed-index']?.numericValue,
    };

    // Ce qui a réellement échoué, pas seulement le score.
    const echecs = Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode === 'binary')
      .map((a) => a.id);

    tout.push({ chemin, scores, metriques, echecs });
    writeFileSync(
      `${SORTIE}/lighthouse${chemin === '/' ? '-accueil' : chemin.replace(/\//g, '-')}.json`,
      JSON.stringify(lhr, null, 2)
    );
  }
} finally {
  await navigateur.close();
}

writeFileSync(`${SORTIE}/lighthouse-resume.json`, JSON.stringify(tout, null, 2));

const CIBLES = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };

console.log('\n=== LIGHTHOUSE MOBILE (mesuré, 3G rapide simulé) ===\n');
for (const { chemin, scores, metriques, echecs } of tout) {
  console.log(`── ${chemin} ──`);
  for (const [cle, cible] of Object.entries(CIBLES)) {
    const obtenu = scores[cle] ?? 0;
    const verdict = obtenu >= cible ? 'OK    ' : 'ECHEC ';
    console.log(`  ${verdict} ${cle.padEnd(16)} ${String(obtenu).padStart(3)} / cible ${cible}`);
  }
  console.log(
    `         LCP ${(metriques.lcp / 1000).toFixed(2)} s (cible < 2,50)   ` +
      `CLS ${metriques.cls.toFixed(3)} (cible < 0,100)   ` +
      `TBT ${Math.round(metriques.tbt)} ms   FCP ${(metriques.fcp / 1000).toFixed(2)} s`
  );
  if (echecs.length > 0) console.log(`         audits en echec : ${echecs.join(', ')}`);
  console.log('');
}

console.log(`Rapports complets dans ${SORTIE}/`);
