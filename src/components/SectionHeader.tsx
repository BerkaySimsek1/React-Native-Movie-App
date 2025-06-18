import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TEXT_COLOR, ACCENT_COLOR } from "../constants/colors";

interface SectionHeaderProps {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showSeeAll = false,
  onSeeAllPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: ACCENT_COLOR,
    fontSize: 14,
  },
});

export default SectionHeader;
