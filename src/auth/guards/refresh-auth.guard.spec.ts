const authGuardFactory = jest.fn();

class MockPassportAuthGuard {
  canActivate(context: unknown) {
    return context;
  }
}

authGuardFactory.mockReturnValue(MockPassportAuthGuard);

jest.mock('@nestjs/passport', () => ({
  AuthGuard: authGuardFactory,
}));

import { RefreshAuthGuard } from './refresh-auth.guard';

describe('RefreshAuthGuard', () => {
  it('гарда должна определяться', () => {
    const guard = new RefreshAuthGuard();

    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(MockPassportAuthGuard);
  });

  it('должен использовать passport-стратегию jwt-refresh', () => {
    expect(authGuardFactory).toHaveBeenCalledWith('jwt-refresh');
  });

  it('должен наследовать canActivate от passport guard', () => {
    const guard = new RefreshAuthGuard();
    const context = { type: 'http' };

    expect(guard.canActivate(context as never)).toBe(context);
  });
});
