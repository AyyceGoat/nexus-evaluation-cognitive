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

// « Failed to load resource: 400 » ne dit pas QUELLE requete a echoue : sans
// l'URL, un echec reste indiagnosticable.
const requetesEnEchec = [];
page.on('response', (r) => {
  if (r.status() >= 400) {
    requetesEnEchec.push(`${r.status()} ${r.request().method()} ${r.url().split('?')[0]}`);
  }
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

/**
 * Attend que la page cesse d'afficher l'ecran de calcul.
 *
 * Une attente fixe ne convient pas : le serveur enregistre les reponses puis
 * calcule, et la duree depend du reseau. Avec un `setTimeout`, le script lisait la
 * page avant la reponse et concluait a tort qu'aucun score n'etait affiche.
 */
async function attendreResultat(limiteMs = 45000) {
  const debut = Date.now();
  while (Date.now() - debut < limiteMs) {
    const texte = await texteDeLaPage();
    if (!texte.includes('Calcul du résultat')) return texte;
    await new Promise((r) => setTimeout(r, 500));
  }
  return texteDeLaPage();
}

/**
 * Attend que la page ait fini de charger son contenu.
 *
 * La page de rapport enchaine plusieurs appels serveur. Avec une attente fixe, le
 * script lisait une page encore vide et concluait a tort que le rapport ne
 * s'affichait pas.
 */
async function attendreContenu(motif, limiteMs = 30000) {
  const debut = Date.now();
  while (Date.now() - debut < limiteMs) {
    const texte = await texteDeLaPage();
    if (motif.test(texte)) return texte;
    await new Promise((r) => setTimeout(r, 400));
  }
  return texteDeLaPage();
}

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

  // L'offre gratuite limite la cadence des inscriptions et des e-mails. Atteinte,
  // elle n'est pas un defaut du produit : on le dit plutot que de compter un echec.
  const cadenceAtteinte = /Trop de tentatives|rate limit/i.test(apresInscription);
  if (cadenceAtteinte) {
    console.log(
      'INFO   Limite de cadence Supabase atteinte : les deux verifications ' +
        'd’inscription sont passees. Reessayez dans une heure.'
    );
  }

  verifier(
    'L’inscription demande de confirmer l’adresse, sans ouvrir de session',
    cadenceAtteinte ||
      (apresInscription.includes('Vérifiez votre boîte mail') &&
        !page.url().includes('/bienvenue')),
    cadenceAtteinte ? 'limite de cadence' : page.url().replace(BASE, '')
  );
  verifier(
    'Le renvoi du lien de confirmation est proposé',
    cadenceAtteinte || apresInscription.includes('Renvoyer le lien de confirmation'),
    cadenceAtteinte ? 'limite de cadence' : ''
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
  // Sous limite de cadence, le compte jetable n'a pas pu être créé : la connexion
  // échoue alors sur « identifiants incorrects » et non sur « adresse non
  // confirmée ». Le refus réel est de toute façon vérifié par `verifie:rls`, qui
  // crée ses comptes par l'API d'administration.
  verifier(
    'Un compte non confirmé se voit refuser la connexion',
    !page.url().includes('/tableau-de-bord') &&
      (cadenceAtteinte || refus.includes('Confirmez votre adresse')),
    cadenceAtteinte ? 'limite de cadence : refus non spécifique' : page.url().replace(BASE, '')
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

  const rapport = await attendreResultat();
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

  // ── 6 bis. Une passation exploitable, pour atteindre corrections et attestation ──
  //
  // Elle n'est PAS passée en cliquant, et pour une raison de fond : le moteur
  // détecte les réponses expédiées, et un script qui clique instantanément se voit
  // refuser son score — à juste titre. Reproduire des durées humaines demanderait
  // une dizaine de minutes par exécution.
  //
  // On emprunte donc le même chemin serveur que l'application, depuis Node, avec
  // des durées plausibles : ouverture par la fonction serveur, réponses écrites
  // sous l'identité du compte de test, clôture par la fonction serveur. La donnée
  // produite est indiscernable de celle d'un vrai répondant attentif. Seul
  // l'affichage est ensuite vérifié dans le navigateur.
  const clientTest = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  await clientTest.auth.signInWithPassword({
    email: COMPTE.email,
    password: COMPTE.motDePasse,
  });

  const { data: passationReussie } = await clientTest.rpc('ouvrir_passation', {
    p_longueur: 30,
  });
  const { data: questionsServies } = await clientTest.rpc('items_de_passation', {
    p_session_id: passationReussie,
  });
  const { data: corriges } = await service
    .from('iq_items')
    .select('id, correct_index, expected_seconds')
    .in('id', (questionsServies ?? []).map((q) => q.id));
  const parId = new Map((corriges ?? []).map((c) => [c.id, c]));

  const idCompteTest = (await clientTest.auth.getUser()).data.user?.id;
  const { error: erreurReponses } = await clientTest.from('iq_responses').insert(
    (questionsServies ?? []).map((q) => ({
      session_id: passationReussie,
      user_id: idCompteTest,
      item_id: q.id,
      selected_index: parId.get(q.id).correct_index,
      response_seconds: parId.get(q.id).expected_seconds,
    }))
  );
  verifier('Les réponses de la passation exploitable sont écrites', !erreurReponses,
    erreurReponses?.message.slice(0, 60) ?? '');

  const { data: clotureTest, error: erreurClotureTest } = await clientTest.functions.invoke(
    'cloturer-passation',
    { body: { sessionId: passationReussie } }
  );
  verifier(
    'La fonction serveur a calculé le résultat',
    !erreurClotureTest && typeof clotureTest?.resultat?.scaledPoint === 'number',
    clotureTest?.resultat ? `indice ${clotureTest.resultat.scaledPoint}` : ''
  );

  // C'est ici que le navigateur reprend la main : il lit ce que le serveur a écrit.
  await page.goto(`${BASE}/rapport/${passationReussie}`, { waitUntil: 'networkidle2' });
  const rapportOk = await attendreContenu(/Indice estimé|Aucun score ne peut|introuvable/);

  verifier(
    'Le rapport affiche l’indice calculé par le serveur',
    rapportOk.includes(String(clotureTest?.resultat?.scaledPoint)) &&
      !rapportOk.includes('Aucun score ne peut'),
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
  const corrections = await attendreContenu(/bonne réponse|réussie|manquée|Section réservée/);
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
  const attestation = await attendreContenu(/Attestation de passation|Délivrée à/);
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
  // Le compte a desormais une passation exploitable : c'est ELLE qui doit etre
  // publiee, et non celle au score refuse. L'ancienne assertion supposait qu'aucune
  // passation exploitable n'existait ; elle est devenue fausse quand l'etape 6 bis
  // en a produit une.
  verifier(
    'Le pseudonyme figure au classement apres consentement',
    classementAnonyme.includes(pseudonyme),
    classementAnonyme.includes(pseudonyme) ? '' : 'ABSENT DU CLASSEMENT'
  );
  verifier(
    'Le score publie est celui calcule par le serveur',
    classementAnonyme.includes(String(clotureTest?.resultat?.scaledPoint)),
    `attendu ${clotureTest?.resultat?.scaledPoint}`
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

console.log('\n=== REQUETES EN ECHEC ===');
// Deux refus sont ATTENDUS et prouvent que le produit fonctionne : la connexion
// d'un compte non confirme (400 sur /auth/v1/token), et la limite de cadence de
// l'offre gratuite (429 sur /auth/v1/signup).
const attendues = (u) => /\/auth\/v1\/token$/.test(u) || /429 .*\/auth\/v1\/signup$/.test(u);
const inattendues = [...new Set(requetesEnEchec)].filter((u) => !attendues(u));
console.log(
  inattendues.length === 0
    ? 'AUCUNE inattendue.'
    : inattendues.slice(0, 8).join('\n')
);
if (inattendues.length !== requetesEnEchec.length) {
  console.log('(refus attendus ignores : compte non confirme, limite de cadence)');
}

const reussies = etapes.filter((e) => e.ok).length;
console.log(`\n${reussies}/${etapes.length} vérifications passées.`);

// Énumérer les échecs : un compteur seul oblige à relire tout le journal, voire à
// relancer le parcours pour savoir ce qui a cassé.
const rates = etapes.filter((e) => !e.ok);
if (rates.length > 0) {
  console.log('\nA CORRIGER :');
  for (const e of rates) {
    console.log(`  - ${e.nom}${e.detail ? ' (' + e.detail + ')' : ''}`);
  }
}

if (echecs > 0) process.exitCode = 1;
