import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/signup', formData);
      login(res.data);     // sets auth context and token
      navigate('/dashboard'); // this redirects the user!
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-white">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input input-bordered w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input input-bordered w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        {error && <p className="text-red-600 font-semibold">{error}</p>}
        <button type="submit" className="btn btn-primary w-full py-3 text-lg font-semibold rounded-md hover:bg-blue-700 transition">
          Sign Up
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700">
        Already have an account?{' '}
        <Link to="/signin" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;
