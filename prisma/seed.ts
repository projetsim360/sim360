import { PrismaClient, UserRole, TenantPlan } from '@prisma/client';
import bcryptjs from 'bcryptjs';
const { hashSync } = bcryptjs;

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hashSync(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'sim360-dev' },
    update: {},
    create: {
      name: 'Sim360 Dev',
      slug: 'sim360-dev',
      plan: TenantPlan.ENTERPRISE,
      isActive: true,
    },
  });

  console.log(`Tenant created: ${tenant.name} (${tenant.id})`);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sim360.dev' },
    update: {
      passwordHash: hashPassword('Admin123!'),
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
    create: {
      email: 'admin@sim360.dev',
      passwordHash: hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'Sim360',
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
  });

  console.log(`Admin user created: ${admin.email} (${admin.id})`);

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@sim360.dev' },
    update: {
      passwordHash: hashPassword('User123!'),
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
    create: {
      email: 'user@sim360.dev',
      passwordHash: hashPassword('User123!'),
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.MEMBER,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
  });

  console.log(`Test user created: ${user.email} (${user.id})`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
