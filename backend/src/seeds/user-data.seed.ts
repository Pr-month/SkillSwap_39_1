import { Gender } from '../common/enums/gender.enum';

export const seedUsersData = [
  {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    about: 'Люблю программирование',
    birthdate: new Date('1990-01-15'),
    city: 'Москва',
    gender: Gender.MALE,
    avatar:
      'https://avatars.mds.yandex.net/get-yapic/28439/c2C5tZ34ITInGSxIVJrWaPMZiA-1/orig',
  },
  {
    name: 'Мария Петрова',
    email: 'maria@example.com',
    about: 'Люблю дизайн',
    birthdate: new Date('2000-05-20'),
    city: 'Санкт-Петербург',
    gender: Gender.FEMALE,
    avatar:
      'https://i.pinimg.com/originals/b8/e6/3b/b8e63b99cd3b38474fe11eb98f3045fd.jpg',
  },
  {
    name: 'Алексей Смирнов',
    email: 'alex@example.com',
    about: 'Backend разработчик',
    birthdate: new Date('1995-03-10'),
    city: 'Казань',
    gender: Gender.MALE,
    avatar:
      'https://i.pinimg.com/736x/c1/d3/3d/c1d33d6901e0d4082409830c683b63ea.jpg',
  },
  {
    name: 'Екатерина Волкова',
    email: 'kate@example.com',
    about: 'Frontend разработчик',
    birthdate: new Date('1998-11-02'),
    city: 'Новосибирск',
    gender: Gender.FEMALE,
    avatar:
      'https://avatars.mds.yandex.net/get-shedevrum/12421798/img_7f6287dcfefb11ee87c89608ae710c1d/orig',
  },
];
