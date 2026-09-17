const fs = require('fs');
let dbCode = fs.readFileSync('./server/db.ts', 'utf-8');

// Replace findPatient and findCaretaker to not return passwords in some cases? 
// No, the DB layer should return the full record for authentication, but we add sanitize methods.

dbCode += `
  static sanitizePatient(p) {
    if (!p) return p;
    const { password, pin, ...safe } = p;
    return safe;
  }
  static sanitizeCaretaker(c) {
    if (!c) return c;
    const { password, pin, ...safe } = c;
    return safe;
  }
`;

// wait, the class ServerDB closes at the end. We need to inject these before the last '}'.
const lastBraceIndex = dbCode.lastIndexOf('}');
if (lastBraceIndex !== -1) {
  const newMethods = `
  static sanitizePatient(p: any): any {
    if (!p) return p;
    const { password, pin, ...safe } = p;
    return safe;
  }
  static sanitizeCaretaker(c: any): any {
    if (!c) return c;
    const { password, pin, ...safe } = c;
    return safe;
  }
`;
  dbCode = dbCode.substring(0, lastBraceIndex) + newMethods + dbCode.substring(lastBraceIndex);
}

fs.writeFileSync('./server/db.ts', dbCode);
console.log('db.ts patched');
