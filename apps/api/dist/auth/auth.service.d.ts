import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly redis;
    constructor(prisma: PrismaService, jwtService: JwtService, redis: Redis);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    setupChannels(userId: string, dto: {
        whatsappNumber?: string;
        contactEmail?: string;
    }): Promise<{
        channels: {
            whatsappNumber?: string;
            contactEmail?: string;
        };
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
