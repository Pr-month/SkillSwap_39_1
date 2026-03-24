import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AccessAuthGuard } from './guards/access-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

interface AccessRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

interface RefreshRequest extends Request {
  user: {
    sub: string;
    email: string;
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessAuthGuard)
  @Post('logout')
  logout(@Req() req: AccessRequest) {
    return this.authService.logout(req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(@Req() req: RefreshRequest) {
    return this.authService.refreshTokens(
      req.user.sub,
      req.user.email,
      req.user.refreshToken,
    );
  }
}
