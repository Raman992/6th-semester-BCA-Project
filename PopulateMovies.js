import { Client, Databases, ID, Query } from 'appwrite'

// ============ CONFIGURATION ============
const CONFIG = {
  // TMDB API Key
  TMDB_API_KEY: '721343b08d112937e09ffdcdc0edc7b5', // Replace with your actual key
  
  // Appwrite Configuration
  APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
  PROJECT_ID: '69108293000bdc95e891',
  
  // Database and Collections
  DATABASE_ID: '6910836c0020e9426bf7', // Your main database ID
  
  // IMPORTANT: You need TWO collections:
  COLLECTIONS: {
    METRICS: 'metrics',      // For search tracking (already exists)
    MOVIES: 'movies'         // For movie data (need to create this)
  }
};

// ============ VALIDATE CONFIG ============
const validateConfig = () => {
  console.log('🔧 Validating configuration...\n');
  
  const errors = [];
  
  // Check TMDB API Key
  if (!CONFIG.TMDB_API_KEY || CONFIG.TMDB_API_KEY.includes('YOUR_')) {
    errors.push('❌ TMDB_API_KEY is not set or is invalid');
  }
  
  // Check if MOVIES collection is configured
  if (!CONFIG.COLLECTIONS.MOVIES) {
    errors.push('❌ MOVIES collection is not configured');
  }
  
  if (errors.length > 0) {
    console.log('🚨 Configuration Errors:');
    errors.forEach(error => console.log(error));
    console.log('\n📋 Please update the CONFIG object at the top of this file.');
    return false;
  }
  
  console.log('✅ Configuration validated successfully!');
  console.log(`📊 Will use collection: ${CONFIG.COLLECTIONS.MOVIES}`);
  return true;
};

// ============ INITIALIZE CLIENTS ============
const client = new Client()
  .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
  .setProject(CONFIG.PROJECT_ID)

const database = new Databases(client);

// ============ UTILITY FUNCTIONS ============
const movieExists = async (tmdbId) => {
  try {
    const result = await database.listDocuments(
      CONFIG.DATABASE_ID, 
      CONFIG.COLLECTIONS.MOVIES,  // Use MOVIES collection, not METRICS
      [
        Query.equal('tmdb_id', tmdbId),
        Query.limit(1)
      ]
    );
    return result.documents.length > 0;
  } catch (error) {
    if (error.code === 400 && error.message.includes('Attribute not found')) {
      console.log(`   ⚠️  The 'tmdb_id' attribute doesn't exist in the '${CONFIG.COLLECTIONS.MOVIES}' collection.`);
      console.log(`   💡 Please check your collection schema in Appwrite Console.`);
    } else {
      console.error('   Error checking if movie exists:', error.message);
    }
    return false;
  }
};

const saveMovieToAppwrite = async (movie) => {
  try {
    // Check if movie already exists (only if collection is properly set up)
    let exists = false;
    try {
      exists = await movieExists(movie.id);
    } catch (error) {
      // If we can't check, assume it doesn't exist
      console.log(`   ⚠️  Could not check if movie exists, attempting to save anyway...`);
    }
    
    if (exists) {
      console.log(`   ⏭️  Skipped (exists): ${movie.title}`);
      return false;
    }

    // Save to MOVIES collection
    await database.createDocument(
      CONFIG.DATABASE_ID, 
      CONFIG.COLLECTIONS.MOVIES,  // Use MOVIES collection
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
    console.log(`   ✅ Saved: ${movie.title}`);
    return true;
  } catch (error) {
    if (error.message.includes('Missing required attribute')) {
      console.error(`   ❌ Collection schema error for "${movie.title}":`, error.message);
      console.log(`   💡 Please check your '${CONFIG.COLLECTIONS.MOVIES}' collection schema in Appwrite Console.`);
    } else {
      console.error(`   ❌ Error saving "${movie.title}":`, error.message);
    }
    return false;
  }
};

const testAppwriteCollections = async () => {
  console.log('\n🔗 Testing Appwrite collections...');
  
  // Test MOVIES collection
  try {
    const moviesResult = await database.listDocuments(
      CONFIG.DATABASE_ID, 
      CONFIG.COLLECTIONS.MOVIES, 
      [Query.limit(1)]
    );
    console.log(`✅ '${CONFIG.COLLECTIONS.MOVIES}' collection exists`);
    console.log(`   Currently has ${moviesResult.total} movies`);
  } catch (error) {
    if (error.code === 404) {
      console.log(`❌ '${CONFIG.COLLECTIONS.MOVIES}' collection not found!`);
      console.log(`💡 You need to create this collection first.`);
      console.log(`\n📋 How to create the '${CONFIG.COLLECTIONS.MOVIES}' collection:`);
      console.log(`1. Go to Appwrite Console → Database`);
      console.log(`2. Click 'Create Collection'`);
      console.log(`3. Name: ${CONFIG.COLLECTIONS.MOVIES}`);
      console.log(`4. Add the attributes listed above`);
      return false;
    } else {
      console.error(`Error accessing '${CONFIG.COLLECTIONS.MOVIES}':`, error.message);
      return false;
    }
  }
  
  return true;
};

const fetchMoviesFromTMDB = async (page = 1) => {
  try {
    console.log(`\n📥 Fetching TMDB page ${page}...`);
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${CONFIG.TMDB_API_KEY}&language=en-US&page=${page}`
    );
    
    if (response.status === 401) {
      console.log(`   ❌ TMDB API Error: Invalid API Key`);
      return null;
    }
    
    if (!response.ok) {
      console.log(`   ❌ TMDB API Error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`   ✅ Page ${page}: ${data.results.length} movies fetched`);
    
    return data;
  } catch (error) {
    console.error(`   ❌ Error fetching page ${page}:`, error.message);
    return null;
  }
};

// ============ MAIN FUNCTIONS ============
const populateMovies = async (totalPages = 10) => {
  console.log('\n🚀 Starting movie population...');
  console.log('='.repeat(50));
  
  let totalMoviesSaved = 0;
  let totalMoviesSkipped = 0;
  
  for (let page = 1; page <= totalPages; page++) {
    console.log(`\n📄 Processing page ${page}/${totalPages}...`);
    
    const data = await fetchMoviesFromTMDB(page);
    
    if (!data || !data.results) {
      console.log(`   ⚠️  No data received, skipping page ${page}`);
      continue;
    }
    
    let pageSaved = 0;
    let pageSkipped = 0;
    
    for (const movie of data.results) {
      const saved = await saveMovieToAppwrite(movie);
      if (saved) {
        pageSaved++;
        totalMoviesSaved++;
      } else {
        pageSkipped++;
        totalMoviesSkipped++;
      }
    }
    
    console.log(`   📊 Page ${page}: ${pageSaved} saved, ${pageSkipped} skipped`);
    
    // Add delay to avoid rate limiting
    if (page < totalPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Population complete!');
  console.log(`✅ Total movies saved: ${totalMoviesSaved}`);
  console.log(`⏭️  Total skipped: ${totalMoviesSkipped}`);
};

// ============ QUICK SETUP SCRIPT ============
const setupInstructions = () => {
  console.log('\n📚 SETUP INSTRUCTIONS:');
  console.log('='.repeat(40));
  console.log('\n1️⃣  CREATE MOVIES COLLECTION IN APPWRITE:');
  console.log('   - Go to Appwrite Console → Database');
  console.log('   - Click "Create Collection"');
  console.log('   - Name: "movies"');
  console.log('   - Collection ID: "movies"');
  console.log('\n2️⃣  ADD THESE ATTRIBUTES to "movies" collection:');
  console.log('   ┌──────────────────────┬─────────┬─────────┐');
  console.log('   │ Attribute Name       │ Type    │ Required│');
  console.log('   ├──────────────────────┼─────────┼─────────┤');
  console.log('   │ tmdb_id              │ Integer │   Yes   │');
  console.log('   │ title                │ String  │   Yes   │');
  console.log('   │ overview             │ String  │   No    │');
  console.log('   │ poster_path          │ String  │   No    │');
  console.log('   │ vote_average         │ Float   │   No    │');
  console.log('   │ genre_ids            │ Array   │   No    │');
  console.log('   │ createdAt            │ Datetime│   Yes   │');
  console.log('   └──────────────────────┴─────────┴─────────┘');
  console.log('\n3️⃣  UPDATE THE SCRIPT:');
  console.log('   - Open PopulateMovies.js');
  console.log('   - Update TMDB_API_KEY with your actual key');
  console.log('   - Update DATABASE_ID with your database ID');
  console.log('\n4️⃣  RUN THE SCRIPT AGAIN:');
  console.log('   node PopulateMovies.js');
};

// ============ MAIN EXECUTION ============
const main = async () => {
  console.log('🎬 Movie Database Populator');
  console.log('='.repeat(40));
  
  // Step 1: Validate config
  if (!validateConfig()) {
    setupInstructions();
    process.exit(1);
  }
  
  // Step 2: Test Appwrite collections
  console.log('\n' + '='.repeat(40));
  const collectionsReady = await testAppwriteCollections();
  if (!collectionsReady) {
    setupInstructions();
    process.exit(1);
  }
  
  // Step 3: Run population
  console.log('\n' + '='.repeat(40));
  console.log('📋 Ready to populate movies database');
  console.log(`📊 Collection: ${CONFIG.COLLECTIONS.MOVIES}`);
  console.log(`📥 Pages to fetch: 5`);
  
  console.log('\n⚠️  Starting in 3 seconds (Ctrl+C to cancel)...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await populateMovies(10);
  
  console.log('\n✨ All done! Next steps:');
  console.log('1. Update your App.jsx to use database functions');
  console.log('2. Run your app: npm run dev');
  console.log('3. Enjoy your locally stored movies!');
};

main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  console.log('\n💡 If you need help, check the setup instructions above.');
});