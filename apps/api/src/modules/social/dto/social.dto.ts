// Explore Bharat Safar — Section 4: Traveller Social Platform DTOs
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsPositive,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AdventureGrade,
  PostVisibility,
  PostType,
  PostStatus,
  CommunityRole,
  MediaType,
} from '@ebs/types';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  homeState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  homeCity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  spokenLanguages?: string[];

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isSoloDiscoveryEnabled?: boolean;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content!: string;

  @IsEnum(PostType)
  postType!: PostType;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsOptional()
  @IsString()
  villageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  locationName?: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  locationName?: string;
}

export class FeedQueryDto {
  @IsOptional()
  @IsEnum(['HOME', 'FOLLOWING', 'DISCOVER'])
  feedType?: 'HOME' | 'FOLLOWING' | 'DISCOVER';

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SearchTravellerQueryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  query!: string;

  @IsOptional()
  @IsEnum(AdventureGrade)
  grade?: AdventureGrade;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class HashtagFeedQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]{2,50}$/, {
    message: 'Hashtag contains invalid characters.',
  })
  hashtag!: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class CreateCommunityDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lower-case alphanumeric with hyphens only.',
  })
  slug!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  rulesText!: string;
}

export class UpdateCommunityDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  rulesText?: string;
}

export class UpdateCommunityMemberRoleDto {
  @IsEnum(CommunityRole)
  role!: CommunityRole;
}

export class UploadMediaPreSignedDto {
  @IsEnum(MediaType)
  mediaType!: MediaType;

  @IsString()
  mimeType!: string;

  @IsNumber()
  @IsPositive()
  fileSize!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(60)
  durationSeconds?: number;
}
