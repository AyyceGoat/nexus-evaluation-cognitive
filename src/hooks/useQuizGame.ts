import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { quizQuestions, quizCategories, quizAppraisals } from '../data/quiz';

export type QuizMode = 'classic' | 'timed' | 'rapid' | 'survival' | 'challenge' | 'learning';
export type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
export type GameState = 'config' | 'playing' | 'result';

// Helper pour Google Analytics
const trackQuizEvent = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as unknown as { trackEvent?: (name: string, params: Record<string, unknown>) => void }).trackEvent) {
    (window as unknown as { trackEvent: (name: string, params: Record<string, unknown>) => void }).trackEvent(eventName, params);
  }
};

export function useQuizGame() {
  // Config state
  const [gameState, setGameState] = useState<GameState>('config');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<QuizMode>('classic');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(1.5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Game state
  const [questions, setQuestions] = useState<typeof quizQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Refs
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenQuestions = useRef<Set<number>>(new Set());

  // ═══════════════════════════════════════════════════════════════════
  // CALLBACKS & GAME ACTIONS (Déclarés avant les useEffects)
  // ═══════════════════════════════════════════════════════════════════

  const handleTimeout = useCallback(() => {
    setAnswered(true);
    setSelected(-1);
    setShowFeedback(true);
    setCombo(0);

    if (selectedMode === 'survival') {
      setLives((l) => {
        if (l <= 1) {
          setTimeout(() => setGameOver(true), 1000);
        }
        return l - 1;
      });
    }
  }, [selectedMode]);

  const nextQuestion = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
    }

    if (gameOver || currentIndex + 1 >= questions.length) {
      trackQuizEvent('quiz_complete', {
        mode: selectedMode,
        score,
        total: questions.length,
        percentage: Math.round((score / (questions.length || 1)) * 100),
      });
      setGameState('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setShowFeedback(false);
      setTimeLeft(timePerQuestion);
    }
  }, [gameOver, currentIndex, questions.length, timePerQuestion, selectedMode, score]);

  const handleAnswer = useCallback((optIndex: number) => {
    if (answered || gameOver || !questions[currentIndex]) return;

    setSelected(optIndex);
    setAnswered(true);
    setShowFeedback(true);

    const isCorrect = optIndex === questions[currentIndex].correct;

    if (isCorrect) {
      let points = 1;

      if (selectedMode === 'rapid') {
        points = 1 + Math.floor(timeLeft / 5);
      } else if (selectedMode === 'challenge') {
        const diffMultiplier = { easy: 1, medium: 2, hard: 3 };
        points = diffMultiplier[questions[currentIndex].difficulty];
      }

      setScore((s) => s + points);
      setCombo((c) => {
        const newCombo = c + 1;
        setMaxCombo((m) => Math.max(m, newCombo));
        return newCombo;
      });
    } else {
      setCombo(0);

      if (selectedMode === 'survival') {
        setLives((l) => {
          if (l <= 1) {
            setTimeout(() => setGameOver(true), 1000);
          }
          return l - 1;
        });
      }
    }
  }, [answered, gameOver, questions, currentIndex, selectedMode, timeLeft]);

  const toggleCategory = useCallback((catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
    setErrorMessage(null);
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategories(quizCategories.map((c) => c.id));
    setErrorMessage(null);
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
    setErrorMessage(null);
  }, []);

  const startQuiz = useCallback(() => {
    setErrorMessage(null);
    const cats = selectedCategories.length > 0 ? selectedCategories : quizCategories.map((c) => c.id);

    let filtered = quizQuestions.filter((q) => cats.includes(q.category));

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    if (filtered.length === 0) {
      setErrorMessage('Aucune question disponible avec ces critères. Veuillez modifier vos sélections.');
      return;
    }

    const unseenQuestions = filtered.filter((_, i) => !seenQuestions.current.has(i));
    const questionsPool = unseenQuestions.length >= questionCount ? unseenQuestions : filtered;

    let finalQuestions: typeof quizQuestions;
    if (selectedMode === 'challenge') {
      const diffOrder = { easy: 0, medium: 1, hard: 2 };
      finalQuestions = [...questionsPool].sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
    } else {
      finalQuestions = [...questionsPool];
      for (let i = finalQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
      }
    }

    const count = Math.min(questionCount, finalQuestions.length);
    const selectedQuestions = finalQuestions.slice(0, count);

    selectedQuestions.forEach((q) => {
      const idx = quizQuestions.indexOf(q);
      seenQuestions.current.add(idx);
    });

    if (seenQuestions.current.size > 100) {
      const arr = Array.from(seenQuestions.current);
      seenQuestions.current = new Set(arr.slice(-50));
    }

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setShowFeedback(false);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(timePerQuestion);
    setTotalTime(0);
    setLives(selectedMode === 'survival' ? 1 : 3);
    setGameOver(false);
    setGameState('playing');

    trackQuizEvent('quiz_start', {
      mode: selectedMode,
      categories: cats.join(','),
      difficulty: selectedDifficulty,
      question_count: count,
    });
  }, [selectedCategories, selectedDifficulty, selectedMode, questionCount, timePerQuestion]);

  const restartQuiz = useCallback(() => {
    setGameState('config');
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // USE EFFECTS (Tous les hooks dépendants sont initialisés au-dessus)
  // ═══════════════════════════════════════════════════════════════════

  // Nettoyage des timers
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  // Timer pour les modes chronométrés
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (!['timed', 'rapid'].includes(selectedMode)) return;
    if (answered) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return timePerQuestion;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, selectedMode, answered, currentIndex, timePerQuestion, handleTimeout]);

  // Tracker du temps total
  useEffect(() => {
    if (gameState !== 'playing' || answered) return;

    const timer = setInterval(() => {
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, answered]);

  // Auto-advance après réponse
  useEffect(() => {
    if (!answered || !autoAdvance || selectedMode === 'learning' || gameOver) return;

    autoAdvanceTimer.current = setTimeout(() => {
      nextQuestion();
    }, autoAdvanceDelay * 1000);

    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, [answered, autoAdvance, selectedMode, gameOver, autoAdvanceDelay, nextQuestion]);

  // Support du clavier (1-4 ou A-D pour répondre, Entrée pour question suivante)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (!answered && !gameOver) {
        if (key === '1' || key === 'a') handleAnswer(0);
        else if (key === '2' || key === 'b') handleAnswer(1);
        else if (key === '3' || key === 'c') handleAnswer(2);
        else if (key === '4' || key === 'd') handleAnswer(3);
      } else if (key === 'enter') {
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, answered, gameOver, handleAnswer, nextQuestion]);

  // ═══════════════════════════════════════════════════════════════════
  // CALCULS MÉMORISÉS
  // ═══════════════════════════════════════════════════════════════════

  const percentage = useMemo(() =>
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
    [score, questions.length]
  );

  const appraisal = useMemo(() => {
    const pool = percentage >= 80 ? quizAppraisals.excellent :
                 percentage >= 60 ? quizAppraisals.good :
                 percentage >= 40 ? quizAppraisals.average :
                 quizAppraisals.low;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [percentage]);

  return {
    gameState,
    selectedCategories,
    selectedMode,
    setSelectedMode,
    selectedDifficulty,
    setSelectedDifficulty,
    questionCount,
    setQuestionCount,
    timePerQuestion,
    setTimePerQuestion,
    autoAdvance,
    setAutoAdvance,
    autoAdvanceDelay,
    setAutoAdvanceDelay,
    errorMessage,
    questions,
    currentIndex,
    score,
    selected,
    answered,
    combo,
    maxCombo,
    timeLeft,
    totalTime,
    lives,
    gameOver,
    showFeedback,
    percentage,
    appraisal,
    toggleCategory,
    selectAllCategories,
    clearCategories,
    startQuiz,
    handleAnswer,
    nextQuestion,
    restartQuiz,
  };
}
