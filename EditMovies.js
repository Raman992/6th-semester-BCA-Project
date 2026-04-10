import { Client, Databases, Query } from 'appwrite';

// CONFIG
const CONFIG = {
  TMDB_API_KEY: '721343b08d112937e09ffdcdc0edc7b5',
  ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
  PROJECT_ID: '69108293000bdc95e891',
  DATABASE_ID: '6910836c0020e9426bf7',
  COLLECTION_ID: 'movies',
};

// INIT
const client = new Client()
  .setEndpoint(CONFIG.ENDPOINT)
  .setProject(CONFIG.PROJECT_ID);

const database = new Databases(client);

// 🎬 Get Trailer ID from TMDB
const getTrailerId = async (tmdbId) => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${CONFIG.TMDB_API_KEY}`
    );

    const data = await res.json();

    if (!data.results) return null;

    const trailer = data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );

    return trailer ? trailer.key : null;
  } catch {
    return null;
  }
};

// ✏️ Update Existing Movie
const updateMovie = async (doc) => {
  try {
    // Skip if already updated
    if (doc.TrailerId) {
      console.log(`⏭️ Skipped: ${doc.title}`);
      return;
    }

    const trailerId = await getTrailerId(doc.tmdb_id);

    if (!trailerId) {
      console.log(`⚠️ No trailer: ${doc.title}`);
      return;
    }

    await database.updateDocument(
      CONFIG.DATABASE_ID,
      CONFIG.COLLECTION_ID,
      doc.$id,
      {
        TrailerId: trailerId,
      }
    );

    console.log(`✅ Updated: ${doc.title}`);
  } catch (err) {
    console.error(`❌ Failed: ${doc.title}`, err.message);
  }
};

// 🚀 MAIN LOOP (pagination safe)
const runMigration = async () => {
  console.log('🚀 Updating existing movies...\n');

  let lastId = null;
  let total = 0;

  while (true) {
    const queries = [Query.limit(25)];

    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    const res = await database.listDocuments(
      CONFIG.DATABASE_ID,
      CONFIG.COLLECTION_ID,
      queries
    );

    if (res.documents.length === 0) break;

    for (const doc of res.documents) {
      await updateMovie(doc);
      total++;

      // prevent rate limit
      await new Promise(r => setTimeout(r, 250));
    }

    lastId = res.documents[res.documents.length - 1].$id;
  }

  console.log('\n🎉 Migration Complete!');
  console.log(`📊 Processed: ${total} movies`);
};

// RUN
runMigration().catch(console.error);