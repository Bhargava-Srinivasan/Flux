import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Permission, RoleName } from '../common/enums/permissions.enum';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.ensureRbacSeedData();
  }

  private async ensureRbacSeedData() {
    const permissions = Object.values(Permission);

    await Promise.all(
      permissions.map((name) =>
        this.permission.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    const rolePermissions: Record<RoleName, Permission[]> = {
      [RoleName.OWNER]: permissions,
      [RoleName.ADMIN]: permissions.filter((permission) => permission !== Permission.ORG_DELETE),
      [RoleName.MEMBER]: [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_EDIT,
        Permission.TASK_CREATE,
        Permission.TASK_EDIT,
        Permission.TASK_ASSIGN,
        Permission.TASK_CHANGE_STATUS,
        Permission.COMMENT_CREATE,
        Permission.FILE_UPLOAD,
      ],
      [RoleName.GUEST]: [Permission.COMMENT_CREATE],
    };

    for (const roleName of Object.values(RoleName)) {
      const role = await this.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });

      await this.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            set: [],
            connect: rolePermissions[roleName].map((name) => ({ name })),
          },
        },
      });
    }
  }
}
