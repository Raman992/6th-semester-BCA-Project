import { Client, Databases, ID, Query, Account } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const USER_PREFS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_PREFS_COLLECTION_ID;

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