import type { Meta, StoryObj } from '@storybook/react';
import { CatalogUI } from './catalogUI';
import { fn } from '@storybook/test';
import { generateProfiles } from '@/shared/mocks/mockUsersData';
import { User } from '@/entities/user/model/types';

const meta = {
  title: 'Components/Catalog/CatalogUI',
  component: CatalogUI,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CatalogUI>;

export default meta;
type Story = StoryObj<typeof meta>;

// Этот код станет правильным после исправления функции generateProfiles
export const Default: Story = {
  args: {
    sections: [
      {
        title: 'Популярное',
        users: generateProfiles(3) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
      {
        title: 'Новое',
        users: generateProfiles(3) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
      {
        title: 'Рекомендуем',
        users: generateProfiles(4) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
    ],
    onLoadMoreRecommended: fn(),
    hasMoreRecommended: true,
    isLoadingRecommended: false,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoadingRecommended: true,
  },
};

export const NoMoreData: Story = {
  args: {
    ...Default.args,
    hasMoreRecommended: false,
  },
};

export const WithManyItems: Story = {
  args: {
    sections: [
      {
        title: 'Популярное',
        users: generateProfiles(6) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
      {
        title: 'Новое',
        users: generateProfiles(5) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
      {
        title: 'Рекомендуем',
        users: generateProfiles(7) as User[],
        showAllButton: true,
        onShowAll: fn(),
      },
    ],
    onLoadMoreRecommended: fn(),
    hasMoreRecommended: true,
    isLoadingRecommended: false,
  },
};
