import React, { useEffect, useRef } from 'react';
import noMoviePoster from "/noMoviePoster.jpg";

const MovieModal = ({ movie, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!movie) return null;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : noMoviePoster;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : posterUrl;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const genreNames = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  const getGenreNames = (genreIds) => {
    if (!genreIds || !Array.isArray(genreIds)) return [];
    return genreIds.map(id => genreNames[id] || 'Unknown').filter(Boolean);
  };

  return (
    <div className="movie-modal-overlay">
      <div className="movie-modal" ref={modalRef}>
        {/* Backdrop Image */}
        <div 
          className="movie-modal-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="movie-modal-backdrop-overlay"></div>
        </div>

        {/* Close Button */}
        <button className="movie-modal-close" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>

        {/* Content */}
        <div className="movie-modal-content">
          {/* Poster */}
          <div className="movie-modal-poster">
            <img src={posterUrl} alt={movie.title} />
          </div>

          {/* Details */}
          <div className="movie-modal-details">
            <h2 className="movie-modal-title">{movie.title}</h2>
            
            {/* Meta Info */}
            <div className="movie-modal-meta">
              {movie.release_date && (
                <span className="movie-modal-year">
                  {formatDate(movie.release_date)}
                </span>
              )}
              {movie.vote_average > 0 && (
                <span className="movie-modal-rating">
                  <i className="fa-solid fa-star"></i>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie.runtime && (
                <span className="movie-modal-runtime">
                  <i className="fa-regular fa-clock"></i>
                  {formatRuntime(movie.runtime)}
                </span>
              )}
              {movie.original_language && (
                <span className="movie-modal-language">
                  <i className="fa-solid fa-language"></i>
                  {movie.original_language.toUpperCase()}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genre_ids && movie.genre_ids.length > 0 && (
              <div className="movie-modal-genres">
                {getGenreNames(movie.genre_ids).map(genre => (
                  <span key={genre} className="movie-modal-genre">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="movie-modal-overview">
                <h3>Overview</h3>
                <p>{movie.overview}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="movie-modal-info-grid">
              {movie.vote_count > 0 && (
                <div className="info-item">
                  <span className="info-label">Votes</span>
                  <span className="info-value">{movie.vote_count.toLocaleString()}</span>
                </div>
              )}
              {movie.popularity > 0 && (
                <div className="info-item">
                  <span className="info-label">Popularity</span>
                  <span className="info-value">{Math.round(movie.popularity)}</span>
                </div>
              )}
              {movie.adult !== undefined && (
                <div className="info-item">
                  <span className="info-label">Audience</span>
                  <span className="info-value">
                    {movie.adult ? '18+' : 'All Ages'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="movie-modal-actions">
              {movie.tmdb_id && (
                <a
                  href={`https://www.themoviedb.org/movie/${movie.tmdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-btn modal-btn-tmdb"
                >
                  <i className="fa-brands fa-imdb"></i>
                  View on TMDB
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;