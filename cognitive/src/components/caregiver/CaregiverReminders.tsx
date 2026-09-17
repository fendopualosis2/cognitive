import React, { useState } from 'react';
import { Plus, Clock, Heart, Trash2, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { ReminderItem, ReminderType, LanguageCode, PatientProfile } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';

interface CaregiverRemindersProps {
  patient?: PatientProfile | null;
  reminders: ReminderItem[];
  onAddReminder: (newReminder: ReminderItem) => void;
  onToggleReminderEnabled: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  lang: LanguageCode;
}

export const CaregiverReminders: React.FC<CaregiverRemindersProps> = ({
  patient,
  reminders,
  onAddReminder,
  onToggleReminderEnabled,
  onDeleteReminder,
  lang,
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newType, setNewType] = useState<ReminderType>('MEDICINE');
  const [newPeriod, setNewPeriod] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');

  const hasValidPatient = Boolean(patient && patient.id && patient.fullName && patient.fullName.trim() !== '');

  if (!hasValidPatient) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto border border-teal-200">
          <Clock className="w-7 h-7 text-teal-800" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg font-serif-heading">No Patient Linked Yet</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Link or register a patient under your care to configure medication schedules and daily supportive reminders.
        </p>
      </div>
    );
  }

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const activePatientId = OfflineStore.getActivePatientId() || 'patient-senior-1';
    const item: ReminderItem = {
      id: `rem-${Date.now()}`,
      patientId: activePatientId,
      type: newType,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Configured by caregiver',
      time: newTime,
      period: newPeriod,
      completedToday: false,
      enabled: true,
      categoryLabel: newType === 'MEDICINE' ? 'Prescribed Medication' : newType,
    };

    onAddReminder(item);
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
            Caregiver Reminder Schedule
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Configure supportive daily reminders that appear in the patient's daily checklist.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-800 text-white hover:bg-teal-900 font-semibold text-sm shadow-xs transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addReminder}</span>
        </button>
      </div>

      {/* Reminder List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
              rem.enabled
                ? 'bg-white border-stone-200 shadow-xs'
                : 'bg-stone-50 border-stone-200 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {rem.time} • {rem.period}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleReminderEnabled(rem.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      rem.enabled
                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                        : 'bg-stone-200 border-stone-300 text-stone-600'
                    }`}
                  >
                    {rem.enabled ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition"
                    title="Remove reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-stone-900">{rem.title}</h3>
              <p className="text-xs sm:text-sm text-stone-600">{rem.description}</p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium">Type: {rem.type}</span>
              <span className={rem.completedToday ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
                {rem.completedToday ? '✓ Done by patient today' : 'Scheduled for today'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-[#FBF9F5] p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                Schedule New Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-500 hover:bg-stone-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Blood Pressure Tablet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Description / Supportive Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take 1 tablet with warm water after dinner."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-teal-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Period
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-teal-700"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ReminderType)}
                  className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-teal-700"
                >
                  <option value="MEDICINE">Prescribed Medicine</option>
                  <option value="HYDRATION">Hydration (Water/Tea)</option>
                  <option value="ACTIVITY">Memory / Cognitive Exercise</option>
                  <option value="ROUTINE">Daily Routine Step</option>
                  <option value="APPOINTMENT">Clinic / Doctor Visit</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 text-white text-sm font-bold hover:bg-teal-900 shadow-xs"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
