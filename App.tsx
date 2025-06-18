import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  LOGO_COLOR,
} from "./src/constants/colors";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simüle edilmiş yükleme gecikmesi
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Hazırlık tamamlandı
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: TEXT_COLOR,
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    color: LOGO_COLOR,
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  heading: {
    color: TEXT_COLOR,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paragraph: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#1E1E3F",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: LOGO_COLOR,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 20,
  },
});
