import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CheckboxUI, CheckboxUiProps } from './checkbox';
import { CustomCheckboxMask } from './type';

const meta: Meta<typeof CheckboxUI> = {
  title: 'Components/CheckboxUI',
  component: CheckboxUI,
  tags: ['autodocs'],
  argTypes: {
    customCheckboxMask: {
      options: ['empty', 'done', 'remove'],
      control: { type: 'select' },
      description: 'Визуальный стиль чекбокса',
    },
    disabled: {
      control: 'boolean',
      description: 'Состояние disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Состояние readOnly',
    },
    onChange: {
      action: 'changed',
      description: 'Обработчик изменения состояния',
    },
    onLabelClick: {
      action: 'labelClicked',
      description: 'Обработчик клика по label',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA-метка для доступности',
    },
    ariaLabelledby: {
      control: 'text',
      description: 'ARIA-связь с элементом описания',
    },
    role: {
      control: 'text',
      description: 'Роль элемента для доступности',
    },
  },
  args: {
    onChange: () => {},
    onLabelClick: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CheckboxUI>;

export const Default: Story = {
  args: {
    id: 'checkbox-default',
    label: 'Default Checkbox',
    checked: false,
    customCheckboxMask: 'empty',
  },
};

export const Checked: Story = {
  args: {
    id: 'checkbox-checked',
    label: 'Checked Checkbox',
    checked: true,
    customCheckboxMask: 'empty',
  },
};

export const DoneStyle: Story = {
  args: {
    id: 'checkbox-done',
    label: 'Done Style Checkbox',
    checked: true,
    customCheckboxMask: 'done',
  },
  name: 'Done Style',
};

export const RemoveStyle: Story = {
  args: {
    id: 'checkbox-remove',
    label: 'Remove Style Checkbox',
    checked: true,
    customCheckboxMask: 'remove',
  },
  name: 'Remove Style',
};

export const Disabled: Story = {
  args: {
    id: 'checkbox-disabled',
    label: 'Disabled Checkbox',
    checked: false,
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    id: 'checkbox-readonly',
    label: 'ReadOnly Checkbox',
    checked: true,
    readOnly: true,
  },
};

export const WithAriaLabel: Story = {
  args: {
    id: 'checkbox-aria',
    label: 'Checkbox with ARIA',
    checked: false,
    ariaLabel: 'Custom ARIA label',
  },
  name: 'With ARIA Label',
};

export const InteractiveExample: Story = {
  render: args => <InteractiveCheckboxComponent {...args} />,
  name: 'Interactive Example',
};

const InteractiveCheckboxComponent = (args: CheckboxUiProps) => {
  const [checked, setChecked] = React.useState(false);
  const [selectedMask, setSelectedMask] = React.useState<CustomCheckboxMask>('empty');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <CheckboxUI
        {...args}
        id="checkbox-interactive"
        label="Interactive Checkbox"
        checked={checked}
        customCheckboxMask={selectedMask}
        onChange={() => setChecked(!checked)}
        onLabelClick={e => console.log('Label clicked', e)}
      />

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setSelectedMask('empty')}>Empty Style</button>
        <button onClick={() => setSelectedMask('done')}>Done Style</button>
        <button onClick={() => setSelectedMask('remove')}>Remove Style</button>
      </div>

      <div style={{ marginTop: '8px' }}>
        Current state: {checked ? 'Checked' : 'Unchecked'} | Style: {selectedMask}
      </div>
    </div>
  );
};
