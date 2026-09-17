import React, { useState } from 'react';
import { Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { LanguageCode } from '../../types';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface PatternSequenceGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

interface PatternSymbol {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

const SYMBOLS: PatternSymbol[] = [
  { id: 'diamond', name: 'Diamond Loom (হীৰা)', symbol: '◆', color: 'text-amber-600' },
  { id: 'circle', name: 'Serene Sun (সূৰ্য্য)', symbol: '●', color: 'text-teal-700' },
  { id: 'triangle', name: 'Hill Peak (পৰ্ব্বত)', symbol: '▲', color: 'text-emerald-700' },
  { id: 'star', name: 'Evening Star (তৰা)', symbol: '★', color: 'text-indigo-700' },
];

export const PatternSequenceGame: React.FC<PatternSequenceGameProps> = ({
  difficulty,
  lang,
  onComplete,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const totalSteps = 3;

  // Patterns for step 1, 2, 3
  // Step 1: A, B, A, B, ? (answer: A)
  // Step 2: A, A, B, B, A, ? (answer: A)
  // Step 3: A, B, C, A, B, ? (answer: C)
  const sequences = [
    {
      seq: [SYMBOLS[0], SYMBOLS[1], SYMBOLS[0], SYMBOLS[1]],
      answer: SYMBOLS[0],
      hint: 'Notice how the Diamond and Sun alternate gently.',
    },
    {
      seq: [SYMBOLS[1], SYMBOLS[1], SYMBOLS[2], SYMBOLS[2], SYMBOLS[1]],
      answer: SYMBOLS[1],
      hint: 'Notice the pairs: two Suns, two Hill Peaks, then a Sun.',
    },
    {
      seq: [SYMBOLS[0], SYMBOLS[2], SYMBOLS[3], SYMBOLS[0], SYMBOLS[2]],
      answer: SYMBOLS[3],
      hint: 'Follow the trio: Diamond, Hill, Star... Diamond, Hill, then?',
    },
  ];

  const current = sequences[step - 1];

  const handleChoice = (chosen: PatternSymbol) => {
    if (chosen.id === current.answer.id) {
      if (step < totalSteps) {
        setStep((s) => s + 1);
      } else {
        const elapsed = Date.now() - startTime;
        const accuracy = Math.max(0.7, 1 - mistakes * 0.1);
        onComplete(accuracy, elapsed, totalSteps + mistakes, mistakes);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {/* Audio Instruction */}
      <AudioInstructionBanner
        instructionKey={mistakes > 0 ? 'instruction_try_again' : 'instruction_continue'}
        lang={lang}
        fallbackText="Look at the symbols in sequence and tap the one that fits next."
        autoPlayOnMount={false}
      />

      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
        <span className="text-xs font-bold uppercase text-teal-800 tracking-wider">
          Exercise {step} of {totalSteps}
        </span>
        <h3 className="text-xl font-bold font-serif-heading text-teal-950 mt-1">
          What symbol comes next in this traditional border?
        </h3>
        <p className="text-xs text-stone-600 mt-1">{current.hint}</p>
      </div>

      {/* Visual Sequence Display */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-6 bg-white rounded-3xl border border-stone-200 shadow-xs min-h-[140px]">
        {current.seq.map((item, idx) => (
          <div
            key={idx}
            className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-stone-50 border border-stone-200 shadow-inner"
          >
            <span className={`text-4xl ${item.color}`}>{item.symbol}</span>
          </div>
        ))}

        {/* Missing blank slot */}
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-3 border-dashed border-teal-600 bg-teal-50/50 animate-pulse">
          <span className="text-2xl font-bold text-teal-800">?</span>
        </div>
      </div>

      {/* Multiple Choice Selection */}
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold text-stone-700">Tap your choice to complete the pattern:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SYMBOLS.map((sym) => (
            <button
              key={sym.id}
              onClick={() => handleChoice(sym)}
              className="p-5 rounded-3xl bg-white border-2 border-stone-200 hover:border-teal-700 hover:bg-teal-50/50 transition flex flex-col items-center justify-center gap-2 active:scale-95 shadow-xs"
            >
              <span className={`text-4xl ${sym.color}`}>{sym.symbol}</span>
              <span className="text-xs font-bold text-stone-800">{sym.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
