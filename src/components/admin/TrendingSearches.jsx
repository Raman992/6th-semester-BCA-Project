import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { database } from '../../Appwrite';
import "./admin.css";

const TrendingSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      <div className="section-header">
        <div className="section-title">        
         Trending Searches 
          <span className="user-count">{searches.length}</span>
        </div>
        <button
          onClick={handleResetAll}
          className="reset-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          Reset All
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading searches...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Search Term</th>
                <th>Count</th>
                <th>Movie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {searches.map((search, index) => (
                <tr key={search.$id}>
                  <td>
                    <span className="rank-number">{index + 1}</span>
                  </td>
                  <td>
                    <span className="search-term">{search.searchTerm}</span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      {search.count} searches
                    </span>
                  </td>
                  <td>
                    {search.poster_url && (
                      <img
                        src={search.poster_url}
                        alt={search.searchTerm}
                        className="movie-poster"
                      />
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(search.$id)}
                      className="icon-btn delete"
                      title="Delete search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {searches.length === 0 && (
            <div className="empty-state">
              <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
                <line x1="9" x2="9.01" y1="9" y2="9"/>
                <line x1="15" x2="15.01" y1="9" y2="9"/>
              </svg>
              <h3 className="empty-state-title">No trending searches</h3>
              <p className="empty-state-text">Search activity will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingSearches;