import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, Square } from 'lucide-react';
import {
  chargerNarration,
  ecrirePosition,
  ecrireVoix,
  lirePosition,
  lireVoix,
  oublierPosition,
  segmentA,
  urlAudio,
  type Narration,
  type SegmentAudio,
} from '../../lib/narration/stockage';
import { DUREE_ESSAI, VOIX } from '../../lib/narration/voix';

interface Props {
  sujetId: string;
  /**
   * Segment en cours de lecture, ou `null` à l'arrêt.
   *
   * Remonté au parent, qui possède le texte affiché et surligne le passage
   * correspondant. Le lecteur ne connaît pas la mise en page de l'article.
   */
  onSegment: (segment: SegmentAudio | null) => void;
}

type Etat = 'repos' | 'chargement' | 'pret' | 'indisponible' | 'non-configure';

function minutes(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = Math.floor(secondes % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Lecture à voix haute d'un article.
 *
 * ── Pourquoi des commandes propres et non le lecteur du navigateur ──
 *
 * Le lecteur natif est correct, mais il ne sait rien de l'article : il ne peut
 * ni proposer une voix, ni reprendre où l'on s'est arrêté la dernière fois, ni
 * signaler au reste de la page quel passage est lu. Ces trois choses sont
 * précisément ce qui fait l'intérêt de la fonctionnalité.
 *
 * ── Le suivi de position se fait par relevé, pas par évènement ──
 *
 * Une version antérieure de ce mécanisme, dans la page d'essai, écoutait
 * `timeupdate` et `seeked`. Elle fonctionnait à la lecture et échouait par
 * intermittence sur un déplacement : quand le fichier n'a jamais été joué,
 * seules ses métadonnées sont chargées et le navigateur peut enregistrer la
 * nouvelle position sans émettre `seeked`. Deux mesures identiques donnaient
 * deux résultats. On relève donc la position, ce qui ne suppose rien.
 *
 * ── Le fichier peut ne pas exister ──
 *
 * La narration est produite article par article. Un article sans audio doit le
 * dire en une phrase, pas afficher un lecteur qui ne démarre jamais.
 */
export function LecteurNarration({ sujetId, onSegment }: Props) {
  const [voix, setVoix] = useState<string>(() => lireVoix());
  const [etat, setEtat] = useState<Etat>('repos');
  const [narration, setNarration] = useState<Narration | null>(null);
  const [enLecture, setEnLecture] = useState(false);
  const [position, setPosition] = useState(0);
  const [essai, setEssai] = useState<string | null>(null);
  const [reprise, setReprise] = useState(() => lirePosition(sujetId));

  /**
   * Segment courant, gardé aussi ici et pas seulement remonté au parent.
   *
   * Pour une seule raison, trouvée en écoutant : la phrase d'introduction ne
   * figure pas dans le texte de l'article. Pendant les quinze premières
   * secondes, le parent n'avait donc rien à surligner et l'écran paraissait
   * inerte alors que la voix parlait. Le lecteur affiche cette phrase lui-même.
   */
  const [segmentCourant, setSegmentCourant] = useState<SegmentAudio | null>(null);

  const audio = useRef<HTMLAudioElement | null>(null);
  const essaiAudio = useRef<HTMLAudioElement | null>(null);
  const dernierSegment = useRef<number>(-2);

  /* ── Nettoyage à tout changement d'article ou de voix ─────────────── */

  useEffect(() => {
    setNarration(null);
    setEtat('repos');
    setEnLecture(false);
    setPosition(0);
    dernierSegment.current = -2;
    setSegmentCourant(null);
    onSegment(null);
  }, [sujetId, voix, onSegment]);

  useEffect(() => setReprise(lirePosition(sujetId)), [sujetId]);

  /* ── Relevé de la position ─────────────────────────────────────────── */

  useEffect(() => {
    if (!narration) return;

    const minuteur = window.setInterval(() => {
      const element = audio.current;
      if (!element) return;

      setPosition(element.currentTime);

      const rang = element.ended ? -1 : segmentA(narration.segments, element.currentTime);
      if (rang !== dernierSegment.current) {
        dernierSegment.current = rang;
        const segment = rang >= 0 ? narration.segments[rang] : null;
        setSegmentCourant(segment);
        onSegment(segment);
      }

      if (!element.paused && !element.ended) ecrirePosition(sujetId, element.currentTime);
    }, 150);

    return () => window.clearInterval(minuteur);
  }, [narration, onSegment, sujetId]);

  /* ── Arrêt à la sortie de l'écran ──────────────────────────────────── */

  useEffect(
    () => () => {
      audio.current?.pause();
      essaiAudio.current?.pause();
      onSegment(null);
    },
    [onSegment]
  );

  /* ── Démarrage ─────────────────────────────────────────────────────── */

  const demarrer = useCallback(async () => {
    const source = urlAudio(sujetId, voix);
    if (!source) {
      setEtat('non-configure');
      return;
    }

    setEtat('chargement');
    const donnees = await chargerNarration(sujetId, voix);
    if (!donnees) {
      setEtat('indisponible');
      return;
    }

    const element = new Audio(source);
    element.preload = 'auto';
    element.addEventListener('ended', () => {
      setEnLecture(false);
      oublierPosition(sujetId);
      setReprise(0);
      setSegmentCourant(null);
      onSegment(null);
    });
    audio.current = element;

    const depart = lirePosition(sujetId);
    if (depart > 0 && depart < donnees.duree - 1) element.currentTime = depart;

    setNarration(donnees);
    setEtat('pret');
    try {
      await element.play();
      setEnLecture(true);
    } catch {
      // Lecture refusée faute de geste utilisateur : le bouton reste là.
      setEnLecture(false);
    }
  }, [onSegment, sujetId, voix]);

  const basculer = useCallback(() => {
    const element = audio.current;
    if (!element) {
      void demarrer();
      return;
    }
    if (element.paused) {
      void element.play().then(() => setEnLecture(true));
    } else {
      element.pause();
      setEnLecture(false);
      ecrirePosition(sujetId, element.currentTime);
    }
  }, [demarrer, sujetId]);

  const arreter = useCallback(() => {
    const element = audio.current;
    if (element) {
      element.pause();
      element.currentTime = 0;
    }
    setEnLecture(false);
    setPosition(0);
    dernierSegment.current = -2;
    setSegmentCourant(null);
    onSegment(null);
    oublierPosition(sujetId);
    setReprise(0);
  }, [onSegment, sujetId]);

  const deplacer = useCallback((secondes: number) => {
    const element = audio.current;
    if (!element) return;
    element.currentTime = secondes;
    setPosition(secondes);
  }, []);

  /* ── Essai d'une voix ──────────────────────────────────────────────── */

  const essayer = useCallback(
    (voixId: string) => {
      essaiAudio.current?.pause();
      audio.current?.pause();
      setEnLecture(false);

      const source = urlAudio(sujetId, voixId);
      if (!source) return;

      const element = new Audio(source);
      essaiAudio.current = element;
      setEssai(voixId);

      // On écoute la phrase d'introduction, identique d'une voix à l'autre :
      // c'est ce qui rend la comparaison possible. Huit secondes suffisent, et
      // la requête de plage évite de télécharger tout le fichier.
      const minuteur = window.setTimeout(() => {
        element.pause();
        setEssai((actuel) => (actuel === voixId ? null : actuel));
      }, DUREE_ESSAI * 1000);

      element.addEventListener('pause', () => window.clearTimeout(minuteur), { once: true });
      void element.play().catch(() => setEssai(null));
    },
    [sujetId]
  );

  const changerVoix = useCallback(
    (voixId: string) => {
      audio.current?.pause();
      essaiAudio.current?.pause();
      setEssai(null);
      audio.current = null;
      setVoix(voixId);
      ecrireVoix(voixId);
    },
    []
  );

  /* ── Rendu ─────────────────────────────────────────────────────────── */

  if (etat === 'non-configure') return null;

  return (
    <section
      aria-label="Écouter l’article"
      className="mb-8 rounded-2 border border-ardoise bg-graphite/60 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={basculer}
          disabled={etat === 'chargement'}
          className="flex min-h-11 items-center gap-2 rounded-1 bg-mesure px-5 text-petit font-semibold text-noir transition-opacity disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
        >
          {enLecture ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          {etat === 'chargement'
            ? 'Chargement…'
            : enLecture
              ? 'Pause'
              : narration
                ? 'Reprendre'
                : reprise > 0
                  ? `Reprendre à ${minutes(reprise)}`
                  : 'Écouter l’article'}
        </button>

        {narration && (
          <button
            type="button"
            onClick={arreter}
            className="flex min-h-11 items-center gap-2 rounded-1 border border-ardoise px-4 text-petit text-texte transition-colors hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Arrêter
          </button>
        )}

        {!narration && (
          <span className="flex items-center gap-2 text-micro text-brume">
            <Headphones className="h-4 w-4" aria-hidden="true" />
            Version lue, même voix sur tous les appareils
          </span>
        )}
      </div>

      {etat === 'indisponible' && (
        <p role="status" className="mesure-texte mt-4 border-l-2 border-alerte pl-4 text-petit text-texte">
          La version lue de cet article n’est pas encore disponible dans cette voix.
        </p>
      )}

      {segmentCourant?.type === 'intro' && (
        <p className="mesure-texte mt-4 border-l-2 border-mesure pl-4 text-petit text-craie italic">
          {segmentCourant.affiche}
        </p>
      )}

      {narration && (
        <div className="mt-4 flex items-center gap-3">
          <span className="nombres shrink-0 text-micro text-brume">{minutes(position)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, narration.duree)}
            step={1}
            value={Math.min(position, narration.duree)}
            onChange={(e) => deplacer(Number(e.target.value))}
            aria-label="Position dans la lecture"
            className="h-11 flex-1 accent-mesure"
          />
          <span className="nombres shrink-0 text-micro text-brume">
            {minutes(narration.duree)}
          </span>
        </div>
      )}

      {/* ── Choix de la voix ────────────────────────────────────────────
          Chaque voix est décrite en une ligne, et s'essaie sur place. Une
          liste de prénoms ne permet pas de choisir : personne ne sait ce que
          « Rémy » va donner avant de l'entendre. */}
      <fieldset className="mt-5 border-t border-ardoise/60 pt-4">
        <legend className="mb-3 text-micro tracking-wide text-brume uppercase">Voix</legend>
        <ul className="flex flex-col gap-2">
          {VOIX.map((v) => {
            const choisie = v.id === voix;
            return (
              <li key={v.id}>
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-1 border p-3 ${
                    choisie ? 'border-mesure/50 bg-mesure/10' : 'border-ardoise/50'
                  }`}
                >
                  <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name={`voix-${sujetId}`}
                      checked={choisie}
                      onChange={() => changerVoix(v.id)}
                      className="h-4 w-4 shrink-0 accent-mesure"
                    />
                    <span className="min-w-0">
                      <span className="block text-petit text-craie">{v.nom}</span>
                      <span className="block text-micro text-texte">{v.description}</span>
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => essayer(v.id)}
                    aria-label={`Essayer la voix de ${v.nom}`}
                    className="min-h-11 shrink-0 rounded-1 border border-ardoise px-4 text-micro text-texte transition-colors hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
                  >
                    {essai === v.id ? 'En écoute…' : 'Essayer'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </section>
  );
}
