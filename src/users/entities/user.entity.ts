import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { Gender } from '../../common/enums/gender.enum';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from '../../categories/entities/category.entity';
import { Request } from '../../requests/request.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;

  // Связи

  // Навыки, созданные пользователем
  @OneToMany(() => Skill, (skill) => skill.owner, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  skills: Skill[];

  // Категории, которым пользователь хочет научиться
  @ManyToMany(() => Category, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'user_want_to_learn',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  wantToLearn: Category[];

  // Навыки, добавленные в избранное
  @ManyToMany(() => Skill, (skill) => skill.favoritedBy)
  favoriteSkills: Skill[];

  // Заявки, созданные пользователем
  @OneToMany(() => Request, (request) => request.sender, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  sentRequests: Request[];

  // Заявки, полученные пользователем
  @OneToMany(() => Request, (request) => request.receiver, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  receivedRequests: Request[];
}
