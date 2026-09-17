import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { LanguageCode, VoiceState } from '../../types';
import { translations } from '../../lib/i18n';
import { VoiceService } from '../../lib/voiceService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onSelectGame?: (gameId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectGame,
  onNavigateTab,
}) => {
  const t = translations[lang];
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleStartListening = () => {
    setErrorMessage('');
    setTranscript('');
    setAssistantResponse('');

    VoiceService.startListening(lang, {
      onStateChange: (state) => setVoiceState(state),
      onTranscript: (text) => setTranscript(text),
      onResponse: (resp) => setAssistantResponse(resp),
      onError: (msg) => setErrorMessage(msg),
    });
  };

  const handleStopListening = () => {
    VoiceService.stopListening();
    VoiceService.stopSpeaking();
    setVoiceState('IDLE');
  };

  const handleQuickQuery = (query: string, reply: string, route?: string, gameId?: string) => {
    setTranscript(query);
    setAssistantResponse(reply);
    setVoiceState('RESPONDING');

    VoiceService.speak(reply, lang, () => {
      setVoiceState('IDLE');
      if (route && onNavigateTab) {
        onNavigateTab(route);
        onClose();
      }
      if (gameId && onSelectGame) {
        onSelectGame(gameId);
        onClose();
      }
    });
  };

  const handleReplayResponse = () => {
    if (assistantResponse) {
      setVoiceState('RESPONDING');
      VoiceService.speak(assistantResponse, lang, () => {
        setVoiceState('IDLE');
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FBF9F5] p-6 sm:p-8 shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-amber-300">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h2 id="voice-assistant-title" className="text-xl font-bold font-serif-heading text-stone-900">
                {t.voiceButtonTitle}
              </h2>
              <p className="text-xs text-stone-600">CognitiveSaathi Gentle Voice Guide</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopListening();
              onClose();
            }}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200 transition"
            aria-label="Close voice assistant"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Central interactive voice status circle */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-4">
            {voiceState === 'LISTENING' && (
              <div className="absolute h-28 w-28 rounded-full bg-teal-200/70 animate-ping" />
            )}
            {voiceState === 'PROCESSING' && (
              <div className="absolute h-28 w-28 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
            )}
            {voiceState === 'RESPONDING' && (
              <div className="absolute h-28 w-28 rounded-full bg-amber-100 animate-pulse" />
            )}

            <button
              onClick={voiceState === 'LISTENING' ? handleStopListening : handleStartListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
                voiceState === 'LISTENING'
                  ? 'bg-rose-600 text-white'
                  : voiceState === 'RESPONDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-teal-800 text-amber-200 hover:bg-teal-900'
              }`}
              aria-label={voiceState === 'LISTENING' ? 'Stop listening' : 'Tap to speak'}
            >
              {voiceState === 'LISTENING' ? (
                <MicOff className="h-9 w-9" />
              ) : voiceState === 'RESPONDING' ? (
                <Volume2 className="h-9 w-9 animate-pulse" />
              ) : (
                <Mic className="h-9 w-9" />
              )}
            </button>
          </div>

          {/* Voice State Indicator */}
          <div className="min-h-7">
            {voiceState === 'IDLE' && (
              <p className="text-base font-medium text-stone-700">{t.voiceIdle}</p>
            )}
            {voiceState === 'LISTENING' && (
              <p className="text-base font-semibold text-teal-800 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-pulse" />
                {t.voiceListening}
              </p>
            )}
            {voiceState === 'PROCESSING' && (
              <p className="text-base font-semibold text-amber-800">{t.voiceProcessing}</p>
            )}
            {voiceState === 'RESPONDING' && (
              <p className="text-base font-semibold text-teal-900 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-600" />
                {t.voiceResponding}
              </p>
            )}
            {voiceState === 'ERROR' && (
              <p className="text-sm font-medium text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {errorMessage || 'Tap again to retry comfortably.'}
              </p>
            )}
          </div>
        </div>

        {/* Live Transcript and Assistant Output Card */}
        {(transcript || assistantResponse) && (
          <div className="mb-6 rounded-2xl bg-white/80 p-4 border border-stone-200 space-y-3 shadow-xs">
            {transcript && (
              <div className="flex items-start gap-2.5 text-sm text-stone-700">
                <MessageSquare className="h-4 w-4 mt-0.5 text-stone-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">You said:</span>
                  <p className="text-stone-900 font-medium">{transcript}</p>
                </div>
              </div>
            )}
            {assistantResponse && (
              <div className="flex items-start gap-2.5 text-sm bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                <Sparkles className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Saathi:</span>
                  <p className="text-stone-900 font-medium leading-relaxed">{assistantResponse}</p>
                  <button
                    onClick={handleReplayResponse}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:text-teal-950 underline"
                  >
                    <Volume2 className="h-3 w-3" /> Replay Voice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Suggestion Chips for elderly ease */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {t.voiceHelpTitle}
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                handleQuickQuery(
                  t.voiceQuickRoutine,
                  'You have taken your morning tea and medication. Next is a gentle garden walk at 9:00 AM.',
                  'my_day'
                )
              }
              className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3 text-left text-sm font-medium text-stone-800 hover:bg-teal-50 hover:text-teal-900 transition border border-stone-200"
            >
              <span>{t.voiceQuickRoutine}</span>
              <span className="text-xs text-teal-700 font-semibold">View Routine →</span>
            </button>

            <button
              onClick={() =>
                handleQuickQuery(
                  t.voiceQuickReminders,
                  'Your morning BP tablet was marked taken. Your next evening tablet is at 8:30 PM.',
                  'my_day'
                )
              }
              className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3 text-left text-sm font-medium text-stone-800 hover:bg-teal-50 hover:text-teal-900 transition border border-stone-200"
            >
              <span>{t.voiceQuickReminders}</span>
              <span className="text-xs text-teal-700 font-semibold">Check Reminders →</span>
            </button>

            <button
              onClick={() =>
                handleQuickQuery(
                  t.voiceQuickHelp,
                  'Let us start the Heritage Keepsakes memory activity together. Take your time comfortably.',
                  'activities',
                  'memory-recall'
                )
              }
              className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3 text-left text-sm font-medium text-stone-800 hover:bg-teal-50 hover:text-teal-900 transition border border-stone-200"
            >
              <span>{t.voiceQuickHelp}</span>
              <span className="text-xs text-teal-700 font-semibold">Start Game →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
