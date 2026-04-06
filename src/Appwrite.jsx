import { Client, Databases, ID, Query, Account } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const USER_PREFS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_PREFS_COLLECTION_ID;
const USER_INTERACTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_INTERACTIONS_COLLECTION_ID;

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

export const database = new Databases(client);
export const account = new Account(client);

const MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID;

//Save movie
export const saveMovieToDatabase = async (movie) => {
  try {
    // Check if movie already exists
    const result = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.equal('tmdb_id', movie.id),
    ]);

    if (result.documents.length === 0) {
      await database.createDocument(DATABASE_ID, MOVIES_COLLECTION_ID, ID.unique(), {
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genre_ids: movie.genre_ids,
        original_language: movie.original_language,
        popularity: movie.popularity,
        adult: movie.adapter,
        video: movie.video,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error saving movie to database:', error);
  }
};

//Fetch movies
export const getAllMoviesFromDatabase = async (limit = 20, offset = 0) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("createdAt"),
    ]);

    return result.documents;
  } catch (error) {
    console.error('Error fetching movies from database:', error);
    return [];
  }
};

//Search movies
export const searchMoviesInDatabase = async (searchTerm) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.search('title', searchTerm),
      Query.limit(20),
      Query.orderDesc("vote_average"),
    ]);

    return result.documents;
  } catch (error) {
    console.error('Error searching movies in database:', error);
    return [];
  }
};

// Function to get movies by genre from database
export const getMoviesByGenreFromDatabase = async (genreIds) => {
  try {
    if (!genreIds || genreIds.length === 0) return [];
    
    const queries = [
      Query.limit(10),
      Query.orderDesc("vote_average"),
      Query.greaterThan("vote_count", 100),
    ];
    
    // For multiple genres, we need to fetch and filter
    const result = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, queries);
    
    // Filter movies that have at least one of the selected genres
    const filteredMovies = result.documents.filter(movie => {
      const movieGenres = movie.genre_ids || [];
      return genreIds.some(genreId => movieGenres.includes(genreId));
    });
    
    return filteredMovies.slice(0, 10);
  } catch (error) {
    console.error('Error fetching movies by genre from database:', error);
    return [];
  }
};

//Get popular movies
export const getPopularMoviesFromDatabase = async (limit = 5) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, [
      Query.limit(limit),
      Query.orderDesc("popularity"),
      Query.greaterThan("vote_count", 50),
    ]);

    return result.documents;
  } catch (error) {
    console.error('Error fetching popular movies from database:', error);
    return [];
  }
};

// Authentication functions
export const createAccount = async (email, password, name) => {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    return await login(email, password);
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export const login = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return await getCurrentUser();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export const logout = async () => {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// User preferences functions
export const saveUserPreferences = async (userId, preferences) => {
  try {
    // Check if user preferences already exist
    const result = await database.listDocuments(DATABASE_ID, USER_PREFS_COLLECTION_ID, [
      Query.equal('userId', userId),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, USER_PREFS_COLLECTION_ID, doc.$id, {
        genres: preferences.genres,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await database.createDocument(DATABASE_ID, USER_PREFS_COLLECTION_ID, ID.unique(), {
        userId,
        genres: preferences.genres,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

export const getUserPreferences = async (userId) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, USER_PREFS_COLLECTION_ID, [
      Query.equal('userId', userId),
    ]);

    return result.documents.length > 0 ? result.documents[0] : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

// Original functions (keep these)
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ])

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      })
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      })
    }
  } catch (error) {
    console.error(error);
  }
}

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count")
    ])

    return result.documents;
  } catch (error) {
    console.error(error);
  }
}

// Track user clicks on movies
export const trackMovieClick = async (userId, movie) => {
  try {
    // Check if user already has an interaction with this movie
    const existing = await database.listDocuments(
      DATABASE_ID, 
      USER_INTERACTIONS_COLLECTION_ID,
      [
        Query.equal('userId', [userId]),
        Query.equal('movieId', [movie.$id])
      ]
    );

    if (existing.documents.length > 0) {
      // Update existing interaction
      const interaction = existing.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        interaction.$id,
        {
          clickCount: (interaction.clickCount || 0) + 1,
          lastClickedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    } else {
      // Create new interaction
      await database.createDocument(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          movieId: movie.$id,
          movieTitle: movie.title,
          genres: movie.genre_ids || [],
          clickCount: 1,
          firstClickedAt: new Date().toISOString(),
          lastClickedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Error tracking movie click:', error);
  }
};

// Get user's clicked movies history
export const getUserClickHistory = async (userId, limit = 20) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      USER_INTERACTIONS_COLLECTION_ID,
      [
        Query.equal('userId', [userId]),
        Query.orderDesc('clickCount'),
        Query.orderDesc('lastClickedAt'),
        Query.limit(limit)
      ]
    );
    return result.documents;
  } catch (error) {
    console.error('Error fetching user click history:', error);
    return [];
  }
};

// Get personalized recommendations based on user clicks
export const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's click history
    const clickHistory = await getUserClickHistory(userId, 15);
    
    if (clickHistory.length === 0) {
      return []; // No clicks yet
    }

    // Analyze genre preferences from clicks
    const genreScores = {};
    const weightedMovies = [];

    clickHistory.forEach(interaction => {
      const weight = Math.min(interaction.clickCount, 5); // Cap weight at 5
      
      // Score genres
      if (interaction.genres && Array.isArray(interaction.genres)) {
        interaction.genres.forEach(genreId => {
          genreScores[genreId] = (genreScores[genreId] || 0) + weight;
        });
      }
      
      weightedMovies.push({
        movieId: interaction.movieId,
        weight: weight
      });
    });

    // Get movies similar to clicked ones
    const similarMovies = [];
    
    // Get movies that share genres with user's preferences
    const topGenres = Object.entries(genreScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genreId]) => parseInt(genreId));

    // Filter out movies the user has already clicked
    const clickedMovieIds = new Set(clickHistory.map(h => h.movieId));

    if (topGenres.length > 0) {
      
      // Get movies by top genres
        const genreMovies = await getMoviesByGenreFromDatabase(topGenres);
        
        const filteredMovies = genreMovies.filter(movie => !clickedMovieIds.has(movie.$id));
      
      // Score movies based on genre match
      const scoredMovies = filteredMovies.map(movie => {
        let score = 0;
        const movieGenres = movie.genre_ids || [];
        
        movieGenres.forEach(genreId => {
          score += genreScores[genreId] || 0;
        });
        
        // Boost score for higher rated movies
        score += (movie.vote_average || 0) / 2;
        
        // Boost for recent/popular movies
        if (movie.release_date) {
          const year = parseInt(movie.release_date.split('-')[0]);
          const currentYear = new Date().getFullYear();
          const recencyBonus = Math.max(0, (year - currentYear + 5)) / 2;
          score += recencyBonus;
        }
        
        return { movie, score };
      });
      
      scoredMovies.sort((a, b) => b.score - a.score);
      similarMovies.push(...scoredMovies.slice(0, limit).map(s => s.movie));
    }
    
    // If not enough recommendations, add trending movies
    if (similarMovies.length < limit) {
      const trending = await getTrendingMovies();
      const trendingMovies_data = trending.filter(m => 
        !clickedMovieIds.has(m.$id) && 
        !similarMovies.some(sm => sm.$id === m.$id)
      );
      similarMovies.push(...trendingMovies_data.slice(0, limit - similarMovies.length));
    }
    
    return similarMovies.slice(0, limit);
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

// Get collaborative recommendations (users who liked similar movies)
export const getCollaborativeRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's clicked movies
    const userClicks = await getUserClickHistory(userId, 10);
    if (userClicks.length === 0) return [];
    
    const userMovieIds = userClicks.map(c => c.movieId);
    
    // Find other users who clicked similar movies
    const otherUsersInteractions = await database.listDocuments(
      DATABASE_ID,
      USER_INTERACTIONS_COLLECTION_ID,
      [
        Query.notEqual('userId', userId),
        Query.limit(100)
      ]
    );
    
    // Calculate user similarity
    const userSimilarity = {};
    otherUsersInteractions.documents.forEach(interaction => {
      if (userMovieIds.includes(interaction.movieId)) {
        if (!userSimilarity[interaction.userId]) {
          userSimilarity[interaction.userId] = {
            commonMovies: 0,
            movies: []
          };
        }
        userSimilarity[interaction.userId].commonMovies++;
        userSimilarity[interaction.userId].movies.push(interaction.movieId);
      }
    });
    
    // Get movies from similar users that user hasn't clicked
    const recommendedMovies = [];
    const clickedSet = new Set(userMovieIds);
    
    Object.entries(userSimilarity)
      .sort((a, b) => b[1].commonMovies - a[1].commonMovies)
      .slice(0, 5)
      .forEach(([similarUserId, data]) => {
        // Get this user's other clicked movies
        const similarUserMovies = otherUsersInteractions.documents
          .filter(i => i.userId === similarUserId)
          .map(i => i.movieId);
        
        similarUserMovies.forEach(movieId => {
          if (!clickedSet.has(movieId) && !recommendedMovies.includes(movieId)) {
            recommendedMovies.push(movieId);
          }
        });
      });
    
    // Fetch movie details
    if (recommendedMovies.length > 0) {
      const movies = await getAllMoviesFromDatabase(50, 0);
      const collaborativeMovies = movies.filter(m => 
        recommendedMovies.includes(m.$id)
      );
      return collaborativeMovies.slice(0, limit);
    }
    
    return [];
    
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    return [];
  }
};

// Hybrid recommendation combining content-based and collaborative filtering
export const getHybridRecommendations = async (userId, limit = 10) => {
  try {
    const [contentBased, collaborative] = await Promise.all([
      getPersonalizedRecommendations(userId, limit),
      getCollaborativeRecommendations(userId, limit)
    ]);
    
    // Combine and deduplicate
    const hybrid = [...contentBased];
    collaborative.forEach(movie => {
      if (!hybrid.some(m => m.$id === movie.$id)) {
        hybrid.push(movie);
      }
    });
    
    return hybrid.slice(0, limit);
    
  } catch (error) {
    console.error('Error getting hybrid recommendations:', error);
    return [];
  }
};