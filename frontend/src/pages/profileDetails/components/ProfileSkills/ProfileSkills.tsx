import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from '@/services/store/store';
import { userSliceSelectors, userSliceActions } from '@/services/slices/authSlice';
import { skillsCategories } from '@/shared/lib/categories';
import { Button } from '@/shared/ui/button/button';
import styles from './ProfileSkills.module.css';
import { CustomSkill } from '@/entities/skill/model/types';

type SkillCategory = keyof typeof skillsCategories;

export function ProfileSkills() {
  const dispatch = useDispatch();
  const user = useSelector(userSliceSelectors.selectUser);
  const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    category: registrationData?.skillCategory || user?.canTeach?.category || '',
    subcategory: registrationData?.skillSubCategory || user?.canTeach?.subcategory || '',
    name: registrationData?.skillName || user?.canTeach?.name || '',
    description: registrationData?.description || user?.canTeach?.description || '',
  });

  const handleAddSkill = () => {
    if (formData.category && formData.subcategory && formData.name && user) {
      const updatedSkills = {
        category: formData.category,
        subcategory: formData.subcategory,
        subcategoryId: `${formData.category.toLowerCase()}_${formData.subcategory.toLowerCase()}_${uuidv4()}`,
        name: formData.name,
        description: formData.description || '',
        image: registrationData?.images || user.canTeach?.image || [],
        customSkillId: user.canTeach?.customSkillId || uuidv4(),
      } as CustomSkill;

      dispatch(
        userSliceActions.setUserData({
          ...user,
          canTeach: updatedSkills,
        }),
      );

      // Обновляем данные в localStorage
      const updatedRegistrationData = {
        ...registrationData,
        skillCategory: formData.category,
        skillSubCategory: formData.subcategory,
        skillName: formData.name,
        description: formData.description,
      };
      localStorage.setItem('registrationData', JSON.stringify(updatedRegistrationData));

      setIsEditing(false);
    }
  };

  const availableSubcategories = formData.category
    ? skillsCategories[formData.category as SkillCategory]
    : [];

  return (
    <div className={styles.container}>
      {user?.canTeach ? (
        <div className={styles.skillCard} style={{ backgroundColor: '#E9F7E7' }}>
          <h3 className={styles.skillCategory}>{user.canTeach.category}</h3>
          <p className={styles.skillSubcategory}>{user.canTeach.subcategory}</p>
          <p className={styles.skillName}>{user.canTeach.name}</p>
          {user.canTeach.description && (
            <p className={styles.skillDescription}>{user.canTeach.description}</p>
          )}
        </div>
      ) : (
        <p className={styles.emptyText}>Навыки не указаны</p>
      )}

      <Button type="primary" onClick={() => setIsEditing(true)}>
        {user?.canTeach ? 'Изменить навык' : 'Добавить навык'}
      </Button>

      {isEditing && (
        <div className={styles.editContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Категория:</label>
            <select
              className={styles.select}
              value={formData.category}
              onChange={e => {
                setFormData({
                  ...formData,
                  category: e.target.value,
                  subcategory: '',
                });
              }}
            >
              <option value="">Выберите категорию</option>
              {Object.keys(skillsCategories).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Подкатегория:</label>
            <select
              className={styles.select}
              value={formData.subcategory}
              onChange={e =>
                setFormData({
                  ...formData,
                  subcategory: e.target.value,
                })
              }
              disabled={!formData.category}
            >
              <option value="">Выберите подкатегорию</option>
              {availableSubcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Название навыка:</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={e =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Название навыка"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Описание:</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={e =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Описание навыка"
              rows={3}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button type="primary" onClick={handleAddSkill}>
              Сохранить
            </Button>
            <Button type="secondary" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
