import { useState } from 'react';
import { AptitudeProfile } from './AptitudeProfile';
import { IntervalBar } from './IntervalBar';
import { IQCertificate } from './IQCertificate';
import { MatrixRenderer } from './MatrixRenderer';
import { APTITUDE_LABEL } from '../../lib/iq/types';
import type { IQReport } from '../../lib/iq/types';
import type { CorrectionServeur, QuestionServeur } from '../../lib/backend';
import { AlertTriangle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface IQResultsViewProps {
  report: IQReport;
  /** Les énoncés, servis par le serveur : ils ne portent aucune bonne réponse. */
  questions: readonly QuestionServeur[];
  /**
   * Le corrigé, servi séparément et seulement une fois la passation close.
   *
   * Vide tant qu'il n'a pas été récupéré : l'écran affiche alors les questions sans
   * leurs corrections, plutôt que d'attendre.
   */
  corrections: readonly CorrectionServeur[];
  onRestart: () => void;
}

type Tab = 'profil' | 'corrections' | 'attestation';

export function IQResultsView({
  report,
  questions,
  corrections,
  onRestart,
}: IQResultsViewProps) {
  const [tab, setTab] = useState<Tab>('profil');
  const [expanded, setExpanded] = useState<string | null>(null);

  const itemsById = new Map(questions.map((question) => [question.id, question]));
  const corrigeById = new Map(corrections.map((c) => [c.itemId, c]));
  const interpretable = report.validity.verdict !== 'not_interpretable';

  // ── Profil inexploitable : on n'affiche aucun score ────────────────────────
  if (!interpretable) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-craie">
        <div className="p-6 sm:p-8 rounded-2 border border-mesure/40 bg-mesure/5">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-mesure shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h1 className="font-titre text-xl sm:text-2xl font-bold text-craie mb-2">
                Aucun score ne peut être calculé
              </h1>
              <p className="text-sm text-craie leading-relaxed">{report.validity.message}</p>
            </div>
          </div>

          <dl className="mt-6 pt-6 border-t border-mesure/20 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-brume">Bonnes réponses</dt>
              <dd className="text-craie font-semibold tabular-nums mt-0.5">
                {report.correctCount} sur {report.itemCount}
              </dd>
            </div>
            <div>
              <dt className="text-brume">Attendu en répondant au hasard</dt>
              <dd className="text-craie font-semibold tabular-nums mt-0.5">
                environ {report.validity.expectedByChance}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-8 min-h-11 px-6 rounded-1 bg-mesure text-noir text-sm font-semibold inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Repasser l’évaluation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-craie">
      <h1 className="font-titre text-2xl sm:text-4xl font-bold mb-8">Votre résultat</h1>

      {/* ── Score, intervalle, percentile ───────────────────────────────────── */}
      <section className="p-6 sm:p-8 rounded-2 bg-graphite border border-ardoise mb-6">
        <p className="text-micro text-brume mb-4">Indice estimé</p>

        <IntervalBar scaled={report.scaled} />

        {report.percentile !== null && (
          <p className="text-petit text-craie mt-6 pt-6 border-t border-ardoise">
            Vous vous situez au <strong className="nombres">{report.percentile}ᵉ</strong> centile,{' '}
            <span className="text-brume">{report.norm.label}.</span>
          </p>
        )}

        {report.validity.message && (
          <p className="mt-4 border-l-2 border-mesure pl-4 text-petit text-texte leading-relaxed">
            {report.validity.message}
          </p>
        )}
      </section>

      <p className="text-petit text-texte leading-relaxed mb-8 max-w-prose">
        Cette évaluation est un outil d’entraînement et d’auto-évaluation. Elle ne constitue pas
        un diagnostic psychologique et ne remplace pas un bilan conduit par un psychologue.
      </p>

      {/* ── Onglets ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-ardoise/40 mb-8" role="tablist">
        {(
          [
            ['profil', 'Profil'],
            ['corrections', 'Corrections'],
            ['attestation', 'Attestation'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-11 px-4 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure ${
              tab === id
                ? 'border-mesure text-craie'
                : 'border-transparent text-brume hover:text-craie'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Profil par aptitude ───────────────────────────────────── */}
      {tab === 'profil' && (
        <AptitudeProfile
          aptitudes={report.aptitudes}
          forces={report.strengths}
          faiblesses={report.weaknesses}
        />
      )}

      {/* ── Corrections ─────────────────────────────────────────── */}
      {tab === 'corrections' && (
        <section>
          <ul className="space-y-3">
            {report.responses.map((response, position) => {
              const item = itemsById.get(response.itemId);
              if (!item) return null;
              const corrige = corrigeById.get(response.itemId);
              const open = expanded === item.id;

              return (
                <li
                  key={item.id}
                  className={`rounded-2 border overflow-hidden ${
                    response.correct
                      ? 'border-mesure/30 bg-mesure/5'
                      : 'border-ardoise/50 bg-graphite/40'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setExpanded(open ? null : item.id)}
                    className="w-full min-h-11 p-4 flex items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
                  >
                    <span className="text-sm">
                      <span className="text-brume mr-2 tabular-nums">{position + 1}.</span>
                      <span className="text-craie">{APTITUDE_LABEL[item.aptitude]}</span>
                      <span className="ml-2 text-xs text-brume">
                        {response.correct ? 'réussie' : 'manquée'}
                      </span>
                    </span>
                    {open ? (
                      <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>

                  {open && (
                    <div className="p-4 sm:p-6 border-t border-ardoise/40 space-y-4">
                      <p className="text-sm whitespace-pre-line">{item.prompt}</p>

                      {item.visual && (
                        <MatrixRenderer
                          matrixData={item.visual}
                          selectedOptionIndex={response.selectedIndex}
                          showCorrect={corrige !== undefined}
                          correctOptionIndex={corrige?.correctIndex ?? -1}
                          disabled
                        />
                      )}

                      {item.options && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((option, optionIndex) => {
                            const isCorrect = optionIndex === corrige?.correctIndex;
                            const isChosen = optionIndex === response.selectedIndex;
                            return (
                              <li
                                key={option}
                                className={`p-3 rounded-1 border text-xs ${
                                  isCorrect
                                    ? 'border-mesure/60 bg-mesure/15 text-mesure'
                                    : isChosen
                                      ? 'border-alerte/60 bg-alerte/10 text-alerte'
                                      : 'border-ardoise/40 text-brume'
                                }`}
                              >
                                {option}
                                {isCorrect && <span className="ml-2 opacity-80">— bonne réponse</span>}
                                {isChosen && !isCorrect && (
                                  <span className="ml-2 opacity-80">— votre réponse</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* L'explication vient du corrigé, servi séparément et
                          seulement une fois la passation close. */}
                      {corrige && (
                        <div className="p-4 rounded-1 bg-ardoise/40 border border-ardoise/40">
                          <p className="text-sm text-craie mb-2">{corrige.explanation}</p>
                          <ol className="space-y-1 text-xs text-brume list-decimal list-inside">
                            {corrige.reasoning.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Attestation ──────────────────────────────────────────── */}
      {tab === 'attestation' && (
        <section>
          <IQCertificate report={report} />
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-ardoise/30">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-11 px-6 rounded-1 border border-ardoise/50 text-sm font-semibold text-brume hover:text-craie inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Repasser l’évaluation
        </button>
      </div>
    </div>
  );
}
