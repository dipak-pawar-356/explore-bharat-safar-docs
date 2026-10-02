import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full system access' },
    { code: 'SYSTEM_ADMIN', name: 'System Administrator', description: 'Administrative access' },
    {
      code: 'VILLAGE_ADMIN',
      name: 'Village Administrator',
      description: 'Village data management',
    },
    { code: 'BOOKING_ADMIN', name: 'Booking Administrator', description: 'Booking management' },
    { code: 'FINANCE_ADMIN', name: 'Finance Administrator', description: 'Financial operations' },
    { code: 'MODERATOR', name: 'Content Moderator', description: 'Content moderation' },
    { code: 'CONTENT_EDITOR', name: 'Content Editor', description: 'Content creation and editing' },
    { code: 'LOCAL_GUIDE', name: 'Local Guide', description: 'Local guide and tour operator' },
    { code: 'TRAVELLER', name: 'Traveller', description: 'Registered traveller' },
    { code: 'GUEST', name: 'Guest', description: 'Unauthenticated guest' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  console.info('[seed] Seeded roles:', roles.map(r => r.code).join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
