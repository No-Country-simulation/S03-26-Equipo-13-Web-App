import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    private prisma;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
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
            role: string;
        };
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    } | null>;
    logout(): Promise<{
        message: string;
    }>;
}
