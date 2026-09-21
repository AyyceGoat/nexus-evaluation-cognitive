import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildReport } from '../../lib/iq/score';
import { selectSession } from '../../lib/iq/selection';
import { getRecentItemIds, recordSession, saveReport } from '../../lib/iq/storage';
import { backend } from '../../lib/backend';
import { useAuth } from '../../app/auth';
import { APTITUDE_LABEL, APTITUDES } from '../../lib/iq/types';
import type { IQItem, IQReport, ItemResponse } from '../../lib/iq/types';
import { MatrixRenderer } from './MatrixRenderer';
import { IQResultsView } from './IQResultsView';
import { ArrowLeft, ArrowRight, Clock, Play } from 'lucide-react';

type Stage = 'config' | 'running' | 'done';

/** Longueurs proposées. Le cahier des charges impose une passation de 30 à 40 items. */
const LENGTHS = [
  { count: 30, label: 'Court', minutes: '20 à 25 min' },
  { count: 35, label: 'Standard', minutes: '25 à 30 min' },
  { count: 40, label: 'Long', minutes: '30 à 40 min' },
] as const;

export function IQTestRunner() {
  // L'évaluation reste accessible sans compte : c'est une décision produit assumée
  // (« gratuit, sans compte »). Connecté, la passation est en plus enregistrée côté
  // backend — c'est ce qui alimentera la recalibration de la banque d'items.
  const { utilisateur } = useAuth();
  const passationDistante = useRef<string | null>(null);
  const [stage, setStage] = useState<Stage>('config');
  const [length, setLength] = useState<number>(35);
  const [candidateName, setCandidateName] = useState('');

  const [items, setItems] = useState<IQItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [report, setReport] = useState<IQReport | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const timeByItem = useRef<Record<string, number>>({});
  const enteredAt = useRef<number>(Date.now());
  const sessionStartedAt = useRef<string>('');

  const current = items[index];

  /**
   * Ajoute au compteur de l'item le temps écoulé depuis qu'il est affiché, puis
   * réarme l'horloge. Appelé uniquement en quittant un item — pas au moment de
   * répondre, sinon changer d'avis gonflerait artificiellement le temps mesuré.
   */
  const commitTime = useCallback((itemId: string | undefined) => {
    if (!itemId) return;
    const seconds = (Date.now() - enteredAt.current) / 1000;
    timeByItem.current[itemId] = (timeByItem.current[itemId] ?? 0) + seconds;
    enteredAt.current = Date.now();
  }, []);

  // Horloge d'affichage seulement : la mesure réelle vient des horodatages.
  useEffect(() => {
    if (stage !== 'running') return;
    setElapsed(0);
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - enteredAt.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, index]);

  // La banque de 120 items pèse l'essentiel du chunk de cet écran, et l'écran de
  // configuration n'en a aucun besoin. Elle est donc chargée au lancement de la
  // passation. Mesuré : le LCP de /evaluation passait de 2,75 s en 3G simulée, parce
  // que le titre attendait l'arrivée de données qui ne servent pas à l'afficher.
  const start = useCallback(async () => {
    const { itemBank } = await import('../../data/iq');
    const selected = selectSession(itemBank, {
      count: length,
      excludeIds: getRecentItemIds(),
    });

    // Ouverte dès le départ : une passation abandonnée laisse une ligne, ce qui est
    // une donnée utile plutôt qu'un trou.
    passationDistante.current = null;
    if (utilisateur) {
      void backend
        .ouvrirPassation(selected.map((item) => item.id))
        .then((resultat) => {
          if (resultat.ok) passationDistante.current = resultat.valeur;
        });
    }

    setItems(selected);
    setIndex(0);
    setAnswers({});
    timeByItem.current = {};
    enteredAt.current = Date.now();
    sessionStartedAt.current = new Date().toISOString();
    setStage('running');
  }, [length, utilisateur]);

  const finish = useCallback(() => {
    commitTime(current?.id);

    const responses: ItemResponse[] = items.map((item) => {
      const selectedIndex = answers[item.id] ?? -1;
      return {
        itemId: item.id,
        selectedIndex,
        correct: selectedIndex === item.correctIndex,
        responseSeconds: Math.round(timeByItem.current[item.id] ?? 0),
      };
    });

    const sessionId = `iq_${Date.now().toString(36)}`;
    const built = buildReport({
      sessionId,
      candidateName,
      items,
      responses,
    });

    recordSession(sessionId, sessionStartedAt.current, responses);
    saveReport(built);
    setReport(built);
    setStage('done');

    // Persistance distante quand un compte existe.
    //
    // Le rapport calculé ci-dessus n'est qu'un affichage immédiat : il n'est jamais
    // transmis au serveur. La fonction serveur recalcule tout depuis les réponses
    // enregistrées et son propre corrigé, puis son résultat REMPLACE celui-ci — y
    // compris s'il est moins flatteur. C'est lui qui fait foi et lui seul qui peut
    // paraître au classement.
    const distante = passationDistante.current;
    if (utilisateur && distante) {
      void (async () => {
        for (const reponse of responses) {
          await backend.enregistrerReponse(distante, reponse);
        }
        const cloture = await backend.cloturerPassation(distante, items);
        if (cloture.ok) setReport(cloture.valeur);
      })();
    }
  }, [answers, candidateName, commitTime, current?.id, items, utilisateur]);

  const goTo = useCallback(
    (next: number) => {
      commitTime(current?.id);
      setIndex(next);
    },
    [commitTime, current?.id]
  );

  const answeredCount = useMemo(
    () => items.filter((item) => answers[item.id] !== undefined).length,
    [answers, items]
  );

  // ── Écran de configuration ────────────────────────────────────────────────
  if (stage === 'config') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-craie">
        <h1 className="font-titre text-3xl sm:text-4xl font-bold mb-3">
          Évaluation des aptitudes cognitives
        </h1>
        <p className="text-brume text-sm sm:text-base leading-relaxed max-w-xl mb-8">
          Cinq aptitudes sont évaluées. Le résultat est une estimation assortie de sa marge
          d’erreur, pas un chiffre exact : prenez le temps de lire chaque énoncé, les réponses
          expédiées sont détectées et rendent le résultat inexploitable.
        </p>

        <fieldset className="mb-8">
          <legend className="text-xs font-semibold text-craie mb-3">
            Longueur de la passation
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LENGTHS.map((option) => (
              <button
                key={option.count}
                type="button"
                onClick={() => setLength(option.count)}
                aria-pressed={length === option.count}
                className={`p-4 rounded-2 border text-left transition-colors ${
                  length === option.count
                    ? 'border-mesure bg-mesure/15'
                    : 'border-ardoise/50 hover:bg-ardoise/50'
                }`}
              >
                <span className="block font-semibold text-sm text-craie">{option.label}</span>
                <span className="block text-xs text-brume mt-1">
                  {option.count} questions
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-[11px] text-brume">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {option.minutes}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-8">
          <label htmlFor="candidate-name" className="block text-xs font-semibold text-craie mb-1.5">
            Votre nom (facultatif, il figurera sur l’attestation)
          </label>
          <input
            id="candidate-name"
            type="text"
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="Ex : Koffi Kouamé"
            className="w-full px-4 py-2.5 rounded-1 bg-graphite/80 border border-ardoise/60 text-craie text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          />
        </div>

        <div className="mb-10">
          <h2 className="text-xs font-semibold text-craie mb-3">Aptitudes évaluées</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-brume">
            {APTITUDES.map((aptitude) => (
              <li
                key={aptitude}
                className="px-3 py-2.5 rounded-1 bg-ardoise/40 border border-ardoise/30"
              >
                {APTITUDE_LABEL[aptitude]}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => void start()}
          className="w-full sm:w-auto px-8 py-3.5 rounded-1 bg-mesure text-noir font-semibold text-sm inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          Commencer l’évaluation
        </button>
      </div>
    );
  }

  // ── Passation ─────────────────────────────────────────────────────────────
  if (stage === 'running' && current) {
    const selected = answers[current.id];
    const isLast = index + 1 === items.length;
    const optionCount = current.options?.length ?? current.visual?.options.length ?? 0;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-craie">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-xs text-brume">
            Question {index + 1} sur {items.length}
            <span className="mx-2" aria-hidden="true">·</span>
            {answeredCount} répondue{answeredCount > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-brume tabular-nums" aria-live="off">
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <div
          className="w-full h-1 rounded-full bg-ardoise/40 overflow-hidden mb-8"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={items.length}
          aria-label="Progression"
        >
          <div
            className="h-full bg-mesure transition-[width] duration-300"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        <div className="p-5 sm:p-8 rounded-2 bg-graphite/60 border border-ardoise/50 mb-8">
          <p className="text-[11px] uppercase tracking-wide text-brume mb-3">
            {APTITUDE_LABEL[current.aptitude]}
          </p>
          <h2 className="text-base sm:text-lg font-semibold text-craie whitespace-pre-line leading-relaxed mb-5">
            {current.prompt}
          </h2>

          {current.visual && (
            <MatrixRenderer
              matrixData={current.visual}
              selectedOptionIndex={selected ?? null}
              onSelectOption={(optionIndex) =>
                setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
              }
            />
          )}

          {current.options && (
            <fieldset>
              <legend className="sr-only">Choisissez une réponse</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
                      }
                      className={`min-h-11 p-3.5 rounded-2 border text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure ${
                        isSelected
                          ? 'border-mesure bg-mesure/20 text-craie'
                          : 'border-ardoise/40 bg-graphite/50 text-brume hover:text-craie'
                      }`}
                    >
                      <span className="mr-2.5 text-xs opacity-70">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p className="sr-only">{optionCount} réponses possibles.</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="min-h-11 px-5 rounded-1 border border-ardoise/50 text-xs font-semibold text-brume hover:text-craie disabled:opacity-30 inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Précédent
          </button>

          <button
            type="button"
            onClick={() => (isLast ? finish() : goTo(index + 1))}
            className="min-h-11 px-6 rounded-1 bg-mesure text-noir text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            {isLast ? 'Terminer et calculer' : 'Suivant'}
            {!isLast && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    );
  }

  // ── Résultats ─────────────────────────────────────────────────────────────
  if (stage === 'done' && report) {
    return (
      <IQResultsView
        report={report}
        items={items}
        onRestart={() => {
          setReport(null);
          setStage('config');
        }}
      />
    );
  }

  return null;
}
