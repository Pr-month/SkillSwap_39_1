import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { UserPanel } from './UserPanel';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../NotificationMenu/NotificationMenu', () => ({
  NotificationMenu: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="notification-menu" aria-hidden={!isOpen} />
  ),
}));

vi.unmock('@/shared/hooks/useClickOutside');

const renderWithAuth = () => {
  const user = { id: '1', name: 'Иван Иванов', email: 'ivan@example.com' };
  const authState = { isAuthenticated: true, user };
  localStorage.setItem('auth', JSON.stringify(authState));
  return render(
    <BrowserRouter>
      <AuthProvider>
        <div data-testid="app-container">
          <UserPanel />
        </div>
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe('UserPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('menu-open');
  });

  afterEach(() => {
    document.body.classList.remove('menu-open');
  });

  it('должен отображать имя пользователя и аватар', () => {
    renderWithAuth();
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    const avatar = screen.getByText('ИИ');
    expect(avatar).toBeInTheDocument();
    expect(avatar.className).toContain('avatar');
  });

  it('должен открывать и закрывать меню при клике на userInfo', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    const userName = screen.getByText('Иван Иванов');
    await user.click(userName);
    expect(screen.getByText('Личный кабинет')).toBeInTheDocument();

    await user.click(userName);
    await waitFor(() => {
      expect(screen.queryByText('Личный кабинет')).not.toBeInTheDocument();
    });
  });

  it('должен открывать панель уведомлений при клике на иконку', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    const notificationIcon = screen
      .getByTestId('app-container')
      .querySelector('[class*="notificationIcon"]')?.parentElement;
    await user.click(notificationIcon!);

    expect(screen.getByTestId('notification-menu')).toHaveAttribute('aria-hidden', 'false');
  });

  it('должен вызывать logout при клике на кнопку выхода', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await user.click(screen.getByText('Иван Иванов'));
    await user.click(screen.getByText('Выйти из аккаунта'));

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });

  it('должен добавлять класс menu-open на body при открытии меню', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    expect(document.body.classList.contains('menu-open')).toBe(false);
    await user.click(screen.getByText('Иван Иванов'));
    expect(document.body.classList.contains('menu-open')).toBe(true);

    await user.click(screen.getByText('Иван Иванов'));
    expect(document.body.classList.contains('menu-open')).toBe(false);
  });

  it('должен закрывать меню при клике вне панели', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await user.click(screen.getByText('Иван Иванов'));
    expect(screen.getByText('Личный кабинет')).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Личный кабинет')).not.toBeInTheDocument();
    });
  });
});
