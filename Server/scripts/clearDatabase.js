require('dotenv').config();
const connectDB = require('../db/connect');
const User = require('../models/User');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const Sponsorship = require('../models/Sponsorship');
const Feedback = require('../models/Feedback');
const Token = require('../models/Token');

const clearDatabase = async () => {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Connect to database
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Attendee.deleteMany({}),
      Sponsorship.deleteMany({}),
      Feedback.deleteMany({}),
      Token.deleteMany({})
    ]);

    console.log('✅ All collections cleared successfully!');
    console.log('📊 Database is now empty and ready for fresh data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
};

clearDatabase();