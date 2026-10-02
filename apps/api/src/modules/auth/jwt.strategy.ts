import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, UserRole, Permission, ROLE_PERMISSIONS_MAP } from '@ebs/types';
import { prisma } from '@ebs/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'ebs_super_secure_jwt_dev_secret_key_minimum_32_characters_long',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_MALFORMED_TOKEN',
        message: 'Malformed token payload structure.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        profile: true,
        assignedVillages: { select: { id: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_USER_INACTIVE',
        message: 'Account is deactivated, suspended, locked, or does not exist.',
      });
    }

    const roles = user.userRoles.map(ur => ur.role.code as UserRole);

    // Compute effective permissions for RBAC checks
    const permissionsSet = new Set<Permission>();
    for (const role of roles) {
      const perms = ROLE_PERMISSIONS_MAP[role] || [];
      for (const p of perms) {
        permissionsSet.add(p);
      }
    }

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber || undefined,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      isPhoneVerified: Boolean(user.phoneVerifiedAt),
      status: user.status,
      roles,
      permissions: Array.from(permissionsSet),
      assignedVillageId: user.assignedVillages?.[0]?.id || payload.assignedVillageId,
      fullName: user.profile?.displayName,
      sessionId: payload.sessionId,
    };
  }
}
