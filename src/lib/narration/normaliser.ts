/**
 * Préparation du texte pour la lecture à voix haute.
 *
 * ── Pourquoi ce module existe ──
 *
 * Les articles sont écrits pour l'œil. Envoyés tels quels à un moteur de
 * synthèse, ils produisent des fautes de lecture audibles et systématiques.
 * Relevé sur les cinquante articles :
 *
 *   28 nombres écrits avec une espace — « 200 000 », « 2 016 », « 38 957 ».
 *      Aucun moteur ne les lit comme un seul nombre : on entend « deux » puis
 *      « zéro zéro zéro ». C'est le défaut le plus audible, et le plus facile
 *      à corriger.
 *   15 ordinaux en exposant — « XVIᵉ », « Iᵉʳ », « 38ᵉ ». Le caractère en
 *      exposant est soit ignoré, soit épelé.
 *   69 sigles — dont la prononciation ne se devine pas : « URSS » se lit comme
 *      un mot, « ETF » s'épelle. Aucun moteur ne tranche correctement à tous
 *      les coups.
 *   338 tirets cadratins et 282 guillemets, qui produisent des pauses
 *      erratiques ou des silences.
 *
 * ── Deux sorties, et pourquoi ──
 *
 * `versTexte` rend du texte simple, pour les services qui n'acceptent pas de
 * balisage. `versSsml` rend du SSML, où les sigles à épeler passent par
 * `say-as interpret-as="characters"` : le moteur épelle alors avec les noms de
 * lettres français, ce qui vaut mieux que mes approximations phonétiques.
 *
 * Les deux chemins partagent toutes les autres transformations, pour que le
 * texte entendu soit le même quel que soit le service.
 */

/* ── Chiffres romains ─────────────────────────────────────────────────── */

const VALEURS_ROMAINES: ReadonlyArray<readonly [string, number]> = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1],
];

/** Écrit un entier en chiffres romains, sous sa forme canonique. */
export function entierVersRomain(n: number): string {
  let reste = n;
  let sortie = '';
  for (const [signe, valeur] of VALEURS_ROMAINES) {
    while (reste >= valeur) {
      sortie += signe;
      reste -= valeur;
    }
  }
  return sortie;
}

/**
 * Convertit un chiffre romain en entier. `null` si la forme est invalide.
 *
 * La validation se fait par aller-retour : on réécrit l'entier obtenu en
 * chiffres romains et on exige la même chaîne. Sans cela, des mots écrits en
 * capitales passent pour des nombres — « CIVIL » se décode en 155 et « DIX »
 * en 509. Le test correspondant a attrapé exactement ce cas, et la forme
 * canonique est le seul critère qui les rejette tous sans liste noire.
 */
export function romainVersEntier(romain: string): number | null {
  if (!/^[IVXLCDM]+$/.test(romain)) return null;
  let reste = romain;
  let total = 0;
  for (const [signe, valeur] of VALEURS_ROMAINES) {
    while (reste.startsWith(signe)) {
      total += valeur;
      reste = reste.slice(signe.length);
    }
  }
  if (reste.length > 0 || total === 0) return null;
  return entierVersRomain(total) === romain ? total : null;
}

/* ── Nombres en mots ──────────────────────────────────────────────────── */

const UNITES = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const DIZAINES: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
  7: 'soixante',
  8: 'quatre-vingt',
  9: 'quatre-vingt',
};

/**
 * Écrit un entier de 0 à 999 en mots.
 *
 * Limité volontairement : seuls les ordinaux en ont besoin, et ils ne dépassent
 * pas le siècle. Les grands nombres sont laissés en chiffres, que les moteurs
 * lisent correctement dès lors qu'ils ne sont pas coupés par une espace.
 */
export function entierEnMots(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) {
    throw new RangeError(`entierEnMots attend 0..999, reçu ${n}`);
  }
  if (n < 20) return UNITES[n];

  if (n < 100) {
    const dizaine = Math.floor(n / 10);
    const unite = n % 10;
    const base = DIZAINES[dizaine === 7 ? 6 : dizaine === 9 ? 8 : dizaine];
    const reste = dizaine === 7 || dizaine === 9 ? unite + 10 : unite;

    if (reste === 0) return dizaine === 8 ? 'quatre-vingts' : base;
    if (reste === 1 && dizaine !== 8 && dizaine !== 9) return `${base} et un`;
    if (reste === 11 && dizaine === 7) return 'soixante et onze';
    return `${base}-${UNITES[reste]}`;
  }

  const centaine = Math.floor(n / 100);
  const reste = n % 100;
  const tete = centaine === 1 ? 'cent' : `${UNITES[centaine]} cent`;
  if (reste === 0) return centaine === 1 ? 'cent' : `${UNITES[centaine]} cents`;
  return `${tete} ${entierEnMots(reste)}`;
}

/** Écrit un ordinal en mots : 1 → premier, 19 → dix-neuvième. */
export function ordinalEnMots(n: number, feminin = false): string {
  if (n === 1) return feminin ? 'première' : 'premier';

  let radical = entierEnMots(n);

  // Le « s » du pluriel tombe : « quatre-vingts » → « quatre-vingtième »,
  // « deux cents » → « deux centième ». Mais le « s » de « trois », « six » et
  // « dix » appartient au mot et se conserve — une première version retirait
  // tout « s » final et produisait « troiième ».
  radical = radical.replace(/ts$/, 't');

  if (radical.endsWith('cinq')) radical = `${radical}u`;
  else if (radical.endsWith('neuf')) radical = `${radical.slice(0, -1)}v`;
  else if (radical.endsWith('e')) radical = radical.slice(0, -1);

  return `${radical}ième`;
}

/* ── Sigles ───────────────────────────────────────────────────────────── */

/** Nom français des lettres, pour les sigles épelés hors SSML. */
const NOM_DES_LETTRES: Record<string, string> = {
  A: 'a',
  B: 'bé',
  C: 'cé',
  D: 'dé',
  E: 'e',
  F: 'effe',
  G: 'gé',
  H: 'ache',
  I: 'i',
  J: 'ji',
  K: 'ka',
  L: 'elle',
  M: 'emme',
  N: 'enne',
  O: 'o',
  P: 'pé',
  Q: 'ku',
  R: 'erre',
  S: 'esse',
  T: 'té',
  U: 'u',
  V: 'vé',
  W: 'double vé',
  X: 'ixe',
  Y: 'i grec',
  Z: 'zède',
  '0': 'zéro',
  '1': 'un',
  '2': 'deux',
  '3': 'trois',
  '4': 'quatre',
  '5': 'cinq',
  '6': 'six',
  '7': 'sept',
  '8': 'huit',
  '9': 'neuf',
};

/**
 * Comment lire chaque sigle du corpus.
 *
 * `lettres` : épelé. `mot` : prononcé comme un mot, donc laissé tel quel.
 * `oral` : forme écrite à substituer, quand ni l'un ni l'autre ne convient.
 *
 * La liste vient du relevé effectif des cinquante articles, pas d'une
 * anticipation : 69 formes trouvées, dont les chiffres romains traités
 * séparément. Un sigle absent de cette table est laissé tel quel — c'est le
 * comportement le moins risqué, et `scripts/verifie-narration.mjs` signale
 * ceux qui apparaissent sans y figurer.
 */
export const SIGLES: Record<string, { mode: 'lettres' | 'mot'; oral?: string }> = {
  // Notation financière : se dit « triple A », jamais « a a a ».
  AAA: { mode: 'mot', oral: 'triple A' },
  ADN: { mode: 'lettres' },
  AIG: { mode: 'lettres' },
  ANC: { mode: 'lettres' },
  ARPANET: { mode: 'mot' },
  BBC: { mode: 'lettres' },
  BCEAO: { mode: 'lettres' },
  BEAC: { mode: 'mot', oral: 'Béac' },
  BGP: { mode: 'lettres' },
  CDO: { mode: 'lettres' },
  CDS: { mode: 'lettres' },
  CEMAC: { mode: 'mot', oral: 'Cémac' },
  CERN: { mode: 'mot', oral: 'Cerne' },
  CFA: { mode: 'lettres' },
  CIPS: { mode: 'lettres' },
  CNY: { mode: 'lettres' },
  // Formule chimique : on dit la molécule, pas ses lettres.
  CO2: { mode: 'mot', oral: 'dioxyde de carbone' },
  CRISPR: { mode: 'mot', oral: 'Crispeur' },
  DNS: { mode: 'lettres' },
  EQT: { mode: 'lettres' },
  ETF: { mode: 'lettres' },
  FMI: { mode: 'lettres' },
  FNI: { mode: 'lettres' },
  GPS: { mode: 'lettres' },
  GPT: { mode: 'lettres' },
  IP: { mode: 'lettres' },
  IRM: { mode: 'lettres' },
  // Indicatif de vol : « KAL zéro zéro sept ».
  KAL: { mode: 'lettres' },
  KKR: { mode: 'lettres' },
  LBO: { mode: 'lettres' },
  LIGO: { mode: 'mot', oral: 'Ligo' },
  // Catalogue astronomique : la lettre, puis le nombre.
  M87: { mode: 'mot', oral: 'emme 87' },
  MAUD: { mode: 'mot', oral: 'Maud' },
  MOXIE: { mode: 'mot', oral: 'Moxie' },
  NASA: { mode: 'mot', oral: 'Nasa' },
  NSC: { mode: 'lettres' },
  OCDE: { mode: 'lettres' },
  OECE: { mode: 'lettres' },
  ONU: { mode: 'mot', oral: 'ONU' },
  OTAN: { mode: 'mot', oral: 'Otan' },
  PIB: { mode: 'lettres' },
  RAND: { mode: 'mot', oral: 'Rande' },
  RFA: { mode: 'lettres' },
  RJR: { mode: 'lettres' },
  SALT: { mode: 'mot', oral: 'Salt' },
  SAT: { mode: 'lettres' },
  SPIVA: { mode: 'mot', oral: 'Spiva' },
  TARP: { mode: 'mot', oral: 'Tarpe' },
  TCP: { mode: 'lettres' },
  TLS: { mode: 'lettres' },
  TNT: { mode: 'lettres' },
  TRI: { mode: 'lettres' },
  UCLA: { mode: 'lettres' },
  UEMOA: { mode: 'mot', oral: 'UEMOA' },
  URSS: { mode: 'mot', oral: 'URSS' },
  VIH: { mode: 'lettres' },
  WACS: { mode: 'mot', oral: 'Wacs' },
};

/** Épelle un sigle avec les noms de lettres français. */
export function epeler(sigle: string): string {
  return [...sigle]
    .map((c) => NOM_DES_LETTRES[c] ?? c)
    .join(' ');
}

/* ── Unités ───────────────────────────────────────────────────────────── */

const UNITES_MESURE: ReadonlyArray<readonly [RegExp, string]> = [
  [/(\d)\s?TWh\b/g, '$1 térawattheures'],
  [/(\d)\s?GWh\b/g, '$1 gigawattheures'],
  [/(\d)\s?kWh\b/g, '$1 kilowattheures'],
  [/(\d)\s?Wh\/kg\b/g, '$1 wattheures par kilogramme'],
  [/(\d)\s?ppm\b/g, '$1 parties par million'],
  [/(\d)\s?Mb\/s\b/g, '$1 mégabits par seconde'],
  [/(\d)\s?km\b/g, '$1 kilomètres'],
  [/(\d)\s?kt\b/g, '$1 kilotonnes'],
  [/(\d)\s?kg\b/g, '$1 kilogrammes'],
  [/(\d)\s?ko\b/g, '$1 kilo-octets'],
  [/(\d)\s?Mo\b/g, '$1 mégaoctets'],
  [/(\d)\s?Go\b/g, '$1 gigaoctets'],
];

/* ── Le pipeline commun ───────────────────────────────────────────────── */

/**
 * Transformations partagées par les deux sorties.
 *
 * L'ordre compte et n'est pas négociable : les nombres à espace doivent être
 * recollés avant que les fourchettes d'années ne soient traitées, et les
 * ordinaux avant que les chiffres romains isolés ne le soient.
 */
function commun(texte: string): string {
  let t = texte;

  // 1. Recoller les nombres écrits avec une espace : « 200 000 » → « 200000 ».
  //    Répété, pour couvrir « 1 000 000 ». L'espace insécable est incluse.
  for (let i = 0; i < 3; i++) {
    t = t.replace(/(\d)[\u0020\u00a0\u202f](\d{3})\b/g, '$1$2');
  }

  // 2. Ordinaux en exposant, romains puis arabes.
  //
  //    Aucune frontière de mot après l'exposant : `ᵉ` est un modificateur
  //    Unicode, absent de `\w`, donc `\b` ne se forme pas entre lui et
  //    l'espace suivante. La première version portait ce `\b` et ne
  //    transformait rien du tout — le test l'a signalé.
  t = t.replace(/\b([IVXLCDM]+)ᵉʳ?/g, (tout, romain: string) => {
    const n = romainVersEntier(romain);
    return n === null ? tout : ordinalEnMots(n);
  });
  t = t.replace(/\b(\d+)ᵉʳ?/g, (tout, chiffres: string) => {
    if (!/[ᵉʳ]/.test(tout)) return tout;
    const n = Number.parseInt(chiffres, 10);
    return n <= 999 ? ordinalEnMots(n) : chiffres;
  });

  // 3. Chiffres romains restants suivis de « siècle » ou d'un nom propre.
  t = t.replace(/\b([IVXLCDM]{2,})\b(?=\s|,|\.|$)/g, (tout, romain: string) => {
    const n = romainVersEntier(romain);
    return n === null ? tout : String(n);
  });

  // 4. Ères.
  t = t.replace(/av\.\s?J\.-C\./g, 'avant Jésus-Christ');
  t = t.replace(/ap\.\s?J\.-C\./g, 'après Jésus-Christ');

  // 5. Fourchettes d'années : « 1947-1991 » → « de 1947 à 1991 ».
  //
  //    Trois chiffres acceptés, pour l'Antiquité : « 284-305 » pour Dioclétien,
  //    « 165-180 » pour la peste antonine. Deux chiffres sont exclus — le même
  //    motif transformerait des plages qui ne sont pas des dates.
  t = t.replace(/\b(\d{3,4})\s?-\s?(\d{3,4})\b/g, 'de $1 à $2');

  // 6. Pourcentages et unités.
  t = t.replace(/\s?%/g, ' pour cent');
  t = t.replace(/CO₂/g, 'CO2');
  for (const [motif, remplacement] of UNITES_MESURE) t = t.replace(motif, remplacement);

  // 7. Ponctuation de l'œil vers ponctuation de l'oreille.
  //    Le tiret cadratin devient une virgule : il marque une incise, et une
  //    virgule produit la pause courte attendue. Les guillemets disparaissent,
  //    faute de quoi les moteurs y placent des silences erratiques.
  t = t.replace(/\s?—\s?/g, ', ');
  t = t.replace(/[«»"]/g, '');
  t = t.replace(/\s?\(\s?/g, ', ').replace(/\s?\)/g, ',');

  // 8. Nettoyage : ponctuation doublée par les substitutions ci-dessus.
  t = t.replace(/,\s*,/g, ',');
  t = t.replace(/,\s*\./g, '.');
  t = t.replace(/\s+([,.;:!?])/g, '$1');
  t = t.replace(/[\u0020\u00a0\u202f]{2,}/g, ' ');

  return t.trim();
}

/** Texte prêt pour un service sans balisage. Les sigles sont épelés en clair. */
export function versTexte(texte: string): string {
  let t = commun(texte);

  t = t.replace(/\b[A-Z][A-Z0-9]{1,6}\b/g, (sigle) => {
    const regle = SIGLES[sigle];
    if (!regle) return sigle;
    if (regle.mode === 'mot') return regle.oral ?? sigle;
    return epeler(sigle);
  });

  return t;
}

/** Échappe ce qui ne peut pas rester tel quel dans du XML. */
export function echapperXml(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Texte prêt pour un service SSML.
 *
 * Les sigles à épeler passent par `say-as`, qui laisse le moteur employer les
 * noms de lettres de sa propre langue — plus fiable qu'une transcription
 * phonétique écrite à la main.
 */
export function versSsml(texte: string): string {
  const t = commun(texte);
  const morceaux: string[] = [];
  let position = 0;

  const motif = /\b[A-Z][A-Z0-9]{1,6}\b/g;
  let trouve: RegExpExecArray | null;

  while ((trouve = motif.exec(t)) !== null) {
    const sigle = trouve[0];
    const regle = SIGLES[sigle];
    if (!regle) continue;

    morceaux.push(echapperXml(t.slice(position, trouve.index)));
    morceaux.push(
      regle.mode === 'lettres'
        ? `<say-as interpret-as="characters">${echapperXml(sigle)}</say-as>`
        : echapperXml(regle.oral ?? sigle)
    );
    position = trouve.index + sigle.length;
  }

  morceaux.push(echapperXml(t.slice(position)));
  return morceaux.join('');
}
