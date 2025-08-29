import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Heart,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const profileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  phone: yup.string().required('Phone number is required'),
  age: yup.number().required('Age is required').min(16, 'Must be at least 16 years old').max(100, 'Invalid age'),
  gender: yup.string().required('Gender is required'),
  department: yup.string().required('Department is required'),
  year: yup.string().required('Academic year is required'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  interests: yup.string(),
});

const passwordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [myRsvps, setMyRsvps] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || "",
      age: user?.age || '',
      gender: user?.gender || '',
      department: user?.department || '',
      year: user?.year || '',
      bio: user?.bio || '',
      interests: user?.interests?.join(', ') || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    fetchMyRsvps();
    fetchMyFeedback();
  }, []);

  const fetchMyRsvps = async () => {
    try {
      const response = await api.attendees.getMyRsvps();
      setMyRsvps(response.data.rsvps || []);
    } catch (error) {
      console.error('Failed to fetch RSVPs:', error);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const response = await api.feedback.getMyFeedback();
      setMyFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const profileData = {
        ...data,
        interests: data.interests ? data.interests.split(',').map(i => i.trim()).filter(i => i) : [],
      };

      await updateUser(profileData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await api.users.updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to update password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const departments = [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Medicine',
    'Law',
    'Arts & Sciences',
    'Education',
    'Psychology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Other',
  ];

  const academicYears = [
    'First Year',
    'Second Year',
    'Third Year',
    'Fourth Year',
    'Graduate',
    'PhD',
    'Faculty',
    'Staff',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-sm rounded-full mt-1">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-outline"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="form-label">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  {...registerProfile('name')}
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.name.message}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="form-label">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="form-input bg-muted"
                  disabled
                />
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  {...registerProfile('phone')}
                  type="tel"
                  className="form-input"
                  disabled={!isEditing}
                />
                {profileErrors.phone && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.phone.message}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="form-label">Age</label>
                <input
                  {...registerProfile('age')}
                  type="number"
                  min="16"
                  max="100"
                  className="form-input"
                  disabled={!isEditing}
                />
                {profileErrors.age && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="form-label">Gender</label>
                <select {...registerProfile('gender')} className="form-input" disabled={!isEditing}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {profileErrors.gender && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.gender.message}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="form-label">
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  Department
                </label>
                <select {...registerProfile('department')} className="form-input" disabled={!isEditing}>
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {profileErrors.department && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.department.message}</p>
                )}
              </div>

              {/* Academic Year */}
              <div>
                <label className="form-label">Academic Year</label>
                <select {...registerProfile('year')} className="form-input" disabled={!isEditing}>
                  <option value="">Select year</option>
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {profileErrors.year && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.year.message}</p>
                )}
              </div>

              {/* Interests */}
              <div className="md:col-span-2">
                <label className="form-label">Interests (comma-separated)</label>
                <input
                  {...registerProfile('interests')}
                  type="text"
                  className="form-input"
                  placeholder="e.g., Technology, Sports, Music, Art"
                  disabled={!isEditing}
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="form-label">Bio</label>
                <textarea
                  {...registerProfile('bio')}
                  rows={3}
                  className="form-input"
                  placeholder="Tell us about yourself..."
                  disabled={!isEditing}
                />
                {profileErrors.bio && (
                  <p className="mt-1 text-sm text-destructive">{profileErrors.bio.message}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="btn-outline"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <input
                  {...registerPassword('oldPassword')}
                  type="password"
                  className="form-input"
                />
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">New Password</label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className="form-input"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className="form-input"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* My Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My RSVPs */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              My Events ({myRsvps.length})
            </h2>
            {myRsvps.length === 0 ? (
              <p className="text-muted-foreground">No events registered yet.</p>
            ) : (
              <div className="space-y-3">
                {myRsvps.slice(0, 5).map((rsvp) => (
                  <div key={rsvp._id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{rsvp.event?.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(rsvp.event?.date)}
                        <MapPin className="h-3 w-3 ml-2 mr-1" />
                        {rsvp.event?.location}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${rsvp.status === 'confirmed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                      {rsvp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Feedback */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              My Feedback ({myFeedback.length})
            </h2>
            {myFeedback.length === 0 ? (
              <p className="text-muted-foreground">No feedback given yet.</p>
            ) : (
              <div className="space-y-3">
                {myFeedback.slice(0, 5).map((feedback) => (
                  <div key={feedback._id} className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{feedback.event?.title}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;