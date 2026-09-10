import { useCallback, useEffect, useState } from 'react';

export type EtatAsync<T> =
  | { statut: 'chargement' }
  | { statut: 'erreur'; message: string }
  | { statut: 'pret'; donnees: T };

/**
 * Charge une donnée et expose les quatre états exigés par DESIGN.md §10.
 *
 * Le quatrième — « vide » — n'est pas un statut ici : c'est à l'écran de reconnaître
 * qu'une liste prête est vide, parce que seul l'écran sait quoi proposer à la place.
 */
export function useAsync<T>(
  charger: () => Promise<T>,
  dependances: readonly unknown[] = []
): EtatAsync<T> & { recharger: () => void } {
  const [etat, setEtat] = useState<EtatAsync<T>>({ statut: 'chargement' });
  const [tentative, setTentative] = useState(0);

  const recharger = useCallback(() => {
    setEtat({ statut: 'chargement' });
    setTentative((n) => n + 1);
  }, []);

  useEffect(() => {
    let annule = false;

    void (async () => {
      try {
        const donnees = await charger();
        if (!annule) setEtat({ statut: 'pret', donnees });
      } catch (erreur) {
        if (annule) return;
        setEtat({
          statut: 'erreur',
          message:
            erreur instanceof Error && erreur.message
              ? erreur.message
              : 'Le chargement a échoué. Vérifiez votre connexion, puis réessayez.',
        });
      }
    })();

    return () => {
      annule = true;
    };
    // `charger` est recréée à chaque rendu par la plupart des appelants ; on se cale
    // donc sur les dépendances explicites, plus le compteur de rechargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependances, tentative]);

  return { ...etat, recharger };
}
