import { PrismaService } from 'src/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<any>;
}
export {};
