const fs = require('fs');
let code = fs.readFileSync('./cognitive/src/lib/offlineStore.ts', 'utf-8');

// Replace syncWithServer with a real sync
code = code.replace(
  /static async syncWithServer\(\): Promise<void> \{[\s\S]*?\n  \}/m,
  `static async syncWithServer(): Promise<boolean> {
    try {
      const activePatId = this.getActivePatientId();
      const session = this.getAuthSession();
      if (!session) return false;

      // 1. Push local changes
      const queue = this.getSyncQueue();
      if (queue.length > 0 || activePatId) {
        if (activePatId) {
          const routines = this.getRoutines(activePatId);
          const reminders = this.getReminders(activePatId);
          const sessions = this.getSessions(activePatId);
          const memories = this.getMemories(activePatId);
          
          await Promise.all([
            fetch(\`/api/routines/\${activePatId}\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(routines) }),
            fetch(\`/api/reminders/\${activePatId}\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reminders) })
          ]);
          
          for (let sess of sessions) {
             await fetch(\`/api/sessions/\${activePatId}\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sess) });
          }
          for (let mem of memories) {
             await fetch(\`/api/memories/\${activePatId}\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mem) });
          }
        }
        
        // Push patient/caretaker profiles
        if (session.role === 'PATIENT') {
           const p = this.getPatients().find(x => x.id === session.id);
           if (p) await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
        } else if (session.role === 'CAREGIVER') {
           const c = this.getCaretakers().find(x => x.id === session.id);
           if (c) await fetch('/api/caretakers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
        }
        
        this.clearSyncQueue();
      }

      // 2. Pull server changes
      let query = \`?role=\${session.role}\`;
      if (session.role === 'PATIENT') query += \`&patientId=\${session.id}\`;
      if (session.role === 'CAREGIVER') query += \`&caretakerId=\${session.id}\`;
      
      const res = await fetch(\`/api/sync\${query}\`);
      if (res.status === 401 || res.status === 403) {
         this.logout();
         if (typeof window !== 'undefined') window.location.href = '/';
         return false;
      }
      
      if (res.ok) {
         const data = await res.json();
         if (data.targetPatient) this.savePatient(data.targetPatient);
         if (data.targetCaretaker) this.saveCaretaker(data.targetCaretaker);
         if (data.assignedPatients) this.savePatients(data.assignedPatients);
         if (data.activePatId) {
            this.saveRoutines(data.routines || [], data.activePatId);
            this.saveReminders(data.reminders || [], data.activePatId);
            this.saveMemories(data.memories || [], data.activePatId);
            if (data.sessions) {
               localStorage.setItem(\`\${STORAGE_KEYS.SESSIONS}_\${data.activePatId}\`, JSON.stringify(data.sessions));
            }
         }
      }
      return true;
    } catch (e) {
      console.warn('Sync failed:', e);
      return false;
    }
  }`
);

fs.writeFileSync('./cognitive/src/lib/offlineStore.ts', code);
console.log('Sync patched');
