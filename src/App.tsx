/**
 * CognitiveSaathi — Frontend Application
 * Problem Statement ID: 26003 (MDoNER)
 * AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in NER
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Sparkles,
  Calendar,
  Heart,
  Settings,
  LayoutDashboard,
  Users,
  User,
  Bell,
  FileText,
  HeartPulse,
  Mic,
  WifiOff,
  RefreshCw,
  Gamepad2,
  LogOut,
} from 'lucide-react';
import {
  UserRole,
  LanguageCode,
  ConnectivityStatus,
  TextScale,
  GameDefinition,
  RoutineTask,
  ReminderItem,
  GameSessionResult,
  PatientProfile,
  CaretakerProfile,
  MemoryMoment,
} from './types';
import { translations } from './lib/i18n';
import {
  OfflineStore,
  DEFAULT_PATIENT,
  DEFAULT_GAMES,
  DEFAULT_ROUTINE,
  DEFAULT_REMINDERS,
  DEFAULT_MEMORIES,
  DEFAULT_RECENT_SESSIONS,
} from './lib/offlineStore';
import { Header } from './components/layout/Header';
import { VoiceAssistantModal } from './components/voice/VoiceAssistantModal';
import { VoicePackModal } from './components/voice/VoicePackModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { PatientHome } from './components/patient/PatientHome';
import { PatientActivities } from './components/patient/PatientActivities';
import { PatientMyDay } from './components/patient/PatientMyDay';
import { PatientMemories } from './components/patient/PatientMemories';
import { PatientSettings } from './components/patient/PatientSettings';
import { PatientMeProfile } from './components/patient/PatientMeProfile';
import { GameContainer } from './components/games/GameContainer';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { CaregiverReminders } from './components/caregiver/CaregiverReminders';
import { CaregiverPatientDetail } from './components/caregiver/CaregiverPatientDetail';
import { CaregiverReports } from './components/caregiver/CaregiverReports';
import { CaregiverMeProfile } from './components/caregiver/CaregiverMeProfile';
import { CaregiverMemoriesManager } from './components/caregiver/CaregiverMemoriesManager';
import { CaregiverActivitiesView } from './components/caregiver/CaregiverActivitiesView';
import { CaretakerRoutineManager } from './components/caregiver/CaretakerRoutineManager';
import { AICaretakerCompanion } from './components/ai/AICaretakerCompanion';
import { HealthcareDashboard } from './components/healthcare/HealthcareDashboard';
import { AddPatientModal } from './components/caregiver/AddPatientModal';
import { LogoutConfirmModal } from './components/common/LogoutConfirmModal';
import { Bot, Lock } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  // Authentication & Initial Role Selection Gate (Persistent across reloads)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const session = OfflineStore.getAuthSession();
    return Boolean(session);
  });
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  // Theme (Dark / Light Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cognitive_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cognitive_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Roles & View Navigation
  const [role, setRole] = useState<UserRole>(() => {
    const session = OfflineStore.getAuthSession();
    return session?.role || 'PATIENT';
  });
  const [patientTab, setPatientTab] = useState<'home' | 'activities' | 'my_day' | 'memories' | 'me' | 'settings'>('home');
  const [caregiverTab, setCaregiverTab] = useState<'dashboard' | 'activities' | 'memories' | 'routine' | 'reminders' | 'patient_detail' | 'reports' | 'me'>('dashboard');
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);

  // Scroll isolation fix: reset scroll position whenever view, tab, or role changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.getElementById('main-content-area');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [patientTab, caregiverTab, role, activeGame]);

  // Caregiver Patient Registration Modal
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState<boolean>(false);

  // Localization
  const [lang, setLang] = useState<LanguageCode>('en');
  const t = translations[lang];

  // Accessibility & Display Preferences
  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isVoicePackModalOpen, setIsVoicePackModalOpen] = useState<boolean>(false);
  const [isAiCompanionOpen, setIsAiCompanionOpen] = useState<boolean>(false);

  // Connectivity & Synchronization
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>('CONNECTED');

  // Application Data & Local Offline Store
  const [allPatients, setAllPatients] = useState<PatientProfile[]>(() => OfflineStore.getPatients());
  const [activeCaretaker, setActiveCaretaker] = useState<CaretakerProfile | null>(() => {
    const session = OfflineStore.getAuthSession();
    if (session?.role === 'CAREGIVER' && session.caretakerId) {
      const caretakers = OfflineStore.getCaretakers();
      return caretakers.find((c) => c.id === session.caretakerId) || null;
    }
    return null;
  });

  // Filter patients belonging to active caregiver (or all if not caregiver)
  const caregiverPatients = useMemo(() => {
    if (!activeCaretaker) return allPatients;
    return allPatients.filter(
      (p) =>
        activeCaretaker.assignedPatientIds?.includes(p.id) ||
        (p.linkedCaregiverKey &&
          activeCaretaker.caregiverKey &&
          p.linkedCaregiverKey.toUpperCase() === activeCaretaker.caregiverKey.toUpperCase())
    );
  }, [allPatients, activeCaretaker]);

  const [patient, setPatient] = useState<PatientProfile>(() => {
    const session = OfflineStore.getAuthSession();
    if (session?.role === 'CAREGIVER') {
      if (session.patientId) {
        const found = OfflineStore.getPatient(session.patientId);
        if (found) return found;
      }
      // Clean slate if caregiver has no patients assigned
      return {
        id: '',
        fullName: '',
        preferredName: '',
        username: '',
        age: 0,
        region: '',
        state: '',
        preferredLanguage: 'en',
        caregiverName: '',
        caregiverPhone: '',
        avatarUrl: '',
        dailyStreak: 0,
        todayCompletedCount: 0,
      };
    }
    if (session?.patientId) {
      const found = OfflineStore.getPatient(session.patientId);
      if (found) return found;
    }
    return OfflineStore.getPatient() || DEFAULT_PATIENT;
  });
  const [routine, setRoutine] = useState<RoutineTask[]>(DEFAULT_ROUTINE);
  const [reminders, setReminders] = useState<ReminderItem[]>(DEFAULT_REMINDERS);
  const [memories, setMemories] = useState<MemoryMoment[]>(() => OfflineStore.getMemories());
  const [sessions, setSessions] = useState<GameSessionResult[]>(DEFAULT_RECENT_SESSIONS);

  // Initialize data from local storage & register Service Worker
  useEffect(() => {
    const session = OfflineStore.getAuthSession();
    if (session) {
      if (session.role === 'PATIENT' && session.patientId) {
        const found = OfflineStore.getPatient(session.patientId);
        const p = found || DEFAULT_PATIENT;
        setPatient(p);
        setRoutine(OfflineStore.getRoutine(p.id));
        setReminders(OfflineStore.getReminders(p.id));
        setSessions(OfflineStore.getSessions(p.id));
        setMemories(OfflineStore.getMemories(p.id));
      } else if (session.role === 'CAREGIVER') {
        let currentC: CaretakerProfile | null = null;
        if (session.caretakerId) {
          const caretakers = OfflineStore.getCaretakers();
          currentC = caretakers.find((c) => c.id === session.caretakerId) || null;
          if (currentC) setActiveCaretaker(currentC);
        }
        if (session.patientId) {
          const found = OfflineStore.getPatient(session.patientId);
          if (found) {
            setPatient(found);
            setRoutine(OfflineStore.getRoutine(found.id));
            setReminders(OfflineStore.getReminders(found.id));
            setSessions(OfflineStore.getSessions(found.id));
            setMemories(OfflineStore.getMemories(found.id));
            return;
          }
        }
        // If caregiver has no assigned patients, keep clean slate
        if (!currentC || !currentC.assignedPatientIds || currentC.assignedPatientIds.length === 0) {
          setPatient({
            id: '',
            fullName: '',
            preferredName: '',
            username: '',
            age: 0,
            region: '',
            state: '',
            preferredLanguage: 'en',
            caregiverName: currentC?.fullName || '',
            caregiverPhone: currentC?.phone || '',
            avatarUrl: '',
            dailyStreak: 0,
            todayCompletedCount: 0,
            linkedCaregiverKey: currentC?.caregiverKey,
          });
          setRoutine([]);
          setReminders([]);
          setSessions([]);
          setMemories([]);
        }
      }
    }

    // Initial online check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setConnectivity('OFFLINE');
    }

    const handleOnline = () => {
      setConnectivity('SYNCING');
      setTimeout(() => {
        OfflineStore.clearSyncQueue();
        setConnectivity('CONNECTED');
      }, 1500);
    };

    const handleOffline = () => {
      setConnectivity('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manual trigger for testing sync
  const handleTriggerSync = () => {
    setConnectivity('SYNCING');
    setTimeout(() => {
      OfflineStore.clearSyncQueue();
      setSessions(OfflineStore.getSessions());
      setConnectivity('CONNECTED');
    }, 1200);
  };

  // Routine Checklist Toggle & Patient Self-Management
  const handleToggleRoutineTask = (taskId: string) => {
    const updated = routine.map((r) =>
      r.id === taskId ? { ...r, completed: !r.completed } : r
    );
    setRoutine(updated);
    OfflineStore.saveRoutine(updated);
  };

  const handleAddPatientTask = (task: RoutineTask) => {
    const updated = [...routine, task];
    setRoutine(updated);
    OfflineStore.saveRoutine(updated);
  };

  const handleDeleteRoutineTask = (taskId: string) => {
    const updated = routine.filter((r) => r.id !== taskId);
    setRoutine(updated);
    OfflineStore.saveRoutine(updated);
  };

  // Reminders Toggle & Management
  const handleToggleReminder = (remId: string) => {
    const updated = reminders.map((rem) =>
      rem.id === remId ? { ...rem, completedToday: !rem.completedToday } : rem
    );
    setReminders(updated);
    OfflineStore.saveReminders(updated);
  };

  const handleAddReminder = (item: ReminderItem) => {
    const updated = [item, ...reminders];
    setReminders(updated);
    OfflineStore.saveReminders(updated);
  };

  const handleToggleReminderEnabled = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    OfflineStore.saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    OfflineStore.saveReminders(updated);
  };

  // Memory Moments Handlers (Available for both Caregiver and Patient)
  const handleAddMemory = (newMem: MemoryMoment) => {
    const updated = OfflineStore.addMemory(newMem, patient.id);
    setMemories(updated);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = OfflineStore.deleteMemory(id, patient.id);
    setMemories(updated);
  };

  // Game Launcher
  const handleStartGame = (gameId: string) => {
    const g = DEFAULT_GAMES.find((item) => item.id === gameId);
    if (g) {
      setActiveGame(g);
    }
  };

  const handleExitGame = () => {
    setActiveGame(null);
  };

  const handleSessionRecorded = (session: GameSessionResult) => {
    setSessions((prev) => [session, ...prev]);
    setPatient((prev) => ({
      ...prev,
      todayCompletedCount: prev.todayCompletedCount + 1,
    }));
  };

  // Dynamic Text Scaling classes applied to container
  const getTextScaleClass = () => {
    switch (textScale) {
      case 'large':
        return 'text-lg [&_p]:text-lg [&_h2]:text-3xl [&_h3]:text-2xl [&_button]:text-base';
      case 'extralarge':
        return 'text-xl [&_p]:text-xl [&_h2]:text-4xl [&_h3]:text-3xl [&_button]:text-lg';
      case 'normal':
      default:
        return 'text-base';
    }
  };

  // Direct role switching (Security PIN removed per user request)
  const handleRequestUnlockCaregiver = (targetRole: UserRole = 'CAREGIVER') => {
    setRole(targetRole);
    if (targetRole === 'CAREGIVER') {
      setCaregiverTab('dashboard');
    }
    setActiveGame(null);
  };

  const handleLockToPatient = () => {
    setRole('PATIENT');
    setPatientTab('home');
    setActiveGame(null);
  };

  const handleOpenDashboard = () => {
    setRole('CAREGIVER');
    setCaregiverTab('dashboard');
    setActiveGame(null);
  };

  const handleSaveNewPatient = (newPatient: PatientProfile) => {
    OfflineStore.addPatient(newPatient);
    if (activeCaretaker) {
      const updatedC = {
        ...activeCaretaker,
        assignedPatientIds: Array.from(new Set([...(activeCaretaker.assignedPatientIds || []), newPatient.id])),
      };
      OfflineStore.addCaretaker(updatedC);
      setActiveCaretaker(updatedC);
    }
    const updatedPatients = OfflineStore.getPatients();
    setAllPatients(updatedPatients);
    setPatient(newPatient);
    OfflineStore.setActivePatientId(newPatient.id);
    const patientRoutine = OfflineStore.getRoutine(newPatient.id);
    setRoutine(patientRoutine);
    const patientMemories = OfflineStore.getMemories(newPatient.id);
    setMemories(patientMemories);
    setReminders(OfflineStore.getReminders(newPatient.id));
    setSessions(OfflineStore.getSessions(newPatient.id));
  };

  const handleUpdatePatient = (updated: PatientProfile) => {
    OfflineStore.savePatient(updated);
    setPatient(updated);
    setAllPatients(OfflineStore.getPatients());
  };

  const handleDeletePatient = (patientId: string) => {
    OfflineStore.deletePatient(patientId);
    if (activeCaretaker) {
      const updatedC = {
        ...activeCaretaker,
        assignedPatientIds: (activeCaretaker.assignedPatientIds || []).filter((id) => id !== patientId),
      };
      OfflineStore.addCaretaker(updatedC);
      setActiveCaretaker(updatedC);
    }
    const updated = OfflineStore.getPatients();
    setAllPatients(updated);
    const remainingForCaregiver = updated.filter(
      (p) =>
        activeCaretaker?.assignedPatientIds?.includes(p.id) ||
        (p.linkedCaregiverKey &&
          activeCaretaker?.caregiverKey &&
          p.linkedCaregiverKey.toUpperCase() === activeCaretaker.caregiverKey.toUpperCase())
    );
    if (remainingForCaregiver.length > 0) {
      const nextP = remainingForCaregiver[0];
      setPatient(nextP);
      OfflineStore.setActivePatientId(nextP.id);
      setRoutine(OfflineStore.getRoutine(nextP.id));
      setMemories(OfflineStore.getMemories(nextP.id));
      setSessions(OfflineStore.getSessions(nextP.id));
      setReminders(OfflineStore.getReminders(nextP.id));
    } else {
      setPatient({
        id: '',
        fullName: '',
        preferredName: '',
        username: '',
        age: 0,
        region: '',
        state: '',
        preferredLanguage: 'en',
        caregiverName: activeCaretaker?.fullName || '',
        caregiverPhone: activeCaretaker?.phone || '',
        avatarUrl: '',
        dailyStreak: 0,
        todayCompletedCount: 0,
        linkedCaregiverKey: activeCaretaker?.caregiverKey,
      });
      setRoutine([]);
      setMemories([]);
      setSessions([]);
      setReminders([]);
    }
  };

  const handleConfirmLogout = () => {
    OfflineStore.clearAuthSession();
    setIsLoggedIn(false);
    setActiveGame(null);
    setIsLogoutConfirmOpen(false);
  };

  // If user has not selected role/logged in yet, display Welcome & Role Selection Gate first
  if (!isLoggedIn) {
    return (
      <LoginScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginPatient={(loggedInPatient) => {
          setPatient(loggedInPatient);
          setAllPatients(OfflineStore.getPatients());
          setRoutine(OfflineStore.getRoutine(loggedInPatient.id));
          setReminders(OfflineStore.getReminders(loggedInPatient.id));
          setMemories(OfflineStore.getMemories(loggedInPatient.id));
          setSessions(OfflineStore.getSessions(loggedInPatient.id));
          setRole('PATIENT');
          setPatientTab('home');
          setIsLoggedIn(true);
        }}
        onLoginCaregiver={(caretaker, selectedPatient) => {
          setActiveCaretaker(caretaker);
          setAllPatients(OfflineStore.getPatients());
          if (selectedPatient) {
            setPatient(selectedPatient);
            setRoutine(OfflineStore.getRoutine(selectedPatient.id));
            setReminders(OfflineStore.getReminders(selectedPatient.id));
            setMemories(OfflineStore.getMemories(selectedPatient.id));
            setSessions(OfflineStore.getSessions(selectedPatient.id));
          } else {
            // Clean slate for new caregiver: no pre-loaded patient, reports, or data
            setPatient({
              id: '',
              fullName: '',
              preferredName: '',
              username: '',
              age: 0,
              region: '',
              state: '',
              preferredLanguage: 'en',
              caregiverName: caretaker.fullName,
              caregiverPhone: caretaker.phone,
              avatarUrl: '',
              dailyStreak: 0,
              todayCompletedCount: 0,
              linkedCaregiverKey: caretaker.caregiverKey,
            });
            setRoutine([]);
            setReminders([]);
            setMemories([]);
            setSessions([]);
          }
          setRole('CAREGIVER');
          setCaregiverTab('dashboard');
          setIsLoggedIn(true);
        }}
        lang={lang}
        onLangChange={setLang}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        highContrast ? 'bg-amber-50/20 text-stone-950 font-medium' : 'bg-[#FBF9F5] dark:bg-[#0D1117] text-[#292524] dark:text-[#E6EDF3]'
      } ${getTextScaleClass()}`}
    >
      {/* Universal Header Shell */}
      <Header
        currentRole={role}
        onRoleChange={(newRole) => {
          if (newRole === 'PATIENT') {
            handleLockToPatient();
          } else if (role === 'PATIENT') {
            handleRequestUnlockCaregiver(newRole);
          } else {
            setRole(newRole);
            setActiveGame(null);
          }
        }}
        onRequestUnlockCaregiver={handleRequestUnlockCaregiver}
        onOpenDashboard={handleOpenDashboard}
        isViewingDashboard={role === 'CAREGIVER' && caregiverTab === 'dashboard'}
        lang={lang}
        onLangChange={setLang}
        connectivity={connectivity}
        onSyncTrigger={handleTriggerSync}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenVoicePack={() => setIsVoicePackModalOpen(true)}
        textScale={textScale}
        onTextScaleChange={setTextScale}
        patientName={patient.fullName}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Offline Toast Banner if disconnected */}
      {connectivity === 'OFFLINE' && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.offlineNotice}</span>
            <button
              onClick={handleTriggerSync}
              className="ml-auto underline font-bold hover:text-stone-800"
            >
              Test Reconnect
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        id="main-content-area"
        className={`flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 ${
          role === 'PATIENT' && !activeGame ? 'pb-36 sm:pb-40' : 'pb-16'
        }`}
      >
        {/* If patient is actively playing a cognitive game, render GameContainer directly */}
        {activeGame ? (
          <GameContainer
            game={activeGame}
            lang={lang}
            onExit={handleExitGame}
            onSessionRecorded={handleSessionRecorded}
          />
        ) : (
          <>
            {/* PATIENT ROLE EXPERIENCE */}
            {role === 'PATIENT' && (
              <>
                {patientTab === 'home' && (
                  <PatientHome
                    patient={patient}
                    lang={lang}
                    primaryGame={DEFAULT_GAMES[0]}
                    onStartGame={handleStartGame}
                    onNavigateTab={(tab) => setPatientTab(tab as any)}
                    routine={routine}
                    onAddTask={handleAddPatientTask}
                    reminders={reminders}
                    onOpenAiCompanion={() => setIsAiCompanionOpen(true)}
                  />
                )}

                {patientTab === 'activities' && (
                  <PatientActivities
                    games={DEFAULT_GAMES}
                    lang={lang}
                    onSelectGame={handleStartGame}
                  />
                )}

                {patientTab === 'my_day' && (
                  <PatientMyDay
                    routine={routine}
                    onToggleTask={handleToggleRoutineTask}
                    onAddTask={handleAddPatientTask}
                    onDeleteTask={handleDeleteRoutineTask}
                    reminders={reminders}
                    onToggleReminder={handleToggleReminder}
                    lang={lang}
                  />
                )}

                {patientTab === 'memories' && (
                  <PatientMemories
                    memories={memories}
                    lang={lang}
                    onAddMemory={handleAddMemory}
                  />
                )}

                {(patientTab === 'me' || patientTab === 'settings') && (
                  <PatientMeProfile
                    patient={patient}
                    lang={lang}
                    onLangChange={setLang}
                    textScale={textScale}
                    onTextScaleChange={setTextScale}
                    voiceEnabled={voiceEnabled}
                    onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                    highContrast={highContrast}
                    onToggleHighContrast={() => setHighContrast(!highContrast)}
                    onOpenCaregiverDashboard={handleOpenDashboard}
                    onUpdatePatient={handleUpdatePatient}
                    onDeletePatient={handleDeletePatient}
                    onLogout={() => setIsLogoutConfirmOpen(true)}
                    completedRoutineCount={routine.filter((r) => r.completed).length}
                    totalRoutineCount={routine.length}
                  />
                )}
              </>
            )}

            {/* CAREGIVER ROLE EXPERIENCE */}
            {role === 'CAREGIVER' && (
              <div className="space-y-6">
                {/* Caregiver Navigation Bar - Multi-page organized layout */}
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <button
                    onClick={() => setCaregiverTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'dashboard'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t.navDashboard}</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('activities')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'activities'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Memory Workout</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('memories')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'memories'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <span>Memories & Albums</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('routine')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'routine'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Manage Routines</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('reminders')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'reminders'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Manage Reminders</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('patient_detail')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      caregiverTab === 'patient_detail'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Patient Profile & History</span>
                  </button>

                  <button
                    onClick={() => setCaregiverTab('reports')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                      caregiverTab === 'reports'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Clinical Reports</span>
                  </button>

                  <button
                    id="caregiver-nav-me-btn"
                    onClick={() => setCaregiverTab('me')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                      caregiverTab === 'me'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Me</span>
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold transition"
                      title="Log Out to Welcome Screen"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {caregiverTab === 'dashboard' && (
                  <CaregiverDashboard
                    patient={patient}
                    allPatients={caregiverPatients}
                    onSelectPatient={(selectedP) => {
                      setPatient(selectedP);
                      OfflineStore.setActivePatientId(selectedP.id);
                      setRoutine(OfflineStore.getRoutine(selectedP.id));
                      setMemories(OfflineStore.getMemories(selectedP.id));
                      setSessions(OfflineStore.getSessions(selectedP.id));
                      setReminders(OfflineStore.getReminders(selectedP.id));
                    }}
                    onAddNewPatient={() => setIsAddPatientModalOpen(true)}
                    onDeletePatient={handleDeletePatient}
                    reminders={reminders}
                    sessions={sessions}
                    routine={routine}
                    onUpdateRoutine={(newRoutine) => setRoutine(newRoutine)}
                    lang={lang}
                    onNavigateTab={(tab) => setCaregiverTab(tab as any)}
                    caretaker={activeCaretaker}
                  />
                )}

                {caregiverTab === 'activities' && (
                  <CaregiverActivitiesView
                    patient={patient}
                    games={DEFAULT_GAMES}
                    sessions={sessions}
                    lang={lang}
                  />
                )}

                {caregiverTab === 'routine' && (
                  <CaretakerRoutineManager
                    patient={patient}
                    routine={routine}
                    onUpdateRoutine={(newRoutine) => setRoutine(newRoutine)}
                  />
                )}

                {caregiverTab === 'patient_detail' && (
                  <CaregiverPatientDetail
                    patient={patient}
                    sessions={sessions}
                    routine={routine}
                    onUpdateRoutine={(newRoutine) => setRoutine(newRoutine)}
                    lang={lang}
                    onLockToPatient={handleLockToPatient}
                    onAddNewPatient={() => setIsAddPatientModalOpen(true)}
                  />
                )}

                {caregiverTab === 'reminders' && (
                  <CaregiverReminders
                    reminders={reminders}
                    onAddReminder={handleAddReminder}
                    onToggleReminderEnabled={handleToggleReminderEnabled}
                    onDeleteReminder={handleDeleteReminder}
                    lang={lang}
                  />
                )}

                {caregiverTab === 'memories' && (
                  <CaregiverMemoriesManager
                    patient={patient}
                    memories={memories}
                    onAddMemory={handleAddMemory}
                    onDeleteMemory={handleDeleteMemory}
                    lang={lang}
                  />
                )}

                {caregiverTab === 'reports' && (
                  <CaregiverReports
                    patient={patient}
                    sessions={sessions}
                    reminders={reminders}
                    routine={routine}
                    lang={lang}
                  />
                )}

                {caregiverTab === 'me' && (
                  <CaregiverMeProfile
                    caretaker={activeCaretaker}
                    onUpdateCaretaker={(updated) => {
                      setActiveCaretaker(updated);
                    }}
                    patients={caregiverPatients}
                    activePatientId={patient.id}
                    onSelectPatient={(selectedP) => {
                      setPatient(selectedP);
                      OfflineStore.setActivePatientId(selectedP.id);
                      setRoutine(OfflineStore.getRoutine(selectedP.id));
                      setReminders(OfflineStore.getReminders(selectedP.id));
                      setMemories(OfflineStore.getMemories(selectedP.id));
                      setSessions(OfflineStore.getSessions(selectedP.id));
                    }}
                    onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
                    onViewPatientDetail={(p) => {
                      setPatient(p);
                      OfflineStore.setActivePatientId(p.id);
                      setCaregiverTab('patient_detail');
                    }}
                    onUnlinkPatient={(pId) => {
                      setAllPatients(OfflineStore.getPatients());
                      if (patient.id === pId) {
                        const remaining = caregiverPatients.filter((p) => p.id !== pId);
                        if (remaining.length > 0) {
                          setPatient(remaining[0]);
                        }
                      }
                    }}
                    lang={lang}
                    onLangChange={setLang}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    highContrast={highContrast}
                    onToggleHighContrast={() => setHighContrast(!highContrast)}
                    textScale={textScale}
                    onTextScaleChange={setTextScale}
                    onLogout={() => setIsLogoutConfirmOpen(true)}
                    onOpenVoicePack={() => setIsVoicePackModalOpen(true)}
                  />
                )}
              </div>
            )}

            {/* HEALTHCARE WORKER ROLE EXPERIENCE */}
            {role === 'HEALTHCARE_WORKER' && (
              <HealthcareDashboard
                patient={patient}
                sessions={sessions}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Patient Bottom Navigation Bar (TRD Section 5 & 7: Simple navigation, predictable choice) */}
      {role === 'PATIENT' && !activeGame && (
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-[#FBF9F5]/98 dark:bg-[#161B22]/98 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md py-2 px-4 shadow-lg transition-colors"
          aria-label="Patient Primary Navigation"
        >
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
            <button
              onClick={() => setPatientTab('home')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition ${
                patientTab === 'home'
                  ? 'text-teal-900 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Home className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] mt-1 font-semibold">{t.navHome}</span>
            </button>

            <button
              onClick={() => setPatientTab('activities')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition ${
                patientTab === 'activities'
                  ? 'text-teal-900 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] mt-1 font-semibold">{t.navActivities}</span>
            </button>

            <button
              onClick={() => setPatientTab('my_day')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition ${
                patientTab === 'my_day'
                  ? 'text-teal-900 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Calendar className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] mt-1 font-semibold">{t.navMyDay}</span>
            </button>

            <button
              onClick={() => setPatientTab('memories')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition ${
                patientTab === 'memories'
                  ? 'text-teal-900 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Heart className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] mt-1 font-semibold">{t.navMemories}</span>
            </button>

            <button
              id="patient-nav-me-btn"
              onClick={() => setPatientTab('me')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition ${
                patientTab === 'me' || patientTab === 'settings'
                  ? 'text-teal-900 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <User className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] mt-1 font-semibold">{t.navMe}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Voice Assistant Interactive Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={lang}
        onSelectGame={(gameId) => handleStartGame(gameId)}
        onNavigateTab={(tab) => {
          if (role === 'PATIENT') {
            setPatientTab(tab as any);
          }
        }}
      />

      {/* Voice Clarity & Voice Pack Modal */}
      <VoicePackModal
        isOpen={isVoicePackModalOpen}
        onClose={() => setIsVoicePackModalOpen(false)}
        lang={lang}
      />

      {/* AI Caretaker Companion Modal (Voice & Text conversational companion) */}
      <AICaretakerCompanion
        isOpen={isAiCompanionOpen}
        onClose={() => setIsAiCompanionOpen(false)}
        patient={patient}
        lang={lang}
        routineCount={routine.filter((r) => r.completed).length}
      />

      {/* Add / Register New Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSave={handleSaveNewPatient}
        currentCaretaker={activeCaretaker}
        lang={lang}
      />

      {/* Logout Confirmation Prompt Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        userName={patient.preferredName || patient.fullName}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
