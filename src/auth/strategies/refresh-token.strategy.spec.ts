import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenStrategy } from './refresh-token.strategy';

describe('RefreshTokenStrategy', () => {
  const jwtSettings = {
    secret: 'access-secret',
    expiresIn: '15m',
    refreshSecret: 'refresh-secret',
    refreshExpiresIn: '7d',
  };

  let strategy: RefreshTokenStrategy;

  beforeEach(() => {
    strategy = new RefreshTokenStrategy(jwtSettings);
  });

  it('стратегия должна определяться', () => {
    expect(strategy).toBeDefined();
  });

  it('validate должен выбрасывать UnauthorizedException, если заголовок authorization отсутствует', () => {
    const request = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as Request;

    expect(() =>
      strategy.validate(request, {
        sub: 'user-id',
        email: 'user@example.com',
        role: 'USER' as never,
      }),
    ).toThrow(UnauthorizedException);
  });

  it('validate должен возвращать payload вместе с refresh token из заголовка', () => {
    const request = {
      get: jest.fn().mockReturnValue('Bearer refresh-token-value'),
    } as unknown as Request;

    expect(
      strategy.validate(request, {
        sub: 'user-id',
        email: 'user@example.com',
        role: 'USER' as never,
      }),
    ).toEqual({
      sub: 'user-id',
      email: 'user@example.com',
      role: 'USER',
      refreshToken: 'refresh-token-value',
    });
  });
});
