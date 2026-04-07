import { Client, Databases, ID, Query } from 'appwrite'

// ============ CONFIGURATION ============
const CONFIG = {
  TMDB_API_KEY: '721343b08d112937e09ffdcdc0edc7b5',
  APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
  PROJECT_ID: '69108293000bdc95e891',
  DATABASE_ID: '6910836c0020e9426bf7',

  COLLECTIONS: {
    METRICS: 'metrics',
    MOVIES: 'movies'
  }
};

// ============ VALIDATE CONFIG ============
const validateConfig = () => {
  console.log('🔧 Validating configuration...\n');
  
  const errors = [];
  
  if (!CONFIG.TMDB_API_KEY) {
    errors.push('❌ TMDB_API_KEY is not set');
  }
  
  if (!CONFIG.COLLECTIONS.MOVIES) {
    errors.push('❌ MOVIES collection is not configured');
  }
  
  if (errors.length > 0) {
    console.log('🚨 Configuration Errors:');
    errors.forEach(error => console.log(error));
    return false;
  }
  
  console.log('✅ Configuration validated!');
  return true;
};

// ============ INIT ============
const client = new Client()
  .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
  .setProject(CONFIG.PROJECT_ID);

const database = new Databases(client);

// ============ HELPERS ============
const movieExists = async (tmdbId) => {
  try {
    const result = await database.listDocuments(
      CONFIG.DATABASE_ID,
      CONFIG.COLLECTIONS.MOVIES,
      [Query.equal('tmdb_id', tmdbId), Query.limit(1)]
    );
    return result.documents.length > 0;
  } catch {
    return false;
  }
};

const saveMovieToAppwrite = async (movie) => {
  try {
    const exists = await movieExists(movie.id);

    if (exists) {
      console.log(`⏭️ Skipped: ${movie.title}`);
      return false;
    }

    await database.createDocument(
      CONFIG.DATABASE_ID,
      CONFIG.COLLECTIONS.MOVIES,
      ID.unique(),
      {
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview || '',
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || '',
        release_date: movie.release_date || '',
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        genre_ids: movie.genre_ids || [],
        original_language: movie.original_language || 'en',
        popularity: movie.popularity || 0,
        adult: movie.adult || false,
        video: movie.video || false,
        createdAt: new Date().toISOString(),
      }
    );

    console.log(`✅ Saved: ${movie.title}`);
    return true;

  } catch (error) {
    console.error(`❌ Error: ${movie.title}`, error.message);
    return false;
  }
};

const fetchMoviesFromTMDB = async (page) => {
  try {
    console.log(`📥 Fetching page ${page}...`);

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${CONFIG.TMDB_API_KEY}&page=${page}`
    );

    if (!res.ok) {
      console.log(`❌ TMDB Error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error(`❌ Fetch error (page ${page}):`, err.message);
    return null;
  }
};

// ============ MAIN LOGIC ============
const populateMovies = async (startPage = 1, endPage = 10) => {
  console.log('\n🚀 Starting population...');
  console.log(`📄 Pages: ${startPage} → ${endPage}`);
  console.log('='.repeat(50));

  let totalSaved = 0;
  let totalSkipped = 0;

  for (let page = startPage; page <= endPage; page++) {
    console.log(`\n📄 Page ${page}`);

    const data = await fetchMoviesFromTMDB(page);

    if (!data?.results) continue;

    let saved = 0;
    let skipped = 0;

    for (const movie of data.results) {
      const result = await saveMovieToAppwrite(movie);

      if (result) {
        saved++;
        totalSaved++;
      } else {
        skipped++;
        totalSkipped++;
      }
    }

    console.log(`📊 Page ${page}: ${saved} saved, ${skipped} skipped`);

    // delay (avoid rate limit)
    if (page < endPage) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  console.log('\n🎉 DONE!');
  console.log(`✅ Saved: ${totalSaved}`);
  console.log(`⏭️ Skipped: ${totalSkipped}`);
};

// ============ ENTRY ============
const main = async () => {
  console.log('🎬 Movie Populator\n');

  if (!validateConfig()) {
    process.exit(1);
  }

  // CLI support
  const start = process.argv[2] ? parseInt(process.argv[2]) : 20;
  const end = process.argv[3] ? parseInt(process.argv[3]) : 50;

  console.log(`📥 Will fetch pages ${start} → ${end}`);

  await populateMovies(start, end);
};

main().catch(err => {
  console.error('💥 Fatal error:', err);
});