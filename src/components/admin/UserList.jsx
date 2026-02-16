import React, { useState, useEffect } from 'react';
import { Client, Account, Databases, Query } from 'appwrite';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

  const account = new Account(client);
  const databases = new Databases(client);
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USER_PREFS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_PREFS_COLLECTION_ID;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Note: Appwrite doesn't allow listing all users directly from client-side
      // You'll need to create a serverless function or use the Appwrite server SDK
      // For now, we'll fetch users from preferences collection
      const prefs = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID
      );
      
      setUsers(prefs.documents);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      // Update user preferences to toggle admin status
      const userPrefs = users.find(u => u.userId === userId);
      if (userPrefs) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_PREFS_COLLECTION_ID,
          userPrefs.$id,
          {
            isAdmin: !currentStatus
          }
        );
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Error updating admin status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Find and delete user preferences
        const userPrefs = users.find(u => u.userId === userId);
        if (userPrefs) {
          await databases.deleteDocument(
            DATABASE_ID,
            USER_PREFS_COLLECTION_ID,
            userPrefs.$id
          );
        }
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-gray-400">Joined</th>
                <th className="text-left py-3 px-4 text-gray-400">Genres</th>
                <th className="text-left py-3 px-4 text-gray-400">Admin</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.$id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=a855f7&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <span className="text-white">{user.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{user.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-500 rounded text-sm">
                      {user.genres?.length || 0} selected
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleAdminStatus(user.userId, user.isAdmin)}
                      className={`px-3 py-1 rounded text-sm ${
                        user.isAdmin
                          ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30'
                          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                      }`}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteUser(user.userId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;