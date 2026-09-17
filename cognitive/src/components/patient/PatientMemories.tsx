import React, { useState } from 'react';
import { Volume2, VolumeX, Heart, MapPin, Calendar, HelpCircle, CheckCircle, Plus, X, Sparkles, Check, Upload } from 'lucide-react';
import { MemoryMoment, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';
import { VoiceService } from '../../lib/voiceService';

interface PatientMemoriesProps {
  memories: MemoryMoment[];
  lang: LanguageCode;
  onAddMemory?: (memory: MemoryMoment) => void;
}

const ELDER_IMAGE_PRESETS = [
  {
    label: 'Family & Loved Ones',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    alt: 'Granddaughter embracing grandmother',
    category: 'Family',
  },
  {
    label: 'Garden & Peaceful Veranda',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    alt: 'Peaceful garden veranda with morning sunlight',
    category: 'Place',
  },
  {
    label: 'Traditional Festival / Bihu',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    alt: 'Celebration with traditional silk and sweets',
    category: 'Festival',
  },
  {
    label: 'Green Tea Hills & River',
    url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=800',
    alt: 'Tea garden scenery',
    category: 'Place',
  },
];

export const PatientMemories: React.FC<PatientMemoriesProps> = ({
  memories,
  lang,
  onAddMemory,
}) => {
  const t = translations[lang];
  const [selectedMemory, setSelectedMemory] = useState<MemoryMoment>(memories[0] || {
    id: 'empty',
    title: 'Welcome to Memories',
    category: 'Family',
    region: 'Assam',
    imageUrl: ELDER_IMAGE_PRESETS[0].url,
    imageAlt: 'Family',
    dateLabel: 'Today',
    story: 'Memories help preserve the warmest moments of life with family and loved ones.',
    audioPrompt: 'Take a calm moment to cherish your favorite memories.',
    interactiveQuestion: {
      question: 'What is your favorite family moment?',
      options: ['Sharing morning tea', 'Festival gatherings', 'Visiting friends'],
      correctIndex: 0,
    },
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Add Memory Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Family' | 'Festival' | 'Place' | 'Tradition'>('Family');
  const [newDate, setNewDate] = useState('');
  const [newStory, setNewStory] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [selectedPresetImg, setSelectedPresetImg] = useState(ELDER_IMAGE_PRESETS[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlayStory = (memory: MemoryMoment) => {
    if (isSpeaking) {
      VoiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const storyToRead = `${memory.title}. In ${memory.region}. ${memory.story} ${memory.audioPrompt}`;
    VoiceService.speak(storyToRead, lang, () => {
      setIsSpeaking(false);
    });
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setShowFeedback(true);
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStory.trim()) return;

    const chosenImageUrl = customPhotoUrl.trim() || selectedPresetImg.url;

    const created: MemoryMoment = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      region: 'Assam',
      imageUrl: chosenImageUrl,
      imageAlt: newTitle.trim(),
      dateLabel: newDate.trim() || 'Cherished Memory',
      story: newStory.trim(),
      audioPrompt: `This is your cherished memory of ${newTitle.trim()}.`,
      interactiveQuestion: {
        question: 'What brings you joy when thinking of this memory?',
        options: ['Being with loved ones', 'The peaceful feeling', 'The happy smile'],
        correctIndex: 0,
      },
    };

    if (onAddMemory) {
      onAddMemory(created);
    }
    setSelectedMemory(created);
    setIsAddModalOpen(false);
    VoiceService.speak('Your memory has been added to your album.', lang);

    // Reset Form
    setNewTitle('');
    setNewStory('');
    setNewDate('');
    setCustomPhotoUrl('');
  };

  return (
    <div className="space-y-8 pb-8 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            {t.navMemories}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
            {t.memoriesTitle}
          </h2>
          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
            {t.memoriesSubtitle}
          </p>
        </div>

        {onAddMemory && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-sm shadow-md transition active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5 text-stone-900" />
            <span>Add a Memory</span>
          </button>
        )}
      </div>

      {/* Main Memory Viewer Card */}
      <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Large Image Showcase (TRD 19: Large images, avoid dense thumbnails) */}
          <div className="lg:col-span-6 relative bg-stone-900 min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
            <img
              src={selectedMemory.imageUrl}
              alt={selectedMemory.imageAlt}
              className="w-full h-full object-cover max-h-[500px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/90 text-amber-200 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-current text-amber-300" />
                  {selectedMemory.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-heading text-white">
                  {selectedMemory.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Memory Story & Interactive Gentle Reflection */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-500 border-b border-stone-100 pb-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  {selectedMemory.region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {selectedMemory.dateLabel}
                </span>
              </div>

              <div>
                <p className="text-stone-800 text-base sm:text-lg leading-relaxed font-serif-heading">
                  "{selectedMemory.story}"
                </p>
                <p className="text-stone-600 text-sm mt-3 leading-relaxed">
                  {selectedMemory.audioPrompt}
                </p>
              </div>

              {/* Voice Story Narration Button */}
              <button
                onClick={() => handlePlayStory(selectedMemory)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition active:scale-95 ${
                  isSpeaking
                    ? 'bg-amber-600 text-white'
                    : 'bg-teal-800 hover:bg-teal-900 text-white shadow-xs'
                }`}
                aria-label={isSpeaking ? 'Stop narration' : 'Listen to story narration'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5 animate-pulse" />
                    <span>Stop Story Narration</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-amber-300" />
                    <span>{t.listenStory}</span>
                  </>
                )}
              </button>
            </div>

            {/* Reminiscence Bridge: Conversation, not a test */}
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/90 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-600 fill-current" />
                <span>Would you like to talk about this?</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Memories are not a test. They are a bridge to share warmth and comfort with your caregiver and loved ones.
              </p>

              {/* Gentle Conversation Sparks */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Gentle prompts to share together:
                </div>
                {[
                  `"Who was with you during this beautiful day in ${selectedMemory.region}?"`,
                  `"Tell me about the gentle breeze and sounds from that day."`,
                  `"What familiar food or tea was served with loved ones?"`,
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(idx);
                      setShowFeedback(true);
                      VoiceService.speak(promptText, lang);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition ${
                      selectedOption === idx
                        ? 'bg-rose-100/80 border-rose-300 text-stone-900 font-semibold shadow-xs'
                        : 'bg-white border-stone-200 hover:border-amber-400 text-stone-800'
                    }`}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {showFeedback && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-950 bg-rose-100/70 p-3 rounded-xl animate-fadeIn">
                  <Heart className="w-4 h-4 text-rose-600 shrink-0 fill-current" />
                  <span>Cherished reflection shared. There are no wrong answers in loving reminiscence.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Moments Selector Carousel / Tabs */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold font-serif-heading text-stone-900">
          Other Family Moments
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {memories.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                VoiceService.stopSpeaking();
                setIsSpeaking(false);
                setSelectedMemory(m);
                setSelectedOption(null);
                setShowFeedback(false);
              }}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                selectedMemory.id === m.id
                  ? 'bg-teal-50/80 border-teal-600 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <img
                src={m.imageUrl}
                alt={m.imageAlt}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
                  {m.category}
                </span>
                <p className="text-sm font-bold text-stone-900 truncate">{m.title}</p>
                <p className="text-xs text-stone-500 truncate">{m.dateLabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Add Memory Modal for Patient */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                    Add a Cherished Memory
                  </h3>
                  <p className="text-xs text-stone-500">
                    Save a joyful moment or family story to your album
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  What is this memory about? *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Tea with Family or Balcony Flowers"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    Type of Memory
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="Family">Family & Loved Ones</option>
                    <option value="Festival">Festival or Celebration</option>
                    <option value="Place">Home, Garden or Veranda</option>
                    <option value="Tradition">Special Tradition</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    When was it? (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. This Morning, Last Autumn"
                    className="w-full px-3 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Photo Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Add Memory Photo
                </label>

                {/* Preview if uploaded */}
                {customPhotoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 h-32 flex items-center justify-center">
                    <img
                      src={customPhotoUrl}
                      alt="Uploaded memory preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomPhotoUrl('')}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* File Upload from Device */}
                <label className="cursor-pointer w-full py-2.5 px-4 rounded-xl border border-dashed border-teal-700 bg-teal-50 hover:bg-teal-100/80 text-teal-900 text-xs font-bold transition flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-teal-700" />
                  <span>Upload Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="text-[11px] font-semibold text-stone-500 pt-1">
                  Or choose a peaceful theme:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ELDER_IMAGE_PRESETS.map((preset, i) => {
                    const isSelected = !customPhotoUrl && selectedPresetImg.url === preset.url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCustomPhotoUrl('');
                          setSelectedPresetImg(preset);
                          setNewCategory(preset.category as any);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                          isSelected
                            ? 'border-teal-700 bg-teal-50 ring-1 ring-teal-700'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.alt}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] font-semibold text-stone-800 line-clamp-1">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="Or paste an image link (https://...)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  A short note or story *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  placeholder="Share a few warm words about what made this moment special..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm text-stone-800 focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-stone-50/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Save to My Album</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
