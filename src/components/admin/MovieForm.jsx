import React, { useState, useEffect } from 'react';
import { ID } from 'appwrite';
import { database } from '../../Appwrite.jsx';

const MovieForm = ({ movie, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    vote_average: 0,
    vote_count: 0,
    genre_ids: [],
    original_language: '',
    popularity: 0,
    adult: false,
    video: false,
    TrailerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;

  const genreOptions = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  useEffect(() => {
    const dialog = document.getElementById("movieForm");
    if (dialog) {
      dialog.showModal();
    }
  }, []);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        overview: movie.overview || '',
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || '',
        release_date: movie.release_date || '',
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        genre_ids: movie.genre_ids || [],
        original_language: movie.original_language || '',
        popularity: movie.popularity || 0,
        adult: movie.adult || false,
        video: movie.video || false,
        TrailerId: movie.TrailerId || ''
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreToggle = (genreId) => {
    setFormData(prev => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter(id => id !== genreId)
        : [...prev.genre_ids, genreId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const movieData = {
        ...formData,
        tmdb_id: movie?.tmdb_id || movie?.movie_id || Math.floor(Math.random() * 1000000),
        vote_average: parseFloat(formData.vote_average),
        vote_count: parseInt(formData.vote_count),
        popularity: parseFloat(formData.popularity)
      };

      if (movie?.$id) {
        // Update existing movie
        await database.updateDocument(
          DATABASE_ID,
          MOVIES_COLLECTION_ID,
          movie.$id,
          movieData
        );
      } else {
        // Create new movie
        await database.createDocument(
          DATABASE_ID,
          MOVIES_COLLECTION_ID,
          ID.unique(),
          {
            ...movieData,
            createdAt: new Date().toISOString()
          }
        );
      }

      onSuccess();
      if (onClose) onClose();
    } catch (error) {
      setError('Error saving movie: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="admin-panel modal-content movie-modal">
        {/* Header */}
        <div className="modal-header section-header">
          <h2 className="section-title">
            {movie ? "Edit Movie" : "Add New Movie"}
          </h2>

          <button className="icon-btn delete" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="badge badge-red error-banner">
              <p>{error}</p>
            </div>
          )}

          <div className="form-scroll-viewport">
            <div className="form-group">
              <label className="input-label">Title *</label>
              <input
                className="table-search modal-input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="input-label">Original Language</label>
                <input
                  className="table-search modal-input"
                  type="text"
                  name="original_language"
                  value={formData.original_language}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Release Date</label>
                <input
                  className="table-search modal-input"
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Overview</label>
              <textarea
                className="table-search modal-input"
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="input-label">Poster Path</label>
                <input
                  className="table-search modal-input"
                  type="text"
                  name="poster_path"
                  value={formData.poster_path}
                  onChange={handleChange}
                  placeholder="/poster.jpg"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Backdrop Path</label>
                <input
                  className="table-search modal-input"
                  type="text"
                  name="backdrop_path"
                  value={formData.backdrop_path}
                  onChange={handleChange}
                  placeholder="/backdrop.jpg"
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="input-label">Vote Average</label>
                <input
                  className="table-search modal-input"
                  type="number"
                  name="vote_average"
                  value={formData.vote_average}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Vote Count</label>
                <input
                  className="table-search modal-input"
                  type="number"
                  name="vote_count"
                  value={formData.vote_count}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Popularity</label>
                <input
                  className="table-search modal-input"
                  type="number"
                  name="popularity"
                  value={formData.popularity}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Genres</label>
              <div className="genre-pill-container">
                {genreOptions.map((genre) => (
                  <div
                    key={genre.id}
                    className={`genre-pill ${formData.genre_ids.includes(genre.id) ? 'active' : ''}`}
                    onClick={() => handleGenreToggle(genre.id)}
                  >
                    {genre.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="checkbox-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="adult"
                  checked={formData.adult}
                  onChange={handleChange}
                />
                Adult Content
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="video"
                  checked={formData.video}
                  onChange={handleChange}
                />
                Has Video
              </label>
              {formData.video &&(<input
                className="table-search modal-input"
                type="text"
                name="TrailerId"
                value={formData.TrailerId}
                onChange={handleChange}
                placeholder="Trailer ID"
              />)}
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="reset-btn"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="load-more-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;