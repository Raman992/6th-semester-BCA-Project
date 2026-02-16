import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { database } from '../../Appwrite.jsx';
import MovieForm from './MovieForm';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;

  useEffect(() => {
    fetchMovies();
  }, [searchTerm]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const queries = [Query.limit(50), Query.orderDesc('createdAt')];
      
      if (searchTerm) {
        queries.push(Query.search('title', searchTerm));
      }

      const response = await database.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        queries
      );
      setMovies(response.documents);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="table-search"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Poster</th>
                <th className="text-left py-3 px-4 text-gray-400">Title</th>
                <th className="text-left py-3 px-4 text-gray-400">Release Date</th>
                <th className="text-left py-3 px-4 text-gray-400">Rating</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.$id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-500"></i>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white">{movie.title}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-yellow ">
                      {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(movie)}
                      className="icon-btn edit"
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(movie.$id)}
                      className="icon-btn delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movies.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No movies found
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