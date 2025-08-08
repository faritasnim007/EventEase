import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signin = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signin', form);
      login(res.data);
      navigate('/'); // Redirect to event list or home
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-white">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Sign In</h2>
  
      <form onSubmit={handleSubmit} className="space-y-6">
       <input
         type="email"
         name="email"
         placeholder="Email"
         value={form.email}
         onChange={handleChange}
         required
         className="input input-bordered w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="input input-bordered w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
        />
        {error && <p className="text-red-600 font-semibold">{error}</p>}
        <button 
           type="submit" 
           className="btn btn-primary w-full py-3 text-lg font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </form>

       <p className="mt-6 text-center text-gray-700">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
    </div>
  );
};

export default Signin;    
