import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorPage from './ErrorPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ErrorPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('отображает 404 ошибку', () => {
    render(<ErrorPage type="404" />);
    expect(screen.getByText(/страница не найдена/i)).toBeInTheDocument();
    expect(screen.getByAltText(/404/i)).toBeInTheDocument();
  });

  it('отображает 500 ошибку', () => {
    render(<ErrorPage type="500" />);
    expect(screen.getByText(/на сервере произошла ошибка/i)).toBeInTheDocument();
    expect(screen.getByAltText(/500/i)).toBeInTheDocument();
  });

  it('переходит на главную при клике на кнопку', () => {
    render(<ErrorPage type="404" />);
    const button = screen.getByRole('button', { name: /на главную/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
