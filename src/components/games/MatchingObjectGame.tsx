import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle2, RefreshCw, ShieldCheck, Heart } from 'lucide-react';
import { LanguageCode } from '../../types';
import { VoiceService } from '../../lib/voiceService';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface MatchingObjectGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

interface RoundData {
  targetName: string;
  targetEmoji: string;
  audioPrompt: string;
  choices: { name: string; emoji: string; isCorrect: boolean }[];
}

export const MatchingObjectGame: React.FC<MatchingObjectGameProps> = ({
  lang,
  onComplete,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [round, setRound] = useState<number>(0);
  const [choicesCount, setChoicesCount] = useState<2 | 3>(2);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [supportMode, setSupportMode] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  // Rounds sequence
  const rounds: RoundData[] = [
    {
      targetName: 'Cup (চাহৰ কাপ)',
      targetEmoji: '☕',
      audioPrompt: 'Find the matching cup.',
      choices: [
        { name: 'Cup', emoji: '☕', isCorrect: true },
        { name: 'Apple', emoji: '🍎', isCorrect: false },
        { name: 'Clay Diya', emoji: '🪔', isCorrect: false },
      ],
    },
    {
      targetName: 'Clay Diya (মাটিৰ চাকি)',
      targetEmoji: '🪔',
      audioPrompt: 'Find the matching clay lamp.',
      choices: [
        { name: 'Book', emoji: '📖', isCorrect: false },
        { name: 'Clay Diya', emoji: '🪔', isCorrect: true },
        { name: 'Fan', emoji: '🪭', isCorrect: false },
      ],
    },
    {
      targetName: 'Reading Glasses (চশমা)',
      targetEmoji: '👓',
      audioPrompt: 'Find the reading glasses.',
      choices: [
        { name: 'Reading Glasses', emoji: '👓', isCorrect: true },
        { name: 'Kettle', emoji: '🫖', isCorrect: false },
        { name: 'Flower', emoji: '🌸', isCorrect: false },
      ],
    },
    {
      targetName: 'Tea Kettle (চাহৰ কেটলি)',
      targetEmoji: '🫖',
      audioPrompt: 'Find the matching tea kettle.',
      choices: [
        { name: 'Spoon', emoji: '🥄', isCorrect: false },
        { name: 'Tea Kettle', emoji: '🫖', isCorrect: true },
        { name: 'Hat', emoji: '👒', isCorrect: false },
      ],
    },
    {
      targetName: 'Lotus Flower (পদ্ম ফুল)',
      targetEmoji: '🪷',
      audioPrompt: 'Find the matching lotus flower.',
      choices: [
        { name: 'Lotus Flower', emoji: '🪷', isCorrect: true },
        { name: 'Cup', emoji: '☕', isCorrect: false },
        { name: 'Apple', emoji: '🍎', isCorrect: false },
      ],
    },
  ];

  const currentRound = rounds[round % rounds.length];

  // Active choices filtered by choicesCount (2 or 3)
  // Ensure the correct choice is always included
  const activeChoices = currentRound.choices
    .filter((c, idx) => {
      if (choicesCount === 2) {
        // Keep the correct choice and the first incorrect choice
        if (c.isCorrect) return true;
        const firstIncorrectIdx = currentRound.choices.findIndex((item) => !item.isCorrect);
        return idx === firstIncorrectIdx;
      }
      return true;
    });

  const handleSpeak = (text?: string) => {
    const speech = text || currentRound.audioPrompt;
    VoiceService.speak(speech, lang);
  };

  const handleSelectChoice = (idx: number, isCorrect: boolean) => {
    setSelectedChoice(idx);
    setTotalAttempts((a) => a + 1);

    if (isCorrect) {
      setIsSuccessFeedback(true);
      VoiceService.speak('Well done! That matches nicely.', lang);

      const nextConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(nextConsecutiveCorrect);
      setConsecutiveErrors(0);

      // Adaptive Rule: If 4 or more independent correct rounds -> gently expand to 3 choices
      if (nextConsecutiveCorrect >= 3 && choicesCount === 2) {
        setChoicesCount(3);
        setSupportMode(false);
      }

      setTimeout(() => {
        setIsSuccessFeedback(false);
        setSelectedChoice(null);

        if (round + 1 < rounds.length) {
          setRound((r) => r + 1);
        } else {
          // Completed all rounds
          const elapsed = Date.now() - startTime;
          const accuracy = Math.max(0.7, 1 - totalMistakes * 0.1);
          onComplete(accuracy, elapsed, totalAttempts + 1, totalMistakes);
        }
      }, 1200);
    } else {
      // Wrong tap
      setTotalMistakes((m) => m + 1);
      const nextConsecutiveErrors = consecutiveErrors + 1;
      setConsecutiveErrors(nextConsecutiveErrors);
      setConsecutiveCorrect(0);

      // Adaptive Rule: 2 consecutive errors -> Increase Support!
      // (Fewer choices -> 2 choices, repeat audio guidance, gentle highlight)
      if (nextConsecutiveErrors >= 2) {
        setSupportMode(true);
        setChoicesCount(2);
        VoiceService.speak(`Take your time. Let's look for the ${currentRound.targetName.split(' ')[0]} together.`, lang);
      } else {
        VoiceService.speak('Take your time, let us try again gently.', lang);
      }

      setTimeout(() => {
        setSelectedChoice(null);
      }, 900);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      {/* Audio-First Instruction Banner */}
      <AudioInstructionBanner
        instructionKey={
          round === 0
            ? 'instruction_find_cup'
            : consecutiveErrors > 0
            ? 'instruction_try_again'
            : isSuccessFeedback
            ? 'instruction_well_done'
            : 'instruction_find_cup'
        }
        lang={lang}
        fallbackText={currentRound.audioPrompt}
        autoPlayOnMount={false}
      />

      {/* Adaptive Guidance Indicator */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-100 rounded-2xl border border-stone-200/90 text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Sparkles className="w-4 h-4 text-teal-700" />
          <span className="font-semibold">Gentle Pace Engine:</span>
          <span className="text-stone-600">
            {choicesCount === 2 ? 'Gentle (2 Choices)' : 'Standard (3 Choices)'}
            {supportMode && ' • Extra Guidance Active'}
          </span>
        </div>
        <span className="text-stone-500 font-mono">
          Round {round + 1}/{rounds.length}
        </span>
      </div>

      {/* Target Item Card */}
      <div className="p-6 bg-amber-50/80 rounded-3xl border-2 border-amber-200 text-center shadow-xs space-y-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleSpeak()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-200/90 text-amber-900 text-xs font-bold hover:bg-amber-300 transition"
            aria-label="Hear audio prompt"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Prompt</span>
          </button>
        </div>

        {/* Big Target Emoji & Label */}
        <div className="text-7xl sm:text-8xl my-2 filter drop-shadow-xs transition-transform hover:scale-105 duration-200">
          {currentRound.targetEmoji}
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
          {currentRound.targetName}
        </h3>

        <p className="text-sm sm:text-base text-stone-700 font-medium">
          "{currentRound.audioPrompt}"
        </p>

        {supportMode && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold animate-fadeIn">
            <Heart className="w-3.5 h-3.5 text-teal-700" />
            <span>Gentle guidance active. Match the {currentRound.targetEmoji} below!</span>
          </div>
        )}
      </div>

      {/* Choices Grid (2 or 3 choices as adapted by the engine) */}
      <div className={`grid ${choicesCount === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
        {activeChoices.map((choice, idx) => {
          const isSelected = selectedChoice === idx;
          const isHighlightedSupport = supportMode && choice.isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleSelectChoice(idx, choice.isCorrect)}
              disabled={isSuccessFeedback}
              className={`p-6 sm:p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-sm min-h-[140px] sm:min-h-[170px] ${
                isSelected && choice.isCorrect
                  ? 'bg-emerald-100 border-emerald-500 scale-102 ring-4 ring-emerald-200'
                  : isSelected && !choice.isCorrect
                  ? 'bg-rose-50 border-rose-300 shake'
                  : isHighlightedSupport
                  ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-300'
                  : 'bg-white border-stone-200 hover:border-teal-700 hover:bg-stone-50'
              }`}
            >
              <span className="text-5xl sm:text-6xl">{choice.emoji}</span>
              <span className="text-base sm:text-lg font-bold text-stone-800">
                {choice.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Success Notification */}
      {isSuccessFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-900 font-bold text-base animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          <span>Well done! Moving to the next round...</span>
        </div>
      )}
    </div>
  );
};
