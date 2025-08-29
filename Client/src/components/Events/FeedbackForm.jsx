import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Star, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  rating: yup.number().required('Rating is required').min(1, 'Please select a rating').max(5),
  comment: yup.string().required('Comment is required').min(10, 'Comment must be at least 10 characters'),
});

const FeedbackForm = ({ eventId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.feedback.submit(eventId, data);
      toast.success('Feedback submitted successfully!');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="form-label">
          <Star className="h-4 w-4 inline mr-2" />
          Rating
        </label>
        <div className="flex items-center space-x-1 mt-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => setHoverRating(rating)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl transition-colors focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${rating <= (hoverRating || selectedRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                  }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="form-label">
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Your Feedback
        </label>
        <textarea
          {...register('comment')}
          rows={4}
          className="form-input"
          placeholder="Share your thoughts about this event..."
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-destructive">{errors.comment.message}</p>
        )}
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
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;