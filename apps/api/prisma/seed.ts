import { PrismaClient } from '@prisma/client';
import { Permission, RoleName } from '../src/common/enums/permissions.enum';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RBAC Roles and Permissions...');

  // 1. Create Permissions
  const permissions = Object.values(Permission);

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
  }

  // 2. Create Roles with mapped Permissions
  const rolePermissions = {
    [RoleName.OWNER]: permissions, // Full Access
    [RoleName.ADMIN]: permissions.filter((p) => p !== Permission.ORG_DELETE), // All except Org Delete
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
    const rolePerms = rolePermissions[roleName] || [];

    // Create Role
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    // Assign Permissions
    // This is tricky with upsert, easier to just connect/disconnect or recreate relations.
    // Let's disconnect all existing permissions and connect new ones to ensure sync.
    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: [], // Clear existing
          connect: rolePerms.map((p) => ({ name: p })),
        },
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
