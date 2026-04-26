import type { Meta, StoryObj } from '@storybook/react';
import { AuthFormUI } from './authFormUI';
import { PAGE_TEXTS } from './authForm';

const meta: Meta<typeof AuthFormUI> = {
  title: 'Components/AuthForm',
  component: AuthFormUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof AuthFormUI>;

export const Default: Story = {
  args: {
    isFirstStage: true,
    textContent: PAGE_TEXTS.firstStage,
    showPassword: false,
    email: 'test@example.com',
    password: 'password123',
    errors: {
      email: '',
      password: '',
      form: '',
      passwordIsFirstStage: '',
    },
    handleSubmit: () => console.log('Form submitted'),
    togglePasswordVisibility: () => console.log('Toggle password'),
    handleEmailChange: () => {},
    handlePasswordChange: () => {},
  },
};

// Состояние с ошибками
export const WithErrors: Story = {
  args: {
    ...Default.args,
    errors: {
      email: '',
      password: '',
      form: 'Общая ошибка формы',
      passwordIsFirstStage: '',
    },
  },
};

// Режим регистрации
export const RegistrationMode: Story = {
  args: {
    ...Default.args,
    isFirstStage: false,
    textContent: PAGE_TEXTS.registration,
  },
};

// Состояние с ошибками
export const RegistrationModeWithErrors: Story = {
  args: {
    ...Default.args,
    isFirstStage: false,
    textContent: PAGE_TEXTS.registration,
    errors: {
      email: 'Некорректный email',
      password: 'Слишком короткий пароль',
      form: '',
      passwordIsFirstStage: '',
    },
  },
};
