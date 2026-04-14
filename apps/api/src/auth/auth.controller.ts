import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetupChannelsDto } from './dto/setup-channels.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Crear cuenta. Devuelve accessToken y refreshToken' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario creado. Retorna { accessToken, refreshToken, user }' })
  @ApiResponse({ status: 400, description: 'Email ya registrado o datos inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión. Devuelve accessToken' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna { accessToken, user }' })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar token en Redis' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async logout(@Request() req: any) {
    // Pass userId so the service can delete the Redis key
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario { id, name, email, role }' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async me(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.authService.getUserById(userId);
  }

  @Patch('setup-channels')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar número de WhatsApp y email en el onboarding' })
  @ApiBody({ type: SetupChannelsDto })
  @ApiResponse({ status: 200, description: 'Canales configurados correctamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async setupChannels(@Request() req: any, @Body() dto: SetupChannelsDto) {
    return this.authService.setupChannels(req.user.id, dto);
  }
}
