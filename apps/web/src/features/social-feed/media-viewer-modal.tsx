// Explore Bharat Safar — Media Lightbox Viewer Modal
// Reference: EBS-DOC-15-SOCIAL Section 6, EBS-BLU-44-SOC Section 7

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

export interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrls: string[];
  initialIndex?: number;
  authorName?: string;
  locationName?: string;
}

export function MediaViewerModal({
  isOpen,
  onClose,
  mediaUrls,
  initialIndex = 0,
  authorName,
  locationName,
}: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (currentIndex < mediaUrls.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, mediaUrls.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || mediaUrls.length === 0) return null;

  const currentMediaUrl = mediaUrls[currentIndex] || '';
  const isVideo = currentMediaUrl.match(/\.(mp4|webm|mov)$/i);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Lightbox Viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      {/* Top Bar Controls */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/80 to-transparent text-white">
        <div className="flex flex-col">
          {authorName && <span className="text-sm font-semibold tracking-wide">{authorName}</span>}
          {locationName && (
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <span>📍</span> {locationName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-slate-200">
            {currentIndex + 1} / {mediaUrls.length}
          </span>

          <a
            href={currentMediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Open original"
          >
            <Maximize2 className="w-4 h-4" />
          </a>

          <a
            href={currentMediaUrl}
            download
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download media"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12 select-none">
        {isVideo ? (
          <video
            key={currentMediaUrl}
            src={currentMediaUrl}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
          />
        ) : (
          <img
            key={currentMediaUrl}
            src={currentMediaUrl}
            alt={authorName ? `${authorName}'s media item` : 'Expedition media item'}
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
          />
        )}
      </div>

      {/* Previous Nav Button */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105 shadow-lg"
          aria-label="Previous media"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Nav Button */}
      {currentIndex < mediaUrls.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105 shadow-lg"
          aria-label="Next media"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnail Strip (if multiple) */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 p-2 overflow-x-auto max-w-xl mx-auto z-10 bg-black/40 backdrop-blur-sm rounded-xl">
          {mediaUrls.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-bharat-saffron-500 scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {url.match(/\.(mp4|webm|mov)$/i) ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                  ▶ Video
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
