import React from 'react';

const ListControls = ({
  movies,
  darkMode,
  listSearchTerm,
  setListSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCategory,
  setSelectedCategory,
  movieCategories,
  activeTab,
  onSortChange,
  onSearchChange,
  onCategoryChange
}) => {
  const getUniqueCategories = () => {
    const categories = new Set();
    movies.forEach(movie => {
      if (movie.Genre) {
        movie.Genre.split(', ').forEach(genre => categories.add(genre));
      }
    });
    return Array.from(categories).sort();
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    if (onSortChange) {
      onSortChange(newSortBy, sortOrder);
    }
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    if (onSortChange) {
      onSortChange(sortBy, newOrder);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setListSearchTerm(newSearchTerm);
    if (onSearchChange) {
      onSearchChange(newSearchTerm);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = !listSearchTerm || 
      movie.Title.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
      movie.Year.includes(listSearchTerm) ||
      movie.Genre.toLowerCase().includes(listSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (movie.Genre && movie.Genre.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'title':
        comparison = a.Title.localeCompare(b.Title);
        break;
      case 'year':
        comparison = parseInt(b.Year) - parseInt(a.Year);
        break;
      case 'rating':
        comparison = parseFloat(b.imdbRating) - parseFloat(a.imdbRating);
        break;
      case 'runtime':
        comparison = parseInt(b.Runtime) - parseInt(a.Runtime);
        break;
      case 'genre':
        comparison = (a.Genre || '').localeCompare(b.Genre || '');
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="mb-6 space-y-4">
      {/* Only show search bar if not in search section */}
      {activeTab !== 'search' && (
        <div className="relative">
          <input
            type="text"
            value={listSearchTerm}
            onChange={handleSearchChange}
            placeholder={`Search ${activeTab}...`}
            className={`w-full px-4 py-2 pl-10 rounded-lg border ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <svg
            className={`absolute left-3 top-2.5 h-5 w-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="title">Sort by Title</option>
          <option value="year">Sort by Year</option>
          <option value="rating">Sort by Rating</option>
          <option value="runtime">Sort by Runtime</option>
          <option value="genre">Sort by Genre</option>
        </select>

        <button
          onClick={handleSortOrderChange}
          className={`px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
          }`}
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? darkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {getUniqueCategories().map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? darkMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={`text-sm ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Showing {sortedMovies.length} movies
      </div>
    </div>
  );
};

export default ListControls;