export interface User {
  uid: string;
  email: string;
  username: string;
  profilePhoto: string;
}

export interface UserCredentials {
  email: string;
  password: string;
  username?: string;
} 