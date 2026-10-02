// Explore Bharat Safar — Section 4: Traveller Social Platform NestJS Module
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API Section 5.6

import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialProfileService } from './services/social-profile.service';
import { SocialGraphService } from './services/social-graph.service';
import { SocialPostsService } from './services/social-posts.service';
import { SocialFeedService } from './services/social-feed.service';
import { SocialMediaService } from './services/social-media.service';
import { SocialCommunityService } from './services/social-community.service';
import { IdentitySocialBridgeService } from '../../common/services/identity-social-bridge.service';

@Module({
  controllers: [SocialController],
  providers: [
    SocialService,
    SocialProfileService,
    SocialGraphService,
    SocialPostsService,
    SocialFeedService,
    SocialMediaService,
    SocialCommunityService,
    IdentitySocialBridgeService,
  ],
  exports: [
    SocialService,
    SocialProfileService,
    SocialGraphService,
    SocialPostsService,
    SocialFeedService,
    SocialMediaService,
    SocialCommunityService,
    IdentitySocialBridgeService,
  ],
})
export class SocialModule {}
