import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  SearchScreenNavigationProp,
  MainTabParamList,
} from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  SECONDARY_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import {
  searchMovies,
  getPopularMovies,
  getTopRatedMovies,
} from "../../services/movieService";
import { Movie, SearchResult } from "../../models/Movie";
import MovieCard from "../../components/MovieCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "../../utils/helpers";

type SearchScreenRouteProp = RouteProp<MainTabParamList, "Search">;
const SEARCH_HISTORY_KEY = "@movie_app_search_history";

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const initialCategory = route.params?.initialCategory;
  const screenTitle = route.params?.title || "Film Ara";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Movie | SearchResult)[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Animasyon değerleri
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      loadCategoryMovies(initialCategory, 1);
    } else {
      loadSearchHistory();
    }

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsSearchFocused(false);
        setShowHistory(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [initialCategory]);

  // Arama geçmişini yükle
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Arama geçmişi yüklenirken hata:", error);
    }
  };

  // Arama geçmişine ekle
  const addToSearchHistory = async (query: string) => {
    if (!query.trim()) return;

    try {
      let history = [...searchHistory];

      // Eğer aynı arama zaten varsa, onu kaldır (en üste ekleyeceğiz)
      history = history.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );

      // En başa ekle ve maksimum 10 arama geçmişi tut
      history.unshift(query);
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      setSearchHistory(history);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Arama geçmişi kaydedilirken hata:", error);
    }
  };

  // Arama geçmişini temizle
  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Arama geçmişi temizlenirken hata:", error);
    }
  };

  const loadCategoryMovies = async (category: string, pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      let results: Movie[] = [];

      if (category === "popular") {
        results = await getPopularMovies(pageNumber);
      } else if (category === "top_rated") {
        results = await getTopRatedMovies(pageNumber);
      }

      setSearchResults(
        pageNumber === 1 ? results : [...searchResults, ...results]
      );
      setHasMoreData(results.length > 0);
      setPage(pageNumber);
    } catch (err) {
      setError("Filmler yüklenirken bir hata oluştu");
      console.error("Error loading movies:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Arama fonksiyonu
  const performSearch = async (query: string, pageNumber: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(pageNumber === 1);
      setError(null);

      const results = await searchMovies(query, pageNumber);

      if (pageNumber === 1) {
        setSearchResults(results);
        // Aramayı geçmişe ekle (sadece ilk sayfa için)
        addToSearchHistory(query);
      } else {
        setSearchResults([...searchResults, ...results]);
      }

      setHasMoreData(results.length > 0);
      setPage(pageNumber);

      if (results.length === 0 && pageNumber === 1) {
        setError("Arama sonucu bulunamadı");
      }
    } catch (err) {
      setError("Arama yapılırken bir hata oluştu");
      console.error("Error searching movies:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setShowHistory(false);
    }
  };

  // Debounce ile arama (kullanıcı yazmayı bıraktıktan sonra otomatik arama)
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (text.trim().length >= 2) {
        performSearch(text, 1);
      } else if (text.trim().length === 0) {
        setSearchResults([]);
      }
    }, 500),
    []
  );

  // Arama kutusu değiştiğinde
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      debouncedSearch(text);
    } else if (text.trim().length === 0) {
      setSearchResults([]);
      if (initialCategory) {
        loadCategoryMovies(initialCategory, 1);
      }
    }
  };

  // Manuel arama butonu
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setShowHistory(false);
    performSearch(searchQuery, 1);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMoreData) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    if (initialCategory && !searchQuery.trim()) {
      loadCategoryMovies(initialCategory, nextPage);
    } else if (searchQuery.trim()) {
      performSearch(searchQuery, nextPage);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowHistory(false);

    if (initialCategory) {
      loadCategoryMovies(initialCategory, 1);
    } else {
      setSearchResults([]);
      setError(null);
    }
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
    setShowHistory(false);
    performSearch(item, 1);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (!initialCategory && !searchQuery.trim()) {
      setShowHistory(true);

      // Geçiş animasyonu
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderMovieItem = ({ item }: { item: Movie | SearchResult }) => (
    <MovieCard
      movie={item}
      onPress={() => navigation.navigate("MovieDetail", { movieId: item.id })}
      horizontal={false}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={ACCENT_COLOR} />
      </View>
    );
  };

  const renderSearchHistory = () => {
    if (!showHistory || searchHistory.length === 0) return null;

    return (
      <Animated.View style={[styles.historyContainer, { opacity: fadeAnim }]}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Son Aramalar</Text>
          <TouchableOpacity onPress={clearSearchHistory}>
            <Text style={styles.clearHistoryText}>Temizle</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={searchHistory}
          keyExtractor={(item, index) => `history-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <Ionicons name="time-outline" size={18} color="#999" />
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>{screenTitle}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              isSearchFocused && styles.searchInputFocused,
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={isSearchFocused ? LOGO_COLOR : "#999"}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Film adı, oyuncu veya yönetmen ara..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearch}
              onFocus={handleSearchFocus}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!searchQuery.trim() || loading) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!searchQuery.trim() || loading}
          >
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </View>

        {renderSearchHistory()}

        {loading && !loadingMore ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT_COLOR} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.resultsContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              searchQuery.trim() || initialCategory ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Film bulunamadı</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Film aramak için yukarıdaki arama çubuğunu kullanın
                  </Text>
                </View>
              )
            }
          />
        )}
      </KeyboardAvoidingView>
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
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_COLOR,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchInputFocused: {
    borderColor: LOGO_COLOR,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: TEXT_COLOR,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchButtonDisabled: {
    backgroundColor: ACCENT_COLOR + "80", // 50% opacity
  },
  searchButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
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
  },
  resultsContainer: {
    padding: 8,
    paddingBottom: 20,
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
  },
  footerLoader: {
    padding: 20,
    alignItems: "center",
  },
  historyContainer: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    maxHeight: 300,
    padding: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  historyTitle: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: "bold",
  },
  clearHistoryText: {
    color: LOGO_COLOR,
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  historyText: {
    color: TEXT_COLOR,
    marginLeft: 10,
    fontSize: 14,
  },
});

export default SearchScreen;
