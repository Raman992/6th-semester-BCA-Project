import { useEffect, useState, useRef } from "react";
import "./App.css";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Preferences from "./components/Preferences.jsx";
import Navbar from "./components/Navbar.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import BookmarkModal from "./components/BookmarkModal.jsx";
import { useDebounce } from "react-use";
import noMoviePoster from "/noMoviePoster.jpg";
import {
  getTrendingMovies,
  updateSearchCount,
  getCurrentUser,
  getUserPreferences,
  getAllMoviesFromDatabase,
  searchMoviesInDatabase,
  getMoviesByGenreFromDatabase,
  getPopularMoviesFromDatabase,
  saveMovieToDatabase,
} from "./Appwrite.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import MovieModal from "./components/MovieModal.jsx";
import {
  trackMovieClick,
  getHybridRecommendations,
  getUserClickHistory,
} from "./Appwrite.jsx";
import ProtectedRoute from "./components/protectedRoute.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const prefs = await getUserPreferences(currentUser.$id);
      if (prefs) {
        setUserPreferences(prefs);
        fetchRecommendedMovies(prefs.genres);
      }
    }
  };

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let movies;

      if (query) {
        movies = await searchMoviesInDatabase(query);

        if (movies.length > 0) {
          await updateSearchCount(query, movies[0]);
        }
      } else {
        movies = await getAllMoviesFromDatabase(100, 0);
      }

      if (!movies || movies.length === 0) {
        setErrorMessage(
          query ? "No movies found for your search." : "No movies available.",
        );
        setMovieList([]);
        return;
      }

      setMovieList(movies);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendedMovies = async (genres) => {
    if (!genres || genres.length === 0) return;

    try {
      const movies = await getMoviesByGenreFromDatabase(genres);
      setRecommendedMovies(movies || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const handleLoginSuccess = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setShowLogin(false);
    setShowSignup(false);

    const prefs = await getUserPreferences(currentUser.$id);
    if (!prefs) {
      setShowPreferences(true);
    } else {
      setUserPreferences(prefs);
      fetchRecommendedMovies(prefs.genres);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserPreferences(null);
    setRecommendedMovies([]);
    setShowPreferences(false);
  };

  const handlePreferencesSave = (preferences) => {
    setUserPreferences({ ...userPreferences, ...preferences });
    setShowPreferences(false);
    fetchRecommendedMovies(preferences.genres);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  if (!user) {
    return (
      <main>
        <div className="pattern" />
        <div className="wrapper">
          <header>
            <img src="./hero.jpg" alt="Profile" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
            </h1>
            <p>Sign in to get personalized recommendations</p>
          </header>

          {showSignup ? (
            <Signup
              onSignupSuccess={handleLoginSuccess}
              onSwitchToLogin={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            />
          ) : showLogin ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            />
          ) : (
            <div className="auth-options">
              <button
                onClick={() => setShowLogin(true)}
                className="auth-option-button primary"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="auth-option-button secondary"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
        {trendingMovies.length > 0 && !searchTerm && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map(
                (movie, index) =>
                  movie.searchTerm &&
                  movie.poster_url && (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img
                        src={
                          movie.poster_url ? movie.poster_url : noMoviePoster
                        }
                        alt={movie.searchTerm}
                      />
                    </li>
                  ),
              )}
            </ul>
          </section>
        )}
      </main>
    );
  }

  return (
    <Router>
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <MainApp
                user={user}
                setUser={setUser}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showPreferences={showPreferences}
                showDashboard={showDashboard}
                userPreferences={userPreferences}
                recommendedMovies={recommendedMovies}
                trendingMovies={trendingMovies}
                movieList={movieList}
                isLoading={isLoading}
                errorMessage={errorMessage}
                handleLogout={handleLogout}
                setShowPreferences={setShowPreferences}
                setShowDashboard={setShowDashboard}
                handlePreferencesSave={handlePreferencesSave}
              />
            }
          />
        </Routes>
      </AdminProvider>
    </Router>
  );
};

const MainApp = ({
  user,
  setUser,
  searchTerm,
  setSearchTerm,
  showPreferences,
  showDashboard,
  userPreferences,
  recommendedMovies,
  trendingMovies,
  movieList,
  isLoading,
  errorMessage,
  handleLogout,
  setShowPreferences,
  setShowDashboard,
  handlePreferencesSave,
}) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [clickBasedRecommendations, setClickBasedRecommendations] = useState(
    [],
  );
  const [showClickRecommendations, setShowClickRecommendations] =
    useState(false);
  const [clickHistoryCount, setClickHistoryCount] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const preferencesRef = useRef(null);

  useEffect(() => {
    if (showPreferences && preferencesRef.current) {
      preferencesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [showPreferences]);

  const loadClickRecommendations = async () => {
    if (!user?.$id) return;

    try {
      const history = await getUserClickHistory(user.$id);
      setClickHistoryCount(history.length);

      if (history.length > 0) {
        const recommendations = await getHybridRecommendations(user.$id, 10);
        setClickBasedRecommendations(recommendations);
        setShowClickRecommendations(true);
      }
    } catch (error) {
      console.error("Error loading click recommendations:", error);
    }
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);

    if (user?.$id) {
      await trackMovieClick(user.$id, movie);

      await loadClickRecommendations();
    }
  };

  useEffect(() => {
    if (user?.$id) {
      loadClickRecommendations();
    }
  }, [user?.$id]);

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <main>
      <div className="pattern" />

      <Navbar
        user={user}
        onLogout={handleLogout}
        onShowPreferences={() => setShowPreferences(!showPreferences)}
        onShowDashboard={() => setShowDashboard(true)}
        onShowBookmarks={() => setShowBookmarks(true)}
      />

      {showDashboard && (
        <UserDashboard
          user={user}
          onClose={() => setShowDashboard(false)}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
        />
      )}

      <div className="wrapper">
        <header>
          <h1>
            Welcome back, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p>Find movies you'll enjoy without the hassle</p>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {showPreferences && (
          <div ref={preferencesRef}>
            <Preferences
              userId={user.$id}
              onSave={handlePreferencesSave}
              initialPreferences={userPreferences || {}}
            />
          </div>
        )}

        {recommendedMovies.length > 0 && !searchTerm && (
          <section className="recommended">
            <h2>Recommended For You</h2>
            <p className="section-subtitle">Based on your preferences</p>
            <ul>
              {recommendedMovies
                .slice(0, 20)
                .map(
                  (movie) =>
                    movie.title && (
                      <MovieCard
                        key={movie.$id}
                        movie={movie}
                        onClick={handleMovieClick}
                        user={user}
                      />
                    ),
                )}
            </ul>
          </section>
        )}

        {/* Click-Based Recommendations Section */}
        {showClickRecommendations &&
          clickBasedRecommendations.length > 0 &&
          !searchTerm && (
            <section className="click-recommendations">
              <div className="section-header">
                <button
                  onClick={loadClickRecommendations}
                  className="refresh-recommendations"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  Refresh
                </button>
                <h2>
                  <i className="fa-solid fa-brain"></i>
                  Because You Liked...
                </h2>
                <div className="recommendation-badge">
                  <i className="fa-regular fa-clock"></i>
                  Based on {clickHistoryCount} movie
                  {clickHistoryCount !== 1 ? "s" : ""} you've explored
                </div>
              </div>
              <p className="section-subtitle">
                Personalized recommendations based on your viewing behavior
              </p>
              <ul>
                {clickBasedRecommendations
                  .slice(0, 15)
                  .map(
                    (movie) =>
                      movie.title && (
                        <MovieCard
                          key={movie.$id}
                          movie={movie}
                          onClick={handleMovieClick}
                          user={user}
                        />
                      ),
                  )}
              </ul>
            </section>
          )}

        {trendingMovies.length > 0 && !searchTerm && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={movie.poster_url ? movie.poster_url : noMoviePoster}
                    alt={movie.title}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>{searchTerm ? "Search Results" : "All Movies"}</h2>

          {isLoading ? (
            <img src="/turkeyloading.gif" alt="loading" />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.$id}
                  movie={movie}
                  onClick={handleMovieClick}
                  user={user}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}

      {/* Bookmark Modal */}
      {showBookmarks && (
        <BookmarkModal
          user={user}
          onClose={() => setShowBookmarks(false)}
          onMovieClick={handleMovieClick}
        />
      )}
    </main>
  );
};

export default App;
