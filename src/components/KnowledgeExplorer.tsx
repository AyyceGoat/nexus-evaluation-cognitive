import { useState, useMemo, memo } from 'react';
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
} from 'lucide-react';

interface Props {
  /**
   * Domaine présélectionné, issu de l'URL `/savoir/:domaine`.
   *
   * Auparavant la route transmettait ce paramètre et le composant ne le lisait
   * jamais : le filtre restait sur « tous » quel que soit le lien suivi. Le
   * paramètre est désormais honoré, et ignoré s'il ne correspond à aucun domaine.
   */
  initialDomainId?: string;
}

function KnowledgeExplorer({ initialDomainId }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string>(() =>
    initialDomainId && extendedDomains.some((d) => d.id === initialDomainId)
      ? initialDomainId
      : 'all'
  );
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-craie">
      {/* VUE 1 : DÉTAIL D'UN ARTICLE DU SAVOIR */}
      {selectedExtendedItem ? (
        <div className="max-w-4xl mx-auto">
          {/* Bouton Retour */}
          <button
            onClick={() => {
              setSelectedExtendedItem(null);
              setActiveTab('article');
            }}
            className="flex items-center gap-2 text-brume hover:text-craie text-xs font-semibold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Retour à la bibliothèque</span>
          </button>

          <div className="p-6 sm:p-10 rounded-2 bg-graphite border border-ardoise mb-8 relative overflow-hidden">
            {/* Halo de couleur dynamique */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-mesure/15 rounded-full pointer-events-none" />

            {/* Badges & Métadonnées */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="text-3xl sm:text-4xl">{selectedExtendedItem.icon}</span>
              <span className="px-3 py-1 rounded-full bg-mesure/20 border border-mesure/40 text-mesure text-xs font-semibold">
                {selectedExtendedItem.domainName}
              </span>
              <span className="text-xs text-brume px-2.5 py-1 rounded-full bg-ardoise/50 border border-ardoise">
                {selectedExtendedItem.category}
              </span>
              <span className="text-xs text-brume flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedExtendedItem.readTimeMinutes} min de lecture
              </span>
              <span className="text-xs text-brume">
                • Niveau {selectedExtendedItem.level}
              </span>
            </div>

            <h1 className="font-titre text-2xl sm:text-4xl font-extrabold text-craie mb-4 tracking-tight leading-tight">
              {selectedExtendedItem.title}
            </h1>

            {/* Résumé Synthétique */}
            <div className="p-4 sm:p-5 rounded-2 bg-mesure/10 border border-mesure/30 text-xs sm:text-sm text-craie leading-relaxed mb-6">
              <p className="font-bold text-mesure mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-mesure" /> Ce qu'il faut retenir (Synthèse flash) :
              </p>
              {selectedExtendedItem.summary}
            </div>

            {/* Onglets de contenu dans l'article */}
            <div className="flex items-center gap-2 border-b border-ardoise/40 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('article')}
                className={`px-4 py-2 rounded-1 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'article'
                    ? 'bg-mesure/20 text-mesure border border-mesure/40'
                    : 'text-brume hover:text-craie hover:bg-ardoise/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Article Complet</span>
              </button>

              <button
                onClick={() => setActiveTab('concepts')}
                className={`px-4 py-2 rounded-1 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'concepts'
                    ? 'bg-mesure/20 text-mesure border border-mesure/40'
                    : 'text-brume hover:text-craie hover:bg-ardoise/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Concepts Clés ({selectedExtendedItem.keyConcepts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 rounded-1 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'flashcards'
                    ? 'bg-mesure/20 text-mesure border border-mesure/40'
                    : 'text-brume hover:text-craie hover:bg-ardoise/50'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Cartes Mémoire ({selectedExtendedItem.flashcards.length})</span>
              </button>
            </div>

            {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
            {activeTab === 'article' && (
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-craie leading-relaxed whitespace-pre-line">
                {selectedExtendedItem.content}
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="space-y-3">
                {selectedExtendedItem.keyConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 rounded-2 bg-ardoise/50 border border-ardoise">
                    <h4 className="font-bold text-mesure text-sm mb-1">{concept.term}</h4>
                    <p className="text-xs text-brume leading-relaxed">{concept.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="">
                {selectedExtendedItem.flashcards.length > 0 ? (
                  <div className="p-6 rounded-2 bg-mesure/5 border border-mesure/20 text-center">
                    <p className="text-xs text-brume mb-2 font-semibold uppercase tracking-wider">
                      Carte {activeFlashcardIndex + 1} sur {selectedExtendedItem.flashcards.length} • Cliquez pour révéler
                    </p>
                    <div
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className="p-8 rounded-2 bg-graphite border border-mesure/30 cursor-pointer hover:border-mesure transition-colors min-h-[160px] flex flex-col items-center justify-center"
                    >
                      <p className="text-xs text-mesure font-bold mb-2">
                        {isFlashcardFlipped ? '💡 RÉPONSE :' : '❓ QUESTION :'}
                      </p>
                      <p className="font-titre text-sm sm:text-base font-bold text-craie max-w-md">
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
                          className="px-3 py-1.5 rounded-1 bg-graphite border border-ardoise text-xs text-brume hover:text-craie"
                        >
                          ← Précédente
                        </button>
                        <button
                          onClick={() => {
                            setIsFlashcardFlipped(false);
                            setActiveFlashcardIndex((prev) => (prev + 1 < selectedExtendedItem.flashcards.length ? prev + 1 : 0));
                          }}
                          className="px-3 py-1.5 rounded-1 bg-graphite border border-ardoise text-xs text-brume hover:text-craie"
                        >
                          Suivante →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-brume">Aucune carte mémoire pour ce sujet.</p>
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        /* VUE 2 : GRILLE PRINCIPALE DES 50+ SUJETS ET PERSONNALITÉS */
        <div>
          {/* En-tête de la Bibliothèque */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mesure border border-mesure/30 text-mesure text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              50+ Sujets Fondamentaux & Personnalités Légendaires
            </div>
            <h1 className="font-titre text-3xl sm:text-5xl font-black mb-3">
              Bibliothèque du savoir
            </h1>
            <p className="text-brume text-sm sm:text-base max-w-2xl font-light">
              Explorez les grands tournants de l'histoire, les mécanismes financiers, les avancées scientifiques, les lois de la psychologie et la pensée des géants.
            </p>
          </div>

          {/* Barre de Recherche Instantanée */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-brume absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher parmi les 50 sujets (ex: Einstein, Guerre froide, Bitcoin, Stoïcisme, Elon Musk...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2 bg-graphite border border-ardoise text-sm text-craie placeholder-brume focus:border-mesure"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brume hover:text-craie px-2 py-1"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Filtres de Domaines (Pill Buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scroll-smooth-x">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`min-h-11 px-4 rounded-1 text-micro font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === 'all'
                  ? 'bg-mesure text-noir ring-1 ring-mesure'
                  : 'bg-graphite border border-ardoise text-brume hover:text-craie'
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
                  className={`min-h-11 px-4 rounded-1 text-micro font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-mesure text-noir ring-1 ring-mesure'
                      : 'bg-graphite border border-ardoise text-brume hover:text-craie'
                  }`}
                >
                  <span>{domain.icon}</span>
                  <span>{domain.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-ardoise/50 nombres">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grille des Cartes */}
          {filteredExtendedItems.length === 0 ? (
            <div className="py-16 text-center bg-graphite border border-ardoise rounded-2 border border-ardoise/40 p-8 max-w-md mx-auto">
              <Search className="w-10 h-10 text-brume mx-auto mb-3" />
              <p className="text-craie font-bold text-sm mb-1">Aucun sujet ne correspond à votre recherche</p>
              <p className="text-xs text-brume">
                Essayez un autre mot-clé ou réinitialisez le filtre de domaine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredExtendedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedExtendedItem(item)}
                  className="p-5 sm:p-6 rounded-2 bg-graphite border border-ardoise hover:border-mesure/50 cursor-pointer group flex flex-col justify-between transition-colors duration-300 relative overflow-hidden"
                >
                  <div>
                    {/* Header de la Carte */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-mesure/15 border border-mesure/30 text-mesure font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-titre font-bold text-base text-craie group-hover:text-mesure transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-brume leading-relaxed line-clamp-3 mb-4 font-light">
                      {item.summary}
                    </p>
                  </div>

                  {/* Pied de Carte */}
                  <div className="pt-3 border-t border-ardoise/30 flex items-center justify-between text-xs text-mesure">
                    <span className="text-brume flex items-center gap-1 text-[11px]">
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
