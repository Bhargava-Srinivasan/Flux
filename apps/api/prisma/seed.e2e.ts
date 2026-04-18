import { PrismaClient } from '@prisma/client';
import { RoleName } from '../src/common/enums/permissions.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding E2E Test Data...');

  // 1. Create Test User
  const email = 'test@demo.com';
  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name: 'Test User',
    },
  });

  // 2. Create Organization
  const orgSlug = 'test-org-e2e';
  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: {},
    create: {
      name: 'Test Org E2E',
      slug: orgSlug,
      ownerId: user.id,
    },
  });

  // 3. Ensure Owner Role exists and assign to Org
  const ownerRole = await prisma.role.findUnique({ where: { name: RoleName.OWNER } });
  if (ownerRole) {
    // Upsert membership
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, organizationId: org.id, workspaceId: null },
    });

    if (!membership) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          roleId: ownerRole.id,
          workspaceId: null,
        },
      });
    }
  }

  // 4. Create Workspace
  const wsSlug = 'test-ws-e2e';
  const workspace = await prisma.workspace.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: wsSlug,
      },
    },
    update: {},
    create: {
      name: 'Test Workspace E2E',
      slug: wsSlug,
      organizationId: org.id,
    },
  });

  // Assign Owner to Workspace
  if (ownerRole) {
    const wsMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!wsMembership) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          workspaceId: workspace.id,
          roleId: ownerRole.id,
        },
      });
    }
  }

  console.log('E2E Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
