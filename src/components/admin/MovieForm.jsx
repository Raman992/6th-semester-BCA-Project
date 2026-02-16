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
    <dialog id="movieForm" className="bg-gray-800 rounded-lg p-0 w-full max-w-4xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {movie ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Original Language
              </label>
              <input
                type="text"
                name="original_language"
                value={formData.original_language}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Overview
              </label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Poster Path
              </label>
              <input
                type="text"
                name="poster_path"
                value={formData.poster_path}
                onChange={handleChange}
                placeholder="/path/to/poster.jpg"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Backdrop Path
              </label>
              <input
                type="text"
                name="backdrop_path"
                value={formData.backdrop_path}
                onChange={handleChange}
                placeholder="/path/to/backdrop.jpg"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Release Date
              </label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Vote Average
              </label>
              <input
                type="number"
                name="vote_average"
                value={formData.vote_average}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Vote Count
              </label>
              <input
                type="number"
                name="vote_count"
                value={formData.vote_count}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Popularity
              </label>
              <input
                type="number"
                name="popularity"
                value={formData.popularity}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Genres
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {genreOptions.map(genre => (
                <label key={genre.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.genre_ids.includes(genre.id)}
                    onChange={() => handleGenreToggle(genre.id)}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300 text-sm">{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="adult"
                checked={formData.adult}
                onChange={handleChange}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-gray-300">Adult Content</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="video"
                checked={formData.video}
                onChange={handleChange}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-gray-300">Has Video</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : movie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default MovieForm;