import { createContext, useContext } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  birthdayDate?: string;
  city?: string;
  description?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

type AuthContextType = AuthState & {
  login: (userData: User) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
