import type { Meta, StoryObj } from '@storybook/react';
import { Skill } from './skill.tsx';

const meta: Meta<typeof Skill> = {
  title: 'Components/Skill',
  component: Skill,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: [
        'Бизнес и карьера',
        'Творчество и искусство',
        'Иностранные языки',
        'Образование и развитие',
        'Дом и уют',
        'Здоровье и лайфстайл',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skill>;

export const Business: Story = {
  args: {
    children: 'Бизнес и карьера',
    type: 'Бизнес и карьера',
  },
};

export const Creativity: Story = {
  args: {
    children: 'Творчество и искусство',
    type: 'Творчество и искусство',
  },
};

export const Languages: Story = {
  args: {
    children: 'Иностранные языки',
    type: 'Иностранные языки',
  },
};

export const Development: Story = {
  args: {
    children: 'Образование и развитие',
    type: 'Образование и развитие',
  },
};

export const Home: Story = {
  args: {
    children: 'Дом и уют',
    type: 'Дом и уют',
  },
};

export const Health: Story = {
  args: {
    children: 'Здоровье и лайфстайл',
    type: 'Здоровье и лайфстайл',
  },
};

export const More: Story = {
  args: {
    children: 'Здоровье и лайфстайл',
    type: 'Здоровье и лайфстайл',
  },
};
