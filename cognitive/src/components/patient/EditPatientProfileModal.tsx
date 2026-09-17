import React, { useState } from 'react';
import { Edit3, X, Heart, MapPin, User, Check, ShieldAlert } from 'lucide-react';
import { PatientProfile, LanguageCode } from '../../types';
import { PhotoUploader } from '../common/PhotoUploader';

interface EditPatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSave: (updated: PatientProfile) => void;
  lang?: LanguageCode;
}

export const EditPatientProfileModal: React.FC<EditPatientProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const [fullName, setFullName] = useState(patient.fullName);
  const [preferredName, setPreferredName] = useState(patient.preferredName || '');
  const [age, setAge] = useState<number>(patient.age);
  const [avatarUrl, setAvatarUrl] = useState(patient.avatarUrl || '');
  const [state, setState] = useState<PatientProfile['state']>(patient.state || 'Assam');
  const [region, setRegion] = useState(patient.region || 'Guwahati, Assam');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(patient.preferredLanguage || 'as');
  const [phone, setPhone] = useState(patient.phone || '');
  const [isSelfCare, setIsSelfCare] = useState<boolean>(!patient.caregiverName || patient.hasCaregiver === false);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.caregiverPhone || '');
  const [notes, setNotes] = useState(patient.notes || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanPhone = patient.phone || '';
    if (phone.trim()) {
      const pDigits = phone.trim().replace(/\D/g, '');
      const norm = pDigits.startsWith('91') && pDigits.length === 12 ? pDigits.slice(2) : pDigits;
      if (norm.length !== 10) {
        setError('Phone number must have actually 10 digits.');
        return;
      }
      cleanPhone = norm;
    }

    let cleanEmergencyPhone = patient.caregiverPhone || '';
    if (emergencyPhone.trim()) {
      const eDigits = emergencyPhone.trim().replace(/\D/g, '');
      const normE = eDigits.startsWith('91') && eDigits.length === 12 ? eDigits.slice(2) : eDigits;
      if (normE.length !== 10) {
        setError('Caregiver phone number must have actually 10 digits.');
        return;
      }
      cleanEmergencyPhone = normE;
    }

    const updated: PatientProfile = {
      ...patient,
      fullName: fullName.trim(),
      preferredName: preferredName.trim() || fullName.trim().split(' ')[0],
      age: Number(age),
      avatarUrl: avatarUrl.trim(),
      state,
      region: region.trim() || `${state}`,
      preferredLanguage,
      phone: cleanPhone,
      hasCaregiver: !isSelfCare,
      caregiverName: isSelfCare ? '' : (patient.caregiverName || 'Family Caregiver'),
      caregiverPhone: cleanEmergencyPhone,
      notes: notes.trim(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-xl my-6 rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                Self-Care & Profile
              </span>
              <h2 id="edit-profile-title" className="text-xl font-bold text-stone-900 font-serif-heading">
                Edit My Personal Details
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          If you live independently or manage your own health without a daily caregiver, you can easily personalize your name, location, preferred language, and emergency contact here.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Profile Photo Upload */}
          <PhotoUploader
            currentPhoto={avatarUrl}
            name={preferredName || fullName || 'Patient'}
            onPhotoChange={(newPhoto) => setAvatarUrl(newPhoto)}
            label="My Profile Photo"
            helperText="Upload your own picture or photo. It will appear on your dashboard, profile, and caregiver view."
          />

          {/* Independent Self-Care Toggle */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelfCare}
                onChange={(e) => setIsSelfCare(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-md accent-teal-800"
              />
              <div>
                <span className="text-sm font-bold text-stone-900 block">
                  Independent Self-Care (No Primary Caregiver)
                </span>
                <span className="text-xs text-stone-500 block leading-relaxed">
                  Check this if you live independently and manage your own memory exercises and daily routines.
                </span>
              </div>
            </label>
          </div>

          {/* Full Name & Preferred Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-full-name" className="text-xs font-bold text-stone-700 block">
                My Full Name *
              </label>
              <input
                id="edit-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-pref-name" className="text-xs font-bold text-stone-700 block">
                What friends/family call me (Nickname)
              </label>
              <input
                id="edit-pref-name"
                type="text"
                placeholder="e.g. Amma, Dadu, Koka"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Age & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-age" className="text-xs font-bold text-stone-700 block">
                My Age *
              </label>
              <input
                id="edit-age"
                type="number"
                min={40}
                max={115}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-state" className="text-xs font-bold text-stone-700 block">
                State (North-Eastern India)
              </label>
              <select
                id="edit-state"
                value={state}
                onChange={(e) => setState(e.target.value as any)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              >
                <option value="Assam">Assam</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Tripura">Tripura</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Sikkim">Sikkim</option>
              </select>
            </div>
          </div>

          {/* Region / Town */}
          <div className="space-y-1">
            <label htmlFor="edit-region" className="text-xs font-bold text-stone-700 block">
              Town / Village / Region
            </label>
            <input
              id="edit-region"
              type="text"
              placeholder="e.g. Uzan Bazar, Guwahati"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
            />
          </div>

          {/* Language Preference */}
          <div className="space-y-1">
            <label htmlFor="edit-language" className="text-xs font-bold text-stone-700 block">
              Preferred Voice & Text Language
            </label>
            <select
              id="edit-language"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
              className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mni">মৈতৈলোন্ (Manipuri)</option>
            </select>
          </div>

          {/* Emergency Phone */}
          <div className="space-y-1">
            <label htmlFor="edit-emergency-phone" className="text-xs font-bold text-stone-700 block">
              Emergency Contact / Nearest Helpline Phone
            </label>
            <input
              id="edit-emergency-phone"
              type="text"
              placeholder="+91 94350 12345 or 112"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50 font-mono"
            />
          </div>

          {/* Personal Comfort Notes */}
          <div className="space-y-1">
            <label htmlFor="edit-notes" className="text-xs font-bold text-stone-700 block">
              Things that bring me comfort / Daily Notes
            </label>
            <textarea
              id="edit-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Listening to Bihu songs, drinking warm water after walking..."
              className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-900 focus:outline-teal-800 bg-stone-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
