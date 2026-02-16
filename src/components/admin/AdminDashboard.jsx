import React, { useState, useEffect } from "react";
import { database } from "../../Appwrite.jsx";
import MovieForm from "./MovieForm";
import MovieList from "./MovieList";
import UserList from "./UserList";
import TrendingSearches from "./TrendingSearches";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalSearches: 0,
  });

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_MOVIES_COLLECTION_ID;
  const SEARCH_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const movies = await database.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
      );
      const searches = await database.listDocuments(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
      );

      // Get total users (you'll need to set up a users collection or use Appwrite users API)
      // This is a placeholder - you might need to create a users collection separately

      setStats({
        totalMovies: movies.total,
        totalUsers: 0, // Update this with actual user count
        totalSearches: searches.total,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="admin-bg">
      {/* Header */}
      <header className="admin-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="admin-title">Admin Dashboard</h1>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-back px-4 py-2 text-white"
            >
              Back to Site
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stat-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="stat-label">Total Movies</h3>
            <p className="stat-value text-white">{stats.totalMovies}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="stat-label">Total Users</h3>
            <p className="stat-value text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="stat-label">Total Searches</h3>
            <p className="stat-value text-white">{stats.totalSearches}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs mb-6">
          <button
            onClick={() => setActiveTab("movies")}
            className={`admin-tab ${activeTab === "movies" ? "active" : ""}`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`admin-tab ${activeTab === "movies" ? "active" : ""}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`admin-tab ${activeTab === "movies" ? "active" : ""}`}
          >
            Trending Searches
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-panel">
          {activeTab === "movies" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Manage Movies</h2>
                <button
                  onClick={() =>
                    document.getElementById("movieForm").showModal()
                  }
                  className="btn-primary px-4 py-2 text-white"
                >
                  Add New Movie
                </button>
              </div>
              <MovieList />
              <MovieForm onSuccess={fetchStats} />
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Manage Users
              </h2>
              <UserList />
            </div>
          )}

          {activeTab === "trending" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Trending Searches
              </h2>
              <TrendingSearches />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
