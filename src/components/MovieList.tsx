import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Movie, Recommendation } from "../models/Movie";
import MovieCard from "./MovieCard";
import { TEXT_COLOR, ACCENT_COLOR } from "../constants/colors";
import { HomeScreenNavigationProp } from "../navigation/types";

const { width } = Dimensions.get("window");

interface MovieListProps {
  movies: (Movie | Recommendation)[];
  loading: boolean;
  error: string | null;
  horizontal?: boolean;
  numColumns?: number;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  loading,
  error,
  horizontal = true,
  numColumns = 2,
}) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Film bulunamadı</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={movies}
      renderItem={({ item }) => (
        <MovieCard
          movie={item}
          onPress={() =>
            navigation.navigate("MovieDetail", { movieId: item.id })
          }
          horizontal={horizontal}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        horizontal ? styles.horizontalList : styles.gridList
      }
      numColumns={horizontal ? 1 : numColumns}
      key={horizontal ? "horizontal" : "grid"}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: TEXT_COLOR,
    textAlign: "center",
  },
  emptyContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: TEXT_COLOR,
    textAlign: "center",
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 16,
  },
  gridList: {
    padding: 8,
    justifyContent: "space-between",
  },
});

export default MovieList;
