require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connect');
const seedDatabase = require('./utils/seedDatabase');
const { startReminderScheduler } = require('./utils/eventReminders');

// Import middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const checkBanStatus = require('./middleware/checkBanStatus');

// Import routers
const authRouter = require('./routers/authRoutes');
const userRouter = require('./routers/userRoutes');
const eventRouter = require('./routers/eventRoutes');
const attendeeRouter = require('./routers/attendeeRoutes');
const sponsorshipRouter = require('./routers/sponsorshipRoutes');
const feedbackRouter = require('./routers/feedbackRoutes');
const notificationRouter = require('./routers/notificationRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'EventEase API is running!' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', checkBanStatus, userRouter);
app.use('/api/v1/events', checkBanStatus, eventRouter);
app.use('/api/v1/attendees', checkBanStatus, attendeeRouter);
app.use('/api/v1/sponsorships', checkBanStatus, sponsorshipRouter);
app.use('/api/v1/feedback', checkBanStatus, feedbackRouter);
app.use('/api/v1/notifications', checkBanStatus, notificationRouter);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Seed database with sample data if empty
    await seedDatabase();

    // Start the event reminder scheduler
    startReminderScheduler();

    app.listen(port, () => {
      console.log(`EventEase server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();