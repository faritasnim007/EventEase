import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signup', formData);
      login(res.data);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required type="email" />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
