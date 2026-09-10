import { memo } from 'react';
import type { Page } from '../App';
import { Brain, BookOpen, Globe2, Zap, ArrowRight } from 'lucide-react';

interface Props {
  navigate: (page: Page) => void;
}

function HomePage({ navigate }: Props) {
  return (
    <div className="relative text-craie">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden py-12">


        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-graphite border border-ardoise text-xs sm:text-sm text-brume mb-6">
              <span className="w-2 h-2 rounded-full bg-mesure" />
              Plateforme d'Intelligence, Savoir & Évaluation Cognitive
            </div>
          </div>

          <h1 className="font-titre text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6">
            L'Intelligence & le <span className="text-craie">Savoir</span>
            <br />
            sans <span className="text-mesure">Frontières</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-brume max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
            Une plateforme tout-en-un pour explorer les civilisations, stimuler votre esprit avec des tests de QI psychométriques et interagir avec notre tuteur d'apprentissage intelligent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={() => navigate({ type: 'iq' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2 bg-mesure text-noir font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-colors flex items-center justify-center gap-2.5"
            >
              <Brain className="w-5 h-5" />
              <span>Évaluer mes aptitudes cognitives</span>
            </button>


            <button
              onClick={() => navigate({ type: 'knowledge' })}
              className="w-full sm:w-auto px-6 py-4 rounded-2 bg-graphite border border-ardoise text-brume hover:text-craie font-medium text-sm hover:bg-ardoise/50 transition-colors"
            >
              📚 Explorer le Savoir
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { num: '5', label: 'Aptitudes évaluées' },
              { num: '120', label: 'Questions en banque' },
              { num: '195', label: 'Pays & Civilisations' },
              { num: '464', label: 'Questions de quiz' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2 bg-graphite border border-ardoise text-center">
                <p className="text-xl sm:text-2xl font-bold text-craie">{stat.num}</p>
                <p className="text-[11px] sm:text-xs text-brume mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1 : MODULE QI & APTITUDES COGNITIVES */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2 bg-graphite border border-ardoise border border-mesure/30 p-8 sm:p-12 overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mesure/20 text-mesure text-xs font-bold uppercase tracking-wider mb-4 border border-mesure/30">
                <Zap className="w-3.5 h-3.5" /> Évaluation Psychométrique
              </div>
              <h2 className="font-titre text-3xl sm:text-4xl font-extrabold text-craie mb-4">
                Mesurez votre Potentiel Intellectuel avec <span className="text-mesure">Précision</span>
              </h2>
              <p className="text-brume text-sm sm:text-base leading-relaxed mb-6 font-light">
                Un banc de test complet inspiré des matrices progressives de Raven et des protocoles d'agilité cognitive modernes. Rendu 100% vectoriel SVG adapté aux téléphones portables.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Matrices logiques et séries de rotation en SVG',
                  'Séries numériques, analogies verbales, mémoire de travail',
                  'Profil par aptitude, avec sa marge d’erreur affichée',
                  'Attestation de passation imprimable',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-craie">
                    <span className="w-5 h-5 rounded-full bg-mesure/20 text-mesure flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate({ type: 'iq' })}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-1 bg-mesure text-noir font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Commencer l’évaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-brume">
                  Gratuit, sans compte, 25 à 30 minutes.
                </p>
              </div>
            </div>

            {/* Aperçu Visuel Carte QI */}
            <div className="relative p-6 rounded-2 bg-graphite border border-ardoise/60">
              <div className="flex items-center justify-between border-b border-ardoise/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-alerte" />
                  <div className="w-3 h-3 rounded-full bg-mesure" />
                  <div className="w-3 h-3 rounded-full bg-mesure" />
                </div>
                <span className="text-[11px] nombres text-mesure">NEXUS COGNITIVE LABS</span>
              </div>

              <ul className="space-y-2.5 mb-4 text-xs text-brume">
                <li className="p-3 rounded-1 bg-ardoise/50 border border-ardoise">
                  Un indice estimé, <strong className="text-craie">toujours accompagné de son
                  intervalle de confiance</strong> : la marge d’erreur fait partie du résultat.
                </li>
                <li className="p-3 rounded-1 bg-ardoise/50 border border-ardoise">
                  Un profil par aptitude, avec la zone d’incertitude tracée sur le graphique.
                </li>
                <li className="p-3 rounded-1 bg-ardoise/50 border border-ardoise">
                  Un centile dont la population de référence est nommée explicitement.
                </li>
              </ul>

              <p className="p-3 rounded-1 bg-ardoise/40 border border-ardoise/40 text-xs text-brume leading-relaxed">
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
          <h2 className="font-titre text-2xl sm:text-4xl font-bold mb-2">
            Une Plateforme <span className="text-craie">Complète</span>
          </h2>
          <p className="text-brume text-xs sm:text-sm max-w-md mx-auto">
            Chaque module est conçu pour enrichir votre culture, développer votre esprit et stimuler votre réflexion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 : Test QI */}
          <div
            onClick={() => navigate({ type: 'iq' })}
            className="p-6 rounded-2 bg-graphite border border-ardoise border border-mesure/30 hover:border-mesure/60 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-1 bg-mesure/20 text-mesure flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-titre font-bold text-base text-craie group-hover:text-mesure transition-colors mb-2">
                Aptitudes cognitives
              </h3>
              <p className="text-xs text-brume leading-relaxed mb-4">
                Cinq aptitudes, 120 questions en banque, un score assorti de sa marge d’erreur.
              </p>
            </div>
            <span className="text-xs font-semibold text-mesure flex items-center gap-1">
              Passer le test →
            </span>
          </div>


          {/* Card 3 : Bibliothèque Augmentée */}
          <div
            onClick={() => navigate({ type: 'knowledge' })}
            className="p-6 rounded-2 bg-graphite border border-ardoise border border-mesure/30 hover:border-mesure/60 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-1 bg-mesure/20 text-mesure flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-titre font-bold text-base text-craie group-hover:text-mesure transition-colors mb-2">
                Bibliothèque du Savoir
              </h3>
              <p className="text-xs text-brume leading-relaxed mb-4">
                Empires africains, neurosciences, mécanique quantique, philosophie et économie mobile.
              </p>
            </div>
            <span className="text-xs font-semibold text-mesure flex items-center gap-1">
              Explorer les domaines →
            </span>
          </div>

          {/* Card 4 : Pays du Monde & Quiz */}
          <div
            onClick={() => navigate({ type: 'countries' })}
            className="p-6 rounded-2 bg-graphite border border-ardoise border border-mesure/30 hover:border-mesure/60 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-1 bg-mesure/20 text-mesure flex items-center justify-center mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-titre font-bold text-base text-craie group-hover:text-mesure transition-colors mb-2">
                195 Pays & Quiz
              </h3>
              <p className="text-xs text-brume leading-relaxed mb-4">
                Encyclopédie géographique exhaustive, drapeaux, capitales et 6 modes de quiz interactifs.
              </p>
            </div>
            <span className="text-xs font-semibold text-mesure flex items-center gap-1">
              Découvrir les pays →
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default memo(HomePage);
