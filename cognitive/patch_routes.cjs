const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

// Helper to replace a route block
function replaceRoute(pattern, newCode) {
  const regex = new RegExp(pattern, 'm');
  if (regex.test(code)) {
    code = code.replace(regex, newCode);
  } else {
    console.error('Could not find pattern:', pattern);
  }
}

replaceRoute(
  "app\\.post\\('/api/caretakers/:id/link-patient', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/caretakers/:id/link-patient', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Patient key, mobile number, or username is required.' });
    const result = ServerDB.linkPatientToCaretaker(req.params.id, String(identifier).trim());
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ success: true, caretaker: ServerDB.sanitizeCaretaker(result.caretaker), patient: ServerDB.sanitizePatient(result.patient) });
  } catch (err: any) { res.status(500).json({ error: 'Failed to link patient' }); }
});`
);

replaceRoute(
  "app\\.post\\('/api/patients/:id/link-caregiver', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/patients/:id/link-caregiver', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    const { caregiverKey } = req.body;
    if (!caregiverKey) return res.status(400).json({ error: 'Caregiver key is required.' });
    const result = ServerDB.linkCaregiverToPatient(req.params.id, String(caregiverKey).trim());
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ success: true, caretaker: ServerDB.sanitizeCaretaker(result.caretaker), patient: ServerDB.sanitizePatient(result.patient) });
  } catch (err: any) { res.status(500).json({ error: 'Failed to link caregiver' }); }
});`
);

replaceRoute(
  "app\\.post\\('/api/patients/:id/unlink-caregiver', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/patients/:id/unlink-caregiver', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    const result = ServerDB.unlinkCaregiver(req.params.id);
    res.json({ success: true, patient: ServerDB.sanitizePatient(result.patient) });
  } catch (err: any) { res.status(500).json({ error: 'Failed to unlink caregiver' }); }
});`
);

replaceRoute(
  "app\\.get\\('/api/routines/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/routines/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  res.json(ServerDB.getRoutines(req.params.patientId));
});`
);

replaceRoute(
  "app\\.post\\('/api/routines/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/routines/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  const routines = req.body;
  if (!Array.isArray(routines)) return res.status(400).json({ error: 'Routines must be an array' });
  const updated = ServerDB.saveRoutines(req.params.patientId, routines);
  res.json(updated);
});`
);

replaceRoute(
  "app\\.get\\('/api/reminders/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/reminders/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  res.json(ServerDB.getReminders(req.params.patientId));
});`
);

replaceRoute(
  "app\\.post\\('/api/reminders/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/reminders/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  const reminders = req.body;
  if (!Array.isArray(reminders)) return res.status(400).json({ error: 'Reminders must be an array' });
  const updated = ServerDB.saveReminders(req.params.patientId, reminders);
  res.json(updated);
});`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Routes patched 1');
