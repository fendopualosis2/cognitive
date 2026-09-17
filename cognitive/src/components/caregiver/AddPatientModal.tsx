import React, { useState } from 'react';
import { UserPlus, X, Heart, MapPin, Globe, Sparkles, Phone, ShieldCheck, User, KeyRound } from 'lucide-react';
import { PatientProfile, LanguageCode, CaretakerProfile } from '../../types';
import { ElderAvatar } from '../common/ElderAvatar';
import { PhotoUploader } from '../common/PhotoUploader';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPatient: PatientProfile) => void;
  currentCaretaker?: CaretakerProfile | null;
  lang?: LanguageCode;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCaretaker,
}) => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [state, setState] = useState<PatientProfile['state']>('Assam');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('as');
  const [phone, setPhone] = useState('');
  const [caregiverName, setCaregiverName] = useState(currentCaretaker?.fullName || '');
  const [caregiverPhone, setCaregiverPhone] = useState(currentCaretaker?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [patientKey, setPatientKey] = useState(`PT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter the patient’s full name.');
      return;
    }
    const numAge = Number(age);
    if (!age || isNaN(numAge) || numAge < 40 || numAge > 115) {
      setError('Please enter a valid age (40 to 115).');
      return;
    }

    const pDigits = phone.trim().replace(/\D/g, '');
    const normPhone = pDigits.startsWith('91') && pDigits.length === 12 ? pDigits.slice(2) : pDigits;
    if (!normPhone || normPhone.length !== 10) {
      setError('Patient mobile number must have actually 10 digits.');
      return;
    }

    if (caregiverPhone.trim()) {
      const cgDigits = caregiverPhone.trim().replace(/\D/g, '');
      const normCg = cgDigits.startsWith('91') && cgDigits.length === 12 ? cgDigits.slice(2) : cgDigits;
      if (normCg.length !== 10) {
        setError('Caregiver phone number must have actually 10 digits.');
        return;
      }
    }

    const newId = `patient-${Date.now()}`;
    const cleanKey = (patientKey.trim() || `PT-${Date.now().toString().slice(-6)}`).toUpperCase();

    const newPatient: PatientProfile = {
      id: newId,
      fullName: fullName.trim(),
      preferredName: preferredName.trim() || fullName.trim().split(' ')[0],
      patientKey: cleanKey,
      age: numAge,
      region: `${city.trim() || state}, ${state}`,
      state,
      preferredLanguage,
      phone: normPhone,
      caregiverName: caregiverName.trim(),
      caregiverPhone: caregiverPhone.trim(),
      linkedCaregiverKey: currentCaretaker?.caregiverKey || '',
      avatarUrl: selectedAvatar || '',
      dailyStreak: 0,
      todayCompletedCount: 0,
      hasCaregiver: true,
      notes: notes.trim(),
    };

    onSave(newPatient);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-patient-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-xl my-6 rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                Caregiver Management
              </span>
              <h2 id="add-patient-title" className="text-xl font-bold text-stone-900 font-serif-heading">
                Register New Patient Under Your Care
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
          Add an elderly family member, parent, or community resident under your care. You can tailor their daily routines, medicine schedules, and track their cognitive game milestones.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Avatar Profile Uploader */}
          <PhotoUploader
            currentPhoto={selectedAvatar}
            name={preferredName || fullName || 'New Patient'}
            onPhotoChange={(newPhoto) => setSelectedAvatar(newPhoto)}
            label="Patient Profile Photo (Optional)"
            helperText="Upload a family photo or leave blank to generate a culturally respectful initial badge."
          />

          {/* Name & Preferred Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="patient-full-name" className="text-xs font-bold text-stone-700 block">
                Full Name *
              </label>
              <input
                id="patient-full-name"
                type="text"
                required
                autoComplete="off"
                placeholder="e.g. Biren Hazarika"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-pref-name" className="text-xs font-bold text-stone-700 block">
                Preferred Name / Nickname
              </label>
              <input
                id="patient-pref-name"
                type="text"
                autoComplete="off"
                placeholder="e.g. Deuta, Koka, Dadu"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Patient Mobile Number (10 Digits) */}
          <div className="space-y-1">
            <label htmlFor="patient-phone" className="text-xs font-bold text-stone-700 block">
              Patient Mobile Number (10 Digits) *
            </label>
            <input
              id="patient-phone"
              type="tel"
              maxLength={10}
              required
              autoComplete="off"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
            />
          </div>

          {/* Age & State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="patient-age" className="text-xs font-bold text-stone-700 block">
                Age (years) *
              </label>
              <input
                id="patient-age"
                type="number"
                min={40}
                max={115}
                required
                autoComplete="off"
                placeholder="e.g. 72"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-state" className="text-xs font-bold text-stone-700 block">
                State (North-East) *
              </label>
              <select
                id="patient-state"
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

            <div className="space-y-1">
              <label htmlFor="patient-city" className="text-xs font-bold text-stone-700 block">
                Town / City
              </label>
              <input
                id="patient-city"
                type="text"
                placeholder="e.g. Jorhat, Imphal"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-teal-800 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Primary Language */}
          <div className="space-y-1">
            <label htmlFor="patient-lang" className="text-xs font-bold text-stone-700 block">
              Preferred Spoken & Audio Language
            </label>
            <select
              id="patient-lang"
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

          {/* Caregiver Contact (Linked under current caregiver) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Assigned Caregiver Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 font-semibold block">Caregiver Name</label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 font-semibold block">Caregiver Phone</label>
                <input
                  type="text"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Patient Key Setting */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="patient-key-input" className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                <span>Patient Key (Custom or Generated)</span>
              </label>
              <button
                type="button"
                onClick={() => setPatientKey(`PT-${Math.floor(100000 + Math.random() * 900000)}`)}
                className="text-[11px] text-teal-800 hover:text-teal-950 font-bold underline cursor-pointer"
              >
                🎲 Randomize
              </button>
            </div>
            <input
              id="patient-key-input"
              type="text"
              value={patientKey}
              onChange={(e) => setPatientKey(e.target.value.toUpperCase())}
              placeholder="e.g. PT-MOM72, DAD-KOKA"
              className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white font-mono text-xs font-bold text-teal-950 uppercase"
            />
            <p className="text-[11px] text-stone-500">
              You can give this patient whatever key you prefer. They can use this key to log in or link.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="patient-notes" className="text-xs font-bold text-stone-700 block">
              Care & Comfort Notes
            </label>
            <textarea
              id="patient-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Responds well to morning tea, loves viewing traditional gamusa embroidery..."
              className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-900 focus:outline-teal-800 bg-stone-50/50"
            />
          </div>

          {/* Actions */}
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
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Save & Add Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
