import React, { useState, useEffect } from 'react';
import { Sparkles, Check, RefreshCw, Eye } from 'lucide-react';
import { LanguageCode } from '../../types';
import { AudioInstructionBanner } from '../common/AudioInstructionBanner';

interface MemoryRecallGameProps {
  difficulty: number;
  lang: LanguageCode;
  onComplete: (accuracy: number, reactionTimeMs: number, attempts: number, mistakes: number) => void;
}

interface ItemCard {
  id: string;
  name: string;
  regionalName: string;
  emoji: string;
  description: string;
}

const MEMORY_ITEMS: ItemCard[] = [
  { id: 'xorai', name: 'Bell-Metal Xorai', regionalName: 'শৰাই (Xorai)', emoji: '🏆', description: 'Traditional brass tray of respect' },
  { id: 'japi', name: 'Woven Bamboo Japi', regionalName: 'জাপি (Japi)', emoji: '👒', description: 'Traditional farmer & honor headgear' },
  { id: 'tea', name: 'Assam Red Tea Cup', regionalName: 'ৰঙা চাহ (Lal Chai)', emoji: '☕', description: 'Warm fresh garden morning tea' },
  { id: 'glasses', name: 'Reading Glasses', regionalName: 'চশমা (Chashma)', emoji: '👓', description: 'Morning newspaper reading glasses' },
  { id: 'diya', name: 'Earthen Clay Diya', regionalName: 'মাটিৰ চাকি (Saki)', emoji: '🪔', description: 'Peaceful prayer evening lamp' },
  { id: 'gamusa', name: 'Woven Gamusa', regionalName: 'ফুলাম গামোচা (Gamusa)', emoji: '🧣', description: 'Traditional red and white handwoven towel' },
];

export const MemoryRecallGame: React.FC<MemoryRecallGameProps> = ({
  difficulty,
  lang,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'MEMORIZE' | 'RECALL'>('MEMORIZE');
  const [targetItems, setTargetItems] = useState<ItemCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);

  // Difficulty 1: 2 items; Difficulty 2: 3 items; Difficulty 3: 4 items
  const itemCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;

  useEffect(() => {
    // Pick unique target items
    const shuffled = [...MEMORY_ITEMS].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, itemCount);
    setTargetItems(targets);
    setPhase('MEMORIZE');
    setStartTime(Date.now());
    setSelectedIds([]);
    setMistakes(0);
  }, [difficulty, itemCount]);

  const handleReadyToRecall = () => {
    setPhase('RECALL');
    setStartTime(Date.now());
  };

  const handleToggleSelect = (item: ItemCard) => {
    const alreadySelected = selectedIds.includes(item.id);
    let newSelected: string[];

    if (alreadySelected) {
      newSelected = selectedIds.filter((id) => id !== item.id);
    } else {
      newSelected = [...selectedIds, item.id];
      // Check if mistake
      const isTarget = targetItems.some((t) => t.id === item.id);
      if (!isTarget) {
        setMistakes((prev) => prev + 1);
      }
    }

    setSelectedIds(newSelected);

    // Check if user found all target items
    const allTargetsFound = targetItems.every((t) => newSelected.includes(t.id));
    if (allTargetsFound && newSelected.length >= targetItems.length) {
      const elapsed = Date.now() - startTime;
      const accuracy = Math.max(0.6, 1 - mistakes * 0.1);
      onComplete(accuracy, elapsed, newSelected.length, mistakes);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Audio-First Instruction */}
      <AudioInstructionBanner
        instructionKey={
          phase === 'MEMORIZE'
            ? 'instruction_continue'
            : mistakes > 0
            ? 'instruction_try_again'
            : 'instruction_find_cup'
        }
        lang={lang}
        fallbackText={
          phase === 'MEMORIZE'
            ? `Take a gentle look at these ${itemCount} keepsakes. Tap ready when done.`
            : `Which ${itemCount} items did you see just now?`
        }
        autoPlayOnMount={false}
      />

      {phase === 'MEMORIZE' ? (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
            <h3 className="text-xl font-bold font-serif-heading text-teal-950">
              Take a gentle look at these {itemCount} familiar keepsakes
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              There is no rush. When you feel ready, tap the button below.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {targetItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border-2 border-teal-700 shadow-md flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-5xl my-2" role="img" aria-label={item.name}>
                  {item.emoji}
                </span>
                <h4 className="font-bold text-stone-900 text-base">{item.name}</h4>
                <span className="text-xs text-teal-800 font-semibold">{item.regionalName}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              id="ready-recall-btn"
              onClick={handleReadyToRecall}
              className="px-8 py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-lg shadow-md hover:shadow-lg transition active:scale-98 min-h-[54px]"
            >
              I am Ready to Recall →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <h3 className="text-xl font-bold font-serif-heading text-stone-900">
              Which {itemCount} items did you see just now?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Tap each item you remember. Found: {selectedIds.filter(id => targetItems.some(t => t.id === id)).length} of {itemCount}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MEMORY_ITEMS.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isCorrectTarget = targetItems.some((t) => t.id === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleSelect(item)}
                  className={`p-5 rounded-3xl border-2 text-center transition flex flex-col items-center justify-center space-y-2 relative min-h-[140px] ${
                    isSelected && isCorrectTarget
                      ? 'bg-teal-50 border-teal-700 shadow-sm'
                      : isSelected && !isCorrectTarget
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-stone-200 hover:border-teal-400'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-4xl" role="img" aria-label={item.name}>
                    {item.emoji}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">{item.name}</h4>
                  <span className="text-xs text-stone-500">{item.regionalName}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
            <button
              onClick={() => setPhase('MEMORIZE')}
              className="flex items-center gap-1.5 text-stone-600 hover:text-teal-800 underline font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Take another peaceful peek</span>
            </button>
            <span>{selectedIds.length} items chosen</span>
          </div>
        </div>
      )}
    </div>
  );
};
