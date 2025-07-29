import React from 'react';
import UserProfileDropdown from './UserProfileDropdown';
import './AdminDashboard.css';

const Header = ({ title, onHamburgerClick, showHamburger, user }) => (
  <header className="header" style={{ display: 'flex', alignItems: 'center', position: 'relative', minHeight: 56 }}>
    {showHamburger && (
      <button
        className="sidebar-hamburger"
        aria-label="Open sidebar"
        onClick={onHamburgerClick}
        style={{ marginRight: 12, background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
      >
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>
    )}
    <div className="page-title" style={{ flex: 1, textAlign: 'center' }}>{title}</div>
    <div className="header-actions" style={{ marginLeft: 'auto' }}>
      <UserProfileDropdown user={user} onLogout={user?.onLogout} />
    </div>
  </header>
);

export default Header; 