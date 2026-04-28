import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../users/decorators/roles.decorator';
import { AuthRequest } from '../types/types';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    //Если через декоратор Roles методу контроллера не заданы роли пользователя, то запрос можно выполнять
    if (!roles) {
      return true;
    }

    const request: AuthRequest = context.switchToHttp().getRequest();
    // Если в запросе нет поля пользователя или его роли, то что-то пошло не так, запрещаем запрос
    if (!request.user || !request.user.role) {
      return false;
    }
    const rolesUser: Role = request.user.role;

    return roles
      .map((role) => role.toUpperCase())
      .includes(rolesUser.toUpperCase());
  }
}
