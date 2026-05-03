import { useEffect, useMemo, useState } from 'react';
import {
  createSkillApi,
  extractApiErrorMessage,
  getCategoriesApi,
  updateSkillApi,
} from '@/api/skillSwapApi';
import { Category } from '@/entities/category/model/types';
import { userSliceSelectors } from '@/services/slices/authSlice';
import { useDispatch, useSelector } from '@/services/store/store';
import { fetchUser } from '@/services/thunk/authUser';
import { Button } from '@/shared/ui/button/button';
import styles from './ProfileSkills.module.css';

type SkillFormData = {
  parentCategoryId: string;
  categoryId: string;
  name: string;
  description: string;
};

const getInitialFormData = (
  user: ReturnType<typeof userSliceSelectors.selectUser>,
  categories: Category[],
): SkillFormData => {
  const currentSkill = user?.canTeach?.name ? user.canTeach : null;

  if (!currentSkill) {
    return {
      parentCategoryId: '',
      categoryId: '',
      name: '',
      description: '',
    };
  }

  const matchedParent =
    categories.find((category) =>
      category.children.some((child) => child.id === currentSkill.subcategoryId),
    ) ||
    categories.find((category) => category.name === currentSkill.category);

  const matchedChild =
    matchedParent?.children.find((child) => child.id === currentSkill.subcategoryId) ||
    matchedParent?.children.find((child) => child.name === currentSkill.subcategory);

  return {
    parentCategoryId: matchedParent?.id || '',
    categoryId: matchedChild?.id || currentSkill.subcategoryId || '',
    name: currentSkill.name || '',
    description: currentSkill.description || '',
  };
};

export function ProfileSkills() {
  const dispatch = useDispatch();
  const user = useSelector(userSliceSelectors.selectUser);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SkillFormData>({
    parentCategoryId: '',
    categoryId: '',
    name: '',
    description: '',
  });

  const currentSkill = user?.canTeach?.name ? user.canTeach : null;

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const loadedCategories = await getCategoriesApi();

        if (!isMounted) {
          return;
        }

        setCategories(loadedCategories);
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          extractApiErrorMessage(
            loadError,
            'Не удалось загрузить категории навыков',
          ),
        );
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setFormData(getInitialFormData(user, categories));
  }, [user, categories]);

  const selectedParent = useMemo(
    () => categories.find((category) => category.id === formData.parentCategoryId),
    [categories, formData.parentCategoryId],
  );

  const availableSubcategories = selectedParent?.children || [];

  const handleSave = async () => {
    if (!formData.parentCategoryId || !formData.categoryId || !formData.name.trim()) {
      setError('Заполните категорию, подкатегорию и название навыка');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const images =
        currentSkill && Array.isArray(currentSkill.image)
          ? currentSkill.image.filter(
              (image): image is string => typeof image === 'string',
            )
          : undefined;

      const payload = {
        title: formData.name.trim(),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId,
        images,
      };

      if (currentSkill?.customSkillId) {
        await updateSkillApi(currentSkill.customSkillId, payload);
      } else {
        await createSkillApi(payload);
      }

      await dispatch(fetchUser()).unwrap();
      setIsEditing(false);
    } catch (saveError) {
      setError(
        extractApiErrorMessage(saveError, 'Не удалось сохранить навык'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {currentSkill ? (
        <div className={styles.skillCard} style={{ backgroundColor: '#E9F7E7' }}>
          <h3 className={styles.skillCategory}>{currentSkill.category}</h3>
          <p className={styles.skillSubcategory}>{currentSkill.subcategory}</p>
          <p className={styles.skillName}>{currentSkill.name}</p>
          {currentSkill.description && (
            <p className={styles.skillDescription}>{currentSkill.description}</p>
          )}
        </div>
      ) : (
        <p className={styles.emptyText}>Навыки не указаны</p>
      )}

      <Button type="primary" onClick={() => setIsEditing(true)}>
        {currentSkill ? 'Изменить навык' : 'Добавить навык'}
      </Button>

      {isEditing && (
        <div className={styles.editContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Категория:</label>
            <select
              className={styles.select}
              value={formData.parentCategoryId}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  parentCategoryId: event.target.value,
                  categoryId: '',
                }))
              }
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Подкатегория:</label>
            <select
              className={styles.select}
              value={formData.categoryId}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: event.target.value,
                }))
              }
              disabled={!formData.parentCategoryId}
            >
              <option value="">Выберите подкатегорию</option>
              {availableSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
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
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="Название навыка"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Описание:</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Описание навыка"
              rows={3}
            />
          </div>

          {error && <p className={styles.emptyText}>{error}</p>}

          <div className={styles.buttonGroup}>
            <Button type="primary" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
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
