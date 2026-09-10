import { Suspense, lazy, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { BusteProcedural } from './BusteProcedural';
import { couleursDuTheme } from './theme';
import type { Cible } from './useCible';
import type { Capacites } from './capacites';

interface Props {
  cible: React.RefObject<Cible>;
  capacites: Capacites;
  /** Vrai quand le canvas est dans le viewport. Faux : la boucle est suspendue. */
  visible: boolean;
  /**
   * GLB à charger à la place de la géométrie procédurale.
   *
   * Toute la logique d'interaction vit dans `BusteProcedural` et dans `useCible` ;
   * remplacer le modèle ne demande donc de toucher à rien d'autre que cette prop.
   * Aucun fichier n'est livré dans le dépôt — voir docs/3D.md.
   */
  modelUrl?: string;
}

/**
 * Cadence l'invalidation.
 *
 * Le canvas tourne en `frameloop="demand"` : rien n'est rendu sans qu'on le demande.
 * Ce composant demande une image tant qu'il y a quelque chose à animer, plafonné à
 * 30 images par seconde — au-delà, on dépense de la batterie pour un buste qui respire.
 *
 * Il ne demande rien du tout quand le canvas est hors du viewport, ni sous
 * `prefers-reduced-motion`. Dans ce dernier cas, une seule image est rendue : la pose
 * fixe.
 */
function Cadence({ actif }: { actif: boolean }) {
  const invalidate = useThree((etat) => etat.invalidate);

  useEffect(() => {
    // Une image dans tous les cas, pour que la pose fixe s'affiche.
    invalidate();
    if (!actif) return;

    let anime = 0;
    let dernier = 0;
    const PAS = 1000 / 30;

    const boucle = (maintenant: number) => {
      anime = requestAnimationFrame(boucle);
      if (maintenant - dernier < PAS) return;
      dernier = maintenant;
      invalidate();
    };

    anime = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(anime);
  }, [actif, invalidate]);

  return null;
}

// Chargé seulement si une prop `modelUrl` est passée : `useGLTF` tire GLTFLoader et
// les décodeurs Draco et meshopt, inutiles tant qu'aucun modèle n'est fourni.
const ModeleGLB = lazy(() => import('./ModeleGLB'));

export default function Scene({ cible, capacites, visible, modelUrl }: Props) {
  const couleurs = useRef(couleursDuTheme()).current;
  const anime = visible && !capacites.mouvementReduit;

  return (
    <Canvas
      // Rien n'est rendu sans invalidation explicite : c'est `Cadence` qui décide.
      frameloop="demand"
      dpr={capacites.dpr}
      shadows={capacites.ombres}
      camera={{ position: [0, 0.1, 3.1], fov: 32 }}
      gl={{
        antialias: !capacites.tactile,
        powerPreference: 'low-power',
        alpha: true,
      }}
      style={{ background: 'transparent' }}
      // Le canvas est décoratif : le contenu informatif est dans le texte du hero.
      aria-hidden="true"
    >
      <Cadence actif={anime} />

      {/* Éclairage : trois sources, aucune de plus. L'arête lumineuse du modèle fait
          le reste du travail. */}
      <ambientLight intensity={0.35} color={couleurs.craie} />
      <directionalLight
        position={[2.4, 2.8, 2.2]}
        intensity={1.5}
        color={couleurs.craie}
        castShadow={capacites.ombres}
      />
      {/* Contre-jour côté opposé, dans la couleur d'accent : c'est ce qui détache la
          silhouette du fond noir. */}
      <directionalLight position={[-2.6, 0.6, -1.4]} intensity={1.1} color={couleurs.mesure} />

      <Suspense fallback={null}>
        {modelUrl ? <ModeleGLB url={modelUrl} /> : <BusteProcedural cible={cible} anime={anime} />}
      </Suspense>
    </Canvas>
  );
}
