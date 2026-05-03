import { useState, ReactNode, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState, User } from '../lib/types';
import { useDispatch, useSelector } from '@/services/store/store';
import { userSliceSelectors } from '@/services/slices/authSlice';
import { logoutUserApi } from '@/services/thunk/authUser';

const mapReduxUserToContextUser = (
  user: ReturnType<typeof userSliceSelectors.selectUser>,
): User | null => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email || '',
    avatar: typeof user.image === 'string' ? user.image : undefined,
    birthdayDate: user.birthdayDate,
    city: user.city,
    description: user.description,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const authUser = useSelector(userSliceSelectors.selectUser);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const login = (userData: User) => {
    setAuthState({
      isAuthenticated: true,
      user: userData,
    });
  };

  const logout = () => {
    void dispatch(logoutUserApi());
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem('registrationData');
  };

  useEffect(() => {
    const nextUser = mapReduxUserToContextUser(authUser);

    setAuthState({
      isAuthenticated: Boolean(nextUser),
      user: nextUser,
    });
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
  );
};
