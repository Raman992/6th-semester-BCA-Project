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
    video: false
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
        video: movie.video || false
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
        tmdb_id: movie?.tmdb_id || Math.floor(Math.random() * 1000000),
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
  <dialog
    id="movieForm"
    className="w-full max-w-3xl rounded-2xl bg-gray-900 text-gray-100 shadow-2xl backdrop:bg-black/60"
    style={{ color: 'white' }}
  >
    <div className="modal-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {movie ? "Edit Movie" : "Add New Movie"}
        </h2>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-700/50 bg-red-900/30 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {/* Language */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Original Language</label>
            <input
              type="text"
              name="original_language"
              value={formData.original_language}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Overview */}
          <div className="md:col-span-2">
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Overview</label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              rows="4"
              className="input resize-none"
            />
          </div>

          {/* Poster */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Poster Path</label>
            <input
              type="text"
              name="poster_path"
              value={formData.poster_path}
              onChange={handleChange}
              placeholder="/poster.jpg"
              className="input"
            />
          </div>

          {/* Backdrop */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Backdrop Path</label>
            <input
              type="text"
              name="backdrop_path"
              value={formData.backdrop_path}
              onChange={handleChange}
              placeholder="/backdrop.jpg"
              className="input"
            />
          </div>

          {/* Release */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Release Date</label>
            <input
              type="date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Vote Average</label>
            <input
              type="number"
              name="vote_average"
              value={formData.vote_average}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
              className="input"
            />
          </div>

          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Vote Count</label>
            <input
              type="number"
              name="vote_count"
              value={formData.vote_count}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="genre-option flex items-center gap-2 text-sm text-gray-300">
Popularity</label>
            <input
              type="number"
              name="popularity"
              value={formData.popularity}
              onChange={handleChange}
              step="0.1"
              className="input"
            />
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="label mb-3 block">Genres</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {genreOptions.map((genre) => (
              <label
                key={genre.id}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
              >
                <input
                  type="checkbox"
                  checked={formData.genre_ids.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="accent-purple-600"
                />
                {genre.name}
              </label>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="adult"
              checked={formData.adult}
              onChange={handleChange}
              className="accent-purple-600"
            />
            Adult Content
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="video"
              checked={formData.video}
              onChange={handleChange}
              className="accent-purple-600"
            />
            Has Video
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
          </button>
        </div>
      </form>
    </div>
  </dialog>
);

};

export default MovieForm;