import { IMAGE_BASE_URL, DEFAULT_MOVIE_IMAGE, DEFAULT_CAST_IMAGE } from '../constants/api';

// Film posterini getir
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return DEFAULT_MOVIE_IMAGE;
  return `${IMAGE_BASE_URL}${path}`;
};

// Oyuncu resmini getir
export const getCastImageUrl = (path: string | null | undefined): string => {
  if (!path) return DEFAULT_CAST_IMAGE;
  return `${IMAGE_BASE_URL}${path}`;
};

// Tarihi formatla
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Bilinmiyor';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Süreyi formatla
export const formatRuntime = (minutes: number | undefined): string => {
  if (!minutes) return 'Bilinmiyor';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} dakika`;
  return `${hours} saat ${mins} dakika`;
};

// Para birimini formatla
export const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return 'Bilinmiyor';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

// Puanı formatla
export const formatRating = (rating: number | undefined): string => {
  if (!rating) return '0';
  return (rating / 2).toFixed(1);
};

/**
 * Belirli bir süre bekledikten sonra fonksiyonu çalıştırır. Fonksiyon tekrar tekrar çağrılırsa
 * bekleme süresi sıfırlanır ve en son çağrı işleme alınır.
 * @param func - Çalıştırılacak fonksiyon
 * @param wait - Bekleme süresi (ms)
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<F>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
};

/**
 * Verilen metin boyutundan daha kısaysa metni döndürür, 
 * değilse belirli bir boyuta kadar kesip sonuna üç nokta ekler
 * @param text - Kısaltılacak metin
 * @param length - Maksimum uzunluk (varsayılan: 100)
 */
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Verilen iki tarih arasındaki farkı insan tarafından okunabilir formatta döndürür
 * @param dateString - ISO formatında tarih stringi
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ay önce`;
  return `${Math.floor(diffInSeconds / 31536000)} yıl önce`;
}; 