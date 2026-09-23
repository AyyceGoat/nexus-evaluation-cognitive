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
 * Ce composant demande une image à chaque rafraîchissement, sans plafond.
 *
 * Il y avait un plafond à 30 images par seconde, pour économiser la batterie. Mesuré,
 * le résultat était un suivi à 24 images par seconde : saccadé, et perçu comme lent.
 * L'économie ne valait pas ce prix — d'autant que la scène n'est plus servie sur
 * téléphone, où la batterie compte vraiment.
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

    const boucle = () => {
      anime = requestAnimationFrame(boucle);
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
      camera={{ position: [0, 0.03, 3.2], fov: 32 }}
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
      {/* Quatre sources, et elles sont toutes nécessaires.
          Un matériau métallique sans carte d'environnement ne réfléchit rien : la
          première version, à `metalness` 0,8 et deux lumières, rendait le buste
          presque invisible sur le fond noir. Constaté sur capture, pas déduit. */}
      <ambientLight intensity={0.9} color={couleurs.craie} />

      {/* Clé, en haut à droite : c'est elle qui sculpte le volume. */}
      <directionalLight
        position={[2.6, 3.2, 3.4]}
        intensity={2.6}
        color={couleurs.craie}
        castShadow={capacites.ombres}
      />

      {/* Appoint frontal doux, pour que la visière et la mâchoire se lisent. */}
      <directionalLight position={[-1.6, 0.4, 3.2]} intensity={1.4} color={couleurs.craie} />

      {/* Contre-jour dans la couleur d'accent : il détache la silhouette du fond. */}
      <directionalLight position={[-3.2, 1.2, -2.2]} intensity={2.4} color={couleurs.mesure} />

      <Suspense fallback={null}>
        {modelUrl ? <ModeleGLB url={modelUrl} /> : <BusteProcedural cible={cible} anime={anime} />}
      </Suspense>
    </Canvas>
  );
}
