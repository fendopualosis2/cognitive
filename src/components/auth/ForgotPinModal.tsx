import React, { useState } from 'react';
import { ShieldCheck, Phone, KeyRound, CheckCircle2, AlertTriangle, X, Lock, ArrowRight } from 'lucide-react';
import { OfflineStore } from '../../lib/offlineStore';
import { PatientProfile, LanguageCode } from '../../types';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: LanguageCode;
  onSuccess: (message: string) => void;
}

export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'LOOKUP' | 'VERIFY_OTP' | 'RESET_PIN'>('LOOKUP');
  const [identifier, setIdentifier] = useState('');
  const [matchedPatient, setMatchedPatient] = useState<PatientProfile | null>(null);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const term = identifier.trim().toLowerCase();
    if (!term) {
      setError('Please enter your full name, username, or phone number.');
      return;
    }

    const cleanDigits = identifier.replace(/\D/g, '');
    const allPatients = OfflineStore.getPatients();

    const target = allPatients.find((p) => {
      const nameMatch = p.fullName.toLowerCase() === term || (p.preferredName || '').toLowerCase() === term;
      const userMatch = (p.username || '').toLowerCase() === term;
      const phoneDigits = (p.phone || '').replace(/\D/g, '');
      const phoneMatch = cleanDigits.length >= 7 && phoneDigits.endsWith(cleanDigits);
      return nameMatch || userMatch || phoneMatch;
    });

    if (!target) {
      setError('No patient profile found matching that information. Please check the spelling or ask your caregiver.');
      return;
    }

    setMatchedPatient(target);
    setStep('VERIFY_OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simulated OTP verification for dementia patient recovery via caregiver phone
    if (otp.trim() !== '4821') {
      setError('Invalid verification code. Please enter the 4-digit code shown in the demo simulation.');
      return;
    }

    setStep('RESET_PIN');
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPin.trim() || newPin.trim().length < 4) {
      setError('Password/PIN must be at least 4 characters long.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!matchedPatient) return;

    OfflineStore.resetPatientPassword(matchedPatient.id, newPin.trim());
    onSuccess(`PIN successfully updated for ${matchedPatient.preferredName || matchedPatient.fullName}! You can now log in.`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-pin-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-md my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                Patient Account Security
              </span>
              <h2 id="forgot-pin-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Reset Patient PIN / Password
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Identify Patient */}
        {step === 'LOOKUP' && (
          <form onSubmit={handleLookup} className="space-y-4">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              If an elder cannot recall their PIN, verification is routed to their registered family caregiver for peace of mind.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="patient-id-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Elder's Full Name, Username, or Phone Number
              </label>
              <input
                id="patient-id-input"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. Ramesh Sharma or ramesh"
                className="w-full p-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Find Account & Send Reset Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Caregiver OTP Verification */}
        {step === 'VERIFY_OTP' && matchedPatient && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs space-y-1">
              <div className="font-bold text-teal-900 dark:text-teal-200">
                Account: {matchedPatient.fullName}
              </div>
              {matchedPatient.hasCaregiver && matchedPatient.caregiverPhone ? (
                <div className="text-teal-800 dark:text-teal-300">
                  Verification dispatched to linked caregiver:{' '}
                  <strong>{matchedPatient.caregiverName} ({matchedPatient.caregiverPhone})</strong>
                </div>
              ) : (
                <div className="text-teal-800 dark:text-teal-300">
                  Verification dispatched to elder's registered mobile:{' '}
                  <strong>{matchedPatient.phone || 'Elder Direct Phone'}</strong>
                </div>
              )}
            </div>

            {/* Clearly labeled demo flow badge */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-mono">
              [Demo Flow — Simulated SMS Gateway for Evaluators]
              <div className="font-bold mt-1 text-stone-900 dark:text-amber-100">
                Temporary Verification Code: <span className="text-teal-800 dark:text-amber-300 text-sm font-bold">4821</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="otp-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Enter 4-Digit Verification Code
              </label>
              <input
                id="otp-input"
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="4821"
                className="w-full p-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-center tracking-widest text-lg font-bold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('LOOKUP')}
                className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Verify Code</span>
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password / PIN */}
        {step === 'RESET_PIN' && (
          <form onSubmit={handleResetPin} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="new-pin-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  New Password or 4-Digit PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="new-pin-input"
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new PIN"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-pin-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Confirm New Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirm-pin-input"
                    type="password"
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-enter new PIN"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Save New Password & Finish</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
