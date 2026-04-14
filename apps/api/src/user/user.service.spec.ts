import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';

// ── Mock PrismaService ─────────────────────────────────────────────────────────
const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaService = { user: mockPrismaUser };

// ── Mock bcrypt ────────────────────────────────────────────────────────────────
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
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
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    (service as any).prisma = mockPrismaService;
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

    it('should hash the password and create a user without exposing it', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(safeUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(mockPrismaUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed-password' }),
        }),
      );
      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all users with safe fields only', async () => {
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
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);

      const result = await service.findOne('user-1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({ id: true }),
      });
      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('User not found');
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update and return the user with safe fields', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...safeUser, name: 'Updated Name' };
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateDto);

      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' }, data: updateDto }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should hash the new password if it is being updated', async () => {
      const updateDto = { password: 'new-plain-password' };
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      mockPrismaUser.update.mockResolvedValue(safeUser);

      await service.update('user-1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-plain-password', 10);
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed-password' }),
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete the user and return safe fields without password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      mockPrismaUser.delete.mockResolvedValue(safeUser);

      const result = await service.remove('user-1');

      expect(mockPrismaUser.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
