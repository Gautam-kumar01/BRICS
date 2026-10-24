'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, ZoomIn, AlertCircle } from 'lucide-react';

interface PhotoUploadCaptureProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
  helperText?: string;
}

/**
 * Resizes an image file client-side using Canvas to ensure small payload size (~50-80KB)
 * while preserving high visual fidelity for municipal site evidence.
 */
async function compressImageFile(file: File, maxDim: number = 1024, quality: number = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoUploadCapture({
  photos,
  onChange,
  maxPhotos = 3,
  label = 'Attach Site Photos / समस्या की फोटो जोड़ें',
  helperText = 'Click photo from camera or upload from device (Max 3 photos)'
}: PhotoUploadCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum of ${maxPhotos} photos reached / अधिकतम ${maxPhotos} फोटो की अनुमति है।`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setErrorMessage(`Only ${availableSlots} more photo(s) could be added (Max ${maxPhotos})`);
    }

    setIsProcessing(true);
    try {
      const processed: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(file);
        processed.push(compressed);
      }
      onChange([...photos, ...processed]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing photo');
    } finally {
      setIsProcessing(false);
      // Reset input values so same file can be selected again if removed
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    setErrorMessage(null);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      {/* Header & Counter */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
          <Camera className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-orange-100 text-orange-800 border border-orange-300">
            {photos.length} / {maxPhotos}
          </span>
        </label>
        {photos.length > 0 && (
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} attached
          </span>
        )}
      </div>

      <p className="text-[11px] text-stone-600 font-medium">
        {helperText}
      </p>

      {/* Hidden Native File Inputs */}
      {/* 1. Camera Click Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 2. Gallery / File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Upload Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Camera Button */}
        <button
          type="button"
          onClick={() => {
            if (!canAddMore) {
              setErrorMessage(`Maximum limit of ${maxPhotos} photos reached.`);
              return;
            }
            cameraInputRef.current?.click();
          }}
          disabled={!canAddMore || isProcessing}
          className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            !canAddMore
              ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-white hover:bg-orange-50/80 border-orange-300 hover:border-orange-500 text-stone-900 shadow-2xs active:scale-95'
          }`}
        >
          <Camera className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Click Photo (कैमरा)</span>
        </button>

        {/* Gallery / File Button */}
        <button
          type="button"
          onClick={() => {
            if (!canAddMore) {
              setErrorMessage(`Maximum limit of ${maxPhotos} photos reached.`);
              return;
            }
            fileInputRef.current?.click();
          }}
          disabled={!canAddMore || isProcessing}
          className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            !canAddMore
              ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-white hover:bg-orange-50/80 border-orange-300 hover:border-orange-500 text-stone-900 shadow-2xs active:scale-95'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Upload File (गैलरी)</span>
        </button>
      </div>

      {isProcessing && (
        <div className="text-xs font-bold text-orange-600 flex items-center space-x-2 py-1">
          <span className="w-3 h-3 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
          <span>Optimizing & attaching photo...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Thumbnail Previews Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {photos.map((src, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden border-2 border-orange-300 bg-stone-950 shadow-sm aspect-video flex items-center justify-center"
            >
              <img
                src={src}
                alt={`Site evidence ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Tag / Number Badge */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                #{index + 1}
              </span>

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEnlargedPhoto(src)}
                  title="Enlarge preview"
                  className="p-1.5 rounded-full bg-white/90 text-stone-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  title="Remove photo"
                  className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Lightbox Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-stone-950 rounded-3xl overflow-hidden border-2 border-orange-500 shadow-2xl p-2 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer border border-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={enlargedPhoto}
              alt="Enlarged photo evidence"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
