import { userSliceSelectors } from '@/services/slices/authSlice';
import { useSelector } from '@/services/store/store';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute = ({ onlyUnAuth, children }: ProtectedRouteProps) => {
  const isAuthChecked = useSelector(userSliceSelectors.selectUserCheck);
  const user = useSelector(userSliceSelectors.selectUser);
  const location = useLocation();
  if (!isAuthChecked) {
    /* Preloader, когда будет готов 
      return */
  }
  if (!onlyUnAuth && !user) return <Navigate replace to="/login" state={{ from: location }} />;
  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate replace to={from} />;
  }
  return children;
};
