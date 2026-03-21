import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entities';
import { Category } from './category.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Массив ссылок на изображения
  @Column('text', { array: true, nullable: true })
  images: string[];

  // Связи

  // Пользователь, создавший навык
  @ManyToOne(() => User, (user) => user.skills, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Категория навыка
  @ManyToOne(() => Category, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  @JoinTable({
    name: 'user_favorite_skills',
    joinColumn: { name: 'skillId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  // Пользователи, добавившие навык в избранное
  favoritedBy: User[];
}
