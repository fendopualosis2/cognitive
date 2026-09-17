import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock,
  CheckSquare,
  Square,
  Droplet,
  Heart,
  Footprints,
  Coffee,
  Moon,
  Users,
  RefreshCw,
} from 'lucide-react';
import { PatientProfile, RoutineTask } from '../../types';
import { OfflineStore } from '../../lib/offlineStore';

interface CaretakerRoutineManagerProps {
  patient: PatientProfile;
  routine: RoutineTask[];
  onUpdateRoutine: (updated: RoutineTask[]) => void;
}

export const CaretakerRoutineManager: React.FC<CaretakerRoutineManagerProps> = ({
  patient,
  routine,
  onUpdateRoutine,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkPresetsModal, setShowBulkPresetsModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Single new task form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newSlot, setNewSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [newNotes, setNewNotes] = useState('');
  const [newIcon, setNewIcon] = useState('Calendar');

  // Bulk presets selection state
  const presetPacks = [
    {
      name: '🌅 Morning Vitality & Medication Pack',
      tasks: [
        {
          title: 'Morning Warm Tulsi Tea & Hydration',
          time: '07:30 AM',
          timeSlot: 'Morning' as const,
          notes: 'Enjoy the soft morning sunlight on the veranda.',
          icon: 'Coffee',
        },
        {
          title: 'Prescribed Morning BP & Heart Medicine',
          time: '08:15 AM',
          timeSlot: 'Morning' as const,
          notes: 'Take with full glass of water after tea.',
          icon: 'Heart',
        },
        {
          title: 'Gentle 15-min Veranda Garden Walk',
          time: '09:00 AM',
          timeSlot: 'Morning' as const,
          notes: 'Pleasant light stroll to encourage mobility.',
          icon: 'Footprints',
        },
      ],
    },
    {
      name: '☀️ Midday Hydration & Comfort Pack',
      tasks: [
        {
          title: 'Midday Glass of Warm Lemon Water',
          time: '11:30 AM',
          timeSlot: 'Morning' as const,
          notes: 'Hydration check before lunch.',
          icon: 'Droplet',
        },
        {
          title: 'Seasonal Fruit & Light Lunch',
          time: '01:00 PM',
          timeSlot: 'Afternoon' as const,
          notes: 'Soft papaya or banana with light khichdi.',
          icon: 'Coffee',
        },
        {
          title: 'Afternoon Rest & Soft Flute Music',
          time: '02:00 PM',
          timeSlot: 'Afternoon' as const,
          notes: 'Quiet rest in comfortable ventilated room.',
          icon: 'Moon',
        },
      ],
    },
    {
      name: '🌆 Evening Sundowning Comfort & Social Pack',
      tasks: [
        {
          title: 'Red Tea & Family Photo Reminiscence',
          time: '04:30 PM',
          timeSlot: 'Afternoon' as const,
          notes: 'Share stories about family visits to Majuli and Tezpur.',
          icon: 'Users',
        },
        {
          title: 'Cognitive Keepsake Memory Activity',
          time: '06:00 PM',
          timeSlot: 'Evening' as const,
          notes: 'Engage with Heritage items on CognitiveSaathi.',
          icon: 'Sparkles',
        },
        {
          title: 'Night Medicine & Warm Haldi Milk',
          time: '08:30 PM',
          timeSlot: 'Evening' as const,
          notes: 'Reassuring night routine before peaceful sleep.',
          icon: 'Moon',
        },
      ],
    },
  ];

  const [selectedPresetTasks, setSelectedPresetTasks] = useState<Record<string, boolean>>({});

  const handleToggleTask = (taskId: string) => {
    const updated = routine.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    OfflineStore.saveRoutine(updated, patient.id);
    onUpdateRoutine(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = routine.filter((t) => t.id !== taskId);
    OfflineStore.saveRoutine(updated, patient.id);
    onUpdateRoutine(updated);
  };

  const handleAddSingleTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: RoutineTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      timeSlot: newSlot,
      notes: newNotes.trim() || undefined,
      icon: newIcon,
      completed: false,
    };

    const updated = [...routine, newTask];
    OfflineStore.saveRoutine(updated, patient.id);
    onUpdateRoutine(updated);

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleAddBulkPresets = () => {
    const tasksToAdd: RoutineTask[] = [];

    presetPacks.forEach((pack, packIdx) => {
      pack.tasks.forEach((t, tIdx) => {
        const key = `${packIdx}-${tIdx}`;
        if (selectedPresetTasks[key]) {
          tasksToAdd.push({
            id: `task-${Date.now()}-${packIdx}-${tIdx}`,
            title: t.title,
            time: t.time,
            timeSlot: t.timeSlot,
            notes: t.notes,
            icon: t.icon,
            completed: false,
          });
        }
      });
    });

    if (tasksToAdd.length === 0) return;

    const updated = [...routine, ...tasksToAdd];
    OfflineStore.saveRoutine(updated, patient.id);
    onUpdateRoutine(updated);
    setSelectedPresetTasks({});
    setShowBulkPresetsModal(false);
  };

  const handleFetchAiSuggestions = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/suggest-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          focusArea: 'dementia_supportive',
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.warn('AI suggestions error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddAiSuggestion = (suggestion: any) => {
    const newTask: RoutineTask = {
      id: `task-ai-${Date.now()}`,
      title: suggestion.title,
      time: suggestion.time || '10:00 AM',
      timeSlot: suggestion.timeSlot || 'Morning',
      notes: suggestion.notes,
      icon: 'Sparkles',
      completed: false,
    };

    const updated = [...routine, newTask];
    OfflineStore.saveRoutine(updated, patient.id);
    onUpdateRoutine(updated);
    setAiSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
  };

  const hasValidPatient = Boolean(patient && patient.id && patient.fullName && patient.fullName.trim() !== '');

  if (!hasValidPatient) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-xs space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto border border-teal-200">
          <Calendar className="w-7 h-7 text-teal-800" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg font-serif-heading">No Patient Linked Yet</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Link or register a patient under your care to configure and schedule their daily routine tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-serif-heading text-stone-900">
              Daily Routine & Task Management
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              {routine.length} Tasks
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage scheduled routines for <strong className="text-stone-800">{patient.fullName}</strong> ({patient.preferredName}). Tasks appear directly on the patient's daily checklist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBulkPresetsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-2xs"
          >
            <CheckSquare className="w-4 h-4 text-amber-700" />
            <span>+ Add Multiple Tasks (Bulk)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Routine Tasks List */}
      {routine.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
          <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-700 text-sm">No tasks added to routine yet</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Add individual tasks or choose from curated Northeast eldercare presets like morning tea, medication, hydration, and veranda strolls.
          </p>
          <button
            onClick={() => setShowBulkPresetsModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition inline-block"
          >
            Load Routine Presets
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {routine.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                task.completed
                  ? 'bg-stone-50/70 border-stone-200 opacity-80'
                  : 'bg-white border-stone-200/90 shadow-2xs hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                    task.completed
                      ? 'bg-teal-700 border-teal-700 text-white'
                      : 'border-stone-300 hover:border-teal-600 bg-white'
                  }`}
                  title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        task.completed ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase">
                      {task.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-teal-800">
                      <Clock className="w-3.5 h-3.5" />
                      {task.time}
                    </span>
                    {task.notes && <span>• {task.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Routine Generator Trigger Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-200/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Need personalized routine advice for {patient.preferredName}?
            </h4>
            <p className="text-xs text-stone-600">
              Our Gemini AI Caregiver assistant can propose daily routines tailored to her age and dementia stage.
            </p>
          </div>
        </div>

        <button
          onClick={handleFetchAiSuggestions}
          disabled={isGeneratingAi}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition"
        >
          {isGeneratingAi ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI for Suggestions</span>
            </>
          )}
        </button>
      </div>

      {/* Display AI Suggestions if fetched */}
      {aiSuggestions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Gemini AI Suggested Routine Additions ({aiSuggestions.length})
            </h4>
            <button
              onClick={() => {
                const updated = [...routine, ...aiSuggestions.map((s, idx) => ({
                  id: `task-ai-${Date.now()}-${idx}`,
                  title: s.title,
                  time: s.time || '10:00 AM',
                  timeSlot: s.timeSlot || 'Morning',
                  notes: s.notes,
                  icon: 'Sparkles',
                  completed: false,
                }))];
                OfflineStore.saveRoutine(updated, patient.id);
                onUpdateRoutine(updated);
                setAiSuggestions([]);
              }}
              className="text-xs font-bold text-teal-800 hover:underline"
            >
              + Add All Suggestions
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {aiSuggestions.map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900">{s.title}</div>
                  <div className="text-[11px] text-stone-500">
                    {s.time} ({s.timeSlot}) • {s.notes}
                  </div>
                </div>
                <button
                  onClick={() => handleAddAiSuggestion(s)}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold shrink-0 transition"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Add Custom Single Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-lg font-bold font-serif-heading text-stone-900">
                Add Custom Routine Task
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSingleTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Warm Herbal Tea"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 04:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Time Slot
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e: any) => setNewSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Gentle Notes for Patient
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Sip slowly on the veranda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs"
                >
                  Add Task to Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Add Presets (Multiple Tasks at Once) */}
      {showBulkPresetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-5 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
              <div>
                <h4 className="text-xl font-bold font-serif-heading text-stone-900">
                  Add Multiple Routine Tasks (Presets)
                </h4>
                <p className="text-xs text-stone-500">
                  Select routine packs to add to {patient.preferredName}'s schedule in a single click.
                </p>
              </div>
              <button
                onClick={() => setShowBulkPresetsModal(false)}
                className="text-stone-400 hover:text-stone-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {presetPacks.map((pack, packIdx) => {
                const allSelected = pack.tasks.every(
                  (_, tIdx) => selectedPresetTasks[`${packIdx}-${tIdx}`]
                );

                return (
                  <div
                    key={packIdx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-stone-900">{pack.name}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !allSelected;
                          const next = { ...selectedPresetTasks };
                          pack.tasks.forEach((_, tIdx) => {
                            next[`${packIdx}-${tIdx}`] = nextState;
                          });
                          setSelectedPresetTasks(next);
                        }}
                        className="text-xs font-bold text-teal-800 hover:underline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {pack.tasks.map((task, tIdx) => {
                        const key = `${packIdx}-${tIdx}`;
                        const isChecked = Boolean(selectedPresetTasks[key]);

                        return (
                          <div
                            key={tIdx}
                            onClick={() =>
                              setSelectedPresetTasks((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }))
                            }
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                              isChecked
                                ? 'bg-teal-50/80 border-teal-300'
                                : 'bg-white border-stone-200 hover:bg-stone-100/70'
                            }`}
                          >
                            <div className="shrink-0 text-teal-800">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-teal-700" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-stone-900">{task.title}</div>
                              <div className="text-[11px] text-stone-500">
                                {task.time} ({task.timeSlot}) • {task.notes}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 shrink-0">
              <span className="text-xs text-stone-500 font-semibold">
                {Object.values(selectedPresetTasks).filter(Boolean).length} tasks selected
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkPresetsModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBulkPresets}
                  disabled={Object.values(selectedPresetTasks).filter(Boolean).length === 0}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white text-xs font-bold transition shadow-xs"
                >
                  Add Selected Tasks to Patient Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
