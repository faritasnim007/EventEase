import React from 'react';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

function Layout({ children }) {
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="logo-title">
          <img src={logo} alt="EventEase Logo" className="logo" />
          <span className="eventease-name">EVENTEASE</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
