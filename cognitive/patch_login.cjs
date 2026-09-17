const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

const loginRegex = /app\.post\('\/api\/auth\/login', \(req, res\) => \{[\s\S]*?\}\);/m;

const newLogin = `app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { identifier, password, role = 'PATIENT' } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please enter your mobile number/username and password.' });
      return;
    }

    const cleanInput = String(identifier).trim();
    const digitsOnly = cleanInput.replace(/\\D/g, '');
    const isPhoneAttempt = /^[0-9+\\s()-]+$/.test(cleanInput) && digitsOnly.length > 0;
    
    if (isPhoneAttempt) {
      const actualDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly;
      if (actualDigits.length !== 10) {
        res.status(400).json({ error: 'Mobile number must have exactly 10 digits.' });
        return;
      }
    }

    if (role === 'PATIENT') {
      const patient = ServerDB.findPatient(cleanInput);
      if (!patient) {
        res.status(401).json({ error: 'No account found. Please check your credentials.' });
        return;
      }

      const passMatch = patient.password ? await bcrypt.compare(password, patient.password) : false;
      const pinMatch = patient.pin ? await bcrypt.compare(password, patient.pin) : false;

      if (!passMatch && !pinMatch) {
        res.status(401).json({ error: 'Incorrect password.' });
        return;
      }

      const token = jwt.sign({ id: patient.id, role: 'PATIENT' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

      res.json({
        success: true,
        role: 'PATIENT',
        patient: ServerDB.sanitizePatient(patient),
        token // Return token for fallback if cookies are problematic in iframe, though HttpOnly is preferred.
      });
      return;
    } else {
      const caretaker = ServerDB.findCaretaker(cleanInput);
      if (!caretaker) {
        res.status(401).json({ error: 'No caregiver account found.' });
        return;
      }

      const passMatch = caretaker.password ? await bcrypt.compare(password, caretaker.password) : false;
      const pinMatch = caretaker.pin ? await bcrypt.compare(password, caretaker.pin) : false;

      if (!passMatch && !pinMatch) {
        res.status(401).json({ error: 'Incorrect password.' });
        return;
      }

      const allPatients = ServerDB.getPatients();
      const assigned = allPatients.find(p => 
        caretaker.assignedPatientIds.includes(p.id) ||
        (p.linkedCaregiverKey && caretaker.caregiverKey && p.linkedCaregiverKey.toUpperCase() === caretaker.caregiverKey.toUpperCase())
      ) || null;

      const token = jwt.sign({ id: caretaker.id, role: 'CAREGIVER' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

      res.json({
        success: true,
        role: 'CAREGIVER',
        caretaker: ServerDB.sanitizeCaretaker(caretaker),
        patient: ServerDB.sanitizePatient(assigned),
        token
      });
      return;
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req: any, res: any) => {
  res.clearCookie('token');
  res.json({ success: true });
});
`;

code = code.replace(loginRegex, newLogin);
fs.writeFileSync('./cognitive/server.ts', code);
console.log('Login patched');
