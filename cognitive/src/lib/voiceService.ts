import { LanguageCode } from '../types';

export interface VoiceServiceCallbacks {
  onTranscript: (text: string) => void;
  onResponse: (text: string) => void;
  onStateChange: (state: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING' | 'ERROR') => void;
  onError: (error: string) => void;
}

export interface VoicePack {
  id: string;
  name: string;
  description: string;
  lang: LanguageCode;
  langCode: string;
  size: string;
  isDownloaded: boolean;
  isDefault?: boolean;
  accent: string;
  gender: 'female' | 'male';
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  selectedVoiceUri?: string;
  activePackId: string;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  pitch: 1.0,
  rate: 0.85, // Slower, clear pace for elderly cognition
  volume: 1.0,
  activePackId: 'in-en-warm',
};

const DEFAULT_VOICE_PACKS: VoicePack[] = [
  {
    id: 'in-en-warm',
    name: 'Indian English - Warm Companion',
    description: 'Gentle, natural Indian English voice tuned with high phonetic clarity and calm cadence.',
    lang: 'en',
    langCode: 'en-IN',
    size: '4.8 MB',
    isDownloaded: true,
    isDefault: true,
    accent: 'Indian English (Natural)',
    gender: 'female',
  },
  {
    id: 'hi-companion',
    name: 'Hindi - Natural Saathi Pack',
    description: 'Polite, clear Hindi pronunciation with comforting respectful tone (Aap / Ji).',
    lang: 'hi',
    langCode: 'hi-IN',
    size: '5.2 MB',
    isDownloaded: true,
    accent: 'Hindi (Standard)',
    gender: 'female',
  },
  {
    id: 'as-heritage',
    name: 'Assamese & North-East Companion Pack',
    description: 'Culturally familiar Assamese speech cadence with soothing senior-friendly rhythm.',
    lang: 'as',
    langCode: 'as-IN',
    size: '3.9 MB',
    isDownloaded: true,
    accent: 'Assamese / NE Regional',
    gender: 'female',
  },
  {
    id: 'mni-heritage',
    name: 'Manipuri / Meiteilon Voice Pack',
    description: 'Phonetic regional voice clarity package for eastern region families.',
    lang: 'mni',
    langCode: 'mni-IN',
    size: '4.1 MB',
    isDownloaded: true,
    accent: 'Manipuri',
    gender: 'female',
  },
];

export class VoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static isSpeaking = false;
  private static cachedVoices: SpeechSynthesisVoice[] = [];

  // Initialize and preload voices
  static init(): void {
    if (!this.synth) return;
    this.updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.updateVoices();
      };
    }
  }

  private static updateVoices(): void {
    if (!this.synth) return;
    try {
      this.cachedVoices = this.synth.getVoices() || [];
    } catch {
      this.cachedVoices = [];
    }
  }

  // Language mapping for Web Speech API
  private static getLangCode(lang: LanguageCode): string {
    switch (lang) {
      case 'as': return 'as-IN';
      case 'hi': return 'hi-IN';
      case 'mni': return 'bn-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  static getVoiceSettings(): VoiceSettings {
    try {
      const data = localStorage.getItem('cognitivesaathi_voice_settings');
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  }

  static saveVoiceSettings(settings: Partial<VoiceSettings>): void {
    try {
      const current = this.getVoiceSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem('cognitivesaathi_voice_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save voice settings:', e);
    }
  }

  static getAvailablePacks(): VoicePack[] {
    try {
      const stored = localStorage.getItem('cognitivesaathi_voice_packs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return DEFAULT_VOICE_PACKS.map((dp) => {
            const found = parsed.find((p: VoicePack) => p.id === dp.id);
            return {
              ...dp,
              ...found,
              isDownloaded: true, // Keep all packs active and ready to play
            };
          });
        }
      }
    } catch {}
    return DEFAULT_VOICE_PACKS.map((p) => ({ ...p, isDownloaded: true }));
  }

  static saveAvailablePacks(packs: VoicePack[]): void {
    try {
      localStorage.setItem('cognitivesaathi_voice_packs', JSON.stringify(packs));
    } catch (e) {
      console.warn('Failed to save voice packs:', e);
    }
  }

  static async activateVoicePack(packId: string): Promise<boolean> {
    const packs = this.getAvailablePacks();
    const target = packs.find((p) => p.id === packId);
    if (!target) return false;

    // Simulate reliable acoustic voice cache download
    target.isDownloaded = true;
    this.saveAvailablePacks(packs);
    this.saveVoiceSettings({ activePackId: packId });
    return true;
  }

  // Play a gentle, soothing acoustic chime to activate audio channel and provide immediate confirmation
  static playAcousticChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {}
  }

  // Converts regional Indic script to clear phonetic syllables for systems without regional TTS voices
  static toPhoneticRegional(text: string, lang: LanguageCode): string {
    if (lang === 'as') {
      if (text.includes('নমস্কাৰ') || text.includes('সাথীৰ')) {
        return 'Nomoskar, aapunar cognitive saathir maat etiya sposhto aru shaanto. Aaraamot thaakok.';
      }
      return text
        .replace(/নমস্কাৰ/g, 'Nomoskar')
        .replace(/আপোনাৰ/g, 'Aapunar')
        .replace(/কগনিটিভ/g, 'Cognitive')
        .replace(/সাথীৰ/g, 'Saathir')
        .replace(/সাথী/g, 'Saathi')
        .replace(/মাত/g, 'Maat')
        .replace(/এতিয়া/g, 'etiya')
        .replace(/স্পষ্ট/g, 'sposhto')
        .replace(/আৰু/g, 'aru')
        .replace(/শান্ত/g, 'shaanto')
        .replace(/সাৰ পাব/g, 'haar paabo')
        .replace(/আৰামত/g, 'aaraamot')
        .replace(/থাকক/g, 'thaakok')
        .replace(/পুৱা/g, 'Puwa')
        .replace(/গধূলি/g, 'Godhuli')
        .replace(/দৰব/g, 'Dorob')
        .replace(/পানী/g, 'Paani')
        .replace(/ভাল/g, 'Bhaal')
        .replace(/কেনে/g, 'Kene')
        .replace(/আছে/g, 'aase');
    }

    if (lang === 'mni') {
      if (text.includes('ꯈꯨꯔꯨꯝꯖꯔꯤ') || text.includes('ꯁꯥꯊꯤ')) {
        return 'Khurumjari, nahakki cognitive saathigi khonthok houjik yaamna phajana thokle.';
      }
      return text
        .replace(/ꯈꯨꯔꯨꯝꯖꯔꯤ/g, 'Khurumjari')
        .replace(/ꯅꯍꯥꯛꯀꯤ/g, 'Nahakki')
        .replace(/ꯀꯣꯒꯅꯤꯇꯤꯚ/g, 'Cognitive')
        .replace(/ꯁꯥꯊꯤꯒꯤ/g, 'Saathigi')
        .replace(/ꯁꯥꯊꯤ/g, 'Saathi')
        .replace(/ꯈꯣꯟꯊꯣꯛ/g, 'Khonthok')
        .replace(/ꯍꯧꯖꯤꯛ/g, 'houjik')
        .replace(/ꯌꯥꯝꯅꯥ/g, 'yaamna')
        .replace(/ꯐꯖꯅꯥ/g, 'phajana')
        .replace(/ꯊꯣꯛꯂꯦ/g, 'thokle')
        .replace(/ꯑꯌꯨꯛ/g, 'Ayuk')
        .replace(/ꯅꯨꯃꯤꯗꯥꯡ/g, 'Numidang')
        .replace(/ꯍꯤꯗꯥꯛ/g, 'Hidak')
        .replace(/ꯏꯁꯤꯡ/g, 'Ishing');
    }

    return text;
  }

  // Find the highest quality voice available in the browser
  private static findBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0) {
      this.updateVoices();
    }
    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    const targetLangCode = this.getLangCode(lang).toLowerCase();
    const settings = this.getVoiceSettings();

    // 1. If a specific voice URI was chosen by the user
    if (settings.selectedVoiceUri) {
      const match = voices.find((v) => v.voiceURI === settings.selectedVoiceUri);
      if (match) return match;
    }

    // 2. Look for high-clarity Indian English or target language natural voices
    if (lang === 'en') {
      const indianVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in')) &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('prabhat'))
      );
      if (indianVoice) return indianVoice;

      const anyIndianEn = voices.find((v) =>
        v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in')
      );
      if (anyIndianEn) return anyIndianEn;

      // Natural English fallback
      const naturalEn = voices.find((v) =>
        v.lang.toLowerCase().startsWith('en') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('samantha'))
      );
      if (naturalEn) return naturalEn;
    } else if (lang === 'hi') {
      const naturalHi = voices.find((v) =>
        v.lang.toLowerCase().includes('hi') &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('swara'))
      );
      if (naturalHi) return naturalHi;

      const anyHi = voices.find((v) => v.lang.toLowerCase().includes('hi'));
      if (anyHi) return anyHi;
    }

    // 3. Fallback to any voice matching the language prefix
    const genericMatch = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0]));
    if (genericMatch) return genericMatch;

    return voices[0] || null;
  }

  static speak(
    text: string,
    lang: LanguageCode = 'en',
    onEnd?: () => void,
    overrideRate?: number
  ): void {
    // Immediate acoustic chime for audio responsiveness
    this.playAcousticChime();

    if (!this.synth) {
      setTimeout(() => onEnd?.(), 1200);
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    if (this.cachedVoices.length === 0) {
      this.updateVoices();
    }

    const settings = this.getVoiceSettings();
    const hasAssameseNative = this.cachedVoices.some((v) => v.lang.toLowerCase().startsWith('as'));
    const hasBengaliNative = this.cachedVoices.some((v) => v.lang.toLowerCase().startsWith('bn'));

    let finalText = text;
    let effectiveLang = this.getLangCode(lang);
    let bestVoice = this.findBestVoice(lang);

    // Regional language handling for systems without native Assamese or Manipuri TTS engines
    if (lang === 'as') {
      if (hasAssameseNative) {
        effectiveLang = 'as-IN';
      } else if (hasBengaliNative) {
        effectiveLang = 'bn-IN';
        bestVoice = this.cachedVoices.find((v) => v.lang.toLowerCase().startsWith('bn')) || bestVoice;
      } else {
        finalText = this.toPhoneticRegional(text, 'as');
        effectiveLang = 'en-IN';
        bestVoice = this.findBestVoice('en') || this.findBestVoice('hi') || this.cachedVoices[0] || null;
      }
    } else if (lang === 'mni') {
      if (hasBengaliNative) {
        effectiveLang = 'bn-IN';
        bestVoice = this.cachedVoices.find((v) => v.lang.toLowerCase().startsWith('bn')) || bestVoice;
      } else {
        finalText = this.toPhoneticRegional(text, 'mni');
        effectiveLang = 'en-IN';
        bestVoice = this.findBestVoice('en') || this.findBestVoice('hi') || this.cachedVoices[0] || null;
      }
    }

    const utterance = new SpeechSynthesisUtterance(finalText);
    utterance.lang = effectiveLang;
    utterance.rate = overrideRate !== undefined ? overrideRate : settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety timeout to prevent hanging UI
    setTimeout(finish, 5000);

    this.isSpeaking = true;
    try {
      this.synth.speak(utterance);
    } catch {
      finish();
    }
  }

  static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  static isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  static startListening(
    lang: LanguageCode,
    callbacks: VoiceServiceCallbacks
  ): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onStateChange('ERROR');
      callbacks.onError("Voice recognition is not supported in this browser. You can continue comfortably with the buttons.");
      setTimeout(() => callbacks.onStateChange('IDLE'), 4000);
      return;
    }

    try {
      this.stopSpeaking();
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.lang = this.getLangCode(lang);
      recognition.continuous = false;
      recognition.interimResults = false;

      callbacks.onStateChange('LISTENING');

      recognition.onstart = () => {
        callbacks.onStateChange('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        callbacks.onTranscript(transcript);
        callbacks.onStateChange('PROCESSING');

        setTimeout(() => {
          const response = this.generateResponse(transcript, lang);
          callbacks.onResponse(response);
          callbacks.onStateChange('RESPONDING');

          this.speak(response, lang, () => {
            callbacks.onStateChange('IDLE');
          });
        }, 900);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        callbacks.onStateChange('ERROR');
        callbacks.onError("We didn't hear clearly, but everything is fine. Tap again whenever you are ready.");
        setTimeout(() => callbacks.onStateChange('IDLE'), 3500);
      };

      recognition.onend = () => {
        // Handled via speech callbacks
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      callbacks.onStateChange('ERROR');
      callbacks.onError("Microphone was busy. Please try tapping again gently.");
      setTimeout(() => callbacks.onStateChange('IDLE'), 3500);
    }
  }

  static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  // Elder-friendly conversational responses
  private static generateResponse(query: string, lang: LanguageCode): string {
    const q = query.toLowerCase();

    // Time & Date Queries
    if (q.includes('time') || q.includes('time ki') || q.includes('samay') || q.includes('baje')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      switch (lang) {
        case 'as': return `এতিয়া সময় হৈছে ${timeStr}। আপুনি কেনে অনুভৱ কৰিছে?`;
        case 'hi': return `अभी समय है ${timeStr}। आप कैसा महसूस कर रहे हैं?`;
        default: return `It is currently ${timeStr}. Take your time, there is no hurry.`;
      }
    }

    // Medicine Queries
    if (q.includes('medicine') || q.includes('dawa') || q.includes('oukhod') || q.includes('pill')) {
      switch (lang) {
        case 'as': return 'আপোনাৰ আবেলিৰ টেবলেট লোৱাৰ সময় হ’ল। আপোনাৰ কাষত অলপ পানী আছেনে?';
        case 'hi': return 'आपकी शाम की दवा का समय हो गया है। क्या आपके पास पानी है?';
        default: return 'Your afternoon routine medicine is scheduled. Please have a sip of warm water first.';
      }
    }

    // Caregiver Queries
    if (q.includes('daughter') || q.includes('son') || q.includes('caregiver') || q.includes('help') || q.includes('call') || q.includes('debashree') || q.includes('family')) {
      switch (lang) {
        case 'as': return 'আপোনাৰ যত্নলোঁৱা পৰিয়াল সদায় আপোনাৰ সৈতে আছে। মই তেওঁলোকক বাৰ্তা পঠিয়াবলৈ সাজু।';
        case 'hi': return 'आपका परिवार और देखभालकर्ता हमेशा आपके साथ हैं। क्या मैं उन्हें संदेश भेजूं?';
        default: return 'Your family is connected and watching over you. You are completely safe here.';
      }
    }

    // How are you / General Greeting
    if (q.includes('hello') || q.includes('namaste') || q.includes('hi') || q.includes('kene asa') || q.includes('kaise ho')) {
      switch (lang) {
        case 'as': return 'নমস্কাৰ! মই আপোনাৰ কগনিটিভ সাথী। মই সদায় আপোনাক সহায় কৰিবলৈ সাজু।';
        case 'hi': return 'नमस्ते! मैं आपका साथी हूँ। आज आपका दिन कैसा चल रहा है?';
        default: return 'Hello! I am your companion Saathi. I am right here with you today.';
      }
    }

    // Default soothing response
    switch (lang) {
      case 'as': return 'মই আপোনাৰ কথা শুনিলোঁ। আপুনি শান্তভাৱে বিশ্ৰাম কৰক, মই আপোনাৰ কাষতে আছোঁ।';
      case 'hi': return 'मैंने आपकी बात सुनी। आप आराम से बैठिए, मैं आपके साथ हूँ।';
      default: return 'I heard you clearly. You are doing wonderfully today, and I am right by your side.';
    }
  }
}

// Auto-initialize voices on startup
if (typeof window !== 'undefined') {
  VoiceService.init();
}
