import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './userCard.tsx';
import localImage from '@/app/assets/static/photo_2025-07-19_19-14-41.jpg';

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  argTypes: {
    birthdayDate: {
      control: 'date',
      description: 'Дата рождения в формате YYYY-MM-DD',
    },
    image: {
      control: 'text',
      description: 'URL аватарки пользователя',
    },
  },
};

export default meta;

type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    _id: '001',
    name: 'Иван',
    image: localImage,
    city: 'Санкт-Петербург',
    birthdayDate: '1991-02-05',
    description: 'Опытный музыкант и преподаватель',
    likes: ['002', '003', '007'],
    canTeach: {
      customSkillId: 'skill_001',
      name: 'Игра на барабанах',
      category: 'Творчество и искусство',
      subcategory: 'Музыка и звук',
      subcategoryId: 'music_percussion',
      image: [''],
      description:
        'Привет! Я играю на барабанах уже больше 10 лет — от репетиций в гараже до выступлений на сцене с живыми группами. Научу основам техники (и как не отбить себе пальцы), играть любимые ритмы и разбирать песни, импровизировать и звучать уверенно даже без паритуры',
    },
    wantsToLearn: [
      {
        customSkillId: 'skill_101',
        name: 'Тайм-менеджмент',
        category: 'Образование и развитие',
        subcategory: 'Личностное развитие',
        subcategoryId: 'personal_development',
      },
      {
        customSkillId: 'skill_202',
        name: 'Медитация',
        category: 'Здоровье и лайфстайл',
        subcategory: 'Йога и медитация',
        subcategoryId: 'yoga_meditation',
      },
      {
        customSkillId: 'skill_303',
        name: 'Английский',
        category: 'Иностранные языки',
        subcategory: 'Английский',
        subcategoryId: 'english_lang',
      },
    ],
  },
};
