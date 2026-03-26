import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';

// Декоратор методов в контроллере, принимает массив ролей пользователя, для которых метод может работать
export const Roles = Reflector.createDecorator<Role[]>();
