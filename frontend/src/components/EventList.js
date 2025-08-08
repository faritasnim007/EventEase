import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events')
      .then(res => setEvents(res.data))
      .catch(console.error);
  }, []);

  // Always get the token inside the function before using it
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token'); // <-- ADDED HERE
    if (!token) {
      alert("You must be signed in to delete events.");
      return;
    }

    if (window.confirm('Delete event?')) {
      try {
        await axios.delete(`/api/events/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setEvents(events => events.filter(e => e._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting event');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Link to="/create-event" className="btn btn-success mb-4">+ Add Event</Link>
      <ul>
        {events.map(ev => (
          <li key={ev._id} className="card mb-4 p-4">
            <h2 className="text-xl font-bold">{ev.title}</h2>
            <p>Date: {new Date(ev.date).toLocaleDateString()}</p>
            <p>Location: {ev.location}</p>
            <p>{ev.description}</p>
            <Link to={`/edit-event/${ev._id}`} className="btn btn-primary mr-2">Edit</Link>
            <button className="btn btn-error" onClick={() => handleDelete(ev._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
