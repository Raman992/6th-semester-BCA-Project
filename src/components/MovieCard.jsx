import React from 'react';
import noMoviePoster from "/noMoviePoster.jpg";

const MovieCard = ({ movie, onClick }) => {
  const { title, vote_average, poster_path, release_date, original_language } = movie;

  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <img
        src={poster_path
          ? `https://image.tmdb.org/t/p/w500/${poster_path}`
          : noMoviePoster}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <i className="fa-solid fa-heart"></i>
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language || 'N/A'}</p>

          <span>•</span>
          <p className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;