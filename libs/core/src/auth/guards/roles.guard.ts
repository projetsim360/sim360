import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  MANAGER: 2,
  MEMBER: 3,
  VIEWER: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Accès refusé');
    }

    const userLevel = ROLE_HIERARCHY[user.role as UserRole];
    if (userLevel === undefined) {
      throw new ForbiddenException('Accès refusé');
    }

    // User has access if their level is <= the minimum required level
    const minRequiredLevel = Math.max(...requiredRoles.map((r) => ROLE_HIERARCHY[r]));
    if (userLevel <= minRequiredLevel) {
      return true;
    }

    throw new ForbiddenException('Accès refusé : rôle insuffisant');
  }
}
