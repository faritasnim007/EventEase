import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, MapPin, Users, Clock, FileText, Tag, Image } from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  startDate: yup.string().required('Start date is required'),
  startTime: yup.string().required('Start time is required'),
  registrationDeadlineDate: yup.string().required('Registration deadline date is required'),
  registrationDeadlineTime: yup.string().required('Registration deadline time is required'),
  location: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  imageUrl: yup.string().url('Must be a valid URL'),
  maxAttendees: yup.number().min(1, 'Must allow at least 1 attendee'),
  allowSponsorship: yup.string(),
  sponsorshipRequirements: yup.string(),
});

const EditEventForm = ({ event, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  // Format dates and times for form inputs
  const startDate = new Date(event.startDate || event.date);
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedStartTime = startDate.toTimeString().slice(0, 5);

  // Use event date as fallback for registration deadline if not set
  const registrationDeadlineDate = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.date);
  const formattedDeadlineDate = registrationDeadlineDate.toISOString().split('T')[0];
  const formattedDeadlineTime = registrationDeadlineDate.toTimeString().slice(0, 5);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: event.title,
      description: event.description,
      startDate: formattedStartDate,
      startTime: formattedStartTime,
      registrationDeadlineDate: formattedDeadlineDate,
      registrationDeadlineTime: formattedDeadlineTime,
      location: event.location,
      category: event.category,
      imageUrl: event.imageUrl || '',
      maxAttendees: event.maxAttendees || '',
      allowSponsorship: event.allowSponsorship ? 'true' : 'false',
      sponsorshipRequirements: event.sponsorshipRequirements || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Combine dates and times
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const registrationDeadlineDateTime = new Date(`${data.registrationDeadlineDate}T${data.registrationDeadlineTime}`);

      // Validate that registration deadline is before start date
      if (registrationDeadlineDateTime >= startDateTime) {
        toast.error('Registration deadline must be before the event start date');
        return;
      }

      const eventData = {
        title: data.title,
        description: data.description,
        startDate: startDateTime.toISOString(),
        date: startDateTime.toISOString(), // Keep for backward compatibility
        registrationDeadline: registrationDeadlineDateTime.toISOString(),
        location: data.location,
        category: data.category,
        imageUrl: data.imageUrl || '',
        maxAttendees: data.maxAttendees || undefined,
        allowSponsorship: data.allowSponsorship === 'true',
        sponsorshipRequirements: data.sponsorshipRequirements || '',
      };

      await api.events.update(event._id, eventData);
      toast.success('Event updated successfully!');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to update event';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'academic',
    'social',
    'sports',
    'cultural',
    'workshop',
    'seminar',
    'conference',
    'networking',
    'entertainment',
    'other',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="form-label">
            <FileText className="h-4 w-4 inline mr-2" />
            Event Title
          </label>
          <input
            {...register('title')}
            type="text"
            className="form-input"
            placeholder="Enter event title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="form-label">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="form-input"
            placeholder="Describe your event..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="form-label">
            <Image className="h-4 w-4 inline mr-2" />
            Event Image URL (Optional)
          </label>
          <input
            {...register('imageUrl')}
            type="url"
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="form-label">
            <Calendar className="h-4 w-4 inline mr-2" />
            Start Date
          </label>
          <input
            {...register('startDate')}
            type="date"
            className="form-input"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label className="form-label">
            <Clock className="h-4 w-4 inline mr-2" />
            Start Time
          </label>
          <input
            {...register('startTime')}
            type="time"
            className="form-input"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-destructive">{errors.startTime.message}</p>
          )}
        </div>

        {/* Registration Deadline Date */}
        <div>
          <label className="form-label">
            <Calendar className="h-4 w-4 inline mr-2" />
            Registration Deadline Date
          </label>
          <input
            {...register('registrationDeadlineDate')}
            type="date"
            className="form-input"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.registrationDeadlineDate && (
            <p className="mt-1 text-sm text-destructive">{errors.registrationDeadlineDate.message}</p>
          )}
        </div>

        {/* Registration Deadline Time */}
        <div>
          <label className="form-label">
            <Clock className="h-4 w-4 inline mr-2" />
            Registration Deadline Time
          </label>
          <input
            {...register('registrationDeadlineTime')}
            type="time"
            className="form-input"
          />
          {errors.registrationDeadlineTime && (
            <p className="mt-1 text-sm text-destructive">{errors.registrationDeadlineTime.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="form-label">
            <MapPin className="h-4 w-4 inline mr-2" />
            Location
          </label>
          <input
            {...register('location')}
            type="text"
            className="form-input"
            placeholder="Event location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="form-label">
            <Tag className="h-4 w-4 inline mr-2" />
            Category
          </label>
          <select {...register('category')} className="form-input">
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Max Attendees */}
        <div>
          <label className="form-label">
            <Users className="h-4 w-4 inline mr-2" />
            Maximum Attendees (Optional)
          </label>
          <input
            {...register('maxAttendees')}
            type="number"
            min="1"
            className="form-input"
            placeholder="Leave empty for unlimited"
          />
          {errors.maxAttendees && (
            <p className="mt-1 text-sm text-destructive">{errors.maxAttendees.message}</p>
          )}
        </div>

        {/* Allow Sponsorship */}
        <div>
          <label className="form-label">
            <span className="h-4 w-4 inline mr-2">💰</span>
            Allow Sponsorship
          </label>
          <select {...register('allowSponsorship')} className="form-input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        {/* Sponsorship Requirements */}
        <div className="md:col-span-2">
          <label className="form-label">Sponsorship Requirements (Optional)</label>
          <textarea
            {...register('sponsorshipRequirements')}
            rows={3}
            className="form-input"
            placeholder="Describe sponsorship requirements, benefits, or guidelines..."
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
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
              Updating...
            </>
          ) : (
            'Update Event'
          )}
        </button>
      </div>
    </form>
  );
};

export default EditEventForm;