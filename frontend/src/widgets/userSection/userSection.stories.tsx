import { Meta, StoryObj } from '@storybook/react';
import { generateProfiles } from '@/shared/mocks/mockUsersData';
import { UserSection } from './userSection';
import { User } from '@/entities/user/model/types';

const meta: Meta<typeof UserSection> = {
  title: 'Widgets/UserSection',
  component: UserSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserSection>;

// Базовые моковые данные
const popularUsers = generateProfiles(3);
const recommendedUsers = generateProfiles(10);
const filteredUsers = generateProfiles(15);

// Базовый пример
export const Default: Story = {
  args: {
    title: 'Популярные предложения',
    users: popularUsers as User[],
    isRecommended: false,
  },
};

// Секция с бесконечным скроллом (Рекомендуем)
export const Recommended: Story = {
  args: {
    title: 'Рекомендуем',
    users: recommendedUsers as User[],
    isRecommended: true,
    hasMore: true,
    onLoadMore: () => console.log('Загружаем еще...'),
  },
};

// Фильтрованный режим
export const Filtered: Story = {
  args: {
    title: 'Результаты поиска',
    users: filteredUsers as User[],
    isFiltered: true,
    count: filteredUsers.length,
  },
};

// Пустое состояние
export const Empty: Story = {
  args: {
    title: 'Пустая секция',
    users: [],
    isRecommended: false,
  },
};

// Секция для неавторизованных
export const ForUnauthorized: Story = {
  args: {
    title: 'Популярное',
    users: generateProfiles(3) as User[],
    isRecommended: false,
  },
};

// Секция для авторизованных
export const ForAuthorized: Story = {
  args: {
    title: 'Точное соответствие',
    users: generateProfiles(3) as User[],
    isRecommended: false,
  },
};
