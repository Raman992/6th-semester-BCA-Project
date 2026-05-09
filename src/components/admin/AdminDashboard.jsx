import React, { useState, useEffect } from "react";
import { database } from "../../Appwrite.jsx";
import MovieForm from "./MovieForm";
import MovieList from "./MovieList";
import UserList from "./UserList";
import TrendingSearches from "./TrendingSearches";
import "./admin.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalSearches: 0,
  });

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;
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

      setStats({
        totalMovies: movies.total,
        totalUsers: 0,
        totalSearches: searches.total,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAddMovie = () => {
    setSelectedMovie(null);
    setShowMovieForm(true);
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setShowMovieForm(true);
  };

  const handleCloseForm = () => {
    setShowMovieForm(false);
    setSelectedMovie(null);
  };

  const handleSuccess = () => {
    fetchStats();
    handleCloseForm();
  };

  return (
    <div className="admin-bg">
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage your movies, users, and search analytics</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-back"
            style={{ marginTop: "16px" }}
          >
            ← Back to Site
          </button>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-label">[+] Total Movies</h3>
            <p className="stat-value">{stats.totalMovies}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">[-] Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">[x] Total Searches</h3>
            <p className="stat-value">{stats.totalSearches}</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("movies")}
            className={`btn-tab ${activeTab === "movies" ? "active" : ""}`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`btn-tab ${activeTab === "users" ? "active" : ""}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`btn-tab ${activeTab === "trending" ? "active" : ""}`}
          >
            Trending Searches
          </button>
        </div>

        <div className="admin-section">
          {activeTab === "movies" && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Manage Movies</h2>
                <button onClick={handleAddMovie} className="btn-primary">
                  + Add New Movie
                </button>
              </div>
              <MovieList onEditMovie={handleEditMovie} />
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2 className="section-title">Manage Users</h2>
              <UserList />
            </div>
          )}

          {activeTab === "trending" && (
            <div>
              <h2 className="section-title">Trending Searches</h2>
              <TrendingSearches />
            </div>
          )}
        </div>
      </div>

      {showMovieForm && (
        <MovieForm
          movie={selectedMovie}
          onSuccess={handleSuccess}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default AdminDashboard;