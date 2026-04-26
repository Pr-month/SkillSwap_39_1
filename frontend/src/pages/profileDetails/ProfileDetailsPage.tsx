import { useLocation, Routes, Route } from 'react-router-dom';
import styles from './ProfileDetailsPage.module.css';
import { ProfileSidebar } from './components/ProfileSidebar/ProfileSidebar';
import { ProfileAvatar } from './components/ProfileAvatar/ProfileAvatar';
import { ProfileForm } from './components/ProfileForm/ProfileForm';
import { ProfileRequests } from './components/ProfileRequests/ProfileRequests';
import { ProfileExchanges } from './components/ProfileExchanges/ProfileExchanges';
import { ProfileFavorites } from './components/ProfileFavorites/ProfileFavorites';
import { ProfileSkills } from './components/ProfileSkills/ProfileSkills';

export default function ProfileDetailsPage() {
  const location = useLocation();

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.profileContent}>
        <ProfileSidebar currentPath={location.pathname} />
        <main className={styles.profileMain}>
          <Routes>
            <Route
              path="/details"
              element={
                <>
                  <ProfileAvatar />
                  <ProfileForm />
                </>
              }
            />
            <Route path="/requests" element={<ProfileRequests />} />
            <Route path="/exchanges" element={<ProfileExchanges />} />
            <Route path="/favorites" element={<ProfileFavorites />} />
            <Route path="/skills" element={<ProfileSkills />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
