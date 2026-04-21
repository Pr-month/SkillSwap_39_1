import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { RadioGroupSection } from './radioGroupSection';

const meta: Meta<typeof RadioGroupSection> = {
  title: 'Components/RadioGroupSection',
  component: RadioGroupSection,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Заголовок группы радио-кнопок',
    },
    options: {
      control: 'object',
      description: 'Массив опций для выбора',
    },
    selectedValue: {
      control: 'text',
      description: 'Выбранное значение',
    },
    onChange: {
      action: 'changed',
      description: 'Callback при изменении выбора',
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroupSection>;

// Базовый пример
export const Basic: Story = {
  args: {
    title: 'Выберите опцию',
    options: [
      { value: 'option1', label: 'Опция 1' },
      { value: 'option2', label: 'Опция 2' },
      { value: 'option3', label: 'Опция 3' },
    ],
    selectedValue: 'option1',
  },
  render: function StoryComponent(args) {
    const [value, setValue] = useState(args.selectedValue);
    return <RadioGroupSection {...args} selectedValue={value} onChange={setValue} />;
  },
};

// Пример без заголовка
export const WithoutTitle: Story = {
  args: {
    options: [
      { value: 'light', label: 'Светлая тема' },
      { value: 'dark', label: 'Темная тема' },
    ],
    selectedValue: 'light',
  },
  render: function StoryComponent(args) {
    const [value, setValue] = useState(args.selectedValue);
    return <RadioGroupSection {...args} selectedValue={value} onChange={setValue} />;
  },
};

// Пример с большим количеством опций
export const MultipleOptions: Story = {
  args: {
    title: 'Выберите цвет',
    options: [
      { value: 'red', label: 'Красный' },
      { value: 'blue', label: 'Синий' },
      { value: 'green', label: 'Зеленый' },
      { value: 'yellow', label: 'Желтый' },
      { value: 'black', label: 'Черный' },
    ],
    selectedValue: 'blue',
  },
  render: function StoryComponent(args) {
    const [value, setValue] = useState(args.selectedValue);
    return <RadioGroupSection {...args} selectedValue={value} onChange={setValue} />;
  },
};

// Пример с горизонтальным расположением (если у вас есть такой стиль)
export const HorizontalLayout: Story = {
  args: {
    title: 'Горизонтальные радио-кнопки',
    options: [
      { value: 'left', label: 'Слева' },
      { value: 'center', label: 'По центру' },
      { value: 'right', label: 'Справа' },
    ],
    selectedValue: 'center',
  },
  render: function StoryComponent(args) {
    const [value, setValue] = useState(args.selectedValue);
    return (
      <div style={{ maxWidth: '600px' }}>
        <RadioGroupSection {...args} selectedValue={value} onChange={setValue} />
      </div>
    );
  },
};
