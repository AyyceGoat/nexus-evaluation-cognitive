import { memo, useId, useState } from 'react';
import { toRadarValue } from '../../lib/iq/scale';
import type { AptitudeResult } from '../../lib/iq/types';

interface CognitiveRadarChartProps {
  results: readonly AptitudeResult[];
  size?: number;
}

/** Quantile normal à 95 %, pour la bande d'incertitude. */
const Z_95 = 1.96;

function CognitiveRadarChartComponent({ results, size = 320 }: CognitiveRadarChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const titleId = useId();
  const descId = useId();

  const center = size / 2;
  const radius = size / 2 - 52;
  const count = results.length;
  const angleStep = (Math.PI * 2) / count;

  const pointAt = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.max(0.02, Math.min(1, value / 100));
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };

  const polygon = (values: number[]) =>
    values.map((v, i) => pointAt(i, v).join(',')).join(' ');

  const values = results.map((r) => r.radarValue);

  // Bande d'incertitude : la même estimation, à plus ou moins deux erreurs types.
  // Avec sept items par aptitude, cette bande est large — c'est précisément ce qu'il
  // faut montrer plutôt qu'un trait unique qui suggérerait une précision inexistante.
  const lower = results.map((r) => toRadarValue(r.estimate.theta - Z_95 * r.estimate.standardError));
  const upper = results.map((r) => toRadarValue(r.estimate.theta + Z_95 * r.estimate.standardError));

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const summary = results
    .map((r) => `${r.label} : ${r.radarValue} sur 100`)
    .join(' ; ');

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible text-nexus-accent"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>Profil par aptitude</title>
        <desc id={descId}>{summary}</desc>

        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={polygon(results.map(() => level * 100))}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.14}
            strokeWidth={1}
          />
        ))}

        {results.map((result, i) => {
          const [x, y] = pointAt(i, 100);
          return (
            <line
              key={result.aptitude}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          );
        })}

        {/* Médiane de référence : le 50ᵉ centile. */}
        <polygon
          points={polygon(results.map(() => 50))}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Enveloppe d'incertitude, en deux tracés superposés. */}
        <polygon points={polygon(upper)} fill="currentColor" fillOpacity={0.12} stroke="none" />
        <polygon points={polygon(lower)} fill="var(--color-nexus-bg)" stroke="none" />

        <polygon
          points={polygon(values)}
          fill="currentColor"
          fillOpacity={0.22}
          stroke="currentColor"
          strokeWidth={2}
        />

        {results.map((result, i) => {
          const [x, y] = pointAt(i, result.radarValue);
          return (
            <circle
              key={result.aptitude}
              cx={x}
              cy={y}
              r={active === result.aptitude ? 6 : 4}
              fill="currentColor"
            />
          );
        })}

        {results.map((result, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (radius + 30) * Math.cos(angle);
          const y = center + (radius + 30) * Math.sin(angle);
          const anchor =
            Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';

          return (
            <text
              key={result.aptitude}
              x={x}
              y={y}
              textAnchor={anchor}
              className="fill-nexus-muted"
              fontSize="11"
              fontWeight="600"
              onMouseEnter={() => setActive(result.aptitude)}
              onMouseLeave={() => setActive(null)}
            >
              {result.radarValue}
            </text>
          );
        })}
      </svg>

      {/* Équivalent textuel : la même information, lisible sans percevoir le graphique. */}
      <ul className="w-full max-w-sm space-y-1.5 text-xs">
        {results.map((result) => (
          <li key={result.aptitude} className="flex items-baseline justify-between gap-3">
            <span className="text-nexus-text">{result.label}</span>
            <span className="text-nexus-muted tabular-nums">
              {result.radarValue}/100
              <span className="ml-2 opacity-70">
                ({result.correctCount}/{result.itemCount})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CognitiveRadarChart = memo(CognitiveRadarChartComponent);
