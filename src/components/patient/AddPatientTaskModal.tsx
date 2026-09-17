import React, { useState } from 'react';
import {
  X,
  Plus,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  Check,
  Sparkles,
  Coffee,
  Pill,
  Footprints,
  Droplet,
  Moon,
  Heart,
  Phone,
  Flower2,
  Music,
} from 'lucide-react';
import { RoutineTask, LanguageCode } from '../../types';
import { VoiceService } from '../../lib/voiceService';

interface AddPatientTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: RoutineTask) => void;
  lang: LanguageCode;
  initialTimeSlot?: 'Morning' | 'Afternoon' | 'Evening';
}

interface QuickSuggestion {
  title: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  time: string;
  icon: string;
  notes: string;
  emoji: string;
}

const QUICK_SUGGESTIONS: QuickSuggestion[] = [
  {
    title: 'Morning Warm Tea & Refreshment',
    timeSlot: 'Morning',
    time: '07:30 AM',
    icon: 'Coffee',
    notes: 'Enjoy warm tea peacefully in the morning breeze.',
    emoji: '☕',
  },
  {
    title: 'Take Daily Medicine',
    timeSlot: 'Morning',
    time: '08:30 AM',
    icon: 'Pill',
    notes: 'Take with a full glass of warm water after breakfast.',
    emoji: '💊',
  },
  {
    title: 'Gentle Walk in Garden or Veranda',
    timeSlot: 'Morning',
    time: '09:00 AM',
    icon: 'Footprints',
    notes: 'Relaxing 10-15 minute walk to stretch legs.',
    emoji: '🚶',
  },
  {
    title: 'Drink Fresh Water',
    timeSlot: 'Afternoon',
    time: '01:30 PM',
    icon: 'Droplet',
    notes: 'Stay hydrated during the afternoon.',
    emoji: '💧',
  },
  {
    title: 'Restful Afternoon Nap',
    timeSlot: 'Afternoon',
    time: '02:30 PM',
    icon: 'Moon',
    notes: 'Rest quietly in a comfortable, dim room.',
    emoji: '😴',
  },
  {
    title: 'Evening Prayer & Lamp Lighting',
    timeSlot: 'Evening',
    time: '06:00 PM',
    icon: 'Heart',
    notes: 'Quiet devotion, lighting diya, or singing devotional songs.',
    emoji: '🪔',
  },
  {
    title: 'Call Children or Family',
    timeSlot: 'Evening',
    time: '07:00 PM',
    icon: 'Phone',
    notes: 'Friendly telephone chat with family members.',
    emoji: '📞',
  },
  {
    title: 'Water Balcony & Garden Plants',
    timeSlot: 'Evening',
    time: '05:30 PM',
    icon: 'Flower2',
    notes: 'Tend to favorite pots, flowers, and tulsi plant.',
    emoji: '🌿',
  },
];

const ICON_OPTIONS = [
  { name: 'Coffee', label: 'Tea / Drink', icon: Coffee, emoji: '☕' },
  { name: 'Pill', label: 'Medicine', icon: Pill, emoji: '💊' },
  { name: 'Footprints', label: 'Walk', icon: Footprints, emoji: '🚶' },
  { name: 'Droplet', label: 'Water', icon: Droplet, emoji: '💧' },
  { name: 'Heart', label: 'Prayer / Care', icon: Heart, emoji: '🪔' },
  { name: 'Phone', label: 'Phone Call', icon: Phone, emoji: '📞' },
  { name: 'Flower2', label: 'Plants / Garden', icon: Flower2, emoji: '🌿' },
  { name: 'Moon', label: 'Rest / Sleep', icon: Moon, emoji: '🌙' },
  { name: 'Music', label: 'Music / Radio', icon: Music, emoji: '🎵' },
];

export const AddPatientTaskModal: React.FC<AddPatientTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  lang,
  initialTimeSlot = 'Morning',
}) => {
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>(initialTimeSlot);
  const [time, setTime] = useState(
    initialTimeSlot === 'Morning' ? '08:00 AM' : initialTimeSlot === 'Afternoon' ? '01:30 PM' : '06:30 PM'
  );
  const [icon, setIcon] = useState('Coffee');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: QuickSuggestion) => {
    setTitle(preset.title);
    setTimeSlot(preset.timeSlot);
    setTime(preset.time);
    setIcon(preset.icon);
    setNotes(preset.notes);
    setErrorMsg(null);
  };

  const handleSpeakGuidance = () => {
    VoiceService.speak(
      'Choose a suggestion from below, or type an activity name, time of day, and tap add to save it to your daily routine.',
      lang
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter or choose a name for your activity.');
      return;
    }

    const newTask: RoutineTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      timeSlot,
      time: time.trim() || '09:00 AM',
      icon,
      completed: false,
      notes: notes.trim() || undefined,
    };

    onAddTask(newTask);
    VoiceService.speak(`Added ${newTask.title} to your day.`, lang);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 id="add-task-title" className="text-xl sm:text-2xl font-bold font-serif-heading text-white">
                Add an Activity to My Day
              </h2>
              <p className="text-xs text-teal-200 mt-0.5 font-medium">
                Set your personal routine or reminder easily
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakGuidance}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition"
              title="Hear instructions aloud"
              aria-label="Hear instructions aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-900">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Tap Suggestions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Quick Suggestions (Tap to Pick)</span>
              </label>
              <span className="text-[11px] text-stone-600 font-medium">1-tap autofill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_SUGGESTIONS.map((preset, idx) => {
                const isSelected = title === preset.title;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition active:scale-95 min-h-[72px] ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600 shadow-xs'
                        : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <span className="text-2xl mb-1">{preset.emoji}</span>
                    <span className="text-xs font-bold line-clamp-1 leading-tight">{preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}</span>
                    <span className="text-[10px] text-stone-600 font-medium mt-0.5">{preset.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form id="add-patient-task-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Activity Name */}
            <div>
              <label htmlFor="task-title-input" className="text-xs font-bold text-stone-700 block mb-1.5">
                Activity or Task Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Morning Walk, Read Paper, Water Plants..."
                className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 text-sm sm:text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
              />
            </div>

            {/* Time Slot Choice */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Time of Day
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTimeSlot('Morning');
                    if (time.includes('PM') || !time) setTime('08:00 AM');
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition active:scale-95 ${
                    timeSlot === 'Morning'
                      ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600 text-amber-950 font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  <Sunrise className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold">Morning</span>
                  <span className="text-[10px] text-stone-600 font-medium">7 AM - 12 PM</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeSlot('Afternoon');
                    if (time.includes('AM') || !time) setTime('01:30 PM');
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition active:scale-95 ${
                    timeSlot === 'Afternoon'
                      ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-600 text-sky-950 font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-xs sm:text-sm font-bold">Afternoon</span>
                  <span className="text-[10px] text-stone-600 font-medium">12 PM - 5 PM</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeSlot('Evening');
                    if (time.includes('AM') || !time) setTime('06:30 PM');
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition active:scale-95 ${
                    timeSlot === 'Evening'
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600 text-indigo-950 font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  <Sunset className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold">Evening</span>
                  <span className="text-[10px] text-stone-600 font-medium">5 PM - 9 PM</span>
                </button>
              </div>
            </div>

            {/* Time Input & Quick Preset Buttons */}
            <div>
              <label htmlFor="task-time-input" className="text-xs font-bold text-stone-700 block mb-1.5">
                Exact Time
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="task-time-input"
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {(timeSlot === 'Morning'
                    ? ['07:30 AM', '09:00 AM', '10:30 AM']
                    : timeSlot === 'Afternoon'
                    ? ['01:00 PM', '02:30 PM', '04:00 PM']
                    : ['05:30 PM', '06:30 PM', '08:00 PM']
                  ).map((tPreset) => (
                    <button
                      key={tPreset}
                      type="button"
                      onClick={() => setTime(tPreset)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition ${
                        time === tPreset
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                      }`}
                    >
                      {tPreset.replace(' ', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Choose an Icon / Symbol
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const isSelected = icon === opt.name;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setIcon(opt.name)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition active:scale-95 ${
                        isSelected
                          ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                      }`}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label htmlFor="task-notes-input" className="text-xs font-bold text-stone-700 block mb-1.5">
                Gentle Note / Instructions (Optional)
              </label>
              <input
                id="task-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sit in the morning sun on the balcony"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-sm transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-patient-task-form"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add to My Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
