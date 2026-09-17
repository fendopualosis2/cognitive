import React, { useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { OfflineStore } from '../../lib/offlineStore';
import { PatientProfile } from '../../types';

interface LinkPatientKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerId?: string;
  onPatientLinked: (patient: PatientProfile) => void;
}

export const LinkPatientKeyModal: React.FC<LinkPatientKeyModalProps> = ({
  isOpen,
  onClose,
  caretakerId,
  onPatientLinked,
}) => {
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmed = patientIdentifier.trim();
    if (!trimmed) {
      setError('Please enter the Patient Key, Mobile Number, or Username.');
      setIsLoading(false);
      return;
    }

    const currentCaretakerId = caretakerId || OfflineStore.getActiveCaretakerId() || 'caretaker-1';
    try {
      const result = await OfflineStore.linkCaregiverToPatientByKeyAsync(currentCaretakerId, trimmed);
      setIsLoading(false);

      if (!result.success || !result.patient) {
        setError(result.error || 'No patient found with that key, mobile number, or username.');
        return;
      }

      onPatientLinked(result.patient);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to link patient. Please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-patient-key-title"
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
                Patient Linking
              </span>
              <h2 id="link-patient-key-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Link Existing Patient
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

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          Enter the patient’s <strong>Patient Key (e.g. PT-XXXX)</strong>, <strong>Mobile Number</strong>, or <strong>Username</strong> to instantly connect their profile to your caregiver dashboard:
        </p>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLink} autoComplete="off" className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="patient-key-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Patient Key, Mobile Number, or Username:
            </label>
            <input
              id="patient-key-input"
              type="text"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck="false"
              value={patientIdentifier}
              onChange={(e) => setPatientIdentifier(e.target.value)}
              placeholder="e.g. PT-RAME68 or 9876543210"
              className="w-full p-3 rounded-2xl border border-stone-300 dark:border-stone-600 font-mono font-bold tracking-wider text-base text-stone-900 dark:text-stone-100 uppercase focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-2 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Connecting...' : 'Link Patient Now'}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
