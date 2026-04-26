export const CheckboxMask = {
  EMPTY: 'empty',
  DONE: 'done',
  REMOVE: 'remove',
} as const;

export type CustomCheckboxMask = (typeof CheckboxMask)[keyof typeof CheckboxMask];
export const CheckboxMaskValues = Object.values(CheckboxMask);
