// Explore Bharat Safar — Section 4: Traveller Social Platform Schemas
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API, EBS-DOC-26-RULES, EBS-DOC-40-SECURITY

import { z } from 'zod';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
export const HASHTAG_REGEX = /^[a-zA-Z0-9_]{2,50}$/;

export const AdventureGradeEnum = z.enum([
  'ROOKIE',
  'EXPLORER',
  'PATHFINDER',
  'SUMMITEER',
  'EXPEDITION_LEADER',
]);

export const PostVisibilityEnum = z.enum(['PUBLIC', 'FOLLOWERS_ONLY', 'COMMUNITY_ONLY', 'PRIVATE']);

export const PostTypeEnum = z.enum([
  'EXPEDITION_JOURNAL',
  'PHOTO_SHOWCASE',
  'TRAIL_ADVISORY',
  'QA',
]);

export const PostStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const MediaTypeEnum = z.enum(['IMAGE', 'VIDEO']);

export const CommunityRoleEnum = z.enum(['LEADER', 'MODERATOR', 'MEMBER']);

export const UpdateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters.')
    .max(100, 'Display name cannot exceed 100 characters.')
    .optional(),
  bio: z.string().max(255, 'Bio cannot exceed 255 characters.').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL.').optional(),
  coverImageUrl: z.string().url('Cover image URL must be a valid URL.').optional(),
  homeState: z.string().max(100).optional(),
  homeCity: z.string().max(100).optional(),
  spokenLanguages: z.array(z.string().max(50)).max(10).optional(),
  isProfilePublic: z.boolean().optional(),
  isSoloDiscoveryEnabled: z.boolean().optional(),
});

export const CreatePostSchema = z
  .object({
    title: z.string().max(200, 'Title cannot exceed 200 characters.').optional(),
    content: z
      .string()
      .min(1, 'Post content cannot be empty.')
      .max(10000, 'Post content cannot exceed 10,000 characters.'),
    postType: PostTypeEnum,
    visibility: PostVisibilityEnum.default('PUBLIC'),
    status: PostStatusEnum.default('PUBLISHED'),
    mediaUrls: z
      .array(z.string().url('Media URL must be valid.'))
      .max(10, 'A post cannot contain more than 10 media attachments.')
      .default([]),
    placeId: z.string().uuid('Place ID must be a valid UUID.').optional(),
    villageId: z.string().uuid('Village ID must be a valid UUID.').optional(),
    locationName: z.string().max(150).optional(),
  })
  .superRefine((data, ctx) => {
    // Business Rule (EBS-DOC-26-RULES Sec 5): Published expedition journals must have at least 20 chars
    if (
      data.status === 'PUBLISHED' &&
      data.postType === 'EXPEDITION_JOURNAL' &&
      data.content.trim().length < 20
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expedition journal must be at least 20 characters.',
        path: ['content'],
      });
    }
  });

export const UpdatePostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  visibility: PostVisibilityEnum.optional(),
  status: PostStatusEnum.optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
  locationName: z.string().max(150).optional(),
});

export const CreateCommunitySchema = z.object({
  slug: z
    .string()
    .min(3, 'Community slug must be at least 3 characters.')
    .max(50, 'Community slug cannot exceed 50 characters.')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens only.'),
  title: z
    .string()
    .min(3, 'Community title must be at least 3 characters.')
    .max(100, 'Community title cannot exceed 100 characters.'),
  description: z
    .string()
    .min(10, 'Community description must be at least 10 characters.')
    .max(1000, 'Community description cannot exceed 1000 characters.'),
  bannerUrl: z.string().url('Banner URL must be a valid URL.').optional(),
  iconUrl: z.string().url('Icon URL must be a valid URL.').optional(),
  rulesText: z
    .string()
    .min(10, 'Community rules must be at least 10 characters.')
    .max(2000, 'Community rules cannot exceed 2000 characters.'),
});

export const UpdateCommunitySchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  bannerUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  rulesText: z.string().min(10).max(2000).optional(),
});

export const FeedQuerySchema = z.object({
  feedType: z.enum(['HOME', 'FOLLOWING', 'DISCOVER']).default('HOME'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const SearchTravellerQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query must be at least 1 character.')
    .max(100, 'Search query cannot exceed 100 characters.'),
  grade: AdventureGradeEnum.optional(),
  state: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const HashtagFeedQuerySchema = z.object({
  hashtag: z
    .string()
    .min(2, 'Hashtag must be at least 2 characters.')
    .max(50, 'Hashtag cannot exceed 50 characters.')
    .regex(HASHTAG_REGEX, 'Hashtag contains invalid characters.'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
];

export const UploadMediaPreSignedSchema = z
  .object({
    mediaType: MediaTypeEnum,
    mimeType: z.string().refine(val => ALLOWED_MIME_TYPES.includes(val), {
      message: 'Unsupported MIME type. Allowed formats: JPEG, PNG, WebP, AVIF, MP4, WebM.',
    }),
    fileSize: z.number().positive('File size must be positive.'),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    durationSeconds: z
      .number()
      .positive()
      .max(60, 'Video duration cannot exceed 60 seconds.')
      .optional(),
  })
  .superRefine((data, ctx) => {
    // 10MB limit for images
    if (data.mediaType === 'IMAGE' && data.fileSize > 10 * 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Image file size exceeds maximum permitted limit of 10MB.',
        path: ['fileSize'],
      });
    }
    // 100MB limit for videos
    if (data.mediaType === 'VIDEO' && data.fileSize > 100 * 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Video file size exceeds maximum permitted limit of 100MB.',
        path: ['fileSize'],
      });
    }
  });

export const UpdateCommunityMemberRoleSchema = z.object({
  role: CommunityRoleEnum,
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type CreateCommunityInput = z.infer<typeof CreateCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof UpdateCommunitySchema>;
export type FeedQueryInput = z.infer<typeof FeedQuerySchema>;
export type SearchTravellerQueryInput = z.infer<typeof SearchTravellerQuerySchema>;
export type HashtagFeedQueryInput = z.infer<typeof HashtagFeedQuerySchema>;
export type UploadMediaPreSignedInput = z.infer<typeof UploadMediaPreSignedSchema>;
export type UpdateCommunityMemberRoleInput = z.infer<typeof UpdateCommunityMemberRoleSchema>;
