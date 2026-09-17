import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Delete, X, AlertCircle, KeyRound } from 'lucide-react';
import { OfflineStore } from '../../lib/offlineStore';
import { LanguageCode } from '../../types';

interface CaregiverPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: LanguageCode;
  targetRoleName?: string;
}

export const CaregiverPinModal: React.FC<CaregiverPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetRoleName = 'Caregiver Portal',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsShaking(false);
    }
  }, [isOpen]);

  // Support direct keyboard number input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleVerify(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleVerify = (pinToTest = pin) => {
    const expectedPin = OfflineStore.getCaregiverPin();
    if (pinToTest === expectedPin) {
      setError(null);
      onSuccess();
    } else {
      setIsShaking(true);
      setError('Incorrect Security PIN. Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-pin-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className={`w-full max-w-sm rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-6 transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Header with lock badge and close button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Elder-Safe Lock
                </span>
              </div>
              <h2 id="caregiver-pin-title" className="text-lg font-bold text-stone-900 font-serif-heading">
                Caregiver Security Gate
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close Security Gate"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative description */}
        <p className="text-xs text-stone-600 leading-relaxed">
          The patient view is locked in safe kiosk mode to prevent accidental changes to routines, medications, or reports. Enter your 4-digit caregiver PIN to access the <strong>{targetRoleName}</strong>.
        </p>

        {/* PIN Digit Indicators */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center justify-center gap-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-teal-800 scale-125 ring-4 ring-teal-100'
                      : 'border-2 border-stone-300 bg-stone-100'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-stone-50 hover:bg-teal-50 active:bg-teal-100 text-stone-800 hover:text-teal-900 border border-stone-200 text-xl font-bold font-mono transition shadow-2xs active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition active:scale-95 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-stone-50 hover:bg-teal-50 active:bg-teal-100 text-stone-800 hover:text-teal-900 border border-stone-200 text-xl font-bold font-mono transition shadow-2xs active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition active:scale-95 flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Stay in Patient Mode
          </button>
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={pin.length !== 4}
            className="flex-1 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
