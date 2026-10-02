// Explore Bharat Safar — Section 4: Identity-Social Domain Bridge Service
// Reference: EBS-BLU-49-REPO Section 7.2 & 10.1 (Architecture Boundaries & Decoupled Domain Integration)

import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@ebs/types';

export interface SocialUserIdentity {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface SocialUserSession {
  userId: string;
  email: string;
  role: UserRole;
  assignedVillageId?: string;
}

@Injectable()
export class IdentitySocialBridgeService {
  private readonly logger = new Logger(IdentitySocialBridgeService.name);

  private readonly users = new Map<string, SocialUserIdentity>();

  constructor() {
    this.seedInitialUsers();
  }

  /**
   * Registers a user in the local bridge cache.
   */
  registerUser(user: SocialUserIdentity): void {
    this.users.set(user.id, user);
  }

  /**
   * Resolves a user by their identity UUID.
   */
  getUser(userId: string): SocialUserIdentity | undefined {
    return this.users.get(userId);
  }

  /**
   * Verifies if a user exists and is active.
   */
  isUserActive(userId: string): boolean {
    const user = this.users.get(userId);
    return user ? user.isActive : false;
  }

  /**
   * Extracts user session profile for authentication validation.
   */
  getSessionProfile(userId: string): SocialUserSession | null {
    const user = this.users.get(userId);
    if (!user) return null;
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      assignedVillageId: undefined,
    };
  }

  private seedInitialUsers(): void {
    const defaultTraveller: SocialUserIdentity = {
      id: 'usr_traveller_sprint2_001',
      email: 'amitabh.sharma@example.com',
      fullName: 'Amitabh Sharma',
      role: UserRole.TRAVELLER,
      isActive: true,
    };
    const secondTraveller: SocialUserIdentity = {
      id: 'usr_traveller_sprint2_002',
      email: 'pooja.deshmukh@example.com',
      fullName: 'Pooja Deshmukh',
      role: UserRole.TRAVELLER,
      isActive: true,
    };
    const adminUser: SocialUserIdentity = {
      id: 'usr_admin_001',
      email: 'admin.sovereign@explorebharatsafar.in',
      fullName: 'Dr. Vikramaditya Joshi',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    };
    this.users.set(defaultTraveller.id, defaultTraveller);
    this.users.set(secondTraveller.id, secondTraveller);
    this.users.set(adminUser.id, adminUser);
  }
}
