import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create the "CARRY1 Sales Coach" coach
  const coach = await prisma.coach.upsert({
    where: { slug: 'carry1-sales-coach' },
    update: {},
    create: {
      name: 'CARRY1 Sales Coach',
      slug: 'carry1-sales-coach',
      description: 'AI-powered interview practice tool backed by 30+ years of hiring expertise.',
    },
  });

  console.log(`Created/found coach: ${coach.name} (${coach.id})`);

  // 2. Define taxonomies
  const taxonomies = [
    {
      type: 'role',
      items: ['Product Manager', 'Software Engineer', 'Designer', 'Data Analyst', 'Engineering Manager', 'All Roles'],
    },
    {
      type: 'stage',
      items: ['Initial Screen', 'EI Round', 'Technical Round', 'Final Interview', 'All Stages'],
    },
    {
      type: 'industry',
      items: ['Tech', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting'],
    },
    {
      type: 'competency',
      items: [
        'Influence',
        'Collaboration',
        'Technical Depth',
        'Strategic Thinking',
        'Communication',
        'Leadership',
        'Problem Solving',
        'Accountability',
      ],
    },
  ];

  // 3. Create taxonomies
  for (const group of taxonomies) {
    console.log(`Seeding ${group.type}s...`);
    for (const item of group.items) {
      const slug = item.toLowerCase().replace(/\s+/g, '-');
      await prisma.taxonomy.upsert({
        where: {
          coachId_taxonomyType_slug: {
            coachId: coach.id,
            taxonomyType: group.type,
            slug: slug,
          },
        },
        update: {},
        create: {
          coachId: coach.id,
          taxonomyType: group.type,
          name: item,
          slug: slug,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
