import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  Body,
  HttpException,
  HttpStatus,
  Post,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return await this.authService.getUserById(userId);
  }
}
