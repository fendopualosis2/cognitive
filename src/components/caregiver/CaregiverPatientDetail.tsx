import React, { useState } from 'react';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  FileText,
  Plus,
  ShieldAlert,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Edit3,
  Users,
  ChevronDown,
} from 'lucide-react';
import { PatientProfile, GameSessionResult, RoutineTask, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { CaretakerRoutineManager } from './CaretakerRoutineManager';
import { ElderAvatar } from '../common/ElderAvatar';

interface CaregiverPatientDetailProps {
  patient?: PatientProfile | null;
  allPatients?: PatientProfile[];
  sessions: GameSessionResult[];
  routine: RoutineTask[];
  onUpdateRoutine?: (updated: RoutineTask[]) => void;
  lang: LanguageCode;
  onLockToPatient?: () => void;
  onAddNewPatient?: () => void;
  onOpenLinkPatientModal?: () => void;
  onSelectPatient?: (patient: PatientProfile) => void;
  onUpdatePatientKey?: (newKey: string) => void;
}

export const CaregiverPatientDetail: React.FC<CaregiverPatientDetailProps> = ({
  patient,
  allPatients = [],
  sessions,
  routine,
  onUpdateRoutine,
  lang,
  onLockToPatient,
  onAddNewPatient,
  onOpenLinkPatientModal,
  onSelectPatient,
  onUpdatePatientKey,
}) => {
  const t = translations[lang];
  const [notes, setNotes] = useState<string[]>([
    'Patient is responsive and engaging well with daily morning check-ins.',
  ]);
  const [newNote, setNewNote] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);

  const hasValidPatient = Boolean(
    patient && patient.id && patient.fullName && patient.fullName.trim() !== ''
  );

  // If no patient is linked yet, render clean empty-state space
  if (!hasValidPatient) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 shadow-sm text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
          <Users className="w-8 h-8 text-teal-800" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            Patient Profile & History
          </span>
          <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
            No Patient Linked Yet
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            You don't have an active patient in your care circle yet. Register a new family member or link an existing patient using their unique Patient Key to view their complete profile, routine checklist, and cognitive log.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onAddNewPatient && (
            <button
              type="button"
              onClick={onAddNewPatient}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>+ Register New Patient</span>
            </button>
          )}

          {onOpenLinkPatientModal && (
            <button
              type="button"
              onClick={onOpenLinkPatientModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-sm font-bold transition active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-teal-700" />
              <span>Link Patient with Key</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle saving customized patient key
  const handleSavePatientKey = () => {
    setKeyError(null);
    setKeySuccess(null);
    const clean = customKeyInput.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setKeyError('Patient key must be at least 3 characters.');
      return;
    }
    if (!patient?.id) return;
    const res = OfflineStore.updatePatientKey(patient.id, clean);
    if (!res.success) {
      setKeyError(res.error || 'Failed to update patient key.');
      return;
    }
    onUpdatePatientKey?.(clean);
    setKeySuccess(`Patient key updated to "${clean}"!`);
    setIsEditingKey(false);
    setTimeout(() => setKeySuccess(null), 3000);
  };

  const handleCopyKey = () => {
    const key = patient.patientKey || `PT-${patient.id.slice(-6).toUpperCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote('');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Patient Switcher if multiple patients exist */}
      {allPatients.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-100 border border-stone-200">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Users className="w-4 h-4 text-teal-800" />
            <span>Select Active Patient:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPatients.map((p) => {
              const isSelected = p.id === patient.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPatient?.(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                  }`}
                >
                  <span>{p.preferredName || p.fullName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Patient Summary Header Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ElderAvatar
              name={patient.preferredName || patient.fullName}
              avatarUrl={patient.avatarUrl}
              size="xl"
              className="border-2 border-teal-700 shadow-xs shrink-0"
            />
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                {patient.fullName} {patient.preferredName ? `(${patient.preferredName})` : ''}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-700" /> {patient.age} years old
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" /> {patient.region || patient.state}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-700" /> Caregiver: {patient.caregiverName || 'Self'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-6">
            {onAddNewPatient && (
              <button
                type="button"
                onClick={onAddNewPatient}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Register a new patient under your care"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Add Patient</span>
              </button>
            )}

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-500 uppercase font-semibold">Streak</span>
              <p className="text-xl font-bold text-amber-700">{patient.dailyStreak || 0} Active Days</p>
            </div>
          </div>
        </div>

        {/* Patient Key & Custom Key Setter */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
              Patient Unique Key
            </span>
            {!isEditingKey ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-extrabold text-teal-950 bg-white px-3 py-1 rounded-xl border border-teal-300 shadow-2xs">
                  {patient.patientKey || `PT-${patient.id.slice(-6).toUpperCase()}`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2.5 py-1 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomKeyInput(patient.patientKey || `PT-${patient.id.slice(-6).toUpperCase()}`);
                    setIsEditingKey(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Set / Edit Key</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PT-DAD72, MOM-CARE"
                  className="px-3 py-1.5 rounded-xl border-2 border-teal-600 font-mono text-xs font-bold bg-white text-teal-950 uppercase"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCustomKeyInput(`PT-${Math.floor(100000 + Math.random() * 900000)}`)
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300"
                >
                  🎲 Random
                </button>
                <button
                  type="button"
                  onClick={handleSavePatientKey}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold cursor-pointer"
                >
                  Save Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingKey(false);
                    setKeyError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
            {keyError && <p className="text-xs text-rose-600 font-bold">{keyError}</p>}
            {keySuccess && <p className="text-xs text-emerald-700 font-bold">{keySuccess}</p>}
          </div>

          <p className="text-xs text-stone-500 max-w-sm">
            This key allows the patient and family members to identify and connect with this profile.
          </p>
        </div>
      </div>

      {/* Grid: Routine Status & Recent Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Routine Adherence Checklist */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-serif-heading text-stone-900">
            Today's Routine Check
          </h3>

          <div className="space-y-2.5">
            {routine.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-3">No routine tasks scheduled for today.</p>
            ) : (
              routine.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.completed ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                    <span className={`font-semibold ${r.completed ? 'text-stone-900' : 'text-stone-600'}`}>
                      {r.title}
                    </span>
                  </div>
                  <span className="text-stone-500 font-medium shrink-0 ml-2">{r.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cognitive Session Activity History */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-serif-heading text-stone-900">
            Cognitive Activity Log
          </h3>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-3">No cognitive exercises completed yet today.</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900 capitalize">
                        {s.gameId.replace('-', ' ')}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 font-medium">
                        Level {s.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Completed at {s.completedAt} • Duration: {Math.round(s.completionTimeMs / 1000)}s
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-800">
                      {Math.round(s.accuracy * 100)}%
                    </span>
                    <span className="text-[10px] text-stone-400 block">Accuracy</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Routine Management for this Patient */}
      {onUpdateRoutine && (
        <CaretakerRoutineManager
          patient={patient}
          routine={routine}
          onUpdateRoutine={onUpdateRoutine}
        />
      )}

      {/* Caregiver Observation Notes Log */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              Caregiver Observation Notes
            </h3>
          </div>
          <span className="text-xs text-stone-500">For family & clinician reference</span>
        </div>

        <form onSubmit={handleAddNote} className="flex gap-3">
          <input
            type="text"
            placeholder="Add an observation (e.g., Patient was cheerful during morning walk)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 p-3 rounded-2xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:outline-teal-700"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-teal-800 text-white text-sm font-bold hover:bg-teal-900 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {notes.map((note, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800">
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
