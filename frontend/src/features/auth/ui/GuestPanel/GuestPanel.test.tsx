import { render, screen } from '@testing-library/react';
import { GuestPanel } from './GuestPanel';
import { BrowserRouter } from 'react-router-dom';

describe('GuestPanel', () => {
  it('должен рендерить ссылки на вход и регистрацию', () => {
    render(
      <BrowserRouter>
        <GuestPanel />
      </BrowserRouter>,
    );

    const loginLink = screen.getByText('Войти');
    const registerButton = screen.getByText('Зарегистрироваться');

    // Проверяем, что "Войти" ведёт на /login
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');

    // Проверяем, что "Зарегистрироваться" — это ссылка на /register
    expect(registerButton.closest('a')).toHaveAttribute('href', '/register');

    // Проверяем, что это действительно кнопка (внутри ссылки)
    expect(registerButton.closest('button')).toBeInTheDocument();
  });
});
