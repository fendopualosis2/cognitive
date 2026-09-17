const fs = require('fs');
let dbCode = fs.readFileSync('./cognitive/server/db.ts', 'utf-8');

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

fs.writeFileSync('./cognitive/server/db.ts', dbCode);
console.log('db.ts patched');
