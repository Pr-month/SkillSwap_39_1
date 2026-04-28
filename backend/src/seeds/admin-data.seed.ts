/**
 * Данные администратора
 */

import * as dotenv from 'dotenv';

import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';

dotenv.config();

export const seedAdminData = {
  name: process.env.ADMIN_NAME || 'Администратор',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin_404',
  about: '',
  birthdate: null,
  city: process.env.ADMIN_CITY || 'Нью-Васюки',
  gender: Gender.UNKNOWN,
  avatar: '',
  role: Role.ADMIN,
};
