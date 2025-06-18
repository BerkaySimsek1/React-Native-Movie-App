import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Movie, Recommendation, SearchResult } from "../models/Movie";
import { TEXT_COLOR, SECONDARY_COLOR } from "../constants/colors";
import {
  IMAGE_BASE_URL,
  POSTER_SIZE,
  DEFAULT_MOVIE_IMAGE,
} from "../constants/api";

type MovieCardItem = Movie | Recommendation | SearchResult;

interface MovieCardProps {
  movie: MovieCardItem;
  onPress: () => void;
  horizontal?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  horizontal = true,
}) => {
  // Poster URL oluştur
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${movie.poster_path}`
    : DEFAULT_MOVIE_IMAGE;

  // Yıl bilgisini al - sadece Movie tipinde release_date mevcut
  const releaseYear =
    "release_date" in movie && movie.release_date
      ? movie.release_date.split("-")[0]
      : "";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.gridContainer,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        {releaseYear ? <Text style={styles.year}>{releaseYear}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    overflow: "hidden",
  },
  horizontalContainer: {
    width: 140,
    marginRight: 10,
  },
  gridContainer: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 16,
  },
  poster: {
    width: "100%",
    height: 200,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rating: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  year: {
    color: "#999",
    fontSize: 12,
  },
});

export default MovieCard;
