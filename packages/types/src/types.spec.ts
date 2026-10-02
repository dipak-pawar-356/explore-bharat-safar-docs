// Explore Bharat Safar — Shared Contracts Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserRole,
  AccountStatus,
  Permission,
  ROLE_PERMISSIONS_MAP,
  DiscoveryHierarchyLevel,
  StandardCategorySlug,
  ModerationStatus,
  PaymentGatewayProvider,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  LedgerAccountType,
  LedgerEntryType,
  RefundStatus,
  CertificateStatus,
  ParticipantCompletionStatus,
  BatchCompletionStatus,
  CertificateActionType,
  AdventureGrade,
  BadgeType,
  PostVisibility,
  PostType,
  PostStatus,
  FollowRequestStatus,
  CommunityRole,
  MediaType,
  SocialActionType,
} from './index';

describe('Shared Contracts & Enums', () => {
  it('should define all 10 standard user roles', () => {
    assert.equal(UserRole.SUPER_ADMIN, 'SUPER_ADMIN');
    assert.equal(UserRole.SYSTEM_ADMIN, 'SYSTEM_ADMIN');
    assert.equal(UserRole.TRAVELLER, 'TRAVELLER');
    assert.equal(UserRole.VILLAGE_ADMIN, 'VILLAGE_ADMIN');
    assert.equal(UserRole.BOOKING_ADMIN, 'BOOKING_ADMIN');
    assert.equal(UserRole.FINANCE_ADMIN, 'FINANCE_ADMIN');
    assert.equal(UserRole.MODERATOR, 'MODERATOR');
    assert.equal(UserRole.CONTENT_EDITOR, 'CONTENT_EDITOR');
    assert.equal(UserRole.LOCAL_GUIDE, 'LOCAL_GUIDE');
    assert.equal(UserRole.GUEST, 'GUEST');
  });

  it('should define all AccountStatus values', () => {
    assert.equal(AccountStatus.ACTIVE, 'ACTIVE');
    assert.equal(AccountStatus.SUSPENDED, 'SUSPENDED');
    assert.equal(AccountStatus.LOCKED, 'LOCKED');
    assert.equal(AccountStatus.PENDING_VERIFICATION, 'PENDING_VERIFICATION');
  });

  it('should define role-permission matrix mapping correctly', () => {
    assert.ok(ROLE_PERMISSIONS_MAP[UserRole.SUPER_ADMIN].includes(Permission.ADMIN_ALL));
    assert.ok(ROLE_PERMISSIONS_MAP[UserRole.TRAVELLER].includes(Permission.BOOKING_CREATE));
    assert.ok(
      ROLE_PERMISSIONS_MAP[UserRole.VILLAGE_ADMIN].includes(Permission.VILLAGE_WRITE_SCOPED),
    );
    assert.ok(ROLE_PERMISSIONS_MAP[UserRole.FINANCE_ADMIN].includes(Permission.PAYMENT_REFUND));
    assert.ok(
      ROLE_PERMISSIONS_MAP[UserRole.BOOKING_ADMIN].includes(Permission.BOOKING_VERIFY_ATTENDANCE),
    );
    assert.ok(ROLE_PERMISSIONS_MAP[UserRole.MODERATOR].includes(Permission.VILLAGE_APPROVE));
    assert.ok(!ROLE_PERMISSIONS_MAP[UserRole.GUEST].includes(Permission.BOOKING_CREATE));
  });

  it('should define DiscoveryHierarchyLevel geographic tiers', () => {
    assert.equal(DiscoveryHierarchyLevel.NATIONAL, 'NATIONAL');
    assert.equal(DiscoveryHierarchyLevel.STATE, 'STATE');
    assert.equal(DiscoveryHierarchyLevel.DISTRICT, 'DISTRICT');
    assert.equal(DiscoveryHierarchyLevel.TALUKA, 'TALUKA');
    assert.equal(DiscoveryHierarchyLevel.PLACE, 'PLACE');
  });

  it('should define standard category slugs', () => {
    assert.equal(StandardCategorySlug.FORT, 'fort');
    assert.equal(StandardCategorySlug.TEMPLE, 'temple');
    assert.equal(StandardCategorySlug.UNESCO_SITE, 'unesco-site');
    assert.equal(StandardCategorySlug.WATERFALL, 'waterfall');
    assert.equal(StandardCategorySlug.CAVE, 'cave');
    assert.equal(StandardCategorySlug.WILDLIFE, 'wildlife');
    assert.equal(StandardCategorySlug.HIDDEN_GEM, 'hidden-gem');
  });

  it('should validate ModerationStatus enum', () => {
    assert.equal(ModerationStatus.DRAFT, 'DRAFT');
    assert.equal(ModerationStatus.PENDING_APPROVAL, 'PENDING_APPROVAL');
    assert.equal(ModerationStatus.APPROVED, 'APPROVED');
    assert.equal(ModerationStatus.REJECTED, 'REJECTED');
    assert.equal(ModerationStatus.PUBLISHED, 'PUBLISHED');
  });

  it('should validate Payment & FinTech enums for Section 3', () => {
    assert.equal(PaymentGatewayProvider.RAZORPAY, 'RAZORPAY');
    assert.equal(PaymentGatewayProvider.CASHFREE, 'CASHFREE');
    assert.equal(PaymentGatewayProvider.MOCK_SANDBOX, 'MOCK_SANDBOX');

    assert.equal(PaymentMethod.UPI, 'UPI');
    assert.equal(PaymentMethod.CARD, 'CARD');
    assert.equal(PaymentMethod.NET_BANKING, 'NET_BANKING');

    assert.equal(TransactionType.ADVANCE_DEPOSIT, 'ADVANCE_DEPOSIT');
    assert.equal(TransactionType.CANCELLATION_REFUND, 'CANCELLATION_REFUND');

    assert.equal(TransactionStatus.INTENT_CREATED, 'INTENT_CREATED');
    assert.equal(TransactionStatus.SUCCESS, 'SUCCESS');
    assert.equal(TransactionStatus.PARTIALLY_REFUNDED, 'PARTIALLY_REFUNDED');

    assert.equal(LedgerAccountType.GATEWAY_ESCROW, 'GATEWAY_ESCROW');
    assert.equal(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY, 'CUSTOMER_ADVANCE_LIABILITY');
    assert.equal(LedgerEntryType.DEBIT, 'DEBIT');
    assert.equal(LedgerEntryType.CREDIT, 'CREDIT');
    assert.equal(RefundStatus.SUCCEEDED, 'SUCCEEDED');
  });

  it('should validate Certificate enums for Section 3 (EBS-DOC-20-CERT)', () => {
    assert.equal(CertificateStatus.ISSUED, 'ISSUED');
    assert.equal(CertificateStatus.REVOKED, 'REVOKED');
    assert.equal(CertificateStatus.REISSUED, 'REISSUED');

    assert.equal(ParticipantCompletionStatus.COMPLETED, 'COMPLETED');
    assert.equal(ParticipantCompletionStatus.ABSENT, 'ABSENT');
    assert.equal(ParticipantCompletionStatus.DROPPED_OUT, 'DROPPED_OUT');
    assert.equal(ParticipantCompletionStatus.CANCELLED, 'CANCELLED');

    assert.equal(BatchCompletionStatus.ACTIVE, 'ACTIVE');
    assert.equal(BatchCompletionStatus.IN_PROGRESS, 'IN_PROGRESS');
    assert.equal(BatchCompletionStatus.COMPLETED, 'COMPLETED');
    assert.equal(BatchCompletionStatus.CANCELLED, 'CANCELLED');

    assert.equal(CertificateActionType.MINTED, 'MINTED');
    assert.equal(CertificateActionType.DOWNLOADED, 'DOWNLOADED');
    assert.equal(CertificateActionType.VERIFIED, 'VERIFIED');
    assert.equal(CertificateActionType.REVOKED, 'REVOKED');
    assert.equal(CertificateActionType.REISSUED, 'REISSUED');
  });

  it('should validate Social platform enums for Section 4 (EBS-DOC-15-SOCIAL)', () => {
    assert.equal(AdventureGrade.ROOKIE, 'ROOKIE');
    assert.equal(AdventureGrade.EXPLORER, 'EXPLORER');
    assert.equal(AdventureGrade.PATHFINDER, 'PATHFINDER');
    assert.equal(AdventureGrade.SUMMITEER, 'SUMMITEER');
    assert.equal(AdventureGrade.EXPEDITION_LEADER, 'EXPEDITION_LEADER');

    assert.equal(BadgeType.SOVEREIGN_EXPLORER, 'SOVEREIGN_EXPLORER');
    assert.equal(BadgeType.SAHYADRI_SENTINEL, 'SAHYADRI_SENTINEL');
    assert.equal(BadgeType.HIMALAYAN_WANDERER, 'HIMALAYAN_WANDERER');

    assert.equal(PostVisibility.PUBLIC, 'PUBLIC');
    assert.equal(PostVisibility.FOLLOWERS_ONLY, 'FOLLOWERS_ONLY');
    assert.equal(PostVisibility.COMMUNITY_ONLY, 'COMMUNITY_ONLY');
    assert.equal(PostVisibility.PRIVATE, 'PRIVATE');

    assert.equal(PostType.EXPEDITION_JOURNAL, 'EXPEDITION_JOURNAL');
    assert.equal(PostType.PHOTO_SHOWCASE, 'PHOTO_SHOWCASE');
    assert.equal(PostType.TRAIL_ADVISORY, 'TRAIL_ADVISORY');
    assert.equal(PostType.QA, 'QA');

    assert.equal(PostStatus.DRAFT, 'DRAFT');
    assert.equal(PostStatus.PUBLISHED, 'PUBLISHED');
    assert.equal(PostStatus.ARCHIVED, 'ARCHIVED');

    assert.equal(FollowRequestStatus.PENDING, 'PENDING');
    assert.equal(FollowRequestStatus.ACCEPTED, 'ACCEPTED');
    assert.equal(FollowRequestStatus.REJECTED, 'REJECTED');

    assert.equal(CommunityRole.LEADER, 'LEADER');
    assert.equal(CommunityRole.MODERATOR, 'MODERATOR');
    assert.equal(CommunityRole.MEMBER, 'MEMBER');

    assert.equal(MediaType.IMAGE, 'IMAGE');
    assert.equal(MediaType.VIDEO, 'VIDEO');

    assert.equal(SocialActionType.POST_CREATE, 'POST_CREATE');
    assert.equal(SocialActionType.FOLLOW, 'FOLLOW');
    assert.equal(SocialActionType.BLOCK_USER, 'BLOCK_USER');
  });
});
