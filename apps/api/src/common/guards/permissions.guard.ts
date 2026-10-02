import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, UserRole, ROLE_PERMISSIONS_MAP } from '@ebs/types';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.roles && !user.permissions)) {
      throw new ForbiddenException({
        errorCode: 'EBS_PERM_DENIED',
        message: 'Access denied: Authentication required for permission-protected route.',
      });
    }

    // Super Admin has universal access
    if (user.roles && user.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // Compute effective permissions combining explicit permissions and role-mapped permissions
    const userPermissions = new Set<string>(user.permissions || []);

    if (user.roles && Array.isArray(user.roles)) {
      for (const role of user.roles as UserRole[]) {
        const rolePerms = ROLE_PERMISSIONS_MAP[role] || [];
        for (const perm of rolePerms) {
          userPermissions.add(perm);
        }
      }
    }

    const hasAllPermissions = requiredPermissions.every(perm => userPermissions.has(perm));
    if (!hasAllPermissions) {
      throw new ForbiddenException({
        errorCode: 'EBS_PERM_DENIED',
        message: `Access denied: Missing required permissions [${requiredPermissions.join(', ')}].`,
      });
    }

    return true;
  }
}
