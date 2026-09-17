import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Heart,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Calendar,
  Type,
  Volume2,
  Eye,
  LogOut,
  Edit3,
  UserPlus,
  Trash2,
  AlertTriangle,
  Camera,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import { PatientProfile, LanguageCode, TextScale } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { EditPatientProfileModal } from './EditPatientProfileModal';
import { SelectOrAddCaregiverModal } from './SelectOrAddCaregiverModal';
import { ElderAvatar } from '../common/ElderAvatar';

interface PatientMeProfileProps {
  patient: PatientProfile;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenCaregiverDashboard?: () => void;
  onUpdatePatient: (updated: PatientProfile) => void;
  onDeletePatient?: (id: string) => void;
  onLogout: () => void;
  completedRoutineCount: number;
  totalRoutineCount: number;
}

export const PatientMeProfile: React.FC<PatientMeProfileProps> = ({
  patient,
  lang,
  onLangChange,
  textScale,
  onTextScaleChange,
  voiceEnabled,
  onToggleVoice,
  highContrast,
  onToggleHighContrast,
  onUpdatePatient,
  onDeletePatient,
  onLogout,
  completedRoutineCount,
  totalRoutineCount,
}) => {
  const t = translations[lang];
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSelectCaregiverOpen, setIsSelectCaregiverOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPatientKey, setCopiedPatientKey] = useState(false);
  const [isEditingPatientKey, setIsEditingPatientKey] = useState(false);
  const [customPatientKeyInput, setCustomPatientKeyInput] = useState('');
  const [patientKeyError, setPatientKeyError] = useState<string | null>(null);
  const [patientKeySuccess, setPatientKeySuccess] = useState<string | null>(null);

  const hasCaregiver = Boolean(patient.caregiverName && patient.caregiverName !== 'Self' && patient.hasCaregiver !== false);

  const handleSavePatientKey = () => {
    setPatientKeyError(null);
    setPatientKeySuccess(null);
    const clean = customPatientKeyInput.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setPatientKeyError('Patient key must be at least 3 characters.');
      return;
    }
    const res = OfflineStore.updatePatientKey(patient.id, clean);
    if (!res.success) {
      setPatientKeyError(res.error || 'Failed to update patient key.');
      return;
    }
    if (res.patient) {
      onUpdatePatient(res.patient);
    }
    setPatientKeySuccess(`Your Patient Key is now "${clean}"!`);
    setIsEditingPatientKey(false);
    setTimeout(() => setPatientKeySuccess(null), 3000);
  };

  const handleCopyCaregiverKey = () => {
    const key = patient.linkedCaregiverKey || '';
    if (key && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyPatientKey = () => {
    const key = patient.patientKey || `PT-${patient.id.slice(0, 6).toUpperCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedPatientKey(true);
      setTimeout(() => setCopiedPatientKey(false), 2000);
    }
  };

  const handleUnlinkCaregiver = () => {
    const updated = {
      ...patient,
      caregiverName: 'Self',
      caregiverPhone: '',
      hasCaregiver: false,
    };
    onUpdatePatient(updated);
  };

  const handleDeleteConfirmed = () => {
    if (onDeletePatient) {
      onDeletePatient(patient.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-10 animate-fadeIn">
      {/* 1. Amma's Profile Header Card */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group shrink-0">
            <ElderAvatar
              name={patient.preferredName || patient.fullName}
              avatarUrl={patient.avatarUrl}
              size="2xl"
              className="border-4 border-amber-300 shadow-md"
            />
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md border-2 border-teal-900 transition active:scale-95"
              title="Change or upload my photo"
              aria-label="Change or upload my photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>Patient Profile</span>
              </div>

              {!hasCaregiver && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-semibold">
                  Independent Self-Care
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
                  {patient.preferredName || patient.fullName}
                </h2>
                <p className="text-teal-100 text-xs sm:text-sm">
                  {patient.fullName !== patient.preferredName && `(${patient.fullName}) • `}
                  {patient.age} years old • {patient.region}
                </p>
              </div>

              {/* Edit Details Button (For patient or independent elder) */}
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="self-center sm:self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-800 hover:bg-teal-700 text-amber-300 border border-teal-600 text-xs font-bold transition shadow-xs"
                title="Edit your name, age, state, or self-care status"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit My Details</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-teal-800/90 text-amber-300 font-semibold border border-teal-700">
                ✨ {patient.dailyStreak} Day Active Streak
              </span>
              <span className="px-3 py-1 rounded-xl bg-teal-800/90 text-teal-100 border border-teal-700">
                {hasCaregiver ? `Caregiver: ${patient.caregiverName}` : 'Self-Care Mode (No Caregiver)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Gentle Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <Sparkles className="w-6 h-6 mx-auto text-amber-500" />
          <span className="text-2xl font-bold text-stone-900 block">
            {patient.todayCompletedCount}
          </span>
          <span className="text-xs text-stone-600 font-medium block">
            Cognitive Activities
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
          <span className="text-2xl font-bold text-stone-900 block">
            {completedRoutineCount}/{totalRoutineCount}
          </span>
          <span className="text-xs text-stone-600 font-medium block">
            Daily Routines Done
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-5 bg-white rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <Calendar className="w-6 h-6 mx-auto text-teal-700" />
          <span className="text-2xl font-bold text-stone-900 block">
            Day {patient.dailyStreak}
          </span>
          <span className="text-xs text-stone-600 font-medium block">
            Streak with Family
          </span>
        </div>
      </div>

      {/* 2b. Patient's Unique Key Card (to share with Caregivers) */}
      <div className="rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
                Patient Unique Key
              </span>
            </div>
            <h3 className="text-lg font-bold font-serif-heading text-stone-900 dark:text-stone-100">
              Your Personal Care Key
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-lg leading-relaxed">
              Share this key with your family member or caregiver so they can link your account to their Caregiver Dashboard. You can also set a custom key of your own choice.
            </p>
            <div className="pt-2">
              {!isEditingPatientKey ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border-2 border-amber-400 dark:border-amber-600 font-mono text-xl font-black tracking-widest text-amber-900 dark:text-amber-300 shadow-2xs">
                    {patient.patientKey || `PT-${patient.id.slice(0, 6).toUpperCase()}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPatientKey}
                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition flex items-center gap-2 shadow-xs active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copiedPatientKey ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Patient Key</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPatientKeyInput(patient.patientKey || `PT-${patient.id.slice(0, 6).toUpperCase()}`);
                      setIsEditingPatientKey(true);
                      setPatientKeyError(null);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Set / Edit My Key</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customPatientKeyInput}
                    onChange={(e) => setCustomPatientKeyInput(e.target.value.toUpperCase())}
                    placeholder="e.g. PT-DAD72, AMMA-KEY"
                    className="px-3 py-2 rounded-xl border-2 border-amber-500 font-mono text-xs font-bold bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomPatientKeyInput(`PT-${Math.floor(100000 + Math.random() * 900000)}`)
                    }
                    className="px-2.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-950 dark:text-amber-200 text-xs font-bold border border-amber-300"
                  >
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePatientKey}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPatientKey(false);
                      setPatientKeyError(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {patientKeyError && <p className="text-xs text-rose-600 font-bold mt-1.5">{patientKeyError}</p>}
              {patientKeySuccess && <p className="text-xs text-emerald-600 font-bold mt-1.5">{patientKeySuccess}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Caregiver Support Card & Add/Select Caregiver Option */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">
                {hasCaregiver ? 'Linked Caregiver' : 'Support Status'}
              </span>
              <h4 className="text-lg font-bold text-stone-900">
                {hasCaregiver ? patient.caregiverName : 'Living Independently (Self-Care)'}
              </h4>
              <p className="text-xs text-stone-500 font-mono">
                {hasCaregiver ? patient.caregiverPhone : 'No caregiver required'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {hasCaregiver && patient.caregiverPhone && (
              <a
                href={`tel:${patient.caregiverPhone.replace(/\s+/g, '')}`}
                className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Caregiver</span>
              </a>
            )}

            {/* Select / Add Caregiver button */}
            <button
              type="button"
              onClick={() => setIsSelectCaregiverOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 border border-stone-200 shadow-2xs shrink-0"
              title="Select or add a caregiver to your profile"
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-800" />
              <span>{hasCaregiver ? 'Change Caregiver' : '+ Add Caregiver'}</span>
            </button>

            {hasCaregiver && (
              <button
                type="button"
                onClick={handleUnlinkCaregiver}
                className="px-3 py-2.5 rounded-2xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition flex items-center gap-1 shrink-0"
                title="Unlink caregiver from this profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unlink</span>
              </button>
            )}
          </div>
        </div>

        {/* Unique Caregiver Key section */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
              <KeyRound className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Linked Caregiver Key</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {patient.linkedCaregiverKey
                ? 'Your profile is securely linked to this Caregiver Key:'
                : 'Connect with your caregiver by entering their unique Caregiver Key:'}
            </p>
            <div className="text-base font-mono font-bold tracking-widest text-teal-950 dark:text-teal-100 pt-0.5">
              {patient.linkedCaregiverKey || 'Not Linked Yet'}
            </div>
          </div>

          {patient.linkedCaregiverKey ? (
            <button
              type="button"
              onClick={handleCopyCaregiverKey}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSelectCaregiverOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Enter Key</span>
            </button>
          )}
        </div>

        {!hasCaregiver && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            💡 Living independently? You can use CognitiveSaathi peacefully on your own, or link a family member anytime by clicking <strong>Add Caregiver</strong>.
          </div>
        )}
      </div>

      {/* 4. Accessibility Adjustments (Text size, contrast, voice) */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Type className="w-4 h-4 text-teal-800" />
          <span>Display & Sound Comfort</span>
        </h4>

        {/* Text Scaling */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 block">
            Reading Text Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onTextScaleChange('normal')}
              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                textScale === 'normal'
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Normal (16px)
            </button>
            <button
              onClick={() => onTextScaleChange('large')}
              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                textScale === 'large'
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Large (18px)
            </button>
            <button
              onClick={() => onTextScaleChange('extralarge')}
              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                textScale === 'extralarge'
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Extra Large (20px)
            </button>
          </div>
        </div>

        {/* High Contrast & Voice Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-stone-800">High Contrast</span>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                highContrast ? 'bg-teal-800' : 'bg-stone-300'
              }`}
              aria-label="Toggle high contrast"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-stone-800">Voice Prompts</span>
            </div>
            <button
              onClick={onToggleVoice}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                voiceEnabled ? 'bg-teal-800' : 'bg-stone-300'
              }`}
              aria-label="Toggle voice prompts"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Account & Privacy Management (Delete Account) */}
      <div className="rounded-3xl bg-rose-50/60 border border-rose-200/70 p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-700" />
              <span>Delete Profile & Account</span>
            </h4>
            <p className="text-xs text-rose-800/80 mt-1 max-w-lg">
              Permanently remove this profile, daily streak history, and personal reminders from this device.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* 6. Switch User / Logout Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-sm font-semibold transition shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-stone-500" />
          <span>Switch User / Back to Login Screen</span>
        </button>
      </div>

      {/* Confirmation Modal for Delete Account */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                Delete This Profile?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete the profile for <strong>{patient.fullName}</strong>? All local routine records and activity logs will be permanently erased.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  handleDeleteConfirmed();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      <EditPatientProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        patient={patient}
        onSave={(updated) => {
          onUpdatePatient(updated);
        }}
        lang={lang}
      />

      {/* Select / Add Caregiver Modal */}
      <SelectOrAddCaregiverModal
        isOpen={isSelectCaregiverOpen}
        onClose={() => setIsSelectCaregiverOpen(false)}
        patient={patient}
        onCaregiverLinked={(updated) => {
          onUpdatePatient(updated);
        }}
        lang={lang}
      />
    </div>
  );
};
