import React, { useState, useEffect } from 'react';
import { Volume2, Download, Check, Play, RefreshCw, X, Sliders, ShieldCheck } from 'lucide-react';
import { VoiceService, VoicePack, VoiceSettings } from '../../lib/voiceService';
import { LanguageCode } from '../../types';

interface VoicePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const VoicePackModal: React.FC<VoicePackModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [packs, setPacks] = useState<VoicePack[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(VoiceService.getVoiceSettings());
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activationProgress, setActivationProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPacks(VoiceService.getAvailablePacks());
      setSettings(VoiceService.getVoiceSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = (packId: string) => {
    setActivatingId(packId);
    setActivationProgress(15);

    const step1 = setTimeout(() => setActivationProgress(45), 350);
    const step2 = setTimeout(() => setActivationProgress(80), 750);
    const step3 = setTimeout(async () => {
      setActivationProgress(100);
      await VoiceService.activateVoicePack(packId);
      setPacks(VoiceService.getAvailablePacks());
      setSettings(VoiceService.getVoiceSettings());
      setActivatingId(null);
      setActivationProgress(0);

      // Audio confirmation
      VoiceService.speak(
        'Voice settings activated. Voice clarity has been optimized for your device.',
        lang
      );
    }, 1100);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const handleRateChange = (newRate: number) => {
    const updated = { ...settings, rate: newRate };
    setSettings(updated);
    VoiceService.saveVoiceSettings({ rate: newRate });
  };

  const handleTestVoice = (packLang: LanguageCode = lang) => {
    setIsTesting(true);
    const langNames: Record<LanguageCode, string> = {
      as: 'Assamese Voice Pack',
      mni: 'Manipuri Voice Pack',
      hi: 'Hindi Saathi Pack',
      en: 'Indian English Pack',
    };
    setTestStatus(`Playing ${langNames[packLang] || 'Voice Sample'}...`);

    const sampleText =
      packLang === 'as'
        ? 'নমস্কাৰ, আপোনাৰ কগনিটিভ সাথীৰ মাত এতিয়া স্পষ্ট আৰু শান্ত।'
        : packLang === 'mni'
        ? 'ꯈꯨꯔꯨꯝꯖꯔꯤ, ꯅꯍꯥꯛꯀꯤ ꯀꯣꯒꯅꯤꯇꯤꯚ ꯁꯥꯊꯤꯒꯤ ꯈꯣꯟꯊꯣꯛ ꯍꯧꯖꯤꯛ ꯌꯥꯝꯅꯥ ꯐꯖꯅꯥ ꯊꯣꯛꯂꯦ।'
        : packLang === 'hi'
        ? 'नमस्ते, आपकी साथी की आवाज़ अब साफ़ और स्पष्ट है।'
        : 'Hello! Your companion voice is now tuned for calm and clear speech.';

    VoiceService.speak(sampleText, packLang, () => {
      setIsTesting(false);
      setTestStatus(`${langNames[packLang] || 'Voice'} played successfully.`);
      setTimeout(() => setTestStatus(null), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141B22] border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                Voice Quality & Audio Packs
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Enhance audio naturalness, pronunciation clarity, and offline voice packs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Quick Voice Speed & Tone Tuner */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1A222C] border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Voice Pacing (Senior Friendly)
                </span>
              </div>
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-400">
                {settings.rate <= 0.8 ? '0.75x (Very Calm)' : settings.rate < 0.95 ? '0.85x (Recommended)' : '1.0x (Normal)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRateChange(0.75)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  settings.rate <= 0.8
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-white dark:bg-[#141B22] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-teal-700'
                }`}
              >
                Gentle (0.75x)
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(0.85)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  settings.rate > 0.8 && settings.rate < 0.95
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-white dark:bg-[#141B22] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-teal-700'
                }`}
              >
                Calm (0.85x)
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(1.0)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  settings.rate >= 0.95
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-white dark:bg-[#141B22] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-teal-700'
                }`}
              >
                Standard (1.0x)
              </button>
            </div>
          </div>

          {/* Voice Pack List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Available Voice Packs
            </h3>

            {packs.map((pack) => {
              const isCurrent = settings.activePackId === pack.id;
              const isDownloading = activatingId === pack.id;

              return (
                <div
                  key={pack.id}
                  className={`p-4 rounded-2xl border transition ${
                    isCurrent
                      ? 'border-teal-700 bg-teal-50/40 dark:bg-teal-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A222C]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {pack.name}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                          {pack.size}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {pack.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pack.isDownloaded ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              VoiceService.saveVoiceSettings({ activePackId: pack.id });
                              setSettings(VoiceService.getVoiceSettings());
                              handleTestVoice(pack.lang);
                            }}
                            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                            title="Test this voice"
                          >
                            <Play className="w-4 h-4 text-teal-700 dark:text-teal-400 fill-current" />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                VoiceService.saveVoiceSettings({ activePackId: pack.id });
                                setSettings(VoiceService.getVoiceSettings());
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-teal-800 hover:text-white transition"
                            >
                              Select
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={() => handleActivate(pack.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-60"
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{activationProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Pack</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar during download */}
                  {isDownloading && (
                    <div className="mt-3 w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-700 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${activationProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <span>{testStatus}</span>
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleTestVoice(lang)}
            disabled={isTesting}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs transition"
          >
            <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Test Sound Output</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
