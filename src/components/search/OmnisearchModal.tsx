import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { extendedKnowledgeItems } from '../../data/knowledgeExtended';
import { knowledgeCategories } from '../../data/knowledge';
import { countries } from '../../data/countries';
import type { Page } from '../../App';

interface OmnisearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (page: Page) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  type: 'article' | 'extended' | 'country' | 'iq' | 'quiz';
  icon: string;
  action: () => void;
}

export function OmnisearchModal({ isOpen, onClose, navigate }: OmnisearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) {
      // Suggestions initiales par défaut
      return [
        {
          id: 'sug_iq',
          title: 'Évaluer mes aptitudes cognitives',
          subtitle: 'Cinq aptitudes, 35 questions, un indice assorti de sa marge d’erreur.',
          category: 'Évaluation',
          type: 'iq',
          icon: '🧠',
          action: () => {
            navigate({ type: 'iq' });
            onClose();
          },
        },
        {
          id: 'sug_countries',
          title: '195 Pays du Monde',
          subtitle: 'Encyclopédie géographique complète, drapeaux, populations et économie.',
          category: 'Géographie',
          type: 'country',
          icon: '🌍',
          action: () => {
            navigate({ type: 'countries' });
            onClose();
          },
        },
      ];
    }

    const q = query.toLowerCase().trim();
    const items: SearchResultItem[] = [];

    // Recherche dans les articles enrichis
    extendedKnowledgeItems.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keyConcepts.some((c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q))
      ) {
        items.push({
          id: item.id,
          title: item.title,
          subtitle: item.summary,
          category: item.domainName,
          type: 'extended',
          icon: item.icon,
          action: () => {
            navigate({ type: 'knowledge' });
            onClose();
          },
        });
      }
    });

    // Recherche dans les pays
    countries.forEach((country) => {
      if (
        country.name.toLowerCase().includes(q) ||
        country.capital.toLowerCase().includes(q) ||
        country.continent.toLowerCase().includes(q)
      ) {
        items.push({
          id: `country_${country.name}`,
          title: country.name,
          subtitle: `Capitale : ${country.capital} • Continent : ${country.continent} • Pop : ${country.population}`,
          category: 'Pays du Monde',
          type: 'country',
          icon: '🌍',
          action: () => {
            navigate({ type: 'countries' });
            onClose();
          },
        });
      }
    });

    // Recherche dans les catégories de connaissances traditionnelles
    knowledgeCategories.forEach((cat) => {
      cat.sections.forEach((sec, sIdx) => {
        if (sec.title.toLowerCase().includes(q) || sec.content.toLowerCase().includes(q)) {
          items.push({
            id: `sec_${cat.id}_${sIdx}`,
            title: sec.title,
            subtitle: `${cat.title} — ${sec.content.substring(0, 80)}...`,
            category: cat.title,
            type: 'article',
            icon: cat.icon,
            action: () => {
              navigate({ type: 'article', categoryId: cat.id, sectionIndex: sIdx });
              onClose();
            },
          });
        }
      });
    });

    return items.slice(0, 10);
  }, [query, navigate, onClose]);

  // Écouteur clavier (Échap pour fermer, flèches pour naviguer).
  // Déclaré après `results` : le tableau de dépendances est évalué au rendu,
  // le placer plus haut lèverait une ReferenceError (zone morte temporelle).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-noir/80">
      <div className="w-full max-w-2xl rounded-2 bg-graphite border border-ardoise border border-mesure/30 overflow-hidden flex flex-col text-craie">
        {/* Champ de Recherche */}
        <div className="p-4 sm:p-5 border-b border-ardoise/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-mesure shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un concept, pays, test de QI, domaine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-craie placeholder-brume"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-brume hover:text-craie">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-ardoise/50 border border-ardoise text-micro text-brume nombres">
            ESC
          </kbd>
        </div>

        {/* Liste des Résultats */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5">
          {results.length === 0 ? (
            <div className="py-12 text-center text-texte text-sm">
              Aucun résultat trouvé pour « <strong className="text-craie">{query}</strong> ».
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3.5 rounded-2 flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? 'bg-mesure/20 border border-mesure/40 text-craie'
                      : 'hover:bg-ardoise/50 border border-transparent text-brume'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-1 bg-ardoise/50 border border-ardoise flex items-center justify-center text-lg shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-craie truncate">
                          {item.title}
                        </p>
                        <span className="text-micro px-2 py-0.5 rounded-full bg-ardoise/50 text-brume shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-micro text-brume truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ml-2 ${
                      isSelected ? 'text-mesure translate-x-0.5' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Pied de modal avec raccourcis */}
        <div className="p-3 bg-graphite/60 border-t border-ardoise/40 text-micro text-brume flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span>↑↓ pour naviguer</span>
            <span>•</span>
            <span>Entrée pour ouvrir</span>
          </div>
          <span className="text-mesure font-medium">NEXUS Omnisearch</span>
        </div>
      </div>
    </div>
  );
}
