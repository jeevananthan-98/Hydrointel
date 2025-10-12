import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A master-level search bar component with a clean UI, smooth animations,
 * and intelligent search functionality.
 */
const SearchBar = ({ API_URL, setSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the search logic, communicating with the backend API.
   * Features a loading state and error handling.
   */
  const handleSearch = async () => {
    setError('');
    setIsSearching(true);
    setSearchResults([]);

    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    // Check for the placeholder URL before attempting to fetch
    if (API_URL.includes("YOUR-API-URL-HERE")) {
      setError("Please update the API_URL to search.");
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/search?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch search results. Please check the server connection.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Clears the search term and results.
   */
  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="w-full flex justify-center mt-8 mb-4">
      <div className="relative w-full max-w-xl">
        {/* Animated input field */}
        <motion.input
          type="text"
          placeholder="Search for a DWLR station or a city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          className="w-full bg-gray-800 bg-opacity-50 text-white rounded-full py-4 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
          initial={{ scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
          whileFocus={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
        />

        {/* Search button with animation */}
        <motion.button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:bg-blue-700"
          whileTap={{ scale: 0.9 }}
          aria-label="Search"
        >
          {isSearching ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        {/* Clear button for when a search term exists */}
        <AnimatePresence>
          {searchTerm && !isSearching && (
            <motion.button
              onClick={handleClear}
              className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-red-400 mt-2 text-sm absolute -bottom-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
