import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  signOut,
  updateProfile,
  updateEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth, firestore } from "../../firebase/config";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  SECONDARY_COLOR,
  ERROR_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatingProfilePicture, setUpdatingProfilePicture] = useState(false);

  // Şifre değiştirme durumları
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // E-posta değiştirme durumları
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  // Hesap silme durumları
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "İsimsiz Kullanıcı");
      setEmail(currentUser.email || "");
      setNewEmail(currentUser.email || "");

      if (currentUser.photoURL) {
        setProfileImage(currentUser.photoURL);
      }
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Çıkış yapıldığında RootNavigator otomatik olarak Auth ekranına yönlendirecek
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      // İzin iste
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("İzin Gerekli", "Galeriye erişim izni gereklidir.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUpdatingProfilePicture(true);
        setProfileImage(result.assets[0].uri);

        try {
          // Gerçek uygulamada, resmi Firebase Storage'a yüklemek ve kullanıcı profilini güncellemek gerekir
          // Şimdilik sadece URI'yi kullanalım
          const currentUser = auth.currentUser;
          if (currentUser) {
            // Simüle edilmiş profil resmi güncelleme (gerçek uygulamada Storage kullanılacak)
            await updateProfile(currentUser, {
              photoURL: result.assets[0].uri,
            });

            // Firestore'daki kullanıcı belgesini güncelle (varsa)
            if (currentUser.uid) {
              const userDocRef = doc(firestore, "users", currentUser.uid);
              await updateDoc(userDocRef, {
                profilePhoto: result.assets[0].uri,
              });
            }

            Alert.alert("Başarılı", "Profil resmi güncellendi.");
          }
        } catch (error) {
          console.error("Error updating profile picture:", error);
          Alert.alert("Hata", "Profil resmi güncellenirken bir hata oluştu.");
        } finally {
          setUpdatingProfilePicture(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu.");
      setUpdatingProfilePicture(false);
    }
  };

  const saveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert("Hata", "Kullanıcı adı boş olamaz.");
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: displayName,
        });

        // Firestore'daki kullanıcı belgesini güncelle (varsa)
        if (currentUser.uid) {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          await updateDoc(userDocRef, {
            username: displayName,
          });
        }

        setUser({ ...currentUser, displayName });
        setEditMode(false);
        Alert.alert("Başarılı", "Profil bilgileri güncellendi.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Hata", "Profil güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Şifre doğrulama
    if (!currentPassword) {
      setPasswordError("Mevcut şifrenizi girmelisiniz");
      return;
    }

    if (!newPassword) {
      setPasswordError("Yeni şifre gereklidir");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    try {
      setLoading(true);
      setPasswordError("");
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        // Önce kullanıcıyı yeniden doğrula
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        // Şifreyi güncelle
        await updatePassword(currentUser, newPassword);

        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi");
      }
    } catch (error: any) {
      let errorMessage = "Şifre güncellenirken bir hata oluştu";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Mevcut şifreniz yanlış";
      }

      setPasswordError(errorMessage);
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    // E-posta doğrulama
    if (!emailPassword) {
      setEmailError("Şifrenizi girmelisiniz");
      return;
    }

    if (!newEmail) {
      setEmailError("Yeni e-posta adresi gereklidir");
      return;
    }

    // Basit e-posta formatı kontrolü
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      setEmailError("Geçerli bir e-posta adresi giriniz");
      return;
    }

    try {
      setLoading(true);
      setEmailError("");
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        // Önce kullanıcıyı yeniden doğrula
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          emailPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        // E-postayı güncelle
        await updateEmail(currentUser, newEmail);

        // Firestore'daki kullanıcı belgesini güncelle (varsa)
        if (currentUser.uid) {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          await updateDoc(userDocRef, {
            email: newEmail,
          });
        }

        setEmail(newEmail);
        setShowEmailModal(false);
        setEmailPassword("");

        Alert.alert("Başarılı", "E-posta adresiniz başarıyla değiştirildi");
      }
    } catch (error: any) {
      let errorMessage = "E-posta güncellenirken bir hata oluştu";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Şifreniz yanlış";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu e-posta adresi zaten kullanımda";
      }

      setEmailError(errorMessage);
      console.error("Error updating email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Hesabınızı silmek için şifrenizi girmelisiniz");
      return;
    }

    try {
      setLoading(true);
      setDeleteError("");
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        // Önce kullanıcıyı yeniden doğrula
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          deletePassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        // Hesabı sil
        await deleteUser(currentUser);

        // Hesap silindi - RootNavigator Auth ekranına yönlendirecek
        setShowDeleteModal(false);
      }
    } catch (error: any) {
      let errorMessage = "Hesap silinirken bir hata oluştu";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Şifreniz yanlış";
      }

      setDeleteError(errorMessage);
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştirme modalı
  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Şifre Değiştir</Text>

          <TextInput
            style={styles.input}
            placeholder="Mevcut Şifre"
            placeholderTextColor="#999"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni Şifre"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni Şifre (Tekrar)"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowPasswordModal(false);
                setPasswordError("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={TEXT_COLOR} />
              ) : (
                <Text style={styles.buttonText}>Değiştir</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // E-posta değiştirme modalı
  const renderEmailModal = () => (
    <Modal
      visible={showEmailModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEmailModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>E-posta Değiştir</Text>

          <TextInput
            style={styles.input}
            placeholder="Yeni E-posta"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifreniz"
            placeholderTextColor="#999"
            secureTextEntry
            value={emailPassword}
            onChangeText={setEmailPassword}
          />

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowEmailModal(false);
                setEmailError("");
                setEmailPassword("");
                setNewEmail(email);
              }}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={TEXT_COLOR} />
              ) : (
                <Text style={styles.buttonText}>Değiştir</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Hesap silme modalı
  const renderDeleteAccountModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Hesabı Sil</Text>

          <Text style={styles.warningText}>
            Dikkat: Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı
            olarak silinecektir.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Şifreniz"
            placeholderTextColor="#999"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
          />

          {deleteError ? (
            <Text style={styles.errorText}>{deleteError}</Text>
          ) : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteError("");
                setDeletePassword("");
              }}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={TEXT_COLOR} />
              ) : (
                <Text style={styles.buttonText}>Hesabı Sil</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            {updatingProfilePicture ? (
              <ActivityIndicator size="large" color={ACCENT_COLOR} />
            ) : (
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("../../../assets/default-profile.jpg")
                }
                style={styles.profileImage}
              />
            )}
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handlePickImage}
            >
              <Ionicons name="camera" size={20} color={TEXT_COLOR} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            {editMode ? (
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Kullanıcı Adı"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.name}>
                {displayName || "İsimsiz Kullanıcı"}
              </Text>
            )}
            <Text style={styles.email}>{email}</Text>
          </View>

          {editMode ? (
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setEditMode(false);
                  // Değişiklikleri geri al
                  setDisplayName(user.displayName || "İsimsiz Kullanıcı");
                }}
              >
                <Text style={styles.editButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={saveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={TEXT_COLOR} />
                ) : (
                  <Text style={styles.editButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setEditMode(true)}
            >
              <Ionicons name="create-outline" size={20} color={TEXT_COLOR} />
              <Text style={styles.editProfileText}>Profili Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Hesap Ayarları</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowEmailModal(true)}
          >
            <Ionicons name="mail-outline" size={24} color={LOGO_COLOR} />
            <Text style={styles.settingText}>E-posta Değiştir</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <Ionicons name="key-outline" size={24} color={LOGO_COLOR} />
            <Text style={styles.settingText}>Şifre Değiştir</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Ionicons name="log-out-outline" size={24} color={LOGO_COLOR} />
            <Text style={styles.settingText}>Çıkış Yap</Text>
            {loading ? (
              <ActivityIndicator size="small" color={ACCENT_COLOR} />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#999" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={24} color={ERROR_COLOR} />
            <Text style={[styles.settingText, styles.dangerText]}>
              Hesabı Sil
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPasswordModal()}
      {renderEmailModal()}
      {renderDeleteAccountModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: TEXT_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A5E",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_COLOR,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: ACCENT_COLOR,
    minWidth: 200,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#999",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editProfileText: {
    color: TEXT_COLOR,
    marginLeft: 8,
    fontWeight: "bold",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: ACCENT_COLOR,
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  deleteButton: {
    backgroundColor: ERROR_COLOR,
  },
  editButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
  settingsContainer: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: ERROR_COLOR,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: BACKGROUND_COLOR,
    color: TEXT_COLOR,
    fontSize: 16,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: ERROR_COLOR,
    marginBottom: 12,
  },
  warningText: {
    color: ERROR_COLOR,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default ProfileScreen;
