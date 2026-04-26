import { render, screen } from '@testing-library/react';
import { NotificationMenu } from './NotificationMenu';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { exchangeReducer } from '@/services/slices/exchangeSlice';
import authSlice, { AuthState } from '@/services/slices/authSlice';
import { RequestStatus } from '@/entities/auth/model/types';

type ExchangeState = ReturnType<typeof exchangeReducer>;

const preloadedState: { exchange: ExchangeState; authUser: AuthState } = {
  exchange: {
    requests: [
      {
        id: '1',
        fromUserName: 'Алексей',
        fromUserId: 'user_001',
        toUserId: 'current_user',
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'accepted',
      },
      {
        id: '2',
        fromUserName: 'Мария',
        fromUserId: 'user_002',
        toUserId: 'current_user',
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'pending',
      },
      {
        id: '3',
        fromUserName: 'Олег',
        fromUserId: 'user_003',
        toUserId: 'current_user',
        createdAt: new Date().toISOString(),
        isRead: true,
        status: 'pending',
      },
      {
        id: '4',
        fromUserName: 'Игорь',
        fromUserId: 'user_004',
        toUserId: 'current_user',
        createdAt: new Date().toISOString(),
        isRead: true,
        status: 'accepted',
      },
    ],
    loading: false,
    error: null,
  },
  authUser: {
    data: {
      _id: 'current_user',
      name: 'Текущий Пользователь',
      email: 'test@test.com',
      createdAt: '',
      image: [],
      city: '',
      gender: 'any',
      birthdayDate: '',
      description: '',
      likes: [],

      canTeach: {
        category: 'Бизнес и карьера',
        subcategory: 'Маркетинг и реклама',
        subcategoryId: 'bc001',
        name: 'Обучение маркетингу',
        description: 'Описание навыка',
        image: [],
        customSkillId: 'custom_123',
      },
      wantsToLearn: [],
    },
    authStatus: RequestStatus.Success,
    userCheck: true,
  },
};

const mockStore = configureStore({
  reducer: {
    exchange: exchangeReducer,
    authUser: authSlice.reducer,
  },
  preloadedState,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>,
  );
};

describe('NotificationMenu', () => {
  it('не должен рендериться, если isOpen={false}', () => {
    renderWithProviders(<NotificationMenu isOpen={false} />);
    expect(screen.queryByTestId('notification-menu')).not.toBeInTheDocument();
  });

  it('должен рендериться, если isOpen={true}', () => {
    renderWithProviders(<NotificationMenu isOpen={true} />);
    expect(screen.getByTestId('notification-menu')).toBeInTheDocument();
    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();
  });

  it('должен отображать новые уведомления', () => {
    renderWithProviders(<NotificationMenu isOpen={true} />);
    const unreadNotifications = screen.getAllByTestId('new-notification');
    expect(unreadNotifications.length).toBe(2);
  });

  it('должен отображать просмотренные уведомления', () => {
    renderWithProviders(<NotificationMenu isOpen={true} />);
    const viewedSection = screen.getByTestId('viewed-section');
    expect(viewedSection).toBeInTheDocument();
    expect(screen.getByText('Просмотренные')).toBeInTheDocument();
    const viewedNotifications = screen.getAllByTestId('viewed-notification');
    expect(viewedNotifications.length).toBe(2);
  });

  it('должен иметь кнопку "Перейти" с правильным маршрутом', () => {
    renderWithProviders(<NotificationMenu isOpen={true} />);
    const incomingLink = screen.getAllByTestId('link-to-obmen')[0];
    expect(incomingLink).toHaveAttribute('href', '/obmen');
  });

  it('должен отображать кнопку "Прочитать все" и "Очистить"', () => {
    renderWithProviders(<NotificationMenu isOpen={true} />);
    expect(screen.getByTestId('read-all-btn')).toBeInTheDocument();
    expect(screen.getByTestId('clear-btn')).toBeInTheDocument();
  });
});
