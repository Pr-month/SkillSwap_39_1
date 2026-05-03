import { useRef, ChangeEvent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from '@/services/store/store';
import { userSliceSelectors, userSliceActions } from '@/services/slices/authSlice';
import { updateProfileApi, uploadFileApi } from '@/api/skillSwapApi';
import styles from './ProfileAvatar.module.css';

export function ProfileAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const user = useSelector(userSliceSelectors.selectUser);
  const [avatarPreview, setAvatarPreview] = useState(
    typeof user?.image === 'string' ? user.image : '',
  );
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setAvatarPreview(typeof user?.image === 'string' ? user.image : '');
  }, [user?.image]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

    try {
      setIsUploading(true);
      const uploadedFile = await uploadFileApi(file);
      const updatedUser = await updateProfileApi({
        avatar: uploadedFile.url,
      });

      setAvatarPreview(updatedUser.image as string);
      setError('');
      dispatch(userSliceActions.setUserData(updatedUser));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Не удалось обновить аватар',
      );
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
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
        disabled={isUploading}
      >
        <span className={styles.profileGalleryEdit} />
      </button>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
