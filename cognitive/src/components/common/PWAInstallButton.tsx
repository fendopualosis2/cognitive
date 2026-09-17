import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside installed standalone PWA, do not show
  if (isInstalled) {
    return null;
  }

  // Desktop / Android flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 rounded-full bg-teal-800 text-teal-50 px-3.5 py-1.5 text-xs sm:text-sm font-medium hover:bg-teal-900 transition-colors shadow-sm focus-visible:outline-2"
        aria-label="Install CognitiveSaathi App"
      >
        <Download className="w-4 h-4 text-amber-300" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-teal-700 bg-teal-900/10 text-teal-900 px-3 py-1.5 text-xs font-medium hover:bg-teal-900/20 transition-colors"
          aria-label="Add CognitiveSaathi to Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-700" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-[#FBF9F5] p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-semibold text-stone-900">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-stone-500 hover:bg-stone-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <p className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-800">1</span>
                  <span>Tap the <strong>Share</strong> button in the bottom Safari toolbar.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-800">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="text-xs text-stone-500 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  This lets elderly family members access Saathi like a regular phone app without browser distractions.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-800 py-2.5 text-sm font-medium text-white hover:bg-teal-900 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
