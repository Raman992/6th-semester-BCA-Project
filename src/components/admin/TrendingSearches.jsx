import React, { useState, useEffect } from 'react';
import { Databases, Query } from 'appwrite';

const TrendingSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const database = new Databases(client);
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const SEARCH_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  const fetchTrendingSearches = async () => {
    setLoading(true);
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
        [
          Query.limit(20),
          Query.orderDesc('count')
        ]
      );
      setSearches(response.documents);
    } catch (error) {
      console.error('Error fetching trending searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (searchId) => {
    if (window.confirm('Are you sure you want to delete this search record?')) {
      try {
        await database.deleteDocument(DATABASE_ID, SEARCH_COLLECTION_ID, searchId);
        fetchTrendingSearches();
      } catch (error) {
        console.error('Error deleting search:', error);
        alert('Error deleting search record');
      }
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('Are you sure you want to reset all search counts?')) {
      try {
        for (const search of searches) {
          await database.updateDocument(
            DATABASE_ID,
            SEARCH_COLLECTION_ID,
            search.$id,
            { count: 0 }
          );
        }
        fetchTrendingSearches();
      } catch (error) {
        console.error('Error resetting searches:', error);
        alert('Error resetting search counts');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Reset All Counts
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">#</th>
                <th className="text-left py-3 px-4 text-gray-400">Search Term</th>
                <th className="text-left py-3 px-4 text-gray-400">Count</th>
                <th className="text-left py-3 px-4 text-gray-400">Movie</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searches.map((search, index) => (
                <tr key={search.$id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{search.searchTerm}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-500 rounded">
                      {search.count} searches
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {search.poster_url && (
                      <img
                        src={search.poster_url}
                        alt={search.searchTerm}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(search.$id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {searches.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No trending searches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingSearches;