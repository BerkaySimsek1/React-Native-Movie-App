import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
} from "../../constants/colors";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../../models/User";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // Basit doğrulama
    if (!name || !email || !password || !confirmPassword) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Firebase ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Kullanıcı profilini güncelle
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Varsayılan profil fotoğrafı
      const profilePhoto =
        "https://soccerpointeclaire.com/wp-content/uploads/2021/06/default-profile-pic-e1513291410505.jpg";

      // Firestore'a kullanıcı bilgilerini kaydet
      const userData: User = {
        uid: userCredential.user.uid,
        email: email,
        username: name,
        profilePhoto: profilePhoto,
      };

      await setDoc(doc(firestore, "users", userCredential.user.uid), userData);

      console.log("Kullanıcı başarıyla oluşturuldu ve Firestore'a kaydedildi");

      // Başarılı kayıt durumunda RootNavigator otomatik olarak Main ekranına yönlendirecek
    } catch (error: any) {
      let errorMessage = "Kayıt olurken bir hata oluştu.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu e-posta adresi zaten kullanılıyor.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Şifre çok zayıf.";
      }

      console.error("Kayıt hatası:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
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
          <Text style={styles.title}>Kayıt Ol</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre Tekrar"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={TEXT_COLOR} />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
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
  registerButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#999",
    fontSize: 14,
  },
  loginLink: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default RegisterScreen;
