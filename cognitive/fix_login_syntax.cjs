const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf8');

code = code.replace(/token: jwt\.sign\(\{\s*id: patient\.id,\s*role: 'PATIENT'\s*\}, JWT_SECRET, \{\s*expiresIn: '7d'\s*\}\) \}\);\n\s*res\.cookie\('token', jwt\.sign\(\{\s*id: patient\.id,\s*role: 'PATIENT'\s*\}, JWT_SECRET, \{\s*expiresIn: '7d'\s*\}\), \{\s*httpOnly: true,\s*secure: process\.env\.NODE_ENV === 'production',\s*sameSite: 'lax'\s*\}\);\n\s*\/\/\s*\n\s*\}\);/gm,
`token: jwt.sign({ id: patient.id, role: 'PATIENT' }, JWT_SECRET, { expiresIn: '7d' })
      });
      res.cookie('token', jwt.sign({ id: patient.id, role: 'PATIENT' }, JWT_SECRET, { expiresIn: '7d' }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });`);

code = code.replace(/token: jwt\.sign\(\{\s*id: caretaker\.id,\s*role: 'CAREGIVER'\s*\}, JWT_SECRET, \{\s*expiresIn: '7d'\s*\}\) \}\);\n\s*res\.cookie\('token', jwt\.sign\(\{\s*id: caretaker\.id,\s*role: 'CAREGIVER'\s*\}, JWT_SECRET, \{\s*expiresIn: '7d'\s*\}\), \{\s*httpOnly: true,\s*secure: process\.env\.NODE_ENV === 'production',\s*sameSite: 'lax'\s*\}\);\n\s*\/\/\s*\n\s*\}\);/gm,
`token: jwt.sign({ id: caretaker.id, role: 'CAREGIVER' }, JWT_SECRET, { expiresIn: '7d' })
      });
      res.cookie('token', jwt.sign({ id: caretaker.id, role: 'CAREGIVER' }, JWT_SECRET, { expiresIn: '7d' }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });`);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Fixed syntax');
