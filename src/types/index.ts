export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  Genre?: string;
  Runtime?: string;
  imdbRating?: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Awards?: string;
  BoxOffice?: string;
}

export interface MovieCardProps {
  movie: Movie;
  isLast?: boolean;
  showActions?: boolean;
  darkMode: boolean;
  watchlist: Movie[];
  favorites: Movie[];
  userRatings: Record<string, number>;
  toggleWatchlist: (movie: Movie) => void;
  toggleFavorite: (movie: Movie) => void;
  rateMovie: (movieId: string, rating: number) => void;
  setSelectedList?: (list: string) => void;
  setShowCreateList?: (show: boolean) => void;
  customLists?: Array<{ name: string; movies: Movie[] }>;
  addMovieToList?: (movie: Movie, listName: string) => void;
  movieCategories?: Record<string, Movie[]>;
  lastMovieRef?: any;
  onMovieClick: (movie: Movie) => void;
}

export interface Review {
  id: number;
  movieId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Filters {
  year: string;
  type: string;
  genre: string;
  minRating: string;
  maxRating: string;
} 