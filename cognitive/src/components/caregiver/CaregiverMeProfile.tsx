import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  KeyRound,
  Copy,
  Check,
  Edit3,
  UserPlus,
  Link as LinkIcon,
  Users,
  Sun,
  Moon,
  Eye,
  LogOut,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Volume2,
  Sparkles,
  Heart,
  Globe,
  Trash2,
} from 'lucide-react';
import { CaretakerProfile, PatientProfile, LanguageCode, TextScale } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { ElderAvatar } from '../common/ElderAvatar';

interface CaregiverMeProfileProps {
  caretaker: CaretakerProfile | null;
  onUpdateCaretaker: (updated: CaretakerProfile) => void;
  patients: PatientProfile[];
  activePatientId: string;
  onSelectPatient: (patient: PatientProfile) => void;
  onOpenAddPatient: () => void;
  onViewPatientDetail: (patient: PatientProfile) => void;
  onUnlinkPatient?: (patientId: string) => void;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  textScale?: TextScale;
  onTextScaleChange?: (scale: TextScale) => void;
  onLogout: () => void;
  onOpenVoicePack?: () => void;
}

export const CaregiverMeProfile: React.FC<CaregiverMeProfileProps> = ({
  caretaker,
  onUpdateCaretaker,
  patients,
  activePatientId,
  onSelectPatient,
  onOpenAddPatient,
  onViewPatientDetail,
  onUnlinkPatient,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
  highContrast,
  onToggleHighContrast,
  textScale = 'normal',
  onTextScaleChange,
  onLogout,
  onOpenVoicePack,
}) => {
  const t = translations[lang];

  // Key editing state
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(caretaker?.caregiverKey || 'CG-CARE88');
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);

  // Link Patient by Key state
  const [isLinkingPatient, setIsLinkingPatient] = useState(false);
  const [patientLinkInput, setPatientLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Edit Caregiver Profile modal/form
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(caretaker?.fullName || '');
  const [editPhone, setEditPhone] = useState(caretaker?.phone || '');
  const [editEmail, setEditEmail] = useState(caretaker?.email || '');
  const [editRelation, setEditRelation] = useState(caretaker?.relation || 'Family Caregiver');
  const [editPin, setEditPin] = useState(caretaker?.pin || '1234');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  // Unlink confirmation
  const [unlinkingPatientId, setUnlinkingPatientId] = useState<string | null>(null);

  const handleSaveCaregiverKey = () => {
    if (!caretaker) return;
    setKeyError(null);
    setKeySuccess(null);

    const clean = customKeyInput.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setKeyError('Caregiver Key must be at least 3 characters long.');
      return;
    }

    const res = OfflineStore.updateCaregiverKey(caretaker.id, clean);
    if (!res.success) {
      setKeyError(res.error || 'Failed to update Caregiver Key.');
      return;
    }

    if (res.caretaker) {
      onUpdateCaretaker(res.caretaker);
    }
    setKeySuccess(`Your Caregiver Key has been updated to "${clean}"!`);
    setIsEditingKey(false);
    setTimeout(() => setKeySuccess(null), 3500);
  };

  const handleLinkPatient = () => {
    if (!caretaker) return;
    setLinkError(null);
    setLinkSuccess(null);

    const clean = patientLinkInput.trim();
    if (!clean) {
      setLinkError('Please enter a Patient Key (PT-XXXX), username, or phone number.');
      return;
    }

    const res = OfflineStore.linkCaregiverToPatientByKey(caretaker.id, clean);
    if (!res.success) {
      setLinkError(res.error || 'No matching patient found.');
      return;
    }

    if (res.patient) {
      setLinkSuccess(`Successfully connected ${res.patient.fullName} to your care circle!`);
      setPatientLinkInput('');
      setIsLinkingPatient(false);
      onSelectPatient(res.patient);
      setTimeout(() => setLinkSuccess(null), 3500);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caretaker) return;

    const updated: CaretakerProfile = {
      ...caretaker,
      fullName: editName.trim() || caretaker.fullName,
      phone: editPhone.trim() || caretaker.phone,
      email: editEmail.trim(),
      relation: editRelation.trim() || caretaker.relation,
      pin: editPin.trim() || caretaker.pin,
    };

    OfflineStore.addCaretaker(updated);
    onUpdateCaretaker(updated);
    setIsEditProfileOpen(false);
    setProfileSaveSuccess('Profile details saved successfully.');
    setTimeout(() => setProfileSaveSuccess(null), 3000);
  };

  const handleConfirmUnlink = (patientId: string) => {
    OfflineStore.unlinkCaregiver(patientId);
    if (onUnlinkPatient) {
      onUnlinkPatient(patientId);
    }
    setUnlinkingPatientId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Notifications */}
      {keySuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{keySuccess}</span>
        </div>
      )}

      {profileSaveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{profileSaveSuccess}</span>
        </div>
      )}

      {linkSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{linkSuccess}</span>
        </div>
      )}

      {/* 1. CAREGIVER PROFILE IDENTITY HERO */}
      <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-teal-800 dark:bg-teal-700 text-teal-100 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 border-teal-600/40 shrink-0">
              {caretaker?.fullName ? caretaker.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-serif-heading text-stone-900 dark:text-stone-100">
                  {caretaker?.fullName || 'Caregiver Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 text-xs font-bold">
                  {caretaker?.relation || 'Primary Caregiver'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 flex flex-wrap items-center gap-3">
                {caretaker?.username && <span>@{caretaker.username}</span>}
                {caretaker?.phone && (
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                    <Phone className="w-3.5 h-3.5" />
                    {caretaker.phone}
                  </span>
                )}
                {caretaker?.email && (
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                    <Mail className="w-3.5 h-3.5" />
                    {caretaker.email}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="edit-caregiver-profile-btn"
            onClick={() => {
              setEditName(caretaker?.fullName || '');
              setEditPhone(caretaker?.phone || '');
              setEditEmail(caretaker?.email || '');
              setEditRelation(caretaker?.relation || 'Family Caregiver');
              setEditPin(caretaker?.pin || '1234');
              setIsEditProfileOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold transition border border-stone-300 dark:border-stone-700 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. CAREGIVER KEY MANAGEMENT */}
      <div className="rounded-3xl bg-linear-to-br from-teal-900 to-teal-950 text-white p-6 sm:p-8 shadow-sm border border-teal-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800/80 border border-teal-600/60 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif-heading">Your Caregiver Key</h2>
              <p className="text-xs text-teal-200/90">
                Give this key to your patients so they can link directly to your caregiver account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="copy-caregiver-key-btn"
              onClick={() => {
                if (navigator.clipboard && caretaker?.caregiverKey) {
                  navigator.clipboard.writeText(caretaker.caregiverKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-teal-600/70 shadow-xs"
            >
              {copiedKey ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-teal-200" />
                  <span>Copy Key</span>
                </>
              )}
            </button>

            {!isEditingKey && (
              <button
                type="button"
                id="edit-caregiver-key-btn"
                onClick={() => {
                  setCustomKeyInput(caretaker?.caregiverKey || 'CG-CARE88');
                  setIsEditingKey(true);
                  setKeyError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-amber-900" />
                <span>Change Key</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Display or Edit Mode */}
        {!isEditingKey ? (
          <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Active Key:</span>
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-300 tracking-wider bg-teal-900/90 px-3 py-1 rounded-xl border border-teal-600/80">
                {caretaker?.caregiverKey || 'CG-CARE88'}
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 max-w-sm">
              Patients enter this key in their <strong>Patient Me</strong> tab under "Caregiver Link".
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-teal-950/90 border border-teal-600 space-y-3">
            <label className="text-xs font-bold text-amber-300 block">
              Set Your Custom Caregiver Key (minimum 3 letters/numbers):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                id="custom-caregiver-key-input"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value.toUpperCase())}
                placeholder="e.g. CG-CARE88, MOM-CARE"
                className="px-3.5 py-2 rounded-xl border border-teal-400 font-mono text-sm font-bold bg-white text-stone-900 uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={() =>
                  setCustomKeyInput(`CG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                }
                className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-bold border border-teal-600 cursor-pointer"
              >
                🎲 Random
              </button>
              <button
                type="button"
                id="save-caregiver-key-btn"
                onClick={handleSaveCaregiverKey}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Key
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingKey(false);
                  setKeyError(null);
                }}
                className="px-3 py-2 rounded-xl bg-teal-900 hover:bg-teal-950 text-teal-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
            {keyError && (
              <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {keyError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. PATIENTS UNDER HIM (CARE CIRCLE) */}
      <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Patients Under Your Care ({patients.length})
              </h2>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Manage elderly profiles linked to your caregiver account
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="link-patient-by-key-btn"
              onClick={() => {
                setIsLinkingPatient(!isLinkingPatient);
                setLinkError(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-900 dark:text-teal-200 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <LinkIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Link Patient by Key</span>
            </button>

            <button
              type="button"
              id="add-new-patient-btn"
              onClick={onOpenAddPatient}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register Patient</span>
            </button>
          </div>
        </div>

        {/* Link Patient by Key Inline Form */}
        {isLinkingPatient && (
          <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Link Patient by Key, Phone, or Username
              </span>
              <button
                type="button"
                onClick={() => setIsLinkingPatient(false)}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={patientLinkInput}
                onChange={(e) => setPatientLinkInput(e.target.value)}
                placeholder="Enter Patient Key (e.g. PT-RAM88) or phone"
                className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={handleLinkPatient}
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Link to My Circle
              </button>
            </div>
            {linkError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {linkError}
              </p>
            )}
          </div>
        )}

        {/* Patient List */}
        {patients.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              No Patients Currently Under Your Care
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Add a new family member, or link an existing patient account by sharing your Caregiver Key (
              <strong className="text-teal-700 dark:text-teal-400 font-mono">{caretaker?.caregiverKey}</strong>) with them.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onOpenAddPatient}
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Register New Patient
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((p) => {
              const isActive = p.id === activePatientId;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                    isActive
                      ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-600 dark:border-teal-500 ring-2 ring-teal-600/20 shadow-xs'
                      : 'bg-stone-50/60 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ElderAvatar
                      genderHint={p.fullName.toLowerCase().includes('devi') || p.fullName.toLowerCase().includes('maya') || p.fullName.toLowerCase().includes('begum') ? 'female' : 'male'}
                      name={p.fullName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {p.fullName}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {p.age} yrs • {p.region}, {p.state}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {p.patientKey && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-[11px] font-bold">
                            Key: {p.patientKey}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px]">
                          Lang: {p.preferredLanguage.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-200/70 dark:border-stone-800/80 pt-2.5">
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => onSelectPatient(p)}
                          className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          Select Patient
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Currently Monitoring
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewPatientDetail(p)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer"
                      >
                        Clinical Details
                      </button>
                    </div>

                    {unlinkingPatientId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmUnlink(p.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnlinkingPatientId(null)}
                          className="px-2 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUnlinkingPatientId(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Unlink patient from your caregiver circle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. PREFERENCES & ACCESSIBILITY */}
      <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
          Display & Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Theme Toggle */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0D1117] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Color Theme</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {theme === 'dark' ? 'Dark Mode (Night Eye-Comfort)' : 'Light Mode (Paper Comfort)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#161B22] text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer shadow-2xs"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>

          {/* High Contrast */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0D1117] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">High Contrast</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {highContrast ? 'Enabled for maximum clarity' : 'Standard visual palette'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                highContrast
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#161B22] text-stone-800 dark:text-stone-200'
              }`}
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Voice Pack & Audio */}
          {onOpenVoicePack && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0D1117] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Voice Pack & Audio</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Offline speech & dialect clarity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenVoicePack}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#161B22] text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer shadow-2xs"
              >
                Manage Pack
              </button>
            </div>
          )}

          {/* Language Selector */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0D1117] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">App Language</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">8 NER Regional Dialects supported</p>
              </div>
            </div>
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value as LanguageCode)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#161B22] text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer shadow-2xs"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mni">ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)</option>
              <option value="bho">Bodo</option>
              <option value="lus">Mizo</option>
              <option value="kha">Khasi</option>
              <option value="gar">Garo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. ACCOUNT SECURITY & LOGOUT */}
      <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">Account Session & Security</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Caregiver PIN: <strong className="font-mono text-stone-800 dark:text-stone-200">**** ({caretaker?.pin ? 'Configured' : 'Default'})</strong> • Switch roles anytime
            </p>
          </div>
        </div>

        <button
          type="button"
          id="caregiver-logout-btn"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Log Out of Caregiver</span>
        </button>
      </div>

      {/* EDIT CAREGIVER PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Edit Caregiver Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Relationship / Role
                </label>
                <input
                  type="text"
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  placeholder="e.g. Son, Daughter, Nurse, Social Worker"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Security PIN (4 digits)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0D1117] text-stone-900 dark:text-stone-100 font-mono text-sm tracking-widest focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
