import { beforeEach, describe, expect, it } from 'vitest';
import { magasinLocal, type MagasinTransactions } from '../magasin';
import { comparerConstant, creerProviderSandbox, signerSandbox } from '../sandbox';
import {
  chaineASigner,
  egaliteConstante,
  verifierSignatureCinetPay,
} from '../cinetpay';
import {
  DEVISE,
  MONTANT_DEBLOCAGE,
  SignatureInvalide,
  genererReference,
  montantAcceptable,
} from '../types';

const UTILISATEUR = 'user-1';
const PLAN = 'rapport:sess-1';

function nouveauProvider(magasin: MagasinTransactions) {
  return creerProviderSandbox({ magasin, secret: 'secret-de-test' });
}

describe('contraintes de montant imposées par l’agrégateur', () => {
  it('accepte 500 XOF : au-dessus du minimum et multiple de 5', () => {
    expect(montantAcceptable(MONTANT_DEBLOCAGE, DEVISE)).toBe(true);
  });

  it('refuse un montant sous le minimum de 100 XOF', () => {
    expect(montantAcceptable(50, DEVISE)).toBe(false);
    expect(montantAcceptable(95, DEVISE)).toBe(false);
  });

  it('refuse un montant qui n’est pas multiple de 5', () => {
    expect(montantAcceptable(501, DEVISE)).toBe(false);
    expect(montantAcceptable(123, DEVISE)).toBe(false);
  });

  it('refuse un montant non entier', () => {
    expect(montantAcceptable(500.5, DEVISE)).toBe(false);
  });
});

describe('référence de transaction', () => {
  it('est unique sur un grand nombre de tirages', () => {
    const references = new Set(Array.from({ length: 5000 }, () => genererReference()));
    expect(references.size).toBe(5000);
  });

  it('porte un préfixe lisible pour le support', () => {
    expect(genererReference()).toMatch(/^NX-[0-9A-Z]+-[0-9A-F]+$/);
  });
});

describe('cas 1 — paiement réussi', () => {
  let magasin: MagasinTransactions;

  beforeEach(() => {
    magasin = magasinLocal();
  });

  it('passe la transaction en succeeded et signale un premier passage', async () => {
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(
      UTILISATEUR,
      PLAN,
      MONTANT_DEBLOCAGE,
      DEVISE
    );

    expect((await provider.verifyPayment(reference)).statut).toBe('pending');

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });

    const evenement = await provider.handleWebhook(rawBody, signature);

    expect(evenement.statut).toBe('succeeded');
    expect(evenement.dejaTraite).toBe(false);
    expect((await provider.verifyPayment(reference)).statut).toBe('succeeded');
  });

  it('journalise chaque transition avec son horodatage et sa source', async () => {
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);
    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    await provider.handleWebhook(rawBody, signature);

    const transitions = magasin.transitions(reference);
    expect(transitions).toHaveLength(2);
    expect(transitions[0]).toMatchObject({ de: null, vers: 'pending', source: 'creation' });
    expect(transitions[1]).toMatchObject({ de: 'pending', vers: 'succeeded', source: 'webhook' });
    expect(new Date(transitions[1].survenuLe).getTime()).not.toBeNaN();
  });
});

describe('cas 2 — paiement échoué', () => {
  it('passe en failed et conserve un motif exploitable à l’écran', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'failed',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
      motif: 'Le solde de votre compte mobile money est insuffisant.',
    });
    await provider.handleWebhook(rawBody, signature);

    const etat = await provider.verifyPayment(reference);
    expect(etat.statut).toBe('failed');
    expect(etat.motif).toContain('solde');
  });

  it('permet de réessayer avec une NOUVELLE référence, jamais l’ancienne', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);

    const premier = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);
    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference: premier.reference,
      statut: 'failed',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    await provider.handleWebhook(rawBody, signature);

    const second = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);
    expect(second.reference).not.toBe(premier.reference);
    expect((await provider.verifyPayment(second.reference)).statut).toBe('pending');
    // L'ancienne reste échouée : elle n'est pas recyclée.
    expect((await provider.verifyPayment(premier.reference)).statut).toBe('failed');
  });
});

describe('cas 3 — paiement en attente', () => {
  it('reste pending tant qu’aucun webhook n’est arrivé', async () => {
    const provider = nouveauProvider(magasinLocal());
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    // Ce que fait le polling côté client : plusieurs lectures, aucun effet de bord.
    for (let i = 0; i < 3; i++) {
      expect((await provider.verifyPayment(reference)).statut).toBe('pending');
    }
  });

  it('se conclut par le webhook, pas par le retour du navigateur', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    // L'utilisateur a quitté la page : rien ne change côté serveur.
    expect((await provider.verifyPayment(reference)).statut).toBe('pending');

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    await provider.handleWebhook(rawBody, signature);
    expect((await provider.verifyPayment(reference)).statut).toBe('succeeded');
  });
});

describe('cas 4 — expiration par TTL', () => {
  it('bascule en expired au-delà du délai', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const dansUneHeure = new Date(Date.now() + 60 * 60_000);
    const expirees = magasin.expirerLesDepassees(dansUneHeure);

    expect(expirees).toContain(reference);
    const etat = await provider.verifyPayment(reference);
    expect(etat.statut).toBe('expired');
    expect(etat.motif).toContain('expiré');
  });

  it('rend la référence inutilisable : un webhook tardif ne la ressuscite pas', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    magasin.expirerLesDepassees(new Date(Date.now() + 60 * 60_000));

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    await provider.handleWebhook(rawBody, signature);

    // L'état terminal ne se rouvre pas.
    expect((await provider.verifyPayment(reference)).statut).toBe('expired');
  });

  it('journalise le refus de transition depuis un état terminal', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);
    magasin.expirerLesDepassees(new Date(Date.now() + 60 * 60_000));

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    await provider.handleWebhook(rawBody, signature);

    const refus = magasin.transitions(reference).find((t) => t.detail?.includes('terminal'));
    expect(refus).toBeDefined();
    expect(refus?.vers).toBe('succeeded');
  });
});

describe('cas 5 — double paiement et webhook rejoué', () => {
  it('n’applique le webhook qu’une seule fois, même rejoué dix fois', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });

    const premier = await provider.handleWebhook(rawBody, signature);
    expect(premier.dejaTraite).toBe(false);

    for (let i = 0; i < 10; i++) {
      const rejeu = await provider.handleWebhook(rawBody, signature);
      // Le rejeu réussit — pour que l'agrégateur cesse de réessayer — sans recréditer.
      expect(rejeu.dejaTraite).toBe(true);
      expect(rejeu.statut).toBe('succeeded');
    }

    // Une seule transition vers succeeded dans tout le journal.
    const versSucces = magasin
      .transitions(reference)
      .filter((t) => t.vers === 'succeeded' && !t.detail?.includes('terminal'));
    expect(versSucces).toHaveLength(1);
  });

  it('refuse un webhook dont le montant diffère de la transaction enregistrée', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    // Corps correctement signé, mais annonçant 5 francs au lieu de 500.
    const corps = JSON.stringify({
      reference,
      statut: 'succeeded',
      montant: 5,
      devise: DEVISE,
    });
    const signature = await signerSandbox(corps, 'secret-de-test');

    await expect(provider.handleWebhook(corps, signature)).rejects.toThrow(SignatureInvalide);
    expect((await provider.verifyPayment(reference)).statut).toBe('rejected');
  });
});

describe('cas 6 — signature invalide ou absente', () => {
  it('rejette un webhook sans signature et n’accorde rien', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const { rawBody } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });

    await expect(provider.handleWebhook(rawBody, null)).rejects.toThrow(SignatureInvalide);
    expect((await provider.verifyPayment(reference)).statut).toBe('pending');
  });

  it('rejette une signature forgée', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const { rawBody } = await provider.fabriquerWebhook({
      reference,
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });

    await expect(provider.handleWebhook(rawBody, 'f'.repeat(64))).rejects.toThrow(SignatureInvalide);
    expect((await provider.verifyPayment(reference)).statut).toBe('pending');
  });

  it('rejette un corps modifié après signature', async () => {
    const magasin = magasinLocal();
    const provider = nouveauProvider(magasin);
    const { reference } = await provider.createCheckout(UTILISATEUR, PLAN, MONTANT_DEBLOCAGE, DEVISE);

    const { rawBody, signature } = await provider.fabriquerWebhook({
      reference,
      statut: 'failed',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    const falsifie = rawBody.replace('"failed"', '"succeeded"');

    await expect(provider.handleWebhook(falsifie, signature)).rejects.toThrow(SignatureInvalide);
    expect((await provider.verifyPayment(reference)).statut).toBe('pending');
  });

  it('rejette une signature valide portant une référence inconnue', async () => {
    const provider = nouveauProvider(magasinLocal());
    const corps = JSON.stringify({
      reference: 'NX-INEXISTANTE',
      statut: 'succeeded',
      montant: MONTANT_DEBLOCAGE,
      devise: DEVISE,
    });
    const signature = await signerSandbox(corps, 'secret-de-test');

    await expect(provider.handleWebhook(corps, signature)).rejects.toThrow(SignatureInvalide);
  });
});

describe('comparaison de signatures', () => {
  it('reste vraie pour des chaînes identiques', () => {
    expect(comparerConstant('abc123', 'abc123')).toBe(true);
    expect(egaliteConstante('abc123', 'abc123')).toBe(true);
  });

  it('est fausse dès un octet différent, et pour des longueurs différentes', () => {
    expect(comparerConstant('abc123', 'abc124')).toBe(false);
    expect(comparerConstant('abc', 'abcd')).toBe(false);
    expect(egaliteConstante('abc123', 'abc124')).toBe(false);
  });
});

describe('signature CinetPay', () => {
  const SECRET = 'cle-secrete-marchand';

  const champs = {
    cpm_site_id: '123456',
    cpm_trans_id: 'NX-TEST-1',
    cpm_trans_date: '2026-09-10 20:30:00',
    cpm_amount: '500',
    cpm_currency: 'XOF',
    signature: 'sig-cinetpay',
    payment_method: 'WAVECI',
    cel_phone_num: '0700000000',
    cpm_phone_prefixe: '225',
    cpm_language: 'fr',
    cpm_version: 'V4',
    cpm_payment_config: 'SINGLE',
    cpm_page_action: 'PAYMENT',
    cpm_custom: '',
    cpm_designation: 'NEXUS',
    cpm_error_message: '',
  };

  async function signer(corps: string): Promise<string> {
    const encodeur = new TextEncoder();
    const cle = await crypto.subtle.importKey(
      'raw',
      encodeur.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const brut = await crypto.subtle.sign('HMAC', cle, encodeur.encode(corps));
    return Array.from(new Uint8Array(brut), (o) => o.toString(16).padStart(2, '0')).join('');
  }

  it('concatène les seize champs dans l’ordre de la documentation', () => {
    const chaine = chaineASigner(champs);
    expect(chaine.startsWith('123456NX-TEST-1')).toBe(true);
    expect(chaine).toContain('500XOF');
    // Un champ absent compte comme chaîne vide, sans décaler les suivants.
    expect(chaineASigner({ cpm_site_id: 'A', cpm_trans_id: 'B' })).toBe('AB');
  });

  it('accepte un x-token calculé sur la bonne chaîne', async () => {
    const corps = new URLSearchParams(champs).toString();
    const token = await signer(chaineASigner(champs));

    const verifies = await verifierSignatureCinetPay(corps, token, SECRET);
    expect(verifies.cpm_trans_id).toBe('NX-TEST-1');
  });

  it('rejette un x-token absent, forgé, ou calculé avec une autre clé', async () => {
    const corps = new URLSearchParams(champs).toString();
    const bon = await signer(chaineASigner(champs));

    await expect(verifierSignatureCinetPay(corps, null, SECRET)).rejects.toThrow(SignatureInvalide);
    await expect(verifierSignatureCinetPay(corps, '0'.repeat(64), SECRET)).rejects.toThrow(
      SignatureInvalide
    );
    await expect(verifierSignatureCinetPay(corps, bon, 'mauvaise-cle')).rejects.toThrow(
      SignatureInvalide
    );
  });

  it('rejette un corps dont un champ a été modifié après signature', async () => {
    const token = await signer(chaineASigner(champs));
    const falsifie = new URLSearchParams({ ...champs, cpm_amount: '5' }).toString();

    await expect(verifierSignatureCinetPay(falsifie, token, SECRET)).rejects.toThrow(
      SignatureInvalide
    );
  });
});
