import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Gender } from '../common/enums/gender.enum';
import { hashPassword } from '../users/utils/password.util';

export async function seedUsers(dataSource: DataSource) {
  console.log('Добавление пользователей...');

  const userRepository = dataSource.getRepository(User);

  const hashedPassword = await hashPassword('123456');

  const users = [
    {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      password: hashedPassword,
      about: 'Люблю программирование',
      birthdate: new Date('1990-01-15'),
      city: 'Москва',
      gender: Gender.MALE,
    },
    {
      name: 'Мария Петрова',
      email: 'maria@example.com',
      password: hashedPassword,
      about: 'Люблю дизайн',
      birthdate: new Date('2000-05-20'),
      city: 'Санкт-Петербург',
      gender: Gender.FEMALE,
    },
    {
      name: 'Алексей Смирнов',
      email: 'alex@example.com',
      password: hashedPassword,
      about: 'Backend разработчик',
      birthdate: new Date('1995-03-10'),
      city: 'Казань',
      gender: Gender.MALE,
    },
    {
      name: 'Екатерина Волкова',
      email: 'kate@example.com',
      password: hashedPassword,
      about: 'Frontend разработчик',
      birthdate: new Date('1998-11-02'),
      city: 'Новосибирск',
      gender: Gender.FEMALE,
    },
  ];

  let created = 0;

  for (const userData of users) {
    const exists = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!exists) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(
        `Добавлен пользователь: ${userData.name} (${userData.email})`,
      );
      created++;
    } else {
      console.log(`Пользователь ${userData.email} уже существует`);
    }
  }

  console.log(`Добавлено пользователей: ${created}`);
}
