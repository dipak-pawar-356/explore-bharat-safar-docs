import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@ebs/types';
import { VILLAGE_SCOPED_KEY } from '../decorators/village-scoped.decorator';

@Injectable()
export class VillageScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramKey = this.reflector.getAllAndOverride<string>(VILLAGE_SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!paramKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        errorCode: 'EBS_PERM_DENIED',
        message: 'Authentication required for village tenancy checks.',
      });
    }

    // Super Admin and Moderator have multi-village governance access
    if (
      user.roles &&
      (user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes(UserRole.MODERATOR))
    ) {
      return true;
    }

    // If not Super Admin or Moderator, user MUST be a Village Admin
    if (!user.roles || !user.roles.includes(UserRole.VILLAGE_ADMIN)) {
      throw new ForbiddenException({
        errorCode: 'EBS_PERM_DENIED',
        message: 'Access denied: Village governance operations require VILLAGE_ADMIN role.',
      });
    }

    const targetVillageId =
      request.params?.[paramKey] || request.body?.[paramKey] || request.query?.[paramKey];

    if (!targetVillageId) {
      return true; // No target village in payload, let handler handle validation
    }

    // Prevent body payload tampering where body.villageId differs from route parameter
    const bodyVillageId =
      request.body?.villageId ||
      (request.body?.id !== targetVillageId ? request.body?.id : undefined);
    if (bodyVillageId && bodyVillageId !== targetVillageId) {
      throw new ForbiddenException({
        errorCode: 'EBS_TENANCY_VIOLATION',
        message: 'Access denied: Body payload village does not match route scope.',
      });
    }

    if (!user.assignedVillageId || user.assignedVillageId !== targetVillageId) {
      throw new ForbiddenException({
        errorCode: 'EBS_TENANCY_VIOLATION',
        message: 'Access denied: Village Administrator can only operate on their assigned village.',
      });
    }

    return true;
  }
}
