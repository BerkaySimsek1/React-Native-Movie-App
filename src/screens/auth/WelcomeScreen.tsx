import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const { width, height } = Dimensions.get("window");

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{
          uri: "https://image.tmdb.org/t/p/w780/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
        }}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="film-outline" size={60} color={LOGO_COLOR} />
              <Text style={styles.logoText}>Film Uygulaması</Text>
            </View>

            <Text style={styles.subtitle}>
              En sevdiğiniz filmleri keşfedin, koleksiyon oluşturun ve
              arkadaşlarınızla paylaşın.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                TMDB API kullanılarak geliştirilmiştir
              </Text>
              <Text style={styles.versionText}>Versiyon 1.0.0</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width,
    height,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(16, 17, 48, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: LOGO_COLOR,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_COLOR,
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: ACCENT_COLOR,
  },
  registerButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: ACCENT_COLOR,
  },
  buttonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: "bold",
  },
  infoContainer: {
    position: "absolute",
    bottom: -100,
    alignItems: "center",
  },
  infoText: {
    color: "#999",
    fontSize: 12,
    marginBottom: 5,
  },
  versionText: {
    color: "#777",
    fontSize: 10,
  },
});

export default WelcomeScreen;
