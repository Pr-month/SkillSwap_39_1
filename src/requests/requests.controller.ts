import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { AuthRequest } from 'src/auth/types/types';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';


@UseGuards(JwtAuthGuard)
@Controller('requests')
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
}
