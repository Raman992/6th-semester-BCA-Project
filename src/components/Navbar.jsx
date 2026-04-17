import React, { useState } from "react";
import { logout } from "../Appwrite.jsx";
import { useAdmin } from "../context/AdminContext";

const Navbar = ({ user, onLogout, onShowPreferences, onShowDashboard, onShowBookmarks }) => {
  const { isAdmin } = useAdmin();
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleShowBookmarks = () => {
    setShowBookmarks(true);
    onShowBookmarks();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => window.location.href = '/'}>
          <h1>
            Movies<span className="text-gradient">OK</span>
          </h1>
        </div>

        {user && (
          <div className="navbar-user">
            <div className="navbar-actions">
              {/* Only show admin button if user is admin */}
              {isAdmin && (
                <a href="/admin/dashboard" className="nav-button preferences-button">
                  <i className="fa-solid fa-user-shield"></i>
                  Admin
                </a>
              )}

              <div className="user-info">
                <button
                  onClick={onShowDashboard}
                  className="nav-button preferences-button"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=a855f7&color=fff`}
                    alt={user.name}
                    className="user-avatar"
                  />
                  <span className="user-name">{user.name}</span>
                </button>
              </div>
              <button
                onClick={onShowPreferences}
                className="nav-button preferences-button"
              >
                <i className="fa-solid fa-sliders"></i>
                Preferences
              </button>
              <button
                onClick={handleShowBookmarks}
                className="nav-button preferences-button"
              >
                <i className="fa-solid fa-bookmark"></i>
                Bookmarks
              </button>
              <button
                onClick={handleLogout}
                className="nav-button logout-button"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
