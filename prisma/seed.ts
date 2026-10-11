import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password@123', 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Pune Platform Administrator',
      email: 'admin@punehotelrating.in',
      password,
      address: 'Office 204, Business Bay, Airport Road, Yerwada, Pune, Maharashtra 411006',
      role: 'ADMIN',
    },
  });

  // 2. Store Owners (sequential to respect PgBouncer pooling)
  const ownersData = [
    {
      name: 'Sandeep Dattatray Joshi',
      email: 'sandeep.joshi@hotelsahyadri.in',
      address: 'Flat 9, Ganesh Apartments, Shivajinagar, Pune, Maharashtra 411005',
    },
    {
      name: 'Vaishali Prakash Deshpande',
      email: 'vaishali.deshpande@malhargarden.in',
      address: 'B-14, Sai Residency, Baner Road, Baner, Pune, Maharashtra 411045',
    },
    {
      name: 'Prashant Ramchandra Patil',
      email: 'prashant.patil@peshwawada.in',
      address: '112 Budhwar Peth, Near Shaniwar Wada, Pune, Maharashtra 411002',
    },
    {
      name: 'Imtiyaz Abdul Shaikh',
      email: 'imtiyaz.shaikh@rajwadabiryani.in',
      address: '27 Moledina Road, Camp, Pune, Maharashtra 411001',
    },
    {
      name: 'Meenakshi Suresh Iyer',
      email: 'meenakshi.iyer@aapleghar.in',
      address: 'A-302, Magarpatta City, Hadapsar, Pune, Maharashtra 411028',
    },
    {
      name: 'Nilesh Bhaskar Gokhale',
      email: 'nilesh.gokhale@kokankatta.in',
      address: '5 Karve Road, Near Mhatre Bridge, Kothrud, Pune, Maharashtra 411038',
    },
  ];

  const owners = [];
  for (const o of ownersData) {
    owners.push(await prisma.user.create({ data: { ...o, password, role: 'STORE_OWNER' } }));
  }

  // 3. Normal Users (sequential)
  const usersData = [
    {
      name: 'Rohan Anilkumar Kulkarni',
      email: 'rohan.kulkarni@gmail.com',
      address: 'Flat 6, Kalpataru Society, Sadashiv Peth, Pune, Maharashtra 411030',
    },
    {
      name: 'Priyanka Sanjay Bhosale',
      email: 'priyanka.bhosale@gmail.com',
      address: 'C-208, Amanora Park Town, Hadapsar, Pune, Maharashtra 411028',
    },
    {
      name: 'Aditya Vijay Deshmukh',
      email: 'aditya.deshmukh@outlook.com',
      address: '45 Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    },
    {
      name: 'Snehal Rameshwar Chavan',
      email: 'snehal.chavan@gmail.com',
      address: 'Row House 3, Sector 27, Nigdi Pradhikaran, Pimpri-Chinchwad, Maharashtra 411044',
    },
    {
      name: 'Amitkumar Shankar Gaikwad',
      email: 'amit.gaikwad@yahoo.in',
      address: 'D-19, Pride Residency, Wakad, Pune, Maharashtra 411057',
    },
    {
      name: 'Nehal Dinkarrao Pawar',
      email: 'nehal.pawar@gmail.com',
      address: '8 Rutuja Society, Karve Nagar, Pune, Maharashtra 411052',
    },
  ];

  const users = [];
  for (const u of usersData) {
    users.push(await prisma.user.create({ data: { ...u, password, role: 'USER' } }));
  }

  // 4. Stores (sequential) - mostly Pune hotels
  const storesData = [
    {
      name: 'Hotel Sahyadri Residency',
      email: 'contact@hotelsahyadri.in',
      address: '1198 FC Road, Shivajinagar, Pune, Maharashtra 411005',
      ownerId: owners[0].id,
    },
    {
      name: 'Hotel Malhar Garden Restaurant',
      email: 'hello@malhargarden.in',
      address: 'Survey 52, Baner-Pashan Link Road, Baner, Pune, Maharashtra 411045',
      ownerId: owners[1].id,
    },
    {
      name: 'Hotel Peshwa Wada Misal House',
      email: 'info@peshwawada.in',
      address: '112 Budhwar Peth, Near Shaniwar Wada, Pune, Maharashtra 411002',
      ownerId: owners[2].id,
    },
    {
      name: 'Hotel Rajwada Biryani House',
      email: 'orders@rajwadabiryani.in',
      address: '27 Moledina Road, Camp, Pune, Maharashtra 411001',
      ownerId: owners[3].id,
    },
    {
      name: 'Hotel Aaple Ghar Veg Thali',
      email: 'contact@aapleghar.in',
      address: 'Shop 4, Solapur Road, Hadapsar, Pune, Maharashtra 411028',
      ownerId: owners[4].id,
    },
    {
      name: 'Hotel Kokan Katta Seafood',
      email: 'bookings@kokankatta.in',
      address: '5 Karve Road, Near Mhatre Bridge, Kothrud, Pune, Maharashtra 411038',
      ownerId: owners[5].id,
    },
    {
      name: 'Hotel Sai Palace Lodging',
      email: 'saipalace.pcmc@gmail.com',
      address: 'Old Mumbai-Pune Highway, Pimpri, Pimpri-Chinchwad, Maharashtra 411018',
      ownerId: null,
    },
    {
      name: 'Shree Ganesh Sweets & Farsan',
      email: 'shreeganeshsweets.pune@gmail.com',
      address: '310 Tilak Road, Sadashiv Peth, Pune, Maharashtra 411030',
      ownerId: null,
    },
  ];

  const stores = [];
  for (const s of storesData) {
    stores.push(await prisma.store.create({ data: s }));
  }

  // 5. Ratings: [userIndex, storeIndex, rating]
  const ratings: [number, number, number][] = [
    [0, 0, 4], [1, 0, 5], [2, 0, 4], [4, 0, 4],
    [0, 1, 5], [2, 1, 4], [3, 1, 5], [5, 1, 4],
    [0, 2, 5], [1, 2, 5], [3, 2, 4], [4, 2, 5], [5, 2, 5],
    [1, 3, 4], [2, 3, 5], [4, 3, 3],
    [0, 4, 4], [3, 4, 4], [5, 4, 5],
    [1, 5, 5], [2, 5, 4], [4, 5, 5],
    [0, 6, 3], [3, 6, 2], [5, 6, 3],
    [1, 7, 5], [2, 7, 4], [4, 7, 4],
  ];

  for (const [u, s, rating] of ratings) {
    await prisma.rating.create({
      data: { userId: users[u].id, storeId: stores[s].id, rating },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });