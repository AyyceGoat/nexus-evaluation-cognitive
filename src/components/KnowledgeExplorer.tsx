import { useState, useMemo, useEffect, memo } from 'react';
import {
  extendedDomains,
  extendedKnowledgeItems,
  type ExtendedKnowledgeItem,
} from '../data/knowledgeExtended';
import {
  articleEnMemoire,
  chargerArticle,
  prechargerDomaine,
  type SectionArticle,
} from '../data/savoir';
import { LecteurNarration } from './savoir/LecteurNarration';
import type { SegmentAudio } from '../lib/narration/stockage';
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

/**
 * Bibliothèque du savoir : grille des sujets, puis lecture d'un sujet.
 *
 * ── Les deux niveaux ──
 *
 * Chaque sujet a un résumé et un article. Le résumé sert à décider si on lit :
 * il figure sur la carte, puis en tête de la page du sujet. L'article est le
 * produit : il est découpé en sections titrées dont l'écran tire un sommaire,
 * pour qu'on puisse le parcourir avant de s'y engager.
 *
 * Auparavant, l'onglet intitulé « Article complet » affichait un champ de
 * quelques centaines de signes, rendu d'un bloc. C'était un second résumé.
 *
 * ── Pourquoi l'article se charge séparément ──
 *
 * Les cinquante articles pèsent environ 270 000 signes. Les embarquer dans ce
 * module ferait tout télécharger à qui ouvre la grille. Ils sont donc groupés
 * par domaine et chargés à la demande, avec deux conséquences visibles :
 *
 *   - `articleEnMemoire` est consulté d'abord. Quand le domaine a déjà été
 *     chargé, l'article s'affiche sans état d'attente — c'est le cas pour tous
 *     les sujets d'un même domaine après le premier, et pour tout retour en
 *     arrière ;
 *   - survoler ou atteindre une carte au clavier déclenche `prechargerDomaine`.
 *     Le module part pendant qu'on lit le résumé, si bien que le clic trouve
 *     généralement la donnée déjà là.
 */
function KnowledgeExplorer({ initialDomainId }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string>(() =>
    initialDomainId && extendedDomains.some((d) => d.id === initialDomainId)
      ? initialDomainId
      : 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sujetOuvert, setSujetOuvert] = useState<ExtendedKnowledgeItem | null>(null);

  const filteredExtendedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return extendedKnowledgeItems.filter((item) => {
      const matchesDomain = selectedDomain === 'all' || item.domainId === selectedDomain;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keyConcepts.some((c) => c.term.toLowerCase().includes(q));
      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, searchQuery]);

  if (sujetOuvert) {
    return <VueSujet sujet={sujetOuvert} onRetour={() => setSujetOuvert(null)} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-craie sm:px-6 sm:py-12">
      {/* En-tête de la bibliothèque */}
      <div className="mb-8 sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-mesure/30 bg-mesure/15 px-3 py-1 text-micro font-semibold text-mesure">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {extendedKnowledgeItems.length} sujets, un article développé chacun
        </div>
        <h1 className="mb-3 font-titre text-t1 font-black">Bibliothèque du savoir</h1>
        <p className="mesure-texte text-corps text-texte">
          Les grands tournants de l’histoire, les mécanismes financiers, les avancées
          scientifiques, les lois de la psychologie et la pensée des géants. Chaque sujet
          se lit en une dizaine de minutes.
        </p>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search
          className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-brume"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Rechercher un sujet"
          placeholder="Einstein, guerre froide, Bitcoin, stoïcisme…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-h-11 w-full rounded-2 border border-ardoise bg-graphite py-3.5 pr-4 pl-12 text-petit text-craie placeholder-brume focus:border-mesure focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute top-1/2 right-2 min-h-11 -translate-y-1/2 px-3 text-micro text-brume hover:text-craie"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Filtres de domaines */}
      <div className="scroll-smooth-x mb-8 flex items-center gap-2 overflow-x-auto pb-3">
        <button
          type="button"
          aria-pressed={selectedDomain === 'all'}
          onClick={() => setSelectedDomain('all')}
          className={`min-h-11 rounded-1 px-4 text-micro font-semibold whitespace-nowrap transition-colors ${
            selectedDomain === 'all'
              ? 'bg-mesure text-noir ring-1 ring-mesure'
              : 'border border-ardoise bg-graphite text-brume hover:text-craie'
          }`}
        >
          Tous les sujets ({extendedKnowledgeItems.length})
        </button>
        {extendedDomains.map((domain) => {
          const isSelected = selectedDomain === domain.id;
          const count = extendedKnowledgeItems.filter((i) => i.domainId === domain.id).length;
          return (
            <button
              key={domain.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedDomain(domain.id)}
              onMouseEnter={() => prechargerDomaine(domain.id)}
              className={`flex min-h-11 items-center gap-1.5 rounded-1 px-4 text-micro font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-mesure text-noir ring-1 ring-mesure'
                  : 'border border-ardoise bg-graphite text-brume hover:text-craie'
              }`}
            >
              <span aria-hidden="true">{domain.icon}</span>
              <span>{domain.name}</span>
              <span className="nombres rounded-full bg-ardoise/50 px-1.5 text-micro">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grille */}
      {filteredExtendedItems.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2 border border-ardoise bg-graphite p-8 py-16 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-brume" aria-hidden="true" />
          <p className="mb-1 text-petit font-bold text-craie">
            Aucun sujet ne correspond à votre recherche
          </p>
          <p className="text-micro text-brume">
            Essayez un autre mot-clé ou réinitialisez le filtre de domaine.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filteredExtendedItems.map((item) => (
            <li key={item.id} className="differe-carte flex">
              {/* Un bouton, et non un `div` cliquable : la carte était
                  inatteignable au clavier et invisible pour un lecteur d'écran. */}
              <button
                type="button"
                onClick={() => setSujetOuvert(item)}
                onMouseEnter={() => prechargerDomaine(item.domainId)}
                onFocus={() => prechargerDomaine(item.domainId)}
                className="group flex w-full flex-col justify-between rounded-2 border border-ardoise bg-graphite p-5 text-left transition-colors duration-300 hover:border-mesure/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure sm:p-6"
              >
                <span className="block">
                  <span className="mb-3 flex items-center justify-between">
                    <span className="text-3xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="rounded-full border border-mesure/30 bg-mesure/15 px-2.5 py-0.5 text-micro font-semibold text-mesure">
                      {item.category}
                    </span>
                  </span>

                  <span className="mb-2 block font-titre text-t3 text-craie transition-colors group-hover:text-mesure">
                    {item.title}
                  </span>

                  <span className="mb-4 block text-petit text-texte">{item.summary}</span>
                </span>

                <span className="flex items-center justify-between border-t border-ardoise/30 pt-3 text-micro">
                  <span className="flex items-center gap-1 text-brume">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {item.readTimeMinutes} min
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-mesure transition-transform group-hover:translate-x-1">
                    Lire l’article
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Lecture d'un sujet ──────────────────────────────────────────────────── */

type Onglet = 'article' | 'concepts' | 'flashcards';

function VueSujet({
  sujet,
  onRetour,
}: {
  sujet: ExtendedKnowledgeItem;
  onRetour: () => void;
}) {
  const [onglet, setOnglet] = useState<Onglet>('article');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-craie sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={onRetour}
        className="group mb-6 flex min-h-11 items-center gap-2 text-micro font-semibold text-brume transition-colors hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
      >
        <ArrowLeft
          className="h-4 w-4 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        Retour à la bibliothèque
      </button>

      <div className="rounded-2 border border-ardoise bg-graphite p-6 sm:p-10">
        {/* Métadonnées */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="text-3xl sm:text-4xl" aria-hidden="true">
            {sujet.icon}
          </span>
          <span className="rounded-full border border-mesure/40 bg-mesure/20 px-3 py-1 text-micro font-semibold text-mesure">
            {sujet.domainName}
          </span>
          <span className="rounded-full border border-ardoise bg-ardoise/50 px-2.5 py-1 text-micro text-brume">
            {sujet.category}
          </span>
          <span className="flex items-center gap-1 text-micro text-brume">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {sujet.readTimeMinutes} min de
            lecture
          </span>
          <span className="text-micro text-brume">Niveau {sujet.level}</span>
        </div>

        <h1 className="mb-5 font-titre text-t1 text-craie">{sujet.title}</h1>

        {/* Niveau 1 : le résumé. Il sert à décider si on lit. */}
        <div className="mb-6 rounded-2 border border-mesure/30 bg-mesure/10 p-4 sm:p-5">
          <p className="mb-1.5 flex items-center gap-1.5 text-micro font-bold text-mesure">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            L’essentiel en une phrase
          </p>
          <p className="text-petit text-craie">{sujet.summary}</p>
        </div>

        {/* Onglets */}
        <div
          role="tablist"
          aria-label="Contenu du sujet"
          className="mb-6 flex flex-wrap items-center gap-2 border-b border-ardoise/40 pb-3"
        >
          <BoutonOnglet
            actif={onglet === 'article'}
            onClick={() => setOnglet('article')}
            icone={<BookOpen className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            Article
          </BoutonOnglet>
          <BoutonOnglet
            actif={onglet === 'concepts'}
            onClick={() => setOnglet('concepts')}
            icone={<Compass className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            Concepts clés ({sujet.keyConcepts.length})
          </BoutonOnglet>
          <BoutonOnglet
            actif={onglet === 'flashcards'}
            onClick={() => setOnglet('flashcards')}
            icone={<Brain className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            Cartes mémoire ({sujet.flashcards.length})
          </BoutonOnglet>
        </div>

        {onglet === 'article' && <Article sujet={sujet} />}

        {onglet === 'concepts' && (
          <dl className="space-y-3">
            {sujet.keyConcepts.map((concept) => (
              <div key={concept.term} className="rounded-2 border border-ardoise bg-ardoise/50 p-4">
                <dt className="mb-1 text-petit font-bold text-mesure">{concept.term}</dt>
                <dd className="text-petit text-texte">{concept.definition}</dd>
              </div>
            ))}
          </dl>
        )}

        {onglet === 'flashcards' && <Flashcards sujet={sujet} />}
      </div>
    </div>
  );
}

function BoutonOnglet({
  actif,
  onClick,
  icone,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-1.5 rounded-1 px-4 text-micro font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure ${
        actif
          ? 'border border-mesure/40 bg-mesure/20 text-mesure'
          : 'text-brume hover:bg-ardoise/50 hover:text-craie'
      }`}
    >
      {icone}
      <span>{children}</span>
    </button>
  );
}

/**
 * Niveau 2 : l'article.
 *
 * Trois états seulement, et le premier est le plus fréquent : l'article est
 * déjà en mémoire, on affiche sans transition. Le squelette n'apparaît que sur
 * le premier sujet ouvert d'un domaine, et seulement si le préchargement au
 * survol n'a pas eu le temps d'aboutir.
 */
function Article({ sujet }: { sujet: ExtendedKnowledgeItem }) {
  const [sections, setSections] = useState<SectionArticle[] | null>(() =>
    articleEnMemoire(sujet.domainId, sujet.id)
  );
  const [echec, setEchec] = useState(false);

  /**
   * Passage en cours de lecture à voix haute, ou `null` à l'arrêt.
   *
   * Le lecteur ne connaît pas la mise en page de l'article : il remonte le
   * segment, et c'est ici qu'on décide comment le montrer. Le surlignage est
   * exact au paragraphe, parce que chaque paragraphe a été synthétisé comme un
   * segment distinct — son décalage dans le fichier n'est donc pas calculé
   * après coup, il est donné par le découpage.
   */
  const [segmentLu, setSegmentLu] = useState<SegmentAudio | null>(null);

  const lu = (type: SegmentAudio['type'], section: number, paragraphe: number) =>
    segmentLu !== null &&
    segmentLu.type === type &&
    segmentLu.section === section &&
    segmentLu.paragraphe === paragraphe;

  useEffect(() => {
    const deja = articleEnMemoire(sujet.domainId, sujet.id);
    if (deja) {
      setSections(deja);
      setEchec(false);
      return;
    }

    let annule = false;
    setSections(null);
    setEchec(false);

    void chargerArticle(sujet.domainId, sujet.id)
      .then((resultat) => {
        if (annule) return;
        if (resultat) setSections(resultat);
        else setEchec(true);
      })
      .catch(() => {
        if (!annule) setEchec(true);
      });

    return () => {
      annule = true;
    };
  }, [sujet.domainId, sujet.id]);

  if (echec) {
    return (
      <p role="alert" className="mesure-texte border-l-2 border-alerte pl-4 text-petit text-texte">
        L’article n’a pas pu être chargé. Vérifiez votre connexion, puis revenez sur ce
        sujet.
      </p>
    );
  }

  if (!sections) {
    return (
      <div role="status" aria-live="polite" className="space-y-3">
        <span className="sr-only">Chargement de l’article</span>
        <div className="squelette h-5 w-2/3 rounded-1" aria-hidden="true" />
        <div className="squelette h-3 w-full rounded-1" aria-hidden="true" />
        <div className="squelette h-3 w-full rounded-1" aria-hidden="true" />
        <div className="squelette h-3 w-4/5 rounded-1" aria-hidden="true" />
      </div>
    );
  }

  const ancre = (index: number) => `${sujet.id}-section-${index + 1}`;

  return (
    <div>
      {/* Écoute de l'article. Placée avant le sommaire : quelqu'un qui n'a pas
          le courage de lire huit cents mots doit trouver le bouton tout de
          suite, pas après avoir fait défiler le plan. */}
      <LecteurNarration sujetId={sujet.id} onSegment={setSegmentLu} />

      {/* Sommaire : c'est ce qui rend l'article parcourable avant d'être lu. */}
      <nav aria-label="Sommaire de l’article" className="mb-8 rounded-2 bg-ardoise/40 p-4 sm:p-5">
        <p className="mb-2 text-micro font-semibold tracking-wide text-brume uppercase">
          Au sommaire
        </p>
        <ol className="flex flex-col gap-1.5">
          {sections.map((section, index) => (
            <li key={section.titre} className="flex gap-2 text-petit">
              <span className="nombres shrink-0 text-brume">{index + 1}.</span>
              <a
                href={`#${ancre(index)}`}
                className="text-texte underline decoration-ardoise underline-offset-2 hover:text-craie hover:decoration-mesure"
              >
                {section.titre}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={section.titre} id={ancre(index)} className="scroll-mt-24">
            <h2
              className={`mb-3 rounded-1 font-titre text-t2 transition-colors ${
                lu('titre', index, -1)
                  ? 'bg-mesure/10 px-3 py-1 text-craie shadow-[inset_2px_0_0_0_var(--color-mesure)]'
                  : 'text-craie'
              }`}
            >
              {section.titre}
            </h2>
            <div className="flex flex-col gap-4">
              {/* Clé par position : la liste est statique, et une clé dérivée du
                  texte casserait si deux paragraphes d'une même section
                  commençaient pareil — ce qu'aucun contrôle ne garantit. */}
              {section.paragraphes.map((paragraphe, rang) => (
                <p
                  key={rang}
                  className={`mesure-texte rounded-1 text-corps transition-colors ${
                    lu('paragraphe', index, rang)
                      ? 'bg-mesure/10 px-3 py-1 text-craie shadow-[inset_2px_0_0_0_var(--color-mesure)]'
                      : 'text-texte'
                  }`}
                >
                  {paragraphe}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Flashcards({ sujet }: { sujet: ExtendedKnowledgeItem }) {
  const [index, setIndex] = useState(0);
  const [retournee, setRetournee] = useState(false);

  if (sujet.flashcards.length === 0) {
    return <p className="text-petit text-brume">Aucune carte mémoire pour ce sujet.</p>;
  }

  const carte = sujet.flashcards[index];
  const total = sujet.flashcards.length;

  function aller(pas: number) {
    setRetournee(false);
    setIndex((n) => (n + pas + total) % total);
  }

  return (
    <div className="rounded-2 border border-mesure/20 bg-mesure/5 p-4 text-center sm:p-6">
      <p className="mb-2 text-micro font-semibold tracking-wide text-brume uppercase">
        Carte {index + 1} sur {total}
      </p>

      <button
        type="button"
        onClick={() => setRetournee((v) => !v)}
        aria-expanded={retournee}
        className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2 border border-mesure/30 bg-graphite p-6 transition-colors hover:border-mesure focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure sm:p-8"
      >
        <span className="mb-2 text-micro font-bold text-mesure">
          {retournee ? 'Réponse' : 'Question — appuyez pour révéler'}
        </span>
        <span className="max-w-md font-titre text-t3 text-craie">
          {retournee ? carte?.back : carte?.front}
        </span>
      </button>

      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => aller(-1)}
            className="min-h-11 rounded-1 border border-ardoise bg-graphite px-4 text-micro text-brume hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            Précédente
          </button>
          <button
            type="button"
            onClick={() => aller(1)}
            className="min-h-11 rounded-1 border border-ardoise bg-graphite px-4 text-micro text-brume hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            Suivante
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(KnowledgeExplorer);
