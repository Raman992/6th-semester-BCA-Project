import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { database } from '../../Appwrite.jsx';
import MovieForm from './MovieForm';
import "./admin.css";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;

  useEffect(() => {
    setCursor(null);
    setHasMore(false);
    fetchMovies();
  }, [searchTerm]);

  const fetchMovies = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const queries = [Query.limit(50), Query.orderDesc('createdAt')];
      
      if (searchTerm) {
        queries.push(Query.contains('title', [searchTerm]));
      }

      if (loadMore && cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await database.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        queries
      );

      if (loadMore) {
        setMovies(prev => [...prev, ...response.documents]);
      } else {
        setMovies(response.documents);
      }
      
      setCursor(response.cursor);
      setHasMore(response.documents.length === 50);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchMovies(true);
  };

  const handleDelete = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await database.deleteDocument(DATABASE_ID, MOVIES_COLLECTION_ID, movieId);
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Error deleting movie');
      }
    }
  };

  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedMovie(null);
    fetchMovies();
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <path d="M7 3v18"/>
            <path d="m21 15-3-3-3 3"/>
            <path d="m21 9-3 3-3-3"/>
          </svg>
          All Movies
          <span className="user-count">{movies.length}</span>
        </div>
        <div className="search-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading movies...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Release Date</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.$id}>
                  <td>
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-poster"
                      />
                    ) : (
                      <div className="movie-poster-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                          <path d="M7 3v18"/>
                          <path d="m21 15-3-3-3 3"/>
                          <path d="m21 9-3 3-3-3"/>
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="movie-title">{movie.title}</span>
                  </td>
                  <td>
                    <span className="movie-year">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-yellow">
                      {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="icon-btn edit"
                        title="Edit movie"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(movie.$id)}
                        className="icon-btn delete"
                        title="Delete movie"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          <line x1="10" x2="10" y1="11" y2="17"/>
                          <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movies.length === 0 && (
            <div className="empty-state">
              <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <path d="M7 3v18"/>
                <path d="m21 15-3-3-3 3"/>
                <path d="m21 9-3 3-3-3"/>
              </svg>
              <h3 className="empty-state-title">No movies found</h3>
              <p className="empty-state-text">Add your first movie to get started</p>
            </div>
          )}

          {hasMore && (
            <div className="load-more-container">
              <button 
                onClick={handleLoadMore} 
                className="load-more-btn"
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <MovieForm
          movie={selectedMovie}
          onSuccess={handleFormClose}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MovieList;