/**
 * Модуль для Unit теста для jwt-access.guard
 */
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-access.guard';

describe('JwtAccessGuard', () => {
  let guard: JwtAuthGuard;

  // Перед началом
  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  // Проверка на существование
  it('Проверка на существование', () => {
    expect(guard).toBeDefined();
  });

  // Корректный токен
  it('Корректный токен', async () => {
    const mock = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer validToken' },
        }),
      }),
    } as ExecutionContext;

    const canActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    await guard.canActivate(mock);

    expect(canActivate).toHaveBeenCalledWith(mock);
    canActivate.mockRestore();
  });

  // Токен не передан
  it('Токен не передан', () => {
    const mock = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    const canActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(false);

    const result = guard.canActivate(mock);

    expect(result).toBe(false);
    canActivate.mockRestore();
  });
});
