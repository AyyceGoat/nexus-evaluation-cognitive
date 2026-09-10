import { useState, useMemo, memo } from 'react';
import { countries, continents } from '../data/countries';

function CountriesExplorer() {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return countries.filter(c => {
      const matchSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.capital.toLowerCase().includes(search.toLowerCase());
      const matchContinent = !selectedContinent || c.continent === selectedContinent;
      return matchSearch && matchContinent;
    });
  }, [search, selectedContinent]);

  const country = selectedCountry ? countries.find(c => c.name === selectedCountry) : null;

  if (country) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeIn">
        <button
          onClick={() => setSelectedCountry(null)}
          className="flex items-center gap-2 text-nexus-muted hover:text-nexus-text text-sm mb-6 sm:mb-8 transition-colors"
        >
          ← Retour aux pays
        </button>

        <div className="glass rounded-2xl overflow-hidden">
          {/* Header with flag */}
          <div className="relative p-6 sm:p-8 md:p-10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
              <img
                src={`https://flagcdn.com/w320/${country.flagCode}.png`}
                alt={`Drapeau ${country.name}`}
                className="w-24 sm:w-32 h-auto rounded-lg shadow-xl object-cover border border-white/10"
                loading="eager"
              />
              <div className="flex-1">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{country.name}</h1>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-full bg-nexus-accent/20 text-nexus-glow text-xs font-medium">{country.continent}</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-nexus-muted text-xs">{country.area}</span>
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
                <div key={info.label} className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-nexus-border/20">
                  <div className="text-lg mb-1">{info.icon}</div>
                  <p className="text-[10px] sm:text-xs text-nexus-muted uppercase tracking-wider">{info.label}</p>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5 break-words">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-display text-lg font-semibold mb-3 text-gradient">À propos</h3>
              <p className="text-sm sm:text-base text-nexus-muted leading-relaxed">{country.description}</p>
            </div>

            {/* Facts */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3 text-gradient">Faits fascinants</h3>
              <div className="space-y-2">
                {country.facts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                    <span className="text-nexus-accent mt-0.5">◆</span>
                    <p className="text-sm text-nexus-muted">{fact}</p>
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
        <h1 className="font-display text-2xl sm:text-4xl font-bold mb-2">
          Pays du <span className="text-gradient">Monde</span>
        </h1>
        <p className="text-nexus-muted text-sm sm:text-base">195 pays avec drapeaux, cultures et faits fascinants</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-muted">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un pays ou une capitale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl glass border border-nexus-border/30 bg-transparent text-sm focus:outline-none focus:border-nexus-accent/50 placeholder-nexus-muted/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedContinent(null)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              !selectedContinent ? 'bg-nexus-accent/20 text-nexus-glow' : 'glass text-nexus-muted hover:text-nexus-text'
            }`}
          >
            Tous
          </button>
          {continents.map(c => (
            <button
              key={c}
              onClick={() => setSelectedContinent(c)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedContinent === c ? 'bg-nexus-accent/20 text-nexus-glow' : 'glass text-nexus-muted hover:text-nexus-text'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Count & View Toggle */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <p className="text-xs text-nexus-muted">
          {filtered.length} pays trouvé{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedCountry(c.name)}
            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-nexus-border/20 hover:border-nexus-accent/30 hover:bg-white/[0.03] transition-all text-left card-hover"
          >
            <img
              src={`https://flagcdn.com/w80/${c.flagCode}.png`}
              alt={`Drapeau ${c.name}`}
              className="w-12 sm:w-14 h-8 sm:h-9 rounded object-cover shadow-md border border-white/10 shrink-0"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold group-hover:text-nexus-glow transition-colors truncate">{c.name}</h3>
              <p className="text-xs text-nexus-muted truncate">{c.capital} • {c.continent}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-nexus-muted text-lg mb-2">Aucun pays trouvé</p>
          <p className="text-nexus-muted/60 text-sm">Essayez un autre terme de recherche</p>
        </div>
      )}
    </div>
  );
}

export default memo(CountriesExplorer);
