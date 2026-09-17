import React, { useState } from 'react';
import {
  Languages,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { LanguageCode, LanguagePack, PatientProfile } from '../../types';
import { LanguagePackService } from '../../lib/languagePackService';

interface LanguagePackManagerProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  currentLang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
}

export const LanguagePackManager: React.FC<LanguagePackManagerProps> = ({
  patient,
  onUpdatePatient,
  currentLang,
  onLangChange,
}) => {
  const [packs, setPacks] = useState<LanguagePack[]>(() => LanguagePackService.getPacks());
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleDownload = async (code: LanguageCode) => {
    setDownloadingCode(code);
    setNotice(null);
    const res = await LanguagePackService.downloadPack(code);
    setDownloadingCode(null);
    if (res.success) {
      setPacks(LanguagePackService.getPacks());
      setNotice(`Language pack for ${code.toUpperCase()} successfully downloaded and cached for offline use.`);
    } else {
      setNotice(res.message || 'Failed to download pack.');
    }
  };

  const handleDelete = (code: LanguageCode) => {
    if (code === 'en') return;
    LanguagePackService.deletePack(code);
    setPacks(LanguagePackService.getPacks());
    setNotice(`Offline assets for ${code.toUpperCase()} removed from local storage.`);
  };

  const handleSetPatientLanguage = (code: LanguageCode) => {
    const isDownloaded = LanguagePackService.isDownloaded(code);
    if (!isDownloaded && code !== 'en') {
      setNotice("This language pack needs to be downloaded when you're online.");
      return;
    }

    const updated: PatientProfile = {
      ...patient,
      preferredLanguage: code,
    };
    onUpdatePatient(updated);
    onLangChange(code);
    setNotice(`Patient primary language set to ${code.toUpperCase()}.`);
  };

  const handleSetFallbackLanguage = (code: LanguageCode) => {
    const updated: PatientProfile = {
      ...patient,
      fallbackLanguage: code,
    };
    onUpdatePatient(updated);
    setNotice(`Fallback language set to ${code.toUpperCase()}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Card */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-7 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold">
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>Multilingual & Voice Guidance Architecture</span>
          </div>
          <h3 className="text-2xl font-bold font-serif-heading text-teal-50">
            Language & Offline Voice Control
          </h3>
          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Manage the elder's spoken language, offline speech assets, and certified regional language packs.
            CognitiveSaathi is architected for modular expansion across North-Eastern India without unverified machine translations.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-amber-700 hover:text-amber-950 dark:hover:text-amber-100 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Patient Language Preference Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
              Patient Primary Language
            </span>
            <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Active Experience Language
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              The language spoken by the voice assistant and shown on cards.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {packs.map((pack) => {
              const isActive = (patient.preferredLanguage || currentLang) === pack.language_code;
              const isDownloaded = pack.download_status === 'downloaded';

              return (
                <div
                  key={pack.language_code}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    isActive
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-100'
                      : 'bg-stone-50 dark:bg-[#121820] border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="primaryLanguage"
                      checked={isActive}
                      onChange={() => handleSetPatientLanguage(pack.language_code)}
                      disabled={!isDownloaded && pack.language_code !== 'en'}
                      className="text-teal-800 focus:ring-teal-700 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span>{pack.language_name}</span>
                        {pack.isPilot && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                            Pilot Regional
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        Version {pack.version} • {pack.validation_status}
                      </div>
                    </div>
                  </div>

                  {!isDownloaded && pack.language_code !== 'en' && (
                    <span className="text-[11px] text-stone-400 font-medium italic">
                      Needs download
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fallback Language */}
        <div className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
              Safety Fallback Language
            </span>
            <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Offline Fallback
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Used automatically if an audio asset is missing or corrupted.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {['en', 'as', 'hi'].map((code) => {
              const isFallback = (patient.fallbackLanguage || 'en') === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSetFallbackLanguage(code as LanguageCode)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs font-bold transition cursor-pointer ${
                    isFallback
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-100'
                      : 'bg-stone-50 dark:bg-[#121820] border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>
                    {code === 'en' ? 'English (Universal Default)' : code === 'as' ? 'অসমীয়া (Assamese)' : 'हिन्दी (Hindi)'}
                  </span>
                  {isFallback && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Available Language Packs Registry */}
      <div className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
              Language Pack Registry & Offline Audio
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Only verified and approved packs are permitted for elderly cognitive instructions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {packs.map((pack) => {
            const isDownloaded = pack.download_status === 'downloaded';
            const isApproved = pack.validation_status === 'approved';
            const isDownloading = downloadingCode === pack.language_code;

            return (
              <div
                key={pack.language_code}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-[#121820] border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {pack.language_name}
                    </h5>
                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                      [{pack.language_code}]
                    </span>

                    {/* Validation Status Badge */}
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Approved (Clinically Reviewed)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        <span>Draft (Linguistic Review Pending)</span>
                      </span>
                    )}

                    {pack.isPilot && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 text-[10px] font-bold">
                        North-East Pilot
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Version: {pack.version} • {Object.keys(pack.translations).length} verified phrases • 5 offline audio prompts
                  </p>
                </div>

                {/* Download / Management Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isDownloaded ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Downloaded & Cached</span>
                      </span>

                      {pack.language_code !== 'en' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(pack.language_code)}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                          title="Delete downloaded assets"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDownload(pack.language_code)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          <span>Downloading Audio...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>Download Pack (Offline Audio)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
