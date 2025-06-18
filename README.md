# Sinetopia - Film Uygulaması

Bu proje, Flutter'dan React Native'e dönüştürülmüş bir film uygulamasıdır. Kullanıcılar popüler ve en iyi filmleri görüntüleyebilir, film detaylarını inceleyebilir, izleme listesi oluşturabilir ve film yorumları yapabilir.

## Özellikler

- Kullanıcı kimlik doğrulama (kayıt olma, giriş yapma, çıkış yapma)
- Popüler ve en iyi filmleri görüntüleme
- Film arama
- Film detaylarını görüntüleme
- İzleme listesi oluşturma
- İzlenen filmleri kaydetme ve puanlama
- Film yorumları yapma ve görüntüleme
- Profil yönetimi

## Teknolojiler

- React Native
- Expo
- TypeScript
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- React Navigation
- Axios

## Kurulum

1. Projeyi klonlayın:

```
git clone https://github.com/kullaniciadi/sinetopia.git
cd sinetopia
```

2. Bağımlılıkları yükleyin:

```
npm install
```

3. Firebase yapılandırmasını güncelleyin:
   `src/firebase/config.ts` dosyasını kendi Firebase projenizdeki bilgilerle güncelleyin.

4. Uygulamayı başlatın:

```
npm start
```

## Proje Yapısı

```
assets/             # Resimler ve diğer statik dosyalar
src/
  components/       # Yeniden kullanılabilir bileşenler
  screens/          # Uygulama ekranları
  navigation/       # Navigasyon yapılandırması
  hooks/            # Özel React kancaları
  utils/            # Yardımcı fonksiyonlar
  models/           # Veri modelleri
  services/         # API servisleri
  firebase/         # Firebase yapılandırması ve metodları
  constants/        # Sabitler (renkler, boyutlar, API anahtarları)
App.tsx             # Ana uygulama bileşeni
app.json            # Expo yapılandırması
```

## Katkıda Bulunma

1. Projeyi fork edin
2. Özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
