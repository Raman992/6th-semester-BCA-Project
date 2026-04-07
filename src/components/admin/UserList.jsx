import { Functions } from "appwrite";
import React, { useState, useEffect } from "react";
import { Client, Account, Databases, Query } from "appwrite";
import "./admin.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

  const account = new Account(client);
  const databases = new Databases(client);
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USER_PREFS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_PREFS_COLLECTION_ID;

  useEffect(() => {
    fetchUsers();
  }, []);

  const functions = new Functions(client);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const execution = await functions.createExecution(
        import.meta.env.VITE_APPWRITE_GET_USERS_FUNCTION_ID,
      );

      const result = JSON.parse(execution.responseBody);

      setUsers(result.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const userPrefs = users.find((u) => u.userId === userId);
      if (userPrefs) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_PREFS_COLLECTION_ID,
          userPrefs.$id,
          {
            isAdmin: !currentStatus,
          },
        );
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert("Error updating admin status");
    }
  };

  const deleteUser = async (user) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await functions.createExecution(
          import.meta.env.VITE_APPWRITE_DELETE_USER_FUNCTION_ID,
          JSON.stringify({
            userId: user.$id,
            prefsId: user.prefsId,
          }),
        );

        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Manage Users
          <span className="user-count">{filteredUsers.length}</span>
        </div>
        <div className="search-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading users...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.$id}>
                  <td>
                    <div className="user-info">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name || "User"}&background=a855f7&color=fff&bold=true`}
                        alt={user.name}
                        className="user-avatar"
                      />
                      <span className="user-name">
                        {user.name || "Unnamed User"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email || "N/A"}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteUser(user)}
                      className="icon-btn delete"
                      title="Delete user"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <svg
                className="empty-state-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
              </svg>
              <h3 className="empty-state-title">No users found</h3>
              <p className="empty-state-text">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;
