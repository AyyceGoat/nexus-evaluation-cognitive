import { memo } from 'react';
import { MatrixCell, MatrixCellShape, MatrixItemData } from '../../types/matrix';

interface MatrixRendererProps {
  matrixData: MatrixItemData;
  selectedOptionIndex?: number | null;
  onSelectOption?: (index: number) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctOptionIndex?: number;
}

function renderShape(shape: MatrixCellShape, index: number) {
  const sizeMap: Record<number, number> = {
    1: 8,
    2: 14,
    3: 20,
    4: 28,
    5: 36,
  };
  const size = sizeMap[shape.size || 3] || 20;
  // `currentColor` plutôt qu'une couleur en dur : la donnée décrit une forme, pas une
  // identité visuelle. La couleur vient du thème via la propriété CSS `color`.
  const stroke = shape.stroke || 'currentColor';
  const fill = shape.fill || 'transparent';
  const rotation = shape.rotation || 0;

  // Calcul du centre relatif en fonction de la position
  let cx = 40;
  let cy = 40;

  if (shape.position === 'top') { cx = 40; cy = 20; }
  else if (shape.position === 'bottom') { cx = 40; cy = 60; }
  else if (shape.position === 'left') { cx = 20; cy = 40; }
  else if (shape.position === 'right') { cx = 60; cy = 40; }
  else if (shape.position === 'top-left') { cx = 22; cy = 22; }
  else if (shape.position === 'top-right') { cx = 58; cy = 22; }
  else if (shape.position === 'bottom-left') { cx = 22; cy = 58; }
  else if (shape.position === 'bottom-right') { cx = 58; cy = 58; }

  const transform = `rotate(${rotation} ${cx} ${cy})`;

  switch (shape.type) {
    case 'circle':
      return (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={size}
          stroke={stroke}
          strokeWidth="2.5"
          fill={fill}
          transform={transform}
        />
      );

    case 'square':
      return (
        <rect
          key={index}
          x={cx - size}
          y={cy - size}
          width={size * 2}
          height={size * 2}
          stroke={stroke}
          strokeWidth="2.5"
          fill={fill}
          transform={transform}
          rx="2"
        />
      );

    case 'triangle': {
      const h = size * 1.7;
      const pts = `${cx},${cy - h / 2} ${cx - size},${cy + h / 2} ${cx + size},${cy + h / 2}`;
      return (
        <polygon
          key={index}
          points={pts}
          stroke={stroke}
          strokeWidth="2.5"
          fill={fill}
          transform={transform}
          strokeLinejoin="round"
        />
      );
    }

    case 'diamond': {
      const pts = `${cx},${cy - size * 1.3} ${cx + size * 1.3},${cy} ${cx},${cy + size * 1.3} ${cx - size * 1.3},${cy}`;
      return (
        <polygon
          key={index}
          points={pts}
          stroke={stroke}
          strokeWidth="2.5"
          fill={fill}
          transform={transform}
          strokeLinejoin="round"
        />
      );
    }

    case 'cross':
      return (
        <g key={index} transform={transform}>
          <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'star': {
      const pts = `
        ${cx},${cy - size} 
        ${cx + size * 0.3},${cy - size * 0.3} 
        ${cx + size},${cy - size * 0.2} 
        ${cx + size * 0.45},${cy + size * 0.3} 
        ${cx + size * 0.65},${cy + size} 
        ${cx},${cy + size * 0.55} 
        ${cx - size * 0.65},${cy + size} 
        ${cx - size * 0.45},${cy + size * 0.3} 
        ${cx - size},${cy - size * 0.2} 
        ${cx - size * 0.3},${cy - size * 0.3}
      `;
      return (
        <polygon
          key={index}
          points={pts}
          stroke={stroke}
          strokeWidth="2"
          fill={fill}
          transform={transform}
          strokeLinejoin="round"
        />
      );
    }

    case 'line': {
      const count = shape.count || 1;
      const lines = [];
      const spacing = 7;
      const startOffset = -((count - 1) * spacing) / 2;

      for (let i = 0; i < count; i++) {
        const offset = startOffset + i * spacing;
        lines.push(
          <line
            key={`${index}-${i}`}
            x1={cx + offset}
            y1={cy - size * 1.4}
            x2={cx + offset}
            y2={cy + size * 1.4}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      }

      return (
        <g key={index} transform={transform}>
          {lines}
        </g>
      );
    }

    case 'dots': {
      const count = shape.count || 1;
      const dots = [];
      const dotSize = 4.5;
      
      if (count === 1) {
        dots.push(<circle key="d1" cx={cx} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
      } else if (count === 2) {
        dots.push(<circle key="d1" cx={cx - 8} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d2" cx={cx + 8} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
      } else if (count === 3) {
        dots.push(<circle key="d1" cx={cx - 10} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d2" cx={cx} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d3" cx={cx + 10} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
      } else if (count === 4) {
        dots.push(<circle key="d1" cx={cx - 8} cy={cy - 8} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d2" cx={cx + 8} cy={cy - 8} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d3" cx={cx - 8} cy={cy + 8} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d4" cx={cx + 8} cy={cy + 8} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
      } else if (count >= 5) {
        dots.push(<circle key="d1" cx={cx - 9} cy={cy - 9} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d2" cx={cx + 9} cy={cy - 9} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d3" cx={cx} cy={cy} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d4" cx={cx - 9} cy={cy + 9} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
        dots.push(<circle key="d5" cx={cx + 9} cy={cy + 9} r={dotSize} fill={fill !== 'transparent' ? fill : stroke} />);
      }

      return <g key={index}>{dots}</g>;
    }

    default:
      return null;
  }
}

export function SingleCellSvg({ cell, isQuestion = false }: { cell: MatrixCell; isQuestion?: boolean }) {
  if (isQuestion || cell.text === '?') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect x="2" y="2" width="76" height="76" rx="10" fill="rgba(99, 102, 241, 0.05)" stroke="rgba(99, 102, 241, 0.4)" strokeDasharray="4 4" strokeWidth="2" />
        <text x="40" y="49" textAnchor="middle" fill="#818cf8" fontSize="26" fontWeight="bold" fontFamily="monospace">?</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-sm">
      <rect x="2" y="2" width="76" height="76" rx="10" fill="rgba(15, 15, 35, 0.7)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
      {cell.shapes.map((shape, i) => renderShape(shape, i))}
    </svg>
  );
}

function MatrixRendererComponent({
  matrixData,
  selectedOptionIndex,
  onSelectOption,
  disabled = false,
  showCorrect = false,
  correctOptionIndex = 0,
}: MatrixRendererProps) {
  const gridSize = matrixData.gridSize || 3;
  const gridClass = gridSize === 2 ? 'grid-cols-2 max-w-[240px] sm:max-w-[280px]' : 'grid-cols-3 max-w-[320px] sm:max-w-[380px]';

  return (
    <div className="flex flex-col items-center gap-6 my-4">
      {/* Grille Matrice Principale */}
      <div className={`grid ${gridClass} gap-2.5 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl glass-strong border border-nexus-border/60 shadow-xl shadow-indigo-950/40 w-full mx-auto`}>
        {matrixData.cells.map((cell, idx) => {
          const isMissing = idx === matrixData.cells.length - 1 && cell.text === '?';
          return (
            <div
              key={cell.id || idx}
              className="aspect-square flex items-center justify-center p-1 relative rounded-xl overflow-hidden transition-all duration-300"
            >
              <SingleCellSvg cell={cell} isQuestion={isMissing} />
            </div>
          );
        })}
      </div>

      {/* Options de Choix */}
      {matrixData.options && matrixData.options.length > 0 && (
        <div className="w-full max-w-xl">
          <p className="text-xs uppercase tracking-wider text-nexus-muted text-center font-medium mb-3">
            Sélectionnez la figure correspondante :
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {matrixData.options.map((option, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isTheCorrect = idx === correctOptionIndex;
              
              let borderClass = 'border-nexus-border/40 hover:border-nexus-accent/50 bg-nexus-surface/50';
              if (showCorrect) {
                if (isTheCorrect) {
                  borderClass = 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30';
                } else if (isSelected && !isTheCorrect) {
                  borderClass = 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30';
                }
              } else if (isSelected) {
                borderClass = 'border-nexus-accent bg-nexus-accent/20 ring-2 ring-nexus-accent/40 shadow-lg shadow-indigo-500/20';
              }

              return (
                <button
                  key={option.id || idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectOption && onSelectOption(idx)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${borderClass}`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square">
                    <SingleCellSvg cell={option} />
                  </div>
                  <span className="text-xs font-semibold text-nexus-muted">
                    Option {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const MatrixRenderer = memo(MatrixRendererComponent);
