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
  "app\\.patch\\('/api/caretakers/:id/key', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.patch('/api/caretakers/:id/key', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { caregiverKey } = req.body;
    if (!caregiverKey || typeof caregiverKey !== 'string') return res.status(400).json({ error: 'Caregiver key is required' });
    
    const cleanKey = caregiverKey.trim().toUpperCase();
    if (cleanKey.length < 3) return res.status(400).json({ error: 'Caregiver key must be at least 3 characters' });
    
    const caretakers = ServerDB.getCaretakers();
    const caretaker = caretakers.find((c: any) => c.id === req.params.id);
    if (!caretaker) return res.status(404).json({ error: 'Caregiver not found' });
    
    const isTaken = caretakers.some((c: any) => c.id !== req.params.id && (c.caregiverKey || '').toUpperCase() === cleanKey);
    if (isTaken) return res.status(400).json({ error: \`Caregiver key "\${cleanKey}" is already taken.\` });
    
    const oldKey = caretaker.caregiverKey;
    caretaker.caregiverKey = cleanKey;
    ServerDB.addCaretaker(caretaker);

    if (oldKey) {
      const patients = ServerDB.getPatients();
      patients.forEach((p: any) => {
        if ((p.linkedCaregiverKey || '').toUpperCase() === oldKey.toUpperCase()) {
          p.linkedCaregiverKey = cleanKey;
          ServerDB.addPatient(p);
        }
      });
    }
    res.json({ success: true, caretaker: ServerDB.sanitizeCaretaker(caretaker) });
  } catch (err: any) { res.status(500).json({ error: 'Failed to update caregiver key' }); }
});`
);

replaceRoute(
  "app\\.patch\\('/api/patients/:id/key', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.patch('/api/patients/:id/key', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    const { patientKey } = req.body;
    if (!patientKey || typeof patientKey !== 'string') return res.status(400).json({ error: 'Patient key is required' });
    
    const cleanKey = patientKey.trim().toUpperCase();
    if (cleanKey.length < 3) return res.status(400).json({ error: 'Patient key must be at least 3 characters' });
    
    const patients = ServerDB.getPatients();
    const patient = patients.find((p: any) => p.id === req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    const isTaken = patients.some((p: any) => p.id !== req.params.id && (p.patientKey || '').toUpperCase() === cleanKey);
    if (isTaken) return res.status(400).json({ error: \`Patient key "\${cleanKey}" is already taken.\` });
    
    patient.patientKey = cleanKey;
    ServerDB.addPatient(patient);
    res.json({ success: true, patient: ServerDB.sanitizePatient(patient) });
  } catch (err: any) { res.status(500).json({ error: 'Failed to update patient key' }); }
});`
);

replaceRoute(
  "app\\.get\\('/api/sync', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/sync', requireAuth, (req: any, res: any) => {
  try {
    const { role, caretakerId, patientId } = req.query as any;
    
    let targetCaretaker;
    let targetPatient;
    let assignedPatients = [];
    let activePatId = undefined;

    if (req.user.role === 'CAREGIVER') {
      const caretakers = ServerDB.getCaretakers();
      targetCaretaker = caretakers.find((c: any) => c.id === req.user.id);
      
      const allPatients = ServerDB.getPatients();
      assignedPatients = allPatients.filter((p: any) => 
        (targetCaretaker?.assignedPatientIds?.includes(p.id)) ||
        (p.linkedCaregiverKey && targetCaretaker?.caregiverKey && p.linkedCaregiverKey.toUpperCase() === targetCaretaker.caregiverKey.toUpperCase())
      );
      
      if (patientId && hasPatientAccess(req.user, patientId)) {
        targetPatient = assignedPatients.find((p: any) => p.id === patientId);
        activePatId = patientId;
      } else if (assignedPatients.length > 0) {
        activePatId = assignedPatients[0].id;
      }
    } else if (req.user.role === 'PATIENT') {
      targetPatient = ServerDB.getPatients().find((p: any) => p.id === req.user.id);
      activePatId = req.user.id;
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const memories = activePatId ? ServerDB.getMemories(activePatId) : [];
    const sessions = activePatId ? ServerDB.getSessions(activePatId) : [];
    const routines = activePatId ? ServerDB.getRoutines(activePatId) : [];
    const reminders = activePatId ? ServerDB.getReminders(activePatId) : [];

    res.json({
      success: true,
      timestamp: Date.now(),
      targetCaretaker: ServerDB.sanitizeCaretaker(targetCaretaker),
      targetPatient: ServerDB.sanitizePatient(targetPatient),
      assignedPatients: assignedPatients.map((p: any) => ServerDB.sanitizePatient(p)),
      activePatId,
      memories,
      sessions,
      routines,
      reminders,
    });
  } catch (err: any) { res.status(500).json({ error: 'Sync failed' }); }
});`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Routes patched 4');
