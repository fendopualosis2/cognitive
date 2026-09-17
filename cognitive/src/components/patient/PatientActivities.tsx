import React from 'react';
import { Play, Clock, Sparkles, Grid, Eye, CalendarCheck, Smile, HelpCircle } from 'lucide-react';
import { GameDefinition, LanguageCode } from '../../types';
import { translations, getGameTranslation } from '../../lib/i18n';

interface PatientActivitiesProps {
  games: GameDefinition[];
  lang: LanguageCode;
  onSelectGame: (gameId: string) => void;
}

export const PatientActivities: React.FC<PatientActivitiesProps> = ({
  games,
  lang,
  onSelectGame,
}) => {
  const t = translations[lang] || translations.en;

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-amber-600" />;
      case 'Grid':
        return <Grid className="w-8 h-8 text-teal-700" />;
      case 'Eye':
        return <Eye className="w-8 h-8 text-emerald-700" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-8 h-8 text-amber-700" />;
      case 'Smile':
      default:
        return <Smile className="w-8 h-8 text-teal-800" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Intro Header */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            {t.navActivities}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
            {t.activitiesTitle}
          </h2>
          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
            {t.activitiesSubtitle}
          </p>
        </div>
      </div>

      {/* Activity Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const localized = getGameTranslation(game.id, lang);

          return (
            <div
              key={game.id}
              className="flex flex-col justify-between rounded-3xl bg-white border border-stone-200 p-6 sm:p-7 shadow-xs hover:border-teal-400 hover:shadow-md transition duration-200"
            >
              <div className="space-y-4">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-900 text-xs font-semibold border border-teal-100">
                    {localized.culturalTag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {game.estimatedMinutes} {t.minutesUnit}
                    </span>
                  </div>
                </div>

                {/* Title & icon */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100 p-2 border border-stone-200/80">
                    {getGameIcon(game.iconName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif-heading text-stone-900 leading-snug">
                      {localized.title}
                    </h3>
                    <span className="text-xs font-semibold text-amber-800">
                      {t.categoryLabel}: {localized.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  {localized.shortDescription}
                </p>
              </div>

              {/* Start Button */}
              <div className="pt-6 border-t border-stone-100 mt-4">
                <button
                  id={`btn-play-${game.id}`}
                  onClick={() => onSelectGame(game.id)}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-base shadow-sm hover:shadow transition active:scale-98 min-h-[52px] cursor-pointer"
                  aria-label={`Start ${localized.title}`}
                >
                  <Play className="w-5 h-5 fill-current text-amber-300" />
                  <span>{t.playNow}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gentle helper box */}
      <div className="rounded-2xl bg-stone-100 p-5 text-stone-700 flex items-start gap-3 border border-stone-200">
        <HelpCircle className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm leading-relaxed">
          <strong>{t.elderlyFriendlyTip || 'Elderly-Friendly Tip:'}</strong>{' '}
          {t.activitiesSubtitle}
        </p>
      </div>
    </div>
  );
};
