import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { itemBank } from '../../data/iq';
import { buildReport } from '../../lib/iq/score';
import { selectSession } from '../../lib/iq/selection';
import { getRecentItemIds, recordSession, saveReport } from '../../lib/iq/storage';
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

  const start = useCallback(() => {
    const selected = selectSession(itemBank, {
      count: length,
      excludeIds: getRecentItemIds(),
    });
    setItems(selected);
    setIndex(0);
    setAnswers({});
    timeByItem.current = {};
    enteredAt.current = Date.now();
    sessionStartedAt.current = new Date().toISOString();
    setStage('running');
  }, [length]);

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
  }, [answers, candidateName, commitTime, current?.id, items]);

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-nexus-text">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          Évaluation des aptitudes cognitives
        </h1>
        <p className="text-nexus-muted text-sm sm:text-base leading-relaxed max-w-xl mb-8">
          Cinq aptitudes sont évaluées. Le résultat est une estimation assortie de sa marge
          d’erreur, pas un chiffre exact : prenez le temps de lire chaque énoncé, les réponses
          expédiées sont détectées et rendent le résultat inexploitable.
        </p>

        <fieldset className="mb-8">
          <legend className="text-xs font-semibold text-nexus-text mb-3">
            Longueur de la passation
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LENGTHS.map((option) => (
              <button
                key={option.count}
                type="button"
                onClick={() => setLength(option.count)}
                aria-pressed={length === option.count}
                className={`p-4 rounded-2xl border text-left transition-colors ${
                  length === option.count
                    ? 'border-nexus-accent bg-nexus-accent/15'
                    : 'border-nexus-border/50 hover:bg-white/5'
                }`}
              >
                <span className="block font-semibold text-sm text-white">{option.label}</span>
                <span className="block text-xs text-nexus-muted mt-1">
                  {option.count} questions
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-[11px] text-nexus-muted">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {option.minutes}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-8">
          <label htmlFor="candidate-name" className="block text-xs font-semibold text-nexus-text mb-1.5">
            Votre nom (facultatif, il figurera sur l’attestation)
          </label>
          <input
            id="candidate-name"
            type="text"
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="Ex : Koffi Kouamé"
            className="w-full px-4 py-2.5 rounded-xl bg-nexus-surface/80 border border-nexus-border/60 text-nexus-text text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
          />
        </div>

        <div className="mb-10">
          <h2 className="text-xs font-semibold text-nexus-text mb-3">Aptitudes évaluées</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-nexus-muted">
            {APTITUDES.map((aptitude) => (
              <li
                key={aptitude}
                className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-nexus-border/30"
              >
                {APTITUDE_LABEL[aptitude]}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={start}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-nexus-accent text-white font-semibold text-sm inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-nexus-text">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-xs text-nexus-muted">
            Question {index + 1} sur {items.length}
            <span className="mx-2" aria-hidden="true">·</span>
            {answeredCount} répondue{answeredCount > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-nexus-muted tabular-nums" aria-live="off">
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <div
          className="w-full h-1 rounded-full bg-nexus-border/40 overflow-hidden mb-8"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={items.length}
          aria-label="Progression"
        >
          <div
            className="h-full bg-nexus-accent transition-[width] duration-300"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        <div className="p-5 sm:p-8 rounded-3xl bg-nexus-surface/60 border border-nexus-border/50 mb-8">
          <p className="text-[11px] uppercase tracking-wide text-nexus-muted mb-3">
            {APTITUDE_LABEL[current.aptitude]}
          </p>
          <h2 className="text-base sm:text-lg font-semibold text-white whitespace-pre-line leading-relaxed mb-5">
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
                      className={`min-h-11 p-3.5 rounded-2xl border text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent ${
                        isSelected
                          ? 'border-nexus-accent bg-nexus-accent/20 text-white'
                          : 'border-nexus-border/40 bg-nexus-surface/50 text-nexus-muted hover:text-white'
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
            className="min-h-11 px-5 rounded-xl border border-nexus-border/50 text-xs font-semibold text-nexus-muted hover:text-white disabled:opacity-30 inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Précédent
          </button>

          <button
            type="button"
            onClick={() => (isLast ? finish() : goTo(index + 1))}
            className="min-h-11 px-6 rounded-xl bg-nexus-accent text-white text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
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
