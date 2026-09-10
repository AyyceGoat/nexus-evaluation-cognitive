import { useState } from 'react';
import { CognitiveRadarChart } from './CognitiveRadarChart';
import { IQCertificate } from './IQCertificate';
import { MatrixRenderer } from './MatrixRenderer';
import { isReportUnlocked } from '../../lib/iq/storage';
import { APTITUDE_LABEL } from '../../lib/iq/types';
import type { IQItem, IQReport } from '../../lib/iq/types';
import { AlertTriangle, ChevronDown, ChevronUp, Lock, RotateCcw } from 'lucide-react';

interface IQResultsViewProps {
  report: IQReport;
  items: readonly IQItem[];
  onRestart: () => void;
}

type Tab = 'profil' | 'corrections' | 'attestation';

export function IQResultsView({ report, items, onRestart }: IQResultsViewProps) {
  const [tab, setTab] = useState<Tab>('profil');
  const [expanded, setExpanded] = useState<string | null>(null);

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const unlocked = isReportUnlocked(report.sessionId);
  const interpretable = report.validity.verdict !== 'not_interpretable';

  // ── Profil inexploitable : on n'affiche aucun score ────────────────────────
  if (!interpretable) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-nexus-text">
        <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-amber-500/5">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                Aucun score ne peut être calculé
              </h1>
              <p className="text-sm text-nexus-text leading-relaxed">{report.validity.message}</p>
            </div>
          </div>

          <dl className="mt-6 pt-6 border-t border-amber-500/20 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-nexus-muted">Bonnes réponses</dt>
              <dd className="text-white font-semibold tabular-nums mt-0.5">
                {report.correctCount} sur {report.itemCount}
              </dd>
            </div>
            <div>
              <dt className="text-nexus-muted">Attendu en répondant au hasard</dt>
              <dd className="text-white font-semibold tabular-nums mt-0.5">
                environ {report.validity.expectedByChance}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-8 min-h-11 px-6 rounded-xl bg-nexus-accent text-white text-sm font-semibold inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Repasser l’évaluation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-nexus-text">
      <h1 className="font-display text-2xl sm:text-4xl font-bold mb-8">Votre résultat</h1>

      {/* ── Score, intervalle, percentile ───────────────────────────────────── */}
      <section className="p-6 sm:p-8 rounded-3xl bg-nexus-surface/60 border border-nexus-border/50 mb-6">
        <p className="text-xs text-nexus-muted mb-1">Indice estimé</p>
        <p className="font-display text-5xl sm:text-6xl font-bold text-white tabular-nums leading-none">
          {report.scaled.point}
        </p>
        <p className="text-sm text-nexus-muted mt-3 tabular-nums">
          Intervalle de confiance à 95 % : {report.scaled.lower95} – {report.scaled.upper95}
        </p>

        <p className="text-xs text-nexus-muted leading-relaxed mt-4 max-w-prose">
          Le chiffre central est l’estimation la plus probable ; l’intervalle indique où se
          situe réellement votre niveau. C’est l’intervalle qu’il faut lire, pas le chiffre seul.
        </p>

        {report.percentile !== null && (
          <p className="text-sm text-nexus-text mt-5 pt-5 border-t border-nexus-border/40">
            Vous vous situez au <strong className="tabular-nums">{report.percentile}ᵉ</strong> centile,{' '}
            <span className="text-nexus-muted">{report.norm.label}.</span>
          </p>
        )}

        {report.validity.message && (
          <p className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
            {report.validity.message}
          </p>
        )}
      </section>

      <p className="text-xs text-nexus-muted leading-relaxed mb-8 max-w-prose">
        Cette évaluation est un outil d’entraînement et d’auto-évaluation. Elle ne constitue pas
        un diagnostic psychologique et ne remplace pas un bilan conduit par un psychologue.
      </p>

      {/* ── Onglets ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-nexus-border/40 mb-8" role="tablist">
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
            className={`min-h-11 px-4 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent ${
              tab === id
                ? 'border-nexus-accent text-white'
                : 'border-transparent text-nexus-muted hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Profil par aptitude (gratuit) ───────────────────────────────────── */}
      {tab === 'profil' && (
        <section>
          <div className="flex justify-center mb-6">
            <CognitiveRadarChart results={report.aptitudes} />
          </div>

          <p className="text-xs text-nexus-muted leading-relaxed max-w-prose mb-6">
            La zone ombrée figure la marge d’erreur de chaque aptitude. Elle est large : sept
            questions par aptitude suffisent à dégager une tendance, pas à établir un écart fin.
          </p>

          {report.strengths.length > 0 && (
            <p className="text-sm mb-2">
              <span className="text-nexus-muted">Ressort nettement : </span>
              <strong className="text-white">
                {report.strengths.map((a) => APTITUDE_LABEL[a]).join(', ')}
              </strong>
            </p>
          )}
          {report.weaknesses.length > 0 && (
            <p className="text-sm mb-2">
              <span className="text-nexus-muted">À travailler : </span>
              <strong className="text-white">
                {report.weaknesses.map((a) => APTITUDE_LABEL[a]).join(', ')}
              </strong>
            </p>
          )}
          {report.strengths.length === 0 && report.weaknesses.length === 0 && (
            <p className="text-sm text-nexus-muted max-w-prose">
              Aucune aptitude ne se détache franchement des autres. Sur une passation de cette
              longueur, c’est le résultat le plus fréquent, et il est plus fiable qu’un classement
              qui serait dicté par le hasard.
            </p>
          )}
        </section>
      )}

      {/* ── Corrections (réservées) ─────────────────────────────────────────── */}
      {tab === 'corrections' && (
        <section>
          {!unlocked ? (
            <LockedNotice label="les corrections détaillées de vos 35 questions" />
          ) : (
            <ul className="space-y-3">
              {report.responses.map((response, position) => {
                const item = itemsById.get(response.itemId);
                if (!item) return null;
                const open = expanded === item.id;

                return (
                  <li
                    key={item.id}
                    className={`rounded-2xl border overflow-hidden ${
                      response.correct
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-nexus-border/50 bg-nexus-surface/40'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpanded(open ? null : item.id)}
                      className="w-full min-h-11 p-4 flex items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
                    >
                      <span className="text-sm">
                        <span className="text-nexus-muted mr-2 tabular-nums">{position + 1}.</span>
                        <span className="text-white">{APTITUDE_LABEL[item.aptitude]}</span>
                        <span className="ml-2 text-xs text-nexus-muted">
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
                      <div className="p-4 sm:p-6 border-t border-nexus-border/40 space-y-4">
                        <p className="text-sm whitespace-pre-line">{item.prompt}</p>

                        {item.visual && (
                          <MatrixRenderer
                            matrixData={item.visual}
                            selectedOptionIndex={response.selectedIndex}
                            showCorrect
                            correctOptionIndex={item.correctIndex}
                            disabled
                          />
                        )}

                        {item.options && (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.options.map((option, optionIndex) => {
                              const isCorrect = optionIndex === item.correctIndex;
                              const isChosen = optionIndex === response.selectedIndex;
                              return (
                                <li
                                  key={option}
                                  className={`p-3 rounded-xl border text-xs ${
                                    isCorrect
                                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
                                      : isChosen
                                        ? 'border-rose-500/60 bg-rose-500/10 text-rose-200'
                                        : 'border-nexus-border/40 text-nexus-muted'
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

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-nexus-border/40">
                          <p className="text-sm text-nexus-text mb-2">{item.explanation}</p>
                          <ol className="space-y-1 text-xs text-nexus-muted list-decimal list-inside">
                            {item.reasoning.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ── Attestation (réservée) ──────────────────────────────────────────── */}
      {tab === 'attestation' && (
        <section>
          {!unlocked ? (
            <LockedNotice label="votre attestation de passation" />
          ) : (
            <IQCertificate report={report} />
          )}
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-nexus-border/30">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-11 px-6 rounded-xl border border-nexus-border/50 text-sm font-semibold text-nexus-muted hover:text-white inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Repasser l’évaluation
        </button>
      </div>
    </div>
  );
}

/**
 * Section réservée.
 *
 * Aucun bouton de paiement n'est proposé tant que l'encaissement réel n'existe pas :
 * l'ancienne modale simulait la transaction. Le message dit où en est la fonctionnalité
 * plutôt que de faire semblant de vendre.
 */
function LockedNotice({ label }: { label: string }) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-nexus-border/50 bg-nexus-surface/40 max-w-lg">
      <Lock className="w-6 h-6 text-nexus-muted mb-4" aria-hidden="true" />
      <h2 className="font-display text-lg font-bold text-white mb-2">Section réservée</h2>
      <p className="text-sm text-nexus-muted leading-relaxed">
        Le rapport complet comprend {label}. Le paiement par mobile money est en cours
        d’intégration : cette section s’ouvrira dès qu’il sera opérationnel.
      </p>
    </div>
  );
}
