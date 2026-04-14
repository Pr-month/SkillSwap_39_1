import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthRequest } from '../auth/types/types';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: GetUsersQueryDto) {
    return await this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMe(@Req() req: AuthRequest) {
    return this.usersService.findOne(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updateMyPassword(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updateMyPassword(req.user.sub, updatePasswordDto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }
}
