const fs = require('fs');
let code = fs.readFileSync('./cognitive/src/lib/offlineStore.ts', 'utf-8');

code = code.replace(/this\.getRoutines\(/g, 'this.getRoutine(');
code = code.replace(/this\.saveRoutines\(/g, 'this.saveRoutine(');
code = code.replace(/session\.id/g, 'session.patientId || session.caretakerId');
code = code.replace(/this\.logout\(\)/g, 'this.clearAuthSession()');
code = code.replace(/this\.saveCaretaker\(/g, 'this.addCaretaker(');

fs.writeFileSync('./cognitive/src/lib/offlineStore.ts', code);
console.log('Errors patched');
