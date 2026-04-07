import { useState } from "react";
import { updateUserName, updateUserEmail, updateUserPassword, logout } from "../Appwrite.jsx";

const UserDashboard = ({ user, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const clearMessage = () => setTimeout(() => setMessage({ type: "", text: "" }), 3000);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const updatedUser = await updateUserName(name);
      onUpdateUser(updatedUser);
      setMessage({ type: "success", text: "Name updated successfully!" });
      clearMessage();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update name" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const updatedUser = await updateUserEmail(email, currentPassword);
      onUpdateUser(updatedUser);
      setCurrentPassword("");
      setMessage({ type: "success", text: "Email updated successfully!" });
      clearMessage();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update email" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      await updateUserPassword(newPassword, currentPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Password updated successfully!" });
      clearMessage();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    window.location.reload();
  };

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>Account Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="dashboard-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateName}>
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>User ID</label>
                <input type="text" value={user?.$id || ''} disabled />
              </div>
              <div className="form-group">
                <label>Account Created</label>
                <input type="text" value={new Date(user?.$createdAt).toLocaleDateString() || ''} disabled />
              </div>
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Name'}
              </button>
            </form>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleUpdateEmail}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Password (to confirm)</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        <div className="dashboard-footer">
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;