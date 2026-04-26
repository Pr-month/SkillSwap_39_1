import { useRef, ChangeEvent, useState } from 'react';
import { useSelector, useDispatch } from '@/services/store/store';
import { userSliceSelectors, userSliceActions } from '@/services/slices/authSlice';
import styles from './ProfileAvatar.module.css';

export function ProfileAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const user = useSelector(userSliceSelectors.selectUser);
  const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
  const [avatarPreview, setAvatarPreview] = useState(registrationData?.avatar || user?.image || '');
  const [error, setError] = useState('');

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Только изображения разрешены');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Максимальный размер файла 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        const avatarUrl = event.target.result as string;
        setAvatarPreview(avatarUrl);
        setError('');

        // Обновляем в localStorage
        const updatedRegistrationData = {
          ...registrationData,
          avatar: avatarUrl,
        };
        localStorage.setItem('registrationData', JSON.stringify(updatedRegistrationData));

        // Обновляем в Redux
        if (user) {
          dispatch(
            userSliceActions.setUserData({
              ...user,
              image: avatarUrl,
            }),
          );
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.profileAvatarBlock}>
      <img
        src={avatarPreview || '/default-avatar.png'}
        alt="Аватар"
        className={styles.profileAvatar}
        onError={e => {
          const target = e.target as HTMLImageElement;
          target.src = '/default-avatar.png';
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <button
        className={styles.profileEditPhotoBtn}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <span className={styles.profileGalleryEdit} />
      </button>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
