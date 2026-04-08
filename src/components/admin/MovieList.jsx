import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { database } from '../../Appwrite.jsx';
import MovieForm from './MovieForm';
import "./admin.css";
import { Search, Edit, Trash2, Image } from "lucide-react";

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
          All Movies
          <span className="user-count">{movies.length}</span>
        </div>
        <div className="search-wrapper">
          <Search size={18} />
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
                        <Image size={32} />
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
                       <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.$id)}
                        className="icon-btn delete"
                        title="Delete movie"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movies.length === 0 && (
            <div className="empty-state">
                <Image size={48} className="empty-state-icon" />
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