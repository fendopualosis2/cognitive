import React, { useState } from 'react';
import { Smile, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../../types';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface ObjectFamiliarityGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

export const ObjectFamiliarityGame: React.FC<ObjectFamiliarityGameProps> = ({
  difficulty,
  lang,
  onComplete,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);

  const items = [
    {
      emoji: '👓',
      prompt: 'Which item helps you clearly read the morning news and family letters?',
      options: ['Reading Glasses (চশমা)', 'A Wooden Hammer', 'A Flashlight'],
      correctIndex: 0,
    },
    {
      emoji: '🪔',
      prompt: 'Which sacred item is lit in the evening to bring peace to the prayer altar?',
      options: ['A Rubber Toy', 'Clay Diya / Saki (মাটিৰ চাকি)', 'A Plastic Cup'],
      correctIndex: 1,
    },
  ];

  const current = items[currentStep];

  const handleSelect = (index: number) => {
    if (index === current.correctIndex) {
      if (currentStep + 1 < items.length) {
        setCurrentStep((s) => s + 1);
      } else {
        const elapsed = Date.now() - startTime;
        const accuracy = Math.max(0.7, 1 - mistakes * 0.15);
        onComplete(accuracy, elapsed, items.length + mistakes, mistakes);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      {/* Audio-First Instruction */}
      <AudioInstructionBanner
        instructionKey={mistakes > 0 ? 'instruction_try_again' : 'instruction_find_cup'}
        lang={lang}
        fallbackText={current.prompt}
        autoPlayOnMount={false}
      />

      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
        <div className="text-5xl my-2">{current.emoji}</div>
        <h3 className="text-xl font-bold font-serif-heading text-stone-900 mt-2">
          {current.prompt}
        </h3>
      </div>

      <div className="space-y-3">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className="w-full p-5 rounded-2xl bg-white border-2 border-stone-200 hover:border-teal-700 text-left text-base font-bold text-stone-800 transition active:scale-[0.99] shadow-xs"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
