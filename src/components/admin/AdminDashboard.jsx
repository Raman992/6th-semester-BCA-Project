import React, { useState, useEffect } from 'react';
import { database } from '../../Appwrite.jsx';
import MovieForm from './MovieForm';
import MovieList from './MovieList';
import UserList from './UserList';
import TrendingSearches from './TrendingSearches';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalSearches: 0
  });

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;
  const SEARCH_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const movies = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID);
      const searches = await database.listDocuments(DATABASE_ID, SEARCH_COLLECTION_ID);
      
      // Get total users (you'll need to set up a users collection or use Appwrite users API)
      // This is a placeholder - you might need to create a users collection separately
      
      setStats({
        totalMovies: movies.total,
        totalUsers: 0, // Update this with actual user count
        totalSearches: searches.total
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Back to Site
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Movies</h3>
            <p className="text-3xl font-bold text-white">{stats.totalMovies}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Searches</h3>
            <p className="text-3xl font-bold text-white">{stats.totalSearches}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'movies'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Trending Searches
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {activeTab === 'movies' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Manage Movies</h2>
                <button
                  onClick={() => document.getElementById('movieForm').showModal()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add New Movie
                </button>
              </div>
              <MovieList />
              <MovieForm onSuccess={fetchStats} />
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Manage Users</h2>
              <UserList />
            </div>
          )}

          {activeTab === 'trending' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Trending Searches</h2>
              <TrendingSearches />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;