import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './templates.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
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
