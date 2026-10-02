// Explore Bharat Safar — Social Posts Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL Section 3, EBS-DOC-26-RULES Section 5

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PostType, PostVisibility, PostStatus } from '@ebs/types';
import { SocialProfileService } from './social-profile.service';
import { SocialGraphService } from './social-graph.service';
import { SocialPostsService } from './social-posts.service';

describe('SocialPostsService', () => {
  let profileService: SocialProfileService;
  let graphService: SocialGraphService;
  let postsService: SocialPostsService;

  beforeEach(() => {
    profileService = new SocialProfileService();
    graphService = new SocialGraphService(profileService);
    postsService = new SocialPostsService(profileService, graphService);
  });

  it('should parse hashtags and mentions accurately', () => {
    const text =
      'Exploring ancient stepwells with @amitabh_sharma on #monsoontrek in #Western_Ghats!';
    const tags = postsService.parseHashtags(text);
    const mentions = postsService.parseMentions(text);

    assert.equal(tags.length, 2);
    assert.ok(tags.includes('monsoontrek'));
    assert.ok(tags.includes('western_ghats'));

    assert.equal(mentions.length, 1);
    assert.equal(mentions[0], 'amitabh_sharma');
  });

  it('should create an expedition journal and extract hashtags', async () => {
    const post = await postsService.createPost('prof_amitabh_001', {
      postType: PostType.EXPEDITION_JOURNAL,
      title: 'Kalsubai Sunrise Summit',
      content:
        'Began the ascent at midnight from Bari village. Reached the highest peak in Maharashtra at 05:45 AM. #kalsubai #summit #sahyadri',
      visibility: PostVisibility.PUBLIC,
      status: PostStatus.PUBLISHED,
      mediaUrls: ['https://cdn.explorebharatsafar.in/posts/kalsubai.webp'],
    });

    assert.ok(post.id);
    assert.equal(post.title, 'Kalsubai Sunrise Summit');
    assert.equal(post.hashtags.length, 3);
    assert.ok(post.hashtags.includes('kalsubai'));
    assert.equal(post.status, PostStatus.PUBLISHED);
  });

  it('should reject published expedition journal with fewer than 20 characters', async () => {
    await assert.rejects(
      async () => {
        await postsService.createPost('prof_amitabh_001', {
          postType: PostType.EXPEDITION_JOURNAL,
          content: 'Too short',
          status: PostStatus.PUBLISHED,
        });
      },
      {
        message: 'Expedition journal must be at least 20 characters.',
      },
    );
  });

  it('should enforce rate limit of maximum 6 posts per hour', async () => {
    // Author 6 posts successfully
    for (let i = 0; i < 6; i++) {
      await postsService.createPost('prof_amitabh_001', {
        postType: PostType.QA,
        content: `Question ${i + 1}: Any fresh water source on this trail?`,
      });
    }

    // 7th post must be blocked by rate limiter
    await assert.rejects(
      async () => {
        await postsService.createPost('prof_amitabh_001', {
          postType: PostType.QA,
          content: 'Question 7: Blocked by rate limiter',
        });
      },
      (err: Error) => {
        return err.message.includes('rate limit exceeded');
      },
    );
  });

  it('should edit authored post by owner', async () => {
    const post = await postsService.createPost('prof_amitabh_001', {
      postType: PostType.QA,
      content: 'Original question text here.',
    });

    const updated = await postsService.updatePost('prof_amitabh_001', post.id, {
      content: 'Updated question text with #trail_qa.',
    });

    assert.equal(updated.content, 'Updated question text with #trail_qa.');
    assert.ok(updated.hashtags.includes('trail_qa'));
  });

  it('should reject editing post by non-owner', async () => {
    const post = await postsService.createPost('prof_amitabh_001', {
      postType: PostType.QA,
      content: 'Owner is Amitabh.',
    });

    await assert.rejects(
      async () => {
        await postsService.updatePost('prof_pooja_002', post.id, {
          content: 'Hacked edit attempt.',
        });
      },
      {
        message: 'You are not authorized to edit this post.',
      },
    );
  });

  it('should soft-delete post', async () => {
    const post = await postsService.createPost('prof_amitabh_001', {
      postType: PostType.QA,
      content: 'This post will be deleted.',
    });

    await postsService.deletePost('prof_amitabh_001', post.id);

    await assert.rejects(
      async () => {
        await postsService.getPostById(post.id);
      },
      {
        message: `Post ${post.id} not found.`,
      },
    );
  });
});
