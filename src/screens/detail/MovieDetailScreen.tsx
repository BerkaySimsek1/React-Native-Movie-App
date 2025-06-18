import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  getMovieDetails,
  getMovieCast,
  getMovieRecommendations,
} from "../../services/movieService";
import {
  addToWatchlist,
  removeFromWatchlist,
  addToWatched,
  removeFromWatched,
  addComment,
  getComments,
} from "../../services/userService";
import {
  MovieDetails,
  Cast,
  Recommendation,
  Comment,
  Movie,
} from "../../models/Movie";
import {
  IMAGE_BASE_URL,
  POSTER_SIZE,
  BACKDROP_SIZE,
  DEFAULT_MOVIE_IMAGE,
} from "../../constants/api";
import MovieList from "../../components/MovieList";
import { auth } from "../../firebase/config";

type MovieDetailScreenProps = {
  route: RouteProp<RootStackParamList, "MovieDetail">;
  navigation: NativeStackNavigationProp<RootStackParamList, "MovieDetail">;
};

const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // İzleme Listesi ve İzlenen durum değişkenleri
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inWatched, setInWatched] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Yorum ekleme için modal ve form state'leri
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);

  // Kullanıcının bu filme daha önce yorum yapıp yapmadığını kontrol et
  const [userAlreadyCommented, setUserAlreadyCommented] = useState(false);

  useEffect(() => {
    fetchMovieData();
    fetchUserStatus();
    fetchComments();
  }, [movieId]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [movieData, castData, recommendationsData] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCast(movieId),
        getMovieRecommendations(movieId),
      ]);

      setMovie(movieData);
      setCast(castData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("Film verileri alınırken hata oluştu:", error);
      setError("Film verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    // Bu kısım geliştirilecek - kullanıcının bu filmi izleme listesine
    // veya izlenen filmlere ekleyip eklemediğini kontrol etmek için
    // Firestore'dan kullanıcı verilerini çekebilirsiniz

    // Şimdilik sadece false ile başlatalım
    setInWatchlist(false);
    setInWatched(false);
  };

  const fetchComments = async () => {
    try {
      const commentsData = await getComments(movieId);
      setComments(commentsData);

      // Kullanıcı giriş yapmışsa, kendi yorumunu kontrol et
      if (auth.currentUser) {
        const userComment = commentsData.find(
          (comment) => comment.uid === auth.currentUser?.uid
        );

        if (userComment) {
          setUserAlreadyCommented(true);
        } else {
          setUserAlreadyCommented(false);
        }
      }
    } catch (error) {
      console.error("Film yorumları alınırken hata oluştu:", error);
    }
  };

  // MovieDetails'i Movie tipine dönüştürmek için yardımcı fonksiyon
  const convertToMovie = (movieDetails: MovieDetails): Movie => {
    return {
      id: movieDetails.id,
      title: movieDetails.title,
      overview: movieDetails.overview,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      release_date: movieDetails.release_date,
      vote_average: movieDetails.vote_average,
      vote_count: movieDetails.vote_count,
      genre_ids: movieDetails.genres
        ? movieDetails.genres.map((genre) => genre.id)
        : [],
      adult: false,
      original_language: "",
      original_title: movieDetails.title,
      popularity: 0,
      video: false,
    };
  };

  const handleWatchlistToggle = async () => {
    if (!movie) return;

    try {
      setActionLoading(true);
      if (inWatchlist) {
        await removeFromWatchlist(movie.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(convertToMovie(movie));
        setInWatchlist(true);
      }
    } catch (error) {
      console.error("İzleme listesi işlemi sırasında hata:", error);
      Alert.alert(
        "Hata",
        "İzleme listesi güncellenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWatchedToggle = async () => {
    if (!movie) return;

    try {
      setActionLoading(true);
      if (inWatched) {
        await removeFromWatched(movie.id);
        setInWatched(false);
      } else {
        await addToWatched(convertToMovie(movie), userRating);
        setInWatched(true);
      }
    } catch (error) {
      console.error("İzlenen film işlemi sırasında hata:", error);
      Alert.alert(
        "Hata",
        "İzlenen film güncellenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!movie || !commentText.trim()) return;

    try {
      setCommentLoading(true);
      await addComment(movie.id, commentText, userRating);

      // Yorumu ekledikten sonra formu sıfırla ve modalı kapat
      setCommentText("");
      setUserRating(0);
      setIsCommentModalVisible(false);

      // Yorumları yeniden yükle
      fetchComments();

      Alert.alert("Başarılı", "Yorumunuz eklendi.");
    } catch (error) {
      console.error("Yorum ekleme sırasında hata:", error);
      Alert.alert("Hata", "Yorumunuz eklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setCommentLoading(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <View style={styles.ratingStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setUserRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= userRating ? "star" : "star-outline"}
              size={24}
              color={star <= userRating ? LOGO_COLOR : "#999"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleCommentAction = () => {
    if (userAlreadyCommented) {
      // Kullanıcı daha önce yorum yaptıysa yorumlar sayfasına yönlendir
      navigation.navigate("Comments", { movieId: movieId.toString() });
    } else {
      // İlk kez yorum yapıyorsa modalı göster
      setIsCommentModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Film bulunamadı"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMovieData}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Backdrop ve poster URL'lerini oluştur
  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${movie.backdrop_path}`
    : DEFAULT_MOVIE_IMAGE;

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${movie.poster_path}`
    : DEFAULT_MOVIE_IMAGE;

  // Çıkış yılı
  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "";

  // Film süresini formatlama
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}dk`;
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Geri Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
      </TouchableOpacity>

      {/* Backdrop Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: backdropUrl }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
        <View style={styles.backdropOverlay} />
      </View>

      <View style={styles.contentContainer}>
        {/* Poster and Basic Info */}
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: posterUrl }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>
            {releaseYear} • {formatRuntime(movie.runtime || 0)}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>
              {(movie.vote_average / 2).toFixed(1)}/5
            </Text>
            <Text style={styles.voteCount}>({movie.vote_count || 0} oy)</Text>
          </View>
          <Text style={styles.genres}>
            {movie.genres?.map((genre) => genre.name).join(" • ")}
          </Text>
        </View>

        {/* Kullanıcı Eylemleri Bölümü */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              inWatchlist && styles.activeActionButton,
            ]}
            onPress={handleWatchlistToggle}
            disabled={actionLoading}
          >
            <Ionicons
              name={inWatchlist ? "bookmark" : "bookmark-outline"}
              size={24}
              color={inWatchlist ? LOGO_COLOR : TEXT_COLOR}
            />
            <Text style={styles.actionButtonText}>
              {inWatchlist ? "Listemde" : "İzleme Listeme Ekle"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              inWatched && styles.activeActionButton,
            ]}
            onPress={handleWatchedToggle}
            disabled={actionLoading}
          >
            <Ionicons
              name={inWatched ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={inWatched ? ACCENT_COLOR : TEXT_COLOR}
            />
            <Text style={styles.actionButtonText}>
              {inWatched ? "İzlendi" : "İzledim"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              userAlreadyCommented && styles.activeActionButton,
            ]}
            onPress={handleCommentAction}
          >
            <Ionicons
              name={userAlreadyCommented ? "chatbubble" : "chatbubble-outline"}
              size={24}
              color={userAlreadyCommented ? ACCENT_COLOR : TEXT_COLOR}
            />
            <Text style={styles.actionButtonText}>
              {userAlreadyCommented ? "Yorumum" : "Yorum Yap"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview */}
        {movie.overview && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Özet</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Oyuncular</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cast.slice(0, 10).map((person) => (
                <View key={person.id} style={styles.castItem}>
                  <Image
                    source={{
                      uri: person.profile_path
                        ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${person.profile_path}`
                        : "https://via.placeholder.com/150",
                    }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={1}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Movies */}
        {recommendations.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Benzer Filmler</Text>
            <MovieList
              movies={recommendations.slice(0, 10)}
              loading={false}
              error={null}
              horizontal={true}
            />
          </View>
        )}

        {/* Comments Button */}
        <TouchableOpacity
          style={styles.commentsButton}
          onPress={() =>
            navigation.navigate("Comments", { movieId: movieId.toString() })
          }
        >
          <Ionicons name="chatbubbles-outline" size={20} color={TEXT_COLOR} />
          <Text style={styles.commentsButtonText}>
            Yorumları Görüntüle ({comments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Yorum Ekleme Modalı */}
      <Modal
        visible={isCommentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Film Yorumu Ekle</Text>

            <Text style={styles.modalText}>Puanınız:</Text>
            {renderRatingStars()}

            <Text style={styles.modalText}>Yorumunuz:</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Film hakkında düşüncelerinizi yazın..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={commentText}
              onChangeText={setCommentText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsCommentModalVisible(false);
                  setCommentText("");
                  setUserRating(0);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddComment}
                disabled={commentLoading || !commentText.trim()}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color={TEXT_COLOR} />
                ) : (
                  <Text style={styles.modalButtonText}>Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
    padding: 20,
  },
  errorText: {
    color: TEXT_COLOR,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    marginTop: -40,
  },
  backdropImage: {
    width: "100%",
    height: 250,
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    padding: 16,
  },
  posterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  posterImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: SECONDARY_COLOR,
  },
  infoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: "bold",
  },
  year: {
    color: TEXT_COLOR,
    fontSize: 14,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  rating: {
    color: TEXT_COLOR,
    fontSize: 14,
    marginLeft: 4,
  },
  voteCount: {
    color: TEXT_COLOR,
    fontSize: 12,
    marginLeft: 8,
  },
  genres: {
    color: TEXT_COLOR,
    fontSize: 12,
    marginTop: 8,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  overview: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 20,
  },
  castItem: {
    marginRight: 16,
    width: 80,
    alignItems: "center",
  },
  castImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
  },
  castName: {
    color: TEXT_COLOR,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  castCharacter: {
    color: "#999",
    fontSize: 10,
    textAlign: "center",
    width: "100%",
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  commentsButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  ratingStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  commentInput: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 8,
    padding: 12,
    color: TEXT_COLOR,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  submitButton: {
    backgroundColor: ACCENT_COLOR,
  },
  modalButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: SECONDARY_COLOR,
    flex: 1,
    marginHorizontal: 4,
  },
  activeActionButton: {
    backgroundColor: "#253050",
  },
  actionButtonText: {
    color: TEXT_COLOR,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});

export default MovieDetailScreen;
