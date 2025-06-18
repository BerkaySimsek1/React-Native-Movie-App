import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Ana yığın navigasyon tipleri
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MovieDetail: { movieId: number };
  Comments: { movieId: string };
};

// Kimlik doğrulama yığın navigasyon tipleri
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Ana sekme navigasyon tipleri
export type MainTabParamList = {
  Home: undefined;
  Search: { initialCategory?: string; title?: string } | undefined;
  Watchlist: undefined;
  Watched: undefined;
  Profile: undefined;
};

// Tüm ekranlar için navigasyon prop tipleri
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type WatchlistScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Watchlist'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type WatchedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Watched'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type MovieDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MovieDetail'
>;

export type CommentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Comments'
>;

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>; 