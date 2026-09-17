import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  MessageCircle,
  Upload,
} from 'lucide-react';
import { MemoryMoment, PatientProfile, LanguageCode } from '../../types';
import { VoiceService } from '../../lib/voiceService';

interface CaregiverMemoriesManagerProps {
  patient: PatientProfile;
  memories: MemoryMoment[];
  onAddMemory: (memory: MemoryMoment) => void;
  onDeleteMemory: (id: string) => void;
  lang?: LanguageCode;
}

const PRESET_IMAGE_TEMPLATES = [
  {
    label: 'Family Gathering',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    alt: 'Granddaughter embracing grandmother with affection',
    category: 'Family',
  },
  {
    label: 'Veranda & Garden',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    alt: 'Peaceful garden veranda with morning sunlight and tea bushes',
    category: 'Place',
  },
  {
    label: 'Festival & Traditional',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    alt: 'Traditional celebratory gathering in festive attire',
    category: 'Festival',
  },
  {
    label: 'Tea Gardens & River',
    url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=800',
    alt: 'Lush green tea estate landscape in Assam',
    category: 'Place',
  },
  {
    label: 'Courtyard & Tulsi',
    url: 'https://images.unsplash.com/photo-1609137144822-26c71c35634e?auto=format&fit=crop&q=80&w=800',
    alt: 'Traditional clay lamp and courtyard at dusk',
    category: 'Tradition',
  },
];

export const CaregiverMemoriesManager: React.FC<CaregiverMemoriesManagerProps> = ({
  patient,
  memories,
  onAddMemory,
  onDeleteMemory,
  lang = 'en',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingMemoryId, setPlayingMemoryId] = useState<string | null>(null);

  const hasValidPatient = Boolean(patient && patient.id && patient.fullName && patient.fullName.trim() !== '');

  // Form State for Adding Memory
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Family');
  const [dateLabel, setDateLabel] = useState('');
  const [region, setRegion] = useState(patient?.region || 'Assam');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGE_TEMPLATES[0].url);
  const [imageAlt, setImageAlt] = useState(PRESET_IMAGE_TEMPLATES[0].alt);
  const [story, setStory] = useState('');
  const [audioPrompt, setAudioPrompt] = useState('');
  const [question, setQuestion] = useState('What do you recall most about this joyful day?');
  const [option1, setOption1] = useState('The happy family gathering');
  const [option2, setOption2] = useState('The delicious home-cooked sweets');
  const [option3, setOption3] = useState('The peaceful afternoon breeze');

  if (!hasValidPatient) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto border border-teal-200">
          <Heart className="w-7 h-7 text-teal-800" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg font-serif-heading">No Patient Linked Yet</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Link or register a patient under your care to create personalized photo reminiscence moments and nostalgic audio stories.
        </p>
      </div>
    );
  }

  const categories = ['All', 'Family', 'Festival', 'Place', 'Tradition'];

  const filteredMemories =
    selectedCategory === 'All'
      ? memories
      : memories.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());

  const handlePreviewVoice = (memory: MemoryMoment) => {
    if (playingMemoryId === memory.id) {
      VoiceService.stopSpeaking();
      setPlayingMemoryId(null);
      return;
    }

    VoiceService.stopSpeaking();
    setPlayingMemoryId(memory.id);

    const narration = `${memory.title}. In ${memory.region}. ${memory.story} ${memory.audioPrompt}`;
    VoiceService.speak(narration, (lang || 'en') as LanguageCode, () => {
      setPlayingMemoryId(null);
    });
  };

  const handleSelectPreset = (tpl: typeof PRESET_IMAGE_TEMPLATES[0]) => {
    setImageUrl(tpl.url);
    setImageAlt(tpl.alt);
    setCategory(tpl.category);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setImageAlt(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    const newMemory: MemoryMoment = {
      id: `mem-${Date.now()}`,
      title: title.trim(),
      category: category as any,
      region: region.trim() || patient.region || 'Assam',
      imageUrl: imageUrl.trim() || PRESET_IMAGE_TEMPLATES[0].url,
      imageAlt: imageAlt.trim() || title.trim(),
      dateLabel: dateLabel.trim() || 'Cherished Memory',
      story: story.trim(),
      audioPrompt:
        audioPrompt.trim() ||
        `This is a wonderful memory of ${title.trim()} that your loved ones keep close in their hearts.`,
      interactiveQuestion: {
        question: question.trim() || 'What warms your heart most about this memory?',
        options: [option1.trim() || 'Being with loved ones', option2.trim() || 'The peaceful setting', option3.trim() || 'The happy smiles'],
        correctIndex: 0,
      },
    };

    onAddMemory(newMemory);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setStory('');
    setAudioPrompt('');
    setDateLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-current" />
              Reminiscence & Life Story
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Active for {patient.preferredName || patient.fullName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-stone-900">
            Cherished Memories & Familiar Moments
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Curate photos and gentle stories for {patient.preferredName || patient.fullName}. These
            reminiscence moments provide emotional security, spark fond conversations, and help alleviate cognitive distress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Category Filter Pills & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-stone-500 font-medium">
          Showing {filteredMemories.length} of {memories.length} moments
        </span>
      </div>

      {/* Memories Cards Grid */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Heart className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No memories found in this category</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add a cherished moment or family memory to keep the elder connected to joyful stories.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((m) => {
            const isSpeaking = playingMemoryId === m.id;
            return (
              <div
                key={m.id}
                className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between hover:border-teal-600/60 transition"
              >
                {/* Photo & Category Tag */}
                <div className="relative h-44 bg-stone-900 overflow-hidden">
                  <img
                    src={m.imageUrl}
                    alt={m.imageAlt}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {m.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <p className="text-xs font-medium text-stone-200 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>{m.region}</span>
                      {m.dateLabel && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className="truncate">{m.dateLabel}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-stone-900 font-serif-heading line-clamp-1">
                      {m.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      "{m.story}"
                    </p>
                    {m.audioPrompt && (
                      <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 flex items-start gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 italic">{m.audioPrompt}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Voice Preview & Delete */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(m)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isSpeaking
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                      title={isSpeaking ? 'Stop narration' : 'Preview audio narration for the elder'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                          <span>Preview Voice</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove "${m.title}" from ${patient.preferredName || patient.fullName}'s album?`)) {
                          onDeleteMemory(m.id);
                        }
                      }}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove this memory"
                      aria-label="Remove memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
        >
          <div className="w-full max-w-xl rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                    Add Memory for {patient.preferredName || patient.fullName}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Create a nostalgic memory moment with photo and voice narration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grandson Rohit's First Bicycle Ride"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden bg-white"
                  >
                    <option value="Family">Family</option>
                    <option value="Festival">Festival & Tradition</option>
                    <option value="Place">Cherished Place / Home</option>
                    <option value="Tradition">Tradition & Heritage</option>
                    <option value="Childhood">Childhood Story</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    Date or Season
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="e.g. Winter 2022, Spring Bihu"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Location / Region
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Jorhat, Assam"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                />
              </div>

              {/* Photo Upload & Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 block">
                    Add Memory Photo *
                  </label>
                  {imageUrl && (
                    <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Photo Selected
                    </span>
                  )}
                </div>

                {/* Selected Photo Preview */}
                {imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 h-36 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={imageAlt || 'Memory preview'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-xs text-white font-medium line-clamp-1">
                        {imageAlt || 'Memory photo'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-teal-700 bg-teal-50 hover:bg-teal-100/80 text-teal-900 text-xs font-bold transition flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-teal-700" />
                    <span>Upload Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Heritage Photos */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-stone-500 block">
                    Or choose from regional photo themes:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_IMAGE_TEMPLATES.map((tpl, i) => {
                      const isPicked = imageUrl === tpl.url;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectPreset(tpl)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                            isPicked
                              ? 'border-teal-700 bg-teal-50 ring-1 ring-teal-700'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <img
                            src={tpl.url}
                            alt={tpl.alt}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[11px] font-semibold text-stone-800 line-clamp-1">
                            {tpl.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste an image web link (https://...)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Story / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Memory Description & Story *
                </label>
                <textarea
                  required
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Describe the warm details of what took place so the elder feels comforted..."
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                />
              </div>

              {/* Gentle Audio Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Gentle Audio Prompt (What Saathi reads to spark conversation)
                </label>
                <input
                  type="text"
                  value={audioPrompt}
                  onChange={(e) => setAudioPrompt(e.target.value)}
                  placeholder="e.g. Do you remember the sweet aroma of the tea brewing on that morning?"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  Save Memory to Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
