import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-clave-secreta',
      signOptions: { expiresIn: '24h' },
    }),
    PrismaModule,
  ],
})
export class AuthModule {}
