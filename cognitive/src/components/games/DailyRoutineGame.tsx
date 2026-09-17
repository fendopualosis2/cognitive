import React, { useState } from 'react';
import { CheckCircle2, Coffee, Pill, Footprints, Clock } from 'lucide-react';
import { LanguageCode } from '../../types';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface DailyRoutineGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

export const DailyRoutineGame: React.FC<DailyRoutineGameProps> = ({
  difficulty,
  lang,
  onComplete,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);

  const questions = [
    {
      prompt: 'After having your morning cup of red tea and light breakfast, what is the most important step?',
      options: [
        { text: 'Take morning prescribed medicine with water', icon: '💊', correct: true },
        { text: 'Go shopping in the busy market', icon: '🛒', correct: false },
        { text: 'Wash all the heavy blankets', icon: '🧺', correct: false },
      ],
      explanation: 'Taking prescribed medicine with water keeps your health steady.',
    },
    {
      prompt: 'When the pleasant morning sun warms the veranda, what is a peaceful habit?',
      options: [
        { text: 'Take a gentle 15-minute garden walk', icon: '🌿', correct: true },
        { text: 'Stare at a bright screen for hours', icon: '💻', correct: false },
        { text: 'Skip hydration and lunch', icon: '🚫', correct: false },
      ],
      explanation: 'Gentle morning steps in the fresh air refresh your body and mind.',
    },
  ];

  const q = questions[currentQuestion];

  const handleSelectOption = (isCorrect: boolean) => {
    if (isCorrect) {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        const elapsed = Date.now() - startTime;
        const accuracy = Math.max(0.7, 1 - mistakes * 0.15);
        onComplete(accuracy, elapsed, questions.length + mistakes, mistakes);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      {/* Audio-First Instruction */}
      <AudioInstructionBanner
        instructionKey={
          mistakes > 0
            ? 'instruction_try_again'
            : currentQuestion === 0
            ? 'instruction_medicine_time'
            : 'instruction_continue'
        }
        lang={lang}
        fallbackText={q.prompt}
        autoPlayOnMount={false}
      />

      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
        <span className="text-xs font-bold uppercase text-teal-800 tracking-wider">
          Routine Step {currentQuestion + 1} of {questions.length}
        </span>
        <h3 className="text-xl font-bold font-serif-heading text-stone-900 mt-1">
          {q.prompt}
        </h3>
      </div>

      <div className="space-y-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt.correct)}
            className="w-full p-5 rounded-2xl bg-white border-2 border-stone-200 hover:border-teal-700 text-left flex items-center gap-4 transition active:scale-[0.99] shadow-xs"
          >
            <span className="text-3xl shrink-0">{opt.icon}</span>
            <span className="text-base font-bold text-stone-800">{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
