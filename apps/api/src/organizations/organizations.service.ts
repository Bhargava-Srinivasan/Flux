import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RoleName } from '../common/enums/permissions.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    // Check if userId is present (it should be, via Guard)
    if (!userId) throw new ForbiddenException('User ID required');

    try {
      const org = await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          ownerId: userId,
        },
      });

      // Get OWNER Role ID
      const ownerRole = await this.prisma.role.findUnique({
        where: { name: RoleName.OWNER },
      });

      if (!ownerRole) throw new Error('OWNER Role not found in database. Seed required.');

      // Create an Org-level membership for the owner.
      await this.prisma.membership.create({
        data: {
          roleId: ownerRole.id,
          userId: userId,
          organizationId: org.id,
          workspaceId: null,
        },
      });

      return org;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Slug already exists');
        }
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    if (!userId) return []; // Should not happen with AuthGuard

    return this.prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            memberships: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: { workspaces: true, memberships: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async invite(_userId: string, _orgId: string, email: string) {
    // RBAC already checked by Guard
    return { message: `Invitation sent to ${email}` };
  }
}
