const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

// Replace the entire register endpoint to be secure.
const registerRegex = /app\.post\('\/api\/auth\/register', \(req, res\) => \{[\s\S]*?\}\);/m;

const newRegister = `app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { role, profile, password } = req.body;

    if (!role || !profile || !password) {
      res.status(400).json({ error: 'Role, profile data, and password are required.' });
      return;
    }

    const { fullName, username, phone } = profile;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Full Name is mandatory.' });
      return;
    }

    if (!username || !username.trim()) {
      res.status(400).json({ error: 'Username is mandatory.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters.' });
      return;
    }

    if (ServerDB.isUsernameTaken(cleanUsername)) {
      res.status(400).json({ error: \`Username "\${username}" is already taken.\` });
      return;
    }

    if (!phone || !phone.trim()) {
      res.status(400).json({ error: 'Mobile number is mandatory.' });
      return;
    }

    const cleanPhone = phone.replace(/\\D/g, '');
    const actualDigits = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
    if (actualDigits.length !== 10) {
      res.status(400).json({ error: 'Mobile number must have exactly 10 digits.' });
      return;
    }

    if (ServerDB.isPhoneTaken(actualDigits)) {
      res.status(400).json({ error: 'This mobile number is already registered.' });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters long.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(profile.pin || password.slice(0, 4), 10);

    if (role === 'PATIENT') {
      const patientId = \`patient-\${Date.now()}\`;
      const userPatientKey = (profile.patientKey?.trim() || \`PT-\${Math.floor(100000 + Math.random() * 900000)}\`).toUpperCase();

      const newPatient: PatientProfile = {
        id: patientId,
        fullName: fullName.trim(),
        preferredName: profile.preferredName?.trim() || fullName.trim().split(' ')[0],
        username: cleanUsername,
        password: hashedPassword,
        pin: hashedPin,
        patientKey: userPatientKey,
        age: Number(profile.age) || 70,
        region: profile.region?.trim() || 'Guwahati, Assam',
        state: profile.state || 'Assam',
        preferredLanguage: profile.preferredLanguage || 'en',
        phone: cleanPhone,
        hasCaregiver: Boolean(profile.hasCaregiver || profile.linkedCaregiverKey),
        caregiverName: profile.caregiverName?.trim() || 'Family Caregiver',
        caregiverPhone: profile.caregiverPhone?.trim() || '',
        avatarUrl: profile.avatarUrl || '',
        dailyStreak: 0,
        todayCompletedCount: 0,
        linkedCaregiverKey: profile.linkedCaregiverKey?.trim().toUpperCase() || '',
      };

      ServerDB.addPatient(newPatient);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully! Please log in.',
        patient: ServerDB.sanitizePatient(newPatient),
      });
      return;
    } else if (role === 'CAREGIVER') {
      const caretakerId = \`caretaker-\${Date.now()}\`;
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const userCaregiverKey = (profile.caregiverKey?.trim() || \`CG-\${code}\`).toUpperCase();

      const newCaretaker: CaretakerProfile = {
        id: caretakerId,
        fullName: fullName.trim(),
        username: cleanUsername,
        password: hashedPassword,
        phone: cleanPhone,
        email: profile.email?.trim() || '',
        relation: profile.relation?.trim() || 'Family Member',
        pin: hashedPin,
        caregiverKey: userCaregiverKey,
        assignedPatientIds: profile.assignedPatientIds || [],
        avatarUrl: profile.avatarUrl || '',
      };

      ServerDB.addCaretaker(newCaretaker);

      res.status(201).json({
        success: true,
        message: 'Caregiver account registered successfully!',
        caretaker: ServerDB.sanitizeCaretaker(newCaretaker),
      });
      return;
    }

    res.status(400).json({ error: 'Invalid role specified.' });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});`;

code = code.replace(registerRegex, newRegister);
fs.writeFileSync('./cognitive/server.ts', code);
console.log('Register patched');
