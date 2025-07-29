import React, { useState, useRef, useEffect } from "react";
import "./UserProfileDropdown.css";

const UserProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="Profile"
          className="profile-avatar"
          onClick={toggleDropdown}
        />
      ) : (
        <div
          className="profile-avatar"
          onClick={toggleDropdown}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 18
          }}
        >
          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
        </div>
      )}
      {open && (
        <div className="dropdown-menu">
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
          <hr />
          <ul className="menu-options">
            <li>
              <button onClick={() => alert("Settings Clicked")}>Settings</button>
            </li>
            <li>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown; 