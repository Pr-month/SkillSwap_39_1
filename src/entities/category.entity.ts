import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { User } from './user.entities';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'uuid', name: 'parentId', nullable: true })
  parentId: string;

  // Для wantToLearn связки
  @Column({ type: 'uuid', name: 'userId', nullable: true })
  userId: string;

  // Связи
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })

  // Основная категория
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  // Подкатегории
  @OneToMany(() => Category, (category) => category.parent, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  children: Category[];

  // Для wantToLearn
  @ManyToOne(() => User, (user) => user.wantToLearn, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Навыки в этой категории
  @OneToMany(() => Skill, (skill) => skill.category, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  skills: Skill[];
}
