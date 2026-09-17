const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf8');

// 1. Add imports and middleware
code = code.replace(
  "import { PatientProfile, CaretakerProfile } from './src/types';",
  "import { PatientProfile, CaretakerProfile } from './src/types';\nimport cookieParser from 'cookie-parser';\nimport jwt from 'jsonwebtoken';\nimport bcrypt from 'bcryptjs';"
);

code = code.replace(
  "app.use(express.json());",
  "app.use(express.json());\napp.use(cookieParser());\n\nconst JWT_SECRET = process.env.JWT_SECRET || 'super-secure-fallback-secret-for-dev-only';\n\nconst requireAuth = (req, res, next) => {\n  const token = req.cookies.token;\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    req.user = jwt.verify(token, JWT_SECRET);\n    next();\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid or expired session' });\n  }\n};\n\nconst hasPatientAccess = (user, patientId) => {\n  if (user.role === 'PATIENT') return user.id === patientId;\n  if (user.role === 'CAREGIVER') {\n    const caretaker = ServerDB.getCaretakers().find(c => c.id === user.id);\n    if (!caretaker) return false;\n    if (caretaker.assignedPatientIds && caretaker.assignedPatientIds.includes(patientId)) return true;\n    const patient = ServerDB.getPatients().find(p => p.id === patientId);\n    if (patient && patient.linkedCaregiverKey && caretaker.caregiverKey && patient.linkedCaregiverKey.toUpperCase() === caretaker.caregiverKey.toUpperCase()) return true;\n  }\n  return false;\n};\n"
);

// 2. Patch auth routes (Login/Register)
code = code.replace("app.post('/api/auth/register', (req, res) => {", "app.post('/api/auth/register', async (req, res) => {");
code = code.replace("password: password,", "password: await bcrypt.hash(password, 10),");
code = code.replace("password: password,", "password: await bcrypt.hash(password, 10),");

code = code.replace("pin: profile.pin || password.slice(0, 4),", "pin: await bcrypt.hash(profile.pin || password.slice(0, 4), 10),");
code = code.replace("pin: profile.pin || password.slice(0, 4),", "pin: await bcrypt.hash(profile.pin || password.slice(0, 4), 10),");

code = code.replace("patient: newPatient,", "patient: ServerDB.sanitizePatient(newPatient),");
code = code.replace("caretaker: newCaretaker,", "caretaker: ServerDB.sanitizeCaretaker(newCaretaker),");

code = code.replace("app.post('/api/auth/login', (req, res) => {", "app.post('/api/auth/login', async (req, res) => {");

code = code.replace(
  "if (patient.password && patient.password !== password && patient.pin !== password) {",
  "const passMatch = patient.password ? await bcrypt.compare(password, patient.password) : false;\n      const pinMatch = patient.pin ? await bcrypt.compare(password, patient.pin) : false;\n      if (!passMatch && !pinMatch) {"
);

code = code.replace(
  "if (caretaker.password && caretaker.password !== password && caretaker.pin !== password) {",
  "const passMatch = caretaker.password ? await bcrypt.compare(password, caretaker.password) : false;\n      const pinMatch = caretaker.pin ? await bcrypt.compare(password, caretaker.pin) : false;\n      if (!passMatch && !pinMatch) {"
);

code = code.replace(
  "token: `token-${patient.id}-${Date.now()}`,",
  "token: jwt.sign({ id: patient.id, role: 'PATIENT' }, JWT_SECRET, { expiresIn: '7d' }) });\n      res.cookie('token', jwt.sign({ id: patient.id, role: 'PATIENT' }, JWT_SECRET, { expiresIn: '7d' }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });\n      // "
);

code = code.replace(
  "token: `token-${caretaker.id}-${Date.now()}`,",
  "token: jwt.sign({ id: caretaker.id, role: 'CAREGIVER' }, JWT_SECRET, { expiresIn: '7d' }) });\n      res.cookie('token', jwt.sign({ id: caretaker.id, role: 'CAREGIVER' }, JWT_SECRET, { expiresIn: '7d' }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });\n      // "
);

code = code.replace("patient, /", "patient: ServerDB.sanitizePatient(patient), /* ");
code = code.replace("caretaker,", "caretaker: ServerDB.sanitizeCaretaker(caretaker),");
code = code.replace("patient: assigned,", "patient: ServerDB.sanitizePatient(assigned),");

code = code.replace(
  "// Link patient to caregiver",
  "app.post('/api/auth/logout', (req, res) => { res.clearCookie('token'); res.json({ success: true }); });\n\n// Link patient to caregiver"
);

// Add requireAuth to specific routes
const protect = (route, auth, idor) => {
  code = code.split(route + ", (req, res) => {").join(route + ", " + auth + ", (req, res) => { " + idor);
  code = code.split(route + ", async (req, res) => {").join(route + ", " + auth + ", async (req, res) => { " + idor);
};

protect("app.post('/api/caretakers/:id/link-patient'", "requireAuth", "if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/patients/:id/link-caregiver'", "requireAuth", "if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/patients/:id/unlink-caregiver'", "requireAuth", "if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.get('/api/routines/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/routines/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.get('/api/reminders/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/reminders/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.get('/api/memories/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/memories/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.delete('/api/memories/:patientId/:memoryId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.get('/api/sessions/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/sessions/:patientId'", "requireAuth", "if (!hasPatientAccess(req.user, req.params.patientId)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.patch('/api/caretakers/:id/key'", "requireAuth", "if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });");
protect("app.patch('/api/patients/:id/key'", "requireAuth", "if (req.user.id !== req.params.id && !hasPatientAccess(req.user, req.params.id)) return res.status(403).json({ error: 'Forbidden' });");

protect("app.post('/api/ai/companion'", "requireAuth", "");
protect("app.post('/api/ai/daily-report'", "requireAuth", "if (req.user.role !== 'CAREGIVER') return res.status(403).json({ error: 'Forbidden' });");
protect("app.post('/api/ai/suggest-routine'", "requireAuth", "if (req.user.role !== 'CAREGIVER') return res.status(403).json({ error: 'Forbidden' });");

code = code.replace(
  "app.get('/api/sync', (req, res) => {",
  "app.get('/api/sync', requireAuth, (req, res) => {\n    const { role, caretakerId, patientId } = req.query;\n    if (req.user.role === 'PATIENT' && req.user.id !== patientId && patientId) return res.status(403).json({ error: 'Forbidden' });\n    if (req.user.role === 'CAREGIVER' && req.user.id !== caretakerId && caretakerId) return res.status(403).json({ error: 'Forbidden' });\n"
);

code = code.replace(
  "app.get('/api/patients', (req, res) => {\n  res.json(ServerDB.getPatients());\n});",
  "app.get('/api/patients', requireAuth, (req, res) => {\n  if (req.user.role === 'PATIENT') return res.json(ServerDB.getPatients().filter(p => p.id === req.user.id).map(p => ServerDB.sanitizePatient(p)));\n  if (req.user.role === 'CAREGIVER') return res.json(ServerDB.getPatients().filter(p => hasPatientAccess(req.user, p.id)).map(p => ServerDB.sanitizePatient(p)));\n  res.json([]);\n});"
);

code = code.replace(
  "app.post('/api/patients', (req, res) => {",
  "app.post('/api/patients', requireAuth, (req, res) => {\n  if (!hasPatientAccess(req.user, req.body.id)) return res.status(403).json({ error: 'Forbidden' });"
);

code = code.replace(
  "app.get('/api/caretakers', (req, res) => {\n  res.json(ServerDB.getCaretakers());\n});",
  "app.get('/api/caretakers', requireAuth, (req, res) => {\n  if (req.user.role === 'CAREGIVER') return res.json(ServerDB.getCaretakers().filter(c => c.id === req.user.id).map(c => ServerDB.sanitizeCaretaker(c)));\n  res.json([]);\n});"
);

code = code.replace(
  "app.post('/api/caretakers', (req, res) => {",
  "app.post('/api/caretakers', requireAuth, (req, res) => {\n  if (req.user.id !== req.body.id) return res.status(403).json({ error: 'Forbidden' });"
);

// fix type errors locally
code = code.replace(/req, res\)/g, "req: any, res: any)");
code = code.replace(/req, res, next\)/g, "req: any, res: any, next: any)");

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Safe patch 2 completed');
