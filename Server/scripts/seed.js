require('dotenv').config();
const connectDB = require('../db/connect');
const seedDatabase = require('../utils/seedDatabase');

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Run seeding
    await seedDatabase();

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();