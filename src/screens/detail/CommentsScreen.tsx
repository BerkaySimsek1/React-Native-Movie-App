import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import {
  BACKGROUND_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  SECONDARY_COLOR,
  LOGO_COLOR,
} from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  getComments,
  addComment,
  deleteUserComment,
} from "../../services/userService";
import { Comment } from "../../models/Movie";
import { auth } from "../../firebase/config";

type CommentsScreenProps = {
  route: RouteProp<RootStackParamList, "Comments">;
  navigation: NativeStackNavigationProp<RootStackParamList, "Comments">;
};

const CommentsScreen: React.FC<CommentsScreenProps> = ({
  route,
  navigation,
}) => {
  const { movieId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserComment, setCurrentUserComment] = useState<Comment | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsData = await getComments(Number(movieId));
      setComments(commentsData);

      // Kullanıcı giriş yapmışsa, kendi yorumunu kontrol et
      if (auth.currentUser) {
        const userComment = commentsData.find(
          (comment) => comment.uid === auth.currentUser?.uid
        );

        if (userComment) {
          setCurrentUserComment(userComment);
          setNewComment(userComment.comment);
          setUserRating(userComment.rating);
          setIsEditing(true);
        } else {
          setCurrentUserComment(null);
          setNewComment("");
          setUserRating(0);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Yorumlar alınırken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Yorumlar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditComment = async () => {
    if (!auth.currentUser) {
      Alert.alert("Hata", "Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    if (newComment.trim() === "" || userRating === 0) {
      Alert.alert("Uyarı", "Lütfen hem yorum yazın hem de puan verin.");
      return;
    }

    try {
      setSubmitting(true);

      // Mevcut yorumu güncelle veya yeni yorum ekle
      await addComment(Number(movieId), newComment, userRating);

      // Yorumları yeniden yükle
      await fetchComments();

      if (isEditing) {
        Alert.alert("Başarılı", "Yorumunuz güncellendi.");
      } else {
        Alert.alert("Başarılı", "Yorumunuz eklendi. Teşekkürler!");
      }
    } catch (error) {
      console.error("Yorum eklenirken/güncellenirken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Yorumunuz eklenirken/güncellenirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!auth.currentUser || !currentUserComment) {
      return;
    }

    Alert.alert("Yorum Sil", "Yorumunuzu silmek istediğinize emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteUserComment(Number(movieId));

            // Yorumları yeniden yükle
            await fetchComments();

            // Form durumunu sıfırla
            setCurrentUserComment(null);
            setNewComment("");
            setUserRating(0);
            setIsEditing(false);

            Alert.alert("Başarılı", "Yorumunuz silindi.");
          } catch (error) {
            console.error("Yorum silinirken hata oluştu:", error);
            Alert.alert(
              "Hata",
              "Yorumunuz silinirken bir sorun oluştu. Lütfen tekrar deneyin."
            );
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleCancelEdit = () => {
    if (currentUserComment) {
      setNewComment(currentUserComment.comment);
      setUserRating(currentUserComment.rating);
    } else {
      setNewComment("");
      setUserRating(0);
      setIsEditing(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <View style={styles.ratingStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setUserRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= userRating ? "star" : "star-outline"}
              size={22}
              color={star <= userRating ? LOGO_COLOR : "#999"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View
      style={[
        styles.commentItem,
        item.uid === auth.currentUser?.uid ? styles.currentUserComment : null,
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          {item.profilePic ? (
            <Image
              source={{ uri: item.profilePic }}
              style={styles.profilePic}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>
            {item.uid === auth.currentUser?.uid
              ? `${item.username} (Siz)`
              : item.username}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={14}
              color={star <= item.rating ? LOGO_COLOR : "#666"}
              style={styles.ratingStar}
            />
          ))}
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yorumlar</Text>
        <View style={styles.placeholderButton} />
      </View>

      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item, index) => `${item.uid}-${index}`}
        contentContainerStyle={styles.commentsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Henüz yorum yapılmamış.</Text>
            <Text style={styles.emptySubtext}>İlk yorumu siz yapın!</Text>
          </View>
        }
      />

      {auth.currentUser ? (
        <View style={styles.inputSection}>
          {isEditing && (
            <View style={styles.editingHeader}>
              <Text style={styles.editingText}>
                {isEditing ? "Yorumunuzu Düzenliyorsunuz" : "Yorum Yapın"}
              </Text>
              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteComment}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={TEXT_COLOR} />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={TEXT_COLOR}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {renderRatingStars()}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Yorum yaz..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />

            <View style={styles.buttonContainer}>
              {isEditing && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddOrEditComment}
                disabled={
                  newComment.trim() === "" || userRating === 0 || submitting
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={ACCENT_COLOR} />
                ) : (
                  <Ionicons
                    name={isEditing ? "checkmark" : "send"}
                    size={24}
                    color={
                      newComment.trim() === "" || userRating === 0
                        ? "#666"
                        : ACCENT_COLOR
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>
            Yorum yapmak için giriş yapmalısınız
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth" as any)}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    backgroundColor: SECONDARY_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 4,
  },
  placeholderButton: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginTop: 12,
  },
  commentsList: {
    padding: 16,
    paddingBottom: 100,
  },
  commentItem: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  currentUserComment: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  profilePlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ACCENT_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  profilePlaceholderText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
    fontSize: 14,
  },
  userName: {
    color: TEXT_COLOR,
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  ratingStar: {
    marginHorizontal: 1,
  },
  commentText: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: TEXT_COLOR,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubtext: {
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  inputSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 12,
  },
  editingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  editingText: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 5,
    backgroundColor: "#554",
    borderRadius: 5,
  },
  ratingStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  starButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: TEXT_COLOR,
    maxHeight: 100,
    minHeight: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendButton: {
    padding: 8,
    alignSelf: "flex-end",
  },
  cancelButton: {
    padding: 8,
  },
  loginPrompt: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 16,
    alignItems: "center",
  },
  loginPromptText: {
    color: TEXT_COLOR,
    fontSize: 14,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: TEXT_COLOR,
    fontWeight: "bold",
  },
});

export default CommentsScreen;
