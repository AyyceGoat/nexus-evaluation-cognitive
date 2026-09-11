import { memo } from 'react';
import { quizCategories, quizModes } from '../data/quiz';
import { useQuizGame, QuizMode, Difficulty } from '../hooks/useQuizGame';

function QuizSection() {
  const game = useQuizGame();

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (game.gameState === 'config') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-4xl sm:text-5xl mb-4 block">🧠</span>
          <h1 className="font-titre text-2xl sm:text-4xl font-bold mb-2">
            Quiz de culture générale
          </h1>
          <p className="text-brume text-sm sm:text-base max-w-lg mx-auto">
            100+ questions • 9 domaines • 6 modes de jeu
          </p>
        </div>

        {/* Message d'erreur élégant (remplace alert) */}
        {game.errorMessage && (
          <div className="mb-6 p-4 rounded-1 bg-alerte/10 border border-alerte/30 text-alerte text-sm text-center flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{game.errorMessage}</span>
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-titre text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
            Mode de jeu
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {quizModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => game.setSelectedMode(mode.id as QuizMode)}
                className={`p-3 sm:p-4 rounded-1 border text-left transition-colors active:scale-[0.98] ${
                  game.selectedMode === mode.id
                    ? 'border-mesure bg-mesure/10'
                    : 'border-ardoise/30 hover:border-mesure/30 hover:bg-ardoise/40'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1 block">{mode.icon}</span>
                <p className="font-semibold text-xs sm:text-sm">{mode.name}</p>
                <p className="text-[10px] sm:text-xs text-brume mt-0.5 line-clamp-2">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-titre text-sm sm:text-base font-semibold flex items-center gap-2">
              Domaines
            </h2>
            <div className="flex gap-2">
              <button
                onClick={game.selectAllCategories}
                className="min-h-11 px-3 rounded-1 bg-mesure/10 text-micro text-mesure hover:bg-mesure/20 transition-colors"
              >
                Tous
              </button>
              <button
                onClick={game.clearCategories}
                className="text-xs px-3 py-1.5 rounded-1 bg-ardoise/50 text-brume hover:bg-ardoise/50 transition-colors active:scale-95"
              >
                Aucun
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {quizCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => game.toggleCategory(cat.id)}
                className={`p-2.5 sm:p-3 rounded-1 border text-center transition-colors active:scale-95 ${
                  game.selectedCategories.includes(cat.id)
                    ? 'border-mesure bg-mesure/10'
                    : 'border-ardoise/30 hover:border-mesure/30'
                }`}
              >
                <span className="text-lg sm:text-2xl block mb-0.5">{cat.icon}</span>
                <p className="text-[10px] sm:text-xs font-medium truncate">{cat.name}</p>
              </button>
            ))}
          </div>
          {game.selectedCategories.length === 0 && (
            <p className="text-xs text-brume mt-2 text-center">
              Aucune sélection = tous les domaines
            </p>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
          {/* Difficulty */}
          <div className="bg-graphite border border-ardoise rounded-1 p-4">
            <p className="text-xs text-brume mb-2">Difficulté</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'easy', label: 'Facile' },
                { id: 'medium', label: 'Moyen' },
                { id: 'hard', label: 'Difficile' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => game.setSelectedDifficulty(d.id as Difficulty)}
                  className={`min-h-11 px-3 rounded-1 text-micro font-medium transition-colors ${
                    game.selectedDifficulty === d.id
                      ? 'bg-mesure text-noir'
                      : 'bg-ardoise/50 text-brume hover:bg-ardoise/50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-graphite border border-ardoise rounded-1 p-4">
            <p className="text-xs text-brume mb-2">Nombre de questions</p>
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 15, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => game.setQuestionCount(n)}
                  className={`min-h-11 px-3 rounded-1 text-micro font-medium transition-colors ${
                    game.questionCount === n
                      ? 'bg-mesure text-noir'
                      : 'bg-ardoise/50 text-brume hover:bg-ardoise/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Time (for timed modes) */}
          {['timed', 'rapid'].includes(game.selectedMode) && (
            <div className="bg-graphite border border-ardoise rounded-1 p-4">
              <p className="text-xs text-brume mb-2">Temps par question</p>
              <div className="flex flex-wrap gap-1.5">
                {[15, 20, 30, 45].map((t) => (
                  <button
                    key={t}
                    onClick={() => game.setTimePerQuestion(t)}
                    className={`min-h-11 px-3 rounded-1 text-micro font-medium transition-colors ${
                      game.timePerQuestion === t
                        ? 'bg-mesure text-noir'
                        : 'bg-ardoise/50 text-brume hover:bg-ardoise/50'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passage automatique à la question suivante */}
          <div className="bg-graphite border border-ardoise rounded-1 p-4">
            <p className="text-xs text-brume mb-2">Passage auto</p>
            <div className="flex items-center gap-3">
              {/* `role="switch"` et `aria-checked` : sans eux, un lecteur d'écran
                  annonce « bouton » sans dire s'il est activé. La zone tactile fait
                  44 px de haut même si le rail n'en fait que 24. */}
              <button
                type="button"
                role="switch"
                aria-checked={game.autoAdvance}
                aria-label="Passer automatiquement à la question suivante"
                onClick={() => game.setAutoAdvance(!game.autoAdvance)}
                className="flex min-h-11 items-center rounded-1 px-1"
              >
                <span
                  className={`relative block h-6 w-11 rounded-full transition-colors ${
                    game.autoAdvance ? 'bg-mesure' : 'bg-ardoise'
                  }`}
                >
                  <span
                    className={`absolute top-1 block h-4 w-4 rounded-full bg-craie transition-transform ${
                      game.autoAdvance ? 'left-6' : 'left-1'
                    }`}
                  />
                </span>
              </button>
              {game.autoAdvance && (
                <select
                  value={game.autoAdvanceDelay}
                  onChange={(e) => game.setAutoAdvanceDelay(Number(e.target.value))}
                  aria-label="Délai avant la question suivante"
                  className="min-h-11 bg-graphite text-craie border border-ardoise rounded-1 px-2 text-micro cursor-pointer"
                >
                  <option value={1} className="bg-graphite text-craie">1s</option>
                  <option value={1.5} className="bg-graphite text-craie">1.5s</option>
                  <option value={2} className="bg-graphite text-craie">2s</option>
                  <option value={3} className="bg-graphite text-craie">3s</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={game.startQuiz}
            className="px-8 py-3.5 rounded-1 bg-mesure text-noir font-semibold hover: hover:scale-[1.02] active:scale-[0.98] transition-colors duration-200"
          >
            Lancer le Quiz →
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ═══════════════════════════════════════════════════════════════════
  if (game.gameState === 'result') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 rounded-full bg-mesure border-2 border-mesure/30 flex items-center justify-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-craie">
                {game.selectedMode === 'rapid' || game.selectedMode === 'challenge' ? game.score : game.percentage + '%'}
              </p>
              {game.selectedMode !== 'rapid' && game.selectedMode !== 'challenge' && (
                <p className="text-xs text-brume">{game.score}/{game.questions.length}</p>
              )}
            </div>
          </div>

          <h2 className="font-titre text-2xl sm:text-3xl font-bold mb-3">
            {game.gameOver ? '💀 Game Over !' :
             game.percentage >= 80 ? '🏆 Exceptionnel !' : 
             game.percentage >= 60 ? '🌟 Très bien !' : 
             game.percentage >= 40 ? '📚 Continuez !' : 
             '🚀 Le début du voyage !'}
          </h2>

          <p className="text-brume text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            {game.appraisal}
          </p>

          {/* Stats Grid */}
          <div className="bg-graphite border border-ardoise rounded-2 p-5 sm:p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-sm font-semibold mb-4 text-craie">Statistiques</h3>
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 rounded-1 bg-ardoise/40">
                <p className="text-brume mb-1">Questions</p>
                <p className="font-bold text-lg">{game.currentIndex + 1}/{game.questions.length}</p>
              </div>
              <div className="p-3 rounded-1 bg-ardoise/40">
                <p className="text-brume mb-1">Score</p>
                <p className="font-bold text-lg text-mesure">{game.score}</p>
              </div>
              {game.maxCombo > 1 && (
                <div className="p-3 rounded-1 bg-ardoise/40">
                  <p className="text-brume mb-1">Combo max</p>
                  <p className="font-bold text-lg text-mesure">x{game.maxCombo}</p>
                </div>
              )}
              <div className="p-3 rounded-1 bg-ardoise/40">
                <p className="text-brume mb-1">Temps total</p>
                <p className="font-bold text-lg">{Math.floor(game.totalTime / 60)}:{(game.totalTime % 60).toString().padStart(2, '0')}</p>
              </div>
              <div className="p-3 rounded-1 bg-ardoise/40">
                <p className="text-brume mb-1">Mode</p>
                <p className="font-bold text-sm">{quizModes.find(m => m.id === game.selectedMode)?.name}</p>
              </div>
              <div className="p-3 rounded-1 bg-ardoise/40">
                <p className="text-brume mb-1">Niveau</p>
                <p className="font-bold text-sm">
                  {game.percentage >= 80 ? '🏆 Expert' : 
                   game.percentage >= 60 ? '🌟 Avancé' : 
                   game.percentage >= 40 ? '📖 Intermédiaire' : 
                   '🌱 Débutant'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={game.startQuiz}
              className="px-6 py-3 rounded-1 bg-mesure text-noir font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-colors"
            >
              🔄 Rejouer
            </button>
            <button
              onClick={game.restartQuiz}
              className="px-6 py-3 rounded-1 bg-graphite border border-ardoise text-craie font-semibold text-sm hover:bg-ardoise/50 active:scale-[0.98] transition-colors"
            >
              ⚙️ Nouvelle config
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // PLAYING SCREEN
  // ═══════════════════════════════════════════════════════════════════
  const question = game.questions[game.currentIndex];
  const modeInfo = quizModes.find(m => m.id === game.selectedMode);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header with progress and stats */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-lg">{modeInfo?.icon}</span>
            <span className="text-xs sm:text-sm text-brume truncate">
              Question {game.currentIndex + 1}/{game.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Timer for timed modes */}
            {['timed', 'rapid'].includes(game.selectedMode) && !game.answered && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-1 ${
                game.timeLeft <= 5 ? 'bg-alerte/20 text-alerte' : 'bg-ardoise/50 text-brume'
              }`}>
                <span className="text-xs">⏱️</span>
                <span className="text-sm font-bold nombres">{game.timeLeft}s</span>
              </div>
            )}
            {/* Lives for survival mode */}
            {game.selectedMode === 'survival' && (
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < game.lives ? '' : 'opacity-30'}`}>
                    {i < game.lives ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            )}
            {/* Combo */}
            {game.combo > 1 && (
              <div className="px-2 py-1 rounded-1 bg-mesure/20 text-mesure">
                <span className="text-sm font-bold">🔥x{game.combo}</span>
              </div>
            )}
            {/* Score */}
            <div className="px-2.5 py-1 rounded-1 bg-mesure/20 text-mesure">
              <span className="text-sm font-bold">{game.score}</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-ardoise/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-mesure rounded-full transition-colors duration-300"
            style={{ width: `${((game.currentIndex + (game.answered ? 1 : 0)) / game.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="" key={game.currentIndex}>
        <div className="bg-graphite border border-ardoise rounded-2 p-5 sm:p-8 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-mesure/10 text-mesure text-xs font-medium">
              {quizCategories.find(c => c.id === question.category)?.name}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              question.difficulty === 'easy' ? 'bg-mesure/20 text-mesure' :
              question.difficulty === 'medium' ? 'bg-mesure/20 text-mesure' :
              'bg-alerte/20 text-alerte'
            }`}>
              {question.difficulty === 'easy' ? 'Facile' : question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          </div>
          <h2 className="font-titre text-base sm:text-xl md:text-2xl font-semibold leading-snug">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-2 sm:space-y-2.5">
          {question.options.map((opt, i) => {
            let style = 'border-ardoise/30 hover:border-mesure/30 hover:bg-ardoise/40';
            if (game.answered) {
              if (i === question.correct) {
                style = 'border-mesure/50 bg-mesure/10';
              } else if (i === game.selected && i !== question.correct) {
                style = 'border-alerte/50 bg-alerte/10';
              } else {
                style = 'border-ardoise/20 opacity-40';
              }
            }

            return (
              <button
                key={i}
                onClick={() => game.handleAnswer(i)}
                disabled={game.answered}
                className={`w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-1 border transition-colors text-left ${style} ${!game.answered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
              >
                <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-1 flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
                  game.answered && i === question.correct ? 'bg-mesure text-noir' :
                  game.answered && i === game.selected && i !== question.correct ? 'bg-alerte text-noir' :
                  'bg-ardoise/50 text-brume'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm sm:text-base flex-1">{opt}</span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-ardoise/50 text-brume border border-ardoise nombres">
                  {i + 1}
                </span>
                {game.answered && i === question.correct && <span className="text-mesure">✓</span>}
                {game.answered && i === game.selected && i !== question.correct && <span className="text-alerte">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {game.showFeedback && (
          <div className="mt-4">
            {(game.selectedMode === 'learning' || !game.autoAdvance) && (
              <div className="bg-graphite border border-ardoise rounded-1 p-4 mb-4">
                <p className="text-xs sm:text-sm text-brume leading-relaxed">
                  <span className="text-mesure font-semibold">💡 </span>
                  {question.explanation}
                </p>
              </div>
            )}

            {(game.selectedMode === 'learning' || !game.autoAdvance) && !game.gameOver && (
              <button
                onClick={game.nextQuestion}
                className="w-full py-3 sm:py-3.5 rounded-1 bg-mesure text-noir font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-colors"
              >
                {game.currentIndex + 1 >= game.questions.length ? 'Voir les résultats →' : 'Question suivante →'}
              </button>
            )}

            {game.autoAdvance && game.selectedMode !== 'learning' && !game.gameOver && (
              <div className="flex items-center justify-center gap-2 text-xs text-brume">
                <div className="w-4 h-4 border-2 border-mesure/50 border-t-mesure rounded-full animate-spin" />
                <span>Question suivante...</span>
              </div>
            )}

            {game.gameOver && (
              <button
                onClick={game.nextQuestion}
                className="w-full py-3 sm:py-3.5 rounded-1 bg-mesure text-noir font-semibold text-sm active:scale-[0.99] transition-colors"
              >
                💀 Voir les résultats
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(QuizSection);
