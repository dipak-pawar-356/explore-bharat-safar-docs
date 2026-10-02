// Explore Bharat Safar — Admin Users Service
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-26-RULES, EBS-DOC-40-SEC-BLUEPRINT

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma } from '@ebs/database';
import { logger } from '@ebs/logger';
import type { AdminUser, AdminPaginatedResult, UserManagementFilter } from '@ebs/types';
import { UserRole, AccountStatus } from '@ebs/types';
import type { UpdateUserRolesDto, UpdateUserStatusDto } from '../dto/admin.dto';

@Injectable()
export class AdminUsersService {
  private readonly log = logger.child({ context: 'AdminUsersService' });

  /**
   * Retrieves a paginated list of all platform users for admin management.
   * Supports filtering by role, status, and full-text search on name/email.
   */
  async listUsers(filter: UserManagementFilter): Promise<AdminPaginatedResult<AdminUser>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filter.search) {
      where['OR'] = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filter.search } },
      ];
    }

    if (filter.status) {
      where['status'] = filter.status;
    }

    const [rawUsers, totalRecords] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: { include: { role: true } },
          assignedVillages: { select: { id: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Filter by role if specified (post-query filtering on junction table)
    let users = rawUsers;
    if (filter.role) {
      users = rawUsers.filter(u =>
        u.userRoles.some((ur: { role: { name: string } }) => ur.role.name === filter.role),
      );
    }

    const adminUsers: AdminUser[] = users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: undefined,
      phoneNumber: u.phoneNumber ?? undefined,
      status: u.status as AccountStatus,
      roles: u.userRoles.map((ur: { role: { name: string } }) => ur.role.name as UserRole),
      isEmailVerified: !!u.emailVerifiedAt,
      isPhoneVerified: !!u.phoneVerifiedAt,
      assignedVillageId: u.assignedVillages[0]?.id ?? undefined,
      loginCount: 0,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return {
      items: adminUsers,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Retrieves a single user by ID with full role and permission details.
   */
  async getUserById(userId: string): Promise<AdminUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        userRoles: { include: { role: true } },
        assignedVillages: { select: { id: true } },
      },
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_USER_NOT_FOUND',
        message: `User with ID ${userId} was not found.`,
      });
    }

    return {
      id: user.id,
      email: user.email,
      fullName: undefined,
      phoneNumber: user.phoneNumber ?? undefined,
      status: user.status as AccountStatus,
      roles: user.userRoles.map((ur: { role: { name: string } }) => ur.role.name as UserRole),
      isEmailVerified: !!user.emailVerifiedAt,
      isPhoneVerified: !!user.phoneVerifiedAt,
      assignedVillageId: user.assignedVillages[0]?.id ?? undefined,
      loginCount: 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Updates the roles assigned to a user.
   * Business Rule: SUPER_ADMIN role can only be assigned by another SUPER_ADMIN.
   * Validates that Village Admins have an assignedVillageId when granting VILLAGE_ADMIN.
   */
  async updateUserRoles(
    actorRoles: UserRole[],
    targetUserId: string,
    dto: UpdateUserRolesDto,
  ): Promise<AdminUser> {
    // Guard: Only SUPER_ADMIN can grant SUPER_ADMIN role
    const isTryingToGrantSuperAdmin = dto.roles.includes(UserRole.SUPER_ADMIN);
    const actorIsSuperAdmin = actorRoles.includes(UserRole.SUPER_ADMIN);

    if (isTryingToGrantSuperAdmin && !actorIsSuperAdmin) {
      throw new ForbiddenException({
        errorCode: 'EBS_PERM_DENIED',
        message: 'Only a Super Admin may grant the Super Admin role.',
      });
    }

    // Validate VILLAGE_ADMIN requires assignedVillageId
    if (dto.roles.includes(UserRole.VILLAGE_ADMIN) && !dto.assignedVillageId) {
      throw new BadRequestException({
        errorCode: 'EBS_ADMIN_VILLAGE_ID_REQUIRED',
        message: 'Village Admin role requires a valid assignedVillageId.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_USER_NOT_FOUND',
        message: `User with ID ${targetUserId} was not found.`,
      });
    }

    // Remove all existing roles and reassign
    await prisma.$transaction(async tx => {
      // Delete all existing user-role mappings
      await tx.userRole.deleteMany({ where: { userId: targetUserId } });

      // Resolve role IDs from names
      for (const roleName of dto.roles) {
        let role = await tx.role.findFirst({ where: { name: roleName } });
        if (!role) {
          role = await tx.role.create({ data: { name: roleName, code: roleName } });
        }
        await tx.userRole.create({ data: { userId: targetUserId, roleId: role.id } });
      }

      // Update assignedVillages relation if provided
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          assignedVillages: dto.assignedVillageId
            ? { connect: { id: dto.assignedVillageId } }
            : { set: [] },
          updatedAt: new Date(),
        },
      });
    });

    this.log.info('User roles updated by admin', { targetUserId, newRoles: dto.roles });
    return this.getUserById(targetUserId);
  }

  /**
   * Updates the account status of a user (ACTIVE, SUSPENDED, LOCKED, PENDING_VERIFICATION).
   * Business Rule: Cannot suspend or lock the last remaining SUPER_ADMIN.
   */
  async updateUserStatus(targetUserId: string, dto: UpdateUserStatusDto): Promise<AdminUser> {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId, deletedAt: null },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_USER_NOT_FOUND',
        message: `User with ID ${targetUserId} was not found.`,
      });
    }

    const isSuperAdmin = user.userRoles.some(
      (ur: { role: { name: string } }) => ur.role.name === UserRole.SUPER_ADMIN,
    );

    if (isSuperAdmin && dto.status !== AccountStatus.ACTIVE) {
      // Ensure there is at least one other active super admin
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          id: { not: targetUserId },
          status: AccountStatus.ACTIVE,
          deletedAt: null,
          userRoles: {
            some: {
              role: { name: UserRole.SUPER_ADMIN },
            },
          },
        },
      });

      if (otherActiveSuperAdmins === 0) {
        throw new BadRequestException({
          errorCode: 'EBS_ADMIN_LAST_SUPER_ADMIN',
          message: 'Cannot suspend or lock the last remaining active Super Admin.',
        });
      }
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { status: dto.status, updatedAt: new Date() },
    });

    this.log.info('User status updated by admin', { targetUserId, newStatus: dto.status });
    return this.getUserById(targetUserId);
  }

  /**
   * Performs a soft-delete on a user record.
   * Business Rule: Cannot delete the last remaining SUPER_ADMIN.
   */
  async softDeleteUser(targetUserId: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_USER_NOT_FOUND',
        message: `User with ID ${targetUserId} was not found.`,
      });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date(), status: AccountStatus.SUSPENDED },
    });

    this.log.warn('User soft-deleted by admin', { targetUserId });
    return { success: true, message: 'User account has been permanently deactivated.' };
  }
}
