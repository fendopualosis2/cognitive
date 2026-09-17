import { GameSessionResult, RoutineTask, ReminderItem, PatientProfile, CaretakerProfile, SyncEvent, MemoryMoment, GameDefinition, AuthSession } from '../types';

export const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    id: 'patient-senior-1',
    fullName: 'Ramesh Sharma',
    preferredName: 'Ramesh',
    username: 'ramesh',
    password: 'password123',
    pin: '5678',
    patientKey: 'PT-RAMESH72',
    linkedCaregiverKey: 'CG-CARE88',
    age: 72,
    region: 'Guwahati, Assam',
    state: 'Assam',
    preferredLanguage: 'en',
    caregiverName: 'Priya Sharma (Daughter)',
    caregiverPhone: '+91 94350 12345',
    avatarUrl: '',
    dailyStreak: 0,
    todayCompletedCount: 0,
    phone: '9435011111',
    hasCaregiver: true,
  },
  {
    id: 'patient-independent-2',
    fullName: 'Biren Kalita',
    preferredName: 'Biren',
    username: 'biren',
    password: 'password123',
    pin: '4321',
    patientKey: 'PT-BIREN76',
    age: 76,
    region: 'Guwahati, Assam',
    state: 'Assam',
    preferredLanguage: 'as',
    caregiverName: 'Self',
    caregiverPhone: '+91 94350 22222',
    avatarUrl: '',
    dailyStreak: 0,
    todayCompletedCount: 0,
    phone: '9435022222',
    hasCaregiver: false,
  },
];

export const DEFAULT_PATIENT: PatientProfile = DEFAULT_PATIENTS[0];

export const DEFAULT_CARETAKERS: CaretakerProfile[] = [
  {
    id: 'caretaker-priya',
    fullName: 'Priya Sharma',
    username: 'priya',
    password: 'password123',
    phone: '+91 94350 12345',
    email: 'priya.care@cognitivesaathi.org',
    relation: 'Daughter & Primary Caregiver',
    pin: '5678',
    caregiverKey: 'CG-CARE88',
    avatarUrl: '',
    assignedPatientIds: ['patient-senior-1'],
  },
];

export const DEFAULT_GAMES: GameDefinition[] = [
  {
    id: 'find-matching',
    title: 'Find Matching Object',
    category: 'MEMORY',
    shortDescription: 'Match familiar objects like the tea cup, clay diya, and reading glasses with gentle guidance.',
    estimatedMinutes: 3,
    iconName: 'Sparkles',
    culturalTag: 'Familiar Comforts',
    difficultyLevels: 3,
  },
  {
    id: 'attention-focus',
    title: 'Find Target',
    category: 'ATTENTION',
    shortDescription: 'Spot the gentle blooming lotus or teacup among peaceful garden leaves at your own pace.',
    estimatedMinutes: 3,
    iconName: 'Eye',
    culturalTag: 'Nature & Tea Estates',
    difficultyLevels: 3,
  },
  {
    id: 'pattern-sequence',
    title: 'Complete Pattern',
    category: 'PATTERN',
    shortDescription: 'Follow traditional textile diamond and floral motifs to complete the serene sequence.',
    estimatedMinutes: 4,
    iconName: 'Grid',
    culturalTag: 'Traditional Handloom',
    difficultyLevels: 3,
  },
  {
    id: 'daily-routine',
    title: 'Morning Routine Steps',
    category: 'ROUTINE',
    shortDescription: 'Reinforce peaceful daily habits: warm tea, prescribed morning tablet, and garden walk.',
    estimatedMinutes: 3,
    iconName: 'CalendarCheck',
    culturalTag: 'Daily Independence',
    difficultyLevels: 2,
  },
  {
    id: 'object-familiarity',
    title: 'Everyday Household Objects',
    category: 'RECOGNITION',
    shortDescription: 'Identify everyday comfort objects like reading glasses, brass kettle, and clay diya.',
    estimatedMinutes: 3,
    iconName: 'Smile',
    culturalTag: 'Household Comforts',
    difficultyLevels: 2,
  },
];

export const DEFAULT_ROUTINE: RoutineTask[] = [
  {
    id: 'task-1',
    title: 'Morning Lal Chai (Warm Red Tea) & Light Breakfast',
    timeSlot: 'Morning',
    time: '07:30 AM',
    icon: 'Coffee',
    completed: false,
    notes: 'Taken with warm pitha and water',
  },
  {
    id: 'task-2',
    title: 'Morning BP & Memory Support Tablet',
    timeSlot: 'Morning',
    time: '08:15 AM',
    icon: 'Pill',
    completed: false,
    notes: 'Prescribed morning medicine',
  },
  {
    id: 'task-3',
    title: 'Gentle 15-min Veranda Garden Walk',
    timeSlot: 'Morning',
    time: '09:00 AM',
    icon: 'Footprints',
    completed: false,
    notes: 'Enjoy the pleasant morning sun',
  },
  {
    id: 'task-4',
    title: 'Midday Glass of Warm Water & Seasonal Fruit',
    timeSlot: 'Afternoon',
    time: '12:30 PM',
    icon: 'Droplet',
    completed: false,
    notes: 'Hydration check',
  },
  {
    id: 'task-5',
    title: 'Afternoon Quiet Rest & Music',
    timeSlot: 'Afternoon',
    time: '02:00 PM',
    icon: 'Moon',
    completed: false,
    notes: 'Comfortable nap',
  },
  {
    id: 'task-6',
    title: 'Evening Family Talk & Heritage Memory Game',
    timeSlot: 'Evening',
    time: '06:00 PM',
    icon: 'Users',
    completed: false,
    notes: 'Gentle engagement with grandson',
  },
  {
    id: 'task-7',
    title: 'Night Medicine & Warm Milk',
    timeSlot: 'Evening',
    time: '08:30 PM',
    icon: 'ShieldCheck',
    completed: false,
    notes: 'Restful night routine',
  },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    patientId: 'patient-senior-1',
    type: 'MEDICINE',
    title: 'Morning BP & Heart Tablet',
    description: 'Take 1 tablet with a full glass of water after tea.',
    time: '08:15 AM',
    period: 'Morning',
    completedToday: true,
    enabled: true,
    categoryLabel: 'Prescribed Medication',
  },
  {
    id: 'rem-2',
    patientId: 'patient-senior-1',
    type: 'HYDRATION',
    title: 'Midday Hydration (Warm Water)',
    description: 'Drink 1 soothing glass of water or lemonade.',
    time: '12:30 PM',
    period: 'Afternoon',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Hydration',
  },
  {
    id: 'rem-3',
    patientId: 'patient-senior-1',
    type: 'ACTIVITY',
    title: 'Memory Keepsake Activity',
    description: 'Spend 3 comfortable minutes exercising memory with Saathi.',
    time: '04:30 PM',
    period: 'Afternoon',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Cognitive Session',
  },
  {
    id: 'rem-4',
    patientId: 'patient-senior-1',
    type: 'APPOINTMENT',
    title: 'Dr. Barua Routine Clinic Checkup',
    description: 'Upcoming routine blood pressure & wellness follow-up on Thursday.',
    time: '11:00 AM',
    period: 'Morning',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Doctor Consultation',
  },
];

export const DEFAULT_MEMORIES: MemoryMoment[] = [
  {
    id: 'mem-1',
    title: 'Bihu Celebration with Family',
    category: 'Festival',
    region: 'Jorhat, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Elderly woman wearing traditional Assamese Muga silk smiling with family',
    dateLabel: 'Spring Season (Rongali Bihu)',
    story: 'You were wearing your cherished Muga silk Sador and making traditional coconut laddus for the neighbors and children.',
    audioPrompt: 'This was during Rongali Bihu in Jorhat. Your daughter brought fresh orchids and the sound of the dhol was in the courtyard.',
    interactiveQuestion: {
      question: 'Which traditional sweet do you love preparing during Bihu?',
      options: ['Narikol Laru (Coconut sweets)', 'Jalebi', 'Dry cake'],
      correctIndex: 0,
    },
  },
  {
    id: 'mem-2',
    title: 'The Ancestral Veranda & Tulsi Chora',
    category: 'Place',
    region: 'Kamrup, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Peaceful garden veranda with morning sunlight and tea bushes',
    dateLabel: 'Morning Sunlight at Home',
    story: 'Your favorite cane armchair on the south veranda where you read the morning newspaper and watered the Tulsi plant.',
    audioPrompt: 'Every morning, the birds would sing in the bamboo grove while your tea was brewing.',
    interactiveQuestion: {
      question: 'Where do you enjoy your morning warm cup of tea?',
      options: ['On the peaceful south veranda', 'In the busy market', 'In the car'],
      correctIndex: 0,
    },
  },
  {
    id: 'mem-3',
    title: 'Granddaughter Priya’s Graduation Day',
    category: 'Family',
    region: 'Guwahati, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Granddaughter holding diploma and gently embracing grandmother',
    dateLabel: 'May 2024',
    story: 'Priya came directly to touch your feet and receive your blessings after her engineering convocation.',
    audioPrompt: 'Priya gifted you a soft warm shawl and said your encouragement made her dream possible.',
    interactiveQuestion: {
      question: 'Who touched your feet and asked for your blessings on graduation day?',
      options: ['Priya (Granddaughter)', 'A postman', 'A shopkeeper'],
      correctIndex: 0,
    },
  },
];

export const DEFAULT_RECENT_SESSIONS: GameSessionResult[] = [
  {
    id: 'sess-1',
    gameId: 'memory-recall',
    patientId: 'patient-senior-1',
    difficulty: 2,
    accuracy: 0.90,
    reactionTimeMs: 3800,
    completionTimeMs: 35000,
    attempts: 4,
    mistakes: 0,
    hintsUsed: 1,
    completedAt: 'Yesterday, 04:30 PM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-2',
    gameId: 'daily-routine',
    patientId: 'patient-senior-1',
    difficulty: 1,
    accuracy: 1.0,
    reactionTimeMs: 2900,
    completionTimeMs: 28000,
    attempts: 3,
    mistakes: 0,
    hintsUsed: 0,
    completedAt: '2 days ago, 04:15 PM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-3',
    gameId: 'pattern-sequence',
    patientId: 'patient-senior-1',
    difficulty: 2,
    accuracy: 0.85,
    reactionTimeMs: 4200,
    completionTimeMs: 42000,
    attempts: 4,
    mistakes: 1,
    hintsUsed: 1,
    completedAt: '3 days ago, 10:00 AM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-4',
    gameId: 'attention-focus',
    patientId: 'patient-senior-1',
    difficulty: 1,
    accuracy: 0.95,
    reactionTimeMs: 3100,
    completionTimeMs: 32000,
    attempts: 4,
    mistakes: 0,
    hintsUsed: 0,
    completedAt: '4 days ago, 11:20 AM',
    syncStatus: 'synced',
  },
];

const STORAGE_KEYS = {
  HAS_INITIALIZED: 'cognitivesaathi_v3_has_initialized',
  DEMO_MODE_ACTIVE: 'cognitivesaathi_v3_demo_mode',
  SESSION: 'cognitivesaathi_v3_auth_session',
  PATIENT: 'cognitivesaathi_v3_patient',
  PATIENTS_LIST: 'cognitivesaathi_v3_patients_list',
  CARETAKERS_LIST: 'cognitivesaathi_v3_caretakers_list',
  ACTIVE_PATIENT_ID: 'cognitivesaathi_v3_active_patient_id',
  ACTIVE_CARETAKER_ID: 'cognitivesaathi_v3_active_caretaker_id',
  ROUTINE: 'cognitivesaathi_v3_routine',
  REMINDERS: 'cognitivesaathi_v3_reminders',
  MEMORIES: 'cognitivesaathi_v3_memories',
  SESSIONS: 'cognitivesaathi_v3_sessions',
  SYNC_QUEUE: 'cognitivesaathi_v3_sync_queue',
};

// Helper to strip any legacy stock photos from stored data
const stripStockAvatar = (url?: string): string => {
  if (!url) return '';
  if (url.includes('unsplash.com') || url.includes('placeholder')) return '';
  return url;
};

const sanitizePatient = (p: PatientProfile): PatientProfile => {
  return {
    ...p,
    avatarUrl: stripStockAvatar(p.avatarUrl),
    patientKey:
      p.patientKey ||
      `PT-${(p.username || p.preferredName || 'PATIENT')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4)}${p.age || Math.floor(10 + Math.random() * 89)}`,
  };
};

const sanitizeCaretaker = (c: CaretakerProfile): CaretakerProfile => ({
  ...c,
  avatarUrl: stripStockAvatar(c.avatarUrl),
  caregiverKey: c.caregiverKey || OfflineStore.generateCaregiverKey(),
});

// Safe Local Storage & IndexedDB abstraction
export class OfflineStore {
  static isDemoModeActive(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.DEMO_MODE_ACTIVE) === 'true';
    } catch {
      return false;
    }
  }

  static generateCaregiverKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CG-${code}`;
  }

  static generatePatientKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PT-${code}`;
  }

  /**
   * Explicit Demo Mode Loader for Judges and Evaluators
   * Populates sample profiles and default routines
   */
  static loadDemoMode(): { patient: PatientProfile; caretaker: CaretakerProfile } {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE_ACTIVE, 'true');
      this.savePatients(DEFAULT_PATIENTS);
      this.saveCaretakers(DEFAULT_CARETAKERS);
      this.setActivePatientId(DEFAULT_PATIENTS[0].id);
      this.setActiveCaretakerId(DEFAULT_CARETAKERS[0].id);

      // Seed scoped data for demo patients
      localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${DEFAULT_PATIENTS[0].id}`, JSON.stringify(DEFAULT_ROUTINE));
      localStorage.setItem(
        `${STORAGE_KEYS.REMINDERS}_${DEFAULT_PATIENTS[0].id}`,
        JSON.stringify(DEFAULT_REMINDERS.map((r) => ({ ...r, patientId: DEFAULT_PATIENTS[0].id })))
      );
      localStorage.setItem(`${STORAGE_KEYS.MEMORIES}_${DEFAULT_PATIENTS[0].id}`, JSON.stringify(DEFAULT_MEMORIES));
      localStorage.setItem(`${STORAGE_KEYS.SESSIONS}_${DEFAULT_PATIENTS[0].id}`, JSON.stringify(DEFAULT_RECENT_SESSIONS));

      return {
        patient: DEFAULT_PATIENTS[0],
        caretaker: DEFAULT_CARETAKERS[0],
      };
    } catch (e) {
      console.warn('Failed to load demo mode:', e);
      return {
        patient: DEFAULT_PATIENTS[0],
        caretaker: DEFAULT_CARETAKERS[0],
      };
    }
  }

  // Session Persistence (keeps user logged in across refresh / tab reopen)
  static getAuthSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      // Valid persistent session
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearAuthSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  static saveAuthSession(session: AuthSession): void {
    try {
      // Keep session persistent across reloads (default 365 days if not set)
      const persistentSession: AuthSession = {
        ...session,
        expiresAt: session.expiresAt || Date.now() + 365 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(persistentSession));
    } catch (e) {
      console.warn('Session save error:', e);
    }
  }

  static clearAuthSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {
      console.warn('Session clear error:', e);
    }
  }

  static getPatients(): PatientProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS_LIST);
      if (data) {
        const list: PatientProfile[] = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) {
          return list.map(sanitizePatient);
        }
      }
      return DEFAULT_PATIENTS.map(sanitizePatient);
    } catch {
      return DEFAULT_PATIENTS.map(sanitizePatient);
    }
  }

  static savePatients(patients: PatientProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS_LIST, JSON.stringify(patients));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addPatient(patient: PatientProfile): void {
    const list = this.getPatients();
    const existingIndex = list.findIndex((p) => p.id === patient.id || (p.phone && p.phone === patient.phone));
    const toSave = {
      ...patient,
    };
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...toSave };
    } else {
      list.push(toSave);
    }
    this.savePatients(list);
    this.setActivePatientId(toSave.id);
  }

  static deletePatient(id: string): PatientProfile[] {
    try {
      const list = this.getPatients().filter((p) => p.id !== id);
      this.savePatients(list);

      // Clean up patient specific local data
      localStorage.removeItem(`${STORAGE_KEYS.ROUTINE}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.REMINDERS}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.SESSIONS}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.MEMORIES}_${id}`);

      if (this.getActivePatientId() === id) {
        if (list.length > 0) {
          this.setActivePatientId(list[0].id);
          this.savePatient(list[0]);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT_ID);
          localStorage.removeItem(STORAGE_KEYS.PATIENT);
        }
      }
      return list;
    } catch (e) {
      console.warn('Local storage deletePatient error:', e);
      return this.getPatients();
    }
  }

  static getPatient(id?: string): PatientProfile {
    try {
      const list = this.getPatients();
      if (list.length === 0) return DEFAULT_PATIENT;

      if (id) {
        const found = list.find((p) => p.id === id);
        if (found) return sanitizePatient(found);
      }
      const activeId = this.getActivePatientId();
      const foundActive = list.find((p) => p.id === activeId);
      if (foundActive) return sanitizePatient(foundActive);

      return sanitizePatient(list[0]);
    } catch {
      return DEFAULT_PATIENT;
    }
  }

  static savePatient(patient: PatientProfile): void {
    try {
      const sanitized = sanitizePatient(patient);
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(sanitized));
      this.addPatient(sanitized);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getActivePatientId(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID);
      if (saved) return saved;
      const list = this.getPatients();
      return list.length > 0 ? list[0].id : '';
    } catch {
      return '';
    }
  }

  static setActivePatientId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT_ID, id);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getCaretakers(): CaretakerProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARETAKERS_LIST);
      if (data) {
        const list: CaretakerProfile[] = JSON.parse(data);
        if (list.length > 0) {
          return list.map(sanitizeCaretaker);
        }
      }
      return DEFAULT_CARETAKERS.map(sanitizeCaretaker);
    } catch {
      return DEFAULT_CARETAKERS.map(sanitizeCaretaker);
    }
  }

  static saveCaretakers(caretakers: CaretakerProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CARETAKERS_LIST, JSON.stringify(caretakers));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static async syncWithServer(): Promise<void> {
    try {
      const [patientsRes, caretakersRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/caretakers'),
      ]);
      if (patientsRes.ok) {
        const patients = await patientsRes.json();
        if (Array.isArray(patients) && patients.length > 0) {
          const current = this.getPatients();
          const merged = [...current];
          for (const p of patients) {
            const idx = merged.findIndex((m) => m.id === p.id || (m.phone && m.phone === p.phone));
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...p };
            } else {
              merged.push(p);
            }
          }
          this.savePatients(merged);
        }
      }
      if (caretakersRes.ok) {
        const caretakers = await caretakersRes.json();
        if (Array.isArray(caretakers) && caretakers.length > 0) {
          const current = this.getCaretakers();
          const merged = [...current];
          for (const c of caretakers) {
            const idx = merged.findIndex((m) => m.id === c.id || (m.phone && m.phone === c.phone));
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...c };
            } else {
              merged.push(c);
            }
          }
          this.saveCaretakers(merged);
        }
      }
    } catch (e) {
      // Offline fallback: keep local data
    }
  }

  static addCaretaker(caretaker: CaretakerProfile): void {
    const list = this.getCaretakers();
    const existingIndex = list.findIndex((c) => c.id === caretaker.id || (c.phone && c.phone === caretaker.phone));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...caretaker };
    } else {
      list.push(caretaker);
    }
    this.saveCaretakers(list);
    this.setActiveCaretakerId(caretaker.id);
  }

  static getActiveCaretakerId(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CARETAKER_ID);
      if (saved) return saved;
      const list = this.getCaretakers();
      return list.length > 0 ? list[0].id : '';
    } catch {
      return '';
    }
  }

  static setActiveCaretakerId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CARETAKER_ID, id);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  // Patient links themselves using Caregiver's unique Key (Async with server sync)
  static async linkPatientToCaregiverByKeyAsync(
    patientId: string,
    caregiverKey: string
  ): Promise<{ success: boolean; error?: string; caretaker?: CaretakerProfile; patient?: PatientProfile }> {
    const cleanKey = caregiverKey.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, error: 'Please enter a valid Caregiver Key (e.g., CG-CARE88).' };
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/link-caregiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverKey: cleanKey }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.patient && data.caretaker) {
          this.addCaretaker(data.caretaker);
          this.addPatient(data.patient);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
          }
          return { success: true, caretaker: data.caretaker, patient: data.patient };
        }
      }
    } catch (e) {
      console.warn('Network link request failed, falling back to local database:', e);
    }

    // Local fallback
    const allCaretakers = this.getCaretakers();
    const targetCaretaker = allCaretakers.find(
      (c) => (c.caregiverKey || '').toUpperCase() === cleanKey
    );

    if (!targetCaretaker) {
      return {
        success: false,
        error: `No caregiver account found with key "${cleanKey}". Please ask your caregiver for the key shown on their Caregiver Dashboard.`,
      };
    }

    const allPatients = this.getPatients();
    const targetPatient = allPatients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, error: 'Patient account not found.' };
    }

    if (!targetCaretaker.assignedPatientIds.includes(targetPatient.id)) {
      targetCaretaker.assignedPatientIds.push(targetPatient.id);
      this.saveCaretakers(allCaretakers);
    }

    targetPatient.hasCaregiver = true;
    targetPatient.caregiverName = `${targetCaretaker.fullName} (${targetCaretaker.relation || 'Caregiver'})`;
    targetPatient.caregiverPhone = targetCaretaker.phone;
    targetPatient.linkedCaregiverKey = targetCaretaker.caregiverKey;
    this.savePatient(targetPatient);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
    }

    return { success: true, caretaker: targetCaretaker, patient: targetPatient };
  }

  // Synchronous wrapper for patient link (also triggers async server sync)
  static linkPatientToCaregiverByKey(
    patientId: string,
    caregiverKey: string
  ): { success: boolean; error?: string; caretaker?: CaretakerProfile; patient?: PatientProfile } {
    const cleanKey = caregiverKey.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, error: 'Please enter a valid Caregiver Key (e.g., CG-CARE88).' };
    }

    // Optimistic local update
    const allCaretakers = this.getCaretakers();
    const targetCaretaker = allCaretakers.find(
      (c) => (c.caregiverKey || '').toUpperCase() === cleanKey
    );

    const allPatients = this.getPatients();
    const targetPatient = allPatients.find((p) => p.id === patientId);

    if (targetCaretaker && targetPatient) {
      if (!targetCaretaker.assignedPatientIds.includes(targetPatient.id)) {
        targetCaretaker.assignedPatientIds.push(targetPatient.id);
        this.saveCaretakers(allCaretakers);
      }
      targetPatient.hasCaregiver = true;
      targetPatient.caregiverName = `${targetCaretaker.fullName} (${targetCaretaker.relation || 'Caregiver'})`;
      targetPatient.caregiverPhone = targetCaretaker.phone;
      targetPatient.linkedCaregiverKey = targetCaretaker.caregiverKey;
      this.savePatient(targetPatient);
    }

    // Trigger server link
    fetch(`/api/patients/${patientId}/link-caregiver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiverKey: cleanKey }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.caretaker) OfflineStore.addCaretaker(data.caretaker);
          if (data.patient) OfflineStore.addPatient(data.patient);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
          }
        }
      })
      .catch((err) => console.warn('Background link sync error:', err));

    if (targetCaretaker && targetPatient) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
      }
      return { success: true, caretaker: targetCaretaker, patient: targetPatient };
    }

    return {
      success: true,
      patient: targetPatient ? { ...targetPatient, linkedCaregiverKey: cleanKey, hasCaregiver: true } : undefined,
    };
  }

  // Caregiver links an existing patient by Patient Key (PT-XXXX), Mobile Phone, Username, or ID (Async)
  static async linkCaregiverToPatientByKeyAsync(
    caretakerId: string,
    keyOrIdentifier: string
  ): Promise<{ success: boolean; error?: string; patient?: PatientProfile; caretaker?: CaretakerProfile }> {
    const raw = keyOrIdentifier.trim();
    if (!raw) {
      return { success: false, error: 'Please enter a Patient Key, Mobile Number, or Username.' };
    }

    try {
      const res = await fetch(`/api/caretakers/${caretakerId}/link-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: raw }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.patient && data.caretaker) {
          this.addCaretaker(data.caretaker);
          this.addPatient(data.patient);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
          }
          return { success: true, patient: data.patient, caretaker: data.caretaker };
        } else if (data.error) {
          return { success: false, error: data.error };
        }
      }
    } catch (e) {
      console.warn('Network link request failed, falling back to local database:', e);
    }

    // Local fallback lookup
    const allCaretakers = this.getCaretakers();
    const caretaker = allCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return { success: false, error: 'Caregiver account not found.' };

    const cleanUpper = raw.toUpperCase();
    const cleanDigits = raw.replace(/\D/g, '');
    const cleanLower = raw.toLowerCase();

    const allPatients = this.getPatients();
    const patient = allPatients.find((p) => {
      if (p.patientKey && p.patientKey.toUpperCase() === cleanUpper) return true;
      if (p.id === raw || p.id.toUpperCase() === cleanUpper) return true;
      if (p.username && p.username.toLowerCase() === cleanLower) return true;
      if (p.fullName && p.fullName.toLowerCase() === cleanLower) return true;
      if (cleanDigits && p.phone) {
        const pDigits = p.phone.replace(/\D/g, '');
        if (pDigits === cleanDigits || pDigits.endsWith(cleanDigits) || cleanDigits.endsWith(pDigits)) return true;
      }
      return false;
    });

    if (patient) {
      if (!caretaker.assignedPatientIds.includes(patient.id)) {
        caretaker.assignedPatientIds.push(patient.id);
        this.saveCaretakers(allCaretakers);
      }
      patient.hasCaregiver = true;
      patient.caregiverName = `${caretaker.fullName} (${caretaker.relation || 'Caregiver'})`;
      patient.caregiverPhone = caretaker.phone;
      patient.linkedCaregiverKey = caretaker.caregiverKey;
      this.savePatient(patient);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
      }

      return { success: true, patient, caretaker };
    }

    return {
      success: false,
      error: 'No patient found with that Patient Key (PT-XXXX), mobile number, or username.',
    };
  }

  // Synchronous wrapper for caregiver link
  static linkCaregiverToPatientByKey(
    caretakerId: string,
    keyOrIdentifier: string
  ): { success: boolean; error?: string; patient?: PatientProfile } {
    const raw = keyOrIdentifier.trim();
    const allCaretakers = this.getCaretakers();
    const caretaker = allCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return { success: false, error: 'Caregiver account not found.' };

    const cleanUpper = raw.toUpperCase();
    const cleanDigits = raw.replace(/\D/g, '');
    const cleanLower = raw.toLowerCase();

    const allPatients = this.getPatients();
    const patient = allPatients.find((p) => {
      if (p.patientKey && p.patientKey.toUpperCase() === cleanUpper) return true;
      if (p.id === raw || p.id.toUpperCase() === cleanUpper) return true;
      if (p.username && p.username.toLowerCase() === cleanLower) return true;
      if (p.fullName && p.fullName.toLowerCase() === cleanLower) return true;
      if (cleanDigits && p.phone) {
        const pDigits = p.phone.replace(/\D/g, '');
        if (pDigits === cleanDigits || pDigits.endsWith(cleanDigits) || cleanDigits.endsWith(pDigits)) return true;
      }
      return false;
    });

    // Fire server request
    fetch(`/api/caretakers/${caretaker.id}/link-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: raw }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.caretaker) OfflineStore.addCaretaker(data.caretaker);
          if (data.patient) OfflineStore.addPatient(data.patient);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
          }
        }
      })
      .catch((e) => console.warn('Server link sync error:', e));

    if (patient) {
      if (!caretaker.assignedPatientIds.includes(patient.id)) {
        caretaker.assignedPatientIds.push(patient.id);
        this.saveCaretakers(allCaretakers);
      }
      patient.hasCaregiver = true;
      patient.caregiverName = `${caretaker.fullName} (${caretaker.relation || 'Caregiver'})`;
      patient.caregiverPhone = caretaker.phone;
      patient.linkedCaregiverKey = caretaker.caregiverKey;
      this.savePatient(patient);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
      }

      return { success: true, patient };
    }

    return {
      success: false,
      error: 'No patient found with that Patient Key (PT-XXXX), mobile number, or username.',
    };
  }

  static unlinkCaregiver(patientId: string): void {
    const patient = this.getPatient(patientId);
    if (!patient) return;

    const allCaretakers = this.getCaretakers();
    allCaretakers.forEach((c) => {
      c.assignedPatientIds = c.assignedPatientIds.filter((id) => id !== patientId);
    });
    this.saveCaretakers(allCaretakers);

    patient.hasCaregiver = false;
    patient.caregiverName = 'Self';
    patient.caregiverPhone = '';
    patient.linkedCaregiverKey = undefined;
    this.savePatient(patient);

    fetch(`/api/patients/${patientId}/unlink-caregiver`, {
      method: 'POST',
    }).catch((e) => console.warn('Unlink server error:', e));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cognitivesaathi_sync'));
    }
  }

  // Update Caregiver Key (customized by Caregiver)
  static updateCaregiverKey(
    caretakerId: string,
    newKey: string
  ): { success: boolean; error?: string; caretaker?: CaretakerProfile } {
    const cleanKey = newKey.trim().toUpperCase();
    if (!cleanKey || cleanKey.length < 3) {
      return { success: false, error: 'Caregiver Key must be at least 3 characters long.' };
    }
    const allCaretakers = this.getCaretakers();
    const target = allCaretakers.find((c) => c.id === caretakerId);
    if (!target) return { success: false, error: 'Caregiver account not found.' };

    const duplicate = allCaretakers.find(
      (c) => c.id !== caretakerId && (c.caregiverKey || '').toUpperCase() === cleanKey
    );
    if (duplicate) {
      return {
        success: false,
        error: `Key "${cleanKey}" is already in use by another caregiver. Please choose a different key.`,
      };
    }

    const oldKey = target.caregiverKey;
    target.caregiverKey = cleanKey;
    this.addCaretaker(target);

    // Update patients linked to old key
    if (oldKey) {
      const allPatients = this.getPatients();
      let updatedAny = false;
      allPatients.forEach((p) => {
        if ((p.linkedCaregiverKey || '').toUpperCase() === oldKey.toUpperCase()) {
          p.linkedCaregiverKey = cleanKey;
          updatedAny = true;
        }
      });
      if (updatedAny) {
        this.savePatients(allPatients);
      }
    }

    // Sync to server database
    fetch(`/api/caretakers/${caretakerId}/key`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiverKey: cleanKey }),
    }).catch((e) => console.warn('Server sync error for caregiver key:', e));

    return { success: true, caretaker: target };
  }

  // Update Patient Key (customized by Patient or Caregiver)
  static updatePatientKey(
    patientId: string,
    newKey: string
  ): { success: boolean; error?: string; patient?: PatientProfile } {
    const cleanKey = newKey.trim().toUpperCase();
    if (!cleanKey || cleanKey.length < 3) {
      return { success: false, error: 'Patient Key must be at least 3 characters long.' };
    }
    const allPatients = this.getPatients();
    const target = allPatients.find((p) => p.id === patientId);
    if (!target) return { success: false, error: 'Patient account not found.' };

    const duplicate = allPatients.find(
      (p) => p.id !== patientId && (p.patientKey || '').toUpperCase() === cleanKey
    );
    if (duplicate) {
      return {
        success: false,
        error: `Key "${cleanKey}" is already in use by another patient. Please choose a different key.`,
      };
    }

    target.patientKey = cleanKey;
    this.savePatient(target);

    // Sync to server database
    fetch(`/api/patients/${patientId}/key`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientKey: cleanKey }),
    }).catch((e) => console.warn('Server sync error for patient key:', e));

    return { success: true, patient: target };
  }

  static resetPatientPassword(
    patientId: string,
    newPassOrPin: string
  ): { success: boolean; error?: string } {
    const patient = this.getPatient(patientId);
    if (!patient) return { success: false, error: 'Patient not found' };

    patient.password = newPassOrPin.trim();
    patient.pin = newPassOrPin.trim();
    this.savePatient(patient);
    return { success: true };
  }

  // Scoped Routines (Strictly isolated per patient, no global key reads/writes)
  static getRoutine(patientId?: string): RoutineTask[] {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return [];
      const key = `${STORAGE_KEYS.ROUTINE}_${pId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRoutine(routine: RoutineTask[], patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return;
      const key = `${STORAGE_KEYS.ROUTINE}_${pId}`;
      localStorage.setItem(key, JSON.stringify(routine));
      this.enqueueSyncEvent('ROUTINE_UPDATED', { count: routine.filter((r) => r.completed).length, patientId: pId });
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addTaskToRoutine(task: RoutineTask, patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = [...list, task];
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static addMultipleTasksToRoutine(newTasks: RoutineTask[], patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = [...list, ...newTasks];
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static deleteTaskFromRoutine(taskId: string, patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = list.filter((t) => t.id !== taskId);
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static getAiReport(patientId?: string): any | null {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return null;
      const data = localStorage.getItem(`cognitivesaathi_ai_report_${pId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveAiReport(report: any, patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return;
      localStorage.setItem(`cognitivesaathi_ai_report_${pId}`, JSON.stringify(report));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  // Scoped Reminders (Strictly isolated per patient, no global key reads/writes)
  static getReminders(patientId?: string): ReminderItem[] {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return [];
      const key = `${STORAGE_KEYS.REMINDERS}_${pId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveReminders(reminders: ReminderItem[], patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return;
      const key = `${STORAGE_KEYS.REMINDERS}_${pId}`;
      localStorage.setItem(key, JSON.stringify(reminders));
      this.enqueueSyncEvent('REMINDER_TOGGLED', { total: reminders.length, patientId: pId });
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  // Scoped Memories (Strictly isolated per patient, no global key reads/writes)
  static getMemories(patientId?: string): MemoryMoment[] {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return [];
      const key = `${STORAGE_KEYS.MEMORIES}_${pId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveMemories(memories: MemoryMoment[], patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return;
      const key = `${STORAGE_KEYS.MEMORIES}_${pId}`;
      localStorage.setItem(key, JSON.stringify(memories));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addMemory(memory: MemoryMoment, patientId?: string): MemoryMoment[] {
    const pId = patientId || this.getActivePatientId();
    const list = this.getMemories(pId);
    const updated = [{ ...memory, patientId: pId }, ...list];
    this.saveMemories(updated, pId);
    if (pId) {
      fetch(`/api/memories/${pId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...memory, patientId: pId }),
      }).catch((e) => console.warn('Sync memory error:', e));
    }
    return updated;
  }

  static deleteMemory(id: string, patientId?: string): MemoryMoment[] {
    const pId = patientId || this.getActivePatientId();
    const list = this.getMemories(pId);
    const updated = list.filter((m) => m.id !== id);
    this.saveMemories(updated, pId);
    if (pId) {
      fetch(`/api/memories/${pId}/${id}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Delete memory error:', e));
    }
    return updated;
  }

  // Scoped Sessions (Strictly isolated per patient)
  static getSessions(patientId?: string): GameSessionResult[] {
    try {
      const pId = patientId || this.getActivePatientId();
      if (!pId) return [];
      const key = `${STORAGE_KEYS.SESSIONS}_${pId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addSession(session: GameSessionResult): void {
    try {
      const pId = session.patientId || this.getActivePatientId();
      const sessions = this.getSessions(pId);
      const updated = [session, ...sessions];
      localStorage.setItem(`${STORAGE_KEYS.SESSIONS}_${pId}`, JSON.stringify(updated));

      if (pId) {
        fetch(`/api/sessions/${pId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session),
        }).catch((e) => console.warn('Session sync error:', e));
      }

      // Also enqueue in offline sync queue
      this.enqueueSyncEvent('GAME_COMPLETED', {
        gameId: session.gameId,
        accuracy: session.accuracy,
        durationMs: session.completionTimeMs,
        patientId: pId,
      });

      // Update patient streak & count
      const patient = this.getPatient(pId);
      if (patient) {
        patient.todayCompletedCount = (patient.todayCompletedCount || 0) + 1;
        this.savePatient(patient);
      }
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getSyncQueue(): SyncEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static enqueueSyncEvent(type: SyncEvent['eventType'], payload: Record<string, unknown>): void {
    try {
      const queue = this.getSyncQueue();
      const newEvent: SyncEvent = {
        clientEventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventType: type,
        patientId: (payload.patientId as string) || this.getActivePatientId(),
        timestamp: new Date().toISOString(),
        payload,
        status: 'pending',
      };
      queue.push(newEvent);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Sync queue error:', e);
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    } catch (e) {
      console.warn('Sync queue clear error:', e);
    }
  }

  static getCaregiverPin(caretakerId?: string): string {
    try {
      if (caretakerId) {
        const c = this.getCaretakers().find((item) => item.id === caretakerId);
        if (c?.pin) return c.pin;
      }
      const activeC = this.getCaretakers().find((item) => item.id === this.getActiveCaretakerId());
      if (activeC?.pin) return activeC.pin;
      return localStorage.getItem('cognitivesaathi_caregiver_pin') || '';
    } catch {
      return '';
    }
  }

  static setCaregiverPin(newPin: string): void {
    try {
      localStorage.setItem('cognitivesaathi_caregiver_pin', newPin.trim());
    } catch (e) {
      console.warn('Failed to save caregiver PIN:', e);
    }
  }
}
