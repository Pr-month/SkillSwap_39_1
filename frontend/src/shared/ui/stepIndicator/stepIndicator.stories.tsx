import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from './stepIndicator';

const meta: Meta<typeof StepIndicator> = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StepIndicator>;

export const Step1: Story = {
  args: {
    currentStep: 0,
    totalSteps: 3,
  },
};
