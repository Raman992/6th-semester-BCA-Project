import React from "react";
import { logout } from "../Appwrite.jsx";
import { useAdmin } from "../context/AdminContext";

const Navbar = ({ user, onLogout, onShowPreferences, onShowDashboard }) => {
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
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
                  <i className="fa-solid fa-shield-haltered"></i>
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
