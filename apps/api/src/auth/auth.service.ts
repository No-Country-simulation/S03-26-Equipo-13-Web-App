import { BadRequestException, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Payload } from 'src/interfaces/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import Redis from 'ioredis';

const REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = (registerDto.role ?? 'agent') as UserRole;

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role,
      },
    });

    const payload: Payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.redis.set(`refresh:${user.id}`, refresh_token, 'EX', REFRESH_TTL);

    return {
      access_token,
      refresh_token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
    if (!user) throw new BadRequestException('Invalid email or password');

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) throw new BadRequestException('Invalid email or password');

    const payload: Payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.redis.set(`refresh:${user.id}`, refresh_token, 'EX', REFRESH_TTL);

    return {
      access_token,
      refresh_token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    return { message: 'Logged out successfully' };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async setupChannels(userId: string, dto: { whatsappNumber?: string; contactEmail?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {},
      select: { id: true, name: true, email: true, role: true },
    });
    return { ...user, channels: dto };
  }
}
