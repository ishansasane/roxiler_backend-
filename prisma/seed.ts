import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Officer',
      email: 'admin@storerating.com',
      password,
      address: '742 Evergreen Terrace, Sector 12, Tech Park, Suite 400',
      role: 'ADMIN',
    },
  });

  const owners = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alexander Christopher Smith',
        email: 'alexander.smith@organicmarket.com',
        password,
        address: '104 High Street, West Commercial District, Block A',
        role: 'STORE_OWNER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Victoria Elizabeth Martinez',
        email: 'victoria.martinez@artiscoffee.com',
        password,
        address: '255 River Boulevard, Central Uptown, Floor 2',
        role: 'STORE_OWNER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Benjamin Franklin Washington',
        email: 'benjamin.washington@metroelectronics.com',
        password,
        address: '89 Innovation Parkway, Silicon Center, Building 4',
        role: 'STORE_OWNER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eleanor Catherine Vance',
        email: 'eleanor.vance@bakerycafe.com',
        password,
        address: '312 Maple Avenue, Meadow Hills, Suite 10',
        role: 'STORE_OWNER',
      },
    }),
  ]);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Jonathan Edward Henderson',
        email: 'user1@example.com',
        password,
        address: '12 Blossom Lane, North Valley, Apt 3B',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Samantha Grace Williamson',
        email: 'user2@example.com',
        password,
        address: '48 Pine Needle Way, Southside, House 12',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Bartholomew Peterson',
        email: 'user3@example.com',
        password,
        address: '900 Ocean Drive, Coastal Vista, Unit 701',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emily Charlotte Richardson',
        email: 'user4@example.com',
        password,
        address: '77 Forest Glen Circle, Woodbury County',
        role: 'USER',
      },
    }),
  ]);

  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Downtown Organic Supermarket',
        email: 'contact@organicmarket.com',
        address: '104 High Street, West Commercial District, City Center',
        ownerId: owners[0].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Greenwood Artisan Coffee Hub',
        email: 'contact@artiscoffee.com',
        address: '255 River Boulevard, Central Uptown, Waterfront',
        ownerId: owners[1].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Metropolitan Tech Electronics',
        email: 'support@metroelectronics.com',
        address: '89 Innovation Parkway, Silicon Center, City',
        ownerId: owners[2].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Evergreen Gourmet Bakery Cafe',
        email: 'hello@bakerycafe.com',
        address: '312 Maple Avenue, Meadow Hills, City',
      },
    }),
  ]);

  const ratings = [
    { userId: users[0].id, storeId: stores[0].id, rating: 5 },
    { userId: users[1].id, storeId: stores[0].id, rating: 4 },
    { userId: users[2].id, storeId: stores[0].id, rating: 5 },
    { userId: users[0].id, storeId: stores[1].id, rating: 4 },
    { userId: users[1].id, storeId: stores[1].id, rating: 4 },
    { userId: users[3].id, storeId: stores[1].id, rating: 5 },
    { userId: users[1].id, storeId: stores[2].id, rating: 3 },
    { userId: users[2].id, storeId: stores[2].id, rating: 4 },
    { userId: users[0].id, storeId: stores[3].id, rating: 5 },
    { userId: users[3].id, storeId: stores[3].id, rating: 4 },
  ];

  await prisma.rating.createMany({ data: ratings });

  console.log('Database seeded successfully.');
  console.log(`Admin: ${admin.email}`);
  console.log(`Created ${owners.length} store owners.`);
  console.log(`Created ${users.length} users.`);
  console.log(`Created ${stores.length} stores.`);
  console.log(`Created ${ratings.length} ratings.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });