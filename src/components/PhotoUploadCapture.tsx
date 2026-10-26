'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  X, 
  ZoomIn, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw,
  Search,
  FileCheck
} from 'lucide-react';
import { PhotoVerificationResult } from '@/types';

interface PhotoUploadCaptureProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
  helperText?: string;
  domain?: string; // Current claimed infrastructure domain ('roads', 'water', etc.)
  complaintText?: string; // Current citizen complaint text
  location?: string;
  onVerificationChange?: (allValid: boolean, verifications: (PhotoVerificationResult | null)[]) => void;
}

/**
 * Resizes an image file client-side using Canvas to ensure small payload size (~80-120KB)
 * while preserving high visual fidelity for municipal site evidence and Gemini Vision inspection.
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
  helperText = 'Click photo from camera or upload from device (Max 3 photos)',
  domain = 'roads',
  complaintText = '',
  location = 'District Area',
  onVerificationChange
}: PhotoUploadCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  // Store verification result for each photo index
  const [verifications, setVerifications] = useState<{ [photoIndex: number]: PhotoVerificationResult | null }>({});
  const [verifyingIndices, setVerifyingIndices] = useState<Set<number>>(new Set());

  // Notify parent of verification status whenever verifications or photos change
  useEffect(() => {
    if (photos.length === 0) {
      if (onVerificationChange) onVerificationChange(true, []);
      return;
    }

    const resultsList = photos.map((_, idx) => verifications[idx] || null);
    // If any photo is rejected, allValid is false
    const hasRejected = resultsList.some(r => r && r.isValid === false);
    const allValid = !hasRejected;

    if (onVerificationChange) {
      onVerificationChange(allValid, resultsList);
    }
  }, [photos, verifications]);

  /**
   * Triggers the 3-Layer AI Evidence Inspection via /api/ai/verify-photo
   */
  const verifyPhotoWithAI = async (photoDataUrl: string, index: number) => {
    setVerifyingIndices(prev => new Set(prev).add(index));

    try {
      const res = await fetch('/api/ai/verify-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: photoDataUrl,
          domain: domain || 'roads',
          complaintText: complaintText || 'Public infrastructure issue reported',
          location: location || 'District Pilot'
        })
      });

      if (res.ok) {
        const result: PhotoVerificationResult = await res.json();
        setVerifications(prev => ({ ...prev, [index]: result }));
      } else {
        const errData = await res.json().catch(() => ({}));
        setVerifications(prev => ({
          ...prev,
          [index]: {
            isValid: false,
            decision: 'REJECTED',
            confidenceScore: 0.8,
            detectedContent: 'Verification inspection timeout',
            officerVerdict: 'Inspection Service Timeout: Please retry or verify your network connection.',
            reason: errData.reason || 'Verification service error.',
            layers: {
              layer1_isInfrastructure: false,
              layer1_status: 'FAIL',
              layer1_details: 'Service unreachable.',
              layer2_isAuthenticPhoto: false,
              layer2_status: 'FAIL',
              layer2_details: 'Service unreachable.',
              layer3_matchesComplaint: false,
              layer3_status: 'FAIL',
              layer3_details: 'Service unreachable.'
            }
          }
        }));
      }
    } catch (e: any) {
      console.error('[Photo Verification Error]:', e);
    } finally {
      setVerifyingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

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
      const newProcessed: string[] = [];
      const startIndex = photos.length;

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(file);
        newProcessed.push(compressed);
      }

      const updatedPhotos = [...photos, ...newProcessed];
      onChange(updatedPhotos);

      // Trigger 3-Layer verification on each newly added photo
      newProcessed.forEach((dataUrl, idx) => {
        const targetIndex = startIndex + idx;
        verifyPhotoWithAI(dataUrl, targetIndex);
      });

    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing photo');
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    
    // Shift verifications index map
    setVerifications(prev => {
      const next: { [key: number]: PhotoVerificationResult | null } = {};
      let nextIdx = 0;
      for (let i = 0; i < photos.length; i++) {
        if (i !== index) {
          next[nextIdx] = prev[i] || null;
          nextIdx++;
        }
      }
      return next;
    });

    setVerifyingIndices(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx < index) next.add(idx);
        else if (idx > index) next.add(idx - 1);
      });
      return next;
    });

    setErrorMessage(null);
  };

  const reVerifyAll = () => {
    photos.forEach((src, idx) => {
      verifyPhotoWithAI(src, idx);
    });
  };

  const canAddMore = photos.length < maxPhotos;
  const hasAnyRejected = Object.values(verifications).some(v => v && v.isValid === false);

  return (
    <div className="space-y-3.5">
      {/* Header & Counter */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
          <Camera className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-orange-100 text-orange-800 border border-orange-300">
            {photos.length} / {maxPhotos}
          </span>
        </label>
        
        <div className="flex items-center space-x-2">
          {photos.length > 0 && (
            <span className={`text-[11px] font-mono font-bold flex items-center space-x-1 ${
              hasAnyRejected ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {hasAnyRejected ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Action Required: Invalid Evidence</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{photos.length} Photo{photos.length > 1 ? 's' : ''} Attached</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-stone-600 font-medium">
        {helperText}
      </p>

      {/* Hidden Native File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

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
          <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
          <span>Optimizing & attaching photo...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3-Layer AI Guardrail Notice */}
      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-700 flex items-start space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold text-stone-900">3-Layer AI Evidence Guardrail Active: </span>
          <span>Every photo is inspected for (1) Real infrastructure, (2) Authentic camera capture, and (3) Alignment with claimed domain (<strong>{domain.toUpperCase()}</strong>). Selfies, memes, and mismatched photos are automatically rejected.</span>
        </div>
      </div>

      {/* Thumbnail Previews Grid with Real-Time AI Badge */}
      {photos.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {photos.map((src, index) => {
              const isVerifying = verifyingIndices.has(index);
              const verification = verifications[index];
              const isRejected = verification && verification.isValid === false;
              const isApproved = verification && verification.isValid === true;

              return (
                <div
                  key={index}
                  className={`relative group rounded-2xl overflow-hidden border-2 bg-stone-950 shadow-sm flex flex-col justify-between ${
                    isRejected ? 'border-red-500 ring-2 ring-red-200' :
                    isApproved ? 'border-emerald-500 ring-1 ring-emerald-200' :
                    'border-orange-300'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src={src}
                      alt={`Site evidence ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Tag / Number Badge */}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                      #{index + 1}
                    </span>

                    {/* AI Verification Status Pill */}
                    <div className="absolute top-1.5 right-1.5">
                      {isVerifying ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px] shadow-sm flex items-center space-x-1 animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Inspecting...</span>
                        </span>
                      ) : isRejected ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1">
                          <X className="w-2.5 h-2.5" />
                          <span>Rejected</span>
                        </span>
                      ) : isApproved ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-700 text-white font-bold text-[10px]">
                          Pending
                        </span>
                      )}
                    </div>

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

                  {/* Micro Status Summary below image */}
                  <div className={`p-2 text-[10px] font-sans ${
                    isRejected ? 'bg-red-50 text-red-950 border-t border-red-200' :
                    isApproved ? 'bg-emerald-50 text-emerald-950 border-t border-emerald-200' :
                    'bg-stone-50 text-stone-600 border-t border-stone-200'
                  }`}>
                    {isVerifying ? (
                      <span className="flex items-center space-x-1 font-semibold text-amber-700">
                        <Sparkles className="w-3 h-3 animate-spin shrink-0" />
                        <span>Running 3-Layer Vision Check...</span>
                      </span>
                    ) : isRejected ? (
                      <span className="block font-bold text-red-700 leading-tight truncate" title={verification?.reason}>
                        ❌ {verification?.reason || 'Mismatch / Non-infrastructure'}
                      </span>
                    ) : isApproved ? (
                      <span className="block font-bold text-emerald-800 leading-tight truncate" title={verification?.detectedContent}>
                        ✓ {verification?.detectedContent || 'Genuine infrastructure evidence'}
                      </span>
                    ) : (
                      <span>Waiting for inspection</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspection Cards for Rejected Photos */}
          {photos.map((_, index) => {
            const verification = verifications[index];
            if (!verification || verification.isValid !== false) return null;

            return (
              <div 
                key={`inspection-card-${index}`}
                className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 shadow-sm space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-start justify-between gap-2 border-b border-red-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-xs font-mono font-bold text-red-900 uppercase">
                      AI Officer Verdict — Photo #{index + 1} Rejected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="text-[11px] font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
                  >
                    Remove Photo #{index + 1}
                  </button>
                </div>

                {/* Human Officer Verdict Statement */}
                <div className="text-xs text-red-950 font-medium italic bg-white/70 p-2.5 rounded-xl border border-red-200">
                  &ldquo;{verification.officerVerdict}&rdquo;
                </div>

                {/* What is in photo vs citizen claimed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-white/80 border border-red-200">
                    <span className="text-stone-500 font-bold block">Detected in Photo:</span>
                    <span className="text-red-900 font-extrabold">{verification.detectedContent}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-red-200">
                    <span className="text-stone-500 font-bold block">Citizen Claimed Issue:</span>
                    <span className="text-stone-900 font-extrabold uppercase">{domain} ({complaintText || 'Issue described'})</span>
                  </div>
                </div>

                {/* 3-Layer Diagnostic Audit Checklist */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <span className="font-bold text-stone-800 uppercase font-mono text-[10px] tracking-wider">
                    3-Layer Inspection Breakdown:
                  </span>
                  
                  <div className="grid grid-cols-1 gap-1.5 font-sans">
                    {/* Layer 1 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-red-200 text-xs">
                      <span className="font-semibold text-stone-800">Layer 1 (Public Infrastructure):</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        verification.layers.layer1_status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.layers.layer1_status === 'PASS' ? '✓ Passed' : '✕ Failed (Not Infrastructure)'}
                      </span>
                    </div>

                    {/* Layer 2 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-red-200 text-xs">
                      <span className="font-semibold text-stone-800">Layer 2 (Authentic Camera Capture):</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        verification.layers.layer2_status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.layers.layer2_status === 'PASS' ? '✓ Passed' : '✕ Failed / Suspicious'}
                      </span>
                    </div>

                    {/* Layer 3 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-red-200 text-xs">
                      <span className="font-semibold text-stone-800">Layer 3 (Matches {domain.toUpperCase()} Domain):</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        verification.layers.layer3_status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.layers.layer3_status === 'PASS' ? '✓ Passed' : `✕ Failed (Mismatch with ${domain})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-red-800 pt-1 flex items-center justify-between">
                  <span>⚠️ Submission blocked until rejected photo is removed or replaced with genuine evidence.</span>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Remove Photo #{index + 1}
                  </button>
                </div>
              </div>
            );
          })}
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
