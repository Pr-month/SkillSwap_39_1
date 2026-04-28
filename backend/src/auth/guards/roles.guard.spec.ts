import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../users/decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { get: jest.Mock };

  const handler = jest.fn();

  const createExecutionContext = (role?: Role | string): ExecutionContext =>
    ({
      getHandler: jest.fn().mockReturnValue(handler),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(
          role
            ? {
                user: { role },
              }
            : {},
        ),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };

    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('гарда должна определяться', () => {
    expect(guard).toBeDefined();
  });

  it('должен разрешать доступ, если роли для обработчика не заданы', () => {
    reflector.get.mockReturnValue(undefined);

    const context = createExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith(Roles, handler);
  });

  it('должен запрещать доступ, если у запроса нет пользователя или его роли', () => {
    reflector.get.mockReturnValue([Role.ADMIN]);

    const context = createExecutionContext();

    expect(guard.canActivate(context)).toBe(false);
  });

  it('должен разрешать доступ, если роль пользователя есть в списке разрешенных', () => {
    reflector.get.mockReturnValue([Role.ADMIN, Role.USER]);

    const context = createExecutionContext(Role.ADMIN);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('должен сравнивать роли без учета регистра', () => {
    reflector.get.mockReturnValue(['admin']);

    const context = createExecutionContext(Role.ADMIN);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('должен запрещать доступ, если роль пользователя не входит в список разрешенных', () => {
    reflector.get.mockReturnValue([Role.ADMIN]);

    const context = createExecutionContext(Role.USER);

    expect(guard.canActivate(context)).toBe(false);
  });
});
