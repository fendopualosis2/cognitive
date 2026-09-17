import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { LanguageCode } from '../../types';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface AttentionFocusGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

export const AttentionFocusGame: React.FC<AttentionFocusGameProps> = ({
  difficulty,
  lang,
  onComplete,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);
  const [foundIndices, setFoundIndices] = useState<number[]>([]);

  // Targets are Blooming Lotuses (🌸) among green tea leaves (🍃)
  // Grid of 16 items with 3 targets
  const targetCount = 3;
  const targetIndices = [2, 7, 13];

  const gridItems = Array.from({ length: 16 }).map((_, idx) => ({
    id: idx,
    isTarget: targetIndices.includes(idx),
    emoji: targetIndices.includes(idx) ? '🌸' : '🍃',
    name: targetIndices.includes(idx) ? 'Pink Lotus' : 'Green Leaf',
  }));

  const handleTapTile = (index: number, isTarget: boolean) => {
    if (foundIndices.includes(index)) return;

    if (isTarget) {
      const updated = [...foundIndices, index];
      setFoundIndices(updated);

      if (updated.length >= targetCount) {
        const elapsed = Date.now() - startTime;
        const accuracy = Math.max(0.7, 1 - mistakes * 0.1);
        onComplete(accuracy, elapsed, updated.length + mistakes, mistakes);
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
            : foundIndices.length >= targetCount
            ? 'instruction_well_done'
            : 'instruction_find_cup'
        }
        lang={lang}
        fallbackText="Find the 3 Blooming Lotuses (🌸) in the garden."
        autoPlayOnMount={false}
      />

      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
        <h3 className="text-xl font-bold font-serif-heading text-teal-950">
          Find the {targetCount} Blooming Lotuses (🌸)
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Take your time comfortably in this tea garden. Found: {foundIndices.length} of {targetCount}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-3xl border border-stone-200 shadow-xs">
        {gridItems.map((item) => {
          const isFound = foundIndices.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleTapTile(item.id, item.isTarget)}
              className={`h-16 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition border-2 relative active:scale-95 ${
                isFound
                  ? 'bg-pink-50 border-pink-400 shadow-inner'
                  : 'bg-stone-50 border-stone-200 hover:border-teal-500'
              }`}
              aria-label={item.name}
            >
              {isFound ? '🌸' : item.emoji}
              {isFound && (
                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-800 text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
