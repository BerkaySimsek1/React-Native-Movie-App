import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// Navigatörleri içe aktar
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

// Ekranları içe aktar
import MovieDetailScreen from "../screens/detail/MovieDetailScreen";
import CommentsScreen from "../screens/detail/CommentsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Test modu - gerçek Firebase kimlik doğrulamasını kullan
  const TEST_MODE = false;

  // Kullanıcı oturum durumunu dinle
  useEffect(() => {
    try {
      if (TEST_MODE) {
        // Test modu aktif - sahte kullanıcı oluştur
        setUser({
          uid: "test-user-id",
          displayName: "Test Kullanıcı",
          email: "test@example.com",
        });
        setInitializing(false);
        return () => {};
      }

      // Normal mod - Firebase dinleyicisini kur
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (initializing) setInitializing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Firebase auth error:", error);
      // Hata durumunda test kullanıcısı ile devam et
      setUser({
        uid: "test-user-id",
        displayName: "Test Kullanıcı",
        email: "test@example.com",
      });
      setInitializing(false);
    }
  }, [initializing]);

  if (initializing) {
    // Yükleniyor ekranı gösterilebilir
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && !TEST_MODE ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="MovieDetail"
              component={MovieDetailScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerTintColor: "white",
              }}
            />
            <Stack.Screen
              name="Comments"
              component={CommentsScreen}
              options={{
                headerShown: true,
                headerTitle: "Yorumlar",
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#101130" },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
