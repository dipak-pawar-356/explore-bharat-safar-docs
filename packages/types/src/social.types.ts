// Explore Bharat Safar — Section 4: Traveller Social Platform Contracts
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API, EBS-DOC-10-DATABASE, EBS-DOC-26-RULES

import { GeoPoint } from './common.types';

export enum AdventureGrade {
  ROOKIE = 'ROOKIE',
  EXPLORER = 'EXPLORER',
  PATHFINDER = 'PATHFINDER',
  SUMMITEER = 'SUMMITEER',
  EXPEDITION_LEADER = 'EXPEDITION_LEADER',
}

export enum BadgeType {
  SOVEREIGN_EXPLORER = 'SOVEREIGN_EXPLORER',
  SAHYADRI_SENTINEL = 'SAHYADRI_SENTINEL',
  HIMALAYAN_WANDERER = 'HIMALAYAN_WANDERER',
  HERITAGE_CUSTODIAN = 'HERITAGE_CUSTODIAN',
  VILLAGE_DOCUMENTER = 'VILLAGE_DOCUMENTER',
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  FOLLOWERS_ONLY = 'FOLLOWERS_ONLY',
  COMMUNITY_ONLY = 'COMMUNITY_ONLY',
  PRIVATE = 'PRIVATE',
}

export enum PostType {
  EXPEDITION_JOURNAL = 'EXPEDITION_JOURNAL',
  PHOTO_SHOWCASE = 'PHOTO_SHOWCASE',
  TRAIL_ADVISORY = 'TRAIL_ADVISORY',
  QA = 'QA',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum FollowRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum CommunityRole {
  LEADER = 'LEADER',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum SocialActionType {
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  POST_CREATE = 'POST_CREATE',
  POST_UPDATE = 'POST_UPDATE',
  POST_DELETE = 'POST_DELETE',
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
  FOLLOW_REQUEST_CREATE = 'FOLLOW_REQUEST_CREATE',
  FOLLOW_REQUEST_ACCEPT = 'FOLLOW_REQUEST_ACCEPT',
  FOLLOW_REQUEST_REJECT = 'FOLLOW_REQUEST_REJECT',
  BLOCK_USER = 'BLOCK_USER',
  UNBLOCK_USER = 'UNBLOCK_USER',
  MUTE_USER = 'MUTE_USER',
  UNMUTE_USER = 'UNMUTE_USER',
  COMMUNITY_CREATE = 'COMMUNITY_CREATE',
  COMMUNITY_JOIN = 'COMMUNITY_JOIN',
  COMMUNITY_LEAVE = 'COMMUNITY_LEAVE',
  COMMUNITY_ROLE_CHANGE = 'COMMUNITY_ROLE_CHANGE',
}

export interface TravellerProfileSummary {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  adventureGrade: AdventureGrade;
}

export interface TravellerProfileEntity {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  homeState?: string;
  homeCity?: string;
  spokenLanguages: string[];
  adventureGrade: AdventureGrade;
  badges: BadgeType[];
  visitedStatesCount: number;
  visitedDistrictsCount: number;
  completedExpeditionsCount: number;
  totalElevationMeters: number;
  followersCount: number;
  followingCount: number;
  isProfilePublic: boolean;
  isSoloDiscoveryEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialGraphRelation {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isPendingFollowRequest: boolean;
  isBlocked: boolean;
  isMuted: boolean;
}

export interface MediaAttachmentEntity {
  id: string;
  profileId: string;
  mediaUrl: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
}

export interface PostEntity {
  id: string;
  profileId: string;
  author: TravellerProfileSummary;
  postType: PostType;
  title?: string;
  content: string;
  mediaUrls: string[];
  mediaAttachments?: MediaAttachmentEntity[];
  hashtags: string[];
  mentions: string[];
  placeId?: string;
  villageId?: string;
  locationName?: string;
  geotagLocation?: GeoPoint;
  visibility: PostVisibility;
  status: PostStatus;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TemporaryStoryEntity {
  id: string;
  profileId: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption?: string;
  publishedAt: string;
  expiresAt: string;
  viewCount: number;
}

export interface TravelMilestoneEntity {
  id: string;
  profileId: string;
  title: string;
  description: string;
  milestoneType: 'EXPEDITION' | 'CERTIFICATE' | 'HERITAGE' | 'VILLAGE';
  referenceId?: string;
  heroImageUrl?: string;
  eventTimestamp: string;
}

export interface FollowEntity {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowRequestEntity {
  id: string;
  requesterId: string;
  targetId: string;
  requester: TravellerProfileSummary;
  status: FollowRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl?: string;
  iconUrl?: string;
  creatorProfileId: string;
  rulesText: string;
  isVerified: boolean;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
  userRole?: CommunityRole;
}

export interface CommunityMemberEntity {
  communityId: string;
  profileId: string;
  role: CommunityRole;
  joinedAt: string;
  profile?: TravellerProfileSummary;
}

export interface SocialAuditLogEntity {
  id: string;
  actorId: string;
  action: SocialActionType;
  targetType: string;
  targetId: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// DTOs & Queries
// ---------------------------------------------------------------------------

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  homeState?: string;
  homeCity?: string;
  spokenLanguages?: string[];
  isProfilePublic?: boolean;
  isSoloDiscoveryEnabled?: boolean;
}

export interface CreatePostDto {
  title?: string;
  content: string;
  postType: PostType;
  visibility?: PostVisibility;
  status?: PostStatus;
  mediaUrls?: string[];
  placeId?: string;
  villageId?: string;
  locationName?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  visibility?: PostVisibility;
  status?: PostStatus;
  mediaUrls?: string[];
  locationName?: string;
}

export interface FeedQueryDto {
  feedType?: 'HOME' | 'FOLLOWING' | 'DISCOVER';
  cursor?: string;
  limit?: number;
}

export interface SearchTravellerQueryDto {
  query: string;
  grade?: AdventureGrade;
  state?: string;
  page?: number;
  limit?: number;
}

export interface HashtagFeedQueryDto {
  hashtag: string;
  cursor?: string;
  limit?: number;
}

export interface CreateCommunityDto {
  slug: string;
  title: string;
  description: string;
  bannerUrl?: string;
  iconUrl?: string;
  rulesText: string;
}

export interface UpdateCommunityDto {
  title?: string;
  description?: string;
  bannerUrl?: string;
  iconUrl?: string;
  rulesText?: string;
}

export interface UploadMediaPreSignedDto {
  mediaType: MediaType;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

export interface PreSignedUploadResult {
  uploadUrl: string;
  mediaUrl: string;
  mediaId: string;
  key: string;
  headers: Record<string, string>;
  expiresInSeconds: number;
}
