import { useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { AuthState, User } from '../lib/types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('auth');
    const registrationData = localStorage.getItem('registrationData');

    if (savedAuth) {
      return JSON.parse(savedAuth);
    } else if (registrationData) {
      const data = JSON.parse(registrationData);
      return {
        isAuthenticated: true,
        user: {
          id: data.userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          birthdayDate: data.birthdate,
          city: data.city,
          description: data.description,
        },
      };
    }
    return { isAuthenticated: false, user: null };
  });

  const navigate = useNavigate();

  const login = (userData: User) => {
    const newState: AuthState = {
      isAuthenticated: true,
      user: userData,
    };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuthState({ isAuthenticated: false, user: null });
    navigate('/');
    localStorage.removeItem('registrationData');
    localStorage.removeItem('refreshToken');
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth') {
        if (event.newValue) {
          setAuthState(JSON.parse(event.newValue));
        } else {
          setAuthState({ isAuthenticated: false, user: null });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
  );
};