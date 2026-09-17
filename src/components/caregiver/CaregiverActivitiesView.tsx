import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  Sliders,
  Volume2,
  Eye,
  Check,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { GameDefinition, PatientProfile, GameSessionResult, LanguageCode } from '../../types';
import { VoiceService } from '../../lib/voiceService';

interface CaregiverActivitiesViewProps {
  patient: PatientProfile;
  games: GameDefinition[];
  sessions: GameSessionResult[];
  onPreviewGame?: (game: GameDefinition) => void;
  lang?: LanguageCode;
}

interface GameCustomization {
  difficulty: 'GENTLE' | 'STANDARD' | 'CHALLENGE';
  audioPrompts: boolean;
  visualHints: boolean;
  zeroTimer: boolean;
}

export const CaregiverActivitiesView: React.FC<CaregiverActivitiesViewProps> = ({
  patient,
  games,
  sessions,
  lang = 'en',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewingGame, setPreviewingGame] = useState<GameDefinition | null>(null);
  const [testAnswerSelected, setTestAnswerSelected] = useState<number | null>(null);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [customExerciseModalOpen, setCustomExerciseModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Per-game customization settings stored in state/localStorage
  const [gameSettings, setGameSettings] = useState<Record<string, GameCustomization>>(() => {
    try {
      const saved = localStorage.getItem('caregiver_game_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom games created by caregiver
  const [customGames, setCustomGames] = useState<GameDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('caregiver_custom_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New Custom Game Form State
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'MEMORY' | 'ATTENTION' | 'RECOGNITION'>('MEMORY');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameCulturalTag, setNewGameCulturalTag] = useState('FAMILY & HERITAGE');
  const [newGameDifficulty, setNewGameDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');

  const categories = [
    { id: 'ALL', label: 'All Exercises' },
    { id: 'MEMORY', label: 'Memory Recall' },
    { id: 'ATTENTION', label: 'Visual Focus' },
    { id: 'RECOGNITION', label: 'Heritage Recognition' },
  ];

  const allAvailableGames = [...games, ...customGames];

  const filteredGames = allAvailableGames.filter(
    (g) => selectedCategory === 'ALL' || g.category === selectedCategory
  );

  // Stats calculation
  const totalCompleted = sessions.length;
  const avgAccuracy =
    sessions.length > 0
      ? Math.round(
          (sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) * 100
        )
      : 88;

  // Recommended difficulty based on accuracy
  const getRecommendedDifficulty = () => {
    if (avgAccuracy >= 85) return 'CHALLENGE';
    if (avgAccuracy >= 65) return 'STANDARD';
    return 'GENTLE';
  };

  const handleOpenPreview = (game: GameDefinition) => {
    setPreviewingGame(game);
    setTestAnswerSelected(null);
    setTestFeedback(null);
    setSaveSuccessMsg(null);
  };

  const handleClosePreview = () => {
    setPreviewingGame(null);
    setTestAnswerSelected(null);
    setTestFeedback(null);
    VoiceService.stopSpeaking();
  };

  const handleTestAnswer = (index: number, isCorrect: boolean) => {
    setTestAnswerSelected(index);
    if (isCorrect) {
      VoiceService.playAcousticChime();
      setTestFeedback('Correct! Gentle positive reinforcement chime played.');
    } else {
      VoiceService.playAcousticChime();
      setTestFeedback('Encouraging guidance prompt played with zero stress.');
    }
  };

  const handleTestVoiceNarration = (text: string) => {
    VoiceService.stopSpeaking();
    VoiceService.speak(text, (lang as LanguageCode) || 'en');
  };

  const getGameConfig = (gameId: string): GameCustomization => {
    return (
      gameSettings[gameId] || {
        difficulty: getRecommendedDifficulty(),
        audioPrompts: true,
        visualHints: true,
        zeroTimer: true,
      }
    );
  };

  const updateGameConfig = (gameId: string, updates: Partial<GameCustomization>) => {
    const current = getGameConfig(gameId);
    const updated = { ...current, ...updates };
    const nextSettings = { ...gameSettings, [gameId]: updated };
    setGameSettings(nextSettings);
    try {
      localStorage.setItem('caregiver_game_settings', JSON.stringify(nextSettings));
    } catch {}
    setSaveSuccessMsg('Settings updated and saved for patient!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleCreateCustomGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim() || !newGameDesc.trim()) return;

    const newGame: GameDefinition = {
      id: `custom-game-${Date.now()}`,
      title: newGameTitle.trim(),
      shortDescription: newGameDesc.trim(),
      category: newGameCategory,
      culturalTag: newGameCulturalTag.trim() || 'CUSTOM CAREGIVER EXERCISE',
      difficultyLevels: 3,
      estimatedMinutes: 3,
      iconName: 'Sparkles',
    };

    const updatedList = [newGame, ...customGames];
    setCustomGames(updatedList);
    try {
      localStorage.setItem('caregiver_custom_games', JSON.stringify(updatedList));
    } catch {}

    setCustomExerciseModalOpen(false);
    setNewGameTitle('');
    setNewGameDesc('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>Caregiver Exercise Management Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
              Preview, Test & Adjust Brain Exercises
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Test cognitive activities directly within your caregiver portal without logging out or switching to the patient view. Adapt difficulty levels based on {patient?.preferredName || patient?.fullName || 'the patient'}'s real-time performance.
            </p>
          </div>

          {/* Quick Metrics & Add Exercise Action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-teal-800/80 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-3">
              <div className="bg-teal-950/60 p-3 rounded-2xl border border-teal-800 text-center flex-1 sm:w-28">
                <div className="text-[11px] text-teal-300 font-medium">Completed</div>
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{totalCompleted}</span>
                </div>
              </div>
              <div className="bg-teal-950/60 p-3 rounded-2xl border border-teal-800 text-center flex-1 sm:w-28">
                <div className="text-[11px] text-teal-300 font-medium">Accuracy</div>
                <div className="text-xl font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                  <span>{avgAccuracy}%</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCustomExerciseModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Exercise</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-white dark:bg-[#1A222C] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Games List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGames.map((game) => {
          const gameSessions = sessions.filter((s) => s.gameId === game.id);
          const lastSession = gameSessions[0];
          const config = getGameConfig(game.id);

          return (
            <div
              key={game.id}
              className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-700/50 transition"
            >
              <div className="space-y-3">
                {/* Header Badge & Level */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {game.culturalTag || 'NER HERITAGE'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px]">
                      {config.difficulty === 'GENTLE' ? 'Level 1: Gentle' : config.difficulty === 'STANDARD' ? 'Level 2: Standard' : 'Level 3: Challenge'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{game.estimatedMinutes || 3}m
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                    {game.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5">
                    {game.shortDescription}
                  </p>
                </div>

                {/* Clinical Target */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span>
                    <strong>Clinical Target:</strong>{' '}
                    {game.category === 'MEMORY'
                      ? 'Short-term visual recognition & semantic recall'
                      : game.category === 'ATTENTION'
                      ? 'Sustained focus & visual discrimination'
                      : 'Audio-visual sensory stimulation'}
                  </span>
                </div>

                {/* Patient Performance Insight */}
                {lastSession ? (
                  <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 pt-1">
                    <span>
                      Recent Accuracy:{' '}
                      <strong className="text-teal-700 dark:text-teal-400">
                        {Math.round(lastSession.accuracy * 100)}%
                      </strong>
                    </span>
                    <span>Last: {lastSession.completedAt}</span>
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 dark:text-stone-500 pt-1">
                    Ready for today's gentle session with {patient?.preferredName || 'elder'}.
                  </div>
                )}
              </div>

              {/* Preview & Test Exercise Button */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(game)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-amber-300" />
                  <span>Preview & Test Exercise</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* IN-PLACE CAREGIVER PREVIEW & DIFFICULTY MANAGEMENT MODAL */}
      {previewingGame && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
        >
          <div className="w-full max-w-2xl my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                    Caregiver Testing & Sandbox
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold">
                    Patient Role Not Affected
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                  {previewingGame.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {previewingGame.shortDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Interactive Simulation Area */}
            <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Interactive Sample Question</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleTestVoiceNarration(
                      'Listen carefully. Which heritage item brings memories of celebration in Assam?'
                    )
                  }
                  className="px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Voice Audio</span>
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-[#121820] rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs space-y-3">
                <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                  {previewingGame.category === 'MEMORY'
                    ? 'Look at this traditional musical instrument. What is it traditionally called?'
                    : previewingGame.category === 'ATTENTION'
                    ? 'Focus your attention on the screen. Select the matching pair:'
                    : 'Which sacred morning ritual is represented by this symbol?'}
                </p>

                {/* Sample choices */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {[
                    { label: 'Pepa (Buffalo Horn)', correct: true },
                    { label: 'Dhol (Drum)', correct: false },
                    { label: 'Bahi (Flute)', correct: false },
                  ].map((option, idx) => {
                    const isSelected = testAnswerSelected === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTestAnswer(idx, option.correct)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold text-left transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? option.correct
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200'
                            : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-teal-600 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && option.correct && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {testFeedback && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                    <span>{testFeedback}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Manage Difficulty & Adaptation based on Performance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Difficulty Level & Cognitive Adaptation</span>
                </span>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  Recommended: {getRecommendedDifficulty() === 'CHALLENGE' ? 'Level 3 (Excelling)' : getRecommendedDifficulty() === 'STANDARD' ? 'Level 2 (Normal)' : 'Level 1 (Gentle)'}
                </span>
              </div>

              {/* Difficulty selector tabs */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'GENTLE' as const,
                    title: 'Level 1: Gentle',
                    desc: '2 choices, high hints, unlimited zero-stress time',
                  },
                  {
                    id: 'STANDARD' as const,
                    title: 'Level 2: Standard',
                    desc: '3 choices, subtle guidance, balanced pace',
                  },
                  {
                    id: 'CHALLENGE' as const,
                    title: 'Level 3: Challenge',
                    desc: '4 choices, sharp focus, cognitive workout',
                  },
                ].map((diff) => {
                  const currentDiff = getGameConfig(previewingGame.id).difficulty;
                  const isSelected = currentDiff === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => updateGameConfig(previewingGame.id, { difficulty: diff.id })}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-800 text-white border-teal-900 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{diff.title}</div>
                      <div className={`text-[10px] mt-1 leading-snug ${isSelected ? 'text-teal-100' : 'text-stone-500 dark:text-stone-400'}`}>
                        {diff.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accessibility & Voice Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Voice Prompts & Acoustic Chimes
                  </span>
                  <input
                    type="checkbox"
                    checked={getGameConfig(previewingGame.id).audioPrompts}
                    onChange={(e) =>
                      updateGameConfig(previewingGame.id, { audioPrompts: e.target.checked })
                    }
                    className="w-4 h-4 accent-teal-800 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Unlimited Patience (Zero Timer)
                  </span>
                  <input
                    type="checkbox"
                    checked={getGameConfig(previewingGame.id).zeroTimer}
                    onChange={(e) =>
                      updateGameConfig(previewingGame.id, { zeroTimer: e.target.checked })
                    }
                    className="w-4 h-4 accent-teal-800 rounded"
                  />
                </label>
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-4">
              <button
                type="button"
                onClick={handleClosePreview}
                className="py-2.5 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
              >
                Close Preview & Return to Caregiver Hub
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccessMsg('Exercise configuration applied for patient!');
                  setTimeout(() => handleClosePreview(), 900);
                }}
                className="py-2.5 px-5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Save & Apply for Patient</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM EXERCISE MODAL */}
      {customExerciseModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
        >
          <div className="w-full max-w-lg my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md">
                  Personalized Care
                </span>
                <h3 className="text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100 mt-1">
                  Create Custom Brain Exercise
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCustomExerciseModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomGame} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Exercise Title:
                </label>
                <input
                  type="text"
                  required
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  placeholder="e.g. Grandchildren Faces & Names Recall"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#121820] focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Therapeutic Domain:
                  </label>
                  <select
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#121820]"
                  >
                    <option value="MEMORY">Memory Recall</option>
                    <option value="ATTENTION">Visual Focus</option>
                    <option value="RECOGNITION">Heritage Recognition</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Initial Difficulty:
                  </label>
                  <select
                    value={newGameDifficulty}
                    onChange={(e) => setNewGameDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#121820]"
                  >
                    <option value="EASY">Gentle (Level 1)</option>
                    <option value="MEDIUM">Standard (Level 2)</option>
                    <option value="HARD">Challenge (Level 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Description & Guidance Instructions:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newGameDesc}
                  onChange={(e) => setNewGameDesc(e.target.value)}
                  placeholder="Describe the gentle prompts and what the elder should recall..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-normal text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#121820] focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Cultural / Family Tag:
                </label>
                <input
                  type="text"
                  value={newGameCulturalTag}
                  onChange={(e) => setNewGameCulturalTag(e.target.value)}
                  placeholder="e.g. FAMILY MEMORIES, FOLK SONGS"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#121820]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomExerciseModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Exercise to List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
