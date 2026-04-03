import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { RequestsService } from './entities/requests.service';
import { AuthRequest } from '../auth/types/types';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('incoming')
  findIncoming(
    @Req() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, //для пагинации через query-параметры при необходимости
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.requestsService.findIncoming(req.user.sub, page, limit);
  }
}
