import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { LikeButton } from './likeButton';
import { useLike } from '@/shared/hooks/useLike';

// Мокаем CSS-модули
vi.mock('./likeButton.module.css', () => ({
  default: {
    likeButton: 'mock-like-button',
    likeButtonActive: 'mock-like-button-active',
  },
}));

// Мокаем хук useLike
vi.mock('@/shared/hooks/useLike');

const mockToggleLike = vi.fn();
const mockedUseLike = vi.mocked(useLike);

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Устанавливаем значение по умолчанию для хука
    mockedUseLike.mockReturnValue({
      isLiked: false,
      isLoading: false,
      toggleLike: mockToggleLike,
    });
  });

  test('рендерит кнопку с базовым классом', () => {
    render(<LikeButton itemId="1" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mock-like-button');
    expect(button).not.toHaveClass('mock-like-button-active');
  });

  test('применяет активный класс, когда isLiked = true', () => {
    // Изменяем мок, чтобы isLiked был true
    mockedUseLike.mockReturnValue({
      isLiked: true,
      isLoading: false,
      toggleLike: mockToggleLike,
    });

    render(<LikeButton itemId="1" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mock-like-button-active');
    expect(button).not.toHaveClass('mock-like-button');
  });
});
