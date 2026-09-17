import React, { useState } from 'react';
import { Volume2, RotateCcw, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../../types';
import { LanguagePackService } from '../../lib/languagePackService';
import { translations } from '../../lib/i18n';

interface AudioInstructionBannerProps {
  instructionKey: string;
  lang: LanguageCode;
  fallbackText?: string;
  className?: string;
  autoPlayOnMount?: boolean;
}

export const AudioInstructionBanner: React.FC<AudioInstructionBannerProps> = ({
  instructionKey,
  lang,
  fallbackText,
  className = '',
  autoPlayOnMount = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const t = translations[lang] || translations.en;

  const instructionText = LanguagePackService.getInstructionText(instructionKey, lang) || fallbackText || '';
  const isDownloaded = LanguagePackService.isDownloaded(lang);

  const handlePlayAudio = () => {
    if (!isDownloaded && lang !== 'en') {
      setOfflineNotice("This language pack needs to be downloaded for offline audio.");
      setTimeout(() => setOfflineNotice(null), 3500);
      return;
    }

    setOfflineNotice(null);
    setIsPlaying(true);
    LanguagePackService.playInstructionAudio(instructionKey, lang, {
      onEnd: () => {
        setIsPlaying(false);
        setHasPlayedOnce(true);
      },
      onError: () => {
        setIsPlaying(false);
      },
    });
  };

  React.useEffect(() => {
    if (autoPlayOnMount && isDownloaded) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [instructionKey, lang]);

  return (
    <div
      className={`rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${className}`}
    >
      {/* Text instruction (Text Fallback) */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 shrink-0 mt-0.5">
          <Volume2 className="w-5 h-5 text-amber-800 dark:text-amber-300" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
            {t.instructions || 'Voice Instruction'}
          </span>
          <p className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
            {instructionText}
          </p>
          {!isDownloaded && (
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline pack not downloaded yet (showing text fallback)</span>
            </span>
          )}
          {offlineNotice && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{offlineNotice}</span>
            </span>
          )}
        </div>
      </div>

      {/* Audio Control: 🔊 Listen / Replay */}
      <button
        type="button"
        onClick={handlePlayAudio}
        disabled={isPlaying}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-xs transition active:scale-95 shrink-0 ${
          isPlaying
            ? 'bg-amber-300 text-stone-900 animate-pulse cursor-wait'
            : 'bg-teal-800 hover:bg-teal-900 text-white cursor-pointer'
        }`}
        aria-label={hasPlayedOnce ? 'Replay audio instruction' : 'Listen to audio instruction'}
      >
        {hasPlayedOnce ? (
          <>
            <RotateCcw className={`w-4 h-4 text-amber-300 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>🔊 {t.replayAudio || 'Replay'}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>🔊 {t.listenAudio || 'Listen'}</span>
          </>
        )}
      </button>
    </div>
  );
};
