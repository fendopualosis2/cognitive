import React from 'react';
import { Type, Languages, Volume2, Eye, ShieldCheck, Sun, Moon } from 'lucide-react';
import { LanguageCode, TextScale, PatientProfile } from '../../types';
import { translations } from '../../lib/i18n';

interface PatientSettingsProps {
  patient: PatientProfile;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const PatientSettings: React.FC<PatientSettingsProps> = ({
  patient,
  lang,
  onLangChange,
  textScale,
  onTextScaleChange,
  voiceEnabled,
  onToggleVoice,
  highContrast,
  onToggleHighContrast,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = translations[lang];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            {t.navSettings}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
            {t.accessibilityTitle}
          </h2>
          <p className="text-teal-100/90 text-sm leading-relaxed">
            Simple adjustments for reading, voice volume, and viewing comfort.
          </p>
        </div>
      </div>

      {/* Settings Options Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Text Size */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-teal-800" />
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.textSizeTitle}</h3>
              <p className="text-xs text-stone-500">Choose the font size that feels easiest to read.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onTextScaleChange('normal')}
              className={`p-3 rounded-2xl border text-center transition ${
                textScale === 'normal'
                  ? 'bg-teal-800 text-white border-teal-800 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              <span className="text-sm block font-semibold">{t.textNormal}</span>
              <span className="text-xs opacity-75">16px</span>
            </button>

            <button
              onClick={() => onTextScaleChange('large')}
              className={`p-3 rounded-2xl border text-center transition ${
                textScale === 'large'
                  ? 'bg-teal-800 text-white border-teal-800 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              <span className="text-base block font-bold">{t.textLarge}</span>
              <span className="text-xs opacity-75">18px</span>
            </button>

            <button
              onClick={() => onTextScaleChange('extralarge')}
              className={`p-3 rounded-2xl border text-center transition ${
                textScale === 'extralarge'
                  ? 'bg-teal-800 text-white border-teal-800 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              <span className="text-lg block font-extrabold">{t.textExtraLarge}</span>
              <span className="text-xs opacity-75">21px</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-teal-800" />
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.languageSelect}</h3>
              <p className="text-xs text-stone-500">CognitiveSaathi speaks and displays in regional languages.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'as', label: 'অসমীয়া' },
              { code: 'hi', label: 'हिन्दी' },
              { code: 'mni', label: 'মৈতৈলোন্' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => onLangChange(item.code as LanguageCode)}
                className={`py-3 px-3 rounded-2xl border text-sm font-semibold transition ${
                  lang === item.code
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Guidance Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.voiceAssistance}</h3>
              <p className="text-xs text-stone-500">Read instructions and greetings aloud gently.</p>
            </div>
          </div>

          <button
            onClick={onToggleVoice}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-200 ${
              voiceEnabled ? 'bg-teal-800' : 'bg-stone-300'
            }`}
            role="switch"
            aria-checked={voiceEnabled}
            aria-label="Toggle voice guidance"
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition duration-200 ${
                voiceEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.highContrast}</h3>
              <p className="text-xs text-stone-500">Strengthen borders and dark text contrast for vision comfort.</p>
            </div>
          </div>

          <button
            onClick={onToggleHighContrast}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-200 ${
              highContrast ? 'bg-teal-800' : 'bg-stone-300'
            }`}
            role="switch"
            aria-checked={highContrast}
            aria-label="Toggle high contrast"
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition duration-200 ${
                highContrast ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dark / Light Mode Toggle */}
        {onToggleTheme && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {theme === 'dark' ? 'Night & Dark Mode' : 'Warm Daytime Mode'}
                </h3>
                <p className="text-xs text-stone-500">
                  {theme === 'dark'
                    ? 'Gentle on eyes in evening and dim lighting.'
                    : 'Clear daytime palette with comforting warm contrast.'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleTheme}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-200 ${
                theme === 'dark' ? 'bg-indigo-900' : 'bg-amber-400'
              }`}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition duration-200 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Safety & Caregiver Link information */}
      <div className="rounded-2xl bg-teal-50/70 border border-teal-200/80 p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 space-y-1">
          <p className="font-bold text-teal-950">Linked Caregiver: {patient.caregiverName}</p>
          <p>Any reminders or activities completed here are automatically synchronized to your family portal.</p>
        </div>
      </div>
    </div>
  );
};
