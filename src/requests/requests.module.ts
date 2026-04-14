import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Skill]),
            NotificationsModule,
    SkillsModule,
    UsersModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
