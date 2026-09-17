const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

const helpers = `
const hasPatientAccess = (user: any, patientId: string) => {
  if (user.role === 'PATIENT') {
    return user.id === patientId;
  } else if (user.role === 'CAREGIVER') {
    const caretaker = ServerDB.getCaretakers().find((c: any) => c.id === user.id);
    if (!caretaker) return false;
    if (caretaker.assignedPatientIds && caretaker.assignedPatientIds.includes(patientId)) return true;
    const patient = ServerDB.getPatients().find((p: any) => p.id === patientId);
    if (patient && patient.linkedCaregiverKey && caretaker.caregiverKey && patient.linkedCaregiverKey.toUpperCase() === caretaker.caregiverKey.toUpperCase()) return true;
    return false;
  }
  return false;
};
`;

code = code.replace("const requireAuth = ", helpers + "\nconst requireAuth = ");

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Auth helpers added');
