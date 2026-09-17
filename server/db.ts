import fs from 'fs';
import path from 'path';
import { PatientProfile, CaretakerProfile, RoutineTask, ReminderItem, MemoryMoment, GameSessionResult } from '../src/types';

export interface DatabaseSchema {
  patients: PatientProfile[];
  caretakers: CaretakerProfile[];
  routines: Record<string, RoutineTask[]>;
  reminders: Record<string, ReminderItem[]>;
  memories: Record<string, MemoryMoment[]>;
  sessions: Record<string, GameSessionResult[]>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.json');

// Default initial data for demo/startup
const INITIAL_PATIENTS: PatientProfile[] = [
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
    caregiverPhone: '9435012345',
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
    caregiverPhone: '9435022222',
    avatarUrl: '',
    dailyStreak: 0,
    todayCompletedCount: 0,
    phone: '9435022222',
    hasCaregiver: false,
  },
];

const INITIAL_CARETAKERS: CaretakerProfile[] = [
  {
    id: 'caretaker-priya',
    fullName: 'Priya Sharma',
    username: 'priya',
    password: 'password123',
    phone: '9435012345',
    email: 'priya.care@cognitivesaathi.org',
    relation: 'Daughter & Primary Caregiver',
    pin: '5678',
    caregiverKey: 'CG-CARE88',
    avatarUrl: '',
    assignedPatientIds: ['patient-senior-1'],
  },
];

export class ServerDB {
  private static cache: DatabaseSchema | null = null;

  private static ensureDbExists(): DatabaseSchema {
    if (this.cache) return this.cache;

    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.cache = {
          patients: parsed.patients || INITIAL_PATIENTS,
          caretakers: parsed.caretakers || INITIAL_CARETAKERS,
          routines: parsed.routines || {},
          reminders: parsed.reminders || {},
          memories: parsed.memories || {},
          sessions: parsed.sessions || {},
        };
        return this.cache;
      }
    } catch (e) {
      console.warn('Error reading server database, initializing fresh state:', e);
    }

    const defaultDb: DatabaseSchema = {
      patients: INITIAL_PATIENTS,
      caretakers: INITIAL_CARETAKERS,
      routines: {},
      reminders: {},
      memories: {},
      sessions: {},
    };
    this.save(defaultDb);
    this.cache = defaultDb;
    return defaultDb;
  }

  static ensureMutualConsistency(db: DatabaseSchema): boolean {
    let changed = false;
    for (const patient of db.patients) {
      if (patient.linkedCaregiverKey) {
        const keyClean = patient.linkedCaregiverKey.trim().toUpperCase();
        const ct = db.caretakers.find((c) => (c.caregiverKey || '').trim().toUpperCase() === keyClean);
        if (ct) {
          if (!ct.assignedPatientIds) ct.assignedPatientIds = [];
          if (!ct.assignedPatientIds.includes(patient.id)) {
            ct.assignedPatientIds.push(patient.id);
            changed = true;
          }
          if (!patient.hasCaregiver) {
            patient.hasCaregiver = true;
            patient.caregiverName = `${ct.fullName} (${ct.relation || 'Caregiver'})`;
            patient.caregiverPhone = ct.phone;
            changed = true;
          }
        }
      }
    }
    for (const ct of db.caretakers) {
      if (ct.assignedPatientIds && ct.assignedPatientIds.length > 0) {
        for (const pId of ct.assignedPatientIds) {
          const p = db.patients.find((pat) => pat.id === pId);
          if (p) {
            if ((p.linkedCaregiverKey || '').trim().toUpperCase() !== (ct.caregiverKey || '').trim().toUpperCase()) {
              p.linkedCaregiverKey = ct.caregiverKey;
              p.hasCaregiver = true;
              p.caregiverName = `${ct.fullName} (${ct.relation || 'Caregiver'})`;
              p.caregiverPhone = ct.phone;
              changed = true;
            }
          }
        }
      }
    }
    return changed;
  }

  private static save(db: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      this.cache = db;
    } catch (e) {
      console.error('Failed to write to database.json:', e);
    }
  }

  static getPatients(): PatientProfile[] {
    const db = this.ensureDbExists();
    if (this.ensureMutualConsistency(db)) {
      this.save(db);
    }
    return db.patients;
  }

  static getCaretakers(): CaretakerProfile[] {
    const db = this.ensureDbExists();
    if (this.ensureMutualConsistency(db)) {
      this.save(db);
    }
    return db.caretakers;
  }

  static findPatient(identifier: string): PatientProfile | undefined {
    const db = this.ensureDbExists();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return db.patients.find((p) => {
      if (p.id.toLowerCase() === clean) return true;
      if (p.patientKey && p.patientKey.toLowerCase() === clean) return true;
      if (p.username && p.username.toLowerCase() === clean) return true;
      if (p.fullName.toLowerCase() === clean) return true;
      if (p.phone) {
        const pDigits = p.phone.replace(/\D/g, '');
        if (pDigits && cleanDigits && (pDigits === cleanDigits || pDigits.endsWith(cleanDigits) || cleanDigits.endsWith(pDigits))) {
          return true;
        }
      }
      return false;
    });
  }

  static findCaretaker(identifier: string): CaretakerProfile | undefined {
    const db = this.ensureDbExists();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return db.caretakers.find((c) => {
      if (c.id.toLowerCase() === clean) return true;
      if (c.caregiverKey && c.caregiverKey.toLowerCase() === clean) return true;
      if (c.username && c.username.toLowerCase() === clean) return true;
      if (c.fullName.toLowerCase() === clean) return true;
      if (c.phone) {
        const cDigits = c.phone.replace(/\D/g, '');
        if (cDigits && cleanDigits && (cDigits === cleanDigits || cDigits.endsWith(cleanDigits) || cleanDigits.endsWith(cDigits))) {
          return true;
        }
      }
      return false;
    });
  }

  static isUsernameTaken(username: string): boolean {
    const db = this.ensureDbExists();
    const clean = username.trim().toLowerCase();
    const inPatients = db.patients.some((p) => (p.username || '').trim().toLowerCase() === clean);
    const inCaretakers = db.caretakers.some((c) => (c.username || '').trim().toLowerCase() === clean);
    return inPatients || inCaretakers;
  }

  static isPhoneTaken(phone: string): boolean {
    const db = this.ensureDbExists();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits) return false;

    const inPatients = db.patients.some((p) => {
      const d = (p.phone || '').replace(/\D/g, '');
      return d && (d === cleanDigits || d.endsWith(cleanDigits) || cleanDigits.endsWith(d));
    });

    const inCaretakers = db.caretakers.some((c) => {
      const d = (c.phone || '').replace(/\D/g, '');
      return d && (d === cleanDigits || d.endsWith(cleanDigits) || cleanDigits.endsWith(d));
    });

    return inPatients || inCaretakers;
  }

  static addPatient(patient: PatientProfile): PatientProfile {
    const db = this.ensureDbExists();
    const existingIndex = db.patients.findIndex((p) => p.id === patient.id || (patient.phone && p.phone === patient.phone));

    if (existingIndex >= 0) {
      db.patients[existingIndex] = { ...db.patients[existingIndex], ...patient };
    } else {
      db.patients.push(patient);
    }

    this.ensureMutualConsistency(db);
    this.save(db);
    return patient;
  }

  static addCaretaker(caretaker: CaretakerProfile): CaretakerProfile {
    const db = this.ensureDbExists();
    const existingIndex = db.caretakers.findIndex((c) => c.id === caretaker.id || (caretaker.phone && c.phone === caretaker.phone));

    if (existingIndex >= 0) {
      db.caretakers[existingIndex] = { ...db.caretakers[existingIndex], ...caretaker };
    } else {
      db.caretakers.push(caretaker);
    }

    this.ensureMutualConsistency(db);
    this.save(db);
    return caretaker;
  }

  static linkPatientToCaretaker(
    caretakerId: string,
    patientIdentifier: string
  ): { success: boolean; error?: string; caretaker?: CaretakerProfile; patient?: PatientProfile } {
    const db = this.ensureDbExists();
    const caretaker = this.findCaretaker(caretakerId) || db.caretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return { success: false, error: 'Caregiver not found.' };

    const patient = this.findPatient(patientIdentifier);
    if (!patient) return { success: false, error: 'No patient found with that key, mobile number, or username.' };

    if (!caretaker.assignedPatientIds) caretaker.assignedPatientIds = [];
    if (!caretaker.assignedPatientIds.includes(patient.id)) {
      caretaker.assignedPatientIds.push(patient.id);
    }

    patient.linkedCaregiverKey = caretaker.caregiverKey;
    patient.caregiverName = `${caretaker.fullName} (${caretaker.relation || 'Caregiver'})`;
    patient.caregiverPhone = caretaker.phone;
    patient.hasCaregiver = true;

    this.ensureMutualConsistency(db);
    this.save(db);
    return { success: true, caretaker, patient };
  }

  static linkCaregiverToPatient(
    patientId: string,
    caregiverKey: string
  ): { success: boolean; error?: string; caretaker?: CaretakerProfile; patient?: PatientProfile } {
    const db = this.ensureDbExists();
    const patient = this.findPatient(patientId) || db.patients.find((p) => p.id === patientId);
    if (!patient) return { success: false, error: 'Patient not found.' };

    const keyClean = caregiverKey.trim().toUpperCase();
    const caretaker = this.findCaretaker(keyClean) || db.caretakers.find(
      (c) => (c.caregiverKey || '').toUpperCase() === keyClean
    );
    if (!caretaker) return { success: false, error: `No caregiver found with key "${caregiverKey}".` };

    if (!caretaker.assignedPatientIds) caretaker.assignedPatientIds = [];
    if (!caretaker.assignedPatientIds.includes(patient.id)) {
      caretaker.assignedPatientIds.push(patient.id);
    }

    patient.linkedCaregiverKey = caretaker.caregiverKey;
    patient.caregiverName = `${caretaker.fullName} (${caretaker.relation || 'Caregiver'})`;
    patient.caregiverPhone = caretaker.phone;
    patient.hasCaregiver = true;

    this.ensureMutualConsistency(db);
    this.save(db);
    return { success: true, caretaker, patient };
  }

  static unlinkCaregiver(
    patientId: string
  ): { success: boolean; patient?: PatientProfile } {
    const db = this.ensureDbExists();
    const patient = this.findPatient(patientId) || db.patients.find((p) => p.id === patientId);
    if (!patient) return { success: false };

    patient.linkedCaregiverKey = '';
    patient.hasCaregiver = false;
    patient.caregiverName = 'Self';
    patient.caregiverPhone = '';

    for (const ct of db.caretakers) {
      if (ct.assignedPatientIds) {
        ct.assignedPatientIds = ct.assignedPatientIds.filter((id) => id !== patient.id);
      }
    }

    this.save(db);
    return { success: true, patient };
  }

  static getRoutines(patientId: string): RoutineTask[] {
    const db = this.ensureDbExists();
    return db.routines[patientId] || [];
  }

  static saveRoutines(patientId: string, routines: RoutineTask[]): RoutineTask[] {
    const db = this.ensureDbExists();
    db.routines[patientId] = routines;
    this.save(db);
    return routines;
  }

  static getReminders(patientId: string): ReminderItem[] {
    const db = this.ensureDbExists();
    return db.reminders[patientId] || [];
  }

  static saveReminders(patientId: string, reminders: ReminderItem[]): ReminderItem[] {
    const db = this.ensureDbExists();
    db.reminders[patientId] = reminders;
    this.save(db);
    return reminders;
  }

  static getMemories(patientId: string): MemoryMoment[] {
    const db = this.ensureDbExists();
    return db.memories[patientId] || [];
  }

  static addMemory(patientId: string, memory: MemoryMoment): MemoryMoment[] {
    const db = this.ensureDbExists();
    if (!db.memories[patientId]) {
      db.memories[patientId] = [];
    }
    db.memories[patientId] = [memory, ...db.memories[patientId].filter((m) => m.id !== memory.id)];
    this.save(db);
    return db.memories[patientId];
  }

  static deleteMemory(patientId: string, memoryId: string): MemoryMoment[] {
    const db = this.ensureDbExists();
    if (!db.memories[patientId]) {
      db.memories[patientId] = [];
    }
    db.memories[patientId] = db.memories[patientId].filter((m) => m.id !== memoryId);
    this.save(db);
    return db.memories[patientId];
  }

  static getSessions(patientId: string): GameSessionResult[] {
    const db = this.ensureDbExists();
    return db.sessions[patientId] || [];
  }

  static addSession(patientId: string, session: GameSessionResult): GameSessionResult[] {
    const db = this.ensureDbExists();
    if (!db.sessions[patientId]) {
      db.sessions[patientId] = [];
    }
    db.sessions[patientId] = [session, ...db.sessions[patientId].filter((s) => s.id !== session.id)];
    this.save(db);
    return db.sessions[patientId];
  }
}
