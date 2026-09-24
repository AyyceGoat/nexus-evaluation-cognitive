import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { countries, continents } from '../data/countries';

/**
 * Nombre de pays rendus d'emblee, puis ajoutes a chaque extension.
 *
 * ── Pourquoi ne pas tout rendre ──
 *
 * Mesure du passage d'un onglet a l'autre (`npm run verifie:navigation`),
 * telephone a 390 px, 4G bridee, processeur x4 :
 *
 *   retour sur l'onglet Pays : 531 ms, jusqu'a 587
 *
 * Le module est en cache : ce temps est entierement passe a mettre en page et
 * peindre 195 cartes, dont trois ou quatre tiennent a l'ecran.
 *
 * ── Pourquoi pas `content-visibility: auto` ──
 *
 * Essaye et mesure. La propriete ameliore bien le remontage (531 -> 353 ms),
 * mais elle degrade le PREMIER affichage : 461 -> 916 ms, de maniere
 * reproductible sur trois passes. Mettre 195 elements sous observation de
 * visibilite a un cout d'installation, paye au premier rendu, qui depasse ici
 * ce qu'il fait economiser. Elle reste employee sur la grille du Savoir, ou
 * cinquante cartes rendent l'arbitrage inverse (315 -> 146 ms sans penalite).
 *
 * Le rendu progressif, lui, supprime le travail au lieu de le differer : les
 * cartes qui ne sont pas rendues ne coutent rien du tout.
 */
const PAR_PAGE = 48;

function CountriesExplorer() {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [limite, setLimite] = useState(PAR_PAGE);
  const sentinelle = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return countries.filter(c => {
      const matchSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.capital.toLowerCase().includes(search.toLowerCase());
      const matchContinent = !selectedContinent || c.continent === selectedContinent;
      return matchSearch && matchContinent;
    });
  }, [search, selectedContinent]);

  // Un changement de filtre repart du debut : garder une limite haute ferait
  // rendre 195 cartes des qu'on a fait defiler une fois.
  useEffect(() => setLimite(PAR_PAGE), [search, selectedContinent]);

  const visibles = useMemo(() => filtered.slice(0, limite), [filtered, limite]);
  const reste = filtered.length - visibles.length;

  /**
   * Extension automatique quand la sentinelle approche de l'ecran.
   *
   * Le bouton « afficher les suivants » reste present et fonctionnel : c'est
   * lui qui sert au clavier, et il prend le relais si l'observateur n'est pas
   * disponible. L'observateur ne fait que l'actionner a l'avance.
   */
  useEffect(() => {
    const cible = sentinelle.current;
    if (!cible || reste <= 0 || typeof IntersectionObserver === 'undefined') return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) setLimite((n) => n + PAR_PAGE);
      },
      // Declenche avant d'arriver au bas de la liste, pour que l'ajout soit
      // deja fait quand on y parvient.
      { rootMargin: '600px 0px' }
    );
    observateur.observe(cible);
    return () => observateur.disconnect();
  }, [reste]);

  const country = selectedCountry ? countries.find(c => c.name === selectedCountry) : null;

  if (country) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => setSelectedCountry(null)}
          className="flex items-center gap-2 text-brume hover:text-craie text-sm mb-6 sm:mb-8 transition-colors"
        >
          ← Retour aux pays
        </button>

        <div className="bg-graphite border border-ardoise rounded-2 overflow-hidden">
          {/* Header with flag */}
          <div className="relative p-6 sm:p-8 md:p-10 bg-mesure">
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
              <img
                src={`https://flagcdn.com/w320/${country.flagCode}.png`}
                alt={`Drapeau ${country.name}`}
                className="w-24 sm:w-32 h-auto rounded-1 object-cover border border-ardoise"
                loading="eager"
              />
              <div className="flex-1">
                <h1 className="font-titre text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{country.name}</h1>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-full bg-mesure/20 text-mesure text-xs font-medium">{country.continent}</span>
                  <span className="px-3 py-1 rounded-full bg-ardoise/50 text-brume text-xs">{country.area}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {[
                { label: 'Capitale', value: country.capital, icon: '🏛️' },
                { label: 'Population', value: country.population, icon: '👥' },
                { label: 'Langue(s)', value: country.language, icon: '🗣️' },
                { label: 'Monnaie', value: country.currency, icon: '💰' },
                { label: 'Dirigeant', value: country.leader, icon: '👤' },
                { label: 'Continent', value: country.continent, icon: '🌍' },
              ].map((info) => (
                <div key={info.label} className="p-3 sm:p-4 rounded-1 bg-ardoise/40 border border-ardoise/20">
                  <div className="text-lg mb-1">{info.icon}</div>
                  <p className="text-micro sm:text-xs text-brume uppercase tracking-wider">{info.label}</p>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5 break-words">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-titre text-lg font-semibold mb-3 text-craie">À propos</h2>
              <p className="text-sm sm:text-base text-brume leading-relaxed">{country.description}</p>
            </div>

            {/* Facts */}
            <div>
              <h2 className="font-titre text-lg font-semibold mb-3 text-craie">Faits fascinants</h2>
              <div className="space-y-2">
                {country.facts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-1 bg-ardoise/40">
                    <span className="text-mesure mt-0.5">◆</span>
                    <p className="text-sm text-texte">{fact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <h1 className="font-titre text-2xl sm:text-4xl font-bold mb-2">
          Les 195 pays du monde
        </h1>
        <p className="text-texte text-sm sm:text-base">195 pays avec drapeaux, cultures et faits fascinants</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brume">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un pays ou une capitale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-1 bg-graphite border border-ardoise bg-transparent text-sm focus:border-mesure/50 placeholder-brume transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedContinent(null)}
            className={`px-3 sm:px-4 py-2 rounded-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedContinent ? 'bg-mesure/20 text-mesure' : 'bg-graphite border border-ardoise text-brume hover:text-craie'
            }`}
          >
            Tous
          </button>
          {continents.map(c => (
            <button
              key={c}
              onClick={() => setSelectedContinent(c)}
              className={`px-3 sm:px-4 py-2 rounded-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedContinent === c ? 'bg-mesure/20 text-mesure' : 'bg-graphite border border-ardoise text-brume hover:text-craie'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Count & View Toggle */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <p className="text-micro text-brume">
          {filtered.length} pays trouvé{filtered.length > 1 ? 's' : ''}
          {reste > 0 && <> — {visibles.length} affichés</>}
        </p>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {visibles.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedCountry(c.name)}
            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-1 border border-ardoise/20 hover:border-mesure/30 hover:bg-ardoise/40 transition-colors text-left"
          >
            <img
              src={`https://flagcdn.com/w80/${c.flagCode}.png`}
              alt={`Drapeau ${c.name}`}
              className="w-12 sm:w-14 h-8 sm:h-9 rounded object-cover border border-ardoise shrink-0"
              width={80}
              height={53}
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold group-hover:text-mesure transition-colors truncate">{c.name}</h2>
              <p className="text-xs text-brume truncate">{c.capital} • {c.continent}</p>
            </div>
          </button>
        ))}
      </div>

      {reste > 0 && (
        <div ref={sentinelle} className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setLimite((n) => n + PAR_PAGE)}
            className="min-h-11 rounded-1 border border-ardoise bg-graphite px-5 text-petit text-texte transition-colors hover:text-craie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesure"
          >
            Afficher {Math.min(PAR_PAGE, reste)} pays de plus
            <span className="sr-only"> (il en reste {reste})</span>
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brume text-lg mb-2">Aucun pays trouvé</p>
          <p className="text-texte text-sm">Essayez un autre terme de recherche</p>
        </div>
      )}
    </div>
  );
}

export default memo(CountriesExplorer);
