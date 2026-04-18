import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { RoleName } from '../common/enums/permissions.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    // RBAC: RolesGuard should have checked if userId has permission in Organization.
    // However, RolesGuard only checks if user has Role X in Org Y.
    // It doesn't strictly validate that Org Y exists, but implicit lookup does.

    // We still verify organization exists for foreign key.
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!org) throw new ForbiddenException('Organization not found');

    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          organizationId: dto.organizationId,
        },
      });

      const ownerRole = await this.prisma.role.findUnique({
        where: { name: RoleName.OWNER },
      });
      if (!ownerRole) throw new Error('OWNER Role not found');

      // Add creator as OWNER of the workspace
      await this.prisma.membership.create({
        data: {
          roleId: ownerRole.id,
          userId: userId,
          organizationId: dto.organizationId,
          workspaceId: workspace.id,
        },
      });

      return workspace;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Slug already exists in this organization');
        }
      }
      throw error;
    }
  }

  async findAll(userId: string, organizationId: string) {
    // RBAC Guard checks if user is MEMBER of Org.

    // List workspaces.
    // If user is Org Owner, return all.
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });

    if (org && org.ownerId === userId) {
      return this.prisma.workspace.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    // Otherwise, return workspaces where user has membership.
    return this.prisma.workspace.findMany({
      where: {
        organizationId,
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    if (workspace.organization.ownerId !== userId) {
      const membership = await this.prisma.membership.findFirst({
        where: {
          userId,
          OR: [{ workspaceId }, { organizationId: workspace.organizationId, workspaceId: null }],
        },
      });

      if (!membership) {
        throw new ForbiddenException('Access Denied');
      }
    }

    return workspace;
  }

  async addMember(requesterId: string, workspaceId: string, memberId: string, roleName: string) {
    // RBAC: Guard checks WORKSPACE_MANAGE_MEMBERS permission.

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { organization: true },
    });

    if (!workspace) throw new ForbiddenException('Workspace not found');

    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new ForbiddenException('Role not found');

    return this.prisma.membership.create({
      data: {
        userId: memberId,
        workspaceId: workspaceId,
        organizationId: workspace.organizationId,
        roleId: role.id,
      },
    });
  }
}
