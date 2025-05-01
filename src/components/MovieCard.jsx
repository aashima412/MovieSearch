import React from 'react';

const MovieCard = ({ 
  movie, 
  isLast, 
  showActions = true, 
  darkMode, 
  watchlist, 
  favorites, 
  userRatings, 
  toggleWatchlist, 
  toggleFavorite, 
  rateMovie, 
  setSelectedList, 
  setShowCreateList, 
  customLists, 
  addMovieToList, 
  movieCategories, 
  lastMovieRef, 
  onMovieClick 
}) => {
  const isInWatchlist = watchlist.some(m => m.imdbID === movie.imdbID);
  const isInFavorites = favorites.some(m => m.imdbID === movie.imdbID);
  const userRating = userRatings[movie.imdbID] || 0;

  return (
    <div
      ref={isLast ? lastMovieRef : null}
      onClick={() => onMovieClick(movie)}
      className={`relative group rounded-lg overflow-hidden shadow-lg transition-all duration-300 cursor-pointer ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={movie.Title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white">
                  {movie.Year}
                </span>
                <span className="text-sm font-semibold text-white">
                  {movie.Runtime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="text-white">{movie.imdbRating}</span>
              </div>
              {showActions && (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(movie);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        isInWatchlist
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                      title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isInWatchlist ? '✓' : '+'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        isInFavorites
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                      title={isInFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                      {isInFavorites ? '❤' : '♡'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateList(true);
                      }}
                      className="p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-colors"
                      title="Add to Custom List"
                    >
                      📋
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          rateMovie(movie.imdbID, star);
                        }}
                        className={`text-xl transition-colors ${
                          star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className={`font-semibold text-lg mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {movie.Title}
        </h3>
        <p className={`text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {movie.Genre}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;