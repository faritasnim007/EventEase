import React from 'react';
import '../styles/HomePage.css';
import Layout from './Layout';

import pic1 from '../assets/pic1.jpg';
import pic2 from '../assets/pic2.jpg';
import pic3 from '../assets/pic3.jpg';

function HomePage() {
  return (
    <Layout>
      <div className="homepage-container">
        <h1 className="welcome-msg">
          WELCOME TO EVENTEASE - Smart Campus Event Management System
        </h1>
        <div className="button-group">
          <a href="/register" className="homepage-btn">Register</a>
          <a href="/login" className="homepage-btn">Login</a>
        </div>
        <h2 className="explore-title">Explore Events</h2>
        <div className="photos-section">
          <img src={pic1} alt="Event 1" className="event-photo"/>
          <img src={pic2} alt="Event 2" className="event-photo"/>
          <img src={pic3} alt="Event 3" className="event-photo"/>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;
