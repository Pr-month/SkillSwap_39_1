import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from '../requests.service';
import { RequestsController } from '../requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Request])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
