import React, { useState, useEffect, useRef } from 'react';
import SearchForm from './components/SearchForm';
import SearchHistory from './components/SearchHistory';
import LoadingSkeleton from './components/LoadingSkeleton';
import ListControls from './components/ListControls';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';

const OMDB_API_KEY = 'hiding_api_key_for_security_purpose';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    type: 'movie',
    genre: '',
    minRating: '',
    maxRating: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [movieCategories, setMovieCategories] = useState({});
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [customLists, setCustomLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const lastMovieRef = useRef(null);
  const recognition = useRef(null);
  const [activeTab, setActiveTab] = useState('search');
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchCache, setSearchCache] = useState({});
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    const savedFavorites = localStorage.getItem('favorites');
    const savedRatings = localStorage.getItem('userRatings');
    const savedCustomLists = localStorage.getItem('customLists');
    const savedSearchHistory = localStorage.getItem('searchHistory');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRatings) setUserRatings(JSON.parse(savedRatings));
    if (savedCustomLists) setCustomLists(JSON.parse(savedCustomLists));
    if (savedSearchHistory) setSearchHistory(JSON.parse(savedSearchHistory));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    localStorage.setItem('customLists', JSON.stringify(customLists));
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [watchlist, favorites, userRatings, customLists, searchHistory, darkMode]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
        setTimeout(() => {
          searchMovie({ preventDefault: () => {} });
        }, 100);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        switch (event.error) {
          case 'no-speech':
            alert('No speech was detected. Please try again.');
            break;
          case 'aborted':
            alert('Speech recognition was aborted.');
            break;
          case 'audio-capture':
            alert('No microphone was found. Please ensure your microphone is connected.');
            break;
          case 'not-allowed':
            alert('Permission to use microphone was denied.');
            break;
          case 'service-not-available':
            alert('Speech recognition service is not available in your browser.');
            break;
          case 'bad-grammar':
            alert('Grammar error occurred.');
            break;
          case 'language-not-supported':
            alert('Language not supported.');
            break;
          case 'network':
            alert('Network error occurred. Please check your connection.');
            setTimeout(() => {
              recognition.current.start();
            }, 1000);
            break;
          default:
            alert('An error occurred with the speech recognition.');
        }
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 500);
    } else {
      setDebouncedSearchTerm('');
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchMovie({ preventDefault: () => {} });
    }
  }, [debouncedSearchTerm]);

  const searchMovie = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const cacheKey = `${searchTerm}-${filters.genre}-${filters.rating}`;
    if (searchCache[cacheKey]) {
      setMovies(searchCache[cacheKey]);
      return;
    }

    setLoading(true);
    setError(null);
    setMovies([]);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie&page=1`
      );
      const data = await response.json();

      if (data.Response === 'True') {
        // Calculate total pages (OMDB returns 10 results per page)
        const totalResults = parseInt(data.totalResults);
        const calculatedTotalPages = Math.ceil(totalResults / 10);
        setTotalPages(calculatedTotalPages);

        const movieDetailsPromises = data.Search.map(async (movie) => {
          const detailResponse = await fetch(
            `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}&plot=full`
          );
          const detailData = await detailResponse.json();
          return detailData;
        });

        const movieDetails = await Promise.all(movieDetailsPromises);
        const filteredMovies = movieDetails.filter(movie => {
          const matchesGenre = !filters.genre || movie.Genre.includes(filters.genre);
          const matchesRating = !filters.rating || parseFloat(movie.imdbRating) >= filters.rating;
          return matchesGenre && matchesRating;
        });

        setSearchCache(prev => ({
          ...prev,
          [cacheKey]: filteredMovies
        }));

        setMovies(filteredMovies);
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(term => term !== searchTerm)].slice(0, 5);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      } else {
        setError('No movies found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loading || currentPage >= totalPages) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${currentPage + 1}&type=${filters.type}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setError(data.Error || 'No more movies found');
        setLoading(false);
        return;
      }

      const detailedMovies = await Promise.all(
        data.Search.map(async (movie) => {
          const detailResponse = await fetch(
            `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`
          );
          const detailData = await detailResponse.json();
          return detailData;
        })
      );

      let filteredMovies = detailedMovies.filter(movie => {
        if (filters.year && movie.Year !== filters.year) return false;
        if (filters.genre && !movie.Genre.includes(filters.genre)) return false;
        if (filters.minRating && parseFloat(movie.imdbRating) < parseFloat(filters.minRating)) return false;
        if (filters.maxRating && parseFloat(movie.imdbRating) > parseFloat(filters.maxRating)) return false;
        return true;
      });

      setMovies(prev => [...prev, ...filteredMovies]);
      setCurrentPage(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error('Error loading more movies:', error);
      setError('Failed to load more movies. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && currentPage < totalPages) {
          loadMoreMovies();
        }
      },
      { threshold: 0.5 }
    );

    if (lastMovieRef.current) {
      observer.observe(lastMovieRef.current);
    }

    return () => {
      if (lastMovieRef.current) {
        observer.unobserve(lastMovieRef.current);
      }
    };
  }, [loading, currentPage, totalPages]);

  const startVoiceSearch = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    setIsListening(true);
    recognition.current.start();
  };

  const toggleWatchlist = (movie) => {
    setWatchlist(prev => {
      const isInWatchlist = prev.some(m => m.imdbID === movie.imdbID);
      if (isInWatchlist) {
        return prev.filter(m => m.imdbID !== movie.imdbID);
      } else {
        return [...prev, movie];
      }
    });
  };

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const isInFavorites = prev.some(m => m.imdbID === movie.imdbID);
      if (isInFavorites) {
        return prev.filter(m => m.imdbID !== movie.imdbID);
      } else {
        return [...prev, movie];
      }
    });
  };

  const rateMovie = (movieId, rating) => {
    setUserRatings(prev => ({
      ...prev,
      [movieId]: rating
    }));
  };

  const addMovieToList = (movie, listName) => {
    setCustomLists(prev => prev.map(list => {
      if (list.name === listName) {
        return {
          ...list,
          movies: [...list.movies, movie]
        };
      }
      return list;
    }));
  };

  const createNewList = () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }

    setCustomLists(prev => [...prev, { name: newListName, movies: [] }]);
    setShowCreateList(false);
    setNewListName('');
  };

  const addReview = (movieId) => {
    if (!newReview.comment.trim()) {
      alert('Please enter a review comment');
      return;
    }

    setReviews(prev => [...prev, {
      id: Date.now(),
      movieId,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString()
    }]);

    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const fetchTrailer = async (movieTitle) => {
    setLoadingTrailer(true);
    try {
      const YOUTUBE_API_KEY = 'AIzaSyCNGjPj9XKYlRw0kq-YcjQJ5wu8YzBOGps';
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieTitle + ' official trailer')}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trailer');
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setTrailer(data.items[0].id.videoId);
      } else {
        console.log('No trailer found for:', movieTitle);
        setTrailer(null);
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setTrailer(null);
    } finally {
      setLoadingTrailer(false);
    }
  };

  const fetchSimilarMovies = async (movie) => {
    setLoadingSimilar(true);
    try {
      const genres = movie.Genre.split(', ');
      const similarPromises = genres.map(async (genre) => {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(genre)}&type=movie&page=1`
        );
        const data = await response.json();
        return data.Search || [];
      });

      const similarResults = await Promise.all(similarPromises);
      const allSimilar = similarResults.flat();
      
      const uniqueSimilar = allSimilar
        .filter(m => m.imdbID !== movie.imdbID)
        .filter((m, index, self) => 
          index === self.findIndex(t => t.imdbID === m.imdbID)
        )
        .slice(0, 8);

      setSimilarMovies(uniqueSimilar);
    } catch (error) {
      console.error('Error fetching similar movies:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const fetchRecommendations = async (movie) => {
    setLoadingRecommendations(true);
    try {
      const rating = parseFloat(movie.imdbRating);
      const genres = movie.Genre.split(', ');
      
      const recommendationsPromises = genres.map(async (genre) => {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(genre)}&type=movie&page=1`
        );
        const data = await response.json();
        return data.Search || [];
      });

      const recommendationsResults = await Promise.all(recommendationsPromises);
      const allRecommendations = recommendationsResults.flat();
      
      const recommendations = allRecommendations
        .filter(m => m.imdbID !== movie.imdbID)
        .filter((m, index, self) => 
          index === self.findIndex(t => t.imdbID === m.imdbID)
        )
        .slice(0, 8);

      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleMovieClick = (movie) => {
    console.log('Movie clicked:', movie.Title);
    setSelectedMovie(movie);
    setShowModal(true);
    setLoadingTrailer(true);
    setTrailer(null);
    fetchSimilarMovies(movie);
    fetchRecommendations(movie);
    fetchTrailer(movie.Title);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    const sortedMovies = [...movies].sort((a, b) => {
      let comparison = 0;
      switch (newSortBy) {
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
      return newSortOrder === 'asc' ? comparison : -comparison;
    });
    setMovies(sortedMovies);
  };

  const handleSearchChange = (newSearchTerm) => {
    setListSearchTerm(newSearchTerm);
    const filteredMovies = movies.filter(movie => 
      movie.Title.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
      movie.Year.includes(newSearchTerm) ||
      movie.Genre.toLowerCase().includes(newSearchTerm.toLowerCase())
    );
    setMovies(filteredMovies);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const filteredMovies = movies.filter(movie => 
      category === 'all' || (movie.Genre && movie.Genre.includes(category))
    );
    setMovies(filteredMovies);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Movie Search</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'search'
                ? darkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'watchlist'
                ? darkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'favorites'
                ? darkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            Favorites ({favorites.length})
          </button>
        </div>

        {activeTab === 'search' && (
          <>
            <SearchForm
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              darkMode={darkMode}
              genres={genres}
              isListening={isListening}
              startVoiceSearch={startVoiceSearch}
              searchMovie={searchMovie}
            />

            <SearchHistory
              searchHistory={searchHistory}
              darkMode={darkMode}
              clearHistory={clearHistory}
              setSearchTerm={setSearchTerm}
              searchMovie={searchMovie}
            />

            {error && (
              <div className={`p-4 rounded-lg mb-4 ${
                darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-900'
              }`}>
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className={`rounded-lg overflow-hidden shadow-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="w-full h-96 bg-gray-200 animate-pulse" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : movies.length > 0 ? (
              <>
                <ListControls
                  movies={movies}
                  darkMode={darkMode}
                  listSearchTerm={listSearchTerm}
                  setListSearchTerm={setListSearchTerm}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  movieCategories={movieCategories}
                  activeTab="search"
                  onSortChange={handleSortChange}
                  onSearchChange={handleSearchChange}
                  onCategoryChange={handleCategoryChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie, index) => (
                    <MovieCard
                      key={movie.imdbID}
                      movie={movie}
                      isLast={index === movies.length - 1}
                      showActions={true}
                      darkMode={darkMode}
                      watchlist={watchlist}
                      favorites={favorites}
                      userRatings={userRatings}
                      toggleWatchlist={toggleWatchlist}
                      toggleFavorite={toggleFavorite}
                      rateMovie={rateMovie}
                      onMovieClick={handleMovieClick}
                    />
                  ))}
                </div>

                {movies.length > 0 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}

        {activeTab === 'watchlist' && (
          <>
            <ListControls
              movies={watchlist}
              darkMode={darkMode}
              listSearchTerm={listSearchTerm}
              setListSearchTerm={setListSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              movieCategories={movieCategories}
              activeTab="watchlist"
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlist.length === 0 ? (
                <div className={`col-span-full text-center py-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your watchlist is empty. Add movies to your watchlist while searching!
                </div>
              ) : (
                watchlist.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    darkMode={darkMode}
                    watchlist={watchlist}
                    favorites={favorites}
                    userRatings={userRatings}
                    toggleWatchlist={toggleWatchlist}
                    toggleFavorite={toggleFavorite}
                    rateMovie={rateMovie}
                    setSelectedList={setSelectedList}
                    setShowCreateList={setShowCreateList}
                    customLists={customLists}
                    addMovieToList={addMovieToList}
                    movieCategories={movieCategories}
                    onMovieClick={handleMovieClick}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'favorites' && (
          <>
            <ListControls
              movies={favorites}
              darkMode={darkMode}
              listSearchTerm={listSearchTerm}
              setListSearchTerm={setListSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              movieCategories={movieCategories}
              activeTab="favorites"
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.length === 0 ? (
                <div className={`col-span-full text-center py-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your favorites list is empty. Add movies to your favorites while searching!
                </div>
              ) : (
                favorites.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    darkMode={darkMode}
                    watchlist={watchlist}
                    favorites={favorites}
                    userRatings={userRatings}
                    toggleWatchlist={toggleWatchlist}
                    toggleFavorite={toggleFavorite}
                    rateMovie={rateMovie}
                    setSelectedList={setSelectedList}
                    setShowCreateList={setShowCreateList}
                    customLists={customLists}
                    addMovieToList={addMovieToList}
                    movieCategories={movieCategories}
                    onMovieClick={handleMovieClick}
                  />
                ))
              )}
            </div>
          </>
        )}

        {selectedMovie && showModal && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => {
              setSelectedMovie(null);
              setShowModal(false);
            }}
            darkMode={darkMode}
            loadingTrailer={loadingTrailer}
            trailer={trailer}
            reviews={reviews}
            newReview={newReview}
            setNewReview={setNewReview}
            showReviewForm={showReviewForm}
            setShowReviewForm={setShowReviewForm}
            addReview={addReview}
            similarMovies={similarMovies}
            recommendations={recommendations}
            onMovieClick={handleMovieClick}
            loadingSimilar={loadingSimilar}
            loadingRecommendations={loadingRecommendations}
          />
        )}

        {showCreateList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl p-6 max-w-md w-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create New List
              </h2>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
                className={`w-full px-4 py-2 border rounded-lg mb-4 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateList(false)
                    setNewListName('')
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={createNewList}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
