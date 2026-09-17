import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../../types';

interface LanguageDropdownProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  className?: string;
  compact?: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্' },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLang,
  onSelectLang,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-700/30"
      >
        <Languages className="w-3.5 h-3.5 text-teal-800 shrink-0" />
        <span className="truncate max-w-[90px]">{activeLanguage.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-stone-200 shadow-lg py-1.5 z-50 animate-fadeIn divide-y divide-stone-100"
        >
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Select Language
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectLang(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-stone-900 font-semibold">{lang.native}</span>
                    <span className="text-[10px] text-stone-400">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-800" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
