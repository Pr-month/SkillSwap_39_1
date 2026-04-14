import {
  UseGuards,
  Controller,
  Get,
  Req,
  Post,
  Body,
  Param,
  Patch,
  UseGuards
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthRequest } from '../auth/types/types';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@UseGuards(JwtAuthGuard)
@Controller('requests')
@UseGuards(JwtAuthGuard)
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

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(id, req.user.sub);
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
