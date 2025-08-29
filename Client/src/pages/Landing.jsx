import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Bell,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Smart Event Discovery',
      description: 'Find events that match your interests with our intelligent recommendation system.',
    },
    {
      icon: Users,
      title: 'Easy RSVP Management',
      description: 'Register for events with one click and manage your attendance seamlessly.',
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications about events, changes, and reminders.',
    },
    {
      icon: Star,
      title: 'Feedback & Reviews',
      description: 'Share your experience and help improve future events with our feedback system.',
    },
    {
      icon: Zap,
      title: 'Quick Event Creation',
      description: 'Organizers can create and manage events effortlessly with our intuitive tools.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      content: 'EventEase has transformed how I discover and attend campus events. The notification system ensures I never miss anything important!',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Event Organizer',
      content: 'As an organizer, this platform has made event management incredibly simple. The analytics and feedback features are outstanding.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student Activities Coordinator',
      content: 'The best event management system we\'ve used. Students love how easy it is to find and register for events.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '500+', label: 'Events Hosted' },
    { number: '50+', label: 'Campus Partners' },
    { number: '98%', label: 'User Satisfaction' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Smart Campus
              <span className="gradient-text block">Event Management</span>
              System
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover amazing events, connect with your community, and create unforgettable experiences.
              EventEase makes campus life more engaging and organized.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/events" className="btn-primary text-lg px-8 py-3 items-center justify-center flex gap-2">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3 flex gap-2 items-center justify-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/events" className="btn-outline text-lg px-8 py-3">
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for
              <span className="gradient-text"> Perfect Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From discovery to feedback, we've got every aspect of event management covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account and set up your profile with your interests and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Events</h3>
              <p className="text-muted-foreground">
                Browse events tailored to your interests or search for specific types of activities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Attend & Engage</h3>
              <p className="text-muted-foreground">
                RSVP to events, attend, and share your feedback to help improve future events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users who love EventEase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your
            <span className="gradient-text"> Campus Experience?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join EventEase today and discover a world of amazing events and opportunities.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3 flex gap-2 items-center justify-center">
                Start Your Journey
                <Heart className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-3">
                Already have an account?
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;