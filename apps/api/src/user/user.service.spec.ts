import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

// ── Mock PrismaClient ──────────────────────────────────────────────────────────
const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: mockPrismaUser,
  })),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────
const safeUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'agent',
  createdAt: new Date(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    const createDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create and return a new user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(safeUser);

      const result = await service.create(createDto);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockPrismaUser.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: createDto }),
      );
      expect(result).toEqual(safeUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all users', async () => {
      const userList = [safeUser];
      mockPrismaUser.findMany.mockResolvedValue(userList);

      const result = await service.findAll();

      expect(mockPrismaUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          }),
        }),
      );
      expect(result).toEqual(userList);
    });

    it('should return an empty array when no users exist', async () => {
      mockPrismaUser.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);

      const result = await service.findOne('user-1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({ id: true }),
      });
      expect(result).toEqual(safeUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'User not found',
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('should update and return the user', async () => {
      const updatedUser = { ...safeUser, name: 'Updated Name' };
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateDto);

      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' }, data: updateDto }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete and return the deleted user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      mockPrismaUser.delete.mockResolvedValue(safeUser);

      const result = await service.remove('user-1');

      expect(mockPrismaUser.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(safeUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
