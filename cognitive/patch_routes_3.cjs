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
  "app\\.get\\('/api/patients', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/patients', requireAuth, (req: any, res: any) => {
  if (req.user.role === 'PATIENT') {
    const p = ServerDB.getPatients().find((x: any) => x.id === req.user.id);
    return res.json(p ? [ServerDB.sanitizePatient(p)] : []);
  } else if (req.user.role === 'CAREGIVER') {
    const caretaker = ServerDB.getCaretakers().find((c: any) => c.id === req.user.id);
    const assigned = ServerDB.getPatients().filter((p: any) => 
      (caretaker && caretaker.assignedPatientIds && caretaker.assignedPatientIds.includes(p.id)) ||
      (p.linkedCaregiverKey && caretaker && caretaker.caregiverKey && p.linkedCaregiverKey.toUpperCase() === caretaker.caregiverKey.toUpperCase())
    );
    return res.json(assigned.map((x: any) => ServerDB.sanitizePatient(x)));
  }
  res.json([]);
});`
);

// We need to protect POST /api/patients properly (for profile updates)
replaceRoute(
  "app\\.post\\('/api/patients', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/patients', requireAuth, async (req: any, res: any) => {
  const patient = req.body;
  if (!patient || !patient.id) return res.status(400).json({ error: 'Invalid patient data' });
  if (!hasPatientAccess(req.user, patient.id)) return res.status(403).json({ error: 'Forbidden' });
  
  const existing = ServerDB.getPatients().find((p: any) => p.id === patient.id);
  if (existing) {
    patient.password = existing.password;
    patient.pin = existing.pin;
  }
  const saved = ServerDB.addPatient(patient);
  res.json(ServerDB.sanitizePatient(saved));
});`
);

replaceRoute(
  "app\\.get\\('/api/caretakers', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/caretakers', requireAuth, (req: any, res: any) => {
  if (req.user.role === 'CAREGIVER') {
    const c = ServerDB.getCaretakers().find((x: any) => x.id === req.user.id);
    return res.json(c ? [ServerDB.sanitizeCaretaker(c)] : []);
  }
  res.json([]);
});`
);

replaceRoute(
  "app\\.post\\('/api/caretakers', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/caretakers', requireAuth, async (req: any, res: any) => {
  const caretaker = req.body;
  if (!caretaker || !caretaker.id) return res.status(400).json({ error: 'Invalid caretaker data' });
  if (req.user.id !== caretaker.id) return res.status(403).json({ error: 'Forbidden' });
  
  const existing = ServerDB.getCaretakers().find((c: any) => c.id === caretaker.id);
  if (existing) {
    caretaker.password = existing.password;
    caretaker.pin = existing.pin;
  }
  const saved = ServerDB.addCaretaker(caretaker);
  res.json(ServerDB.sanitizeCaretaker(saved));
});`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Routes patched 3');
