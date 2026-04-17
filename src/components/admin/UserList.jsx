import { Functions } from "appwrite";
import React, { useState, useEffect } from "react";
import { Client, Account, Databases, Query } from "appwrite";
import "./admin.css";
import { Users, UserX, Search, Trash2, } from "lucide-react";

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
          <Users size={20} />
          Manage Users
          <span className="user-count">{filteredUsers.length}</span>
        </div>
        <div className="search-wrapper">
          <Search size={18} />
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
            <img src="/turkeyloading.gif" alt="loading" />
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
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <UserX size={48} className="empty-state-icon" />
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
