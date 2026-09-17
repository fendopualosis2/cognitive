import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, Clock, Calendar, ShieldCheck, Heart, Volume2, Bot, MessageSquare, Flame, Plus } from 'lucide-react';
import { PatientProfile, LanguageCode, GameDefinition, RoutineTask, ReminderItem } from '../../types';
import { translations, getGameTranslation } from '../../lib/i18n';
import { VoiceService } from '../../lib/voiceService';
import { AddPatientTaskModal } from './AddPatientTaskModal';

interface PatientHomeProps {
  patient: PatientProfile;
  lang: LanguageCode;
  primaryGame: GameDefinition;
  onStartGame: (gameId: string) => void;
  onNavigateTab: (tab: string) => void;
  routine: RoutineTask[];
  onAddTask?: (task: RoutineTask) => void;
  reminders: ReminderItem[];
  onOpenAiCompanion?: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patient,
  lang,
  primaryGame,
  onStartGame,
  onNavigateTab,
  routine,
  onAddTask,
  reminders,
  onOpenAiCompanion,
}) => {
  const t = translations[lang] || translations.en;
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const localizedPrimary = getGameTranslation(primaryGame.id, lang);

  // Dynamic greeting based on current time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;

  const nextRoutineItem = routine.find((r) => !r.completed);
  const pendingMedicine = reminders.find((r) => r.type === 'MEDICINE' && !r.completedToday);

  const handleSpeakGreeting = () => {
    const textToSpeak = `${greeting}, ${patient.preferredName || patient.fullName}. ${t.whoAmI} ${localizedPrimary.title}.`;
    VoiceService.speak(textToSpeak, lang);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Reassurance & Personal Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-teal-950 text-white p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold tracking-wide border border-teal-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.everythingOkay}</span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
                {greeting}, {patient.preferredName}
              </h2>
              <button
                onClick={handleSpeakGreeting}
                className="p-2 rounded-full bg-teal-800/80 text-amber-300 hover:bg-teal-700 transition"
                aria-label="Listen to greeting"
                title="Hear greeting aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
              {t.whoAmI} {t.everythingOkaySub}
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-teal-800/80 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-teal-300 font-semibold block">Daily Streak</span>
              <div className="text-2xl font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{patient.dailyStreak} Days</span>
              </div>
            </div>
            {onOpenAiCompanion && (
              <button
                onClick={onOpenAiCompanion}
                className="ml-auto md:ml-2 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs shadow-sm transition"
              >
                <Bot className="w-4 h-4 text-teal-900" />
                <span>Talk with Saathi AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duolingo-Style Streak Tracker Banner (Fully Dynamic) */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner shrink-0">
            <Flame className="w-8 h-8 text-amber-200 fill-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                {(patient.dailyStreak || 0) <= 0
                  ? 'Start Your Daily Streak!'
                  : `${patient.dailyStreak} Day Streak!`}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold uppercase tracking-wider">
                Day {Math.max(1, patient.dailyStreak || 1)}
              </span>
            </div>
            <p className="text-amber-100 text-xs sm:text-sm mt-0.5 font-medium">
              {(patient.todayCompletedCount || 0) > 0
                ? "Wonderful! You've completed your gentle exercise for today."
                : "Complete your gentle activity today to build your streak."}
            </p>
          </div>
        </div>

        {/* 7-Day Flame Tracker Circles */}
        <div className="flex items-center gap-2 bg-black/15 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20 self-stretch sm:self-auto justify-between sm:justify-start">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            const streakCount = patient.dailyStreak || 0;
            const completedToday = (patient.todayCompletedCount || 0) > 0;
            // How many days in the 7-day row are finished with flames
            const completedPastDays = completedToday ? streakCount : Math.max(0, streakCount - 1);
            const isCompleted = idx < completedPastDays;
            const isToday = idx === Math.min(6, Math.max(0, (streakCount || 1) - 1));

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-amber-100">{day}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                    isToday && !completedToday
                      ? 'bg-white text-orange-600 ring-2 ring-amber-200 scale-110 shadow-xs'
                      : isCompleted || (isToday && completedToday)
                      ? 'bg-amber-300 text-orange-950 font-bold'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {isCompleted || (isToday && completedToday) ? '🔥' : '○'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Picture 2 Style Hero Card: TODAY'S GENTLE ACTIVITY */}
      <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header row: Badge + Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.todaysFocus || "TODAY'S GENTLE ACTIVITY"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>
              {primaryGame.estimatedMinutes || 3} {t.minutesUnit}
            </span>
          </div>
        </div>

        {/* Card Body: Left Icon Box + Right Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Left Decorative Square Icon Box */}
          <div className="w-full sm:w-44 sm:h-40 rounded-2xl bg-teal-50/80 border border-teal-100 flex flex-col items-center justify-center p-4 text-center shrink-0">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-2.5 shadow-xs">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-teal-900 uppercase leading-snug">
              {localizedPrimary.culturalTag}
            </span>
          </div>

          {/* Right Activity Description & Action Buttons */}
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
                {localizedPrimary.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-2">
                {localizedPrimary.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                id="start-activity-btn"
                onClick={() => onStartGame(primaryGame.id)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-base shadow-sm transition active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-amber-300" />
                <span>{t.startActivity}</span>
              </button>

              <button
                onClick={() => onNavigateTab('activities')}
                className="text-teal-800 hover:text-teal-950 font-semibold text-sm transition cursor-pointer"
              >
                {t.backToActivities} →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Picture 2 Style 2-Column Grid: NEXT IN YOUR DAY + HEALTH & WELLNESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Box: NEXT IN YOUR DAY */}
        <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>{t.myDayTitle}</span>
              </div>
              {onAddTask && (
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full transition"
                  title="Add activity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add Task</span>
                </button>
              )}
            </div>

            {nextRoutineItem ? (
              <div className="space-y-1.5">
                <h4 className="text-xl font-bold font-serif-heading text-stone-900">
                  {nextRoutineItem.title}
                </h4>
                <p className="text-sm font-semibold text-teal-800">
                  Scheduled for {nextRoutineItem.time} ({nextRoutineItem.timeSlot})
                </p>
                {nextRoutineItem.notes && (
                  <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                    {nextRoutineItem.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-xl font-bold font-serif-heading text-stone-900">
                  All routines completed!
                </h4>
                <p className="text-sm text-stone-600">
                  Take a restful evening break with family.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('my_day')}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition text-center"
            >
              View Routine →
            </button>
            {onAddTask && (
              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="py-3 px-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Box: HEALTH & WELLNESS */}
        <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>HEALTH & WELLNESS</span>
            </div>

            {pendingMedicine ? (
              <div className="space-y-1.5">
                <h4 className="text-xl font-bold font-serif-heading text-stone-900">
                  {pendingMedicine.title}
                </h4>
                <p className="text-sm text-stone-700">
                  {pendingMedicine.description}
                </p>
                <div className="inline-block mt-1 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                  Time: {pendingMedicine.time}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-lg font-serif-heading">
                  <CheckCircle2 className="w-5 h-5 text-teal-700" />
                  <span>Medicine Taken on Time</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  All prescribed morning medications have been taken safely.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('my_day')}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 text-sm font-semibold transition text-center"
          >
            Check Daily Checklist →
          </button>
        </div>
      </div>

      {/* Cherished Memories Card */}
      <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Reminiscence & Family
              </span>
            </div>
            <h4 className="text-xl font-bold font-serif-heading text-stone-900 mt-1">
              Your Memory Album & Stories
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Revisit cherished family photos, festival celebrations, and audio stories. You can also add your own new memories.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('memories')}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-xs transition"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Open Memory Album →</span>
        </button>
      </div>

      {/* Gentle AI Caretaker Companion Banner */}
      {onOpenAiCompanion && (
        <div className="rounded-3xl bg-gradient-to-r from-teal-50 via-amber-50 to-teal-50 border border-teal-200/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Saathi AI • Your Compassionate Caretaker
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Ask questions, listen to calming regional memories, or check what to do next anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAiCompanion}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Open AI Companion</span>
          </button>
        </div>
      )}

      {/* Add Patient Task Modal */}
      {showAddTaskModal && onAddTask && (
        <AddPatientTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={onAddTask}
          lang={lang}
          initialTimeSlot="Morning"
        />
      )}
    </div>
  );
};
