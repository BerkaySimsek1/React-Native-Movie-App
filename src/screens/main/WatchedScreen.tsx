import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { WatchedScreenNavigationProp } from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  SECONDARY_COLOR,
} from "../../constants/colors";
import { Movie } from "../../models/Movie";
import MovieCard from "../../components/MovieCard";
import { getWatchedMovies } from "../../services/userService";
import { auth } from "../../firebase/config";

const WatchedScreen = () => {
  const navigation = useNavigation<WatchedScreenNavigationProp>();
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ekran her odaklandığında listeyi güncelle
  useFocusEffect(
    React.useCallback(() => {
      fetchWatchedMovies();
    }, [])
  );

  const fetchWatchedMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser && !__DEV__) {
        setError("İzlenen filmleri görmek için giriş yapmalısınız");
        setWatchedMovies([]);
        setLoading(false);
        return;
      }

      const movies = await getWatchedMovies();
      setWatchedMovies(movies);
    } catch (err) {
      setError("İzlenen filmler yüklenirken bir hata oluştu");
      console.error("Error fetching watched movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <MovieCard
      movie={item}
      onPress={() => navigation.navigate("MovieDetail", { movieId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İzlediğim Filmler</Text>
        <TouchableOpacity
          onPress={fetchWatchedMovies}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {!auth.currentUser && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Auth" as any)}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWatchedMovies}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={watchedMovies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.moviesContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>
                Henüz izlediğiniz film bulunmuyor
              </Text>
              <Text style={styles.emptySubtext}>
                Filmleri izledikçe burada listelenecekler
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.browseButtonText}>Filmlere Göz At</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: TEXT_COLOR,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: TEXT_COLOR,
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
  moviesContainer: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    color: TEXT_COLOR,
    textAlign: "center",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  emptySubtext: {
    color: "#999",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  browseButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
});

export default WatchedScreen;
