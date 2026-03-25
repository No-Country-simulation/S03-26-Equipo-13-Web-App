"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TemplatesService = TemplatesService_1 = class TemplatesService {
    prisma;
    logger = new common_1.Logger(TemplatesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async create(dto) {
        return this.prisma.template.create({
            data: {
                name: dto.name,
                content: dto.content,
                category: dto.category,
            },
        });
    }
    async handleMetaApproval(payload) {
        try {
            const event = payload?.entry?.[0]?.changes?.[0]?.value;
            const templateName = event?.message_template_name;
            const status = event?.event;
            if (!templateName || !status) {
                this.logger.warn('Unrecognised Meta webhook payload', payload);
                return { received: true };
            }
            const template = await this.prisma.template.findFirst({ where: { name: templateName } });
            if (!template) {
                this.logger.warn(`Template "${templateName}" not found in DB`);
                return { received: true };
            }
            await this.prisma.template.update({
                where: { id: template.id },
                data: { category: status.toLowerCase() },
            });
            this.logger.log(`Template "${templateName}" → ${status}`);
            return { received: true };
        }
        catch (err) {
            this.logger.error('Meta approval webhook error', err);
            return { received: true };
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map