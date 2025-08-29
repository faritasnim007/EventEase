import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DollarSign, Building, Mail, Phone, FileText } from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  companyName: yup.string().required('Company name is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  sponsorshipType: yup.string().required('Sponsorship type is required'),
  amount: yup.number().required('Amount is required').min(1, 'Amount must be greater than 0'),
  message: yup.string(),
});

const SponsorshipForm = ({ eventId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.sponsorships.create(eventId, data);
      toast.success('Sponsorship request submitted successfully!');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to submit sponsorship request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const sponsorshipTypes = [
    { value: 'platinum', label: 'Platinum Sponsor' },
    { value: 'gold', label: 'Gold Sponsor' },
    { value: 'silver', label: 'Silver Sponsor' },
    { value: 'bronze', label: 'Bronze Sponsor' },
    { value: 'in-kind', label: 'In-Kind Sponsor' },
    { value: 'media', label: 'Media Partner' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div>
          <label className="form-label">
            <Building className="h-4 w-4 inline mr-2" />
            Company Name
          </label>
          <input
            {...register('companyName')}
            type="text"
            className="form-input"
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className="form-label">Contact Person</label>
          <input
            {...register('contactPerson')}
            type="text"
            className="form-input"
            placeholder="Enter contact person name"
          />
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-destructive">{errors.contactPerson.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="form-label">
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="form-input"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="form-label">
            <Phone className="h-4 w-4 inline mr-2" />
            Phone
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="form-input"
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Sponsorship Type */}
        <div>
          <label className="form-label">Sponsorship Type</label>
          <select {...register('sponsorshipType')} className="form-input">
            <option value="">Select sponsorship type</option>
            {sponsorshipTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.sponsorshipType && (
            <p className="mt-1 text-sm text-destructive">{errors.sponsorshipType.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="form-label">
            <DollarSign className="h-4 w-4 inline mr-2" />
            Amount ($)
          </label>
          <input
            {...register('amount')}
            type="number"
            min="1"
            step="0.01"
            className="form-input"
            placeholder="Enter sponsorship amount"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="form-label">
          <FileText className="h-4 w-4 inline mr-2" />
          Additional Message (Optional)
        </label>
        <textarea
          {...register('message')}
          rows={4}
          className="form-input"
          placeholder="Any additional information or requirements..."
        />
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-primary mb-2">Sponsorship Benefits</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Logo placement on event materials</li>
          <li>• Social media mentions and promotion</li>
          <li>• Networking opportunities with attendees</li>
          <li>• Brand visibility during the event</li>
          <li>• Post-event recognition and thank you</li>
        </ul>
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
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default SponsorshipForm;