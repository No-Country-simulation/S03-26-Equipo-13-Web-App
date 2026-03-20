"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let ContactsService = class ContactsService {
    async findAll(status, busqueda, page = 1) {
        const take = 20;
        const skip = (page - 1) * take;
        return prisma.contact.findMany({
            where: {
                ...(status && { status }),
                ...(busqueda && {
                    OR: [
                        { name: { contains: busqueda, mode: 'insensitive' } },
                        { email: { contains: busqueda, mode: 'insensitive' } },
                        { phone: { contains: busqueda, mode: 'insensitive' } },
                    ],
                }),
            },
            include: { tags: true },
            skip,
            take,
        });
    }
    async findOne(id) {
        const contact = await prisma.contact.findUnique({
            where: { id },
            include: { tags: true, tasks: true, messages: true },
        });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${id} no encontrado`);
        return contact;
    }
    async create(data) {
        return prisma.contact.create({ data });
    }
    async update(id, data) {
        const contact = await prisma.contact.findUnique({ where: { id } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${id} no encontrado`);
        return prisma.contact.update({ where: { id }, data });
    }
    async updateTags(id, tagNames) {
        const contact = await prisma.contact.findUnique({ where: { id } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${id} no encontrado`);
        const tags = await Promise.all(tagNames.map((name) => prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
        })));
        return prisma.contact.update({
            where: { id },
            data: { tags: { set: tags.map((t) => ({ id: t.id })) } },
            include: { tags: true },
        });
    }
    async remove(id) {
        const contact = await prisma.contact.findUnique({ where: { id } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${id} no encontrado`);
        return prisma.contact.delete({ where: { id } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)()
], ContactsService);
//# sourceMappingURL=contacts.service.js.map