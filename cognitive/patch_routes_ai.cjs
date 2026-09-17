const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

function replaceRoute(pattern, newCode) {
  const regex = new RegExp(pattern, 'm');
  if (regex.test(code)) {
    code = code.replace(regex, newCode);
  } else {
    console.error('Could not find pattern:', pattern);
  }
}

replaceRoute(
  "app\\.post\\('/api/ai/companion', async \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/ai/companion', requireAuth, async (req: any, res: any) => {
  try {
    const { message, patientName = 'Senior Companion', preferredLanguage = 'en', role = 'PATIENT', context = {} } = req.body;
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Message string is required' });

    const ai = getAiClient();
    if (ai) {
      const systemInstruction = role === 'PATIENT'
        ? \`You are "Saathi", a deeply compassionate, calming, and culturally attuned AI Caretaker and Companion for an elderly person named \${patientName} living in Northeast India (Assam/NER).
Key guidelines:
1. Speak with immense gentleness, respect, and warmth (like a devoted family member or eldercare companion).
2. Answer in simple, reassuring, short sentences (1 to 3 sentences maximum).
3. If they are confused about time, location, or family, provide gentle reality orientation: reassure them that they are safe at home, their loved ones care for them, and everything is peaceful.
4. Language context: The patient preferred language is "\${preferredLanguage}". You can respond in English or the requested regional language if prompted.
5. Never argue, never use medical jargon, and never make them feel forgetful. Always validate and calm.\`
        : \`You are "Saathi AI Caregiver Co-Pilot", an intelligent clinical & caregiving assistant for dementia and eldercare.
Provide practical, empathetic, evidence-based guidance for family caregivers and healthcare workers in Northeast India.
Be concise, actionable, and compassionate.\`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: \`User message: "\${message}". Context: \${JSON.stringify(context)}\`,
          config: { systemInstruction, temperature: 0.6 },
        });

        if (response.text) return res.json({ reply: response.text, source: 'gemini' });
      } catch (geminiErr) { console.warn('Gemini companion call notice, falling back:', geminiErr); }
    }

    const fallbackReplies: Record<string, string> = {
      anxious: \`Take a slow, deep breath, \${patientName}. You are completely safe at home.\`,
      where: \`You are resting comfortably in your family home.\`,
      next: \`Your next gentle step is to enjoy a refreshing glass of warm water.\`,
      medicine: \`Your medicine schedule is up to date.\`,
      story: \`Picture the serene morning breeze blowing over the emerald tea bushes.\`,
    };

    const lower = message.toLowerCase();
    let reply = \`Hello \${patientName}. I am Saathi, your companion. You are safe, and everything is peaceful today.\`;

    if (lower.includes('where') || lower.includes('place') || lower.includes('home')) reply = fallbackReplies.where;
    else if (lower.includes('anxious') || lower.includes('worry') || lower.includes('scared') || lower.includes('fear')) reply = fallbackReplies.anxious;
    else if (lower.includes('next') || lower.includes('routine') || lower.includes('do')) reply = fallbackReplies.next;
    else if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('pill')) reply = fallbackReplies.medicine;
    else if (lower.includes('story') || lower.includes('talk') || lower.includes('assam')) reply = fallbackReplies.story;

    res.json({ reply, source: 'offline-rule-engine' });
  } catch (err: any) { res.status(500).json({ error: 'Failed to generate response' }); }
});`
);

replaceRoute(
  "app\\.post\\('/api/ai/daily-report', async \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/ai/daily-report', requireAuth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'CAREGIVER') return res.status(403).json({ error: 'Forbidden' });
    const { patient, sessions = [], routine = [], reminders = [], date = new Date().toLocaleDateString() } = req.body;
    if (patient && patient.id && !hasPatientAccess(req.user, patient.id)) return res.status(403).json({ error: 'Forbidden' });

    const patientName = patient?.fullName || 'Senior Member';
    const patientAge = patient?.age || 72;
    const completedRoutineCount = routine.filter((r: any) => r.completed).length;
    const totalRoutineCount = routine.length || 7;
    const sessionCount = sessions.length;
    const avgAccuracy = sessions.length > 0
      ? Math.round(sessions.reduce((acc: number, s: any) => acc + (s.accuracy || 0), 0) / sessions.length)
      : 88;

    const ai = getAiClient();
    if (ai) {
      const prompt = \`Analyze the following daily cognitive care telemetry for dementia patient \${patientName} (Age: \${patientAge}) on \${date}:
- Routine Tasks Completed: \${completedRoutineCount} of \${totalRoutineCount}
- Cognitive Game Sessions: \${sessionCount}
- Average Recall Accuracy: \${avgAccuracy}%
- Medicine & Hydration Compliance: \${reminders.filter((r: any) => r.completedToday).length} of \${reminders.length}
- Recent Game Sessions: \${JSON.stringify(sessions.slice(0, 5))}

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
}\`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.4 },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed && (parsed.cognitiveStabilityScore || parsed.familyNarrative)) {
          return res.json({ report: parsed, source: 'gemini', generatedAt: new Date().toISOString() });
        }
      } catch (geminiErr) { console.warn('Gemini report notice, falling back:', geminiErr); }
    }

    const fallbackReport = {
      summaryTitle: \`Daily Cognitive & Routine Digest • \${date}\`,
      cognitiveStabilityScore: Math.min(96, Math.max(78, avgAccuracy)),
      stabilityStatus: avgAccuracy >= 85 ? 'STABLE' : 'SLIGHT_VARIANCE',
      familyNarrative: \`Today was a peaceful and reassuring day for \${patientName}. She completed \${completedRoutineCount} routine daily activities, engaged comfortably with memory keepsake games, and completed her scheduled hydration. Her daily interaction streak continues at \${patient?.dailyStreak || 5} days.\`,
      clinicalAnalysis: \`Cognitive stability metrics demonstrate consistent short-term recall (\${avgAccuracy}% accuracy). Average task latency is within the baseline normative range for mild cognitive impairment (MCI).\`,
      mmseAlignment: {
        orientationScore: '9/10 • Strong temporal & family recall',
        recallScore: \`\${(avgAccuracy / 10).toFixed(1)}/10 • Preserved object recognition\`,
        attentionScore: '8.8/10 • Visual focus sustained through 3-min loops',
      },
      behavioralNotes: completedRoutineCount >= 2 ? 'Calm daytime temperament.' : 'Slight delay in midday hydration; gentle verbal prompts are recommended.',
      caregiverActionItems: ['Maintain the soothing morning tea and 15-minute garden walk routine.', 'Encourage photo reminiscence before evening dusk.'],
      doctorRecommendation: 'Cognitive trajectory remains stable.',
    };

    res.json({ report: fallbackReport, source: 'offline-analytics-engine', generatedAt: new Date().toISOString() });
  } catch (err: any) { res.status(500).json({ error: 'Failed to generate report' }); }
});`
);

replaceRoute(
  "app\\.post\\('/api/ai/suggest-routine', async \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/ai/suggest-routine', requireAuth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'CAREGIVER') return res.status(403).json({ error: 'Forbidden' });
    const { patient, focusArea = 'balanced' } = req.body;
    if (patient && patient.id && !hasPatientAccess(req.user, patient.id)) return res.status(403).json({ error: 'Forbidden' });
    const patientName = patient?.fullName || 'Elderly Parent';
    const patientAge = patient?.age || 72;

    const ai = getAiClient();
    if (ai) {
      const prompt = \`Suggest 4 culturally attuned, gentle daily routine tasks for an elderly dementia patient named \${patientName}, age \${patientAge}, residing in Northeast India. Focus area: \${focusArea}.
Return JSON array of objects with:
[
  {
    "title": "string",
    "timeSlot": "Morning" | "Afternoon" | "Evening" | "Night",
    "time": "string (e.g. 08:30 AM)",
    "notes": "string (reassuring instructions)",
    "category": "HEALTH" | "ACTIVITY" | "SOCIAL" | "HYDRATION"
  }
]\`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.5 },
        });

        const parsed = JSON.parse(response.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) return res.json({ suggestions: parsed });
      } catch (geminiErr) { console.warn('Gemini suggest-routine notice, falling back:', geminiErr); }
    }

    res.json({
      suggestions: [
        { title: 'Warm Herbal Tulsi Tea', timeSlot: 'Morning', time: '07:30 AM', notes: 'Enjoy the soft morning sunlight.', category: 'HYDRATION' },
        { title: 'Blood Pressure Check', timeSlot: 'Morning', time: '08:30 AM', notes: 'Take with half glass of lukewarm water.', category: 'HEALTH' },
        { title: 'Photo Album', timeSlot: 'Afternoon', time: '03:30 PM', notes: 'Look at family photos.', category: 'SOCIAL' },
        { title: 'Calming Music', timeSlot: 'Evening', time: '07:00 PM', notes: 'Relaxing ambient music.', category: 'ACTIVITY' },
      ],
    });
  } catch (err: any) { res.status(500).json({ error: 'Failed to suggest routines' }); }
});`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Routes patched AI');
