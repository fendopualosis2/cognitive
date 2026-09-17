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
  "app\\.get\\('/api/memories/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/memories/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  res.json(ServerDB.getMemories(req.params.patientId));
});`
);

replaceRoute(
  "app\\.post\\('/api/memories/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/memories/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  const memory = req.body;
  if (!memory || !memory.id) return res.status(400).json({ error: 'Invalid memory data' });
  const updated = ServerDB.addMemory(req.params.patientId, memory);
  res.json(updated);
});`
);

replaceRoute(
  "app\\.delete\\('/api/memories/:patientId/:memoryId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.delete('/api/memories/:patientId/:memoryId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  const updated = ServerDB.deleteMemory(req.params.patientId, req.params.memoryId);
  res.json(updated);
});`
);

replaceRoute(
  "app\\.get\\('/api/sessions/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.get('/api/sessions/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  res.json(ServerDB.getSessions(req.params.patientId));
});`
);

replaceRoute(
  "app\\.post\\('/api/sessions/:patientId', \\(req, res\\) => \\{[\\s\\S]*?\\}\\);",
  `app.post('/api/sessions/:patientId', requireAuth, (req: any, res: any) => {
  if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });
  const session = req.body;
  if (!session || !session.id) return res.status(400).json({ error: 'Invalid session data' });
  const updated = ServerDB.addSession(req.params.patientId, session);
  res.json(updated);
});`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Routes patched 2');
