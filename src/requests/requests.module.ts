import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SkillsModule } from 'src/skills/skills.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Skill]),
    NotificationsModule,
    SkillsModule,
    UsersModule
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule { }
