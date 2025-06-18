import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase yapılandırma bilgileri
// Flutter projesindeki android/app/google-services.json dosyasından alınan yapılandırma
const firebaseConfig = {
  apiKey: "AIzaSyCMk5QpBlELX8_lQzo8-uG02IOQu0KnZVA",
  authDomain: "movie-app-f4595.firebaseapp.com",
  projectId: "movie-app-f4595",
  storageBucket: "movie-app-f4595.appspot.com",
  messagingSenderId: "229667758863",
  appId: "1:229667758863:android:a3874deb6d0a48044f147a"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// React Native'e özgü kalıcı oturum ile kimlik doğrulama
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Firebase servislerini dışa aktar
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Flutter projesindeki Android Firebase bağlantısı aktif edildi
console.log("Firebase bağlantısı aktif - movie-app-f4595 projesine bağlanıldı");
console.log("Kullanıcı oturumu cihazda kalıcı olarak saklanacak şekilde ayarlandı");

export default app; 