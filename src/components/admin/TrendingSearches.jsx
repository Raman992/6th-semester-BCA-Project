import React, { useState, useEffect } from "react";
import { Query } from "appwrite";
import { database } from "../../Appwrite";
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
        [Query.limit(20), Query.orderDesc("count")],
      );
      setSearches(response.documents);
    } catch (error) {
      console.error("Error fetching trending searches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (searchId) => {
    if (window.confirm("Are you sure you want to delete this search record?")) {
      try {
        await database.deleteDocument(
          DATABASE_ID,
          SEARCH_COLLECTION_ID,
          searchId,
        );
        fetchTrendingSearches();
      } catch (error) {
        console.error("Error deleting search:", error);
        alert("Error deleting search record");
      }
    }
  };

  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to reset all search counts?")) {
      try {
        await Promise.all(
          searches.map((search) =>
            database.updateDocument(
              DATABASE_ID,
              SEARCH_COLLECTION_ID,
              search.$id,
              { count: 0 },
            ),
          ),
        );
        fetchTrendingSearches();
      } catch (error) {
        console.error("Error resetting searches:", error);
        alert("Error resetting search counts");
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
        <button onClick={handleResetAll} className="reset-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {searches.length === 0 && (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <h3 className="empty-state-title">No trending searches</h3>
              <p className="empty-state-text">
                Search activity will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingSearches;