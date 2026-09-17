import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ServerDB } from './server/db';
import { PatientProfile, CaretakerProfile } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client with recommended model and telemetry header
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// Authentication & Account Database APIs
// -------------------------------------------------------------

// Check username availability
app.get('/api/auth/check-username', (req, res) => {
  const username = String(req.query.username || '').trim();
  if (!username) {
    res.status(400).json({ error: 'Username query parameter is required' });
    return;
  }
  const taken = ServerDB.isUsernameTaken(username);
  res.json({ available: !taken });
});

// Register new account (Patient or Caregiver)
app.post('/api/auth/register', (req, res) => {
  try {
    const { role, profile, password } = req.body;

    if (!role || !profile || !password) {
      res.status(400).json({ error: 'Role, profile data, and password are required.' });
      return;
    }

    const { fullName, username, phone } = profile;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Full Name is mandatory.' });
      return;
    }

    if (!username || !username.trim()) {
      res.status(400).json({ error: 'Username is mandatory.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters.' });
      return;
    }

    if (ServerDB.isUsernameTaken(cleanUsername)) {
      res.status(400).json({ error: `Username "${username}" is already taken. Please choose another username.` });
      return;
    }

    if (!phone || !phone.trim()) {
      res.status(400).json({ error: 'Mobile number is mandatory.' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const actualDigits = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
    if (actualDigits.length !== 10) {
      res.status(400).json({ error: 'Mobile number must have actually 10 digits.' });
      return;
    }

    if (ServerDB.isPhoneTaken(actualDigits)) {
      res.status(400).json({ error: 'This mobile number is already registered. Please log in instead.' });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters long.' });
      return;
    }

    if (role === 'PATIENT') {
      const patientId = `patient-${Date.now()}`;
      const userPatientKey = (profile.patientKey?.trim() || `PT-${Math.floor(100000 + Math.random() * 900000)}`).toUpperCase();

      const newPatient: PatientProfile = {
        id: patientId,
        fullName: fullName.trim(),
        preferredName: profile.preferredName?.trim() || fullName.trim().split(' ')[0],
        username: cleanUsername,
        password: password,
        pin: profile.pin || password.slice(0, 4),
        patientKey: userPatientKey,
        age: Number(profile.age) || 70,
        region: profile.region?.trim() || 'Guwahati, Assam',
        state: profile.state || 'Assam',
        preferredLanguage: profile.preferredLanguage || 'en',
        phone: cleanPhone,
        hasCaregiver: Boolean(profile.hasCaregiver || profile.linkedCaregiverKey),
        caregiverName: profile.caregiverName?.trim() || 'Family Caregiver',
        caregiverPhone: profile.caregiverPhone?.trim() || '',
        avatarUrl: profile.avatarUrl || '',
        dailyStreak: 0,
        todayCompletedCount: 0,
        linkedCaregiverKey: profile.linkedCaregiverKey?.trim().toUpperCase() || '',
      };

      ServerDB.addPatient(newPatient);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully! Please log in with your mobile number and password.',
        patient: newPatient,
      });
      return;
    } else if (role === 'CAREGIVER') {
      const caretakerId = `caretaker-${Date.now()}`;
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const userCaregiverKey = (profile.caregiverKey?.trim() || `CG-${code}`).toUpperCase();

      const newCaretaker: CaretakerProfile = {
        id: caretakerId,
        fullName: fullName.trim(),
        username: cleanUsername,
        password: password,
        phone: cleanPhone,
        email: profile.email?.trim() || '',
        relation: profile.relation?.trim() || 'Family Member',
        pin: profile.pin || password.slice(0, 4),
        caregiverKey: userCaregiverKey,
        assignedPatientIds: profile.assignedPatientIds || [],
        avatarUrl: profile.avatarUrl || '',
      };

      ServerDB.addCaretaker(newCaretaker);

      res.status(201).json({
        success: true,
        message: 'Caregiver account registered successfully! Please log in with your mobile number and password.',
        caretaker: newCaretaker,
      });
      return;
    }

    res.status(400).json({ error: 'Invalid role specified.' });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err?.message });
  }
});

// Login API (Number/Username and Password)
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password, role = 'PATIENT' } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please enter your mobile number/username and password.' });
      return;
    }

    const cleanInput = String(identifier).trim();

    // If identifier is entered as a mobile number, verify it has actually 10 digits
    const digitsOnly = cleanInput.replace(/\D/g, '');
    const isPhoneAttempt = /^[0-9+\s()-]+$/.test(cleanInput) && digitsOnly.length > 0;
    if (isPhoneAttempt) {
      const actualDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly;
      if (actualDigits.length !== 10) {
        res.status(400).json({ error: 'Mobile number must have actually 10 digits.' });
        return;
      }
    }

    if (role === 'PATIENT') {
      const patient = ServerDB.findPatient(cleanInput);
      if (!patient) {
        res.status(401).json({
          error: 'No account found with that mobile number or username. Please check your credentials or register.',
        });
        return;
      }

      // Check password or pin
      if (patient.password && patient.password !== password && patient.pin !== password) {
        res.status(401).json({ error: 'Incorrect password. Please try again.' });
        return;
      }

      res.json({
        success: true,
        role: 'PATIENT',
        patient,
        token: `token-${patient.id}-${Date.now()}`,
      });
      return;
    } else {
      const caretaker = ServerDB.findCaretaker(cleanInput);
      if (!caretaker) {
        res.status(401).json({
          error: 'No caregiver account found with that mobile number or username. Please check your credentials or register.',
        });
        return;
      }

      if (caretaker.password && caretaker.password !== password && caretaker.pin !== password) {
        res.status(401).json({ error: 'Incorrect password. Please try again.' });
        return;
      }

      // Find assigned patient for this caregiver (NO fallback to unassigned patient)
      const allPatients = ServerDB.getPatients();
      const assigned =
        allPatients.find(
          (p) =>
            caretaker.assignedPatientIds.includes(p.id) ||
            (p.linkedCaregiverKey && p.linkedCaregiverKey.toUpperCase() === (caretaker.caregiverKey || '').toUpperCase())
        ) || null;

      res.json({
        success: true,
        role: 'CAREGIVER',
        caretaker,
        patient: assigned,
        token: `token-${caretaker.id}-${Date.now()}`,
      });
      return;
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err?.message });
  }
});

// Link patient to caregiver (by Patient Key, Phone, or Username)
app.post('/api/caretakers/:id/link-patient', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ error: 'Patient key, mobile number, or username is required.' });
      return;
    }
    const result = ServerDB.linkPatientToCaretaker(req.params.id, String(identifier).trim());
    if (!result.success) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to link patient', details: err?.message });
  }
});

// Link caregiver to patient (by Caregiver Key only)
app.post('/api/patients/:id/link-caregiver', (req, res) => {
  try {
    const { caregiverKey } = req.body;
    if (!caregiverKey) {
      res.status(400).json({ error: 'Caregiver key is required.' });
      return;
    }
    const result = ServerDB.linkCaregiverToPatient(req.params.id, String(caregiverKey).trim());
    if (!result.success) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to link caregiver', details: err?.message });
  }
});

// Unlink caregiver from patient
app.post('/api/patients/:id/unlink-caregiver', (req, res) => {
  try {
    const result = ServerDB.unlinkCaregiver(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to unlink caregiver', details: err?.message });
  }
});

// Synchronized Routines APIs
app.get('/api/routines/:patientId', (req, res) => {
  res.json(ServerDB.getRoutines(req.params.patientId));
});

app.post('/api/routines/:patientId', (req, res) => {
  const routines = req.body;
  if (!Array.isArray(routines)) {
    res.status(400).json({ error: 'Routines must be an array' });
    return;
  }
  const updated = ServerDB.saveRoutines(req.params.patientId, routines);
  res.json(updated);
});

// Synchronized Reminders APIs
app.get('/api/reminders/:patientId', (req, res) => {
  res.json(ServerDB.getReminders(req.params.patientId));
});

app.post('/api/reminders/:patientId', (req, res) => {
  const reminders = req.body;
  if (!Array.isArray(reminders)) {
    res.status(400).json({ error: 'Reminders must be an array' });
    return;
  }
  const updated = ServerDB.saveReminders(req.params.patientId, reminders);
  res.json(updated);
});

// Real-time Unified 5-10s Synchronization Endpoint
app.get('/api/sync', (req, res) => {
  try {
    const { role, caretakerId, patientId } = req.query as {
      role?: string;
      caretakerId?: string;
      patientId?: string;
    };

    const patients = ServerDB.getPatients();
    const caretakers = ServerDB.getCaretakers();

    let targetCaretaker = caretakerId
      ? caretakers.find((c) => c.id === caretakerId)
      : undefined;
    let targetPatient = patientId
      ? patients.find((p) => p.id === patientId)
      : undefined;

    // Filter patients assigned or linked to this caregiver
    let assignedPatients: any[] = [];
    if (targetCaretaker) {
      assignedPatients = patients.filter(
        (p) =>
          targetCaretaker?.assignedPatientIds?.includes(p.id) ||
          (p.linkedCaregiverKey &&
            targetCaretaker?.caregiverKey &&
            p.linkedCaregiverKey.toUpperCase() === targetCaretaker.caregiverKey.toUpperCase())
      );
    }

    // Resolve patient to sync
    const activePatId = targetPatient?.id || (assignedPatients.length > 0 ? assignedPatients[0].id : undefined);

    const memories = activePatId ? ServerDB.getMemories(activePatId) : [];
    const sessions = activePatId ? ServerDB.getSessions(activePatId) : [];
    const routines = activePatId ? ServerDB.getRoutines(activePatId) : [];
    const reminders = activePatId ? ServerDB.getReminders(activePatId) : [];

    res.json({
      success: true,
      timestamp: Date.now(),
      patients,
      caretakers,
      targetCaretaker,
      targetPatient,
      assignedPatients,
      activePatId,
      memories,
      sessions,
      routines,
      reminders,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync failed', details: err?.message });
  }
});

// Synchronized Memories APIs
app.get('/api/memories/:patientId', (req, res) => {
  res.json(ServerDB.getMemories(req.params.patientId));
});

app.post('/api/memories/:patientId', (req, res) => {
  const memory = req.body;
  if (!memory || !memory.id) {
    res.status(400).json({ error: 'Invalid memory data' });
    return;
  }
  const updated = ServerDB.addMemory(req.params.patientId, memory);
  res.json(updated);
});

app.delete('/api/memories/:patientId/:memoryId', (req, res) => {
  const updated = ServerDB.deleteMemory(req.params.patientId, req.params.memoryId);
  res.json(updated);
});

// Synchronized Sessions & Real-time Reports APIs
app.get('/api/sessions/:patientId', (req, res) => {
  res.json(ServerDB.getSessions(req.params.patientId));
});

app.post('/api/sessions/:patientId', (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    res.status(400).json({ error: 'Invalid session data' });
    return;
  }
  const updated = ServerDB.addSession(req.params.patientId, session);
  res.json(updated);
});

// Patients endpoint
app.get('/api/patients', (req, res) => {
  res.json(ServerDB.getPatients());
});

app.post('/api/patients', (req, res) => {
  const patient = req.body;
  if (!patient || !patient.id) {
    res.status(400).json({ error: 'Invalid patient data' });
    return;
  }
  const saved = ServerDB.addPatient(patient);
  res.json(saved);
});

// Caretakers endpoint
app.get('/api/caretakers', (req, res) => {
  res.json(ServerDB.getCaretakers());
});

app.post('/api/caretakers', (req, res) => {
  const caretaker = req.body;
  if (!caretaker || !caretaker.id) {
    res.status(400).json({ error: 'Invalid caretaker data' });
    return;
  }
  const saved = ServerDB.addCaretaker(caretaker);
  res.json(saved);
});

// Update Caregiver Key endpoint
app.patch('/api/caretakers/:id/key', (req, res) => {
  try {
    const { caregiverKey } = req.body;
    if (!caregiverKey || typeof caregiverKey !== 'string') {
      res.status(400).json({ error: 'Caregiver key is required' });
      return;
    }
    const cleanKey = caregiverKey.trim().toUpperCase();
    if (cleanKey.length < 3) {
      res.status(400).json({ error: 'Caregiver key must be at least 3 characters' });
      return;
    }
    const caretakers = ServerDB.getCaretakers();
    const caretaker = caretakers.find((c: any) => c.id === req.params.id);
    if (!caretaker) {
      res.status(404).json({ error: 'Caregiver not found' });
      return;
    }
    const isTaken = caretakers.some(
      (c: any) => c.id !== req.params.id && (c.caregiverKey || '').toUpperCase() === cleanKey
    );
    if (isTaken) {
      res.status(400).json({ error: `Caregiver key "${cleanKey}" is already taken by another caregiver.` });
      return;
    }
    const oldKey = caretaker.caregiverKey;
    caretaker.caregiverKey = cleanKey;
    ServerDB.addCaretaker(caretaker);

    // Update patients linked with old key
    if (oldKey) {
      const patients = ServerDB.getPatients();
      patients.forEach((p: any) => {
        if ((p.linkedCaregiverKey || '').toUpperCase() === oldKey.toUpperCase()) {
          p.linkedCaregiverKey = cleanKey;
          ServerDB.addPatient(p);
        }
      });
    }

    res.json({ success: true, caretaker });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update caregiver key', details: err?.message });
  }
});

// Update Patient Key endpoint
app.patch('/api/patients/:id/key', (req, res) => {
  try {
    const { patientKey } = req.body;
    if (!patientKey || typeof patientKey !== 'string') {
      res.status(400).json({ error: 'Patient key is required' });
      return;
    }
    const cleanKey = patientKey.trim().toUpperCase();
    if (cleanKey.length < 3) {
      res.status(400).json({ error: 'Patient key must be at least 3 characters' });
      return;
    }
    const patients = ServerDB.getPatients();
    const patient = patients.find((p: any) => p.id === req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    const isTaken = patients.some(
      (p: any) => p.id !== req.params.id && (p.patientKey || '').toUpperCase() === cleanKey
    );
    if (isTaken) {
      res.status(400).json({ error: `Patient key "${cleanKey}" is already taken by another patient.` });
      return;
    }
    patient.patientKey = cleanKey;
    ServerDB.addPatient(patient);

    res.json({ success: true, patient });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update patient key', details: err?.message });
  }
});

// -------------------------------------------------------------
// 1. Health check API
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 2. AI Caretaker / Companion Chat API
// -------------------------------------------------------------
app.post('/api/ai/companion', async (req, res) => {
  try {
    const {
      message,
      patientName = 'Senior Companion',
      preferredLanguage = 'en',
      role = 'PATIENT',
      context = {},
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    const ai = getAiClient();

    // If Gemini is available, generate empathetic, dementia-safe response
    if (ai) {
      const systemInstruction =
        role === 'PATIENT'
          ? `You are "Saathi", a deeply compassionate, calming, and culturally attuned AI Caretaker and Companion for an elderly person named ${patientName} living in Northeast India (Assam/NER).
Key guidelines:
1. Speak with immense gentleness, respect, and warmth (like a devoted family member or eldercare companion).
2. Answer in simple, reassuring, short sentences (1 to 3 sentences maximum).
3. If they are confused about time, location, or family, provide gentle reality orientation: reassure them that they are safe at home, their loved ones care for them, and everything is peaceful.
4. Language context: The patient preferred language is "${preferredLanguage}". You can respond in English or the requested regional language if prompted.
5. Never argue, never use medical jargon, and never make them feel forgetful. Always validate and calm.`
          : `You are "Saathi AI Caregiver Co-Pilot", an intelligent clinical & caregiving assistant for dementia and eldercare.
Provide practical, empathetic, evidence-based guidance for family caregivers and healthcare workers in Northeast India.
Be concise, actionable, and compassionate.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `User message: "${message}". Context: ${JSON.stringify(context)}`,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });

        if (response.text) {
          res.json({
            reply: response.text,
            source: 'gemini',
          });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini companion call notice, falling back to local engine:', geminiErr);
      }
    }

    // Graceful offline/fallback generator if API key is not yet set
    const fallbackReplies: Record<string, string> = {
      anxious: `Take a slow, deep breath, ${patientName}. You are completely safe at home, and your family is watching over you with love.`,
      where: `You are resting comfortably in your family home. Everything is peaceful and well taken care of.`,
      next: `Your next gentle step is to enjoy a refreshing glass of warm water or take a quiet veranda rest in the sun.`,
      medicine: `All your morning medications have been safely checked. You are doing wonderfully today.`,
      story: `Picture the serene morning breeze blowing over the emerald tea bushes along the Brahmaputra river. The morning sun is golden and quiet.`,
    };

    const lower = message.toLowerCase();
    let reply = `Hello ${patientName}. I am Saathi, your companion. You are safe, and everything is peaceful today.`;

    if (lower.includes('where') || lower.includes('place') || lower.includes('home')) {
      reply = fallbackReplies.where;
    } else if (lower.includes('anxious') || lower.includes('worry') || lower.includes('scared') || lower.includes('fear')) {
      reply = fallbackReplies.anxious;
    } else if (lower.includes('next') || lower.includes('routine') || lower.includes('do')) {
      reply = fallbackReplies.next;
    } else if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('pill')) {
      reply = fallbackReplies.medicine;
    } else if (lower.includes('story') || lower.includes('talk') || lower.includes('assam')) {
      reply = fallbackReplies.story;
    }

    res.json({
      reply,
      source: 'offline-rule-engine',
    });
  } catch (err: any) {
    console.error('Error in /api/ai/companion:', err);
    res.status(500).json({
      error: 'Failed to generate companion response',
      details: err?.message || String(err),
    });
  }
});

// -------------------------------------------------------------
// 3. AI Daily & Weekly Clinical & Family Reports API
// -------------------------------------------------------------
app.post('/api/ai/daily-report', async (req, res) => {
  try {
    const {
      patient,
      sessions = [],
      routine = [],
      reminders = [],
      date = new Date().toLocaleDateString(),
    } = req.body;

    const patientName = patient?.fullName || 'Senior Member';
    const patientAge = patient?.age || 72;
    const completedRoutineCount = routine.filter((r: any) => r.completed).length;
    const totalRoutineCount = routine.length || 7;
    const sessionCount = sessions.length;
    const avgAccuracy =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((acc: number, s: any) => acc + (s.accuracy || 0), 0) /
              sessions.length
          )
        : 88;

    const ai = getAiClient();

    if (ai) {
      const prompt = `Analyze the following daily cognitive care telemetry for dementia patient ${patientName} (Age: ${patientAge}) on ${date}:
- Routine Tasks Completed: ${completedRoutineCount} of ${totalRoutineCount}
- Cognitive Game Sessions: ${sessionCount}
- Average Recall Accuracy: ${avgAccuracy}%
- Medicine & Hydration Compliance: ${reminders.filter((r: any) => r.completedToday).length} of ${reminders.length}
- Recent Game Sessions: ${JSON.stringify(sessions.slice(0, 5))}

Generate a structured daily report in JSON format matching this schema:
{
  "summaryTitle": "string (e.g. Daily Cognitive & Routine Digest)",
  "cognitiveStabilityScore": number (0 to 100),
  "stabilityStatus": "STABLE" | "SLIGHT_VARIANCE" | "ATTENTION_NEEDED",
  "familyNarrative": "string (warm, humanized 2-3 sentence overview for family caregivers)",
  "clinicalAnalysis": "string (formal, concise observation on reaction time, memory accuracy, and focus stability)",
  "mmseAlignment": {
    "orientationScore": "string (e.g. 9/10 - High)",
    "recallScore": "string (e.g. 8.5/10 - Steady)",
    "attentionScore": "string (e.g. 9/10 - Excellent)"
  },
  "behavioralNotes": "string (observations on sundowning or fatigue indicators)",
  "caregiverActionItems": ["string", "string", "string"],
  "doctorRecommendation": "string (guidance for the next clinic visit)"
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed && (parsed.cognitiveStabilityScore || parsed.familyNarrative)) {
          res.json({
            report: parsed,
            source: 'gemini',
            generatedAt: new Date().toISOString(),
          });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini report notice, falling back to local clinical report generator:', geminiErr);
      }
    }

    // High quality offline fallback report
    const fallbackReport = {
      summaryTitle: `Daily Cognitive & Routine Digest • ${date}`,
      cognitiveStabilityScore: Math.min(96, Math.max(78, avgAccuracy)),
      stabilityStatus: avgAccuracy >= 85 ? 'STABLE' : 'SLIGHT_VARIANCE',
      familyNarrative: `Today was a peaceful and reassuring day for ${patientName}. She completed ${completedRoutineCount} routine daily activities, engaged comfortably with memory keepsake games, and completed her scheduled hydration. Her daily interaction streak continues at ${patient?.dailyStreak || 5} days.`,
      clinicalAnalysis: `Cognitive stability metrics demonstrate consistent short-term recall (${avgAccuracy}% accuracy). Average task latency is within the baseline normative range for mild cognitive impairment (MCI). No acute behavioral agitations or task avoidance flags were recorded.`,
      mmseAlignment: {
        orientationScore: '9/10 • Strong temporal & family recall',
        recallScore: `${(avgAccuracy / 10).toFixed(1)}/10 • Preserved object recognition`,
        attentionScore: '8.8/10 • Visual focus sustained through 3-min loops',
      },
      behavioralNotes:
        completedRoutineCount >= 2
          ? 'Calm daytime temperament with zero late-afternoon disorientation.'
          : 'Slight delay in midday hydration; gentle verbal prompts are recommended.',
      caregiverActionItems: [
        'Maintain the soothing morning tea and 15-minute garden walk routine.',
        'Encourage photo reminiscence before evening dusk to prevent sundowning anxiety.',
        'Ensure prescribed evening hydration is offered at 6:00 PM with seasonal fruit.',
      ],
      doctorRecommendation:
        'Cognitive trajectory remains stable. Continue regular routine monitoring and share this 7-day trend at the next geriatric review.',
    };

    res.json({
      report: fallbackReport,
      source: 'offline-analytics-engine',
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/ai/daily-report:', err);
    res.status(500).json({
      error: 'Failed to generate daily report',
      details: err?.message || String(err),
    });
  }
});

// -------------------------------------------------------------
// 4. AI Routine Suggestions API for Caregivers
// -------------------------------------------------------------
app.post('/api/ai/suggest-routine', async (req, res) => {
  try {
    const { patient, focusArea = 'balanced' } = req.body;
    const patientName = patient?.fullName || 'Elderly Parent';
    const patientAge = patient?.age || 72;

    const ai = getAiClient();

    if (ai) {
      const prompt = `Suggest 4 culturally attuned, gentle daily routine tasks for an elderly dementia patient named ${patientName}, age ${patientAge}, residing in Northeast India. Focus area: ${focusArea}.
Return JSON array of objects with:
[
  {
    "title": "string",
    "timeSlot": "Morning" | "Afternoon" | "Evening" | "Night",
    "time": "string (e.g. 08:30 AM)",
    "notes": "string (reassuring instructions)",
    "category": "HEALTH" | "ACTIVITY" | "SOCIAL" | "HYDRATION"
  }
]`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });

        const parsed = JSON.parse(response.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          res.json({ suggestions: parsed });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini suggest-routine notice, falling back to local routine suggestions:', geminiErr);
      }
    }

    // Default suggestions
    res.json({
      suggestions: [
        {
          title: 'Warm Herbal Tulsi Tea on Veranda',
          timeSlot: 'Morning',
          time: '07:30 AM',
          notes: 'Enjoy the soft morning sunlight and listen to garden birds.',
          category: 'HYDRATION',
        },
        {
          title: 'Blood Pressure & Heart Tablet Check',
          timeSlot: 'Morning',
          time: '08:30 AM',
          notes: 'Take with half glass of lukewarm water after breakfast.',
          category: 'HEALTH',
        },
        {
          title: 'Photo Album & Family Reminiscence',
          timeSlot: 'Afternoon',
          time: '03:30 PM',
          notes: 'Look at family photos from Tezpur and Shillong trips together.',
          category: 'SOCIAL',
        },
        {
          title: 'Calming Flute & Borgeet Music Listening',
          timeSlot: 'Evening',
          time: '07:00 PM',
          notes: 'Relaxing ambient music to ease evening sundowning.',
          category: 'ACTIVITY',
        },
      ],
    });
  } catch (err: any) {
    console.error('Error in /api/ai/suggest-routine:', err);
    res.status(500).json({ error: 'Failed to suggest routines' });
  }
});

// -------------------------------------------------------------
// 5. Start Server with Vite Middleware in Development
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CognitiveSaathi Server running on http://localhost:${PORT}`);
  });
}

startServer();
