import React, { useState } from 'react';
import { ShieldCheck, UserPlus, X, Phone, Heart, Check, Trash2, KeyRound, User, AlertCircle } from 'lucide-react';
import { PatientProfile, CaretakerProfile, LanguageCode } from '../../types';
import { OfflineStore } from '../../lib/offlineStore';

interface SelectOrAddCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onCaregiverLinked: (updatedPatient: PatientProfile) => void;
  lang?: LanguageCode;
}

export const SelectOrAddCaregiverModal: React.FC<SelectOrAddCaregiverModalProps> = ({
  isOpen,
  onClose,
  patient,
  onCaregiverLinked,
}) => {
  const [activeTab, setActiveTab] = useState<'KEY' | 'MANUAL'>('KEY');

  // Key Input State
  const [caregiverKeyInput, setCaregiverKeyInput] = useState('');

  // Manual Caregiver Form State
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('Daughter');
  const [customRelation, setCustomRelation] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle linking via Caregiver's unique Key
  const handleLinkByKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const cleanKey = caregiverKeyInput.trim().toUpperCase();
    if (!cleanKey) {
      setError('Please enter your caregiver’s unique key (e.g., CG-CARE88).');
      setIsLoading(false);
      return;
    }

    try {
      const result = await OfflineStore.linkPatientToCaregiverByKeyAsync(patient.id, cleanKey);
      setIsLoading(false);
      if (!result.success || !result.patient) {
        setError(result.error || 'Caregiver key not found. Please verify with your caregiver.');
        return;
      }

      setSuccess(`Successfully linked with ${result.caretaker?.fullName || 'caregiver'}!`);
      onCaregiverLinked(result.patient);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to link caregiver. Please try again.');
    }
  };

  // Handle manual caregiver creation & linking
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError('Please enter the caregiver full name.');
      return;
    }
    const phoneDigits = phone.trim().replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('91') && phoneDigits.length === 12 ? phoneDigits.slice(2) : phoneDigits;
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      setError('Caregiver phone number must have actually 10 digits.');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setError('Please set a password of at least 4 characters.');
      return;
    }

    const resolvedRelation = relation === 'Other' ? (customRelation.trim() || 'Caregiver') : relation;
    const newCaretakerId = `caretaker-${Date.now()}`;
    const generatedKey = OfflineStore.generateCaregiverKey();

    const newCaretaker: CaretakerProfile = {
      id: newCaretakerId,
      fullName: fullName.trim(),
      username: fullName.trim().toLowerCase().replace(/\s+/g, ''),
      password: password.trim(),
      relation: resolvedRelation,
      phone: normalizedPhone,
      email: email.trim(),
      pin: password.trim(),
      caregiverKey: generatedKey,
      assignedPatientIds: [patient.id],
      avatarUrl: '',
    };

    OfflineStore.addCaretaker(newCaretaker);

    const updatedPatient: PatientProfile = {
      ...patient,
      caregiverName: `${fullName.trim()} (${resolvedRelation})`,
      caregiverPhone: phone.trim(),
      linkedCaregiverKey: generatedKey,
      hasCaregiver: true,
    };

    OfflineStore.savePatient(updatedPatient);
    setSuccess(`Caregiver ${fullName.trim()} created & linked! (Caregiver Key: ${generatedKey})`);
    onCaregiverLinked(updatedPatient);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSetSelfCare = () => {
    OfflineStore.unlinkCaregiver(patient.id);
    const updatedPatient: PatientProfile = {
      ...patient,
      caregiverName: '',
      caregiverPhone: patient.phone || '',
      linkedCaregiverKey: undefined,
      hasCaregiver: false,
    };
    OfflineStore.savePatient(updatedPatient);
    onCaregiverLinked(updatedPatient);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-caregiver-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-lg my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                Support Network
              </span>
              <h2 id="select-caregiver-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Link Caregiver
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Linked Status */}
        {patient.hasCaregiver && patient.caregiverName ? (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Currently Connected Caregiver
              </div>
              <div className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                {patient.caregiverName}
              </div>
              {patient.linkedCaregiverKey && (
                <div className="text-xs font-mono font-semibold text-teal-900 dark:text-teal-200 mt-0.5">
                  Caregiver Key: {patient.linkedCaregiverKey}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSetSelfCare}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 shrink-0 cursor-pointer"
              title="Unlink caregiver"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Unlink</span>
            </button>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Your caregiver has a unique key on their dashboard. Enter their key to connect your profiles.
          </p>
        )}

        {/* Mode Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab('KEY');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 pb-3 font-bold text-xs flex items-center justify-center gap-2 border-b-2 cursor-pointer transition ${
              activeTab === 'KEY'
                ? 'border-teal-800 text-teal-900 dark:text-teal-300 dark:border-teal-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Enter Caregiver Key</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('MANUAL');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 pb-3 font-bold text-xs flex items-center justify-center gap-2 border-b-2 cursor-pointer transition ${
              activeTab === 'MANUAL'
                ? 'border-teal-800 text-teal-900 dark:text-teal-300 dark:border-teal-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Caregiver Manually</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Enter Caregiver Key */}
        {activeTab === 'KEY' && (
          <form onSubmit={handleLinkByKey} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label htmlFor="caregiver-key-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Caregiver's Unique Key *
              </label>
              <div className="relative">
                <input
                  id="caregiver-key-input"
                  type="text"
                  required
                  placeholder="e.g. CG-CARE88"
                  value={caregiverKeyInput}
                  onChange={(e) => setCaregiverKeyInput(e.target.value.toUpperCase())}
                  className="w-full p-3 pl-10 rounded-xl border border-stone-300 dark:border-stone-600 text-sm font-mono font-bold tracking-wider text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Your caregiver can find their unique key at the top of their Caregiver Dashboard.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={handleSetSelfCare}
                className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-semibold underline transition cursor-pointer"
              >
                Living Independently (Self-Care)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Connect Caregiver</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Manual Registration */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label htmlFor="caregiver-name" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Caregiver Full Name *
              </label>
              <input
                id="caregiver-name"
                type="text"
                required
                placeholder="e.g. Debashree Gogoi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="caregiver-relation" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Relationship *
                </label>
                <select
                  id="caregiver-relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Granddaughter">Granddaughter</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Nurse / Attendant">Nurse / Attendant</option>
                  <option value="Other">Other / Custom</option>
                </select>
              </div>

              {relation === 'Other' && (
                <div className="space-y-1">
                  <label htmlFor="caregiver-custom-relation" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    Specify Relationship *
                  </label>
                  <input
                    id="caregiver-custom-relation"
                    type="text"
                    placeholder="e.g. Niece"
                    value={customRelation}
                    onChange={(e) => setCustomRelation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="caregiver-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Phone Number *
                </label>
                <input
                  id="caregiver-phone"
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="caregiver-email" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Email Address (Optional)
                </label>
                <input
                  id="caregiver-email"
                  type="email"
                  placeholder="caregiver@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="caregiver-pw" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Password (for caregiver login) *
                </label>
                <input
                  id="caregiver-pw"
                  type="password"
                  required
                  minLength={4}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={handleSetSelfCare}
                className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-semibold underline transition cursor-pointer"
              >
                No caregiver (Self-Care)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Create & Link</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
