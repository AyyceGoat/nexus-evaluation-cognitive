import { useState } from 'react';
import { SCALE_SD } from '../../lib/iq/scale';
import type { IQReport } from '../../lib/iq/types';
import { Printer } from 'lucide-react';

interface IQCertificateProps {
  report: IQReport;
}

/**
 * Attestation de passation.
 *
 * Ce document n'est pas « officiel » et ne le prétend plus : il atteste qu'une
 * passation a eu lieu et en restitue le résultat, marge d'erreur comprise. Il n'affiche
 * un écart-type que si le référentiel est mesuré — imprimer « σ = 15 » au-dessus de
 * chiffres issus d'une distribution théorique reviendrait à présenter une hypothèse
 * comme une mesure.
 */
export function IQCertificate({ report }: IQCertificateProps) {
  const [name, setName] = useState(report.candidateName ?? '');

  const formattedDate = new Date(report.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasMeasuredNorm = report.norm.source === 'empirical';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6 no-print">
        <div className="flex-1">
          <label htmlFor="certificate-name" className="block text-xs font-semibold text-nexus-text mb-1.5">
            Nom figurant sur l’attestation
          </label>
          <input
            id="certificate-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre nom complet"
            className="w-full px-4 py-2.5 rounded-xl bg-nexus-surface/80 border border-nexus-border/60 text-nexus-text text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 px-5 rounded-xl border border-nexus-border/50 text-xs font-semibold text-white inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-accent"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          Imprimer ou enregistrer en PDF
        </button>
      </div>

      <article className="relative p-8 sm:p-12 rounded-3xl bg-nexus-card border border-nexus-border/60 text-center">
        <div className="absolute inset-3 sm:inset-5 border border-nexus-border/40 rounded-2xl pointer-events-none" aria-hidden="true" />

        <p className="text-[11px] uppercase tracking-[0.2em] text-nexus-muted mb-3">NEXUS</p>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8">
          Attestation de passation
        </h2>

        <p className="text-xs sm:text-sm text-nexus-muted mb-2">Délivrée à</p>
        <p className="font-display text-2xl sm:text-3xl font-bold text-white pb-2 mb-8 border-b border-nexus-border/50 inline-block px-8">
          {name.trim() || 'Candidat non nommé'}
        </p>

        <p className="text-xs sm:text-sm text-nexus-muted max-w-lg mx-auto leading-relaxed mb-8">
          qui a passé le {formattedDate} une évaluation de {report.itemCount} questions portant sur
          cinq aptitudes cognitives.
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8 text-left">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <dt className="text-[10px] uppercase text-nexus-muted">Indice estimé</dt>
            <dd className="font-display text-xl font-bold text-white tabular-nums">
              {report.scaled.point}
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <dt className="text-[10px] uppercase text-nexus-muted">Intervalle 95 %</dt>
            <dd className="font-display text-xl font-bold text-white tabular-nums">
              {report.scaled.lower95}–{report.scaled.upper95}
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <dt className="text-[10px] uppercase text-nexus-muted">Centile</dt>
            <dd className="font-display text-xl font-bold text-white tabular-nums">
              {report.percentile !== null ? `${report.percentile}ᵉ` : '—'}
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <dt className="text-[10px] uppercase text-nexus-muted">Réussites</dt>
            <dd className="font-display text-xl font-bold text-white tabular-nums">
              {report.correctCount}/{report.itemCount}
            </dd>
          </div>
        </dl>

        <ul className="max-w-md mx-auto mb-8 space-y-1.5 text-xs">
          {report.aptitudes.map((aptitude) => (
            <li key={aptitude.aptitude} className="flex items-baseline justify-between gap-3">
              <span className="text-nexus-muted">{aptitude.label}</span>
              <span className="text-nexus-text tabular-nums">
                {aptitude.correctCount}/{aptitude.itemCount}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-6 border-t border-nexus-border/40 text-[11px] text-nexus-muted leading-relaxed max-w-lg mx-auto space-y-2">
          <p>
            Résultat exprimé sur une échelle de moyenne 100
            {hasMeasuredNorm ? ` et d’écart-type ${SCALE_SD} mesuré sur ${report.norm.populationSize} passations` : ''}.
            Le centile est {report.norm.label}.
          </p>
          <p>
            Cette attestation rend compte d’une passation en ligne à visée éducative. Elle n’est pas
            un diagnostic psychologique et ne remplace pas un bilan conduit par un psychologue.
          </p>
          <p className="tabular-nums">Référence de passation : {report.sessionId}</p>
        </div>
      </article>
    </div>
  );
}
