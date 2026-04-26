export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Дополнительные поля при необходимости
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
