import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ShareButton } from './shareButton';
import { useShare } from '@/shared/hooks/useShare';

// Мокаем CSS-модуль
vi.mock('./shareButton.module.css', () => ({
  default: {
    shareButton: 'mock-share-button',
  },
}));

// Мокаем хук useShare
vi.mock('@/shared/hooks/useShare');

const mockedUseShare = vi.mocked(useShare);
const mockShare = vi.fn();

describe('ShareButton', () => {
  const defaultProps = {
    title: 'Тестовый заголовок',
    text: 'Тестовый текст',
    url: 'https://example.com/custom-url',
    ariaLabel: 'Поделиться в соцсетях',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseShare.mockReturnValue({
      share: mockShare,
      isSupported: true,
    });
  });

  test('рендерит кнопку и устанавливает data-testid', () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByTestId('share-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mock-share-button');
    expect(button).toHaveAttribute('aria-label', 'Поделиться в соцсетях');
  });

  test('применяет дополнительный className, если передан', () => {
    render(<ShareButton {...defaultProps} className="custom-class" />);

    const button = screen.getByTestId('share-button');
    expect(button).toHaveClass('mock-share-button');
    expect(button).toHaveClass('custom-class');
  });

  test('отображает "Поделиться" в title, если Web Share API поддерживается', () => {
    mockedUseShare.mockReturnValue({
      share: mockShare,
      isSupported: true,
    });

    render(<ShareButton {...defaultProps} />);

    const button = screen.getByTestId('share-button');
    expect(button).toHaveAttribute('title', 'Поделиться');
  });

  test('отображает "Копировать ссылку" в title, если Web Share API не поддерживается', () => {
    mockedUseShare.mockReturnValue({
      share: mockShare,
      isSupported: false,
    });

    render(<ShareButton {...defaultProps} />);

    const button = screen.getByTestId('share-button');
    expect(button).toHaveAttribute('title', 'Копировать ссылку');
  });

  test('вызывает share с корректными параметрами при клике', async () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByTestId('share-button');
    await fireEvent.click(button);

    expect(mockShare).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith({
      title: 'Тестовый заголовок',
      text: 'Тестовый текст',
      url: 'https://example.com/custom-url',
    });
  });

  test('использует window.location.href, если url не передан', async () => {
    const mockLocation = 'https://current-page.com/current-path';
    Object.defineProperty(window, 'location', {
      value: { href: mockLocation },
      writable: false,
    });

    render(
      <ShareButton
        title="Тест"
        text="Текст"
        // url не передан
      />,
    );

    const button = screen.getByTestId('share-button');
    await fireEvent.click(button);

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Тест',
      text: 'Текст',
      url: mockLocation,
    });
  });
});
