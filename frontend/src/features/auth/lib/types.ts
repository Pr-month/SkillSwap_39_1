export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  birthdayDate?: string;
  city?: string;
  description?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
