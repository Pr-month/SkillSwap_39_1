import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MoreButton } from './moreButton';

// Мокаем CSS-модуль
vi.mock('./moreButton.module.css', () => ({
  default: {
    moreButton: 'mock-more-button',
  },
}));

describe('MoreButton', () => {
  test('рендерит кнопку с data-testid и корректным aria-label', () => {
    render(<MoreButton />);

    const button = screen.getByTestId('more-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Еще');
    expect(button).toHaveClass('mock-more-button');
  });

  test('применяет переданный ariaLabel', () => {
    render(<MoreButton ariaLabel="Показать больше" />);

    const button = screen.getByTestId('more-button');
    expect(button).toHaveAttribute('aria-label', 'Показать больше');
  });

  test('применяет дополнительный className', () => {
    render(<MoreButton className="custom-class extra-class" />);

    const button = screen.getByTestId('more-button');
    expect(button).toHaveClass('mock-more-button', 'custom-class', 'extra-class');
  });

  test('вызывает onClick при клике', () => {
    const handleClick = vi.fn();

    render(<MoreButton onClick={handleClick} />);

    const button = screen.getByTestId('more-button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('не вызывает onClick, если он не передан', () => {
    expect(() => {
      render(<MoreButton />);
      fireEvent.click(screen.getByTestId('more-button'));
    }).not.toThrow();
  });
});
