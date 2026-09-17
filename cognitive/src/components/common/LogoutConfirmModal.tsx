import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../../types';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  userName?: string;
  lang?: LanguageCode;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                Sign Out
              </span>
              <h2 id="logout-dialog-title" className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Confirm Log Out
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Are you sure you want to log out{userName ? `, ${userName}` : ''}? All your daily streak progress, completed routines, and memories are safely preserved on this device.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Stay Logged In
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
