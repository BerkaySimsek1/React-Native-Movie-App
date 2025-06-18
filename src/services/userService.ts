import { Movie, Watchlist, Watched, Comment, CurrentUserComment } from "../models/Movie";
import { 
  getWatchlist as getFirestoreWatchlist,
  validateAndSubmitWatchlist,
  deleteWatchlist,
  getWatched as getFirestoreWatched,
  validateAndSubmitWatched,
  deleteWatched,
  validateAndSubmitComments,
  validateAndSubmitCurrentUserComments,
  getUserComments,
  getMovieComments,
  deleteComment
} from "../firebase/firestoreMethods";
import { auth } from "../firebase/config";
import { getImageUrl } from "../utils/helpers";

// İzleme listesini getir
export const getWatchlist = async (): Promise<Movie[]> => {
  try {
    const watchlistItems = await getFirestoreWatchlist();
    
    // Firestore verisini Movie formatına dönüştür
    return watchlistItems.map(item => ({
      id: parseInt(item.movieId),
      title: item.movieName,
      poster_path: item.imagePath,
      backdrop_path: "",
      overview: "",
      release_date: "",
      vote_average: 0,
      vote_count: 0,
      genre_ids: [],
      adult: false,
      original_language: "",
      original_title: "",
      popularity: 0,
      video: false
    }));
  } catch (error) {
    console.error("İzleme listesi alınırken hata:", error);
    return [];
  }
};

// İzlenen filmleri getir
export const getWatchedMovies = async (): Promise<Movie[]> => {
  try {
    const watchedItems = await getFirestoreWatched();
    
    // Firestore verisini Movie formatına dönüştür
    return watchedItems.map(item => ({
      id: parseInt(item.movieId),
      title: item.movieName,
      poster_path: item.imagePath,
      backdrop_path: "",
      overview: "",
      release_date: "",
      vote_average: item.rating || 0,
      vote_count: 0,
      genre_ids: [],
      adult: false,
      original_language: "",
      original_title: "",
      popularity: 0,
      video: false
    }));
  } catch (error) {
    console.error("İzlenen filmler alınırken hata:", error);
    return [];
  }
};

// İzleme listesine film ekle
export const addToWatchlist = async (movie: Movie): Promise<void> => {
  try {
    await validateAndSubmitWatchlist(
      movie.id.toString(),
      true,
      movie.poster_path,
      movie.title
    );
    console.log("Film izleme listesine eklendi:", movie.title);
  } catch (error) {
    console.error("Film izleme listesine eklenirken hata:", error);
    throw error;
  }
};

// İzleme listesinden film çıkar
export const removeFromWatchlist = async (movieId: number): Promise<void> => {
  try {
    await deleteWatchlist(movieId.toString());
    console.log("Film izleme listesinden çıkarıldı, ID:", movieId);
  } catch (error) {
    console.error("Film izleme listesinden çıkarılırken hata:", error);
    throw error;
  }
};

// İzlenen filmlere ekle (puanlama ile birlikte)
export const addToWatched = async (movie: Movie, rating: number = 0): Promise<void> => {
  try {
    await validateAndSubmitWatched(
      true,
      movie.id.toString(),
      movie.poster_path,
      movie.title,
      rating
    );
    console.log("Film izlenenler listesine eklendi:", movie.title);
  } catch (error) {
    console.error("Film izlenenler listesine eklenirken hata:", error);
    throw error;
  }
};

// İzlenen filmlerden çıkar
export const removeFromWatched = async (movieId: number): Promise<void> => {
  try {
    await deleteWatched(movieId.toString());
    console.log("Film izlenenler listesinden çıkarıldı, ID:", movieId);
  } catch (error) {
    console.error("Film izlenenler listesinden çıkarılırken hata:", error);
    throw error;
  }
};

// Film yorumu ekle
export const addComment = async (
  movieId: number,
  comment: string,
  rating: number = 0
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Yorum eklemek için giriş yapmalısınız");
    }

    // Genel yorum koleksiyonuna yorum ekle
    await validateAndSubmitComments(
      comment,
      movieId.toString(),
      currentUser.displayName || "İsimsiz Kullanıcı",
      rating,
      currentUser.uid,
      currentUser.photoURL || ""
    );

    // Kullanıcının kendi yorum koleksiyonuna da ekle
    await validateAndSubmitCurrentUserComments(
      comment,
      movieId.toString(),
      rating,
      "Film", // Filme ait başlık bilgisi filmin detaylarından alınmalı
      "", // Poster yolu filmin detaylarından alınmalı
      currentUser.uid
    );

    console.log("Filme yorum eklendi, Film ID:", movieId);
  } catch (error) {
    console.error("Filme yorum eklenirken hata:", error);
    throw error;
  }
};

// Filmin yorumlarını getir
export const getComments = async (movieId: number): Promise<Comment[]> => {
  try {
    return await getMovieComments(movieId.toString());
  } catch (error) {
    console.error("Film yorumları alınırken hata:", error);
    return [];
  }
};

// Kullanıcının tüm yorumlarını getir
export const getUserCommentList = async (): Promise<CurrentUserComment[]> => {
  try {
    return await getUserComments();
  } catch (error) {
    console.error("Kullanıcı yorumları alınırken hata:", error);
    return [];
  }
};

// Yorumu sil
export const deleteUserComment = async (movieId: number): Promise<void> => {
  try {
    await deleteComment(movieId.toString());
    console.log("Yorum silindi, Film ID:", movieId);
  } catch (error) {
    console.error("Yorum silinirken hata:", error);
    throw error;
  }
}; 