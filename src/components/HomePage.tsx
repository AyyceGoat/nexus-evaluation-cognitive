import { memo } from 'react';
import type { Page } from '../App';
import { Brain, Sparkles, BookOpen, Globe2, Zap, ArrowRight } from 'lucide-react';

interface Props {
  navigate: (page: Page) => void;
}

const particles = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  w: (i * 7 + 3) % 3 + 1,
  l: (i * 17 + 11) % 100,
  t: (i * 23 + 7) % 100,
  o: ((i * 13 + 5) % 30 + 10) / 100,
  dur: (i * 11 + 7) % 6 + 4,
  del: (i * 7 + 3) % 5,
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: `${p.w}px`,
            height: `${p.w}px`,
            left: `${p.l}%`,
            top: `${p.t}%`,
            background: `rgba(99, 102, 241, ${p.o})`,
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.del}s`,
          }}
        />
      ))}
    </div>
  );
}

function HomePage({ navigate }: Props) {
  return (
    <div className="relative text-nexus-text">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden py-12">
        <ParticleField />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-40 sm:w-72 h-40 sm:h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-nexus-muted mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Plateforme d'Intelligence, Savoir & Évaluation Cognitive
            </div>
          </div>

          <h1 className="animate-slideUp font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6">
            L'Intelligence & le <span className="text-gradient">Savoir</span>
            <br />
            sans <span className="text-gradient-gold">Frontières</span>
          </h1>

          <p className="animate-slideUp stagger-2 text-sm sm:text-lg md:text-xl text-nexus-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
            Une plateforme tout-en-un pour explorer les civilisations, stimuler votre esprit avec des tests de QI psychométriques et interagir avec notre tuteur d'apprentissage intelligent.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slideUp stagger-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={() => navigate({ type: 'iq' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Brain className="w-5 h-5" />
              <span>Évaluer mes aptitudes cognitives</span>
            </button>

            <button
              onClick={() => navigate({ type: 'ai' })}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl glass hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-nexus-accent/40 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-nexus-glow" />
              <span>Nexus AI Tutor</span>
            </button>

            <button
              onClick={() => navigate({ type: 'knowledge' })}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl glass text-nexus-muted hover:text-white font-medium text-sm hover:bg-white/5 transition-all"
            >
              📚 Explorer le Savoir
            </button>
          </div>

          {/* Stats Bar */}
          <div className="animate-slideUp stagger-4 mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { num: '5', label: 'Aptitudes évaluées' },
              { num: '120', label: 'Questions en banque' },
              { num: '195', label: 'Pays & Civilisations' },
              { num: '464', label: 'Questions de quiz' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl glass border border-nexus-border/40 text-center">
                <p className="text-xl sm:text-2xl font-bold text-gradient">{stat.num}</p>
                <p className="text-[11px] sm:text-xs text-nexus-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1 : MODULE QI & APTITUDES COGNITIVES */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl glass-strong border border-amber-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
                <Zap className="w-3.5 h-3.5" /> Évaluation Psychométrique
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Mesurez votre Potentiel Intellectuel avec <span className="text-gradient-gold">Précision</span>
              </h2>
              <p className="text-nexus-muted text-sm sm:text-base leading-relaxed mb-6 font-light">
                Un banc de test complet inspiré des matrices progressives de Raven et des protocoles d'agilité cognitive modernes. Rendu 100% vectoriel SVG adapté aux téléphones portables.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Matrices logiques et séries de rotation en SVG',
                  'Séries numériques, analogies verbales, mémoire de travail',
                  'Profil par aptitude, avec sa marge d’erreur affichée',
                  'Attestation de passation imprimable',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-nexus-text">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate({ type: 'iq' })}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Commencer l’évaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-nexus-muted">
                  Gratuit, sans compte, 25 à 30 minutes.
                </p>
              </div>
            </div>

            {/* Aperçu Visuel Carte QI */}
            <div className="relative p-6 rounded-3xl bg-nexus-card border border-nexus-border/60 shadow-xl">
              <div className="flex items-center justify-between border-b border-nexus-border/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono text-nexus-glow">NEXUS COGNITIVE LABS</span>
              </div>

              <ul className="space-y-2.5 mb-4 text-xs text-nexus-muted">
                <li className="p-3 rounded-xl bg-white/5 border border-white/10">
                  Un indice estimé, <strong className="text-nexus-text">toujours accompagné de son
                  intervalle de confiance</strong> : la marge d’erreur fait partie du résultat.
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/10">
                  Un profil par aptitude, avec la zone d’incertitude tracée sur le graphique.
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/10">
                  Un centile dont la population de référence est nommée explicitement.
                </li>
              </ul>

              <p className="p-3 rounded-xl bg-white/[0.03] border border-nexus-border/40 text-xs text-nexus-muted leading-relaxed">
                Si vos réponses ne se distinguent pas d’un tirage au hasard, aucun score n’est
                affiché. Un chiffre inventé ne vous apprendrait rien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : 4 GRANDS PILIERS DE LA PLATEFORME */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2">
            Une Plateforme <span className="text-gradient">Complète</span>
          </h2>
          <p className="text-nexus-muted text-xs sm:text-sm max-w-md mx-auto">
            Chaque module est conçu pour enrichir votre culture, développer votre esprit et stimuler votre réflexion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 : Test QI */}
          <div
            onClick={() => navigate({ type: 'iq' })}
            className="p-6 rounded-2xl glass border border-amber-500/30 hover:border-amber-500/60 card-hover cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors mb-2">
                Aptitudes cognitives
              </h3>
              <p className="text-xs text-nexus-muted leading-relaxed mb-4">
                Cinq aptitudes, 120 questions en banque, un score assorti de sa marge d’erreur.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              Passer le test →
            </span>
          </div>

          {/* Card 2 : Nexus AI */}
          <div
            onClick={() => navigate({ type: 'ai' })}
            className="p-6 rounded-2xl glass border border-indigo-500/30 hover:border-indigo-500/60 card-hover cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-400 transition-colors mb-2">
                Nexus AI Tutor
              </h3>
              <p className="text-xs text-nexus-muted leading-relaxed mb-4">
                Vulgarisation (ELI5), analyses approfondies et fiches de révision générées à la volée.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              Discuter avec l'IA →
            </span>
          </div>

          {/* Card 3 : Bibliothèque Augmentée */}
          <div
            onClick={() => navigate({ type: 'knowledge' })}
            className="p-6 rounded-2xl glass border border-cyan-500/30 hover:border-cyan-500/60 card-hover cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-cyan-400 transition-colors mb-2">
                Bibliothèque du Savoir
              </h3>
              <p className="text-xs text-nexus-muted leading-relaxed mb-4">
                Empires africains, neurosciences, mécanique quantique, philosophie et économie mobile.
              </p>
            </div>
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              Explorer les domaines →
            </span>
          </div>

          {/* Card 4 : Pays du Monde & Quiz */}
          <div
            onClick={() => navigate({ type: 'countries' })}
            className="p-6 rounded-2xl glass border border-emerald-500/30 hover:border-emerald-500/60 card-hover cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors mb-2">
                195 Pays & Quiz
              </h3>
              <p className="text-xs text-nexus-muted leading-relaxed mb-4">
                Encyclopédie géographique exhaustive, drapeaux, capitales et 6 modes de quiz interactifs.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Découvrir les pays →
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default memo(HomePage);
