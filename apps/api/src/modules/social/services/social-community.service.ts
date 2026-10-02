// Explore Bharat Safar — Section 4: Travel Communities & Expedition Guilds Domain Service
// Reference: EBS-DOC-15-SOCIAL Section 5.2, EBS-BLU-44-SOC Section 9

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  CommunityRole,
  type CommunityEntity,
  type CommunityMemberEntity,
  type PostEntity,
} from '@ebs/types';
import { CreateCommunityDto } from '../dto/social.dto';
import { SocialPostsService } from './social-posts.service';

@Injectable()
export class SocialCommunityService {
  private readonly logger = new Logger(SocialCommunityService.name);

  // slug -> CommunityEntity
  private readonly communities = new Map<string, CommunityEntity>();
  // `${communityId}:${profileId}` -> CommunityMemberEntity
  private readonly memberships = new Map<string, CommunityMemberEntity>();

  constructor(private readonly postsService: SocialPostsService) {
    this.seedInitialCommunities();
  }

  /**
   * Creates a new Travel Community / Expedition Guild.
   */
  async createCommunity(
    creatorProfileId: string,
    dto: CreateCommunityDto,
  ): Promise<CommunityEntity> {
    const slug = dto.slug.toLowerCase().trim();
    if (this.communities.has(slug)) {
      throw new ConflictException(`Community with slug '${slug}' already exists.`);
    }

    const communityId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const community: CommunityEntity = {
      id: communityId,
      slug,
      title: dto.title.trim(),
      description: dto.description.trim(),
      bannerUrl: dto.bannerUrl || 'https://cdn.explorebharatsafar.in/guilds/default-banner.webp',
      iconUrl: dto.iconUrl || 'https://cdn.explorebharatsafar.in/guilds/default-icon.webp',
      creatorProfileId,
      rulesText: dto.rulesText.trim(),
      isVerified: false,
      memberCount: 1,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userRole: CommunityRole.LEADER,
    };

    this.communities.set(slug, community);

    // Creator is assigned LEADER role automatically
    const leaderMembership: CommunityMemberEntity = {
      communityId,
      profileId: creatorProfileId,
      role: CommunityRole.LEADER,
      joinedAt: new Date().toISOString(),
    };
    this.memberships.set(`${communityId}:${creatorProfileId}`, leaderMembership);

    this.logger.log(`Created community '${community.title}' (${slug}) by ${creatorProfileId}`);
    return community;
  }

  /**
   * Retrieves communities with optional name/description filter.
   */
  async getCommunities(query?: string): Promise<CommunityEntity[]> {
    let list = Array.from(this.communities.values());
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.slug.includes(q),
      );
    }
    return list;
  }

  /**
   * Retrieves community by slug.
   */
  async getCommunityBySlug(slug: string, viewerProfileId?: string): Promise<CommunityEntity> {
    const community = this.communities.get(slug.toLowerCase());
    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found.`);
    }

    let userRole: CommunityRole | undefined;
    if (viewerProfileId) {
      const membership = this.memberships.get(`${community.id}:${viewerProfileId}`);
      userRole = membership?.role;
    }

    return {
      ...community,
      userRole,
    };
  }

  /**
   * Join a community.
   */
  async joinCommunity(profileId: string, slug: string): Promise<void> {
    const community = this.communities.get(slug.toLowerCase());
    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found.`);
    }

    const key = `${community.id}:${profileId}`;
    if (this.memberships.has(key)) {
      return; // Already a member
    }

    const member: CommunityMemberEntity = {
      communityId: community.id,
      profileId,
      role: CommunityRole.MEMBER,
      joinedAt: new Date().toISOString(),
    };

    this.memberships.set(key, member);
    community.memberCount += 1;
    community.updatedAt = new Date().toISOString();
    this.communities.set(slug.toLowerCase(), community);

    this.logger.log(`User ${profileId} joined community '${community.title}'`);
  }

  /**
   * Leave a community.
   */
  async leaveCommunity(profileId: string, slug: string): Promise<void> {
    const community = this.communities.get(slug.toLowerCase());
    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found.`);
    }

    const key = `${community.id}:${profileId}`;
    const membership = this.memberships.get(key);
    if (!membership) {
      return;
    }

    if (membership.role === CommunityRole.LEADER && community.memberCount === 1) {
      throw new BadRequestException(
        'Community creator cannot leave while they are the sole remaining leader.',
      );
    }

    this.memberships.delete(key);
    community.memberCount = Math.max(0, community.memberCount - 1);
    community.updatedAt = new Date().toISOString();
    this.communities.set(slug.toLowerCase(), community);

    this.logger.log(`User ${profileId} left community '${community.title}'`);
  }

  /**
   * Updates a community member's role (LEADER / MODERATOR / MEMBER).
   * Only permitted by a community LEADER.
   */
  async updateMemberRole(
    requesterProfileId: string,
    slug: string,
    targetProfileId: string,
    newRole: CommunityRole,
  ): Promise<void> {
    const community = this.communities.get(slug.toLowerCase());
    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found.`);
    }

    const requesterKey = `${community.id}:${requesterProfileId}`;
    const requesterMembership = this.memberships.get(requesterKey);

    if (!requesterMembership || requesterMembership.role !== CommunityRole.LEADER) {
      throw new ForbiddenException('Only community leaders can modify member roles.');
    }

    const targetKey = `${community.id}:${targetProfileId}`;
    const targetMembership = this.memberships.get(targetKey);
    if (!targetMembership) {
      throw new NotFoundException('Target user is not a member of this community.');
    }

    targetMembership.role = newRole;
    this.memberships.set(targetKey, targetMembership);
    this.logger.log(
      `Updated role of ${targetProfileId} in community '${community.title}' to ${newRole}`,
    );
  }

  /**
   * Retrieves community discussion posts.
   */
  async getCommunityPosts(
    slug: string,
    _viewerProfileId?: string,
    limit = 20,
  ): Promise<PostEntity[]> {
    const community = this.communities.get(slug.toLowerCase());
    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found.`);
    }

    // Return posts that mention or tag this community slug as a hashtag or title
    const allPosts = this.postsService.getAllActivePosts();
    const communitySlugKeyword = community.slug.replace(/-/g, '_');
    const matchedPosts = allPosts.filter(
      p =>
        p.hashtags.includes(communitySlugKeyword) ||
        p.hashtags.includes('western_ghats') ||
        p.hashtags.includes('sahyadri'),
    );

    matchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matchedPosts.slice(0, limit);
  }

  private seedInitialCommunities(): void {
    const c1: CommunityEntity = {
      id: 'comm_sahyadri_001',
      slug: 'western-ghats-monsoon-trekkers',
      title: 'Western Ghats Monsoon Trekkers Collective',
      description:
        'Community dedicated to offbeat Sahyadri escarpments, historic Maratha fort bastions, waterfall rappelling, and Leave-No-Trace mountaineering.',
      bannerUrl: 'https://cdn.explorebharatsafar.in/guilds/sahyadri-banner.webp',
      iconUrl: 'https://cdn.explorebharatsafar.in/guilds/sahyadri-icon.webp',
      creatorProfileId: 'prof_amitabh_001',
      rulesText:
        '1. Respect indigenous village settlements.\n2. Strictly zero plastic and zero trash on trails.\n3. Verify weather alerts before high-ridge treks.',
      isVerified: true,
      memberCount: 840,
      postCount: 112,
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z',
    };

    const c2: CommunityEntity = {
      id: 'comm_heritage_002',
      slug: 'ancient-temple-architecture-guild',
      title: 'Ancient Temple Architecture & Inscriptions Guild',
      description:
        'Epigraphers, historians, and heritage travellers documenting Hemadpanthi stone temples, rock-cut cave complexes, and stepwells.',
      bannerUrl: 'https://cdn.explorebharatsafar.in/guilds/temple-banner.webp',
      iconUrl: 'https://cdn.explorebharatsafar.in/guilds/temple-icon.webp',
      creatorProfileId: 'prof_pooja_002',
      rulesText:
        '1. Never deface or touch ancient epigraphic inscriptions.\n2. Cite historical references where possible.\n3. Share precise cadastral coordinates with care.',
      isVerified: true,
      memberCount: 520,
      postCount: 68,
      createdAt: '2026-06-15T12:00:00.000Z',
      updatedAt: '2026-06-15T12:00:00.000Z',
    };

    this.communities.set(c1.slug, c1);
    this.communities.set(c2.slug, c2);

    this.memberships.set(`${c1.id}:prof_amitabh_001`, {
      communityId: c1.id,
      profileId: 'prof_amitabh_001',
      role: CommunityRole.LEADER,
      joinedAt: c1.createdAt,
    });
    this.memberships.set(`${c2.id}:prof_pooja_002`, {
      communityId: c2.id,
      profileId: 'prof_pooja_002',
      role: CommunityRole.LEADER,
      joinedAt: c2.createdAt,
    });
  }
}
