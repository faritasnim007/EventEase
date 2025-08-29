const User = require('../models/User');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const Sponsorship = require('../models/Sponsorship');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Check if database already has data
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeding...');
      return;
    }

    console.log('Seeding database with sample data...');

    // Sample users data
    const usersData = [
      // Admin
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'password123',
        role: 'admin',
        age: 35,
        gender: 'male',
        phone: '+1234567890',
        department: '',
        year: 'Faculty',
        interests: ['management', 'technology', 'education'],
        bio: 'System administrator with 10+ years of experience in event management.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      // Organisers
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'organiser',
        age: 28,
        gender: 'female',
        phone: '+1234567891',
        department: 'Student Affairs',
        year: 'Faculty',
        interests: ['event planning', 'student engagement', 'community building'],
        bio: 'Passionate event organiser dedicated to creating memorable campus experiences.',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        password: 'password123',
        role: 'organiser',
        age: 32,
        gender: 'male',
        phone: '+1234567892',
        department: 'Cultural Affairs',
        year: 'Faculty',
        interests: ['cultural events', 'diversity', 'arts'],
        bio: 'Cultural events coordinator with expertise in multicultural programming.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        password: 'password123',
        role: 'organiser',
        age: 26,
        gender: 'female',
        phone: '+1234567893',
        department: 'Sports & Recreation',
        year: 'Faculty',
        interests: ['sports', 'fitness', 'team building'],
        bio: 'Sports event coordinator passionate about promoting active lifestyles.',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      // Students
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@student.edu',
        password: 'password123',
        role: 'user',
        age: 20,
        gender: 'male',
        phone: '+1234567894',
        department: 'Computer Science',
        year: 'First Year',
        interests: ['technology', 'gaming', 'programming'],
        bio: 'CS student interested in tech events and hackathons.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        name: 'Jessica Williams',
        email: 'jessica.williams@student.edu',
        password: 'password123',
        role: 'user',
        age: 19,
        gender: 'female',
        phone: '+1234567895',
        department: 'Business Administration',
        year: 'First Year',
        interests: ['business', 'networking', 'entrepreneurship'],
        bio: 'Business student passionate about entrepreneurship and networking events.',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        name: 'David Kim',
        email: 'david.kim@student.edu',
        password: 'password123',
        role: 'user',
        age: 21,
        gender: 'male',
        phone: '+1234567896',
        department: 'Engineering',
        year: 'First Year',
        interests: ['engineering', 'innovation', 'robotics'],
        bio: 'Engineering student with interests in robotics and innovation.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@student.edu',
        password: 'password123',
        role: 'user',
        age: 22,
        gender: 'female',
        phone: '+1234567897',
        department: 'Psychology',
        year: 'First Year',
        interests: ['psychology', 'mental health', 'research'],
        bio: 'Psychology major interested in mental health awareness events.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@student.edu',
        password: 'password123',
        role: 'user',
        age: 18,
        gender: 'male',
        phone: '+1234567898',
        department: 'Arts & Literature',
        year: 'First Year',
        interests: ['literature', 'creative writing', 'poetry'],
        bio: 'First-year student passionate about literature and creative arts.',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      },
      {
        name: 'Sophie Brown',
        email: 'sophie.brown@student.edu',
        password: 'password123',
        role: 'user',
        age: 20,
        gender: 'female',
        phone: '+1234567899',
        department: 'Environmental Science',
        year: 'First Year',
        interests: ['environment', 'sustainability', 'climate change'],
        bio: 'Environmental science student advocating for sustainability.',
        profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150'
      }
    ];

    // Hash passwords and create users
    const users = [];
    for (const userData of usersData) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      const user = await User.create(userData);
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Get user IDs for reference
    const adminUser = users[0];
    const organisers = users.slice(1, 4);
    const students = users.slice(4);

    // Sample events data
    const eventsData = [
      {
        title: 'Annual Tech Conference 2025',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders, innovative workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and software development.',
        startDate: new Date('2024-08-15T09:00:00Z'),
        location: 'Main Auditorium, Tech Building',
        category: 'academic',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
        allowSponsorship: true,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[0]._id],
        maxAttendees: 200,
        status: 'published',
        registrationDeadline: new Date('2024-08-10T23:59:59Z'),
        tags: ['technology', 'AI', 'blockchain', 'networking']
      },
      {
        title: 'Spring Cultural Festival',
        description: 'Celebrate diversity and culture with performances, food stalls, and cultural exhibitions from around the world. Experience the rich tapestry of our campus community.',
        startDate: new Date('2025-10-10T14:00:00Z'),
        location: 'Campus Green',
        category: 'cultural',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
        allowSponsorship: true,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[1]._id],
        maxAttendees: 500,
        status: 'published',
        registrationDeadline: new Date('2025-09-10T23:59:59Z'),
        tags: ['culture', 'diversity', 'food', 'performance']
      },
      {
        title: 'Campus Marathon 2025',
        description: 'Annual campus marathon promoting fitness and healthy living. Multiple categories available including 5K, 10K, and full marathon. All fitness levels welcome!',
        startDate: new Date('2025-10-10T07:00:00Z'),
        location: 'Campus Athletic Track',
        category: 'sports',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        allowSponsorship: true,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[2]._id],
        maxAttendees: 300,
        status: 'published',
        registrationDeadline: new Date('2025-09-10T23:59:59Z'),
        tags: ['sports', 'fitness', 'marathon', 'health']
      },
      {
        title: 'Entrepreneurship Workshop Series',
        description: 'Learn from successful entrepreneurs and develop your business ideas. This workshop series covers business planning, funding, marketing, and scaling strategies.',
        startDate: new Date('2025-10-10T18:00:00Z'),
        location: 'Business School Seminar Room',
        category: 'workshop',
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
        allowSponsorship: false,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[0]._id, organisers[1]._id],
        maxAttendees: 50,
        status: 'published',
        registrationDeadline: new Date('2025-09-10T23:59:59Z'),
        tags: ['entrepreneurship', 'business', 'startup', 'workshop']
      },
      {
        title: 'Mental Health Awareness Seminar',
        description: 'Important seminar on mental health awareness, stress management, and available campus resources. Open discussion with mental health professionals.',
        startDate: new Date('2025-10-10T16:00:00Z'),
        location: 'Student Center Conference Room',
        category: 'seminar',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
        allowSponsorship: false,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[0]._id],
        maxAttendees: 100,
        status: 'published',
        registrationDeadline: new Date('2025-09-10T23:59:59Z'),
        tags: ['mental health', 'wellness', 'awareness', 'support']
      },
      {
        title: 'End of Year Social Mixer',
        description: 'Celebrate the end of the academic year with fellow students! Music, games, refreshments, and networking opportunities in a relaxed atmosphere.',
        startDate: new Date('2025-10-10T19:00:00Z'),
        location: 'Student Union Ballroom',
        category: 'social',
        imageUrl: 'https://images.dog.ceo/breeds/retriever-flatcoated/n02099267_731.jpg',
        allowSponsorship: true,
        createdBy: adminUser._id,
        assignedOrganisers: [organisers[1]._id, organisers[2]._id],
        maxAttendees: 250,
        status: 'published',
        registrationDeadline: new Date('2025-09-10T23:59:59Z'),
        tags: ['social', 'networking', 'celebration', 'music']
      }
    ];

    const events = await Event.create(eventsData);
    console.log(`Created ${events.length} events`);

    // Create attendees (RSVPs)
    const attendeesData = [];

    // Each student RSVPs to 2-4 random events
    for (const student of students) {
      const numEvents = Math.floor(Math.random() * 3) + 2; // 2-4 events
      const shuffledEvents = [...events].sort(() => 0.5 - Math.random());

      for (let i = 0; i < numEvents; i++) {
        const event = shuffledEvents[i];
        const statuses = ['registered', 'attended', 'registered', 'registered']; // More likely to be registered

        attendeesData.push({
          user: student._id,
          event: event._id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        });
      }
    }

    const attendees = await Attendee.create(attendeesData);
    console.log(`Created ${attendees.length} attendee records`);

    // Create sponsorships
    const sponsorshipsData = [];

    // Some students sponsor events that allow sponsorship
    const sponsorableEvents = events.filter(event => event.allowSponsorship);

    for (let i = 0; i < 8; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomEvent = sponsorableEvents[Math.floor(Math.random() * sponsorableEvents.length)];
      const amounts = [25, 50, 75, 100, 150, 200];
      const statuses = ['approved', 'approved', 'pending', 'approved']; // More likely to be approved

      // Check if this combination already exists
      const exists = sponsorshipsData.some(s =>
        s.user.toString() === randomStudent._id.toString() &&
        s.event.toString() === randomEvent._id.toString()
      );

      if (!exists) {
        const sponsorship = {
          user: randomStudent._id,
          event: randomEvent._id,
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          message: `Happy to support this amazing event! Looking forward to participating.`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        };

        if (sponsorship.status === 'approved') {
          sponsorship.approvedBy = adminUser._id;
          sponsorship.approvedAt = new Date();
        }

        sponsorshipsData.push(sponsorship);
      }
    }

    const sponsorships = await Sponsorship.create(sponsorshipsData);
    console.log(`Created ${sponsorships.length} sponsorship records`);

    // Create feedback for past events (events that have attendees with 'attended' status)
    const feedbackData = [];

    const attendedRecords = attendees.filter(a => a.status === 'attended');

    for (const attendance of attendedRecords) {
      // 70% chance of leaving feedback
      if (Math.random() < 0.7) {
        const ratings = [4, 5, 5, 4, 3, 5, 4]; // Mostly positive ratings
        const comments = [
          'Great event! Really enjoyed the content and networking opportunities.',
          'Well organized and informative. Would definitely attend again.',
          'Excellent speakers and good venue. Learned a lot!',
          'Amazing experience! The organizers did a fantastic job.',
          'Good event overall, could use more interactive sessions.',
          'Loved the diversity of topics covered. Very engaging!',
          'Professional and well-executed event. Highly recommend!'
        ];

        feedbackData.push({
          user: attendance.user,
          event: attendance.event,
          rating: ratings[Math.floor(Math.random() * ratings.length)],
          comment: comments[Math.floor(Math.random() * comments.length)],
          isAnonymous: Math.random() < 0.3, // 30% chance of anonymous feedback
        });
      }
    }

    const feedback = await Feedback.create(feedbackData);
    console.log(`Created ${feedback.length} feedback records`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length} (1 admin, 3 organisers, ${students.length} students)`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Attendees: ${attendees.length}`);
    console.log(`- Sponsorships: ${sponsorships.length}`);
    console.log(`- Feedback: ${feedback.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@gmail.com / password123');
    console.log('Organiser: sarah.johnson@university.edu / password123');
    console.log('Student: alex.thompson@student.edu / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;