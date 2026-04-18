import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RoleName, Permission } from '../enums/permissions.enum';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // The JwtStrategy returns { userId: string, email: string }
    // So we must use request.user.userId
    const userId = request.user?.userId;

    if (!userId) {
      return false;
    }

    // Determine context (Organization or Workspace)
    let contextOrgId = request.body?.organizationId || request.query?.organizationId;
    let contextWorkspaceId = request.body?.workspaceId || request.query?.workspaceId;

    if (request.params?.id) {
      if (request.baseUrl?.includes('/organizations')) {
        contextOrgId = request.params.id;
      } else if (request.baseUrl?.includes('/workspaces')) {
        contextWorkspaceId = request.params.id;
      }
    }

    if (!contextOrgId && !contextWorkspaceId) {
      // Log this for debugging
      // console.warn('RBAC: No context found for user ' + userId);
      return false;
    }

    let membership = null;

    if (contextWorkspaceId) {
      // Workspace Context
      membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: contextWorkspaceId,
          },
        },
        include: { role: { include: { permissions: true } } },
      });

      if (!membership) {
        // Check Org Owner (Inheritance)
        const workspace = await this.prisma.workspace.findUnique({
          where: { id: contextWorkspaceId },
          select: { organizationId: true },
        });

        if (workspace) {
          const orgOwnerMembership = await this.prisma.membership.findFirst({
            where: {
              userId,
              organizationId: workspace.organizationId,
              workspaceId: null, // Org-level membership
              role: { name: RoleName.OWNER },
            },
            include: { role: { include: { permissions: true } } },
          });
          if (orgOwnerMembership) {
            membership = orgOwnerMembership;
          }
        }
      }
    } else if (contextOrgId) {
      // Organization Context
      membership = await this.prisma.membership.findFirst({
        where: {
          userId,
          organizationId: contextOrgId,
          workspaceId: null,
        },
        include: { role: { include: { permissions: true } } },
      });
    }

    if (!membership) {
      throw new ForbiddenException('Access Denied: No membership found');
    }

    // 1. OWNER Bypass
    if (membership.role.name === RoleName.OWNER) return true;

    // 2. Check Specific Roles
    if (requiredRoles) {
      if (requiredRoles.includes(membership.role.name as RoleName)) return true;
    }

    // 3. Check Permissions
    if (requiredPermissions) {
      const userPermissions = membership.role.permissions.map((p) => p.name);
      const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));
      if (hasPermission) return true;
    }

    return false;
  }
}
