/**
 * Génère les échantillons de voix à comparer, et la page d'écoute.
 *
 * ── Ce que ce script fait ──
 *
 * Il prend UN extrait — une phrase d'introduction suivie d'un paragraphe réel —
 * et le fait lire par toutes les voix françaises que le service propose. Le
 * texte est identique d'une voix à l'autre : c'est la seule façon de comparer
 * autre chose que le contenu.
 *
 * L'extrait n'est pas choisi au hasard. Il contient un ordinal en exposant
 * (« XVIᵉ »), deux dates, des guillemets français et deux tirets cadratins,
 * c'est-à-dire précisément ce que le normaliseur doit corriger. On entend donc
 * en même temps la voix et le traitement du texte.
 *
 * ── Ce qu'il ne fait pas ──
 *
 * Il ne génère pas les cinquante articles. Cette étape vient après le choix de
 * la voix, avec `scripts/genere-audio.mjs`.
 *
 * ── Comment la liste des voix est obtenue ──
 *
 * Par l'API du service, jamais par une liste écrite à la main. Les catalogues
 * changent, et une liste recopiée finirait par proposer une voix retirée ou
 * taire une voix nouvelle.
 *
 * ── Clés ──
 *
 * Aucune clé n'est écrite dans le projet. Le script lit l'environnement, via
 * `.env`, qui est ignoré par Git :
 *
 *   AZURE_SPEECH_KEY et AZURE_SPEECH_REGION    (service recommandé)
 *   ELEVENLABS_API_KEY                         (variante)
 *
 * Usage :
 *   node scripts/genere-echantillons.mjs --service azure
 *   node scripts/genere-echantillons.mjs --service azure --liste-seulement
 *   node scripts/genere-echantillons.mjs --service elevenlabs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { lireEnv } from './env.mjs';
import { versSsml, versTexte } from '../src/lib/narration/normaliser.ts';

const SORTIE = 'public/ecoute';

/* ── L'extrait ────────────────────────────────────────────────────────── */

const INTRODUCTION =
  'Voici l’histoire de la chute de l’Empire romain. Ce n’est pas celle qu’on raconte d’habitude.';

const PARAGRAPHE =
  'On parle couramment de la chute de l’Empire romain en 476, comme d’un évènement unique et ' +
  'daté. La réalité est plus embarrassante : ce qui disparaît cette année-là, c’est la fonction ' +
  'd’empereur d’Occident, et elle disparaît sans bataille. L’Empire romain d’Orient, lui, ' +
  'continue depuis Constantinople pendant près de mille ans encore, jusqu’en 1453. Pendant tout ' +
  'ce temps, ses habitants ne s’appellent pas « Byzantins » — ce mot est une invention ' +
  'd’érudits du XVIᵉ siècle — mais Romains.';

const EXTRAIT_BRUT = `${INTRODUCTION}\n\n${PARAGRAPHE}`;

/* ── Arguments ────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const iService = args.indexOf('--service');
const SERVICE = iService !== -1 ? args[iService + 1] : 'azure';
const LISTE_SEULEMENT = args.includes('--liste-seulement');

const env = lireEnv();

/* ── Azure AI Speech ──────────────────────────────────────────────────── */

const azure = {
  nom: 'Azure AI Speech',

  verifierCles() {
    const manquantes = ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'].filter((n) => !env[n]);
    if (manquantes.length > 0) {
      throw new Error(
        `Variables absentes de .env : ${manquantes.join(', ')}.\n` +
          'Crée une ressource « Speech » sur portal.azure.com (le palier gratuit F0 suffit),\n' +
          'puis colle la clé et la région — par exemple francecentral — dans .env.'
      );
    }
  },

  /** Catalogue réel des voix, filtré sur le français de France. */
  async voix() {
    const region = env.AZURE_SPEECH_REGION;
    const reponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      { headers: { 'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY } }
    );
    if (!reponse.ok) {
      throw new Error(`Liste des voix refusée : ${reponse.status} ${await reponse.text()}`);
    }
    const toutes = await reponse.json();
    return toutes
      .filter((v) => v.Locale === 'fr-FR')
      .map((v) => ({
        id: v.ShortName,
        nom: v.LocalName ?? v.DisplayName,
        genre: v.Gender === 'Female' ? 'féminine' : 'masculine',
        // Azure signale les voix d'enfant, information décisive ici : une voix
        // d'enfant ne convient pas pour narrer six minutes d'histoire.
        age: (v.SecondaryLocaleList ? '' : '') || v.VoiceTag?.VoicePersonalities?.join(', ') || '',
        styles: v.StyleList ?? [],
        multilingue: /Multilingual/.test(v.ShortName),
      }))
      .sort((a, b) => a.genre.localeCompare(b.genre) || a.id.localeCompare(b.id));
  },

  /**
   * Synthétise l'extrait avec une voix, et rend l'audio et les repères de mots.
   *
   * Le format demandé est de l'AAC en conteneur MP4 : c'est le seul codec lu
   * partout, Safari et iOS compris, alors qu'Opus dans un conteneur Ogg ne
   * l'est pas de façon fiable.
   */
  async synthetiser(voix) {
    const region = env.AZURE_SPEECH_REGION;
    const ssml =
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
      `xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="fr-FR">` +
      `<voice name="${voix.id}">` +
      `<prosody rate="-4%">` +
      `${versSsml(INTRODUCTION)}<break time="700ms"/>${versSsml(PARAGRAPHE)}` +
      `</prosody></voice></speak>`;

    const reponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
          'User-Agent': 'nexus-echantillons',
        },
        body: ssml,
      }
    );

    if (!reponse.ok) {
      throw new Error(`Synthèse refusée pour ${voix.id} : ${reponse.status} ${await reponse.text()}`);
    }

    return { audio: Buffer.from(await reponse.arrayBuffer()), extension: 'mp3' };
  },
};

/* ── ElevenLabs ───────────────────────────────────────────────────────── */

const elevenlabs = {
  nom: 'ElevenLabs',

  verifierCles() {
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY absente de .env.');
    }
  },

  async voix() {
    const reponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
    });
    if (!reponse.ok) {
      throw new Error(`Liste des voix refusée : ${reponse.status} ${await reponse.text()}`);
    }
    const { voices } = await reponse.json();
    return voices
      .filter((v) => {
        const langues = v.verified_languages ?? [];
        const etiquettes = Object.values(v.labels ?? {}).join(' ').toLowerCase();
        return (
          langues.some((l) => l.language === 'fr') ||
          etiquettes.includes('french') ||
          etiquettes.includes('français')
        );
      })
      .map((v) => ({
        id: v.voice_id,
        nom: v.name,
        genre: (v.labels?.gender ?? '').toLowerCase().startsWith('f') ? 'féminine' : 'masculine',
        age: v.labels?.age ?? '',
        styles: [v.labels?.description ?? ''].filter(Boolean),
        multilingue: true,
      }));
  },

  async synthetiser(voix) {
    const reponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voix.id}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Pas de SSML : ElevenLabs ne le lit pas. On envoie donc la sortie
          // texte du normaliseur, où les sigles sont épelés en clair.
          text: versTexte(EXTRAIT_BRUT),
          model_id: 'eleven_multilingual_v2',
        }),
      }
    );
    if (!reponse.ok) {
      throw new Error(`Synthèse refusée pour ${voix.nom} : ${reponse.status} ${await reponse.text()}`);
    }
    return { audio: Buffer.from(await reponse.arrayBuffer()), extension: 'mp3' };
  },
};

const SERVICES = { azure, elevenlabs };

/* ── Exécution ────────────────────────────────────────────────────────── */

const adaptateur = SERVICES[SERVICE];
if (!adaptateur) {
  console.error(`Service inconnu : ${SERVICE}. Disponibles : ${Object.keys(SERVICES).join(', ')}.`);
  process.exit(1);
}

console.log(`Service : ${adaptateur.nom}`);
console.log(`Extrait : ${EXTRAIT_BRUT.length} signes bruts, ${versTexte(EXTRAIT_BRUT).length} apres normalisation.`);
console.log('');

try {
  adaptateur.verifierCles();
} catch (erreur) {
  console.error(String(erreur.message));
  process.exit(1);
}

const voix = await adaptateur.voix();
console.log(`${voix.length} voix francaises proposees par le service :`);
for (const v of voix) {
  console.log(
    `  ${v.id.padEnd(38)} ${v.genre.padEnd(10)} ${v.multilingue ? 'multilingue' : '          '} ${v.styles.slice(0, 3).join(', ')}`
  );
}
console.log('');

if (LISTE_SEULEMENT) {
  console.log('Liste seulement : aucune synthese, aucun caractere facture.');
  process.exit(0);
}

const cout = (voix.length * versTexte(EXTRAIT_BRUT).length) / 1_000_000;
console.log(
  `Synthese de ${voix.length} echantillons, soit environ ${Math.round(cout * 1_000_000).toLocaleString('fr-FR')} caracteres factures.`
);
console.log('');

mkdirSync(SORTIE, { recursive: true });

const manifeste = { service: adaptateur.nom, genere: new Date().toISOString(), extrait: { introduction: INTRODUCTION, paragraphe: PARAGRAPHE, normalise: versTexte(EXTRAIT_BRUT) }, voix: [] };

for (const v of voix) {
  try {
    const { audio, extension } = await adaptateur.synthetiser(v);
    const fichier = `${v.id.replace(/[^\w.-]/g, '_')}.${extension}`;
    writeFileSync(`${SORTIE}/${fichier}`, audio);
    manifeste.voix.push({ ...v, fichier, octets: audio.length });
    console.log(`  OK     ${v.id.padEnd(38)} ${(audio.length / 1024).toFixed(0)} ko`);
  } catch (erreur) {
    console.log(`  ECHEC  ${v.id.padEnd(38)} ${String(erreur.message).slice(0, 90)}`);
  }
}

writeFileSync(`${SORTIE}/manifeste.json`, JSON.stringify(manifeste, null, 1), 'utf8');

console.log('');
console.log(`${manifeste.voix.length} echantillon(s) dans ${SORTIE}/`);
console.log('Page d ecoute : /ecoute/ sur le deploiement de previsualisation.');
