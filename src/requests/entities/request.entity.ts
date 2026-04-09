import { RequestStatus } from 'src/common/enums/request-status.enum';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Время создания
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'senderId' })
  senderId: string;

  @Column({ type: 'uuid', name: 'receiverId' })
  receiverId: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ type: 'uuid', name: 'offeredSkillId', nullable: true })
  offeredSkillId: string;

  @Column({ type: 'uuid', name: 'requestedSkillId', nullable: true })
  requestedSkillId: string;

  // Прочитано ли получателем
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  // Связи

  // Пользователь, создавший заявку
  @ManyToOne(() => User, (user) => user.sentRequests, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // Пользователь, которому предложили
  @ManyToOne(() => User, (user) => user.receivedRequests, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  // Навык, который предлагает отправитель
  @ManyToOne(() => Skill, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'offeredSkillId' })
  offeredSkill: Skill;

  // Навык, который отправитель хочет получить
  @ManyToOne(() => Skill, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'requestedSkillId' })
  requestedSkill: Skill;
}
