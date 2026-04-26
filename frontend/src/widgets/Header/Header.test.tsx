import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { AuthProvider } from '../../features/auth/context/AuthProvider';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { catalogReducer } from '@/services/slices/catalogSlice';
import { skillsReducer } from '@/services/slices/skillsSlice';

const mockUserPanel = vi.hoisted(() =>
  vi.fn(() => <div data-testid="user-panel-mock">UserPanel Mock</div>),
);
const mockGuestPanel = vi.hoisted(() => vi.fn(() => <div data-testid="guest-panel-mock" />));
const mockLogo = vi.hoisted(() => vi.fn(() => <img alt="logo" src="/logo.png" />));
const mockSearchInput = vi.hoisted(() =>
  vi.fn(({ value }: { value: string }) => (
    <input type="text" value={value || ''} readOnly data-testid="search-input" />
  )),
);
const mockSkillsDropdown = vi.hoisted(() =>
  vi.fn(() => <div data-testid="skills-dropdown-mock" />),
);

beforeAll(() => {
  vi.mock('@/features/auth/ui/UserPanel/UserPanel', () => ({ UserPanel: mockUserPanel }));
  vi.mock('@/features/auth/ui/GuestPanel/GuestPanel', () => ({ GuestPanel: mockGuestPanel }));
  vi.mock('@/shared/ui/Logo/Logo', () => ({ Logo: mockLogo }));
  vi.mock('@/shared/ui/SearchInput/SearchInput', () => ({ SearchInput: mockSearchInput }));
  vi.mock('@/widgets/skillsDropdown/skillsDropdown', () => ({
    SkillsDropdown: mockSkillsDropdown,
  }));
});

const mockStore = configureStore({
  reducer: {
    catalog: catalogReducer,
    skills: skillsReducer,
  },
  preloadedState: {
    catalog: { users: [], loading: false, error: null, searchQuery: '' },
    skills: { skills: [], loading: false, error: undefined },
  },
});

const renderHeader = () => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    </Provider>,
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Storage.prototype.getItem = vi.fn(key => (key === 'theme' ? 'light' : null));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contains logo', () => {
    renderHeader();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  it('shows auth buttons when not authenticated', () => {
    renderHeader();
    expect(screen.getByTestId('guest-panel-mock')).toBeInTheDocument();
  });
});
