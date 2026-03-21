import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        name: string;
        role: string;
        id: string;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        name: string;
        role: string;
        id: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string;
        role: string;
        id: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        email: string;
        name: string;
        role: string;
        id: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        role: string;
        token: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
