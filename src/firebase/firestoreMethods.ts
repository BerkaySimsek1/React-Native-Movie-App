import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { firestore } from './config';
import { getCurrentUser } from './authMethods';
import { 
  Watchlist, 
  Watched, 
  Comment, 
  CurrentUserComment 
} from '../models/Movie';

// İzleme listesi işlemleri
export const createOrUpdateWatchlistData = async (
  watchlistData: Watchlist, 
  movieId: string
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'users', currentUser.uid, 'watchlist', movieId);
    await setDoc(docRef, watchlistData);
  } catch (error) {
    console.error('İzleme listesi oluşturma/güncelleme hatası:', error);
    throw error;
  }
};

export const validateAndSubmitWatchlist = async (
  movieId: string, 
  isAdded: boolean, 
  imagePath: string, 
  movieName: string
): Promise<void> => {
  try {
    const watchlistData: Watchlist = {
      movieId,
      isAdded,
      movieName,
      imagePath
    };

    await createOrUpdateWatchlistData(watchlistData, movieId);
  } catch (error) {
    console.error('İzleme listesi doğrulama/kaydetme hatası:', error);
    throw error;
  }
};

export const deleteWatchlist = async (movieId: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'users', currentUser.uid, 'watchlist', movieId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('İzleme listesinden silme hatası:', error);
    throw error;
  }
};

export const getWatchlist = async (): Promise<Watchlist[]> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const watchlistRef = collection(firestore, 'users', currentUser.uid, 'watchlist');
    const querySnapshot = await getDocs(watchlistRef);
    
    const watchlist: Watchlist[] = [];
    querySnapshot.forEach((doc) => {
      watchlist.push(doc.data() as Watchlist);
    });
    
    return watchlist;
  } catch (error) {
    console.error('İzleme listesi getirme hatası:', error);
    throw error;
  }
};

// İzlenen filmler işlemleri
export const createOrUpdateWatchedData = async (
  watchedData: Watched, 
  movieId: string
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'users', currentUser.uid, 'watched', movieId);
    await setDoc(docRef, watchedData);
  } catch (error) {
    console.error('İzlenen film oluşturma/güncelleme hatası:', error);
    throw error;
  }
};

export const validateAndSubmitWatched = async (
  isAdded: boolean, 
  movieId: string, 
  imagePath: string, 
  movieName: string, 
  rating: number
): Promise<void> => {
  try {
    const watchedData: Watched = {
      movieId,
      isAdded,
      movieName,
      imagePath,
      rating
    };

    await createOrUpdateWatchedData(watchedData, movieId);
  } catch (error) {
    console.error('İzlenen film doğrulama/kaydetme hatası:', error);
    throw error;
  }
};

export const deleteWatched = async (movieId: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'users', currentUser.uid, 'watched', movieId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('İzlenen filmden silme hatası:', error);
    throw error;
  }
};

export const getWatched = async (): Promise<Watched[]> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const watchedRef = collection(firestore, 'users', currentUser.uid, 'watched');
    const querySnapshot = await getDocs(watchedRef);
    
    const watched: Watched[] = [];
    querySnapshot.forEach((doc) => {
      watched.push(doc.data() as Watched);
    });
    
    return watched;
  } catch (error) {
    console.error('İzlenen filmler getirme hatası:', error);
    throw error;
  }
};

// Yorum işlemleri
export const createOrUpdateComments = async (
  commentData: Comment, 
  movieId: string
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'comments', movieId, 'comment', currentUser.uid);
    await setDoc(docRef, commentData);
  } catch (error) {
    console.error('Yorum oluşturma/güncelleme hatası:', error);
    throw error;
  }
};

export const validateAndSubmitComments = async (
  comment: string, 
  movieId: string, 
  username: string, 
  rating: number, 
  uid: string, 
  profilePic: string
): Promise<void> => {
  try {
    const commentData: Comment = {
      comment,
      username,
      rating,
      uid,
      profilePic
    };

    await createOrUpdateComments(commentData, movieId);
  } catch (error) {
    console.error('Yorum doğrulama/kaydetme hatası:', error);
    throw error;
  }
};

export const createOrUpdateCurrentUserComments = async (
  commentData: CurrentUserComment, 
  movieId: string
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const docRef = doc(firestore, 'users', currentUser.uid, 'usercomment', movieId);
    await setDoc(docRef, commentData);
  } catch (error) {
    console.error('Kullanıcı yorumu oluşturma/güncelleme hatası:', error);
    throw error;
  }
};

export const validateAndSubmitCurrentUserComments = async (
  comment: string, 
  movieId: string, 
  rating: number, 
  movieName: string, 
  posterPath: string, 
  uid: string
): Promise<void> => {
  try {
    const commentData: CurrentUserComment = {
      comment,
      rating,
      movieID: parseInt(movieId),
      movieName,
      posterPath,
      uid
    };

    await createOrUpdateCurrentUserComments(commentData, movieId);
  } catch (error) {
    console.error('Kullanıcı yorumu doğrulama/kaydetme hatası:', error);
    throw error;
  }
};

export const deleteComment = async (movieId: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    // Kullanıcının kendi yorumunu sil
    const userCommentRef = doc(firestore, 'users', currentUser.uid, 'usercomment', movieId);
    await deleteDoc(userCommentRef);
    
    // Film yorumları koleksiyonundan sil
    const commentRef = doc(firestore, 'comments', movieId, 'comment', currentUser.uid);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    throw error;
  }
};

export const getUserComments = async (): Promise<CurrentUserComment[]> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const userCommentsRef = collection(firestore, 'users', currentUser.uid, 'usercomment');
    const querySnapshot = await getDocs(userCommentsRef);
    
    const userComments: CurrentUserComment[] = [];
    querySnapshot.forEach((doc) => {
      userComments.push(doc.data() as CurrentUserComment);
    });
    
    return userComments;
  } catch (error) {
    console.error('Kullanıcı yorumları getirme hatası:', error);
    throw error;
  }
};

export const getMovieComments = async (movieId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(firestore, 'comments', movieId, 'comment');
    const querySnapshot = await getDocs(commentsRef);
    
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push(doc.data() as Comment);
    });
    
    return comments;
  } catch (error) {
    console.error('Film yorumları getirme hatası:', error);
    throw error;
  }
};

// Profil fotoğrafı güncelleme
export const updateProfilePhoto = async (photoUrl: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    const userRef = doc(firestore, 'users', currentUser.uid);
    await updateDoc(userRef, { profilePhoto: photoUrl });
  } catch (error) {
    console.error('Profil fotoğrafı güncelleme hatası:', error);
    throw error;
  }
}; 