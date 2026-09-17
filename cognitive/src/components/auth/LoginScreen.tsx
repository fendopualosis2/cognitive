import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Phone,
  User,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Compass,
  Check,
  Volume2,
  Loader2,
  MapPin,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { LanguageCode, PatientProfile, CaretakerProfile } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { VoiceService } from '../../lib/voiceService';
import { PhotoUploader } from '../common/PhotoUploader';
import { LanguageDropdown } from '../common/LanguageDropdown';
import { ForgotPinModal } from './ForgotPinModal';
import { VoicePackModal } from '../voice/VoicePackModal';

interface LoginScreenProps {
  onLoginPatient: (patient: PatientProfile) => void;
  onLoginCaregiver: (caretaker: CaretakerProfile, selectedPatient: PatientProfile | null) => void;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const NER_STATES = [
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Arunachal Pradesh',
  'Sikkim',
  'Other',
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginPatient,
  onLoginCaregiver,
  lang,
  onLangChange,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = translations[lang];

  // Selected space: 'PATIENT' or 'CAREGIVER'
  const [selectedSpace, setSelectedSpace] = useState<'PATIENT' | 'CAREGIVER'>('PATIENT');

  // Flow State: 'LOGIN' or 'REGISTER'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Patient Login Form State (Number or Username + Password)
  const [patientLoginInput, setPatientLoginInput] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Caregiver Login Form State (Number or Username + Password)
  const [caregiverLoginInput, setCaregiverLoginInput] = useState('');
  const [caregiverPin, setCaregiverPin] = useState('');
  const [showCaregiverPin, setShowCaregiverPin] = useState(false);

  // Patient Registration Form State (ALL FIELDS MANDATORY)
  const [regFullName, setRegFullName] = useState('');
  const [regPreferredName, setRegPreferredName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('Assam');
  const [regPreferredLang, setRegPreferredLang] = useState<LanguageCode>(lang);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAvatar, setRegAvatar] = useState<string | undefined>(undefined);
  const [regPatientKey, setRegPatientKey] = useState('');
  const [regPatientLinkedCaregiverKey, setRegPatientLinkedCaregiverKey] = useState('');

  // Caregiver Registration Form State (ALL FIELDS MANDATORY)
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverUsername, setRegCaregiverUsername] = useState('');
  const [regCaregiverRelation, setRegCaregiverRelation] = useState('Daughter');
  const [regCaregiverPhone, setRegCaregiverPhone] = useState('');
  const [regCaregiverEmail, setRegCaregiverEmail] = useState('');
  const [regCaregiverPin, setRegCaregiverPin] = useState('');
  const [regCaregiverConfirmPin, setRegCaregiverConfirmPin] = useState('');
  const [regCaregiverKey, setRegCaregiverKey] = useState('');
  const [regCaregiverLinkPatientKey, setRegCaregiverLinkPatientKey] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background server sync on mount
  useEffect(() => {
    OfflineStore.syncWithServer();
  }, []);

  // Handle Patient Log In (with Mobile Number or Username + Password)
  const handlePatientLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputTrimmed = patientLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your mobile number or username.');
      return;
    }

    // Check if input is a mobile number attempt (contains digits or is a phone number format)
    const digitsOnly = inputTrimmed.replace(/\D/g, '');
    const isPhoneAttempt = /^[0-9+\s()-]+$/.test(inputTrimmed) && digitsOnly.length > 0;
    if (isPhoneAttempt) {
      const normalizedDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly;
      if (normalizedDigits.length !== 10) {
        setErrorMsg('Mobile number must have actually 10 digits.');
        return;
      }
    }

    if (!patientPassword.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try server-side authentication API first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: inputTrimmed,
          password: patientPassword.trim(),
          role: 'PATIENT',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const target: PatientProfile = data.patient;

        // Persist session across refresh and re-open (1 year expiry)
        OfflineStore.saveAuthSession({
          role: 'PATIENT',
          patientId: target.id,
          userName: target.username || target.fullName,
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        });
        OfflineStore.savePatient(target);
        OfflineStore.setActivePatientId(target.id);

        VoiceService.speak(`Welcome back, ${target.preferredName || target.fullName}. Entering your space.`, lang);
        onLoginPatient(target);
        return;
      }

      // If server returned a 401 or 400 error, read error
      if (res.status === 401 || res.status === 400) {
        const err = await res.json();
        // Fallback to local offline check before failing
        const cleanDigits = inputTrimmed.replace(/\D/g, '');
        const inputLower = inputTrimmed.toLowerCase();
        const localPatients = OfflineStore.getPatients();

        const localTarget = localPatients.find((p) => {
          const pUsername = (p.username || '').trim().toLowerCase();
          const pPhoneDigits = (p.phone || '').trim().replace(/\D/g, '');
          const pFullName = p.fullName.trim().toLowerCase();
          return (
            (cleanDigits.length >= 10 && pPhoneDigits.endsWith(cleanDigits)) ||
            pUsername === inputLower ||
            pFullName === inputLower
          );
        });

        if (localTarget && (localTarget.password === patientPassword.trim() || localTarget.pin === patientPassword.trim())) {
          OfflineStore.saveAuthSession({
            role: 'PATIENT',
            patientId: localTarget.id,
            userName: localTarget.username || localTarget.fullName,
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
          });
          OfflineStore.setActivePatientId(localTarget.id);
          VoiceService.speak(`Welcome, ${localTarget.preferredName || localTarget.fullName}. Entering your space.`, lang);
          onLoginPatient(localTarget);
          return;
        }

        setErrorMsg(err.error || 'Invalid credentials. Please check your mobile number and password.');
        return;
      }

      throw new Error('Server unreachable');
    } catch (err: any) {
      // Offline fallback
      const cleanDigits = inputTrimmed.replace(/\D/g, '');
      const inputLower = inputTrimmed.toLowerCase();
      const allPatients = OfflineStore.getPatients();

      const target = allPatients.find((p) => {
        const pUsername = (p.username || '').trim().toLowerCase();
        const pPhoneDigits = (p.phone || '').trim().replace(/\D/g, '');
        const pFullName = p.fullName.trim().toLowerCase();
        return (
          (cleanDigits.length >= 7 && pPhoneDigits.endsWith(cleanDigits)) ||
          pUsername === inputLower ||
          pFullName === inputLower
        );
      });

      if (!target) {
        setErrorMsg('No account found with this mobile number or username. Please register.');
        return;
      }

      const validCredentials = [target.password, target.pin].filter(Boolean);
      if (!validCredentials.includes(patientPassword.trim())) {
        setErrorMsg('Incorrect password. Please try again or use "Forgot PIN?".');
        return;
      }

      OfflineStore.saveAuthSession({
        role: 'PATIENT',
        patientId: target.id,
        userName: target.username || target.fullName,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
      OfflineStore.setActivePatientId(target.id);
      VoiceService.speak(`Welcome ${target.preferredName || target.fullName}. Entering your space.`, lang);
      onLoginPatient(target);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Patient Registration (ALL FIELDS MANDATORY, FLOW: Register -> Login -> App)
  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullNameTrim = regFullName.trim();
    if (!fullNameTrim) {
      setErrorMsg('Full Name is mandatory. Please enter your name.');
      return;
    }

    const usernameTrim = regUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!usernameTrim || usernameTrim.length < 3) {
      setErrorMsg('Username is mandatory and must be at least 3 characters.');
      return;
    }

    const phoneTrim = regPhone.trim().replace(/\D/g, '');
    const normalizedPhone = phoneTrim.startsWith('91') && phoneTrim.length === 12 ? phoneTrim.slice(2) : phoneTrim;
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      setErrorMsg('Mobile number must have actually 10 digits. Please enter a valid 10-digit number.');
      return;
    }

    const ageNum = parseInt(regAge, 10);
    if (!regAge.trim() || isNaN(ageNum) || ageNum < 40 || ageNum > 120) {
      setErrorMsg('Please enter a valid age (between 40 and 120).');
      return;
    }

    if (!regState) {
      setErrorMsg('Please select your state/region.');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setErrorMsg('Password is mandatory and must be at least 4 characters long.');
      return;
    }

    if (regPassword.trim() !== regConfirmPassword.trim()) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const patientId = `patient-${Date.now()}`;
      const customPatientKey = regPatientKey.trim().toUpperCase() || `PT-${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanLinkedCaregiverKey = regPatientLinkedCaregiverKey.trim().toUpperCase();

      const newPatient: PatientProfile = {
        id: patientId,
        fullName: fullNameTrim,
        preferredName: regPreferredName.trim() || fullNameTrim.split(' ')[0],
        username: usernameTrim,
        patientKey: customPatientKey,
        age: ageNum,
        region: regState,
        state: regState as any,
        preferredLanguage: regPreferredLang,
        caregiverName: 'Family Caregiver',
        caregiverPhone: '',
        linkedCaregiverKey: cleanLinkedCaregiverKey,
        avatarUrl: regAvatar || '',
        dailyStreak: 0,
        todayCompletedCount: 0,
        password: regPassword.trim(),
        pin: regPassword.trim(),
        phone: phoneTrim,
        hasCaregiver: Boolean(cleanLinkedCaregiverKey),
      };

      // 1. Send registration to Server Database
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PATIENT',
          profile: newPatient,
          password: regPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed. Please check the details.');
        setIsSubmitting(false);
        return;
      }

      // Also save in local offline store
      OfflineStore.addPatient(newPatient);
      if (cleanLinkedCaregiverKey) {
        OfflineStore.linkPatientToCaregiverByKey(patientId, cleanLinkedCaregiverKey);
      }

      // FLOW REQUIREMENT: Register -> Login -> App
      // Do not auto-fill details
      setAuthMode('LOGIN');
      setPatientLoginInput('');
      setPatientPassword('');
      setRegPassword('');
      setRegConfirmPassword('');

      setSuccessMsg('Account registered successfully in database! Please enter your password to log in.');
      VoiceService.speak('Registration successful. Please enter your password to log in.', lang);
    } catch (err: any) {
      setErrorMsg('Network error while saving account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Caregiver Log In (Mobile Number or Username + Password)
  const handleCaregiverLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputTrimmed = caregiverLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your mobile number or username.');
      return;
    }

    // Check if input is a mobile number attempt (contains digits or is a phone number format)
    const digitsOnly = inputTrimmed.replace(/\D/g, '');
    const isPhoneAttempt = /^[0-9+\s()-]+$/.test(inputTrimmed) && digitsOnly.length > 0;
    if (isPhoneAttempt) {
      const normalizedDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly;
      if (normalizedDigits.length !== 10) {
        setErrorMsg('Mobile number must have actually 10 digits.');
        return;
      }
    }

    if (!caregiverPin.trim()) {
      setErrorMsg('Please enter your password or PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: inputTrimmed,
          password: caregiverPin.trim(),
          role: 'CAREGIVER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const target: CaretakerProfile = data.caretaker;
        const assignedPatient: PatientProfile | null = data.patient || null;

        OfflineStore.saveAuthSession({
          role: 'CAREGIVER',
          caretakerId: target.id,
          patientId: assignedPatient?.id || '',
          userName: target.username || target.fullName,
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        });
        OfflineStore.addCaretaker(target);
        OfflineStore.setActiveCaretakerId(target.id);

        onLoginCaregiver(target, assignedPatient);
        return;
      }

      const errData = await res.json();
      setErrorMsg(errData.error || 'Incorrect caregiver mobile number or password.');
    } catch (err) {
      // Offline fallback
      const inputLower = inputTrimmed.toLowerCase();
      const cleanDigits = inputTrimmed.replace(/\D/g, '');
      const allCaretakers = OfflineStore.getCaretakers();

      const target = allCaretakers.find((c) => {
        const cPhoneDigits = (c.phone || '').trim().replace(/\D/g, '');
        const cUsername = (c.username || '').trim().toLowerCase();
        const cFullName = c.fullName.trim().toLowerCase();
        return (
          (cleanDigits.length >= 7 && cPhoneDigits.endsWith(cleanDigits)) ||
          cUsername === inputLower ||
          cFullName === inputLower
        );
      });

      if (!target) {
        setErrorMsg('No caregiver account found with this mobile number or username.');
        return;
      }

      const validCredentials = [target.password, target.pin].filter(Boolean);
      if (!validCredentials.includes(caregiverPin.trim())) {
        setErrorMsg('Incorrect password or PIN.');
        return;
      }

      const allPatients = OfflineStore.getPatients();
      const assignedPatient =
        allPatients.find(
          (p) =>
            target.assignedPatientIds.includes(p.id) ||
            (p.linkedCaregiverKey &&
              target.caregiverKey &&
              p.linkedCaregiverKey.toUpperCase() === target.caregiverKey.toUpperCase())
        ) || null;

      OfflineStore.saveAuthSession({
        role: 'CAREGIVER',
        caretakerId: target.id,
        patientId: assignedPatient?.id || '',
        userName: target.username || target.fullName,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
      OfflineStore.setActiveCaretakerId(target.id);
      onLoginCaregiver(target, assignedPatient);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Caregiver Registration (ALL FIELDS MANDATORY, FLOW: Register -> Login -> App)
  const handleCaregiverRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameTrim = regCaregiverName.trim();
    if (!nameTrim) {
      setErrorMsg('Full Name is mandatory.');
      return;
    }

    const usernameTrim = regCaregiverUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!usernameTrim || usernameTrim.length < 3) {
      setErrorMsg('Username is mandatory and must be at least 3 characters.');
      return;
    }

    const phoneTrim = regCaregiverPhone.trim().replace(/\D/g, '');
    const normalizedPhone = phoneTrim.startsWith('91') && phoneTrim.length === 12 ? phoneTrim.slice(2) : phoneTrim;
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      setErrorMsg('Mobile number must have actually 10 digits. Please enter a valid 10-digit number.');
      return;
    }

    if (!regCaregiverRelation) {
      setErrorMsg('Please select your relationship.');
      return;
    }

    if (!regCaregiverPin.trim() || regCaregiverPin.trim().length < 4) {
      setErrorMsg('Password / PIN is mandatory and must be at least 4 characters.');
      return;
    }

    if (regCaregiverPin.trim() !== regCaregiverConfirmPin.trim()) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCaretakerId = `caretaker-${Date.now()}`;
      const chosenCaregiverKey = regCaregiverKey.trim().toUpperCase() || OfflineStore.generateCaregiverKey();

      const newCaretaker: CaretakerProfile = {
        id: newCaretakerId,
        fullName: nameTrim,
        username: usernameTrim,
        password: regCaregiverPin.trim(),
        pin: regCaregiverPin.trim(),
        caregiverKey: chosenCaregiverKey,
        relation: regCaregiverRelation.trim() || 'Primary Caregiver',
        phone: phoneTrim,
        email: regCaregiverEmail.trim(),
        assignedPatientIds: [],
      };

      // 1. Send registration to Server Database
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'CAREGIVER',
          profile: newCaretaker,
          password: regCaregiverPin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed. Please check the details.');
        setIsSubmitting(false);
        return;
      }

      // Save locally
      OfflineStore.addCaretaker(newCaretaker);

      // If caregiver provided an existing patient key to link, link immediately
      if (regCaregiverLinkPatientKey.trim()) {
        OfflineStore.linkCaregiverToPatientByKey(newCaretakerId, regCaregiverLinkPatientKey.trim().toUpperCase());
      }

      // FLOW REQUIREMENT: Register -> Login -> App
      // Do not auto-fill details
      setAuthMode('LOGIN');
      setCaregiverLoginInput('');
      setCaregiverPin('');
      setRegCaregiverPin('');
      setRegCaregiverConfirmPin('');

      setSuccessMsg('Caregiver account created successfully in database! Please enter your password to log in.');
      VoiceService.speak('Registration successful. Please enter your password to log in.', lang);
    } catch (err) {
      setErrorMsg('Failed to create caregiver account. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0D1117] text-stone-900 dark:text-[#E6EDF3] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-teal-800 dark:bg-teal-700 shadow-sm shrink-0 border border-teal-600/40">
            <svg viewBox="0 0 512 512" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
              <circle cx="256" cy="256" r="180" fill="#0f766e" opacity="0.4" />
              <g transform="translate(256, 260) scale(1.15)">
                <path d="M0,-110 C25,-60 30,-20 0,30 C-30,-20 -25,-60 0,-110 Z" fill="#fef3c7" />
                <path d="M-15,-30 C-75,-40 -110,10 -80,60 C-45,80 -10,65 0,30 C-5,5 -10,-15 -15,-30 Z" fill="#99f6e4" opacity="0.9" />
                <path d="M15,-30 C75,-40 110,10 80,60 C45,80 10,65 0,30 C5,5 10,-15 15,-30 Z" fill="#99f6e4" opacity="0.9" />
                <path d="M-90,50 C-60,110 60,110 90,50 C40,80 -40,80 -90,50 Z" fill="#f59e0b" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif-heading text-stone-900 dark:text-stone-100 tracking-tight">
              CognitiveSaathi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium mt-0.5">
              Cognitive Care & Memory Assistance • Persistent Database Login
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Pack & Audio Quality Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/80 transition"
            title="Download Voice Pack & Audio Tuning"
          >
            <Volume2 className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            <span className="hidden sm:inline">Voice Pack</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#161B22] text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition shadow-2xs cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>
          )}

          <LanguageDropdown currentLang={lang} onSelectLang={onLangChange} />
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="max-w-2xl w-full mx-auto py-6 sm:py-8 space-y-5 animate-fadeIn">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 rounded-2xl text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Space Selection (Patient Space vs Caregiver Space) */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block text-center">
            Select Your Role
          </span>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {/* 1. Patient Space */}
            <button
              type="button"
              id="select-patient-space-btn"
              onClick={() => {
                setSelectedSpace('PATIENT');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-2.5 shadow-xs relative cursor-pointer ${
                selectedSpace === 'PATIENT'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 dark:border-amber-400 ring-2 ring-amber-600/20'
                  : 'bg-white dark:bg-[#161B22] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shadow-xs border border-amber-200 dark:border-amber-800">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    Patient Space
                  </h3>
                  {selectedSpace === 'PATIENT' && <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                  Daily routines, exercises & voice saathi
                </p>
              </div>
            </button>

            {/* 2. Caregiver Space */}
            <button
              type="button"
              id="select-caregiver-space-btn"
              onClick={() => {
                setSelectedSpace('CAREGIVER');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-2.5 shadow-xs relative cursor-pointer ${
                selectedSpace === 'CAREGIVER'
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 dark:border-teal-400 ring-2 ring-teal-600/20'
                  : 'bg-white dark:bg-[#161B22] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-xs border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    Caregiver Space
                  </h3>
                  {selectedSpace === 'CAREGIVER' && <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                  Family schedules, alerts & monitoring
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Space Authentication Card */}
        <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-stone-200 dark:border-stone-800 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Header row: Space Name + Mode Switcher */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3.5">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {selectedSpace === 'PATIENT' ? 'Patient Space' : 'Caregiver Space'} • {authMode === 'LOGIN' ? 'Log In' : 'Register New Account'}
            </span>

            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'LOGIN'
                    ? 'bg-white dark:bg-[#121820] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'REGISTER'
                    ? 'bg-white dark:bg-[#121820] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* ================= PATIENT SPACE FLOW ================= */}
          {selectedSpace === 'PATIENT' && (
            <>
              {authMode === 'LOGIN' ? (
                /* Patient Login Form (Mobile Number & Password) */
                <form onSubmit={handlePatientLogin} className="space-y-4" autoComplete="off">
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="patient-login-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Mobile Number or Username <span className="text-rose-500">*</span>:
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-login-input"
                          name="login_patient_phone_no_autofill"
                          type="text"
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          required
                          value={patientLoginInput}
                          onChange={(e) => {
                            setPatientLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. 9435012345 or username"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="patient-password-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                          Password <span className="text-rose-500">*</span>:
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Forgot PIN?</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-password-input"
                          name="login_patient_pwd_no_autofill"
                          type={showPatientPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          data-lpignore="true"
                          data-form-type="other"
                          required
                          value={patientPassword}
                          onChange={(e) => {
                            setPatientPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPatientPassword(!showPatientPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showPatientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="enter-my-space-btn"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className="w-5 h-5 fill-amber-300 text-amber-300 shrink-0" />
                    )}
                    <span className="tracking-wide">
                      {isSubmitting ? 'Logging in to My Space...' : 'Log In to My Space'}
                    </span>
                    <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Need a new account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('REGISTER');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Patient Register Form (MANDATORY FIELDS, REGISTER -> LOGIN -> APP) */
                <form onSubmit={handlePatientRegister} className="space-y-4" autoComplete="off">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>All fields marked with <strong className="text-rose-600">*</strong> are mandatory. After registration, please log in with your number & password.</span>
                  </div>

                  <div className="space-y-3">
                    {/* Full Name & Username */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-fullname" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-fullname"
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Ramesh Sharma"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-username" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Unique Username <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-username"
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="e.g. ramesh70"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    {/* Mobile Number & Age */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9435012345"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-age" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Age <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-age"
                          type="number"
                          required
                          min={40}
                          max={120}
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          placeholder="70"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    {/* State & Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-state" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          State / Region <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="reg-state"
                          required
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        >
                          {NER_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="reg-language" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Preferred Language <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="reg-language"
                          required
                          value={regPreferredLang}
                          onChange={(e) => setRegPreferredLang(e.target.value as LanguageCode)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        >
                          <option value="en">English</option>
                          <option value="as">অসমীয়া (Assamese)</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="mni">মৈতৈলোন্ (Manipuri)</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-pass" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Create Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="reg-pass"
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={4}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min 4 characters"
                            className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-confirm-pass" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="reg-confirm-pass"
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={4}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Patient Key Setting */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="reg-patient-key" className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>Set Your Patient Key (Personal or Auto)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setRegPatientKey(`PT-${Math.floor(100000 + Math.random() * 900000)}`)}
                          className="text-[11px] text-amber-800 dark:text-amber-300 font-bold underline cursor-pointer"
                        >
                          🎲 Randomize
                        </button>
                      </div>
                      <input
                        id="reg-patient-key"
                        type="text"
                        value={regPatientKey}
                        onChange={(e) => setRegPatientKey(e.target.value.toUpperCase())}
                        placeholder="e.g. PT-DAD72, AMMA-CARE (leave blank to auto-generate)"
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold tracking-wider text-amber-950 dark:text-amber-100 uppercase bg-white dark:bg-[#121820]"
                      />
                    </div>

                    {/* Connect with Caregiver Key (Optional) */}
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-1">
                      <label htmlFor="reg-patient-cg-key" className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                        Link Caregiver with Caregiver Key (Optional)
                      </label>
                      <input
                        id="reg-patient-cg-key"
                        type="text"
                        value={regPatientLinkedCaregiverKey}
                        onChange={(e) => setRegPatientLinkedCaregiverKey(e.target.value.toUpperCase())}
                        placeholder="e.g. CG-CARE88 (if caregiver gave you their key)"
                        className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 text-xs font-mono font-bold tracking-wider text-teal-950 dark:text-teal-100 uppercase bg-white dark:bg-[#121820]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="register-patient-btn"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                    )}
                    <span className="tracking-wide">
                      {isSubmitting ? 'Saving to Database...' : 'Register Account (Step 1)'}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('LOGIN');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ================= CAREGIVER SPACE FLOW ================= */}
          {selectedSpace === 'CAREGIVER' && (
            <>
              {authMode === 'LOGIN' ? (
                /* Caregiver Login Form (Mobile Number & Password) */
                <form onSubmit={handleCaregiverLogin} className="space-y-4" autoComplete="off">
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="caregiver-login-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Caregiver Mobile Number or Username <span className="text-rose-500">*</span>:
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="caregiver-login-input"
                          name="login_caregiver_phone_no_autofill"
                          type="text"
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          required
                          value={caregiverLoginInput}
                          onChange={(e) => {
                            setCaregiverLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. 9435012345 or username"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="caregiver-pin-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Caregiver Password <span className="text-rose-500">*</span>:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="caregiver-pin-input"
                          name="login_caregiver_pwd_no_autofill"
                          type={showCaregiverPin ? 'text' : 'password'}
                          autoComplete="new-password"
                          data-lpignore="true"
                          data-form-type="other"
                          required
                          value={caregiverPin}
                          onChange={(e) => {
                            setCaregiverPin(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your caregiver password"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCaregiverPin(!showCaregiverPin)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          {showCaregiverPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Caregiver Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="enter-caregiver-space-btn"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
                    )}
                    <span className="tracking-wide">
                      {isSubmitting ? 'Authenticating Caregiver...' : 'Log In to Caregiver Space'}
                    </span>
                    <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Need a caregiver account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('REGISTER');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Caregiver Register Form (MANDATORY FIELDS, REGISTER -> LOGIN -> APP) */
                <form onSubmit={handleCaregiverRegister} className="space-y-4" autoComplete="off">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>All fields marked with <strong className="text-rose-600">*</strong> are mandatory. After registration, please log in with your number & password.</span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-cg-name" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Caregiver Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-cg-name"
                          type="text"
                          required
                          value={regCaregiverName}
                          onChange={(e) => setRegCaregiverName(e.target.value)}
                          placeholder="e.g. Debashree Gogoi"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-cg-user" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Unique Username <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-cg-user"
                          type="text"
                          required
                          value={regCaregiverUsername}
                          onChange={(e) => setRegCaregiverUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="e.g. debashree"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-cg-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="reg-cg-phone"
                          type="tel"
                          required
                          maxLength={10}
                          value={regCaregiverPhone}
                          onChange={(e) => setRegCaregiverPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9435012345"
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-cg-rel" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Relationship to Patient <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="reg-cg-rel"
                          required
                          value={regCaregiverRelation}
                          onChange={(e) => setRegCaregiverRelation(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-stone-50/50 dark:bg-[#121820]"
                        >
                          <option value="Daughter">Daughter</option>
                          <option value="Son">Son</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Grandchild">Grandchild</option>
                          <option value="Nurse / Attendant">Nurse / Attendant</option>
                          <option value="Family Caregiver">Family Caregiver</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-cg-pin" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Create Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="reg-cg-pin"
                            type="password"
                            required
                            minLength={4}
                            value={regCaregiverPin}
                            onChange={(e) => setRegCaregiverPin(e.target.value)}
                            placeholder="Min 4 characters"
                            className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-cg-confirm-pin" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="reg-cg-confirm-pin"
                            type="password"
                            required
                            minLength={4}
                            value={regCaregiverConfirmPin}
                            onChange={(e) => setRegCaregiverConfirmPin(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-[#121820]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Caregiver Set Own Key */}
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="reg-cg-key" className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                          <span>Set Your Caregiver Key (Personal or Auto)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setRegCaregiverKey(`CG-${Math.floor(100000 + Math.random() * 900000)}`)}
                          className="text-[11px] text-teal-800 dark:text-teal-300 font-bold underline cursor-pointer"
                        >
                          🎲 Randomize
                        </button>
                      </div>
                      <input
                        id="reg-cg-key"
                        type="text"
                        value={regCaregiverKey}
                        onChange={(e) => setRegCaregiverKey(e.target.value.toUpperCase())}
                        placeholder="e.g. CG-CARE88, PRIYA-CARE (leave blank to auto-generate)"
                        className="w-full px-3.5 py-2 rounded-xl border border-teal-300 dark:border-teal-700 text-xs font-mono font-bold tracking-wider text-teal-950 dark:text-teal-100 uppercase bg-white dark:bg-[#121820]"
                      />
                    </div>

                    {/* Optional Link Patient */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                      <label htmlFor="reg-cg-patient-key" className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                        Link Existing Patient by Patient Key (Optional)
                      </label>
                      <input
                        id="reg-cg-patient-key"
                        type="text"
                        value={regCaregiverLinkPatientKey}
                        onChange={(e) => setRegCaregiverLinkPatientKey(e.target.value.toUpperCase())}
                        placeholder="e.g. PT-123456 (if patient has a key)"
                        className="w-full px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold tracking-wider text-amber-950 dark:text-amber-100 uppercase bg-white dark:bg-[#121820]"
                      />
                    </div>
                  </div>

                  {/* Caregiver Register Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="register-caregiver-btn"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
                    )}
                    <span className="tracking-wide">
                      {isSubmitting ? 'Saving to Database...' : 'Register Caregiver Account (Step 1)'}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('LOGIN');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Forgot PIN / Password Modal */}
      <ForgotPinModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        lang={lang}
        onSuccess={(msg) => setSuccessMsg(msg)}
      />

      {/* Voice Pack & Clarity Modal */}
      <VoicePackModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-3 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        CognitiveSaathi • Memory Care, Daily Routines & Secure Database Access
      </footer>
    </div>
  );
};
