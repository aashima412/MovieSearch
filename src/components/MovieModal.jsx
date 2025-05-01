import React from 'react';

const MovieModal = ({ 
  movie, 
  onClose, 
  darkMode, 
  loadingTrailer, 
  trailer, 
  reviews, 
  newReview, 
  setNewReview, 
  showReviewForm, 
  setShowReviewForm, 
  addReview, 
  similarMovies, 
  recommendations, 
  onMovieClick, 
  loadingSimilar,
  loadingRecommendations
}) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const MovieList = ({ title, movies, loading }) => (
    <div className="mt-8">
      <h3 className={`text-xl font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-48 rounded-lg overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="w-full h-72 bg-gray-200 animate-pulse" />
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {movies.map((similarMovie) => (
            <div
              key={similarMovie.imdbID}
              onClick={() => onMovieClick(similarMovie)}
              className={`flex-shrink-0 w-48 rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <img
                src={similarMovie.Poster !== 'N/A' ? similarMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
                alt={similarMovie.Title}
                className="w-full h-72 object-cover"
              />
              <div className="p-3">
                <h4 className={`font-semibold truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {similarMovie.Title}
                </h4>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {similarMovie.Year}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No {title.toLowerCase()} found.
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {movie.Title}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
                alt={movie.Title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div>
              <p className={`mb-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {movie.Plot}
              </p>
              <div className="space-y-2">
                <p><strong>Year:</strong> {movie.Year}</p>
                <p><strong>Genre:</strong> {movie.Genre}</p>
                <p><strong>Director:</strong> {movie.Director}</p>
                <p><strong>Cast:</strong> {movie.Actors}</p>
                <p><strong>Rating:</strong> {movie.imdbRating}/10</p>
                <p><strong>Runtime:</strong> {movie.Runtime}</p>
                {movie.BoxOffice && <p><strong>Box Office:</strong> {movie.BoxOffice}</p>}
                {movie.Awards && <p><strong>Awards:</strong> {movie.Awards}</p>}
              </div>
            </div>
          </div>

          {/* Trailer Section */}
          {loadingTrailer ? (
            <div className="mt-8">
              <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ) : trailer ? (
            <div className="mt-8">
              <h3 className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Trailer
              </h3>
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer}`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}

          {/* Similar Movies Section */}
          <MovieList
            title="Similar Movies"
            movies={similarMovies}
            loading={loadingSimilar}
          />

          {/* Recommendations Section */}
          <MovieList
            title="You Might Also Like"
            movies={recommendations}
            loading={loadingRecommendations}
          />

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reviews
            </h3>
            {showReviewForm ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-2xl"
                    >
                      {star <= newReview.rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Write your review..."
                  className={`w-full p-2 border rounded-lg mb-2 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows="3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => addReview(movie.imdbID)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className={`px-4 py-2 rounded-lg mb-4 ${
                  darkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                Write a Review
              </button>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews
                  .filter(review => review.movieId === movie.imdbID)
                  .map(review => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-yellow-400">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                        <span className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No reviews yet. Be the first to review this movie!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal; 