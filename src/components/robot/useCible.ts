import { useEffect, useRef } from 'react';

/** Délai d'immobilité au-delà duquel le buste revient à la pose neutre. */
export const REPOS_APRES_MS = 4000;

export interface Cible {
  /** Position visée, normalisée dans [-1, 1] sur chaque axe. */
  x: number;
  y: number;
  /** Vrai quand rien ne bouge depuis REPOS_APRES_MS. */
  auRepos: boolean;
  /** Vrai quand la cible vient d'une survol du CTA principal. */
  verrouilleeSurCta: boolean;
}

export type SourceCible = 'souris' | 'orientation' | 'toucher' | 'autonome';

interface Options {
  /** Élément dont le survol capte le regard. */
  refCta?: React.RefObject<HTMLElement | null>;
  /** Sans mouvement autorisé, aucun écouteur n'est posé. */
  actif: boolean;
  tactile: boolean;
}

/**
 * Détermine ce que le robot regarde.
 *
 * Quatre sources, par ordre de préférence selon l'appareil :
 *
 * 1. **La souris** — sur pointeur fin, le cas nominal.
 * 2. **L'orientation de l'appareil** — sur mobile, si l'autorisation est accordée.
 *    Elle ne l'est jamais implicitement sur iOS : il faut un geste de l'utilisateur,
 *    donc on l'attend au premier contact plutôt que de la demander au chargement.
 * 3. **Le toucher** — si l'orientation est refusée ou indisponible.
 * 4. **Une dérive autonome** — lente, sinueuse, quand rien n'est disponible. Un buste
 *    parfaitement immobile a l'air en panne.
 *
 * La valeur est écrite dans une ref, pas dans un état : à 30 images par seconde, un
 * `setState` par image ferait rerendre l'arbre React pour rien.
 */
export function useCible({ refCta, actif, tactile }: Options): {
  cible: React.RefObject<Cible>;
  source: React.RefObject<SourceCible>;
} {
  const cible = useRef<Cible>({ x: 0, y: 0, auRepos: true, verrouilleeSurCta: false });
  const source = useRef<SourceCible>(tactile ? 'autonome' : 'souris');
  const dernierMouvement = useRef<number>(Date.now());

  useEffect(() => {
    if (!actif) {
      cible.current = { x: 0, y: 0, auRepos: true, verrouilleeSurCta: false };
      return;
    }

    const marquerActivite = () => {
      dernierMouvement.current = Date.now();
    };

    const surSouris = (evenement: PointerEvent) => {
      if (evenement.pointerType === 'touch') return;
      source.current = 'souris';
      marquerActivite();
      cible.current = {
        x: (evenement.clientX / window.innerWidth) * 2 - 1,
        y: -((evenement.clientY / window.innerHeight) * 2 - 1),
        auRepos: false,
        verrouilleeSurCta: false,
      };
    };

    const surToucher = (evenement: TouchEvent) => {
      const contact = evenement.touches[0];
      if (!contact) return;
      source.current = 'toucher';
      marquerActivite();
      cible.current = {
        x: (contact.clientX / window.innerWidth) * 2 - 1,
        y: -((contact.clientY / window.innerHeight) * 2 - 1),
        auRepos: false,
        verrouilleeSurCta: false,
      };
    };

    const surOrientation = (evenement: DeviceOrientationEvent) => {
      if (evenement.gamma === null || evenement.beta === null) return;
      source.current = 'orientation';
      marquerActivite();
      // gamma : inclinaison gauche/droite, environ [-90, 90].
      // beta  : inclinaison avant/arrière ; on centre sur 45°, tenue naturelle en main.
      cible.current = {
        x: Math.max(-1, Math.min(1, evenement.gamma / 45)),
        y: Math.max(-1, Math.min(1, (evenement.beta - 45) / 45)),
        auRepos: false,
        verrouilleeSurCta: false,
      };
    };

    /** Le regard se porte sur le CTA au survol. */
    const surEntreeCta = () => {
      const element = refCta?.current;
      if (!element) return;
      const cadre = element.getBoundingClientRect();
      marquerActivite();
      cible.current = {
        x: ((cadre.left + cadre.width / 2) / window.innerWidth) * 2 - 1,
        y: -(((cadre.top + cadre.height / 2) / window.innerHeight) * 2 - 1),
        auRepos: false,
        verrouilleeSurCta: true,
      };
    };

    const surSortieCta = () => {
      cible.current = { ...cible.current, verrouilleeSurCta: false };
    };

    // Détection du repos : un intervalle d'une seconde suffit, on ne mesure pas un
    // délai de quatre secondes à l'image près.
    const veille = setInterval(() => {
      if (cible.current.verrouilleeSurCta) return;
      if (Date.now() - dernierMouvement.current < REPOS_APRES_MS) return;
      if (!cible.current.auRepos) {
        cible.current = { ...cible.current, auRepos: true };
      }
    }, 1000);

    if (tactile) {
      window.addEventListener('touchstart', surToucher, { passive: true });
      window.addEventListener('touchmove', surToucher, { passive: true });

      // iOS exige un geste de l'utilisateur pour accorder l'orientation. On la
      // demande au premier contact, jamais au chargement — une demande spontanée est
      // systématiquement refusée, et elle est intrusive.
      const demander = async () => {
        type AvecPermission = typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<PermissionState>;
        };
        const constructeur = window.DeviceOrientationEvent as AvecPermission | undefined;
        if (!constructeur) return;

        try {
          if (typeof constructeur.requestPermission === 'function') {
            const etat = await constructeur.requestPermission();
            if (etat !== 'granted') return; // On reste sur le toucher.
          }
          window.addEventListener('deviceorientation', surOrientation);
        } catch {
          // Refusé ou indisponible : le toucher prend le relais, sans message.
        }
      };

      window.addEventListener('pointerdown', () => void demander(), { once: true });
    } else {
      window.addEventListener('pointermove', surSouris, { passive: true });
    }

    const cta = refCta?.current;
    cta?.addEventListener('pointerenter', surEntreeCta);
    cta?.addEventListener('focus', surEntreeCta);
    cta?.addEventListener('pointerleave', surSortieCta);
    cta?.addEventListener('blur', surSortieCta);

    return () => {
      clearInterval(veille);
      window.removeEventListener('pointermove', surSouris);
      window.removeEventListener('touchstart', surToucher);
      window.removeEventListener('touchmove', surToucher);
      window.removeEventListener('deviceorientation', surOrientation);
      cta?.removeEventListener('pointerenter', surEntreeCta);
      cta?.removeEventListener('focus', surEntreeCta);
      cta?.removeEventListener('pointerleave', surSortieCta);
      cta?.removeEventListener('blur', surSortieCta);
    };
  }, [actif, tactile, refCta]);

  return { cible, source };
}
