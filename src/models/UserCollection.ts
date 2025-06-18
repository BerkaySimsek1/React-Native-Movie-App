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

export interface Favorite {
  movieId: string;
  isAdded: boolean;
  movieName: string;
  imagePath: string;
}

export interface Comment {
  comment: string;
  username: string;
  rating: number;
  uid: string;
  profilePic: string;
}

export interface UserComment {
  comment: string;
  rating: number;
  movieId: number;
  movieName: string;
  posterPath: string;
  uid: string;
} 