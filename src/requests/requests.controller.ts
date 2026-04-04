import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  Post,
  Body,
  Param,
  Patch,
  UseGuards
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthRequest } from '../auth/types/types';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) { }

  @Get('outgoing')
  findOutgoing(
    @Req() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, //для пагинации через query-параметры при необходимости
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.requestsService.findOutgoing(req.user.sub, page, limit);
  }


  @Get('incoming')
  findIncoming(
    @Req() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, //для пагинации через query-параметры при необходимости
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.requestsService.findIncoming(req.user.sub, page, limit);
  }

  @Post()
  async createRequest(
    @Req() req: AuthRequest,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestsService.createRequest(
      req.user.sub,
      createRequestDto.offeredSkillId,
      createRequestDto.requestedSkillId,
    );
  }

  @Patch(':id/accept')
  async acceptRequest(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.requestsService.acceptRequest(id, req.user.sub);
  }

  @Patch(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.requestsService.rejectRequest(id, req.user.sub);
  }
}
