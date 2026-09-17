const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

const newRoute = `app.delete('/api/patients/:id', requireAuth, (req: any, res: any) => {
  try {
    if (req.user.role === 'PATIENT' && req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'CAREGIVER') {
      const caretakers = ServerDB.getCaretakers();
      const caretaker = caretakers.find((c: any) => c.id === req.user.id);
      if (!caretaker) return res.status(403).json({ error: 'Forbidden' });
      if (!caretaker.assignedPatientIds || !caretaker.assignedPatientIds.includes(req.params.id)) {
        const p = ServerDB.getPatients().find((x: any) => x.id === req.params.id);
        if (!p || !p.linkedCaregiverKey || p.linkedCaregiverKey.toUpperCase() !== (caretaker.caregiverKey || '').toUpperCase()) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
    }
    
    const db = ServerDB.ensureDbExists();
    db.patients = db.patients.filter((p: any) => p.id !== req.params.id);
    delete db.routines[req.params.id];
    delete db.reminders[req.params.id];
    delete db.memories[req.params.id];
    delete db.sessions[req.params.id];
    ServerDB.save(db);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});
`;

code = code.replace("app.post('/api/patients'", newRoute + "\napp.post('/api/patients'");
fs.writeFileSync('./cognitive/server.ts', code);

let storeCode = fs.readFileSync('./cognitive/src/lib/offlineStore.ts', 'utf-8');
storeCode = storeCode.replace(
  "localStorage.removeItem(`${STORAGE_KEYS.MEMORIES}_${id}`);",
  "localStorage.removeItem(`${STORAGE_KEYS.MEMORIES}_${id}`);\n      fetch(`/api/patients/${id}`, { method: 'DELETE' }).catch(e => console.warn('Server delete error', e));"
);
fs.writeFileSync('./cognitive/src/lib/offlineStore.ts', storeCode);
console.log('Delete patched');
