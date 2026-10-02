import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = [
  { code: 'GUEST', name: 'Guest Explorer', description: 'Unauthenticated read-only explorer' },
  {
    code: 'TRAVELLER',
    name: 'Verified Traveller',
    description: 'Authenticated traveler with booking and social privileges',
  },
  {
    code: 'VILLAGE_ADMIN',
    name: 'Village Administrator',
    description: 'Grassroots administrator with scoped village management rights',
  },
  {
    code: 'BOOKING_ADMIN',
    name: 'Booking Administrator',
    description: 'Manages batches, capacities, attendance and clearance',
  },
  {
    code: 'FINANCE_ADMIN',
    name: 'Finance Administrator',
    description: 'Manages double-entry ledgers, payouts, GST and refunds',
  },
  {
    code: 'MODERATOR',
    name: 'Regional Content Moderator',
    description: 'Reviews village staging queues and flagged community posts',
  },
  {
    code: 'CONTENT_EDITOR',
    name: 'Editorial Curator',
    description: 'Curates cultural dossiers, articles, and historical archives',
  },
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Global platform governance, dynamic navigation and master toggles',
  },
];

const STATES_AND_UTS = [
  // 28 States
  {
    name: 'Andhra Pradesh',
    isoCode: 'IN-AP',
    capital: 'Amaravati',
    officialLanguages: ['Telugu', 'English'],
  },
  {
    name: 'Arunachal Pradesh',
    isoCode: 'IN-AR',
    capital: 'Itanagar',
    officialLanguages: ['English'],
  },
  { name: 'Assam', isoCode: 'IN-AS', capital: 'Dispur', officialLanguages: ['Assamese', 'Boro'] },
  { name: 'Bihar', isoCode: 'IN-BR', capital: 'Patna', officialLanguages: ['Hindi', 'Urdu'] },
  {
    name: 'Chhattisgarh',
    isoCode: 'IN-CT',
    capital: 'Raipur',
    officialLanguages: ['Chhattisgarhi', 'Hindi'],
  },
  {
    name: 'Goa',
    isoCode: 'IN-GA',
    capital: 'Panaji',
    officialLanguages: ['Konkani', 'Marathi', 'English'],
  },
  {
    name: 'Gujarat',
    isoCode: 'IN-GJ',
    capital: 'Gandhinagar',
    officialLanguages: ['Gujarati', 'Hindi'],
  },
  {
    name: 'Haryana',
    isoCode: 'IN-HR',
    capital: 'Chandigarh',
    officialLanguages: ['Hindi', 'Punjabi'],
  },
  {
    name: 'Himachal Pradesh',
    isoCode: 'IN-HP',
    capital: 'Shimla',
    officialLanguages: ['Hindi', 'Pahari'],
  },
  {
    name: 'Jharkhand',
    isoCode: 'IN-JH',
    capital: 'Ranchi',
    officialLanguages: ['Hindi', 'Santali'],
  },
  { name: 'Karnataka', isoCode: 'IN-KA', capital: 'Bengaluru', officialLanguages: ['Kannada'] },
  {
    name: 'Kerala',
    isoCode: 'IN-KL',
    capital: 'Thiruvananthapuram',
    officialLanguages: ['Malayalam', 'English'],
  },
  { name: 'Madhya Pradesh', isoCode: 'IN-MP', capital: 'Bhopal', officialLanguages: ['Hindi'] },
  { name: 'Maharashtra', isoCode: 'IN-MH', capital: 'Mumbai', officialLanguages: ['Marathi'] },
  {
    name: 'Manipur',
    isoCode: 'IN-MN',
    capital: 'Imphal',
    officialLanguages: ['Meitei (Manipuri)'],
  },
  {
    name: 'Meghalaya',
    isoCode: 'IN-ML',
    capital: 'Shillong',
    officialLanguages: ['English', 'Khasi', 'Garo'],
  },
  { name: 'Mizoram', isoCode: 'IN-MZ', capital: 'Aizawl', officialLanguages: ['Mizo', 'English'] },
  { name: 'Nagaland', isoCode: 'IN-NL', capital: 'Kohima', officialLanguages: ['English'] },
  { name: 'Odisha', isoCode: 'IN-OD', capital: 'Bhubaneswar', officialLanguages: ['Odia'] },
  { name: 'Punjab', isoCode: 'IN-PB', capital: 'Chandigarh', officialLanguages: ['Punjabi'] },
  {
    name: 'Rajasthan',
    isoCode: 'IN-RJ',
    capital: 'Jaipur',
    officialLanguages: ['Hindi', 'Rajasthani'],
  },
  {
    name: 'Sikkim',
    isoCode: 'IN-SK',
    capital: 'Gangtok',
    officialLanguages: ['Nepali', 'Sikkimese', 'Lepcha', 'English'],
  },
  { name: 'Tamil Nadu', isoCode: 'IN-TN', capital: 'Chennai', officialLanguages: ['Tamil'] },
  {
    name: 'Telangana',
    isoCode: 'IN-TG',
    capital: 'Hyderabad',
    officialLanguages: ['Telugu', 'Urdu'],
  },
  {
    name: 'Tripura',
    isoCode: 'IN-TR',
    capital: 'Agartala',
    officialLanguages: ['Bengali', 'Kokborok', 'English'],
  },
  {
    name: 'Uttar Pradesh',
    isoCode: 'IN-UP',
    capital: 'Lucknow',
    officialLanguages: ['Hindi', 'Urdu'],
  },
  {
    name: 'Uttarakhand',
    isoCode: 'IN-UT',
    capital: 'Dehradun',
    officialLanguages: ['Hindi', 'Sanskrit', 'Garhwali', 'Kumaoni'],
  },
  {
    name: 'West Bengal',
    isoCode: 'IN-WB',
    capital: 'Kolkata',
    officialLanguages: ['Bengali', 'English'],
  },

  // 8 Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    isoCode: 'IN-AN',
    capital: 'Port Blair',
    officialLanguages: ['Hindi', 'English'],
  },
  {
    name: 'Chandigarh',
    isoCode: 'IN-CH',
    capital: 'Chandigarh',
    officialLanguages: ['English', 'Punjabi', 'Hindi'],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    isoCode: 'IN-DH',
    capital: 'Daman',
    officialLanguages: ['Gujarati', 'Hindi', 'Marathi', 'English'],
  },
  {
    name: 'Delhi',
    isoCode: 'IN-DL',
    capital: 'New Delhi',
    officialLanguages: ['Hindi', 'English', 'Punjabi', 'Urdu'],
  },
  {
    name: 'Jammu and Kashmir',
    isoCode: 'IN-JK',
    capital: 'Srinagar / Jammu',
    officialLanguages: ['Kashmiri', 'Dogri', 'Hindi', 'Urdu', 'English'],
  },
  {
    name: 'Ladakh',
    isoCode: 'IN-LA',
    capital: 'Leh',
    officialLanguages: ['Ladakhi', 'Tibetan', 'Hindi', 'English'],
  },
  {
    name: 'Lakshadweep',
    isoCode: 'IN-LD',
    capital: 'Kavaratti',
    officialLanguages: ['Malayalam', 'English'],
  },
  {
    name: 'Puducherry',
    isoCode: 'IN-PY',
    capital: 'Puducherry',
    officialLanguages: ['Tamil', 'Telugu', 'Malayalam', 'French', 'English'],
  },
];

async function main() {
  console.log('🌱 Starting Explore Bharat Safar Database Seeding...');

  // 1. Seed Roles
  console.log('Seeding System Roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log(`✅ Seeded ${ROLES.length} platform roles.`);

  // 2. Seed States and UTs
  console.log('Seeding 28 States and 8 Union Territories of Bharat...');
  for (const item of STATES_AND_UTS) {
    await prisma.state.upsert({
      where: { isoCode: item.isoCode },
      update: {
        name: item.name,
        capital: item.capital,
        officialLanguages: item.officialLanguages,
      },
      create: {
        name: item.name,
        isoCode: item.isoCode,
        capital: item.capital,
        officialLanguages: item.officialLanguages,
        overviewDossier: {
          tagline: `Discover the timeless heritage and natural majesty of ${item.name}`,
          region: 'Bharat',
        },
      },
    });
  }
  console.log(`✅ Seeded ${STATES_AND_UTS.length} States and Union Territories.`);

  console.log('✨ Database seeding completed successfully.');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
