import { useState } from 'react';
import {
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);

  const eventUrl = `${window.location.origin}/events/${event._id}`;
  const eventTitle = event.title;
  const eventDescription = event.description.substring(0, 100) + '...';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-700/10',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-600/10',
      url: `mailto:?subject=${encodeURIComponent(`Event: ${eventTitle}`)}&body=${encodeURIComponent(`I thought you might be interested in this event:\n\n${eventTitle}\n${eventDescription}\n\nCheck it out: ${eventUrl}`)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${eventTitle}\n${eventUrl}`)}`,
    },
  ];

  const handleShare = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Event Preview */}
      <div className="bg-accent/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{eventDescription}</p>
        <div className="text-xs text-muted-foreground">
          {new Date(event.date).toLocaleDateString()} • {event.location}
        </div>
      </div>

      {/* Copy Link */}
      <div>
        <label className="form-label">Share Link</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={eventUrl}
            readOnly
            className="form-input flex-1"
          />
          <button
            onClick={copyToClipboard}
            className="btn-outline flex items-center"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Share Options */}
      <div>
        <label className="form-label">Share on Social Media</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option.url)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors ${option.bgColor}`}
            >
              <option.icon className={`h-5 w-5 ${option.color}`} />
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <button onClick={onClose} className="btn-primary">
          Done
        </button>
      </div>
    </div>
  );
};

export default ShareModal;