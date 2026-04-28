import { Gender } from '../common/enums/gender.enum';

export const seedUsersData = [
  {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    about: 'Люблю программирование',
    birthdate: new Date('1990-01-15'),
    city: 'Москва',
    gender: Gender.MALE,
  },
  {
    name: 'Мария Петрова',
    email: 'maria@example.com',
    about: 'Люблю дизайн',
    birthdate: new Date('2000-05-20'),
    city: 'Санкт-Петербург',
    gender: Gender.FEMALE,
  },
  {
    name: 'Алексей Смирнов',
    email: 'alex@example.com',
    about: 'Backend разработчик',
    birthdate: new Date('1995-03-10'),
    city: 'Казань',
    gender: Gender.MALE,
  },
  {
    name: 'Екатерина Волкова',
    email: 'kate@example.com',
    about: 'Frontend разработчик',
    birthdate: new Date('1998-11-02'),
    city: 'Новосибирск',
    gender: Gender.FEMALE,
  },
];
