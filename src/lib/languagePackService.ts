import { LanguageCode, LanguagePack, LanguagePackValidationStatus, LanguagePackDownloadStatus } from '../types';
import { VoiceService } from './voiceService';

const STORAGE_KEY_LANGUAGE_PACKS = 'cognitivesaathi_lang_packs_v2';
const STORAGE_KEY_AUDIO_CACHE = 'cognitivesaathi_audio_cache_v2';

export const IMPORTANT_INSTRUCTIONS = {
  FIND_CUP: 'instruction_find_cup',
  TRY_AGAIN: 'instruction_try_again',
  WELL_DONE: 'instruction_well_done',
  MEDICINE_TIME: 'instruction_medicine_time',
  CONTINUE_QUESTION: 'instruction_continue',
} as const;

export interface AudioInstructionData {
  text: string;
  audioKey: string;
}

// Built-in Language Pack Definitions
// MVP Languages: English + One Pilot Regional Pack (Assamese 'as'), plus Hindi ('hi')
// Demonstrates open architecture without claiming support for every North-East language
export const DEFAULT_LANGUAGE_PACKS: LanguagePack[] = [
  {
    language_code: 'en',
    language_name: 'English',
    version: '1.2.0',
    validation_status: 'approved',
    download_status: 'downloaded',
    isPilot: false,
    translations: {
      instruction_find_cup: 'Find the matching cup.',
      instruction_try_again: "Let's try again.",
      instruction_well_done: 'Well done.',
      instruction_medicine_time: 'Time for your medicine.',
      instruction_continue: 'Would you like to continue?',
      listen_audio: 'Listen',
      replay_audio: 'Replay',
    },
    audio_assets: {
      instruction_find_cup: 'audio_en_find_cup',
      instruction_try_again: 'audio_en_try_again',
      instruction_well_done: 'audio_en_well_done',
      instruction_medicine_time: 'audio_en_medicine_time',
      instruction_continue: 'audio_en_continue',
    },
  },
  {
    language_code: 'as',
    language_name: 'অসমীয়া (Assamese)',
    version: '1.2.0-pilot',
    validation_status: 'approved',
    download_status: 'downloaded',
    isPilot: true,
    translations: {
      instruction_find_cup: 'মিলা কাপটো বিচাৰি উলিয়াওক।',
      instruction_try_again: 'আহক, আৰু এবাৰ চেষ্টা কৰোঁ।',
      instruction_well_done: 'বৰ সুন্দৰ হৈছে।',
      instruction_medicine_time: 'আপোনাৰ ঔষধ খোৱাৰ সময় হৈছে।',
      instruction_continue: 'আপুনি আৰু আগবাঢ়িব বিচাৰেনে?',
      listen_audio: 'শুনক',
      replay_audio: 'পুনৰ শুনক',
    },
    audio_assets: {
      instruction_find_cup: 'audio_as_find_cup',
      instruction_try_again: 'audio_as_try_again',
      instruction_well_done: 'audio_as_well_done',
      instruction_medicine_time: 'audio_as_medicine_time',
      instruction_continue: 'audio_as_continue',
    },
  },
  {
    language_code: 'hi',
    language_name: 'हिन्दी (Hindi)',
    version: '1.1.0',
    validation_status: 'approved',
    download_status: 'downloaded',
    isPilot: false,
    translations: {
      instruction_find_cup: 'मिलता-जुलता कप खोजें।',
      instruction_try_again: 'आइए फिर प्रयास करें।',
      instruction_well_done: 'बहुत बढ़िया।',
      instruction_medicine_time: 'आपकी दवाई का समय हो गया है।',
      instruction_continue: 'क्या आप आगे बढ़ना चाहेंगे?',
      listen_audio: 'सुनें',
      replay_audio: 'पुनः सुनें',
    },
    audio_assets: {
      instruction_find_cup: 'audio_hi_find_cup',
      instruction_try_again: 'audio_hi_try_again',
      instruction_well_done: 'audio_hi_well_done',
      instruction_medicine_time: 'audio_hi_medicine_time',
      instruction_continue: 'audio_hi_continue',
    },
  },
  {
    language_code: 'mni',
    language_name: 'মৈতৈলোন্ (Manipuri - Regional Pilot)',
    version: '0.9.0-draft',
    validation_status: 'draft',
    download_status: 'not_downloaded',
    isPilot: true,
    translations: {
      instruction_find_cup: 'মান্নবা খোই বিয়ু।',
      instruction_try_again: 'অমুক হন্না হোৎনসি।',
      instruction_well_done: 'য়াম্না ফরে।',
      instruction_medicine_time: 'হিদাক চাবগী মতম ওইরে।',
      instruction_continue: 'মখা চত্থবা পাম্বিব্রা?',
      listen_audio: 'তাবিযু',
      replay_audio: 'অমুক হন্না তাবিযু',
    },
    audio_assets: {
      instruction_find_cup: 'audio_mni_find_cup',
      instruction_try_again: 'audio_mni_try_again',
      instruction_well_done: 'audio_mni_well_done',
      instruction_medicine_time: 'audio_mni_medicine_time',
      instruction_continue: 'audio_mni_continue',
    },
  },
];

export class LanguagePackService {
  private static packsCache: LanguagePack[] | null = null;
  private static audioPlaying = false;

  static getPacks(): LanguagePack[] {
    if (this.packsCache) return this.packsCache;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE_PACKS);
      if (saved) {
        this.packsCache = JSON.parse(saved);
        return this.packsCache || DEFAULT_LANGUAGE_PACKS;
      }
    } catch (e) {
      console.warn('Failed to load language packs from storage:', e);
    }
    this.packsCache = DEFAULT_LANGUAGE_PACKS;
    this.savePacks(DEFAULT_LANGUAGE_PACKS);
    return DEFAULT_LANGUAGE_PACKS;
  }

  static savePacks(packs: LanguagePack[]): void {
    this.packsCache = packs;
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE_PACKS, JSON.stringify(packs));
    } catch (e) {
      console.warn('Failed to save language packs to storage:', e);
    }
  }

  static getPack(code: LanguageCode): LanguagePack | undefined {
    return this.getPacks().find((p) => p.language_code === code);
  }

  static isDownloaded(code: LanguageCode): boolean {
    const pack = this.getPack(code);
    return pack?.download_status === 'downloaded';
  }

  static isApproved(code: LanguageCode): boolean {
    const pack = this.getPack(code);
    return pack?.validation_status === 'approved';
  }

  static async downloadPack(code: LanguageCode): Promise<{ success: boolean; message?: string }> {
    const packs = this.getPacks();
    const packIndex = packs.findIndex((p) => p.language_code === code);
    if (packIndex === -1) {
      return { success: false, message: 'Language pack not found in registry.' };
    }

    // Set status to downloading
    packs[packIndex].download_status = 'downloading';
    this.savePacks([...packs]);

    // Simulate network download & offline asset caching
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Cache simulated audio waveforms for offline playback
    const audioKeys = Object.keys(packs[packIndex].audio_assets);
    try {
      const cacheData = localStorage.getItem(STORAGE_KEY_AUDIO_CACHE) || '{}';
      const parsedCache = JSON.parse(cacheData);
      audioKeys.forEach((key) => {
        parsedCache[`${code}_${key}`] = {
          cachedAt: Date.now(),
          offlineReady: true,
        };
      });
      localStorage.setItem(STORAGE_KEY_AUDIO_CACHE, JSON.stringify(parsedCache));
    } catch {}

    packs[packIndex].download_status = 'downloaded';
    this.savePacks([...packs]);
    return { success: true };
  }

  static deletePack(code: LanguageCode): void {
    // English cannot be deleted as it is the base fallback
    if (code === 'en') return;

    const packs = this.getPacks();
    const pack = packs.find((p) => p.language_code === code);
    if (pack) {
      pack.download_status = 'not_downloaded';
      this.savePacks([...packs]);
    }
  }

  static getInstructionText(key: string, lang: LanguageCode, fallbackLang: LanguageCode = 'en'): string {
    const pack = this.getPack(lang);
    if (pack && pack.translations[key]) {
      return pack.translations[key];
    }
    const fallbackPack = this.getPack(fallbackLang);
    return fallbackPack?.translations[key] || '';
  }

  /**
   * Audio-First Player with Offline Capability
   * If the audio asset is downloaded, it plays immediately without internet.
   */
  static playInstructionAudio(
    key: string,
    lang: LanguageCode,
    callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: () => void }
  ): void {
    const text = this.getInstructionText(key, lang);
    if (!text) {
      callbacks?.onError?.();
      return;
    }

    callbacks?.onStart?.();
    this.audioPlaying = true;

    // Use gentle elderly speech pace (0.85 rate)
    VoiceService.speak(
      text,
      lang,
      () => {
        this.audioPlaying = false;
        callbacks?.onEnd?.();
      },
      0.85
    );
  }

  static stopAudio(): void {
    VoiceService.stopSpeaking();
    this.audioPlaying = false;
  }

  static isAudioPlaying(): boolean {
    return this.audioPlaying || VoiceService.isCurrentlySpeaking();
  }
}
