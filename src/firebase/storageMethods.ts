import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import { getCurrentUser } from './authMethods';
import { updateProfilePhoto } from './firestoreMethods';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Galeriden fotoğraf seçme
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    // İzin iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Galeri izni verilmedi');
    }
    
    // Galeriden resim seç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      return uri;
    }
    
    return null;
  } catch (error) {
    console.error('Galeriden fotoğraf seçme hatası:', error);
    throw error;
  }
};

// Kameradan fotoğraf çekme
export const takePhotoWithCamera = async (): Promise<string | null> => {
  try {
    // İzin iste
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Kamera izni verilmedi');
    }
    
    // Kamerayı başlat
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      return uri;
    }
    
    return null;
  } catch (error) {
    console.error('Kameradan fotoğraf çekme hatası:', error);
    throw error;
  }
};

// Profil fotoğrafı yükleme
export const uploadProfileImage = async (uri: string): Promise<string> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

  try {
    // URI'dan blob oluştur
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Depolama referansı oluştur
    const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
    
    // Dosyayı yükle
    await uploadBytes(storageRef, blob);
    
    // İndirme URL'sini al
    const downloadURL = await getDownloadURL(storageRef);
    
    // Firestore'daki profil fotoğrafını güncelle
    await updateProfilePhoto(downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Profil fotoğrafı yükleme hatası:', error);
    throw error;
  }
};

// Profil fotoğrafını güncelleme (galeriden veya kameradan)
export const updateUserProfilePhoto = async (source: 'gallery' | 'camera'): Promise<string | null> => {
  try {
    // Fotoğraf seç
    let imageUri: string | null = null;
    
    if (source === 'gallery') {
      imageUri = await pickImageFromGallery();
    } else if (source === 'camera') {
      imageUri = await takePhotoWithCamera();
    }
    
    if (!imageUri) return null;
    
    // Yükle ve URL al
    const downloadURL = await uploadProfileImage(imageUri);
    return downloadURL;
  } catch (error) {
    console.error('Profil fotoğrafı güncelleme hatası:', error);
    throw error;
  }
}; 