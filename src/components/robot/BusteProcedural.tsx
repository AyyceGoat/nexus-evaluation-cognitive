import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { damp, dampE } from 'maath/easing';
import type { Group, Mesh } from 'three';
import { avancerRessort } from './ressort';
import { couleursDuTheme } from './theme';
import type { Cible } from './useCible';

interface Props {
  cible: React.RefObject<Cible>;
  /** Faux sous `prefers-reduced-motion` : la pose est alors figée. */
  anime: boolean;
}

/* ── Réglages du comportement ─────────────────────────────────────────────── */

/** Amplitude de rotation de la tête, en radians. Au-delà, le cou paraît cassé. */
const LACET_MAX = 0.38;
const TANGAGE_MAX = 0.24;

/** Le buste suit à 30 % de l'angle de la tête. */
const PART_DU_BUSTE = 0.3;

/** Respiration : translation verticale de très faible amplitude. */
const AMPLITUDE_RESPIRATION = 0.012;
const PERIODE_RESPIRATION = 4.2;

/** Clignement : durée de la fermeture, puis intervalle irrégulier. */
const DUREE_CLIGNEMENT = 0.13;
const CLIGNEMENT_MIN = 2.4;
const CLIGNEMENT_MAX = 6.8;

/** Micro-mouvements de repos : très lents, très petits, jamais synchronisés. */
const AMPLITUDE_REPOS = 0.16;

export function BusteProcedural({ cible, anime }: Props) {
  const couleurs = useMemo(couleursDuTheme, []);

  const buste = useRef<Group>(null);
  const tete = useRef<Group>(null);
  const oeilGauche = useRef<Mesh>(null);
  const oeilDroit = useRef<Mesh>(null);

  const etat = useRef({
    lacet: 0,
    tangage: 0,
    vitesseLacet: 0,
    vitesseTangage: 0,
    temps: 0,
    prochainClignement: CLIGNEMENT_MIN,
    clignementDepuis: -1,
  });

  useFrame((_, deltaBrut) => {
    if (!anime) return;

    // Plafonner le pas de temps : au retour d'un onglet en arrière-plan, `delta` peut
    // valoir plusieurs secondes et le ressort explose.
    const dt = Math.min(deltaBrut, 1 / 30);
    const e = etat.current;
    e.temps += dt;

    const c = cible.current ?? { x: 0, y: 0, auRepos: true, verrouilleeSurCta: false };

    // Au repos, la cible n'est pas le centre exact : une dérive lente et non
    // périodique, pour qu'un buste immobile n'ait pas l'air en panne.
    const [viseX, viseY] = c.auRepos
      ? [
          Math.sin(e.temps * 0.21) * AMPLITUDE_REPOS,
          Math.sin(e.temps * 0.17 + 1.3) * AMPLITUDE_REPOS * 0.6,
        ]
      : [c.x, c.y];

    // ── Tête : ressort, donc dépassement puis stabilisation ────────────────
    const lacet = avancerRessort(
      { position: e.lacet, vitesse: e.vitesseLacet },
      viseX * LACET_MAX,
      dt
    );
    e.lacet = lacet.position;
    e.vitesseLacet = lacet.vitesse;

    const tangage = avancerRessort(
      { position: e.tangage, vitesse: e.vitesseTangage },
      -viseY * TANGAGE_MAX,
      dt
    );
    e.tangage = tangage.position;
    e.vitesseTangage = tangage.vitesse;

    if (tete.current) {
      tete.current.rotation.y = e.lacet;
      tete.current.rotation.x = e.tangage;
      // Léger roulis proportionnel au lacet : un cou réel ne pivote pas à plat.
      tete.current.rotation.z = -e.lacet * 0.12;
    }

    // ── Buste : suit à 30 %, amorti sans dépassement, avec un retard perceptible ──
    if (buste.current) {
      // `dampE` et non `damp3` : une rotation est un Euler, pas un Vector3.
      dampE(
        buste.current.rotation,
        [e.tangage * PART_DU_BUSTE, e.lacet * PART_DU_BUSTE, 0],
        0.55,
        dt
      );

      // Respiration : la seule boucle permanente, d'amplitude presque invisible.
      const respiration =
        Math.sin((e.temps / PERIODE_RESPIRATION) * Math.PI * 2) * AMPLITUDE_RESPIRATION;
      damp(buste.current.position, 'y', respiration, 0.3, dt);
    }

    // ── Clignement : intervalle irrégulier, jamais métronomique ────────────
    if (e.clignementDepuis < 0 && e.temps >= e.prochainClignement) {
      e.clignementDepuis = e.temps;
    }

    let fermeture = 1;
    if (e.clignementDepuis >= 0) {
      const avancement = (e.temps - e.clignementDepuis) / DUREE_CLIGNEMENT;
      if (avancement >= 1) {
        e.clignementDepuis = -1;
        e.prochainClignement =
          e.temps + CLIGNEMENT_MIN + Math.random() * (CLIGNEMENT_MAX - CLIGNEMENT_MIN);
      } else {
        // Aller-retour : 1 → 0,08 → 1.
        fermeture = 1 - Math.sin(avancement * Math.PI) * 0.92;
      }
    }

    if (oeilGauche.current) oeilGauche.current.scale.y = fermeture;
    if (oeilDroit.current) oeilDroit.current.scale.y = fermeture;
  });

  return (
    <group ref={buste} position={[0, -0.35, 0]}>
      {/* ── Épaules ───────────────────────────────────────────────────────── */}
      <RoundedBox args={[1.9, 0.5, 0.8]} radius={0.16} smoothness={4} position={[0, -0.62, 0]}>
        <meshStandardMaterial color={couleurs.graphite} roughness={0.55} metalness={0.7} />
      </RoundedBox>

      {/* Buste */}
      <RoundedBox args={[1.15, 0.85, 0.68]} radius={0.14} smoothness={4} position={[0, -0.16, 0]}>
        <meshStandardMaterial color={couleurs.graphite} roughness={0.5} metalness={0.75} />
      </RoundedBox>

      {/* Plastron : une plaque un cran plus claire, pour lire le volume */}
      <RoundedBox args={[0.62, 0.42, 0.06]} radius={0.03} smoothness={3} position={[0, -0.1, 0.35]}>
        <meshStandardMaterial color={couleurs.ardoise} roughness={0.4} metalness={0.85} />
      </RoundedBox>

      {/* ── Cou ───────────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.17, 0.21, 0.34, 24]} />
        <meshStandardMaterial color={couleurs.ardoise} roughness={0.35} metalness={0.9} />
      </mesh>

      {/* ── Tête ──────────────────────────────────────────────────────────── */}
      <group ref={tete} position={[0, 0.56, 0]}>
        <RoundedBox args={[0.78, 0.72, 0.7]} radius={0.17} smoothness={5}>
          <meshStandardMaterial color={couleurs.graphite} roughness={0.42} metalness={0.8} />
        </RoundedBox>

        {/* Visière : noir mat encastré, c'est elle qui donne le regard */}
        <RoundedBox args={[0.66, 0.24, 0.08]} radius={0.04} smoothness={3} position={[0, 0.04, 0.33]}>
          <meshStandardMaterial color={couleurs.noir} roughness={0.9} metalness={0.1} />
        </RoundedBox>

        {/* Regard : deux fentes émissives. Pas des yeux — un robot, pas un personnage. */}
        <mesh ref={oeilGauche} position={[-0.15, 0.04, 0.38]}>
          <boxGeometry args={[0.18, 0.035, 0.02]} />
          <meshStandardMaterial
            color={couleurs.mesure}
            emissive={couleurs.mesure}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={oeilDroit} position={[0.15, 0.04, 0.38]}>
          <boxGeometry args={[0.18, 0.035, 0.02]} />
          <meshStandardMaterial
            color={couleurs.mesure}
            emissive={couleurs.mesure}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>

        {/* L'arête lumineuse : une seule, sur le sommet du crâne. C'est là que se
            concentre toute l'audace de la page. */}
        <mesh position={[0, 0.37, 0]}>
          <boxGeometry args={[0.05, 0.016, 0.62]} />
          <meshStandardMaterial
            color={couleurs.mesure}
            emissive={couleurs.mesure}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>

        {/* Plaques latérales : de l'articulation, pas de la décoration */}
        {[-1, 1].map((cote) => (
          <mesh key={cote} position={[cote * 0.41, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.06, 20]} />
            <meshStandardMaterial color={couleurs.ardoise} roughness={0.3} metalness={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
