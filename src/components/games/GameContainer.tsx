import React, { useState } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { GameDefinition, LanguageCode, GameSessionResult } from '../../types';
import { translations } from '../../lib/i18n';
import { VoiceService } from '../../lib/voiceService';
import { OfflineStore } from '../../lib/offlineStore';
import { MemoryRecallGame } from './MemoryRecallGame';
import { PatternSequenceGame } from './PatternSequenceGame';
import { AttentionFocusGame } from './AttentionFocusGame';
import { DailyRoutineGame } from './DailyRoutineGame';
import { ObjectFamiliarityGame } from './ObjectFamiliarityGame';
import { MatchingObjectGame } from './MatchingObjectGame';

interface GameContainerProps {
  game: GameDefinition;
  lang: LanguageCode;
  onExit: () => void;
  onSessionRecorded?: (session: GameSessionResult) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  game,
  lang,
  onExit,
  onSessionRecorded,
}) => {
  const t = translations[lang];
  const [gameState, setGameState] = useState<'INSTRUCTION' | 'PLAYING' | 'COMPLETED'>('INSTRUCTION');
  const [difficulty] = useState<number>(2);
  const [sessionResult, setSessionResult] = useState<GameSessionResult | null>(null);

  const handleSpeakInstruction = () => {
    const textToSpeak = `${game.title}. ${game.shortDescription}. Take your time comfortably. There is no hurry.`;
    VoiceService.speak(textToSpeak, lang);
  };

  const handleGameComplete = (
    accuracy: number,
    reactionTimeMs: number,
    attempts: number,
    mistakes: number
  ) => {
    const activePatientId = OfflineStore.getActivePatientId() || 'patient-senior-1';
    const result: GameSessionResult = {
      id: `sess-${Date.now()}`,
      gameId: game.id,
      patientId: activePatientId,
      difficulty,
      accuracy,
      reactionTimeMs,
      completionTimeMs: reactionTimeMs,
      attempts,
      mistakes,
      hintsUsed: 0,
      completedAt: 'Just now',
      syncStatus: 'pending',
    };

    OfflineStore.addSession(result);
    setSessionResult(result);
    setGameState('COMPLETED');
    onSessionRecorded?.(result);

    // Speak encouraging gentle conclusion
    VoiceService.speak(t.calmSuccess, lang);
  };

  const handleRestart = () => {
    setGameState('PLAYING');
    setSessionResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Game Shell Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-stone-700 hover:text-teal-900 font-semibold text-sm transition p-2 rounded-xl hover:bg-stone-100"
          aria-label="Back to activities"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.backToActivities}</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">
            {game.culturalTag}
          </span>
          <h2 className="text-lg font-bold font-serif-heading text-stone-900">
            {game.title}
          </h2>
        </div>
      </div>

      {/* Screen 1: Instructions (TRD 12: Instruction -> Activity -> Response -> Feedback) */}
      {gameState === 'INSTRUCTION' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 shadow-inner">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              {t.instructions}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
              {game.title}
            </h3>
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed pt-2">
              {game.shortDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="begin-game-btn"
              onClick={() => setGameState('PLAYING')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-lg shadow-md hover:shadow-lg transition active:scale-98 min-h-[54px] flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current text-amber-300" />
              <span>{t.playNow}</span>
            </button>

            <button
              onClick={handleSpeakInstruction}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-base transition flex items-center justify-center gap-2"
              aria-label="Hear instructions aloud"
            >
              <Volume2 className="w-5 h-5 text-teal-800" />
              <span>Listen Aloud</span>
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Active Cognitive Game */}
      {gameState === 'PLAYING' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm">
          {(game.id === 'find-matching' || game.id === 'memory-recall') && (
            <MatchingObjectGame
              difficulty={difficulty}
              lang={lang}
              onComplete={handleGameComplete}
            />
          )}

          {game.id === 'pattern-sequence' && (
            <PatternSequenceGame
              difficulty={difficulty}
              lang={lang}
              onComplete={handleGameComplete}
            />
          )}

          {game.id === 'attention-focus' && (
            <AttentionFocusGame
              difficulty={difficulty}
              lang={lang}
              onComplete={handleGameComplete}
            />
          )}

          {game.id === 'daily-routine' && (
            <DailyRoutineGame
              difficulty={difficulty}
              lang={lang}
              onComplete={handleGameComplete}
            />
          )}

          {game.id === 'object-familiarity' && (
            <ObjectFamiliarityGame
              difficulty={difficulty}
              lang={lang}
              onComplete={handleGameComplete}
            />
          )}
        </div>
      )}

      {/* Screen 3: Activity Completion Screen (TRD 14 & 16: Encouraging, calm, no shame-oriented failure screens, background difficulty adaptation) */}
      {gameState === 'COMPLETED' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-10 shadow-sm text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-700" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
              {t.calmSuccess}
            </h3>
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
              {t.calmEncouragement}
            </p>
          </div>

          {/* Simple gentle feedback summary (no complex clinical stats for patient) */}
          <div className="max-w-md mx-auto p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-around text-center">
            <div>
              <span className="text-xs text-stone-500 uppercase font-semibold">Activity</span>
              <p className="text-base font-bold text-stone-900">{game.title}</p>
            </div>
            <div className="h-8 w-px bg-teal-200" />
            <div>
              <span className="text-xs text-stone-500 uppercase font-semibold">Saved Locally</span>
              <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recorded</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-base shadow-md transition active:scale-98 min-h-[52px]"
            >
              {t.backToActivities}
            </button>

            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
              <span>Try Once More</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
