import { MainLayout } from '@/widgets/Layout/MainLayout';
import './styles/index.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ComponentType, lazy, Suspense, useEffect } from 'react';
import { ProtectedRoute } from '@/shared/ui/protectedRoute/protectedRoute';
import { useDispatch, useSelector } from '@/services/store/store';
import { initializeLikes } from '@/services/slices/likeSlice';
import { fetchCatalog } from '@/services/slices/catalogSlice';
import { CatalogPage } from '@/pages/catalogPage/catalogPage';
import { fetchUser } from '@/services/thunk/authUser';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { fetchExchanges } from '@/services/slices/exchangeSlice';
import { getSkills } from '@/services/slices/skillsSlice';
import { userSliceSelectors } from '@/services/slices/authSlice';
import Loader from '@/shared/ui/Loader/loader';
const ProfileDetailsPage = lazy(
  () =>
    new Promise<{ default: ComponentType<unknown> }>(resolve => {
      setTimeout(() => {
        import('@/pages/profileDetails/ProfileDetailsPage').then(module =>
          resolve({ default: module.default }),
        );
      }, 2000);
    }),
);
const SkillPage = lazy(() => import('@/pages/skillPage/skillPage'));
const RegistrationForms = lazy(() => import('@/features/registrationForms/registrationForms'));
const SuccessModal = lazy(() => import('@/features/successModal/successModal'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage/ErrorPage'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state && location.state.background;
  const dispatch = useDispatch();
  const authUser = useSelector(userSliceSelectors.selectUser);

  useEffect(() => {
    dispatch(initializeLikes());
    dispatch(fetchUser());
    dispatch(fetchCatalog());
    dispatch(getSkills());
  }, [dispatch]);

  useEffect(() => {
    void dispatch(fetchExchanges());
  }, [dispatch, authUser?._id]);

  return (
    <Suspense fallback={<Loader />}>
      {/* 
        Основной блок <Routes> для отображения страниц.
        Мы передаем ему `location={backgroundLocation || location}`.
        Это "замораживает" фоновую страницу, когда модальное окно активнo.
      */}
      <Routes location={backgroundLocation || location}>
        {/*
          Маршруты, которые используют основной Layout.
          Все вложенные Route будут рендериться внутри <MainLayout />
        */}
        <Route path="/" element={<MainLayout />}>
          {/* index-маршрут для корневого пути "/" */}
          <Route index element={<CatalogPage />} />
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <ProfileDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/skill/:id" element={<SkillPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<ErrorPage type="404"></ErrorPage>} />
        </Route>

        {/* 
          Маршруты, которые НЕ используют MainLayout (например, страницы входа и регистрации).
          Они находятся на том же уровне, что и <Route path="/" element={<MainLayout />}>.
        */}
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <RegistrationForms isRegister={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              {/* Я поместил сюда RegistrationForms, так как это логичное место для страницы регистрации */}
              <RegistrationForms />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 
        Этот блок отвечает за отображение МОДАЛЬНЫХ ОКОН.
        Он рендерится только если в `location.state` есть `background`.
        Это позволяет показывать модальное окно поверх основной страницы.
      */}
      {backgroundLocation && (
        <Routes>
          {/* Руты для модалок */}
          <Route
            path="/success"
            element={
              <SuccessModal
                onClose={function (): void {
                  throw new Error('Function not implemented.');
                }}
              />
            }
          />
          <Route
            path="/register/success"
            element={
              <SuccessModal
                onClose={() => {
                  navigate('/');
                }}
              />
            }
          />
          <Route
            path="/offer/:id/success"
            element={
              <ProtectedRoute>
                <>{/* Модалка о созданном предложении обмена */}</>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </Suspense>
  );
}

export default App;
