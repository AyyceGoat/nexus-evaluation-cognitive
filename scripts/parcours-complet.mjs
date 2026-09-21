/**
 * Parcours de bout en bout, dans un vrai navigateur.
 *
 * Inscription → onboarding → tableau de bord → évaluation complète → rapport →
 * corrections et attestation, puis déconnexion.
 *
 * Ce script clique réellement : il ne vérifie pas que le code compile, il vérifie que
 * le produit fonctionne.
 *
 * Usage : node scripts/parcours-complet.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4245';
const SORTIE = 'verification';

const CHEMINS_CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const chrome = CHEMINS_CHROME.find((c) => existsSync(c));
if (!chrome) throw new Error('Aucun Chrome ni Edge trouvé.');
if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });

const etapes = [];
let echecs = 0;

function verifier(nom, condition, detail = '') {
  const ok = Boolean(condition);
  if (!ok) echecs++;
  etapes.push({ nom, ok, detail });
  console.log(`${ok ? 'OK    ' : 'ECHEC '} ${nom}${detail ? '  — ' + detail : ''}`);
}

const navigateur = await launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await navigateur.newPage();
await page.setViewport({ width: 1280, height: 1000 });

const erreursConsole = [];
page.on('pageerror', (e) => erreursConsole.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') erreursConsole.push(m.text());
});

/** Clique sur le premier élément dont le texte contient `texte`. */
async function cliquerTexte(texte, selecteur = 'button, a') {
  const cible = await page.evaluateHandle(
    (t, s) => {
      const candidats = [...document.querySelectorAll(s)];
      return candidats.find((el) => (el.textContent ?? '').includes(t)) ?? null;
    },
    texte,
    selecteur
  );
  const element = cible.asElement();
  if (!element) throw new Error(`Élément introuvable : « ${texte} »`);
  await element.click();
  await new Promise((r) => setTimeout(r, 500));
}

const texteDeLaPage = () =>
  page.evaluate(() => document.getElementById('root')?.innerText ?? '');

try {
  // ── 1. Le bandeau de mode local est-il bien affiché ? ────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  const accueil = await texteDeLaPage();
  verifier(
    'Le bandeau de mode développement local est affiché',
    accueil.includes('Mode développement local')
  );
  verifier('La landing affiche son titre', accueil.includes('Mesurez vos aptitudes'));

  // ── 2. Route protégée : redirection et retour à la page demandée ─────────
  await page.goto(`${BASE}/tableau-de-bord`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  verifier(
    'Une route protégée redirige vers la connexion',
    page.url().includes('/connexion'),
    page.url().replace(BASE, '')
  );
  const connexion = await texteDeLaPage();
  verifier(
    'La connexion annonce le retour à la page demandée',
    connexion.includes('Vous y serez ramené')
  );

  // ── 3. Inscription ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/inscription`, { waitUntil: 'networkidle2' });
  const champs = await page.$$('input');
  verifier('Le formulaire d’inscription a trois champs', champs.length === 3, `${champs.length}`);

  await champs[0].type('Kouassi Yao');
  await champs[1].type('kouassi@exemple.ci');
  await champs[2].type('motdepasse-solide');
  await cliquerTexte('Créer mon compte', 'button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));

  verifier(
    'L’inscription mène à l’onboarding',
    page.url().includes('/bienvenue'),
    page.url().replace(BASE, '')
  );

  // ── 4. Onboarding en trois étapes, passable ─────────────────────────────
  let bienvenue = await texteDeLaPage();
  verifier('L’onboarding annonce « Étape 1 sur 3 »', bienvenue.includes('Étape 1 sur 3'));
  verifier(
    'L’onboarding propose de passer la présentation',
    bienvenue.includes('Passer cette présentation')
  );

  await cliquerTexte('Continuer');
  await cliquerTexte('Continuer');
  bienvenue = await texteDeLaPage();
  verifier('La troisième étape demande le nom de l’attestation', bienvenue.includes('attestation'));

  const champNom = await page.$('input');
  if (champNom) await champNom.type('Kouassi Yao');
  await cliquerTexte('Terminer');
  await new Promise((r) => setTimeout(r, 1200));

  verifier(
    'L’onboarding mène au tableau de bord',
    page.url().includes('/tableau-de-bord'),
    page.url().replace(BASE, '')
  );

  // ── 5. Tableau de bord : état vide conçu ────────────────────────────────
  const tableau = await texteDeLaPage();
  verifier('Le tableau de bord salue par le prénom', tableau.includes('Kouassi'));
  verifier(
    'L’état vide est conçu et propose l’action',
    tableau.includes('pas encore passé') && tableau.includes('Commencer l’évaluation')
  );
  await page.screenshot({ path: `${SORTIE}/parcours-1-tableau-vide.png` });

  // ── 6. Évaluation complète ──────────────────────────────────────────────
  await page.goto(`${BASE}/evaluation`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await cliquerTexte('Commencer l’évaluation');
  await new Promise((r) => setTimeout(r, 1500));

  let repondues = 0;
  for (let i = 0; i < 45; i++) {
    // Les boutons de réponse portent `aria-pressed` : c'est le seul sélecteur stable.
    // Chercher par le texte échouait, les libellés étant du type « A3 » ou « B8 ».
    const aClique = await page.evaluate(() => {
      const options = [...document.querySelectorAll('button[aria-pressed]')];
      if (options.length === 0) return false;
      // On répond au hasard : le but est de traverser le parcours, et cela exerce en
      // prime le refus de score sur un profil indiscernable du hasard.
      options[Math.floor(Math.random() * options.length)].click();
      return true;
    });
    if (aClique) repondues++;

    const avance = await page.evaluate(() => {
      const suivant = [...document.querySelectorAll('button')].find((b) =>
        /Question suivante|Suivant|Terminer|Voir mon résultat|Calculer/i.test(b.textContent ?? '')
      );
      if (suivant && !suivant.disabled) {
        suivant.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 260));
    if (!avance) break;
  }

  await new Promise((r) => setTimeout(r, 2000));
  const rapport = await texteDeLaPage();
  verifier('L’évaluation a été parcourue', repondues > 10, `${repondues} réponses données`);
  const scoreRefuse = rapport.includes('Aucun score ne peut être calculé');
  verifier(
    'Le rapport s’affiche',
    rapport.includes('Votre résultat') ||
      rapport.includes('Indice estimé') ||
      scoreRefuse,
    scoreRefuse ? 'score refusé' : 'score affiché'
  );
  await page.screenshot({ path: `${SORTIE}/parcours-2-rapport.png`, fullPage: true });

  // Le script répond au hasard : le refus de score est donc l'issue ATTENDUE, et
  // c'est le critère d'acceptation central du moteur. On vérifie qu'il est motivé
  // par des chiffres et non par une formule vague.
  verifier(
    'Répondre au hasard fait refuser le score',
    scoreRefuse,
    scoreRefuse ? '' : 'un score a été affiché pour des réponses aléatoires'
  );
  verifier(
    'Le refus est motivé par les deux nombres observés',
    /\d+ bonnes? réponses?/.test(rapport) && /environ \d+/.test(rapport)
  );
  verifier(
    'Le refus propose de recommencer',
    rapport.includes('Repasser l’évaluation')
  );

  // ── 6 bis. Un rapport exploitable, pour atteindre les sections réservées ──
  //
  // Répondre juste demanderait de connaître les réponses : le script ne les a pas.
  // On dépose donc un rapport de test dans le stockage local — celui-là même que
  // l'application écrit — puis on ouvre son URL. Ce n'est pas une simulation du
  // produit : le rapport traverse le vrai écran de restitution.
  const referenceRapport = 'iq_parcours_test';
  await page.evaluate((id) => {
    const aptitudes = ['matrix', 'series', 'verbal', 'spatial', 'memory'].map((a) => ({
      aptitude: a,
      label: a,
      description: '',
      estimate: { theta: 0.3, standardError: 0.6, itemCount: 7 },
      scaled: { point: 104, lower95: 86, upper95: 122 },
      correctCount: 4,
      itemCount: 7,
      radarValue: 62,
    }));
    const rapport = {
      sessionId: id,
      createdAt: new Date().toISOString(),
      candidateName: 'Kouassi Yao',
      overall: { theta: 0.4, standardError: 0.31, itemCount: 35 },
      scaled: { point: 106, lower95: 97, upper95: 115 },
      percentile: 66,
      norm: { source: 'prior', populationSize: 0, label: 'sur une distribution théorique de référence' },
      aptitudes,
      strengths: [],
      weaknesses: [],
      validity: {
        verdict: 'ok',
        aberrantCount: 0,
        aberrantItemIds: [],
        correctCount: 22,
        expectedByChance: 7,
        aboveChanceP: 0.0001,
        message: null,
      },
      totalSeconds: 1500,
      itemCount: 35,
      correctCount: 22,
      responses: [],
    };
    localStorage.setItem('nexus_iq_reports_v2', JSON.stringify([rapport]));
  }, referenceRapport);

  await page.goto(`${BASE}/rapport/${referenceRapport}`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  const rapportOk = await texteDeLaPage();
  verifier('Un rapport exploitable affiche son indice', rapportOk.includes('106'));
  verifier(
    'L’intervalle de confiance est affiché à côté du chiffre',
    rapportOk.includes('97') && rapportOk.includes('115')
  );
  verifier(
    'La population de référence du centile est nommée',
    rapportOk.includes('distribution théorique')
  );
  verifier(
    'Le profil par aptitude n’affiche aucun sous-score chiffré',
    rapportOk.includes('Profil par aptitude') && !rapportOk.includes('62 %')
  );

  // ── 7. Corrections et attestation, sans déblocage ─────────────────
  // Le module de paiement a été retiré : le rapport est intégralement accessible.
  // On vérifie donc l'absence de tout verrou, et non son ouverture.
  await cliquerTexte('Corrections', 'button[role="tab"]').catch(() => {});
  await new Promise((r) => setTimeout(r, 700));
  const corrections = await texteDeLaPage();
  verifier(
    'Aucune section réservée ne subsiste',
    !corrections.includes('Section réservée')
  );
  verifier(
    'Aucun prix ne subsiste dans le rapport',
    !/500\s*XOF/.test(corrections)
  );
  verifier(
    'Les corrections affichent les bonnes réponses',
    corrections.includes('bonne réponse') || corrections.includes('réussie') || corrections.includes('manquée')
  );
  await page.screenshot({ path: `${SORTIE}/parcours-3-corrections.png`, fullPage: true });

  await cliquerTexte('Attestation', 'button[role="tab"]').catch(() => {});
  await new Promise((r) => setTimeout(r, 700));
  const attestation = await texteDeLaPage();
  verifier(
    'L’attestation est accessible',
    attestation.includes('Attestation de passation') || attestation.includes('Délivrée à'),
    attestation.includes('Attestation de passation') ? '' : attestation.slice(0, 80)
  );
  verifier(
    'L’attestation ne se dit pas « officielle »',
    !/officiel/i.test(attestation)
  );
  await page.screenshot({ path: `${SORTIE}/parcours-4-attestation.png`, fullPage: true });

  // ── 8. Aucune route de paiement ne répond plus ───────────────────
  for (const chemin of ['/paiement/ref-inexistante', '/transactions']) {
    await page.goto(`${BASE}${chemin}`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const texte = await texteDeLaPage();
    verifier(
      `La route ${chemin} n'existe plus`,
      texte.includes('Cette page n’existe pas') || page.url().includes('/connexion'),
      page.url().replace(BASE, '')
    );
  }

  // ── 10. Déconnexion ───────────────────────────────────────────────────
  await page.goto(`${BASE}/parametres`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await cliquerTexte('Me déconnecter');
  await new Promise((r) => setTimeout(r, 1200));
  await page.goto(`${BASE}/tableau-de-bord`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  verifier(
    'Après déconnexion, la route protégée redirige de nouveau',
    page.url().includes('/connexion')
  );
} catch (erreur) {
  echecs++;
  console.log(`\nINTERROMPU : ${erreur instanceof Error ? erreur.message : erreur}`);
  await page.screenshot({ path: `${SORTIE}/parcours-erreur.png` }).catch(() => {});
} finally {
  await navigateur.close();
}

console.log('\n=== ERREURS DE CONSOLE PENDANT LE PARCOURS ===');
console.log(erreursConsole.length === 0 ? 'AUCUNE.' : erreursConsole.slice(0, 6).join('\n'));

const reussies = etapes.filter((e) => e.ok).length;
console.log(`\n${reussies}/${etapes.length} vérifications passées.`);
if (echecs > 0) process.exitCode = 1;
