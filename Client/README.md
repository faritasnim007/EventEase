# Pet Management System - Frontend

A modern React frontend for the Pet Management System built with Vite, Tailwind CSS, and React Router.

## Features

### 🔐 Authentication

- User registration with email verification
- Secure login/logout
- Protected routes for authenticated users
- Role-based access control (Admin/User)

### 🏠 Public Pages

- **Home**: Landing page with features and call-to-actions
- **Pets**: Browse available pets for adoption with search and filters
- **Services**: Information about veterinary, grooming, and daycare services
- **Training**: Pet training resources and guides (coming soon)
- **Donate**: Support pet shelters and rescues (coming soon)

### 👤 User Dashboard

- Personal dashboard with statistics
- Quick actions for common tasks
- Recent pets, bookings, and donations overview

### 🐾 Pet Management

- Browse pets available for adoption
- Search and filter by species, breed, etc.
- View detailed pet information
- Add pets for adoption (authenticated users)

### 📅 Service Booking

- Book veterinary appointments
- Schedule pet daycare
- Arrange grooming services
- Manage booking status

### 🏥 Health Monitoring

- Track pet vaccinations
- Monitor weight and health metrics
- Maintain health logs and notes

### 🔔 Notifications

- Real-time notifications
- Appointment reminders
- Health update alerts

### 💰 Donations

- Support pet shelters and rescues
- Track donation history
- View donation statistics (admin)

### 👑 Admin Features

- Admin dashboard with comprehensive statistics
- User management
- Pet approval system
- Booking management
- Donation oversight

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Environment Setup

Make sure your backend server is running on `http://localhost:5000` or update the API base URL in `src/lib/api.js`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components (Navbar, Footer)
├── hooks/              # Custom React hooks
│   └── useAuth.js      # Authentication hook
├── lib/                # Utilities and configurations
│   └── api.js          # API client and endpoints
├── pages/              # Page components
├── utils/              # Utility functions
├── App.jsx             # Main app component with routing
├── main.jsx            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API through:

- Axios HTTP client with interceptors
- Automatic token management
- Error handling and user feedback
- Request/response transformation

## Authentication Flow

1. User registers with email/password
2. Email verification required
3. Login with verified credentials
4. JWT token stored and managed automatically
5. Protected routes require authentication
6. Admin routes require admin role

## Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

## Future Enhancements

- [ ] Real-time chat support
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Pet matching algorithm
- [ ] Social features (pet profiles, sharing)
- [ ] Mobile app version
- [ ] Offline support
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
