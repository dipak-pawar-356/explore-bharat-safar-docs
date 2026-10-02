// Explore Bharat Safar — Section 4: Traveller Profile & Identity Domain Service
// Reference: EBS-DOC-15-SOCIAL Section 2, EBS-BLU-44-SOC Section 1, EBS-DOC-40-SECURITY

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  AdventureGrade,
  BadgeType,
  type TravellerProfileEntity,
  type TravellerProfileSummary,
} from '@ebs/types';
import { UpdateProfileDto } from '../dto/social.dto';

@Injectable()
export class SocialProfileService {
  private readonly logger = new Logger(SocialProfileService.name);

  // In-memory persistent registry for profiles
  private readonly profiles = new Map<string, TravellerProfileEntity>();
  private readonly usernameIndex = new Map<string, string>(); // username -> profileId
  private readonly userIndex = new Map<string, string>(); // userId -> profileId

  constructor() {
    this.seedInitialProfiles();
  }

  /**
   * Retrieves profile by unique alphanumeric @username.
   */
  async getProfileByUsername(
    username: string,
    viewerProfileId?: string,
  ): Promise<TravellerProfileEntity> {
    const profileId = this.usernameIndex.get(username.toLowerCase());
    if (!profileId) {
      throw new NotFoundException(`Traveller profile @${username} not found.`);
    }
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new NotFoundException(`Traveller profile @${username} not found.`);
    }

    return this.sanitizeProfileForViewer(profile, viewerProfileId);
  }

  /**
   * Retrieves profile by profile UUID.
   */
  async getProfileById(
    profileId: string,
    viewerProfileId?: string,
  ): Promise<TravellerProfileEntity> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new NotFoundException(`Traveller profile ${profileId} not found.`);
    }

    return this.sanitizeProfileForViewer(profile, viewerProfileId);
  }

  /**
   * Resolves or provisions a profile for an authenticated User.
   */
  async getOrCreateProfileForUser(
    userId: string,
    fallbackUsername?: string,
    fallbackDisplayName?: string,
  ): Promise<TravellerProfileEntity> {
    const existingProfileId = this.userIndex.get(userId);
    if (existingProfileId) {
      const existing = this.profiles.get(existingProfileId);
      if (existing) return existing;
    }

    const username = (fallbackUsername || `explorer_${userId.substring(0, 8)}`).toLowerCase();
    const displayName = fallbackDisplayName || 'Sovereign Explorer';

    const newProfile: TravellerProfileEntity = {
      id: `prof_${userId}`,
      userId,
      username,
      displayName,
      bio: 'Sovereign explorer navigating the ancient trails and rural heritage of Bharat.',
      avatarUrl: `https://cdn.explorebharatsafar.in/avatars/${username}.webp`,
      coverImageUrl: 'https://cdn.explorebharatsafar.in/banners/western-ghats.webp',
      homeState: 'Maharashtra',
      homeCity: 'Pune',
      spokenLanguages: ['Hindi', 'English'],
      adventureGrade: AdventureGrade.EXPLORER,
      badges: [BadgeType.SOVEREIGN_EXPLORER],
      visitedStatesCount: 3,
      visitedDistrictsCount: 8,
      completedExpeditionsCount: 4,
      totalElevationMeters: 4850,
      followersCount: 0,
      followingCount: 0,
      isProfilePublic: true,
      isSoloDiscoveryEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(newProfile.id, newProfile);
    this.usernameIndex.set(newProfile.username.toLowerCase(), newProfile.id);
    this.userIndex.set(userId, newProfile.id);

    this.logger.log(`Provisioned new traveller profile @${newProfile.username} (${newProfile.id})`);
    return newProfile;
  }

  /**
   * Updates traveller profile settings.
   */
  async updateProfile(profileId: string, dto: UpdateProfileDto): Promise<TravellerProfileEntity> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new NotFoundException(`Traveller profile ${profileId} not found.`);
    }

    if (dto.displayName !== undefined) profile.displayName = dto.displayName.trim();
    if (dto.bio !== undefined) profile.bio = dto.bio.trim();
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl;
    if (dto.coverImageUrl !== undefined) profile.coverImageUrl = dto.coverImageUrl;
    if (dto.homeState !== undefined) profile.homeState = dto.homeState.trim();
    if (dto.homeCity !== undefined) profile.homeCity = dto.homeCity.trim();
    if (dto.spokenLanguages !== undefined) profile.spokenLanguages = dto.spokenLanguages;
    if (dto.isProfilePublic !== undefined) profile.isProfilePublic = dto.isProfilePublic;
    if (dto.isSoloDiscoveryEnabled !== undefined)
      profile.isSoloDiscoveryEnabled = dto.isSoloDiscoveryEnabled;

    profile.updatedAt = new Date().toISOString();
    profile.badges = this.calculateBadges(profile);
    profile.adventureGrade = this.calculateAdventureGrade(profile);

    this.profiles.set(profile.id, profile);
    return profile;
  }

  /**
   * Search profiles by query string.
   */
  async searchProfiles(
    query: string,
    grade?: AdventureGrade,
    state?: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: TravellerProfileSummary[]; total: number }> {
    const q = query.toLowerCase().trim();
    const matches = Array.from(this.profiles.values()).filter(p => {
      const nameMatch =
        p.displayName.toLowerCase().includes(q) || p.username.toLowerCase().includes(q);
      const gradeMatch = grade ? p.adventureGrade === grade : true;
      const stateMatch = state ? p.homeState?.toLowerCase() === state.toLowerCase() : true;
      return nameMatch && gradeMatch && stateMatch;
    });

    const total = matches.length;
    const start = (page - 1) * limit;
    const paginated = matches.slice(start, start + limit);

    return {
      items: paginated.map(p => this.toSummary(p)),
      total,
    };
  }

  /**
   * Converts full profile to lightweight summary.
   */
  toSummary(profile: TravellerProfileEntity): TravellerProfileSummary {
    return {
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      adventureGrade: profile.adventureGrade,
    };
  }

  /**
   * Adjusts follower and following counters atomically.
   */
  adjustCounters(profileId: string, followersDelta: number, followingDelta: number): void {
    const profile = this.profiles.get(profileId);
    if (!profile) return;
    profile.followersCount = Math.max(0, profile.followersCount + followersDelta);
    profile.followingCount = Math.max(0, profile.followingCount + followingDelta);
    profile.updatedAt = new Date().toISOString();
    this.profiles.set(profileId, profile);
  }

  /**
   * Calculates badges based on verified achievements.
   */
  calculateBadges(profile: TravellerProfileEntity): BadgeType[] {
    const badges: BadgeType[] = [];
    if (profile.visitedStatesCount >= 5) {
      badges.push(BadgeType.SOVEREIGN_EXPLORER);
    }
    if (profile.completedExpeditionsCount >= 5) {
      badges.push(BadgeType.SAHYADRI_SENTINEL);
    }
    if (profile.totalElevationMeters >= 4000) {
      badges.push(BadgeType.HIMALAYAN_WANDERER);
    }
    if (profile.visitedDistrictsCount >= 10) {
      badges.push(BadgeType.HERITAGE_CUSTODIAN);
    }
    return badges;
  }

  /**
   * Calculates adventure grade.
   */
  calculateAdventureGrade(
    profile: Pick<TravellerProfileEntity, 'completedExpeditionsCount' | 'totalElevationMeters'>,
  ): AdventureGrade {
    if (profile.completedExpeditionsCount >= 20 || profile.totalElevationMeters >= 15000) {
      return AdventureGrade.EXPEDITION_LEADER;
    }
    if (profile.completedExpeditionsCount >= 10 || profile.totalElevationMeters >= 8000) {
      return AdventureGrade.SUMMITEER;
    }
    if (profile.completedExpeditionsCount >= 5 || profile.totalElevationMeters >= 4000) {
      return AdventureGrade.PATHFINDER;
    }
    if (profile.completedExpeditionsCount >= 2) {
      return AdventureGrade.EXPLORER;
    }
    return AdventureGrade.ROOKIE;
  }

  /**
   * Strips private fields if profile is private and viewer is not the owner.
   */
  private sanitizeProfileForViewer(
    profile: TravellerProfileEntity,
    viewerProfileId?: string,
  ): TravellerProfileEntity {
    const isOwner = viewerProfileId === profile.id;
    if (isOwner || profile.isProfilePublic) {
      return { ...profile };
    }

    // Mask details for private accounts
    return {
      ...profile,
      bio: 'This account is private. Follow to view their journeys.',
      coverImageUrl: undefined,
      homeCity: undefined,
      spokenLanguages: [],
      visitedDistrictsCount: 0,
      totalElevationMeters: 0,
    };
  }

  private seedInitialProfiles(): void {
    const p1: TravellerProfileEntity = {
      id: 'prof_amitabh_001',
      userId: 'usr_traveller_sprint2_001',
      username: 'amitabh_sharma',
      displayName: 'Amitabh Sharma',
      bio: 'High-altitude mountaineer and Western Ghats explorer. Passionate about ancient stepwells and monsoon ridge treks.',
      avatarUrl: 'https://cdn.explorebharatsafar.in/avatars/amitabh.webp',
      coverImageUrl: 'https://cdn.explorebharatsafar.in/banners/harishchandragad.webp',
      homeState: 'Maharashtra',
      homeCity: 'Pune',
      spokenLanguages: ['Marathi', 'Hindi', 'English'],
      adventureGrade: AdventureGrade.PATHFINDER,
      badges: [BadgeType.SOVEREIGN_EXPLORER, BadgeType.SAHYADRI_SENTINEL],
      visitedStatesCount: 7,
      visitedDistrictsCount: 16,
      completedExpeditionsCount: 12,
      totalElevationMeters: 9420,
      followersCount: 142,
      followingCount: 38,
      isProfilePublic: true,
      isSoloDiscoveryEnabled: true,
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: '2026-07-01T08:00:00.000Z',
    };

    const p2: TravellerProfileEntity = {
      id: 'prof_pooja_002',
      userId: 'usr_traveller_sprint2_002',
      username: 'pooja_deshmukh',
      displayName: 'Pooja Deshmukh',
      bio: 'Heritage architecture enthusiast & solo backpacker exploring tribal art and sacred groves.',
      avatarUrl: 'https://cdn.explorebharatsafar.in/avatars/pooja.webp',
      coverImageUrl: 'https://cdn.explorebharatsafar.in/banners/konkan.webp',
      homeState: 'Maharashtra',
      homeCity: 'Mumbai',
      spokenLanguages: ['Marathi', 'Hindi'],
      adventureGrade: AdventureGrade.EXPLORER,
      badges: [BadgeType.HERITAGE_CUSTODIAN],
      visitedStatesCount: 4,
      visitedDistrictsCount: 9,
      completedExpeditionsCount: 5,
      totalElevationMeters: 3200,
      followersCount: 89,
      followingCount: 64,
      isProfilePublic: false, // Private account
      isSoloDiscoveryEnabled: false,
      createdAt: '2026-07-15T10:00:00.000Z',
      updatedAt: '2026-07-15T10:00:00.000Z',
    };

    this.profiles.set(p1.id, p1);
    this.profiles.set(p2.id, p2);
    this.usernameIndex.set(p1.username.toLowerCase(), p1.id);
    this.usernameIndex.set(p2.username.toLowerCase(), p2.id);
    this.userIndex.set(p1.userId, p1.id);
    this.userIndex.set(p2.userId, p2.id);
  }
}
