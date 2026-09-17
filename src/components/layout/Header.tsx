import React from 'react';
import { Mic, User, ShieldCheck, HeartPulse, Type, LogOut, Lock, Heart, Sun, Moon, Volume2 } from 'lucide-react';
import { UserRole, LanguageCode, ConnectivityStatus, TextScale } from '../../types';
import { translations } from '../../lib/i18n';
import { ConnectivityBadge } from '../common/ConnectivityBadge';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { LanguageDropdown } from '../common/LanguageDropdown';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  connectivity: ConnectivityStatus;
  onSyncTrigger: () => void;
  onOpenVoice: () => void;
  onOpenVoicePack?: () => void;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  patientName?: string;
  onLogout?: () => void;
  onRequestUnlockCaregiver?: (targetRole?: UserRole) => void;
  onOpenDashboard?: () => void;
  isViewingDashboard?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  lang,
  onLangChange,
  connectivity,
  onSyncTrigger,
  onOpenVoice,
  onOpenVoicePack,
  textScale,
  onTextScaleChange,
  patientName = 'Ramesh Sharma',
  onLogout,
  onRequestUnlockCaregiver,
  onOpenDashboard,
  isViewingDashboard,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 dark:bg-[#141B22]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-teal-800 shadow-sm">
            <svg viewBox="0 0 512 512" className="h-7 w-7" aria-hidden="true">
              <circle cx="256" cy="256" r="180" fill="#0f766e" opacity="0.4" />
              <g transform="translate(256, 260) scale(1.15)">
                <path d="M0,-110 C25,-60 30,-20 0,30 C-30,-20 -25,-60 0,-110 Z" fill="#fef3c7" />
                <path d="M-15,-30 C-75,-40 -110,10 -80,60 C-45,80 -10,65 0,30 C-5,5 -10,-15 -15,-30 Z" fill="#99f6e4" opacity="0.9" />
                <path d="M15,-30 C75,-40 110,10 80,60 C45,80 10,65 0,30 C5,5 10,-15 15,-30 Z" fill="#99f6e4" opacity="0.9" />
                <path d="M-90,50 C-60,110 60,110 90,50 C40,80 -40,80 -90,50 Z" fill="#f59e0b" />
              </g>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif-heading tracking-tight text-teal-950 dark:text-teal-50">
                CognitiveSaathi
              </h1>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 hidden sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Center/Status indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectivityBadge
            status={connectivity}
            lang={lang}
            onSyncTrigger={onSyncTrigger}
          />
          <PWAInstallButton />
        </div>

        {/* Right side accessibility & role controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Voice Assistant launcher button */}
          <button
            id="voice-assistant-launcher-btn"
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-stone-900 hover:bg-amber-400 font-medium text-xs sm:text-sm shadow-xs transition active:scale-95"
            aria-label="Open Voice Assistant"
            title="Voice guidance & assistance"
          >
            <Mic className="w-4 h-4 text-stone-900" />
            <span className="font-semibold hidden sm:inline">Voice</span>
          </button>

          {/* Voice Pack & Clarity Button */}
          {onOpenVoicePack && (
            <button
              onClick={onOpenVoicePack}
              className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition"
              title="Voice Clarity & Sound Packs"
              aria-label="Download Voice Pack"
            >
              <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            </button>
          )}

          {/* Dark / Light Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>
          )}

          {/* Text Scaler for elderly vision comfort */}
          <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-full bg-white dark:bg-[#1A222C] px-1.5 py-0.5" title="Reading text size">
            <Type className="w-3.5 h-3.5 text-stone-400 mr-1 hidden sm:inline" />
            <button
              onClick={() => onTextScaleChange('normal')}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                textScale === 'normal' ? 'bg-teal-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
              aria-label="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => onTextScaleChange('large')}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                textScale === 'large' ? 'bg-teal-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
              aria-label="Large text size"
            >
              A+
            </button>
            <button
              onClick={() => onTextScaleChange('extralarge')}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                textScale === 'extralarge' ? 'bg-teal-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
              aria-label="Extra large text size"
            >
              A++
            </button>
          </div>

          {/* Language selector with clean accessible custom popover */}
          <LanguageDropdown
            currentLang={lang}
            onSelectLang={onLangChange}
          />

          {/* If Caregiver/Staff mode: show role toggle between Caregiver and Healthcare Worker portals */}
          {currentRole !== 'PATIENT' && (
            <div className="flex items-center gap-1.5">
              {/* Staff toggle between Caregiver and Healthcare Worker portals */}
              <div className="flex items-center bg-stone-200/70 dark:bg-stone-800 p-0.5 rounded-full text-xs font-medium">
                <button
                  onClick={() => onRoleChange('CAREGIVER')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                    currentRole === 'CAREGIVER'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="Caregiver Portal"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span className="hidden md:inline">Caregiver</span>
                </button>
                <button
                  onClick={() => onRoleChange('HEALTHCARE_WORKER')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                    currentRole === 'HEALTHCARE_WORKER'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="Health Worker View"
                >
                  <HeartPulse className="w-3 h-3" />
                  <span className="hidden md:inline">Health</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout / Switch User Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-full transition"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
