export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Recommendation {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
}

export interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
}

export interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export interface Watchlist {
  movieId: string;
  isAdded: boolean;
  movieName: string;
  imagePath: string;
}

export interface Watched {
  movieId: string;
  isAdded: boolean;
  movieName: string;
  imagePath: string;
  rating: number;
}

export interface Comment {
  comment: string;
  username: string;
  rating: number;
  uid: string;
  profilePic: string;
}

export interface CurrentUserComment {
  comment: string;
  rating: number;
  movieID: number;
  movieName: string;
  posterPath: string;
  uid: string;
} 