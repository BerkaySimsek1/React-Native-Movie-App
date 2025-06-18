import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { BACKGROUND_COLOR, LOGO_COLOR, TEXT_COLOR } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

// Ekranları içe aktar (henüz oluşturulmadı)
import HomeScreen from "../screens/main/HomeScreen";
import SearchScreen from "../screens/main/SearchScreen";
import WatchlistScreen from "../screens/main/WatchlistScreen";
import WatchedScreen from "../screens/main/WatchedScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BACKGROUND_COLOR,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: LOGO_COLOR,
        tabBarInactiveTintColor: TEXT_COLOR,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Ara",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: "İzleme Listesi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Watched"
        component={WatchedScreen}
        options={{
          tabBarLabel: "İzlenenler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
