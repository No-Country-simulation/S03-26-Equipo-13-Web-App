import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateDto } from './templates.dto';
export declare class TemplatesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
    }[]>;
    create(dto: CreateTemplateDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
    }>;
    handleMetaApproval(payload: any): Promise<{
        received: boolean;
    }>;
}
