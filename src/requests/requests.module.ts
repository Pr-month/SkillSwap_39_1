import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SkillsModule } from 'src/skills/skills.module';
import { UsersModule } from 'src/users/users.module';
import { Request } from './entities/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    NotificationsModule,
    SkillsModule,
    UsersModule,
],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
