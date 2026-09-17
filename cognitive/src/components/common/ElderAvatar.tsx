import React from 'react';
import { User, Heart } from 'lucide-react';

interface ElderAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  genderHint?: 'female' | 'male' | 'neutral';
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

// Warm earthen color palettes inspired by Indian textiles & heritage (marigold, terracotta, forest teal, sandalwood, peacock blue)
const PALETTES = [
  { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  { bg: 'bg-teal-100', text: 'text-teal-950', border: 'border-teal-300' },
  { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-300' },
  { bg: 'bg-stone-200', text: 'text-stone-800', border: 'border-stone-300' },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

function getInitials(name: string): string {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Dignified, culturally respectful avatar component for elderly patients and caregivers.
 * Replaces generic/inappropriate stock photos with warm, personalized avatars.
 */
export const ElderAvatar: React.FC<ElderAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const palette = getPalette(name || 'Patient');
  const initials = getInitials(name);

  // If a valid custom image data URL or blob exists, render it.
  // Reject stock photos that were inappropriate for elderly patients.
  const isStockPhoto = avatarUrl?.includes('images.unsplash.com');
  const hasValidCustomPhoto =
    !imageError &&
    Boolean(avatarUrl) &&
    !isStockPhoto &&
    (avatarUrl!.startsWith('data:') ||
      avatarUrl!.startsWith('blob:') ||
      avatarUrl!.startsWith('/') ||
      avatarUrl!.startsWith('http'));

  if (hasValidCustomPhoto) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses} rounded-2xl object-cover border-2 ${palette.border} shadow-2xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-2xl ${palette.bg} ${palette.text} border-2 ${palette.border} flex flex-col items-center justify-center font-bold tracking-wider font-serif-heading shadow-2xs shrink-0 select-none ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
