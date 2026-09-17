import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Pill,
  Footprints,
  Droplet,
  Moon,
  Users,
  ShieldCheck,
  Heart,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { RoutineTask, ReminderItem, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';
import { VoiceService } from '../../lib/voiceService';
import { AddPatientTaskModal } from './AddPatientTaskModal';

interface PatientMyDayProps {
  routine: RoutineTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask?: (task: RoutineTask) => void;
  onDeleteTask?: (taskId: string) => void;
  reminders: ReminderItem[];
  onToggleReminder: (reminderId: string) => void;
  lang: LanguageCode;
}

export const PatientMyDay: React.FC<PatientMyDayProps> = ({
  routine,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  reminders,
  onToggleReminder,
  lang,
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'ONE_BY_ONE' | 'FULL_LIST'>('ONE_BY_ONE');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [stepIndex, setStepIndex] = useState<number>(() => {
    const firstIncomplete = routine.findIndex((r) => !r.completed);
    return firstIncomplete !== -1 ? firstIncomplete : 0;
  });

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-700" />;
      case 'Pill':
        return <Pill className="w-5 h-5 text-teal-700" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-emerald-700" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5 text-sky-700" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-indigo-700" />;
      case 'Users':
        return <Users className="w-5 h-5 text-rose-700" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className="w-5 h-5 text-teal-800" />;
    }
  };

  const morningTasks = routine.filter((r) => r.timeSlot === 'Morning');
  const afternoonTasks = routine.filter((r) => r.timeSlot === 'Afternoon');
  const eveningTasks = routine.filter((r) => r.timeSlot === 'Evening');

  const completedCount = routine.filter((r) => r.completed).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Mode Switcher + Add Activity Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl">
          <button
            onClick={() => setViewMode('ONE_BY_ONE')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'ONE_BY_ONE'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            One Activity at a Time (Amma Mode)
          </button>
          <button
            onClick={() => setViewMode('FULL_LIST')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'FULL_LIST'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Full Day Schedule
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 hidden md:inline">
            {viewMode === 'ONE_BY_ONE' ? 'Showing 1 step for cognitive ease' : 'Showing complete daily schedule'}
          </span>

          {onAddTask && (
            <button
              type="button"
              onClick={() => {
                setTargetSlot('Morning');
                setShowAddTaskModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 shrink-0"
              title="Add an activity to your daily schedule"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add My Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* ONE STEP AT A TIME: Pure Elderly Companion Stepper */}
      {viewMode === 'ONE_BY_ONE' && routine.length > 0 && (() => {
        const currentTask = routine[stepIndex % routine.length];
        const taskEmoji = currentTask.icon === 'Coffee' ? '☕' : currentTask.icon === 'Pill' ? '💊' : currentTask.icon === 'Footprints' ? '🚶' : currentTask.icon === 'Droplet' ? '💧' : '☀️';

        const handleSpeakStep = () => {
          VoiceService.speak(`It is time for: ${currentTask.title}. Scheduled for ${currentTask.time}. Take your time.`, lang);
        };

        const handleDoneStep = () => {
          if (!currentTask.completed) {
            onToggleTask(currentTask.id);
          }
          VoiceService.speak('Well done, Amma!', lang);
          setTimeout(() => {
            setStepIndex((s) => (s + 1) % routine.length);
          }, 600);
        };

        return (
          <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
              <span className="font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full">
                Step {stepIndex + 1} of {routine.length} • {currentTask.timeSlot}
              </span>
              <span className="font-mono text-stone-700 font-bold">{currentTask.time}</span>
            </div>

            {/* Giant Motif / Emoji */}
            <div className="text-8xl sm:text-9xl my-4 filter drop-shadow-xs transition-transform hover:scale-105 duration-200">
              {taskEmoji}
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-2xl sm:text-4xl font-bold font-serif-heading text-stone-900 leading-tight">
                {currentTask.title}
              </h3>
              {currentTask.notes && (
                <p className="text-stone-600 text-sm sm:text-base">
                  {currentTask.notes}
                </p>
              )}
            </div>

            {/* Audio narration button */}
            <div>
              <button
                onClick={handleSpeakStep}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition"
              >
                <Volume2 className="w-4 h-4 text-teal-700" />
                <span>Hear Prompt Aloud</span>
              </button>
            </div>

            {/* GIANT UNMISTAKABLE [ DONE ] BUTTON */}
            <div className="pt-4 max-w-md mx-auto">
              <button
                id="my-day-done-btn"
                onClick={handleDoneStep}
                className={`w-full py-5 px-8 rounded-3xl font-extrabold text-xl sm:text-2xl tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 ${
                  currentTask.completed
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white ring-4 ring-emerald-200'
                }`}
              >
                <Check className="w-8 h-8 stroke-[3]" />
                <span>{currentTask.completed ? 'COMPLETED (TAP NEXT)' : 'DONE'}</span>
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-semibold text-stone-600">
              <button
                onClick={() => setStepIndex((s) => (s > 0 ? s - 1 : routine.length - 1))}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-stone-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                onClick={() => setStepIndex((s) => (s + 1) % routine.length)}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-stone-100 transition text-teal-800 font-bold"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Medication & Care Health Reminders Section */}
      <div className="rounded-3xl bg-amber-50/80 border border-amber-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif-heading text-stone-900">
              {t.remindersTitle}
            </h3>
            <p className="text-xs text-stone-600">{t.remindersSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`flex items-start justify-between p-4 rounded-2xl border transition ${
                rem.completedToday
                  ? 'bg-emerald-50/60 border-emerald-200 text-stone-700'
                  : 'bg-white border-amber-300 shadow-xs'
              }`}
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    {rem.time}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{rem.categoryLabel}</span>
                </div>
                <h4 className={`text-base font-bold ${rem.completedToday ? 'text-stone-600 line-through' : 'text-stone-900'}`}>
                  {rem.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">{rem.description}</p>
              </div>

              <button
                onClick={() => onToggleReminder(rem.id)}
                className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 min-h-[44px] ${
                  rem.completedToday
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-teal-800 text-white hover:bg-teal-900 shadow-xs'
                }`}
                aria-label={`Mark reminder ${rem.title} as ${rem.completedToday ? 'not done' : 'taken'}`}
              >
                <Check className="w-4 h-4" />
                <span>{rem.completedToday ? t.completed : t.markTaken}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Routine Timeline (Chronological: Morning, Afternoon, Evening) */}
      <div className="space-y-8">
        {/* Morning Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
            <span className="text-xl font-bold font-serif-heading text-stone-900">
              {t.morningRoutine}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              07:00 AM – 11:30 AM
            </span>
          </div>

          <div className="space-y-3">
            {morningTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`cursor-pointer flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition duration-150 active:scale-[0.99] ${
                  task.completed
                    ? 'bg-stone-100/90 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-200 shadow-xs hover:border-teal-400'
                }`}
                role="checkbox"
                aria-checked={task.completed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleTask(task.id);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                      task.completed
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'border-stone-400 bg-white hover:border-teal-700'
                    }`}
                  >
                    {task.completed && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-stone-100 hidden sm:flex">
                      {getTaskIcon(task.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      </div>
                      <h4
                        className={`text-base sm:text-lg font-semibold ${
                          task.completed ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.notes && (
                        <p className="text-xs text-stone-500 mt-0.5">{task.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {task.completed ? t.completed : t.pending}
                  </span>

                  {onDeleteTask && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove activity"
                      aria-label="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {onAddTask && (
              <button
                type="button"
                onClick={() => {
                  setTargetSlot('Morning');
                  setShowAddTaskModal(true);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 text-stone-600 hover:text-teal-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-teal-700" />
                <span>+ Add another activity to Morning</span>
              </button>
            )}
          </div>
        </div>

        {/* Afternoon Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
            <span className="text-xl font-bold font-serif-heading text-stone-900">
              {t.afternoonRoutine}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
              12:00 PM – 04:30 PM
            </span>
          </div>

          <div className="space-y-3">
            {afternoonTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`cursor-pointer flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition duration-150 active:scale-[0.99] ${
                  task.completed
                    ? 'bg-stone-100/90 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-200 shadow-xs hover:border-teal-400'
                }`}
                role="checkbox"
                aria-checked={task.completed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleTask(task.id);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                      task.completed
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'border-stone-400 bg-white hover:border-teal-700'
                    }`}
                  >
                    {task.completed && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-stone-100 hidden sm:flex">
                      {getTaskIcon(task.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      </div>
                      <h4
                        className={`text-base sm:text-lg font-semibold ${
                          task.completed ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.notes && (
                        <p className="text-xs text-stone-500 mt-0.5">{task.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {task.completed ? t.completed : t.pending}
                  </span>

                  {onDeleteTask && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove activity"
                      aria-label="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {onAddTask && (
              <button
                type="button"
                onClick={() => {
                  setTargetSlot('Afternoon');
                  setShowAddTaskModal(true);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 text-stone-600 hover:text-teal-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-teal-700" />
                <span>+ Add another activity to Afternoon</span>
              </button>
            )}
          </div>
        </div>

        {/* Evening Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
            <span className="text-xl font-bold font-serif-heading text-stone-900">
              {t.eveningRoutine}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
              05:00 PM – 09:30 PM
            </span>
          </div>

          <div className="space-y-3">
            {eveningTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`cursor-pointer flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition duration-150 active:scale-[0.99] ${
                  task.completed
                    ? 'bg-stone-100/90 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-200 shadow-xs hover:border-teal-400'
                }`}
                role="checkbox"
                aria-checked={task.completed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleTask(task.id);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                      task.completed
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'border-stone-400 bg-white hover:border-teal-700'
                    }`}
                  >
                    {task.completed && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-stone-100 hidden sm:flex">
                      {getTaskIcon(task.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      </div>
                      <h4
                        className={`text-base sm:text-lg font-semibold ${
                          task.completed ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.notes && (
                        <p className="text-xs text-stone-500 mt-0.5">{task.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {task.completed ? t.completed : t.pending}
                  </span>

                  {onDeleteTask && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove activity"
                      aria-label="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {onAddTask && (
              <button
                type="button"
                onClick={() => {
                  setTargetSlot('Evening');
                  setShowAddTaskModal(true);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 text-stone-600 hover:text-teal-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-teal-700" />
                <span>+ Add another activity to Evening</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Task Modal */}
      {showAddTaskModal && onAddTask && (
        <AddPatientTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={onAddTask}
          lang={lang}
          initialTimeSlot={targetSlot}
        />
      )}
    </div>
  );
};
