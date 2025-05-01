import React from 'react';

const SearchHistory = ({ 
  searchHistory, 
  darkMode, 
  clearHistory, 
  setSearchTerm, 
  searchMovie 
}) => {
  if (searchHistory.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Recent Searches
        </h3>
        <button
          onClick={clearHistory}
          className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Clear History
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((term, index) => (
          <button
            key={index}
            onClick={() => {
              setSearchTerm(term)
              searchMovie({ preventDefault: () => {} })
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory; 