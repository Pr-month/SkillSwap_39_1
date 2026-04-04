import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';

export const seedAdminData = {
  name: 'Администратор',
  email: 'admin@example.com',
  about: '',
  birthdate: null,
  city: 'Нью-Васюки',
  gender: Gender.UNKNOWN,
  avatar: '',
  role: Role.ADMIN,
};
