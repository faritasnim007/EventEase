import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EventForm = ({ isEdit = false }) => {
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const navigate = useNavigate();
  const { id } = useParams();

  // If editing, fetch the event details
  useEffect(() => {
    if (isEdit && id) {
      axios.get(`/api/events/${id}`)
        .then(res => setForm({
          title: res.data.title,
          date: res.data.date.substring(0, 10), // YYYY-MM-DD for input
          location: res.data.location,
          description: res.data.description
        }))
        .catch(console.error);
    }
  }, [isEdit, id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // <-- ADDED HERE
    if (!token) {
      alert("You must be signed in to create or edit events.");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`/api/events/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/events', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="textarea textarea-bordered w-full"
      ></textarea>
      <button type="submit" className="btn btn-primary w-full">
        {isEdit ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
};

export default EventForm;
