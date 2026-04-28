import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    type: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    type: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    type: 'tertiary',
  },
};

export const Quaternary: Story = {
  args: {
    children: 'Quaternary Button',
    type: 'quaternary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span>🚀📁🧠</span>
        Button with Icon
      </>
    ),
    type: 'primary',
  },
};
