// Explore Bharat Safar — Traveller Post Composer Component
// Reference: EBS-DOC-15-SOCIAL Section 3, EBS-DOC-26-RULES Section 4

'use client';

import React, { useState, useMemo } from 'react';
import {
  Send,
  FileText,
  Camera,
  Compass,
  HelpCircle,
  Globe,
  Users,
  Lock,
  MapPin,
  Image as ImageIcon,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';
import { PostType, PostVisibility, PostStatus } from '@ebs/types';
import type { CreatePostDto } from '@ebs/types';

export interface PostComposerProps {
  onPostCreated?: (post: CreatePostDto) => Promise<void>;
  communityId?: string;
  defaultPostType?: PostType;
  placeholder?: string;
}

export function PostComposer({
  onPostCreated,
  defaultPostType = PostType.EXPEDITION_JOURNAL,
  placeholder = 'Record your trail observations, route conditions, or cultural interactions...',
}: PostComposerProps) {
  const [postType, setPostType] = useState<PostType>(defaultPostType);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-detect hashtags and mentions from content
  const detectedTags = useMemo(() => {
    const rawHashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    const rawMentions = content.match(/@[a-zA-Z0-9_]+/g) || [];
    return {
      hashtags: Array.from(new Set(rawHashtags.map(h => h.slice(1)))),
      mentions: Array.from(new Set(rawMentions.map(m => m.slice(1)))),
    };
  }, [content]);

  const handleAddMedia = () => {
    if (!mediaUrlInput.trim()) return;
    if (mediaUrls.length >= 10) {
      setErrorMessage('A maximum of 10 media attachments are permitted per post.');
      return;
    }
    setMediaUrls([...mediaUrls, mediaUrlInput.trim()]);
    setMediaUrlInput('');
    setShowMediaInput(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = async (status: PostStatus) => {
    setErrorMessage(null);

    if (content.trim().length === 0) {
      setErrorMessage('Post content cannot be empty.');
      return;
    }

    if (
      status === PostStatus.PUBLISHED &&
      postType === PostType.EXPEDITION_JOURNAL &&
      content.trim().length < 20
    ) {
      setErrorMessage(
        'Expedition Journals require at least 20 characters of authentic field notes.',
      );
      return;
    }

    const payload: CreatePostDto = {
      title: title.trim() || undefined,
      content: content.trim(),
      postType,
      visibility,
      status,
      locationName: locationName.trim() || undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    try {
      setIsSubmitting(true);
      if (onPostCreated) {
        await onPostCreated(payload);
      }
      // Reset form on success
      setTitle('');
      setContent('');
      setLocationName('');
      setMediaUrls([]);
      setShowLocationInput(false);
      setShowMediaInput(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to publish post. Please check your network.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Post Type Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setPostType(PostType.EXPEDITION_JOURNAL)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
            postType === PostType.EXPEDITION_JOURNAL
              ? 'bg-bharat-saffron-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Expedition Journal
        </button>

        <button
          type="button"
          onClick={() => setPostType(PostType.PHOTO_SHOWCASE)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
            postType === PostType.PHOTO_SHOWCASE
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Photo Showcase
        </button>

        <button
          type="button"
          onClick={() => setPostType(PostType.TRAIL_ADVISORY)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
            postType === PostType.TRAIL_ADVISORY
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Trail Advisory
        </button>

        <button
          type="button"
          onClick={() => setPostType(PostType.QA)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
            postType === PostType.QA
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Q&A Query
        </button>
      </div>

      {/* Optional Title Field */}
      {(postType === PostType.EXPEDITION_JOURNAL || postType === PostType.TRAIL_ADVISORY) && (
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={
            postType === PostType.EXPEDITION_JOURNAL
              ? 'Expedition Title (e.g. Roopkund Alpine Ascent — Day 3)'
              : 'Advisory Headline (e.g. High Monsoon Landslide Warning: Tamhini Ghat)'
          }
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
        />
      )}

      {/* Main Content Area */}
      <div className="relative">
        <textarea
          rows={4}
          maxLength={3000}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 resize-none transition-all leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <div className="flex items-center gap-2">
            {detectedTags.hashtags.length > 0 && (
              <span className="text-bharat-saffron-600 font-mono font-medium">
                {detectedTags.hashtags.map(tag => `#${tag}`).join(' ')}
              </span>
            )}
            {detectedTags.mentions.length > 0 && (
              <span className="text-blue-600 font-mono font-medium">
                {detectedTags.mentions.map(user => `@${user}`).join(' ')}
              </span>
            )}
          </div>
          <span>{content.length} / 3000</span>
        </div>
      </div>

      {/* Media Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {mediaUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group"
            >
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveMedia(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Location Input */}
      {showLocationInput && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            placeholder="Tag mountain, pass, or village (e.g. Harishchandragad, Ahmednagar)"
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setLocationName('');
              setShowLocationInput(false);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Collapsible Media URL Input */}
      {showMediaInput && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <input
            type="url"
            value={mediaUrlInput}
            onChange={e => setMediaUrlInput(e.target.value)}
            placeholder="Enter media image/video URL (e.g. https://...)"
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMedia();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddMedia}
            className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowMediaInput(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Toolbar & Submission Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Attachment Toggles & Visibility */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMediaInput(!showMediaInput)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              mediaUrls.length > 0 || showMediaInput
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Attach Media Photos / Videos"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Photo / Video</span>
            {mediaUrls.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
                {mediaUrls.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowLocationInput(!showLocationInput)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              locationName || showLocationInput
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tag Geolocation / Village"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Tag Location</span>
          </button>

          {/* Visibility Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value as PostVisibility)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl pl-7 pr-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value={PostVisibility.PUBLIC}>Public</option>
              <option value={PostVisibility.FOLLOWERS_ONLY}>Followers Only</option>
              <option value={PostVisibility.COMMUNITY_ONLY}>Community Only</option>
              <option value={PostVisibility.PRIVATE}>Private (Only Me)</option>
            </select>
            <div className="absolute left-2.5 pointer-events-none text-slate-500">
              {visibility === PostVisibility.PUBLIC && <Globe className="w-3.5 h-3.5" />}
              {visibility === PostVisibility.FOLLOWERS_ONLY && <Users className="w-3.5 h-3.5" />}
              {visibility === PostVisibility.COMMUNITY_ONLY && <Users className="w-3.5 h-3.5" />}
              {visibility === PostVisibility.PRIVATE && <Lock className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => handleFormSubmit(PostStatus.DRAFT)}
            disabled={isSubmitting || content.trim().length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleFormSubmit(PostStatus.PUBLISHED)}
            disabled={isSubmitting || content.trim().length === 0}
            className="px-5 py-2 rounded-xl bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
