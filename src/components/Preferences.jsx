import React, { useState, useEffect } from 'react';
import { saveUserPreferences } from '../Appwrite.jsx';

const genreList = [
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
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const Preferences = ({ userId, onSave, initialPreferences }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize with empty array if initialPreferences is null
  useEffect(() => {
    if (initialPreferences && initialPreferences.genres) {
      setSelectedGenres(initialPreferences.genres);
    } else {
      setSelectedGenres([]);
    }
  }, [initialPreferences]);

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedGenres.length === 0) {
      setMessage('Please select at least one genre');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      await saveUserPreferences(userId, {
        genres: selectedGenres,
      });
      setMessage('Preferences saved successfully!');
      onSave({ genres: selectedGenres });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving preferences. Please try again.'+error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preferences-container">
      <div className="preferences-card">
        <h2>Your Movie Preferences</h2>
        <p className="preferences-subtitle">
          Select your favorite genres to get personalized recommendations
        </p>

        <form onSubmit={handleSubmit}>
          <div className="genres-grid">
            {genreList.map(genre => (
              <div
                key={genre.id}
                className={`genre-chip ${
                  selectedGenres.includes(genre.id) ? 'selected' : ''
                }`}
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
              </div>
            ))}
          </div>

          <div className="selected-count">
            {selectedGenres.length} genre(s) selected
            {selectedGenres.length === 0 && (
              <span className="hint"> (Select at least one)</span>
            )}
          </div>

          {message && (
            <p className={`message ${message.includes('Error') ? 'error' : message.includes('Please') ? 'warning' : 'success'}`}>
              {message}
            </p>
          )}

          <div className="preferences-actions">
            <button
              type="submit"
              disabled={loading || selectedGenres.length === 0}
              className="save-button"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (selectedGenres.length > 0) {
                  onSave({ genres: selectedGenres });
                } else {
                  onSave({ genres: [] });
                }
              }}
              className="skip-button"
            >
              {selectedGenres.length === 0 ? 'Continue without preferences' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Preferences;