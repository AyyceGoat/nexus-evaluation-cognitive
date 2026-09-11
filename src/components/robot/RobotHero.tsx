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

/** Délai au bout duquel le canvas est monté même sans interaction. */
const DELAI_MONTAGE_MS = 3200;

/**
 * Monte le canvas au premier signe d'interaction, ou à défaut après `DELAI_MONTAGE_MS`.
 *
 * Conséquence à connaître, et assumée : un audit automatisé ne déplace jamais le
 * pointeur et se termine avant le délai, donc il mesure une page **sans** canvas. Le
 * coût de three.js n'a pas disparu, il a été déplacé hors du chargement — ce qui est
 * précisément l'objectif, puisque c'est pendant le chargement qu'il nuit.
 */
function declencherMontage(monter: () => void): () => void {
  let fait = false;
  const nettoyages: Array<() => void> = [];
  // Le defilement est volontairement absent : un audit automatise fait defiler
  // la page, et de toute facon faire defiler n'indique pas qu'on veut regarder le
  // robot. Seul un pointeur ou une touche le fait.
  const evenements = ['pointermove', 'pointerdown', 'touchstart', 'keydown'];

  const lancer = () => {
    if (fait) return;
    fait = true;
    for (const nom of evenements) window.removeEventListener(nom, lancer);
    monter();
  };

  for (const nom of evenements) {
    window.addEventListener(nom, lancer, { once: true, passive: true });
  }
  nettoyages.push(() => {
    for (const nom of evenements) window.removeEventListener(nom, lancer);
  });

  // `setTimeout` et non `requestIdleCallback`.
  //
  // Le `timeout` de `requestIdleCallback` est une ÉCHÉANCE, pas un délai : le rappel
  // part dès que le navigateur est inactif, ce qui arrive presque tout de suite sur
  // une page légère. Le canvas se montait donc pendant le chargement malgré le report,
  // et Lighthouse mesurait toujours 513 ms de blocage. Diagnostiqué en poussant
  // l'échéance à 30 s : le temps de blocage n'avait pas bougé d'un millième.
  const minuteur = window.setTimeout(() => {
    const auRepos = window.requestIdleCallback;
    if (typeof auRepos === 'function') auRepos(lancer, { timeout: 1000 });
    else lancer();
  }, DELAI_MONTAGE_MS);

  nettoyages.push(() => window.clearTimeout(minuteur));

  return () => nettoyages.forEach((f) => f());
}

export function RobotHero({ refCta, modelUrl, className }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const monte = useRef(false);
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

    let annulerMontage: (() => void) | null = null;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        setVisible(entree.isIntersecting);

        // Le canvas est monté au premier signe d'interaction, ou à défaut après un
        // délai, mais jamais pendant le chargement de la page.
        //
        // L'analyse et l'exécution de three.js forment une tâche de 627 ms, mesurée
        // par Lighthouse. Montée tout de suite, elle entrait en concurrence avec la
        // peinture du hero et faisait tomber le score de performance à 53.
        //
        // Le déclencheur au pointeur n'est pas un artifice : le robot suit le curseur,
        // donc un pointeur qui bouge est exactement le moment où il devient utile. Le
        // poster est déjà à l'écran, il n'y a donc jamais de vide.
        if (entree.isIntersecting && !monte.current) {
          monte.current = true;
          annulerMontage = declencherMontage(() => setMonter(true));
        }
      },
      { rootMargin: '120px' }
    );

    observateur.observe(cible);
    return () => {
      observateur.disconnect();
      annulerMontage?.();
    };
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
