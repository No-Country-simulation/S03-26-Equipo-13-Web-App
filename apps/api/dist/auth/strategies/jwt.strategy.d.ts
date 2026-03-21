import { PrismaService } from 'src/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        token: string | null;
    }>;
}
export {};
