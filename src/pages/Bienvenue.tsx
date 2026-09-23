import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../lib/backend';
import { useAuth } from '../app/auth';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { CHEMINS } from '../app/navigation';

/**
 * Onboarding en trois étapes, passable à tout moment.
 *
 * Chaque étape doit justifier son existence : elle demande quelque chose dont le
 * produit a besoin, ou elle dit quelque chose que l'utilisateur doit savoir avant de
 * commencer. Aucune étape décorative.
 */

const ETAPES = 3;

export function Bienvenue() {
  const navigate = useNavigate();
  const { profil, rafraichirProfil } = useAuth();

  const [etape, setEtape] = useState(1);
  const [nomLegal, setNomLegal] = useState(profil?.nomLegal ?? '');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function terminer() {
    setErreur(null);
    setEnvoi(true);

    if (nomLegal.trim()) {
      const majNom = await backend.majProfil({ nomLegal: nomLegal.trim() });
      if (!majNom.ok) {
        setEnvoi(false);
        setErreur(majNom.message);
        return;
      }
    }

    const resultat = await backend.marquerOnboarde();
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }

    await rafraichirProfil();
    navigate(CHEMINS.tableauDeBord, { replace: true });
  }

  async function passer() {
    setEnvoi(true);
    await backend.marquerOnboarde();
    setEnvoi(false);
    await rafraichirProfil();
    navigate(CHEMINS.tableauDeBord, { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="nombres text-micro text-brume">
        Étape {etape} sur {ETAPES}
      </p>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {Array.from({ length: ETAPES }).map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 ${i < etape ? 'bg-mesure' : 'bg-ardoise'}`}
          />
        ))}
      </div>

      <div className="mt-8">
        {etape === 1 && (
          <Etape
            titre="Ce que NEXUS mesure"
            corps="Cinq aptitudes cognitives : matrices logiques, séries numériques, analogies verbales, rotation spatiale et mémoire de travail. Une évaluation dure environ 25 minutes et compte 35 questions."
          />
        )}

        {etape === 2 && (
          <Etape
            titre="Ce que NEXUS ne fait pas"
            corps="Le résultat est une estimation, toujours accompagnée de sa marge d’erreur. Ce n’est pas un diagnostic psychologique et cela ne remplace pas un bilan conduit par un psychologue. Si vos réponses ne se distinguent pas d’un tirage au hasard, aucun score n’est affiché."
          />
        )}

        {etape === 3 && (
          <div className="flex flex-col gap-6">
            <Etape
              titre="Le nom de votre attestation"
              corps="Il figurera sur l’attestation de passation. Vous pouvez le renseigner plus tard, ou le laisser vide."
            />
            <Field
              label="Nom complet"
              autoComplete="name"
              value={nomLegal}
              onChange={(e) => setNomLegal(e.target.value)}
              aide="Facultatif. Modifiable à tout moment depuis votre profil."
              erreur={erreur}
            />
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {etape < ETAPES ? (
          <Button variant="principal" onClick={() => setEtape(etape + 1)}>
            Continuer
          </Button>
        ) : (
          <Button variant="principal" onClick={terminer} disabled={envoi}>
            {envoi ? 'Enregistrement…' : 'Terminer'}
          </Button>
        )}

        {etape > 1 && (
          <Button variant="discret" onClick={() => setEtape(etape - 1)}>
            Revenir
          </Button>
        )}

        <Button variant="discret" onClick={passer} disabled={envoi} className="ml-auto">
          Passer cette présentation
        </Button>
      </div>
    </div>
  );
}

function Etape({ titre, corps }: { titre: string; corps: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-t1 text-craie">{titre}</h1>
      <p className="mesure-texte text-corps text-texte">{corps}</p>
    </div>
  );
}
