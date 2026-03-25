import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactStatus } from '@prisma/client';

const mockPrismaContact = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};
const mockPrismaTag = { upsert: jest.fn() };
const mockTransaction = jest.fn();
const mockPrismaService = {
  contact: mockPrismaContact,
  tag: mockPrismaTag,
  $transaction: mockTransaction,
};

const mockContact = {
  id: 'contact-1', name: 'Juan García', phone: '+573001234567',
  email: 'juan@test.com', status: ContactStatus.new,
  assignedToId: null, notes: null,
  createdAt: new Date(), updatedAt: new Date(),
  tags: [], assignedTo: null,
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    (service as any).prisma = mockPrismaService;
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated contacts', async () => {
      mockTransaction.mockResolvedValue([[mockContact], 1]);
      const result = await service.findAll();
      expect(result).toEqual({ data: [mockContact], total: 1, page: 1, totalPages: 1 });
    });

    it('should call $transaction when filtering by status', async () => {
      mockTransaction.mockResolvedValue([[], 0]);
      await service.findAll('active');
      // $transaction was called — filter logic is inside the transaction
      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a contact with messages and tasks', async () => {
      const full = { ...mockContact, messages: [], tasks: [] };
      mockPrismaContact.findUnique.mockResolvedValue(full);
      const result = await service.findOne('contact-1');
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'contact-1' } }),
      );
      expect(result).toEqual(full);
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create and return a contact', async () => {
      mockPrismaContact.create.mockResolvedValue(mockContact);
      const dto = { name: 'Juan García', phone: '+573001234567' };
      const result = await service.create(dto as any);
      expect(mockPrismaContact.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: dto }),
      );
      expect(result).toEqual(mockContact);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update and return the contact', async () => {
      const updated = { ...mockContact, name: 'Juan Actualizado' };
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaContact.update.mockResolvedValue(updated);
      const result = await service.update('contact-1', { name: 'Juan Actualizado' });
      expect(mockPrismaContact.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'contact-1' } }),
      );
      expect(result.name).toBe('Juan Actualizado');
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateTags ────────────────────────────────────────────────────────────
  describe('updateTags', () => {
    it('should upsert tags and assign them to the contact', async () => {
      const tag = { id: 'tag-1', name: 'VIP' };
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaTag.upsert.mockResolvedValue(tag);
      mockPrismaContact.update.mockResolvedValue({ ...mockContact, tags: [tag] });
      const result = await service.updateTags('contact-1', ['VIP']);
      expect(mockPrismaTag.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: 'VIP' } }),
      );
      expect(result.tags).toEqual([tag]);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
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
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
