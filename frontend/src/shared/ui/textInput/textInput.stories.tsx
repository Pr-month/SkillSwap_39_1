import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './textInput.tsx';
import { useState } from 'react';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'number', 'url', 'date', 'textarea'],
    },
    className: {
      control: 'text',
    },
    inputClassName: {
      control: 'text',
    },
    icon: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    hideError: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
    onBlur: { action: 'blurred' },
    onChange: { action: 'changed' },
    onFocus: { action: 'focused' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
type TextInputProps = Parameters<typeof TextInput>[0]; 
type StoryArgs = Partial<TextInputProps>;

// Wrapper component для контроля состояния
const TextInputWithState = (args:  StoryArgs) => {
  const [value, setValue] = useState(args.value || '');

  return (
    <TextInput
      id={args.id || 'storybook-input'}           // ✅ Fallback required
      title={args.title || 'Storybook Input'}    // ✅ Fallback required
      placeholder={args.placeholder || ''}       // ✅ Fallback string!
      type={args.type || 'text'}                 // ✅ Fallback!
      {...args}
      value={value}
      onChange={e => {
        setValue(e.target.value);
        args.onChange?.(e);
      }}
    />
  );
};

// Базовая история
export const Default: Story = {
  args: {
    id: 'default-input',
    title: 'Default Input',
    placeholder: 'Enter text here...',
    type: 'text',
  },
  render: args => <TextInputWithState {...args} />,
};

// Текстовый инпут с иконкой
export const WithIcon: Story = {
  args: {
    id: 'input-with-icon',
    title: 'Input with Icon',
    placeholder: 'Search...',
    type: 'text',
    icon: '/path/to/search-icon.svg', // замените на реальный путь к иконке
  },
  render: args => <TextInputWithState {...args} />,
};

// Email инпут
export const Email: Story = {
  args: {
    id: 'email-input',
    title: 'Email Address',
    placeholder: 'Enter your email...',
    type: 'email',
  },
  render: args => <TextInputWithState {...args} />,
};

// Password инпут
export const Password: Story = {
  args: {
    id: 'password-input',
    title: 'Password',
    placeholder: 'Enter your password...',
    type: 'password',
  },
  render: args => <TextInputWithState {...args} />,
};

// Number инпут
export const Number: Story = {
  args: {
    id: 'number-input',
    title: 'Age',
    placeholder: 'Enter your age...',
    type: 'number',
  },
  render: args => <TextInputWithState {...args} />,
};

// Date инпут
export const Date: Story = {
  args: {
    id: 'date-input',
    title: 'Birth Date',
    placeholder: '',
    type: 'date',
  },
  render: args => <TextInputWithState {...args} />,
};

// Textarea
export const Textarea: Story = {
  args: {
    id: 'textarea-input',
    title: 'Description',
    placeholder: 'Enter your description...',
    type: 'textarea',
  },
  render: args => <TextInputWithState {...args} />,
};

// С ошибкой
export const WithError: Story = {
  args: {
    id: 'error-input',
    title: 'Input with Error',
    placeholder: 'Enter text...',
    type: 'text',
    error: 'This field is required',
    value: '',
  },
  render: args => <TextInputWithState {...args} />,
};

// С ошибкой, но скрытой
export const WithHiddenError: Story = {
  args: {
    id: 'hidden-error-input',
    title: 'Input with Hidden Error',
    placeholder: 'Enter text...',
    type: 'text',
    error: 'This error is hidden',
    hideError: true,
    value: '',
  },
  render: args => <TextInputWithState {...args} />,
};

// С предзаполненным значением
export const WithValue: Story = {
  args: {
    id: 'filled-input',
    title: 'Pre-filled Input',
    placeholder: 'Enter text...',
    type: 'text',
    value: 'Pre-filled value',
  },
  render: args => <TextInputWithState {...args} />,
};

// Телефонный номер
export const Phone: Story = {
  args: {
    id: 'phone-input',
    title: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    type: 'tel',
  },
  render: args => <TextInputWithState {...args} />,
};

// URL инпут
export const URL: Story = {
  args: {
    id: 'url-input',
    title: 'Website URL',
    placeholder: 'https://example.com',
    type: 'url',
  },
  render: args => <TextInputWithState {...args} />,
};

// Кастомные стили
export const CustomStyles: Story = {
  args: {
    id: 'custom-input',
    title: 'Custom Styled Input',
    placeholder: 'Custom styling...',
    type: 'text',
    className: 'custom-container-class',
    inputClassName: 'custom-input-class',
  },
  render: args => <TextInputWithState {...args} />,
};

// Все варианты типов в одной истории
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
      <TextInputWithState id="text-example" title="Text" placeholder="Text input" type="text" />
      <TextInputWithState
        id="email-example"
        title="Email"
        placeholder="email@example.com"
        type="email"
      />
      <TextInputWithState
        id="password-example"
        title="Password"
        placeholder="Password"
        type="password"
      />
      <TextInputWithState id="number-example" title="Number" placeholder="123" type="number" />
      <TextInputWithState id="tel-example" title="Phone" placeholder="+1234567890" type="tel" />
      <TextInputWithState
        id="url-example"
        title="URL"
        placeholder="https://example.com"
        type="url"
      />
      <TextInputWithState id="date-example" title="Date" placeholder="" type="date" />
      <TextInputWithState
        id="textarea-example"
        title="Textarea"
        placeholder="Multiple lines..."
        type="textarea"
      />
    </div>
  ),
};
