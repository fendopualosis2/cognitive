import { LanguageCode } from '../types';

export interface Translations {
  appName: string;
  appTagline: string;
  taglineSub: string;
  // Roles
  rolePatient: string;
  roleCaregiver: string;
  roleHealthcare: string;
  switchRole: string;

  // Navigation
  navHome: string;
  navActivities: string;
  navMyDay: string;
  navMemories: string;
  navSettings: string;
  navMe: string;
  navDashboard: string;
  navPatients: string;
  navReminders: string;
  navReports: string;

  // Connectivity
  statusConnected: string;
  statusSyncing: string;
  statusOffline: string;
  statusSynced: string;
  offlineNotice: string;
  syncNow: string;

  // Voice
  voiceButtonTitle: string;
  voiceListening: string;
  voiceProcessing: string;
  voiceResponding: string;
  voiceIdle: string;
  voiceHelpTitle: string;
  voiceQuickRoutine: string;
  voiceQuickReminders: string;
  voiceQuickHelp: string;

  // Greetings & Home
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  todaysFocus: string;
  startActivity: string;
  completedToday: string;
  activitiesCount: string;
  viewRoutine: string;
  whoAmI: string;
  everythingOkay: string;
  everythingOkaySub: string;

  // Activities
  activitiesTitle: string;
  activitiesSubtitle: string;
  estimatedTime: string;
  minutesUnit: string;
  difficultyLevel: string;
  culturalNote: string;
  playNow: string;
  instructions: string;
  continueGame: string;
  calmSuccess: string;
  calmEncouragement: string;
  nextActivityPrompt: string;
  backToActivities: string;

  // My Day
  myDayTitle: string;
  myDaySubtitle: string;
  morningRoutine: string;
  afternoonRoutine: string;
  eveningRoutine: string;
  markDone: string;
  completed: string;
  pending: string;

  // Reminders
  remindersTitle: string;
  remindersSubtitle: string;
  takeMedicine: string;
  drinkWater: string;
  activityTime: string;
  markTaken: string;

  // Memories
  memoriesTitle: string;
  memoriesSubtitle: string;
  listenStory: string;
  whoIsThisPrompt: string;

  // Accessibility & Settings
  accessibilityTitle: string;
  textSizeTitle: string;
  textNormal: string;
  textLarge: string;
  textExtraLarge: string;
  highContrast: string;
  voiceAssistance: string;
  languageSelect: string;

  // Caregiver
  caregiverDashboardTitle: string;
  caregiverOverviewSubtitle: string;
  patientProfileSummary: string;
  weeklyAdherence: string;
  recentSessions: string;
  attentionAlerts: string;
  observationNotes: string;
  addReminder: string;
  clinicalNotice: string;

  // Games & Activities
  categoryLabel: string;
  elderlyFriendlyTip: string;
  gameFindMatchingTitle: string;
  gameFindMatchingDesc: string;
  gameFindMatchingTag: string;
  gameFindMatchingCategory: string;
  gameAttentionTitle: string;
  gameAttentionDesc: string;
  gameAttentionTag: string;
  gameAttentionCategory: string;
  gamePatternTitle: string;
  gamePatternDesc: string;
  gamePatternTag: string;
  gamePatternCategory: string;
  gameRoutineTitle: string;
  gameRoutineDesc: string;
  gameRoutineTag: string;
  gameRoutineCategory: string;
  gameObjectTitle: string;
  gameObjectDesc: string;
  gameObjectTag: string;
  gameObjectCategory: string;

  // Audio-First Instructions
  instructionFindCup: string;
  instructionTryAgain: string;
  instructionWellDone: string;
  instructionMedicineTime: string;
  instructionContinue: string;
  listenAudio: string;
  replayAudio: string;
  navLanguagePacks: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: 'CognitiveSaathi',
    appTagline: 'Gentle Cognitive & Memory Companion',
    taglineSub: 'Supporting independence, dignity, and daily routine across North-Eastern India',
    rolePatient: 'Patient Experience',
    roleCaregiver: 'Caregiver Portal',
    roleHealthcare: 'Health Worker View',
    switchRole: 'Switch View',

    navHome: 'Home',
    navActivities: 'Memory Workout',
    navMyDay: 'My Day',
    navMemories: 'Memories',
    navSettings: 'Preferences',
    navMe: 'Me',
    navDashboard: 'Overview',
    navPatients: 'Patients',
    navReminders: 'Reminders',
    navReports: 'Weekly Summary',

    statusConnected: 'Connected',
    statusSyncing: 'Saving Progress...',
    statusOffline: 'Offline Mode (Saved Locally)',
    statusSynced: 'All Saved',
    offlineNotice: 'You are currently offline. Your activities and routine are saved safely on this device and will sync automatically when connected.',
    syncNow: 'Sync Progress',

    voiceButtonTitle: 'Voice Companion',
    voiceListening: 'Listening to you calmly...',
    voiceProcessing: 'Understanding your voice...',
    voiceResponding: 'Saathi is speaking...',
    voiceIdle: 'Tap to speak with Saathi',
    voiceHelpTitle: 'How can I assist you right now?',
    voiceQuickRoutine: 'What is my plan for today?',
    voiceQuickReminders: 'Do I have medicine to take?',
    voiceQuickHelp: 'Help me start a gentle memory game',

    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    todaysFocus: "Today's Gentle Activity",
    startActivity: 'Start Activity',
    completedToday: 'Completed Today',
    activitiesCount: 'activities ready for you',
    viewRoutine: "View Today's Routine",
    whoAmI: 'You are in a safe, familiar place with your family companion.',
    everythingOkay: 'Everything is peaceful and well.',
    everythingOkaySub: 'Your caregiver is nearby and your daily routine is on track.',

    activitiesTitle: 'Cognitive & Memory Activities',
    activitiesSubtitle: 'Comfortable, non-stressful exercises designed for memory, recognition, and daily ease.',
    estimatedTime: 'Takes about',
    minutesUnit: 'minutes',
    difficultyLevel: 'Gentle Level',
    culturalNote: 'Familiar cultural theme',
    playNow: 'Begin Exercise',
    instructions: 'Simple Guide',
    continueGame: 'Continue',
    calmSuccess: 'Well done! You did wonderfully.',
    calmEncouragement: 'Thank you for taking this gentle time for your mind.',
    nextActivityPrompt: 'Would you like to try another peaceful activity?',
    backToActivities: 'Return to Activities',

    myDayTitle: 'My Day & Routine',
    myDaySubtitle: 'A clear, step-by-step timeline of your day in gentle chronological order.',
    morningRoutine: 'Morning Time',
    afternoonRoutine: 'Afternoon Time',
    eveningRoutine: 'Evening Time',
    markDone: 'I have done this',
    completed: 'Done',
    pending: 'To do',

    remindersTitle: 'Supportive Reminders',
    remindersSubtitle: 'Helpful reminders to keep your health, hydration, and habits steady.',
    takeMedicine: 'Prescribed Medicine',
    drinkWater: 'Warm Glass of Water',
    activityTime: 'Memory Activity Time',
    markTaken: 'Mark as Taken',

    memoriesTitle: 'Family & Heritage Memories',
    memoriesSubtitle: 'Familiar scenes, traditional keepsakes, and warm family moments.',
    listenStory: 'Listen to Story',
    whoIsThisPrompt: 'A gentle reflection on this moment',

    accessibilityTitle: 'Display & Comfort Settings',
    textSizeTitle: 'Reading Text Size',
    textNormal: 'Comfortable',
    textLarge: 'Larger',
    textExtraLarge: 'Largest & Clearest',
    highContrast: 'Higher Contrast Mode',
    voiceAssistance: 'Gentle Voice Guidance',
    languageSelect: 'Preferred Language',

    caregiverDashboardTitle: 'Caregiver Care Circle',
    caregiverOverviewSubtitle: 'Activity consistency, reminder adherence, and peaceful engagement monitoring.',
    patientProfileSummary: 'Monitored Family Member',
    weeklyAdherence: 'Routine & Activity Adherence',
    recentSessions: 'Recent Cognitive Sessions',
    attentionAlerts: 'Observed Patterns & Notices',
    observationNotes: 'Caregiver Observations',
    addReminder: 'Schedule Reminder',
    clinicalNotice: 'Non-diagnostic notice: CognitiveSaathi indicators track cognitive activity adherence and comfort patterns. They do not constitute a clinical diagnosis or treatment prescription.',

    categoryLabel: 'Category',
    elderlyFriendlyTip: 'Gentle, pressure-free exercise designed for familiar cognitive engagement.',
    gameFindMatchingTitle: 'Gentle Pattern & Motif Recall',
    gameFindMatchingDesc: 'Recognize matching traditional weaving and heritage patterns.',
    gameFindMatchingTag: 'Heritage & Textiles',
    gameFindMatchingCategory: 'Pattern Recognition',
    gameAttentionTitle: 'Calm Tea Garden Observation',
    gameAttentionDesc: 'Notice gentle details and familiar nature elements without time limits.',
    gameAttentionTag: 'Daily Life & Nature',
    gameAttentionCategory: 'Sustained Attention',
    gamePatternTitle: 'Traditional Rhythm Sequence',
    gamePatternDesc: 'Follow simple sequences inspired by traditional musical beats and patterns.',
    gamePatternTag: 'Folk Rhythms & Sound',
    gamePatternCategory: 'Sequential Memory',
    gameRoutineTitle: 'Familiar Morning Steps',
    gameRoutineDesc: 'Gently order daily habits like tea time, bathing, and medicine.',
    gameRoutineTag: 'Daily Independence',
    gameRoutineCategory: 'Executive Function',
    gameObjectTitle: 'Everyday Household Objects',
    gameObjectDesc: 'Connect names and uses for traditional utensils, prayer items, and tools.',
    gameObjectTag: 'Familiar Living',
    gameObjectCategory: 'Semantic Memory',

    instructionFindCup: 'Find the matching cup.',
    instructionTryAgain: "Let's try again.",
    instructionWellDone: 'Well done.',
    instructionMedicineTime: 'Time for your medicine.',
    instructionContinue: 'Would you like to continue?',
    listenAudio: 'Listen',
    replayAudio: 'Replay',
    navLanguagePacks: 'Language & Voice',
  },

  as: {
    appName: 'কগনিটিভসাথী',
    appTagline: 'বয়োজ্যেষ্ঠসকলৰ বাবে স্মৃতি আৰু চিন্তাৰ শান্ত সংগী',
    taglineSub: 'উত্তৰ-পূৰ্বাঞ্চলৰ পৰিয়ালসমূহৰ বাবে আত্মনিৰ্ভৰশীলতা আৰু মৰ্যাদা',
    rolePatient: 'অংশগ্ৰহণকাৰী অভিজ্ঞতা',
    roleCaregiver: 'যত্নকাৰী (কেয়াৰগিভাৰ) পৰ্টেল',
    roleHealthcare: 'স্বাস্থ্য কৰ্মীৰ তথ্য',
    switchRole: 'অভিজ্ঞতা সলনি কৰক',

    navHome: 'মুখ্য পৃষ্ঠা',
    navActivities: 'স্মৃতিৰ ব্যায়াম (Memory Workout)',
    navMyDay: 'আজিৰ দিনটো',
    navMemories: 'সোণালী স্মৃতি',
    navSettings: 'পছন্দসমূহ',
    navMe: 'মই (Me)',
    navDashboard: 'অৱলোকন',
    navPatients: 'পৰিয়ালৰ সদস্য',
    navReminders: 'সোঁৱৰণী',
    navReports: 'সাপ্তাহিক সাৰাংশ',

    statusConnected: 'সংযোগ সক্ৰিয়',
    statusSyncing: 'সংৰক্ষণ হৈ আছে...',
    statusOffline: 'অফলাইন মোড (সুৰক্ষিতভাৱে সংৰক্ষিত)',
    statusSynced: 'সকলো সংৰক্ষিত',
    offlineNotice: 'ইণ্টাৰনেট নাথাকিলেও চিন্তা নাই। আপোনাৰ সকলো কাৰ্য্য এই যন্ত্ৰত সংৰক্ষিত হৈছে আৰু সংযোগ পোৱাৰ লগে লগে সংলগ্ন হ’ব।',
    syncNow: 'সমল সংলগ্ন কৰক',

    voiceButtonTitle: 'মাতৰ সহায়িকা (Voice)',
    voiceListening: 'আপোনাৰ মাত শুনি আছোঁ...',
    voiceProcessing: 'বুজিবলৈ চেষ্টা কৰি আছোঁ...',
    voiceResponding: 'সাথীয়ে উত্তৰ দিছে...',
    voiceIdle: 'সাথীৰ সৈতে কথা পাতিবলৈ স্পৰ্শ কৰক',
    voiceHelpTitle: 'মই আপোনাক কিদৰে সহায় কৰিব পাৰোঁ?',
    voiceQuickRoutine: 'আজি মোৰ কি কি কাম আছে?',
    voiceQuickReminders: 'মোৰ ঔষধ খোৱাৰ সময় হৈছে নেকি?',
    voiceQuickHelp: 'এটা সহজ স্মৃতিৰ খেল আৰম্ভ কৰক',

    greetingMorning: 'শুভ প্ৰভাত',
    greetingAfternoon: 'শুভ অপৰাহ্ণ',
    greetingEvening: 'শুভ গধূলি',
    todaysFocus: 'আজিৰ বিশেষ কাৰ্য্যসূচী',
    startActivity: 'খেল আৰম্ভ কৰক',
    completedToday: 'আজি সম্পূৰ্ণ কৰা হৈছে',
    activitiesCount: 'টা সহজ খেল সাজু হৈছে',
    viewRoutine: 'আজিৰ সময়সূচী চাওক',
    whoAmI: 'আপুনি আপোনাৰ আত্মীয়ৰ মাজত সম্পূৰ্ণ সুৰক্ষিত হৈ আছে।',
    everythingOkay: 'সকলো শান্ত আৰু সুন্দৰ হৈ আছে।',
    everythingOkaySub: 'আপোনাৰ যত্ন লওঁতা ওচৰতে আছে আৰু দিনৰ সকলো কাম সঠিকভাৱে চলিছে।',

    activitiesTitle: 'স্মৃতি আৰু মননশীল খেল',
    activitiesSubtitle: 'কোনো মানসিক চাপ নোহোৱাকৈ সহজ আৰু চিনাকি স্মৃতিৰ কাৰ্য্যসূচী।',
    estimatedTime: 'প্ৰায় সময় লাগিব',
    minutesUnit: 'মিনিট',
    difficultyLevel: 'সহজ মাত্ৰা',
    culturalNote: 'চিনাকি অসমীয়া ঐতিহ্য',
    playNow: 'খেলিবলৈ লওক',
    instructions: 'সহজ নিৰ্দেশনা',
    continueGame: 'আগবাঢ়ক',
    calmSuccess: 'বৰ ধুনীয়া হ’ল! আপুনি বহুত ভাল কৰিলে।',
    calmEncouragement: 'মনৰ বাবে এনেকুৱা শান্ত সময় দিয়াৰ বাবে ধন্যবাদ।',
    nextActivityPrompt: 'আৰু এটা শান্ত খেল খেলিব বিচাৰেনে?',
    backToActivities: 'খেলৰ তালিকালৈ উভতি যাওক',

    myDayTitle: 'আজিৰ দিনটো আৰু নিয়ম',
    myDaySubtitle: 'ৰাতিপুৱাৰ পৰা সন্ধিয়ালৈকে স্পষ্ট আৰু সহজ ক্ৰম।',
    morningRoutine: 'ৰাতিপুৱাৰ সময়',
    afternoonRoutine: 'দুপৰীয়াৰ সময়',
    eveningRoutine: 'গধূলিৰ সময়',
    markDone: 'মই কৰিলোঁ',
    completed: 'সম্পূৰ্ণ হ’ল',
    pending: 'বাকী আছে',

    remindersTitle: 'হিতৈষী সোঁৱৰণী',
    remindersSubtitle: 'ঔষধ, পানী আৰু অভ্যাসৰ সহজ সোঁৱৰণী।',
    takeMedicine: 'নিৰ্ধাৰিত ঔষধ',
    drinkWater: 'এক গিলাচ বিশুদ্ধ পানী',
    activityTime: 'মনৰ খেলৰ সময়',
    markTaken: 'খালে বুলি টিক মাৰক',

    memoriesTitle: 'সংস্কৃতি আৰু পুৰণি স্মৃতি',
    memoriesSubtitle: 'জাপি, গামোচা, শৰাই আৰু ঘৰুৱা চিনাকি দৃশ্য।',
    listenStory: 'সাধু / বিৱৰণ শুনক',
    whoIsThisPrompt: 'এই চিনাকি স্মৃতিটো মনত পেলাওক',

    accessibilityTitle: 'পঢ়াৰ সুবিধা আৰু চেটিংছ',
    textSizeTitle: 'আখৰৰ আকাৰ',
    textNormal: 'সাধাৰণ',
    textLarge: 'ডাঙৰ',
    textExtraLarge: 'অতি ডাঙৰ আৰু স্পষ্ট',
    highContrast: 'স্পষ্ট বৈপৰীত্য (High Contrast)',
    voiceAssistance: 'মাতৰ নিৰ্দেশনা',
    languageSelect: 'পছন্দৰ ভাষা',

    caregiverDashboardTitle: 'যত্নকাৰীৰ ডেচবৰ্ড',
    caregiverOverviewSubtitle: 'নিয়ম পালন, কাৰ্য্যসূচীৰ স্থিতি আৰু আৰামদায়ক অংশগ্ৰহণৰ বুজ লোৱা ব্যৱস্থা।',
    patientProfileSummary: 'তত্ত্বাৱধানত থকা সদস্য',
    weeklyAdherence: 'নিয়ম পালনৰ হাৰ',
    recentSessions: 'শেহতীয়া খেলৰ বিৱৰণ',
    attentionAlerts: 'লক্ষ্য কৰা সংকেত আৰু সূচক',
    observationNotes: 'যত্নকাৰীৰ টোকা',
    addReminder: 'নতুন সোঁৱৰণী যোগ কৰক',
    clinicalNotice: 'সতৰ্কতা: কগনিটিভসাথীৰ সূচকসমূহ কেৱল দৈনন্দিন মননশীল অংশগ্ৰহণ জুখিবৰ বাবে। ই কোনো ডাক্তৰী নিদান বা ঔষধৰ বিকল্প নহয়।',

    categoryLabel: 'বিভাগ',
    elderlyFriendlyTip: 'মানসিক চাপহীন, চিনাকি আৰু আৰামদায়ক স্মৃতিৰ অনুশীলন।',
    gameFindMatchingTitle: 'চিনাকি ফুল আৰু বস্ত্ৰ চিনেকি খেল',
    gameFindMatchingDesc: 'অসমৰ তাঁতশাল আৰু পৰম্পৰাগত ফুল-জালৰ চিনাকি ৰূপ মিলাওক।',
    gameFindMatchingTag: 'ঐতিহ্য আৰু শিপিনীৰ চিনাকি',
    gameFindMatchingCategory: 'ৰূপ চিনাৰ ক্ষমতা',
    gameAttentionTitle: 'চাহ বাগিচাৰ শান্ত নিৰীক্ষণ',
    gameAttentionDesc: 'প্ৰকৃতি আৰু ঘৰুৱা পৰিৱেশৰ চিনাকি বস্তুৰ ওপৰত শান্তভাৱে দৃষ্টি দিয়ক।',
    gameAttentionTag: 'প্ৰকৃতি আৰু চিনাকি জীৱন',
    gameAttentionCategory: 'মনোযোগ আৰু একাগ্ৰতা',
    gamePatternTitle: 'ঐতিহ্যবাহী সুৰ আৰু ছন্দৰ ক্ৰম',
    gamePatternDesc: 'ঢোল, পেঁপা আৰু পৰম্পৰাগত তালৰ সহজ আৰু চিনাকি ক্ৰম অনুসৰণ কৰক।',
    gamePatternTag: 'লোক সংস্কৃতি আৰু সুৰ',
    gamePatternCategory: 'ক্ৰম স্মৃতি',
    gameRoutineTitle: 'ৰাতিপুৱাৰ চিনাকি নিয়ম',
    gameRoutineDesc: 'চাহ খোৱা, গা-ধোৱা আৰু ঔষধ খোৱাৰ দৰে সহজ নিয়মবোৰ সঠিক ক্ৰমত সজাওক।',
    gameRoutineTag: 'দৈনন্দিন অভ্যাস',
    gameRoutineCategory: 'দৈনিক পৰিচালনা',
    gameObjectTitle: 'ঘৰুৱা চিনাকি সামগ্ৰী',
    gameObjectDesc: 'শৰাই, জাপি, ঘটি আদি পুৰণি চিনাকি সামগ্ৰীৰ নাম আৰু ব্যৱহাৰ মনত পেলাওক।',
    gameObjectTag: 'ঘৰুৱা চিনাকি জীৱন',
    gameObjectCategory: 'শব্দ আৰু বস্তুৰ স্মৃতি',

    instructionFindCup: 'মিলা কাপটো বিচাৰি উলিয়াওক।',
    instructionTryAgain: 'আহক, আৰু এবাৰ চেষ্টা কৰোঁ।',
    instructionWellDone: 'বৰ সুন্দৰ হৈছে।',
    instructionMedicineTime: 'আপোনাৰ ঔষধ খোৱাৰ সময় হৈছে।',
    instructionContinue: 'আপুনি আৰু আগবাঢ়িব বিচাৰেনে?',
    listenAudio: 'শুনক',
    replayAudio: 'পুনৰ শুনক',
    navLanguagePacks: 'ভাষা আৰু মাতৰ নিয়ন্ত্ৰণ',
  },

  hi: {
    appName: 'कॉग्निटिवसाथी',
    appTagline: 'वरिष्ठ जनों के लिए शांत स्मृति व संज्ञानात्मक साथी',
    taglineSub: 'पूर्वोत्तर भारत में गरिमा, स्वतंत्रता और दैनिक दिनचर्या का सहयोग',
    rolePatient: 'मरीज / वरिष्ठ जन अनुभव',
    roleCaregiver: 'देखभालकर्ता (केयरगिवर) पोर्टल',
    roleHealthcare: 'स्वास्थ्य कार्यकर्ता दृश्य',
    switchRole: 'दृश्य बदलें',

    navHome: 'होम',
    navActivities: 'मेमोरी वर्कआउट',
    navMyDay: 'मेरी दिनचर्या',
    navMemories: 'स्मृतियां',
    navSettings: 'सुविधाएं',
    navMe: 'मैं (Me)',
    navDashboard: 'डैशबोर्ड',
    navPatients: 'मरीज',
    navReminders: 'स्मरण',
    navReports: 'साप्ताहिक रिपोर्ट',

    statusConnected: 'सक्रिय जुड़ाव',
    statusSyncing: 'सहेजा जा रहा है...',
    statusOffline: 'ऑफ़लाइन मोड (सुरक्षित सहेजा गया)',
    statusSynced: 'सब सुरक्षित सहेजा गया',
    offlineNotice: 'आप ऑफ़लाइन हैं। आपकी गतिविधियां व दिनचर्या सुरक्षित हैं और इंटरनेट मिलने पर अपने आप सहेज ली जाएंगी।',
    syncNow: 'डेटा सिंक करें',

    voiceButtonTitle: 'आवाज साथी (Voice)',
    voiceListening: 'आपकी आवाज सुन रहे हैं...',
    voiceProcessing: 'समझ रहे हैं...',
    voiceResponding: 'साथी बोल रहा है...',
    voiceIdle: 'साथी से बात करने के लिए स्पर्श करें',
    voiceHelpTitle: 'मैं आपकी किस प्रकार मदद कर सकता हूँ?',
    voiceQuickRoutine: 'आज का मेरा क्या कार्यक्रम है?',
    voiceQuickReminders: 'क्या मेरी दवाई का समय हो गया?',
    voiceQuickHelp: 'एक आसान स्मृति खेल शुरू करें',

    greetingMorning: 'शुभ प्रभात',
    greetingAfternoon: 'शुभ दोपहर',
    greetingEvening: 'शुभ संध्या',
    todaysFocus: 'आज की विशेष गतिविधि',
    startActivity: 'गतिविधि शुरू करें',
    completedToday: 'आज पूर्ण की गई',
    activitiesCount: 'गतिविधियां आपके लिए तैयार हैं',
    viewRoutine: 'आज की दिनचर्या देखें',
    whoAmI: 'आप अपने स्नेही जनों के साथ एक सुरक्षित परिवेश में हैं।',
    everythingOkay: 'सब कुछ शांत और कुशल मंगल है।',
    everythingOkaySub: 'आपके देखभालकर्ता निकट हैं और दिनचर्या सुचारू रूप से चल रही है।',

    activitiesTitle: 'स्मृति व संज्ञान गतिविधियां',
    activitiesSubtitle: 'तनावमुक्त, सहज और परिचित व्यायाम जो स्मृति और एकाग्रता को सहयोग देते हैं।',
    estimatedTime: 'समय लगेगा',
    minutesUnit: 'मिनट',
    difficultyLevel: 'सहज स्तर',
    culturalNote: 'पारंपरिक व परिचित परिवेश',
    playNow: 'शुरू करें',
    instructions: 'सरल निर्देश',
    continueGame: 'आगे बढ़ें',
    calmSuccess: 'बहुत खूब! आपने बहुत अच्छा किया।',
    calmEncouragement: 'अपने मन के लिए यह शांत समय निकालने हेतु धन्यवाद।',
    nextActivityPrompt: 'क्या आप एक और शांतिपूर्ण अभ्यास करना चाहेंगे?',
    backToActivities: 'गतिविधि सूची पर लौटें',

    myDayTitle: 'मेरी दिनचर्या व नियम',
    myDaySubtitle: 'सुबह से शाम तक का स्पष्ट, क्रमिक और सुलभ विवरण।',
    morningRoutine: 'सुबह का समय',
    afternoonRoutine: 'दोपहर का समय',
    eveningRoutine: 'शाम का समय',
    markDone: 'मैंने कर लिया',
    completed: 'पूर्ण',
    pending: 'बाकी',

    remindersTitle: 'सहायक स्मरण',
    remindersSubtitle: 'दवाइयों, जलपान और स्वास्थ्यप्रद आदतों के लिए सहज स्मरण।',
    takeMedicine: 'नियमित दवाई',
    drinkWater: 'एक गिलास पानी',
    activityTime: 'स्मृति अभ्यास का समय',
    markTaken: 'ले ली गई',

    memoriesTitle: 'संस्कृति व पारिवारिक स्मृतियां',
    memoriesSubtitle: 'सुंदर यादें, पारंपरिक वस्तुएं और पारिवारिक क्षण।',
    listenStory: 'कहानी सुनें',
    whoIsThisPrompt: 'इस परिचित क्षण को याद करें',

    accessibilityTitle: 'पाठ व प्रदर्शन सेटिंग्स',
    textSizeTitle: 'अक्षर आकार (Text Size)',
    textNormal: 'सामान्य',
    textLarge: 'बड़ा',
    textExtraLarge: 'सबसे बड़ा व स्पष्ट',
    highContrast: 'उच्च कंट्रास्ट मोड',
    voiceAssistance: 'ध्वनि सहायता',
    languageSelect: 'पसंदीदा भाषा',

    caregiverDashboardTitle: 'देखभालकर्ता डैशबोर्ड',
    caregiverOverviewSubtitle: 'गतिविधि निरंतरता, स्मरण नियम और सुखद सहभागिता पर नजर रखें।',
    patientProfileSummary: 'निरीक्षित परिवार जन',
    weeklyAdherence: 'दिनचर्या नियम पालन',
    recentSessions: 'हालिया संज्ञानात्मक सत्र',
    attentionAlerts: 'अवलोकन व ध्यान देने योग्य बिंदु',
    observationNotes: 'केयरगिवर नोट्स',
    addReminder: 'नया रिमाइंडर जोड़ें',
    clinicalNotice: 'अस्वीकरण: कॉग्निटिवसाथी के आंकड़े केवल गतिविधि सहभागिता दर्शाते हैं। यह कोई चिकित्सीय निदान या उपचार सलाह नहीं है।',

    categoryLabel: 'श्रेणी',
    elderlyFriendlyTip: 'तनावमुक्त, सहज और परिचित अभ्यास जो स्मृति को सहयोग देते हैं।',
    gameFindMatchingTitle: 'पारंपरिक वस्त्र व पैटर्न पहचान',
    gameFindMatchingDesc: 'पारंपरिक बुनाई और धरोहर के मिलते-जुलते डिजाइनों को पहचानें।',
    gameFindMatchingTag: 'धरोहर व वस्त्र',
    gameFindMatchingCategory: 'पैटर्न पहचान',
    gameAttentionTitle: 'शांत चाय बागान अवलोकन',
    gameAttentionDesc: 'बिना किसी समय सीमा के प्रकृति और परिचित वस्तुओं को ध्यान से देखें।',
    gameAttentionTag: 'दैनिक जीवन व प्रकृति',
    gameAttentionCategory: 'सतत एकाग्रता',
    gamePatternTitle: 'पारंपरिक संगीत व ताल क्रम',
    gamePatternDesc: 'पारंपरिक लोक धुनों और आसान लयबद्ध क्रमों का अनुसरण करें।',
    gamePatternTag: 'लोक संगीत व ताल',
    gamePatternCategory: 'क्रमबद्ध स्मृति',
    gameRoutineTitle: 'सुबह की परिचित दिनचर्या',
    gameRoutineDesc: 'चाय, स्नान और दवाइयों जैसे सरल दैनिक चरणों को सही क्रम में लगाएं।',
    gameRoutineTag: 'दैनिक स्वावलंबन',
    gameRoutineCategory: 'दैनिक प्रबंधन',
    gameObjectTitle: 'दैनिक घरेलू वस्तुएं',
    gameObjectDesc: 'पारंपरिक बर्तनों, पूजा सामग्री और औजारों के नाम व उपयोग याद करें।',
    gameObjectTag: 'घरेलू जीवन',
    gameObjectCategory: 'शब्द व वस्तु स्मृति',

    instructionFindCup: 'मिलता-जुलता कप खोजें।',
    instructionTryAgain: 'आइए फिर प्रयास करें।',
    instructionWellDone: 'बहुत बढ़िया।',
    instructionMedicineTime: 'आपकी दवाई का समय हो गया है।',
    instructionContinue: 'क्या आप आगे बढ़ना चाहेंगे?',
    listenAudio: 'सुनें',
    replayAudio: 'पुनः सुनें',
    navLanguagePacks: 'भाषा व आवाज प्रबंधन',
  },

  mni: {
    appName: 'কোগ্নিটিভসাথী',
    appTagline: 'অহল-লমনশিংগী নুংশিরবা মখল-মতৌগী মপাং',
    taglineSub: 'অৱাং-নোংপোক ভারতকী ইমুং-মনুংগী নিংতম্বা অমসুং ইকায়খুম্নবা',
    rolePatient: 'অনাবা / অহলশিংগী মফম',
    roleCaregiver: 'য়েন্থোকপাগী (কেয়ারগিভার) পোৰ্টেল',
    roleHealthcare: 'হকশেলগী মীওইগী ৱাফম',
    switchRole: 'মিৎয়েং হোংদোকউ',

    navHome: 'য়ুমফম',
    navActivities: 'মেমোরী ৱার্কআউট',
    navMyDay: 'ঙসিগী থবক',
    navMemories: 'নীংশিংবা',
    navSettings: 'পাম্বশিং',
    navMe: 'ঐগী (Me)',
    navDashboard: 'অকুপ্পা ৱাফম',
    navPatients: 'ইমুংগী মী',
    navReminders: 'নীংশিংহন্নবা',
    navReports: 'চয়োলগী ৱাফম',

    statusConnected: 'মরী শম্নরে',
    statusSyncing: 'তুংশিনবা চত্থরি...',
    statusOffline: 'ওফলাইন মোদ (মশাদা তুংশিনখ্রে)',
    statusSynced: 'খুদক্তা য়াম্না নীংথিনা তুংশিনখ্রে',
    offlineNotice: 'ইন্টরনেট লৈত্রে অদুবু খল্লুনু। অদোমগী থবকশিং মসিগী মেচিনসিদা লৈরে অমসুং ইন্টরনেট ফংবা মতমদা লোইশিনগনি।',
    syncNow: 'মরী থমজিনবা',

    voiceButtonTitle: 'খোন্থোক্কী মপাং',
    voiceListening: 'অদোমগী খোন তাবা চত্থরি...',
    voiceProcessing: 'খন্নবা হোৎনরি...',
    voiceResponding: 'সাথীনা পাউখুম পীরি...',
    voiceIdle: 'সাথীগা ৱারী শানবা খুৎ থম্মু',
    voiceHelpTitle: 'ঐহাক্না অদোমবু করম্না মতেং পাংগদগে?',
    voiceQuickRoutine: 'ঙসি ঐগী করি থবক লৈরি?',
    voiceQuickReminders: 'ঐ হিদাক চারোইদ্রা?',
    voiceQuickHelp: 'লাইরবা নিংশিংবগী শান্নবা অমা হৌদোকউ',

    greetingMorning: 'অয়ুক্কী শুভকামনা',
    greetingAfternoon: 'নুমিৎ য়ুংবগী শুভকামনা',
    greetingEvening: 'নুমিদাংগী শুভকামনা',
    todaysFocus: 'ঙসিগী তোইনা তৌগদবা',
    startActivity: 'শান্নবা হৌরো',
    completedToday: 'ঙসি তৌরবা',
    activitiesCount: 'শান্নবা অদোমগীদমক শেম-শারে',
    viewRoutine: 'ঙসিগী রুতিন য়েংউ',
    whoAmI: 'অদোম ইমুংগা লোয়ননা অচুম্বা শান্তিগী মফমদা লৈরি।',
    everythingOkay: 'পুম্নমক অপেনবা অমসুং অফবা ওইরি।',
    everythingOkaySub: 'অদোমবু য়েংশিনবা মীওই মনাক্তা লৈরি অমসুং রুতিন তৌদুনা লৈরি।',

    activitiesTitle: 'ৱাখলগী অমসুং নীংশিংবগী শান্নবা',
    activitiesSubtitle: 'ৱাখল নুংঙাইনবা লাইরবা শান্নবা অমসুং চিনাক্কদবা পোৎলমশিং।',
    estimatedTime: 'মতম চংগনি',
    minutesUnit: 'মিনিত',
    difficultyLevel: 'লাইরবা থাক',
    culturalNote: 'মণিপুরগী নাৎ অমসুং চৎনবী',
    playNow: 'হৌদোকউ',
    instructions: 'লাইরবা লমজিং',
    continueGame: 'মখা তাবা',
    calmSuccess: 'য়াম্না ফরে! অদোম থোইদোক্না তৌখ্রে।',
    calmEncouragement: 'ৱাখলবু শান্ত ওইহন্নবা মতম পীবিবগীদমক থাগৎচরি।',
    nextActivityPrompt: 'অতোপ্পা শান্নবা অমা শান্নবা পাম্বিব্ৰা?',
    backToActivities: 'লিস্টতা হল্লকউ',

    myDayTitle: 'ঙসিগী রুতিন',
    myDaySubtitle: 'অয়ুকতগী নুমিদাংফাওবা মমুত তানা য়েংবা।',
    morningRoutine: 'অয়ুক্কী মতম',
    afternoonRoutine: 'নুমিৎ য়ুংবগী মতম',
    eveningRoutine: 'নুমিদাংগী মতম',
    markDone: 'ঐ তৌরে',
    completed: 'লোইরে',
    pending: 'ঙাইরি',

    remindersTitle: 'মপাংগী নীংশিংবা',
    remindersSubtitle: 'হিদাক, ঈশিং অমসুং অফবা মওং-মতৌ নীংশিংবা।',
    takeMedicine: 'হিদাক চাবা',
    drinkWater: 'ঈশিং গ্লাস অমা থকপা',
    activityTime: 'শান্নবগী মতম',
    markTaken: 'চারে হায়না টিক তৌউ',

    memoriesTitle: 'ইমুং অমসুং নীংশিংবা',
    memoriesSubtitle: 'চৎনবী, খুৎনুংশিৎ অমসুং ইমুংগী নুংশিরবা শক্তমশিং।',
    listenStory: 'ৱারী তাউ',
    whoIsThisPrompt: 'মসিগী নীংশিংবা অসি খল্লু',

    accessibilityTitle: 'ময়েক অমসুং চেটিং',
    textSizeTitle: 'ময়েক্কী চাউবা',
    textNormal: 'চাপ চাবা',
    textLarge: 'চাউবা',
    textExtraLarge: 'য়াম্না চাউবা অমসুং শেংবা',
    highContrast: 'হেন্দোক্তুনা য়েংবা (High Contrast)',
    voiceAssistance: 'খোনগী মতেং',
    languageSelect: 'পাম্বা লোন',

    caregiverDashboardTitle: 'কেয়ারগিভার ড্যাশবোর্ড',
    caregiverOverviewSubtitle: 'রুতিন লোইশিনবা, হিদাক চাবা অমসুং শান্তিগা লোয়ননা থবক তৌবগী ফিভম।',
    patientProfileSummary: 'য়েংশিল্লিবা মীওই',
    weeklyAdherence: 'রুতিন তৌবগী চাং',
    recentSessions: 'হন্দক তৌখিবা শান্নবশিং',
    attentionAlerts: 'খঙজিনগদবা ৱাফম',
    observationNotes: 'কেয়ারগিভারগী নোতস',
    addReminder: 'অনৌবা নীংশিংবা হাপ্পু',
    clinicalNotice: 'সতর্কতা: কোগ্নিটিভসাথীগী রেকোর্দ অসি লাইয়েক নত্তে, মসি অহলশিংগী ৱাখলবু নুংঙাইহন্নবগীদমক খক্তনি।',

    categoryLabel: 'মখল',
    elderlyFriendlyTip: 'ৱাখল নুংঙাইনবা অমসুং নীংশিংবা ফগৎহন্নবা শান্নবা।',
    gameFindMatchingTitle: 'চৎনবীগী ফিজোল অমসুং শক্তম',
    gameFindMatchingDesc: 'মণিপুরগী ফি অমসুং চৎনবীগী মান্নবা শক্তমশিং থিদোকউ।',
    gameFindMatchingTag: 'নাৎ অমসুং ফিজোল',
    gameFindMatchingCategory: 'প্যাটার্ন খঙদোকপা',
    gameAttentionTitle: 'চাহ পাম্বীগী শান্ত নিৰীক্ষণ',
    gameAttentionDesc: 'মতমগী চৈথেং য়াওদনা মহৌশাগী অমসুং মশক খঙবা পোৎলমশিং য়েংউ।',
    gameAttentionTag: 'মহৌশা অমসুং পুন্সি',
    gameAttentionCategory: 'মীৎয়েং থম্বা',
    gamePatternTitle: 'চৎনবীগী খোন্থোক অমসুং ঈশৈ',
    gamePatternDesc: 'পুং অমসুং চৎনবীগী লাইরবা খোন্থোক্কী ক্ৰম অসি ইনউ।',
    gamePatternTag: 'নাৎ অমসুং ঈশৈ',
    gamePatternCategory: 'ক্ৰম নীংশিংবা',
    gameRoutineTitle: 'অয়ুক্কী চৎনবীগী থবক',
    gameRoutineDesc: 'চাহ থকপা, ঈরুবা অমসুং হিদাক চাবগী থবকশিং মথং-মনাও শেমজিনউ।',
    gameRoutineTag: 'নুমিৎ খুদিংগী থবক',
    gameRoutineCategory: 'রুতিন শেম-শাবা',
    gameObjectTitle: 'য়ুমগী পোৎলমশিং',
    gameObjectDesc: 'পুৰাণগী থারি, পোৎলম অমসুং শীজিন্নবা পোৎলমগী মমিং নীংশিংউ।',
    gameObjectTag: 'য়ুমগী পুন্সি',
    gameObjectCategory: 'ৱাহৈ অমসুং পোৎলম নীংশিংবা',

    instructionFindCup: 'মান্নবা খোই বিয়ু।',
    instructionTryAgain: 'অমুক হন্না হোৎনসি।',
    instructionWellDone: 'য়াম্না ফরে।',
    instructionMedicineTime: 'হিদাক চাবগী মতম ওইরে।',
    instructionContinue: 'মখা চত্থবা পাম্বিব্রা?',
    listenAudio: 'তাবিযু',
    replayAudio: 'অমুক হন্না তাবিযু',
    navLanguagePacks: 'লোন অমসুং খোন',
  },
};

/**
 * Universal Game Localizer
 * Ensures game title, description, cultural tag, and category match the active language.
 */
export function getGameTranslation(
  gameId: string,
  lang: LanguageCode
): {
  title: string;
  shortDescription: string;
  culturalTag: string;
  category: string;
} {
  const t = translations[lang] || translations.en;

  switch (gameId) {
    case 'find-matching':
      return {
        title: t.gameFindMatchingTitle,
        shortDescription: t.gameFindMatchingDesc,
        culturalTag: t.gameFindMatchingTag,
        category: t.gameFindMatchingCategory,
      };
    case 'spot-difference':
      return {
        title: t.gameAttentionTitle,
        shortDescription: t.gameAttentionDesc,
        culturalTag: t.gameAttentionTag,
        category: t.gameAttentionCategory,
      };
    case 'pattern-recall':
      return {
        title: t.gamePatternTitle,
        shortDescription: t.gamePatternDesc,
        culturalTag: t.gamePatternTag,
        category: t.gamePatternCategory,
      };
    case 'daily-routine':
      return {
        title: t.gameRoutineTitle,
        shortDescription: t.gameRoutineDesc,
        culturalTag: t.gameRoutineTag,
        category: t.gameRoutineCategory,
      };
    case 'object-naming':
      return {
        title: t.gameObjectTitle,
        shortDescription: t.gameObjectDesc,
        culturalTag: t.gameObjectTag,
        category: t.gameObjectCategory,
      };
    default:
      return {
        title: t.gameFindMatchingTitle,
        shortDescription: t.gameFindMatchingDesc,
        culturalTag: t.gameFindMatchingTag,
        category: t.gameFindMatchingCategory,
      };
  }
}

