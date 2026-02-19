import { PrismaClient, UserRole, TenantPlan } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
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
    update: {},
    create: {
      email: 'admin@sim360.dev',
      passwordHash: hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'Sim360',
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log(`Admin user created: ${admin.email} (${admin.id})`);

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@sim360.dev' },
    update: {},
    create: {
      email: 'user@sim360.dev',
      passwordHash: hashPassword('User123!'),
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.MEMBER,
      tenantId: tenant.id,
      isActive: true,
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
