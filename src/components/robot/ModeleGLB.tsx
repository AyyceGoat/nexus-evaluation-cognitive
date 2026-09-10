import { useGLTF } from '@react-three/drei';

/**
 * Charge un GLB à la place de la géométrie procédurale.
 *
 * Isolé dans son propre module, et importé dynamiquement par `Scene` : `useGLTF` tire
 * `GLTFLoader` et les décodeurs Draco et meshopt, soit une part notable du poids de
 * drei. Aucun modèle n'étant livré dans le dépôt, ce code ne doit pas être téléchargé
 * par défaut — il ne l'est que si une prop `modelUrl` est réellement passée.
 *
 * Draco et meshopt sont pris en charge par les décodeurs hébergés de drei, donc un GLB
 * compressé fonctionne sans configuration supplémentaire. Voir docs/3D.md.
 */
export default function ModeleGLB({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
