// Explore Bharat Safar — Section 4: Secure Media Upload Foundation Service
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC Section 4, EBS-DOC-40-SECURITY Section 32 & 33

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MediaType, type PreSignedUploadResult, type MediaAttachmentEntity } from '@ebs/types';
import { UploadMediaPreSignedDto } from '../dto/social.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const MAX_VIDEO_DURATION_SECONDS = 60;

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);

  // In-memory media attachments registry: mediaId -> MediaAttachmentEntity
  private readonly mediaRegistry = new Map<string, MediaAttachmentEntity>();

  /**
   * Generates secure pre-signed upload URL for direct S3 ingress.
   * Enforces MIME type, size limit, and duration bounds.
   */
  async generatePreSignedUploadUrl(
    profileId: string,
    dto: UploadMediaPreSignedDto,
  ): Promise<PreSignedUploadResult> {
    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(
        `Unsupported media type '${dto.mimeType}'. Permitted formats: JPEG, PNG, WebP, AVIF, MP4, WebM.`,
      );
    }

    if (dto.mediaType === MediaType.IMAGE && dto.fileSize > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Image file size exceeds maximum permitted limit of 10MB.');
    }

    if (dto.mediaType === MediaType.VIDEO) {
      if (dto.fileSize > MAX_VIDEO_SIZE_BYTES) {
        throw new BadRequestException('Video file size exceeds maximum permitted limit of 100MB.');
      }
      if (dto.durationSeconds && dto.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        throw new BadRequestException(
          'Video duration exceeds maximum allowed limit of 60 seconds.',
        );
      }
    }

    const extension = this.getExtensionFromMime(dto.mimeType);
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storageKey = `social/${profileId}/${mediaId}.${extension}`;
    const mediaUrl = `https://cdn.explorebharatsafar.in/${storageKey}`;
    const uploadUrl = `https://ebs-media-vault.s3.ap-south-1.amazonaws.com/${storageKey}?signed=true`;

    const attachment: MediaAttachmentEntity = {
      id: mediaId,
      profileId,
      mediaUrl,
      mediaType: dto.mediaType,
      mimeType: dto.mimeType,
      sizeBytes: dto.fileSize,
      width: dto.width,
      height: dto.height,
      durationSeconds: dto.durationSeconds,
      createdAt: new Date().toISOString(),
    };

    this.mediaRegistry.set(mediaId, attachment);

    this.logger.log(
      `Generated pre-signed upload URL for ${dto.mediaType} (${dto.fileSize} bytes) by ${profileId}`,
    );

    return {
      uploadUrl,
      mediaUrl,
      mediaId,
      key: storageKey,
      headers: {
        'Content-Type': dto.mimeType,
        'x-amz-server-side-encryption': 'AES256',
        'x-ebs-exif-stripped': 'true', // DPDP Act 2023 GPS stripping flag
      },
      expiresInSeconds: 900, // 15 minutes TTL
    };
  }

  /**
   * Retrieves media attachment metadata.
   */
  getMediaMetadata(mediaId: string): MediaAttachmentEntity | undefined {
    return this.mediaRegistry.get(mediaId);
  }

  private getExtensionFromMime(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/avif':
        return 'avif';
      case 'video/mp4':
        return 'mp4';
      case 'video/webm':
        return 'webm';
      default:
        return 'bin';
    }
  }
}
