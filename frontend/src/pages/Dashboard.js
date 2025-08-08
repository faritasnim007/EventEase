import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper: Gallery display
const PhotoGallery = ({ photos }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {photos?.length > 0 ? (
      photos.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={`Event photo ${idx + 1}`}
          className="w-28 h-28 object-cover border rounded"
        />
      ))
    ) : (
      <div className="text-gray-500">No photos yet.</div>
    )}
  </div>
);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch events on load
  useEffect(() => {
    axios
      .get('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvents(res.data))
      .catch((err) => setError('Could not fetch events.'));
  }, [token]);

  // Handle event selection
  const openEvent = (event) => {
    setSelectedEvent(event);
    setSelectedFiles([]);
    setError('');
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  // Upload images to backend
  const handleUpload = async () => {
    if (!selectedEvent || selectedFiles.length === 0) {
      setError('Please select an event and photos.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('photos', file));
      await axios.post(`/api/events/${selectedEvent._id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh event details after upload
      const res = await axios.get(`/api/events/${selectedEvent._id}`);
      setSelectedEvent(res.data);

      // Update events list with new photos
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === res.data._id ? res.data : ev
        )
      );
      setSelectedFiles([]);
    } catch (err) {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Dashboard</h1>
      <div className="flex gap-10">
        {/* Event List */}
        <div className="w-1/3">
          <h2 className="text-xl mb-4">Your Events</h2>
          <ul>
            {events.map((ev) => (
              <li
                key={ev._id}
                className={`cursor-pointer p-3 mb-2 rounded border ${selectedEvent?._id === ev._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => openEvent(ev)}
              >
                <div className="font-semibold">{ev.title}</div>
                <div className="text-sm text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Gallery/Upload Section */}
        <div className="flex-1">
          {selectedEvent ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                "{selectedEvent.title}" Gallery
              </h2>
              <PhotoGallery photos={selectedEvent.photos} />
              <div className="mt-6">
                <label className="block font-medium mb-2">Upload Photos:</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mb-2"
                  disabled={uploading}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </>
          ) : (
            <div className="text-gray-600 mt-16">Select an event to manage photos.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
