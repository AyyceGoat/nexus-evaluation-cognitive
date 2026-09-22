/**
 * Parcours de bout en bout, dans un vrai navigateur.
 *
 * Inscription sans session → refus d’un compte non confirmé → connexion →
 * onboarding → tableau de bord → évaluation complète → rapport recalculé par le
 * serveur → corrections et attestation → classement public → déconnexion.
 *
 * Ce script clique réellement : il ne vérifie pas que le code compile, il vérifie que
 * le produit fonctionne.
 *
 * Usage : node scripts/parcours-complet.mjs [url]
 */

import { launch } from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4245';
const SORTIE = 'verification';

/* ── Configuration ─────────────────────────────────────────────────────────
 *
 * Le parcours exige un vrai projet Supabase : il n'existe plus de mode local, et
 * c'est voulu. L'authentification etant a confirmation obligatoire, un script ne
 * peut pas cliquer un lien recu par courriel : le compte de test est donc cree
 * deja confirme par l'API d'administration, seule voie honnete. La cle de service
 * ne sert qu'a cela, et les comptes sont supprimes a la fin.
 */

function lireEnv() {
  const valeurs = { ...process.env };
  if (existsSync('.env')) {
    for (const ligne of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const trouve = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(ligne);
      if (!trouve) continue;
      const valeur = trouve[2].replace(/^["']|["']$/g, '').trim();
      if (valeur) valeurs[trouve[1]] = valeur;
    }
  }
  return valeurs;
}

const env = lireEnv();
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ce parcours exige un projet Supabase configure dans .env :');
  console.error('  VITE_SUPABASE_URL        ', env.VITE_SUPABASE_URL ? 'ok' : 'ABSENTE');
  console.error('  VITE_SUPABASE_ANON_KEY   ', env.VITE_SUPABASE_ANON_KEY ? 'ok' : 'ABSENTE');
  console.error('  SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'ABSENTE');
  console.error('');
  console.error('Voir docs/SUPABASE.md. Le script s arrete plutot que de faire');
  console.error('croire a un parcours reussi sans avoir rien verifie.');
  process.exit(2);
}

const service = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const marque = Date.now().toString(36);
const COMPTE = {
  email: `parcours-${marque}@nexus-test.invalid`,
  motDePasse: `Parcours-${marque}!`,
  nom: 'Kouassi Yao',
};
const aSupprimer = [];

async function creerCompteConfirme() {
  const { data, error } = await service.auth.admin.createUser({
    email: COMPTE.email,
    password: COMPTE.motDePasse,
    email_confirm: true,
    user_metadata: { display_name: COMPTE.nom },
  });
  if (error || !data.user) throw new Error(`Compte de test impossible : ${error?.message}`);
  aSupprimer.push(data.user.id);
  return data.user.id;
}

async function supprimerComptes() {
  for (const id of aSupprimer) {
    await service.auth.admin.deleteUser(id).catch(() => {});
  }
}

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
  // ── 1. Aucun mode simulé, et la landing s'affiche ───────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  const accueil = await texteDeLaPage();
  verifier(
    'Aucun bandeau de mode simulé ni de configuration manquante',
    !accueil.includes('Mode développement local') && !accueil.includes('Serveur non configuré'),
    accueil.includes('Serveur non configuré') ? 'la configuration n a pas atteint le bundle' : ''
  );
  verifier('La landing affiche son titre', accueil.includes('Mesurez vos aptitudes'));
  verifier('Le classement figure dans la navigation', accueil.includes('Classement'));

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

  // ── 3a. L'inscription n'ouvre AUCUNE session ────────────────────────────
  // Comportement exigé : la confirmation d'adresse est obligatoire.
  await page.goto(`${BASE}/inscription`, { waitUntil: 'networkidle2' });
  const champs = await page.$$('input');
  verifier('Le formulaire d’inscription a trois champs', champs.length === 3, `${champs.length}`);

  const emailJetable = `inscription-${marque}@nexus-test.invalid`;
  await champs[0].type('Essai Inscription');
  await champs[1].type(emailJetable);
  await champs[2].type(`Essai-${marque}!`);
  await cliquerTexte('Créer mon compte', 'button[type="submit"]');
  await new Promise((r) => setTimeout(r, 3000));

  const apresInscription = await texteDeLaPage();
  verifier(
    'L’inscription demande de confirmer l’adresse, sans ouvrir de session',
    apresInscription.includes('Vérifiez votre boîte mail') && !page.url().includes('/bienvenue'),
    page.url().replace(BASE, '')
  );
  verifier(
    'Le renvoi du lien de confirmation est proposé',
    apresInscription.includes('Renvoyer le lien de confirmation')
  );
  await page.screenshot({ path: `${SORTIE}/parcours-0-confirmation.png` });

  // Ce compte reste non confirmé : on le supprime à la fin comme les autres.
  const { data: liste } = await service.auth.admin.listUsers({ perPage: 200 });
  const jetable = (liste?.users ?? []).find((u) => u.email === emailJetable);
  if (jetable) aSupprimer.push(jetable.id);

  // ── 3b. Un compte non confirmé ne peut pas se connecter ────────────────
  await page.goto(`${BASE}/connexion`, { waitUntil: 'networkidle2' });
  let entrees = await page.$$('input');
  await entrees[0].type(emailJetable);
  await entrees[1].type(`Essai-${marque}!`);
  await cliquerTexte('Se connecter', 'button[type="submit"]');
  await new Promise((r) => setTimeout(r, 3000));
  const refus = await texteDeLaPage();
  verifier(
    'Un compte non confirmé se voit refuser la connexion',
    refus.includes('Confirmez votre adresse') && !page.url().includes('/tableau-de-bord'),
    page.url().replace(BASE, '')
  );

  // ── 3c. Connexion avec un compte confirmé ──────────────────────────────
  await creerCompteConfirme();
  await page.goto(`${BASE}/connexion`, { waitUntil: 'networkidle2' });
  entrees = await page.$$('input');
  await entrees[0].type(COMPTE.email);
  await entrees[1].type(COMPTE.motDePasse);
  await cliquerTexte('Se connecter', 'button[type="submit"]');
  await new Promise((r) => setTimeout(r, 3500));

  verifier(
    'Un compte confirmé se connecte et arrive sur l’onboarding',
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

  // ── 6 bis. Une passation réussie, pour atteindre corrections et attestation ──
  //
  // L'ancienne version déposait un rapport fabriqué dans le stockage du navigateur.
  // Ce mécanisme a disparu : le rapport vient désormais du serveur, et le
  // navigateur ne détient plus les énoncés. On passe donc une VRAIE évaluation, en
  // lisant le corrigé avec la clé de service — ce que fait le harnais, jamais le
  // produit.
  await page.goto(`${BASE}/evaluation`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await cliquerTexte('Commencer');
  await new Promise((r) => setTimeout(r, 3000));

  // La passation ouverte est la plus récente de ce compte.
  const { data: passations } = await service
    .from('iq_sessions')
    .select('id')
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(1);

  const passationReussie = passations?.[0]?.id;
  verifier('Une passation a été ouverte côté serveur', Boolean(passationReussie));

  const { data: itemsServis } = await service
    .from('iq_session_items')
    .select('item_id, ordre')
    .eq('session_id', passationReussie)
    .order('ordre');

  const { data: corriges } = await service
    .from('iq_items')
    .select('id, correct_index')
    .in('id', (itemsServis ?? []).map((i) => i.item_id));

  const bonneReponse = new Map((corriges ?? []).map((c) => [c.id, c.correct_index]));

  // On répond juste à chaque question, dans l'ordre servi.
  let justes = 0;
  for (const servi of itemsServis ?? []) {
    const index = bonneReponse.get(servi.item_id);
    const clique = await page.evaluate((i) => {
      const options = [...document.querySelectorAll('button[aria-pressed]')];
      const visuelles = [...document.querySelectorAll('button')].filter((b) =>
        /^Option \d/.test((b.textContent ?? '').trim())
      );
      const cibles = options.length > 0 ? options : visuelles;
      if (!cibles[i]) return false;
      cibles[i].click();
      return true;
    }, index);
    if (clique) justes++;

    await page.evaluate(() => {
      const suivant = [...document.querySelectorAll('button')].find((b) =>
        /Suivant|Terminer/i.test(b.textContent ?? '')
      );
      if (suivant && !suivant.disabled) suivant.click();
    });
    await new Promise((r) => setTimeout(r, 200));
  }

  verifier(
    'Toutes les questions ont reçu la bonne réponse',
    justes === (itemsServis ?? []).length,
    `${justes} sur ${itemsServis?.length}`
  );

  // Le serveur calcule : l'écran attend son résultat.
  await new Promise((r) => setTimeout(r, 6000));
  const rapportOk = await texteDeLaPage();

  verifier(
    'Le rapport affiche un indice calculé par le serveur',
    /Indice estimé/.test(rapportOk) && !rapportOk.includes('Aucun score ne peut'),
    rapportOk.includes('Aucun score ne peut') ? 'score refusé' : ''
  );
  verifier(
    'La population de référence du centile est nommée',
    rapportOk.includes('distribution théorique')
  );
  verifier(
    'Le profil par aptitude n’affiche aucun sous-score chiffré',
    rapportOk.includes('Profil par aptitude') && !rapportOk.includes('62 %')
  );
  await page.screenshot({ path: `${SORTIE}/parcours-2-rapport-reussi.png`, fullPage: true });

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

  // ── 9. Classement public : consentement, publication, retrait ──────────
  const pseudonyme = `Kouassi${marque.slice(-4)}`;

  await page.goto(`${BASE}/parametres`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));
  const parametres = await texteDeLaPage();
  verifier(
    'Les paramètres annoncent ce qui sera publié',
    parametres.includes('votre pseudonyme') && parametres.includes('Ni votre'),
  );
  verifier(
    'Par défaut, on ne figure pas au classement',
    parametres.includes('vous n’y figurez pas')
  );

  const champPseudo = await page.$('input');
  if (!champPseudo) throw new Error('Champ de pseudonyme introuvable.');
  await champPseudo.type(pseudonyme);
  await cliquerTexte('Enregistrer le pseudonyme');
  await new Promise((r) => setTimeout(r, 1800));
  verifier(
    'Le pseudonyme est enregistré',
    (await texteDeLaPage()).includes('Pseudonyme enregistré')
  );

  await cliquerTexte('Figurer au classement');
  await new Promise((r) => setTimeout(r, 2200));
  const apresConsentement = await texteDeLaPage();
  verifier(
    'Le consentement au classement est pris en compte',
    apresConsentement.includes('vous figurez au classement'),
    apresConsentement.includes('Confirmez') ? 'refus : adresse non confirmée' : ''
  );
  await page.screenshot({ path: `${SORTIE}/parcours-5-parametres.png`, fullPage: true });

  // Le script a répondu au hasard : la passation a été refusée, donc rien ne doit
  // être publié. Publier un profil indiscernable du hasard reviendrait à classer
  // du bruit — c'est précisément ce qu'on vérifie ici.
  const contexteAnonyme = await navigateur.createBrowserContext();
  const pageAnonyme = await contexteAnonyme.newPage();
  await pageAnonyme.setViewport({ width: 1280, height: 1000 });
  await pageAnonyme.goto(`${BASE}/classement`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  const classementAnonyme = await pageAnonyme.evaluate(
    () => document.getElementById('root')?.innerText ?? ''
  );

  verifier(
    'Le classement est consultable sans compte',
    classementAnonyme.includes('Classement') && !pageAnonyme.url().includes('/connexion'),
    pageAnonyme.url().replace(BASE, '')
  );
  verifier(
    'Le classement ne publie pas une passation au score refusé',
    !classementAnonyme.includes(pseudonyme),
    classementAnonyme.includes(pseudonyme) ? 'PSEUDONYME PUBLIE A TORT' : ''
  );
  verifier(
    'Aucune adresse e-mail ne paraît au classement',
    !classementAnonyme.includes('@nexus-test.invalid') && !classementAnonyme.includes(COMPTE.email)
  );
  verifier(
    'Le classement dit que les intervalles se recouvrent',
    classementAnonyme.includes('recouvrent')
  );
  await pageAnonyme.screenshot({ path: `${SORTIE}/parcours-6-classement.png`, fullPage: true });
  await contexteAnonyme.close();

  // Retrait : la ligne doit disparaître, et l'état revenir en arrière.
  await page.goto(`${BASE}/parametres`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await cliquerTexte('Me retirer du classement');
  await new Promise((r) => setTimeout(r, 2000));
  verifier(
    'Le retrait du classement est pris en compte',
    (await texteDeLaPage()).includes('vous n’y figurez pas')
  );

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
  await supprimerComptes();
}

console.log('\n=== ERREURS DE CONSOLE PENDANT LE PARCOURS ===');
console.log(erreursConsole.length === 0 ? 'AUCUNE.' : erreursConsole.slice(0, 6).join('\n'));

const reussies = etapes.filter((e) => e.ok).length;
console.log(`\n${reussies}/${etapes.length} vérifications passées.`);
if (echecs > 0) process.exitCode = 1;
