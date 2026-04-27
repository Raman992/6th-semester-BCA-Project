import React, { useState } from 'react';
import noMoviePoster from "/noMoviePoster.jpg";
import { isBookmarked as checkIsBookmarked, saveBookmark, removeBookmark } from "../Appwrite.jsx";

const MovieCard = ({ movie, onClick, user }) => {
  const { title, vote_average, poster_path, release_date, original_language, $id: movieId } = movie;
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);

  // Check if movie is bookmarked when component mounts or user changes
  React.useEffect(() => {
    if (user && user.$id) {
      const checkBookmarkStatus = async () => {
        const bookmarked = await checkIsBookmarked(user.$id, movieId);
        setIsBookmarkedState(bookmarked);
      };
      checkBookmarkStatus();
    }
  }, [user, movieId]);

  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation(); // Prevent triggering the movie click
    if (!user || !user.$id) return;

    setIsBookmarking(true);
    try {
      if (isBookmarkedState) {
        await removeBookmark(user.$id, movieId);
        setIsBookmarkedState(false);
      } else {
        await saveBookmark(user.$id, movieId, movie);
        setIsBookmarkedState(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsBookmarking(false);
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

      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkClick}
        className={`bookmark-btn ${isBookmarkedState ? 'bookmarked' : ''} ${isBookmarking ? 'loading' : ''}`}
        aria-label={isBookmarkedState ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        <i className="fa-solid fa-bookmark"></i>
      </button>

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