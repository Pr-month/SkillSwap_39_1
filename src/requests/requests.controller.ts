import { Controller, Get, Query, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthRequest } from '../auth/types/types';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('outgoing')
  findOutgoing(@Req() req: AuthRequest, @Query() query: FindRequestsQueryDto) {
    return this.requestsService.findOutgoing(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('incoming')
  findIncoming(@Req() req: AuthRequest, @Query() query: FindRequestsQueryDto) {
    return this.requestsService.findIncoming(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }
}
