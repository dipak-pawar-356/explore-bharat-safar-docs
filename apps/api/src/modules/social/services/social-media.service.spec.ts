// Explore Bharat Safar — Social Media Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL, EBS-DOC-40-SECURITY Section 32 & 33

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MediaType } from '@ebs/types';
import { SocialMediaService } from './social-media.service';

describe('SocialMediaService', () => {
  let mediaService: SocialMediaService;

  beforeEach(() => {
    mediaService = new SocialMediaService();
  });

  it('should generate pre-signed upload URL for valid image', async () => {
    const result = await mediaService.generatePreSignedUploadUrl('prof_amitabh_001', {
      mediaType: MediaType.IMAGE,
      mimeType: 'image/webp',
      fileSize: 2 * 1024 * 1024, // 2MB
      width: 1920,
      height: 1080,
    });

    assert.ok(result.uploadUrl.includes('s3.ap-south-1.amazonaws.com'));
    assert.ok(result.mediaUrl.includes('cdn.explorebharatsafar.in'));
    assert.equal(result.headers['Content-Type'], 'image/webp');
    assert.equal(result.headers['x-ebs-exif-stripped'], 'true');
  });

  it('should reject unsupported MIME types', async () => {
    await assert.rejects(
      async () => {
        await mediaService.generatePreSignedUploadUrl('prof_amitabh_001', {
          mediaType: MediaType.IMAGE,
          mimeType: 'application/x-executable',
          fileSize: 1024,
        });
      },
      {
        message:
          "Unsupported media type 'application/x-executable'. Permitted formats: JPEG, PNG, WebP, AVIF, MP4, WebM.",
      },
    );
  });

  it('should reject images exceeding 10MB', async () => {
    await assert.rejects(
      async () => {
        await mediaService.generatePreSignedUploadUrl('prof_amitabh_001', {
          mediaType: MediaType.IMAGE,
          mimeType: 'image/jpeg',
          fileSize: 12 * 1024 * 1024, // 12MB
        });
      },
      {
        message: 'Image file size exceeds maximum permitted limit of 10MB.',
      },
    );
  });

  it('should reject videos exceeding 60 seconds duration', async () => {
    await assert.rejects(
      async () => {
        await mediaService.generatePreSignedUploadUrl('prof_amitabh_001', {
          mediaType: MediaType.VIDEO,
          mimeType: 'video/mp4',
          fileSize: 25 * 1024 * 1024, // 25MB
          durationSeconds: 90, // Exceeds 60s
        });
      },
      {
        message: 'Video duration exceeds maximum allowed limit of 60 seconds.',
      },
    );
  });
});
