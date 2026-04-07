import React, { useEffect, useRef, useState } from "react";
import noMoviePoster from "/noMoviePoster.jpg";
import { getUserBookmarks, removeBookmark } from "../Appwrite.jsx";

const BookmarkModal = ({ user, onClose }) => {
  const modalRef = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRemoveBookmark = async (movieId) => {
    try {
      // 1. Remove from Appwrite database
      await removeBookmark(user.$id, movieId);

      // 2. Update local state so the UI refreshes instantly
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((movie) => movie.movieId !== movieId),
      );
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      setErrorMessage("Could not remove bookmark.");
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Load bookmarks
    const loadBookmarks = async () => {
      if (!user || !user.$id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userBookmarks = await getUserBookmarks(user.$id);
        setBookmarks(userBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setErrorMessage("Error loading bookmarks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [user, onClose]);

  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="movie-modal-overlay">
        <div className="movie-modal">
          <div className="modal-content">
            <h2>Loading your bookmarks...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="movie-modal-overlay">
        <div className="movie-modal">
          <button className="movie-modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
          <div className="modal-content">
            <h2>Bookmarks</h2>
            <p className="text-red-500">{errorMessage}</p>
            <button onClick={onClose} className="modal-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-modal-overlay">
      <div className="movie-modal" ref={modalRef}>
        {/* Content */}
        <div className="modal-content">
          <h2>Bookmarks</h2>

          {bookmarks.length === 0 ? (
            <p className="text-center">
              You haven't bookmarked any movies yet.
            </p>
          ) : (
            <ul className="bookmarks-list">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.$id} className="bookmark-item">
                  <div className="bookmark-content">
                    <img
                      src={
                        bookmark.poster_path
                          ? `https://image.tmdb.org/t/p/w500/${bookmark.poster_path}`
                          : noMoviePoster
                      }
                      alt={bookmark.title}
                      className="bookmark-poster"
                    />
                    <div className="bookmark-details">
                      <h3>{bookmark.title}</h3>
                      <div className="bookmark-meta">
                        {bookmark.release_date && (
                          <span className="bookmark-year">
                            {formatDate(bookmark.release_date)}
                          </span>
                        )}
                        {bookmark.vote_average > 0 && (
                          <span className="bookmark-rating">
                            <i className="fa-solid fa-star"></i>
                            {bookmark.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.movieId)}
                        className="remove-bookmark-btn"
                        title="Remove from bookmarks"
                        type="button"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="modal-actions">
            <button onClick={onClose} className="modal-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModal;
