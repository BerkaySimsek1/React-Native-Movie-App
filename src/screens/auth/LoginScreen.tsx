import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  ERROR_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Kayıtlı e-posta adresini yükle
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.error("Kayıtlı e-posta yüklenirken hata:", e);
      }
    };

    loadSavedEmail();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // E-posta adresini kaydet veya sil
      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
      } else {
        await AsyncStorage.removeItem("savedEmail");
      }

      // Başarılı giriş durumunda RootNavigator otomatik olarak Main ekranına yönlendirecek
    } catch (error: any) {
      let errorMessage = "Giriş yapılırken bir hata oluştu.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Hatalı şifre.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Bu hesap devre dışı bırakılmış.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.";
      }

      console.error("Giriş hatası:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Film Uygulaması</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Giriş Yap</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rememberContainer}>
            <TouchableOpacity
              style={styles.rememberMeButton}
              onPress={toggleRememberMe}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={20}
                color={rememberMe ? LOGO_COLOR : "#999"}
              />
              <Text style={styles.rememberText}>Beni Hatırla</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={TEXT_COLOR} />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu?</Text>
            <TouchableOpacity onPress={handleRegisterPress}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: ACCENT_COLOR,
  },
  formContainer: {
    backgroundColor: "#1E1E3F",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 20,
    textAlign: "center",
  },
  errorText: {
    color: ERROR_COLOR,
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A5A",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: TEXT_COLOR,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  rememberMeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    color: "#999",
    marginLeft: 5,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#999",
    fontSize: 14,
  },
  registerLink: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default LoginScreen;
