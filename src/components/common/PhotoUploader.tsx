import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Check, AlertCircle } from 'lucide-react';
import { ElderAvatar } from './ElderAvatar';

interface PhotoUploaderProps {
  currentPhoto?: string;
  name: string;
  onPhotoChange: (newPhotoUrl: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

/**
 * High-quality, safe photo uploader for patient and caregiver profiles.
 * Automatically resizes and compresses user-uploaded photos via canvas
 * to ~30-40KB for fast, permanent localStorage persistence.
 */
export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentPhoto,
  name,
  onPhotoChange,
  label = 'Profile Photo',
  helperText = 'Upload a friendly photo of the elder. Stored safely on this device.',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize to 320x320 max square/portrait for responsive rendering
        const canvas = document.createElement('canvas');
        const MAX_DIM = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onPhotoChange(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setUploadError('Could not load image. Please try another photo.');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Error reading file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-stone-700 block">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200">
        <div className="relative shrink-0 group">
          <ElderAvatar
            name={name || 'User'}
            avatarUrl={currentPhoto}
            size="xl"
            className="shadow-xs"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-stone-900/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-2xs cursor-pointer"
            title="Change photo"
            aria-label="Change photo"
          >
            <Camera className="w-5 h-5 text-amber-300" />
          </button>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentPhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {currentPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                  title="Remove custom photo and use initials avatar"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            {helperText && (
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                {helperText}
              </p>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {isProcessing && (
            <p className="text-xs text-teal-800 font-medium animate-pulse">
              Optimizing photo...
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile photo file input"
      />
    </div>
  );
};
