import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { detecterCapacites, type Capacites } from './capacites';
import { PosterRobot } from './PosterRobot';
import { useCible } from './useCible';

/**
 * Le canvas n'est jamais dans le bundle initial.
 *
 * `three` et `@react-three/fiber` pèsent une bonne centaine de kilo-octets compressés.
 * L'import dynamique les met dans un chunk séparé, chargé après le premier rendu — donc
 * le LCP du hero ne dépend pas du modèle 3D, et un appareil qui n'y a pas droit ne le
 * télécharge jamais.
 */
const Scene = lazy(() => import('./Scene'));

interface Props {
  /** Élément dont le survol capte le regard. */
  refCta?: React.RefObject<HTMLElement | null>;
  /** GLB à charger à la place de la géométrie procédurale. */
  modelUrl?: string;
  className?: string;
}

export function RobotHero({ refCta, modelUrl, className }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [capacites, setCapacites] = useState<Capacites | null>(null);
  const [visible, setVisible] = useState(false);
  const [monter, setMonter] = useState(false);

  // La détection tourne après le premier rendu : le poster s'affiche donc toujours en
  // premier, et le hero est peint sans attendre quoi que ce soit.
  useEffect(() => {
    setCapacites(detecterCapacites());
  }, []);

  // Suspend la boucle de rendu hors du viewport, et ne monte le canvas qu'à la
  // première apparition — inutile de charger `three` pour un hero jamais atteint.
  useEffect(() => {
    const cible = conteneur.current;
    if (!cible || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      setMonter(true);
      return;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        setVisible(entree.isIntersecting);
        if (entree.isIntersecting) setMonter(true);
      },
      { rootMargin: '120px' }
    );

    observateur.observe(cible);
    return () => observateur.disconnect();
  }, []);

  const { cible } = useCible({
    refCta,
    actif: Boolean(capacites && capacites.verdict === 'canvas' && !capacites.mouvementReduit),
    tactile: capacites?.tactile ?? false,
  });

  const afficheCanvas = capacites?.verdict === 'canvas' && monter;

  return (
    <div ref={conteneur} className={className}>
      {/* Le poster reste sous le canvas et ne disparaît jamais du DOM : il tient la
          place pendant le chargement, sert de repli si la 3D est refusée, et évite
          tout décalage de mise en page. */}
      <div
        className={
          afficheCanvas
            ? 'absolute inset-0 opacity-0 transition-opacity duration-[--duree-3]'
            : 'absolute inset-0 opacity-100 transition-opacity duration-[--duree-3]'
        }
      >
        <PosterRobot className="h-full w-full" />
      </div>

      {afficheCanvas && capacites && (
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <Scene
              cible={cible}
              capacites={capacites}
              visible={visible}
              modelUrl={modelUrl}
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
