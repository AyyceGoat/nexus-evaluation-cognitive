import { useState, useMemo, memo } from 'react';
import type { Page } from '../App';
import { extendedDomains, extendedKnowledgeItems, ExtendedKnowledgeItem } from '../data/knowledgeExtended';
import {
  BookOpen,
  Sparkles,
  Brain,
  Clock,
  ChevronRight,
  ArrowLeft,
  Lightbulb,
  Compass,
  Search,
  Bot,
} from 'lucide-react';

interface Props {
  navigate: (page: Page) => void;
}

function KnowledgeExplorer({ navigate }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExtendedItem, setSelectedExtendedItem] = useState<ExtendedKnowledgeItem | null>(null);
  const [activeTab, setActiveTab] = useState<'article' | 'concepts' | 'flashcards'>('article');
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Filtrage des articles étendus
  const filteredExtendedItems = useMemo(() => {
    return extendedKnowledgeItems.filter((item) => {
      const matchesDomain = selectedDomain === 'all' || item.domainId === selectedDomain;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keyConcepts.some((c) => c.term.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeIn text-nexus-text">
      {/* VUE 1 : DÉTAIL D'UN ARTICLE DU SAVOIR */}
      {selectedExtendedItem ? (
        <div className="max-w-4xl mx-auto animate-fadeIn">
          {/* Bouton Retour */}
          <button
            onClick={() => {
              setSelectedExtendedItem(null);
              setActiveTab('article');
            }}
            className="flex items-center gap-2 text-nexus-muted hover:text-white text-xs font-semibold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Retour à la bibliothèque</span>
          </button>

          <div className="p-6 sm:p-10 rounded-3xl glass-strong border border-nexus-border/60 shadow-2xl mb-8 relative overflow-hidden">
            {/* Halo de couleur dynamique */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Badges & Métadonnées */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="text-3xl sm:text-4xl">{selectedExtendedItem.icon}</span>
              <span className="px-3 py-1 rounded-full bg-nexus-accent/20 border border-nexus-accent/40 text-nexus-glow text-xs font-semibold">
                {selectedExtendedItem.domainName}
              </span>
              <span className="text-xs text-nexus-muted px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                {selectedExtendedItem.category}
              </span>
              <span className="text-xs text-nexus-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedExtendedItem.readTimeMinutes} min de lecture
              </span>
              <span className="text-xs text-nexus-muted">
                • Niveau {selectedExtendedItem.level}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              {selectedExtendedItem.title}
            </h1>

            {/* Résumé Synthétique */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs sm:text-sm text-nexus-text leading-relaxed mb-6">
              <p className="font-bold text-nexus-glow mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Ce qu'il faut retenir (Synthèse flash) :
              </p>
              {selectedExtendedItem.summary}
            </div>

            {/* Onglets de contenu dans l'article */}
            <div className="flex items-center gap-2 border-b border-nexus-border/40 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('article')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'article'
                    ? 'bg-nexus-accent/20 text-nexus-glow border border-nexus-accent/40'
                    : 'text-nexus-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Article Complet</span>
              </button>

              <button
                onClick={() => setActiveTab('concepts')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'concepts'
                    ? 'bg-nexus-accent/20 text-nexus-glow border border-nexus-accent/40'
                    : 'text-nexus-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Concepts Clés ({selectedExtendedItem.keyConcepts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'flashcards'
                    ? 'bg-nexus-accent/20 text-nexus-glow border border-nexus-accent/40'
                    : 'text-nexus-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Cartes Mémoire ({selectedExtendedItem.flashcards.length})</span>
              </button>
            </div>

            {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
            {activeTab === 'article' && (
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-nexus-text leading-relaxed whitespace-pre-line animate-fadeIn">
                {selectedExtendedItem.content}
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="space-y-3 animate-fadeIn">
                {selectedExtendedItem.keyConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-cyan-300 text-sm mb-1">{concept.term}</h4>
                    <p className="text-xs text-nexus-muted leading-relaxed">{concept.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="animate-fadeIn">
                {selectedExtendedItem.flashcards.length > 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                    <p className="text-xs text-nexus-muted mb-2 font-semibold uppercase tracking-wider">
                      Carte {activeFlashcardIndex + 1} sur {selectedExtendedItem.flashcards.length} • Cliquez pour révéler
                    </p>
                    <div
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className="p-8 rounded-2xl bg-nexus-card border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-all shadow-xl min-h-[160px] flex flex-col items-center justify-center"
                    >
                      <p className="text-xs text-amber-400 font-bold mb-2">
                        {isFlashcardFlipped ? '💡 RÉPONSE :' : '❓ QUESTION :'}
                      </p>
                      <p className="font-display text-sm sm:text-base font-bold text-white max-w-md">
                        {isFlashcardFlipped
                          ? selectedExtendedItem.flashcards[activeFlashcardIndex]?.back
                          : selectedExtendedItem.flashcards[activeFlashcardIndex]?.front}
                      </p>
                    </div>

                    {selectedExtendedItem.flashcards.length > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                          onClick={() => {
                            setIsFlashcardFlipped(false);
                            setActiveFlashcardIndex((prev) => (prev > 0 ? prev - 1 : selectedExtendedItem.flashcards.length - 1));
                          }}
                          className="px-3 py-1.5 rounded-xl glass text-xs text-nexus-muted hover:text-white"
                        >
                          ← Précédente
                        </button>
                        <button
                          onClick={() => {
                            setIsFlashcardFlipped(false);
                            setActiveFlashcardIndex((prev) => (prev + 1 < selectedExtendedItem.flashcards.length ? prev + 1 : 0));
                          }}
                          className="px-3 py-1.5 rounded-xl glass text-xs text-nexus-muted hover:text-white"
                        >
                          Suivante →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-nexus-muted">Aucune carte mémoire pour ce sujet.</p>
                )}
              </div>
            )}

            {/* Bouton CTA pour interagir avec Nexus AI sur ce sujet */}
            <div className="mt-8 pt-6 border-t border-nexus-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-nexus-muted">
                <Sparkles className="w-4 h-4 text-nexus-glow" />
                <span>Une question sur ce sujet ? Posez-la directement au tuteur.</span>
              </div>
              <button
                onClick={() => navigate({ type: 'ai' })}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Approfondir avec Nexus AI</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VUE 2 : GRILLE PRINCIPALE DES 50+ SUJETS ET PERSONNALITÉS */
        <div>
          {/* En-tête de la Bibliothèque */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              50+ Sujets Fondamentaux & Personnalités Légendaires
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black mb-3">
              Bibliothèque du <span className="text-gradient">Savoir Universel</span>
            </h1>
            <p className="text-nexus-muted text-sm sm:text-base max-w-2xl font-light">
              Explorez les grands tournants de l'histoire, les mécanismes financiers, les avancées scientifiques, les lois de la psychologie et la pensée des géants.
            </p>
          </div>

          {/* Barre de Recherche Instantanée */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-nexus-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher parmi les 50 sujets (ex: Einstein, Guerre froide, Bitcoin, Stoïcisme, Elon Musk...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-strong border border-nexus-border/60 text-sm text-white placeholder-nexus-muted focus:outline-none focus:border-nexus-accent shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-nexus-muted hover:text-white px-2 py-1"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Filtres de Domaines (Pill Buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scroll-smooth-x">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomain === 'all'
                  ? 'bg-nexus-accent text-white shadow-lg shadow-indigo-500/20 ring-1 ring-nexus-glow'
                  : 'glass text-nexus-muted hover:text-white'
              }`}
            >
              🌐 Tous les Sujets ({extendedKnowledgeItems.length})
            </button>
            {extendedDomains.map((domain) => {
              const isSelected = selectedDomain === domain.id;
              const count = extendedKnowledgeItems.filter((i) => i.domainId === domain.id).length;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-nexus-accent text-white shadow-lg shadow-indigo-500/20 ring-1 ring-nexus-glow'
                      : 'glass text-nexus-muted hover:text-white'
                  }`}
                >
                  <span>{domain.icon}</span>
                  <span>{domain.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grille des Cartes */}
          {filteredExtendedItems.length === 0 ? (
            <div className="py-16 text-center glass rounded-3xl border border-nexus-border/40 p-8 max-w-md mx-auto">
              <Search className="w-10 h-10 text-nexus-muted mx-auto mb-3" />
              <p className="text-white font-bold text-sm mb-1">Aucun sujet ne correspond à votre recherche</p>
              <p className="text-xs text-nexus-muted">
                Essayez un autre mot-clé ou réinitialisez le filtre de domaine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredExtendedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedExtendedItem(item)}
                  className="p-5 sm:p-6 rounded-3xl glass border border-nexus-border/50 hover:border-nexus-accent/50 card-hover cursor-pointer group flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
                >
                  <div>
                    {/* Header de la Carte */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-nexus-accent/15 border border-nexus-accent/30 text-nexus-glow font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-white group-hover:text-nexus-glow transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-nexus-muted leading-relaxed line-clamp-3 mb-4 font-light">
                      {item.summary}
                    </p>
                  </div>

                  {/* Pied de Carte */}
                  <div className="pt-3 border-t border-nexus-border/30 flex items-center justify-between text-xs text-nexus-accent">
                    <span className="text-nexus-muted flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> {item.readTimeMinutes} min
                    </span>
                    <span className="font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Lire l'article</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(KnowledgeExplorer);
