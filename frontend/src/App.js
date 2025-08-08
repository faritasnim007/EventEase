import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<EventList />} />
          <Route path="/create-event" element={<EventForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-event/:id" element={<EventForm isEdit={true} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
