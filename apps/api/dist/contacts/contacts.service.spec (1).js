"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const contacts_service_1 = require("./contacts.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const mockPrismaContact = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
};
const mockPrismaTag = {
    upsert: jest.fn(),
};
const mockTransaction = jest.fn();
const mockPrismaService = {
    contact: mockPrismaContact,
    tag: mockPrismaTag,
    $transaction: mockTransaction,
};
const mockContact = {
    id: 'contact-1',
    name: 'Juan García',
    phone: '+573001234567',
    email: 'juan@test.com',
    status: client_1.ContactStatus.new,
    assignedToId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    assignedTo: null,
};
describe('ContactsService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                contacts_service_1.ContactsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
            ],
        }).compile();
        service = module.get(contacts_service_1.ContactsService);
        service.prisma = mockPrismaService;
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return paginated contacts', async () => {
            mockTransaction.mockResolvedValue([[mockContact], 1]);
            const result = await service.findAll();
            expect(result).toEqual({
                data: [mockContact],
                total: 1,
                page: 1,
                totalPages: 1,
            });
        });
        it('should filter by status when provided', async () => {
            mockTransaction.mockResolvedValue([[], 0]);
            await service.findAll('active');
            const [findManyCall] = mockTransaction.mock.calls[0][0];
            expect(findManyCall).toBeDefined();
        });
    });
    describe('findOne', () => {
        it('should return a contact with messages and tasks', async () => {
            const full = { ...mockContact, messages: [], tasks: [] };
            mockPrismaContact.findUnique.mockResolvedValue(full);
            const result = await service.findOne('contact-1');
            expect(mockPrismaContact.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'contact-1' } }));
            expect(result).toEqual(full);
        });
        it('should throw NotFoundException when contact does not exist', async () => {
            mockPrismaContact.findUnique.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('create', () => {
        it('should create and return a contact', async () => {
            mockPrismaContact.create.mockResolvedValue(mockContact);
            const dto = { name: 'Juan García', phone: '+573001234567' };
            const result = await service.create(dto);
            expect(mockPrismaContact.create).toHaveBeenCalledWith(expect.objectContaining({ data: dto }));
            expect(result).toEqual(mockContact);
        });
    });
    describe('update', () => {
        it('should update and return the contact', async () => {
            const updated = { ...mockContact, name: 'Juan Actualizado' };
            mockPrismaContact.findUnique.mockResolvedValue(mockContact);
            mockPrismaContact.update.mockResolvedValue(updated);
            const result = await service.update('contact-1', { name: 'Juan Actualizado' });
            expect(mockPrismaContact.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'contact-1' } }));
            expect(result.name).toBe('Juan Actualizado');
        });
        it('should throw NotFoundException when contact does not exist', async () => {
            mockPrismaContact.findUnique.mockResolvedValue(null);
            await expect(service.update('nonexistent', {})).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('updateTags', () => {
        it('should upsert tags and assign them to the contact', async () => {
            const tag = { id: 'tag-1', name: 'VIP' };
            const contactWithTags = { ...mockContact, tags: [tag] };
            mockPrismaContact.findUnique.mockResolvedValue(mockContact);
            mockPrismaTag.upsert.mockResolvedValue(tag);
            mockPrismaContact.update.mockResolvedValue(contactWithTags);
            const result = await service.updateTags('contact-1', ['VIP']);
            expect(mockPrismaTag.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'VIP' } }));
            expect(result.tags).toEqual([tag]);
        });
    });
    describe('remove', () => {
        it('should delete and return the contact', async () => {
            mockPrismaContact.findUnique.mockResolvedValue(mockContact);
            mockPrismaContact.delete.mockResolvedValue(mockContact);
            const result = await service.remove('contact-1');
            expect(mockPrismaContact.delete).toHaveBeenCalledWith({ where: { id: 'contact-1' } });
            expect(result).toEqual(mockContact);
        });
        it('should throw NotFoundException when contact does not exist', async () => {
            mockPrismaContact.findUnique.mockResolvedValue(null);
            await expect(service.remove('nonexistent')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=contacts.service.spec%20(1).js.map