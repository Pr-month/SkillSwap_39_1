import type { Meta, StoryObj } from '@storybook/react';
import { CategoryItem } from './CategoryItem';
import { CheckboxDropdownSection } from './checkboxDropdownSection';
import { MultiLevelSection } from './MultiLevelSection';
import { useState } from 'react';
import { CheckboxMask } from '../сheckbox/type';

const meta: Meta = {
  title: 'Components/CheckboxDropdownSection',
  component: CheckboxDropdownSection,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Заголовок секции',
    },
    isSimpleList: {
      control: 'boolean',
      description: 'Простой список без подкатегорий (требует массив строк в categories)',
    },
    // Добавить новые пропсы
    selectedSubcategories: {
      control: { type: 'object' },
      description: 'Выбранные подкатегории (обязателен при isSimpleList=false)',
      if: { arg: 'isSimpleList', neq: true },
    },
    onSubcategoryChange: {
      action: 'subcategoryChanged',
      description: 'Обработчик изменения подкатегорий (обязателен при isSimpleList=false)',
      if: { arg: 'isSimpleList', neq: true },
    },
  },
  parameters: {
    componentSubtitle: 'Компонент для выбора категорий с возможностью раскрытия подкатегорий',
    docs: {
      description: {
        component: `
### CheckboxDropdownSection
Компонент представляет собой выпадающую секцию с чекбоксами для выбора категорий и подкатегорий.

Компонент для выбора категорий с:
- Поддержкой простых списков (массив строк) и многоуровневых структур (объект)
- Кастомными текстами кнопок через TOGGLE_TEXTS
- Валидацией пропсов (требует onSubcategoryChange для многоуровневых списков)

**Новые особенности:**
- При isSimpleList=true принимает массив строк в categories
- При isSimpleList=false требует передачи onSubcategoryChange
- Использует TOGGLE_TEXTS[title] для кастомных текстов кнопок

**Составные части:**
- \`CategoryItem\` - отдельный элемент категории/подкатегории с чекбоксом
- \`MultiLevelSection\` - компонент для отображения многоуровневой структуры категорий

### CategoryItem Props
| Prop | Type | Description |
|------|------|-------------|
| category | string | Название категории |
| checked | boolean | Состояние чекбокса |
| withChevron | boolean | Показывать ли шеврон для раскрытия |
| onChange | (isChecked: boolean) => void | Обработчик изменения состояния |
| onChevronClick | () => void | Обработчик клика по шеврону |
| customCheckboxMask | CustomCheckboxMask | Тип иконки чекбокса |

### MultiLevelSection Props
| Prop | Type | Description |
|------|------|-------------|
| visibleCategories | string[] | Видимые категории |
| categories | Record<string, readonly string[]> | Объект категорий с подкатегориями |
| selectedCategories | string[] | Выбранные категории |
| selectedSubcategories | string[] | Выбранные подкатегории |
| onCategoryChange | (categories: string[]) => void | Обработчик изменения категорий |
| onSubcategoryChange | (subcategories: string[]) => void | Обработчик изменения подкатегорий |
| isSimpleList | boolean | Флаг простого списка |
        `,
      },
    },
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '324px', margin: '0 auto', background: '#FFF' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CheckboxDropdownSection>;

// Базовые данные для примеров
const cities = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
];

const skillsCategories = {
  Программирование: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#'],
  Дизайн: ['UI/UX', 'Графический дизайн', 'Веб-дизайн', '3D-моделирование'],
  Маркетинг: ['SEO', 'Контент-маркетинг', 'SMM', 'Email-маркетинг'],
  Аналитика: ['Google Analytics', 'SQL', 'Excel', 'Tableau'],
  Управление: ['Проекты', 'Команда', 'Agile', 'Scrum'],
};

// Простой список (без подкатегорий)
export const SimpleList: Story = {
  render: args => {
    const StoryComponent = () => {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <CheckboxDropdownSection
          {...args}
          categories={cities}
          selectedCategories={selected}
          onCategoryChange={setSelected}
          isSimpleList
        />
      );
    };
    return <StoryComponent />;
  },
  args: {
    title: 'Город',
    isSimpleList: true,
  },
};

// Многоуровневый список с подкатегориями
export const MultiLevel: Story = {
  render: args => {
    const StoryComponent = () => {
      const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
      const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

      return (
        <CheckboxDropdownSection
          {...args}
          categories={skillsCategories}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          onCategoryChange={setSelectedCategories}
          onSubcategoryChange={setSelectedSubcategories}
        />
      );
    };
    return <StoryComponent />;
  },
  args: {
    title: 'Навыки',
    isSimpleList: false,
  },
};

// Пример с предвыбранными значениями
export const WithPreselectedValues: Story = {
  render: args => {
    const StoryComponent = () => {
      const [selectedCategories, setSelectedCategories] = useState<string[]>(['Программирование']);
      const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([
        'JavaScript',
        'TypeScript',
      ]);

      return (
        <CheckboxDropdownSection
          {...args}
          categories={skillsCategories}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          onCategoryChange={setSelectedCategories}
          onSubcategoryChange={setSelectedSubcategories}
        />
      );
    };
    return <StoryComponent />;
  },
  args: {
    title: 'Навыки',
    isSimpleList: false,
  },
};

// Примеры для CategoryItem
export const CategoryItemExample: StoryObj = {
  render: () => {
    const StoryComponent = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div style={{ maxWidth: '300px' }}>
          <CategoryItem category="Пример категории" checked={checked} onChange={setChecked} />
        </div>
      );
    };
    return <StoryComponent />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Отдельный элемент категории с чекбоксом. Может использоваться как самостоятельно, так и внутри MultiLevelSection.',
      },
    },
  },
};

// Пример с кастомными настройками отображения
export const CustomDisplaySettings: Story = {
  render: args => {
    const StoryComponent = () => {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <CheckboxDropdownSection
          {...args}
          categories={cities}
          selectedCategories={selected}
          onCategoryChange={setSelected}
          isSimpleList
        />
      );
    };
    return <StoryComponent />;
  },
  args: {
    title: 'Custom Title',
    isSimpleList: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Пример с кастомным заголовком. Для кастомных настроек отображения (количество видимых элементов, текст кнопок) можно добавить соответствующие записи в объект TOGGLE_TEXTS в компоненте.',
      },
    },
  },
};

// Пример с большим количеством элементов
export const WithManyItems: Story = {
  render: args => {
    const StoryComponent = () => {
      const [selected, setSelected] = useState<string[]>([]);
      const manyItems = Array.from({ length: 50 }, (_, i) => `Элемент ${i + 1}`);

      return (
        <CheckboxDropdownSection
          {...args}
          categories={manyItems}
          selectedCategories={selected}
          onCategoryChange={setSelected}
          isSimpleList
        />
      );
    };
    return <StoryComponent />;
  },
  args: {
    title: 'Много элементов',
    isSimpleList: true,
  },
};

export const CategoryItemWithChevron: StoryObj = {
  render: () => {
    const StoryComponent = () => {
      const [checked, setChecked] = useState(false);
      const [expanded, setExpanded] = useState(false);

      return (
        <div style={{ maxWidth: '300px' }}>
          <CategoryItem
            category="Категория с подкатегориями"
            checked={checked}
            onChange={setChecked}
            withChevron
            onChevronClick={() => setExpanded(!expanded)}
            customCheckboxMask={CheckboxMask.REMOVE}
          />
          {expanded && (
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              <CategoryItem category="Подкатегория 1" checked={false} onChange={() => {}} />
              <CategoryItem category="Подкатегория 2" checked={true} onChange={() => {}} />
            </div>
          )}
        </div>
      );
    };
    return <StoryComponent />;
  },
};

// Пример для MultiLevelSection
export const MultiLevelSectionExample: StoryObj = {
  render: () => {
    const StoryComponent = () => {
      const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
      const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

      return (
        <div style={{ maxWidth: '300px' }}>
          <MultiLevelSection
            visibleCategories={Object.keys(skillsCategories)}
            categories={skillsCategories}
            selectedCategories={selectedCategories}
            selectedSubcategories={selectedSubcategories}
            onCategoryChange={setSelectedCategories}
            onSubcategoryChange={setSelectedSubcategories}
          />
        </div>
      );
    };
    return <StoryComponent />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Компонент для отображения многоуровневой структуры категорий. Использует CategoryItem для рендеринга отдельных элементов.',
      },
    },
  },
};
