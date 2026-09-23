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
 * Rend une image quand la scène est figée.
 *
 * En `frameloop="demand"`, rien n'est dessiné sans qu'on le demande : sous
 * `prefers-reduced-motion` ou hors du viewport, il faut donc une invalidation
 * explicite, sinon le canvas reste vide.
 *
 * ── Ce composant ne pilote plus la cadence ──
 *
 * Il tenait auparavant sa propre boucle `requestAnimationFrame` appelant
 * `invalidate()`, plafonnée à 30 images par seconde. Deux défauts mesurés :
 * le plafond rendait le suivi saccadé, et cette boucle doublait celle de
 * React Three Fiber — une passe de rendu pour deux images présentées. La
 * bibliothèque pilote désormais sa propre boucle en `frameloop="always"`
 * dès qu'il y a quelque chose à animer.
 */
function ImageFixe() {
  const invalidate = useThree((etat) => etat.invalidate);
  useEffect(() => invalidate(), [invalidate]);
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
      // `always` quand ça bouge, `demand` quand c'est figé : la boucle de rendu
      // n'existe que s'il y a un mouvement à produire.
      frameloop={anime ? 'always' : 'demand'}
      dpr={capacites.dpr}
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
      {!anime && <ImageFixe />}

      {/* Éclairage : trois sources, aucune de plus. L'arête lumineuse du modèle fait
          le reste du travail. */}
      {/* Quatre sources, et elles sont toutes nécessaires.
          Un matériau métallique sans carte d'environnement ne réfléchit rien : la
          première version, à `metalness` 0,8 et deux lumières, rendait le buste
          presque invisible sur le fond noir. Constaté sur capture, pas déduit. */}
      <ambientLight intensity={0.9} color={couleurs.craie} />

      {/* Clé, en haut à droite : c'est elle qui sculpte le volume. */}
      {/* Pas d'ombre portée, et ce n'est pas un compromis : aucun maillage du
          buste ne porte `receiveShadow`, donc la carte d'ombres était calculée à
          chaque image pour un résultat invisible. Une passe de rendu entière,
          dépensée pour rien. */}
      <directionalLight position={[2.6, 3.2, 3.4]} intensity={2.6} color={couleurs.craie} />

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
