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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status, busqueda, page = 1) {
        const take = 20;
        const skip = (page - 1) * take;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.contact.findMany({
                where: {
                    ...(status && { status: status }),
                    ...(busqueda && {
                        OR: [
                            { name: { contains: busqueda, mode: 'insensitive' } },
                            { email: { contains: busqueda, mode: 'insensitive' } },
                            { phone: { contains: busqueda, mode: 'insensitive' } },
                        ],
                    }),
                },
                include: { tags: true, assignedTo: { select: { id: true, name: true } } },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contact.count({
                where: {
                    ...(status && { status: status }),
                    ...(busqueda && {
                        OR: [
                            { name: { contains: busqueda, mode: 'insensitive' } },
                            { email: { contains: busqueda, mode: 'insensitive' } },
                            { phone: { contains: busqueda, mode: 'insensitive' } },
                        ],
                    }),
                },
            }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / take) };
    }
    async findOne(id) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                tags: true,
                tasks: { orderBy: { dueDate: 'asc' } },
                messages: { orderBy: { createdAt: 'desc' }, take: 50 },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${id} no encontrado`);
        return contact;
    }
    async create(data) {
        return this.prisma.contact.create({
            data,
            include: { tags: true },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.contact.update({
            where: { id },
            data,
            include: { tags: true },
        });
    }
    async updateTags(id, tagNames) {
        await this.findOne(id);
        const tags = await Promise.all(tagNames.map((name) => this.prisma.tag.upsert({ where: { name }, update: {}, create: { name } })));
        return this.prisma.contact.update({
            where: { id },
            data: { tags: { set: tags.map((t) => ({ id: t.id })) } },
            include: { tags: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.contact.delete({ where: { id } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map