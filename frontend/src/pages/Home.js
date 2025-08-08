import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => (
<div className="max-w-2xl mx-auto mt-20 p-10 bg-white rounded-xl shadow-xl border border-gray-200 text-center">
  <h1 className="text-4xl font-extrabold mb-8 text-indigo-700">Welcome to Event Manager</h1>
  <div className="flex flex-col sm:flex-row justify-center gap-6">
    <Link
      to="/signin"
      className="btn btn-primary py-3 px-6 text-lg font-medium rounded-lg hover:bg-indigo-900 transition"
    >
      Sign In
    </Link>
    <Link
      to="/signup"
      className="btn btn-secondary py-3 px-6 text-lg font-medium rounded-lg hover:bg-gray-700 transition"
    >
      Sign Up
    </Link>
    <Link
      to="/"
      className="btn btn-success py-3 px-6 text-lg font-medium rounded-lg hover:bg-green-700 transition"
    >
      View Events
    </Link>
  </div>
</div>

);

export default Home;
