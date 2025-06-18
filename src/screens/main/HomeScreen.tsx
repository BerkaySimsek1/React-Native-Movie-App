import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getPopularMovies,
  getTopRatedMovies,
} from "../../services/movieService";
import { Movie } from "../../models/Movie";
import {
  BACKGROUND_COLOR,
  LOGO_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
} from "../../constants/colors";
import { FONT_SIZE_XLARGE, SPACING_MEDIUM } from "../../constants/sizes";
import { HomeScreenNavigationProp } from "../../navigation/types";
import SectionHeader from "../../components/SectionHeader";
import MovieList from "../../components/MovieList";

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [randomMovieId, setRandomMovieId] = useState<number | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated] = await Promise.all([
        getPopularMovies(1),
        getTopRatedMovies(1),
      ]);

      setPopularMovies(popular);
      setTopRatedMovies(topRated);

      // Rastgele bir film seç
      if (popular.length > 0) {
        const randomIndex = Math.floor(Math.random() * popular.length);
        setRandomMovieId(popular[randomIndex].id);
      }
    } catch (err) {
      setError("Filmler yüklenirken bir hata oluştu");
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMovies();
    setRefreshing(false);
  };

  const handleRandomMovie = () => {
    if (randomMovieId) {
      navigation.navigate("MovieDetail", { movieId: randomMovieId });
    }
  };

  const handleSeeAllPopular = () => {
    navigation.navigate("Search", {
      initialCategory: "popular",
      title: "Popüler Filmler",
    });
  };

  const handleSeeAllTopRated = () => {
    navigation.navigate("Search", {
      initialCategory: "top_rated",
      title: "En İyi Filmler",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />

      <View style={styles.header}>
        <Text style={styles.title}>Sinetopia</Text>
        <TouchableOpacity
          onPress={handleRandomMovie}
          style={styles.randomButton}
        >
          <Text style={styles.randomButtonText}>Rastgele Film</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ACCENT_COLOR]}
            tintColor={ACCENT_COLOR}
          />
        }
      >
        <SectionHeader
          title="Popüler Filmler"
          showSeeAll
          onSeeAllPress={handleSeeAllPopular}
        />
        <MovieList movies={popularMovies} loading={loading} error={error} />

        <SectionHeader
          title="En İyi Filmler"
          showSeeAll
          onSeeAllPress={handleSeeAllTopRated}
        />
        <MovieList movies={topRatedMovies} loading={loading} error={error} />
      </ScrollView>
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
    paddingHorizontal: SPACING_MEDIUM,
    paddingVertical: SPACING_MEDIUM,
  },
  title: {
    color: LOGO_COLOR,
    fontSize: FONT_SIZE_XLARGE,
    fontWeight: "bold",
  },
  randomButton: {
    padding: SPACING_MEDIUM / 2,
  },
  randomButtonText: {
    color: LOGO_COLOR,
  },
  scrollContent: {
    paddingBottom: SPACING_MEDIUM * 4,
  },
});

export default HomeScreen;
