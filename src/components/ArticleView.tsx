import React, { memo, useMemo } from 'react';
import type { Page } from '../App';
import { knowledgeCategories } from '../data/knowledge';

interface Props {
  categoryId: string;
  sectionIndex: number;
  subIndex?: number;
  navigate: (page: Page) => void;
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.JSX.Element[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <h3 key={i} className="font-display text-base sm:text-lg font-semibold text-nexus-glow mt-6 mb-2">
          {trimmed.replace(/\*\*/g, '')}
        </h3>
      );
    } else if (trimmed.startsWith('- **')) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*\s*[:\s]?\s*(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-2 sm:ml-4 mb-1.5">
            <span className="text-nexus-accent mt-1 shrink-0">◆</span>
            <p className="text-sm sm:text-base text-nexus-muted leading-relaxed">
              <strong className="text-nexus-text">{match[1]}</strong>
              {match[2] ? ` : ${match[2]}` : ''}
            </p>
          </div>
        );
      }
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-2 sm:ml-4 mb-1.5">
          <span className="text-nexus-accent mt-1.5 shrink-0 text-[8px]">●</span>
          <p className="text-sm sm:text-base text-nexus-muted leading-relaxed">{trimmed.substring(2)}</p>
        </div>
      );
    } else if (/^\d+\./.test(trimmed)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-2 sm:ml-4 mb-1.5">
          <span className="text-nexus-accent font-semibold shrink-0 mt-0.5 text-sm">{trimmed.match(/^\d+/)?.[0]}.</span>
          <p className="text-sm sm:text-base text-nexus-muted leading-relaxed">{trimmed.replace(/^\d+\.\s*/, '')}</p>
        </div>
      );
    } else {
      // Handle inline bold
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} className="text-sm sm:text-base text-nexus-muted leading-relaxed mb-2">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-nexus-text">{part.replace(/\*\*/g, '')}</strong>
              : <span key={j}>{part}</span>
          )}
        </p>
      );
    }
  });

  return elements;
}

function ArticleView({ categoryId, sectionIndex, subIndex, navigate }: Props) {
  const category = useMemo(() => knowledgeCategories.find(c => c.id === categoryId), [categoryId]);
  
  if (!category) return null;
  
  const section = category.sections[sectionIndex];
  if (!section) return null;

  const content = subIndex !== undefined && section.subsections?.[subIndex]
    ? section.subsections[subIndex]
    : section;

  const title = subIndex !== undefined && section.subsections?.[subIndex]
    ? section.subsections[subIndex].title
    : section.title;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-nexus-muted mb-6 sm:mb-8 flex-wrap">
        <button onClick={() => navigate({ type: 'knowledge' })} className="hover:text-nexus-text transition-colors">
          Savoir
        </button>
        <span>›</span>
        <button onClick={() => navigate({ type: 'knowledge', categoryId: category.id })} className="hover:text-nexus-text transition-colors">
          {category.title}
        </button>
        <span>›</span>
        {subIndex !== undefined && (
          <>
            <button
              onClick={() => navigate({ type: 'article', categoryId, sectionIndex })}
              className="hover:text-nexus-text transition-colors"
            >
              {section.title}
            </button>
            <span>›</span>
          </>
        )}
        <span className="text-nexus-text truncate">{title}</span>
      </div>

      {/* Article */}
      <article className="glass rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-b border-nexus-border/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl sm:text-3xl">{category.icon}</span>
            <span className="px-3 py-1 rounded-full bg-nexus-accent/10 text-nexus-accent text-xs font-medium">{category.title}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
        </div>

        <div className="p-6 sm:p-8 md:p-10">
          {renderContent(content.content)}

          {/* Subsections navigation */}
          {subIndex === undefined && section.subsections && section.subsections.length > 0 && (
            <div className="mt-10 pt-8 border-t border-nexus-border/20">
              <h3 className="font-display text-lg font-semibold mb-4 text-gradient">Approfondir</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.subsections.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => navigate({ type: 'article', categoryId, sectionIndex, subIndex: i })}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-nexus-border/20 hover:border-nexus-accent/30 hover:bg-white/[0.03] transition-all text-left"
                  >
                    <span className="text-nexus-accent">↳</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold group-hover:text-nexus-glow transition-colors truncate">{sub.title}</p>
                      <p className="text-xs text-nexus-muted mt-0.5 line-clamp-2">{sub.content.substring(0, 80)}...</p>
                    </div>
                    <span className="text-nexus-muted group-hover:text-nexus-accent text-sm shrink-0">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Navigation between sections */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between">
        {sectionIndex > 0 && (
          <button
            onClick={() => navigate({ type: 'article', categoryId, sectionIndex: sectionIndex - 1 })}
            className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:bg-white/5 transition-colors text-sm"
          >
            <span>←</span>
            <span className="truncate">{category.sections[sectionIndex - 1].title}</span>
          </button>
        )}
        <div className="flex-1" />
        {sectionIndex < category.sections.length - 1 && (
          <button
            onClick={() => navigate({ type: 'article', categoryId, sectionIndex: sectionIndex + 1 })}
            className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:bg-white/5 transition-colors text-sm"
          >
            <span className="truncate">{category.sections[sectionIndex + 1].title}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(ArticleView);
