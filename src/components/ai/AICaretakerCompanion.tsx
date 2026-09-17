import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, X, Heart, ShieldCheck, RefreshCw } from 'lucide-react';
import { PatientProfile, LanguageCode } from '../../types';
import { VoiceService } from '../../lib/voiceService';

interface AICaretakerCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  lang: LanguageCode;
  routineCount: number;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AICaretakerCompanion: React.FC<AICaretakerCompanionProps> = ({
  isOpen,
  onClose,
  patient,
  lang,
  routineCount,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'msg-init',
        sender: 'ai',
        text: `Pranam, ${patient.preferredName}. I am Saathi, your gentle companion. Everything is safe and peaceful at home. How may I comfort you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
      if (isSpeakingEnabled) {
        VoiceService.speak(initialGreeting.text, lang);
      }
    }
  }, [isOpen, patient.preferredName, lang, isSpeakingEnabled, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'as' ? 'as-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          patientName: patient.preferredName || patient.fullName,
          preferredLanguage: lang,
          role: 'PATIENT',
          context: {
            age: patient.age,
            location: patient.region,
            dailyStreak: patient.dailyStreak,
            routineCompleted: routineCount,
          },
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        `You are resting safely in your home, ${patient.preferredName}. Everything is peaceful.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (isSpeakingEnabled) {
        VoiceService.speak(replyText, lang);
      }
    } catch (err) {
      console.error('Error contacting AI Caretaker:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Take a deep breath, ${patient.preferredName}. You are completely safe with your family, and everything is calm.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (isSpeakingEnabled) {
        VoiceService.speak(fallbackMsg.text, lang);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Where am I right now?', text: 'Where am I right now? Please remind me.' },
    { label: 'What is next in my day?', text: 'What is next in my routine today?' },
    { label: 'I feel a little anxious', text: 'I am feeling a little worried or confused.' },
    { label: 'Tell me a calming story', text: 'Please tell me a gentle story about Assam or the tea gardens.' },
    { label: 'Is my family nearby?', text: 'Where is my family and are they okay?' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FBF9F5] rounded-3xl shadow-2xl border-2 border-teal-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif-heading text-white">Saathi AI Companion</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-700 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                  Active Caretaker
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                Compassionate & culturally attuned eldercare support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !isSpeakingEnabled;
                setIsSpeakingEnabled(next);
                if (!next) VoiceService.stopSpeaking();
              }}
              className={`p-2.5 rounded-xl transition ${
                isSpeakingEnabled
                  ? 'bg-amber-400 text-stone-900 hover:bg-amber-300'
                  : 'bg-teal-800 text-teal-300 hover:bg-teal-700'
              }`}
              title={isSpeakingEnabled ? 'Voice Aloud Enabled' : 'Voice Aloud Muted'}
            >
              {isSpeakingEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                VoiceService.stopSpeaking();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety reassurance banner */}
        <div className="bg-teal-50 px-5 py-2.5 border-b border-teal-100 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="font-semibold">Reassurance Anchor: Safe at home with {patient.caregiverName}</span>
          </div>
          <span className="text-[11px] text-teal-700 font-medium">Streak: {patient.dailyStreak} days</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-800 text-white'
                    : 'bg-amber-100 text-teal-950'
                }`}
              >
                {msg.sender === 'user' ? (
                  <span className="text-xs font-bold">{patient.preferredName.charAt(0)}</span>
                ) : (
                  <Bot className="w-5 h-5 text-teal-900" />
                )}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-800 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-teal-100/90 rounded-tl-none'
                }`}
              >
                <p className="font-medium">{msg.text}</p>
                <div className="flex items-center justify-between gap-4 mt-2">
                  <span
                    className={`text-[10px] ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => VoiceService.speak(msg.text, lang)}
                      className="text-stone-400 hover:text-teal-700 transition"
                      title="Listen again"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-teal-950 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5 text-teal-900 animate-pulse" />
              </div>
              <div className="bg-white text-stone-600 border border-teal-100/90 rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-700 animate-spin" />
                <span>Saathi is thinking gently...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-stone-100/80 border-t border-stone-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-stone-500 uppercase shrink-0">Prompts:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.text)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 border border-stone-200 text-xs font-semibold text-stone-700 hover:text-teal-900 transition active:scale-95"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3.5 rounded-2xl transition shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
                title={isListening ? 'Stop listening' : 'Speak to Saathi'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Speak or type gently to Saathi...`}
              className="flex-1 bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white font-bold transition shrink-0 active:scale-95 shadow-sm"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
