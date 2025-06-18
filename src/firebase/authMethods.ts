import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from './config';
import { User, UserCredentials } from '../models/User';

// Kullanıcı oturum durumu değişikliklerini dinle
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Kullanıcı girişi
export const signIn = async (credentials: UserCredentials): Promise<void> => {
  const { email, password } = credentials;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

// Kullanıcı kaydı
export const signUp = async (credentials: UserCredentials): Promise<string> => {
  const { email, password, username } = credentials;
  
  if (!email || !password || !username) {
    throw new Error('Email, şifre ve kullanıcı adı gereklidir');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı profil bilgilerini güncelle
    if (user) {
      await updateProfile(user, {
        displayName: username
      });
    }
    
    // Varsayılan profil fotoğrafı
    const profilePhoto = 'https://soccerpointeclaire.com/wp-content/uploads/2021/06/default-profile-pic-e1513291410505.jpg';
    
    // Kullanıcı bilgilerini Firestore'a kaydet
    const userData: User = {
      uid: user.uid,
      email,
      username,
      profilePhoto
    };
    
    await setDoc(doc(firestore, 'users', user.uid), userData);
    
    return 'Success';
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
};

// Kullanıcı çıkışı
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

// Kullanıcı hesabını sil
export const deleteUserAccount = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await deleteUser(currentUser);
    } else {
      throw new Error('Oturum açmış kullanıcı bulunamadı');
    }
  } catch (error) {
    console.error('Hesap silme hatası:', error);
    throw error;
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Kullanıcı kaydı
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Kullanıcı profil bilgilerini güncelle
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Kullanıcı kaydı hatası:', error);
    throw error;
  }
};

// Kullanıcı girişi
export const loginUser = async (
  email: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Kullanıcı girişi hatası:', error);
    throw error;
  }
};

// Kullanıcı çıkışı
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Kullanıcı çıkışı hatası:', error);
    throw error;
  }
}; 