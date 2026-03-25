import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// ── Mock PrismaService ─────────────────────────────────────────────────────────
const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockPrismaService = { user: mockPrismaUser };

// ── Mock Redis ─────────────────────────────────────────────────────────────────
const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
};

// ── Mock bcrypt ────────────────────────────────────────────────────────────────
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'agent',
  password: 'hashed-password',
  createdAt: new Date(),
};

const mockTokens = {
  access_token: 'access-tok',
  refresh_token: 'refresh-tok',
};

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = { sign: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    (service as any).prisma = mockPrismaService;
    (service as any).redis = mockRedis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register', () => {
    const registerDto = { email: mockUser.email, password: 'plain-password', name: mockUser.name };

    it('should register a user, store refresh token in Redis (not DB), and return tokens', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.access_token)
        .mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.register(registerDto);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `refresh:${mockUser.id}`,
        mockTokens.refresh_token,
        'EX',
        expect.any(Number),
      );
      expect(mockPrismaUser.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
      });
    });

    it('should use default role "agent" when not provided', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('tok');

      await service.register(registerDto);

      expect(mockPrismaUser.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'agent' }) }),
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    const loginDto = { email: mockUser.email, password: 'plain-password' };

    it('should login, rotate refresh token in Redis, and return tokens', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.access_token)
        .mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.login(loginDto);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `refresh:${mockUser.id}`,
        mockTokens.refresh_token,
        'EX',
        expect.any(Number),
      );
      expect(mockPrismaUser.update).not.toHaveBeenCalled();
      expect(result.access_token).toBe(mockTokens.access_token);
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password does not match', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      const result = await service.logout('user-1');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  // ── getUserById ───────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('should return safe user fields without password', async () => {
      const safeUser = { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role, createdAt: mockUser.createdAt };
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);
      const result = await service.getUserById('user-1');
      expect(result).toEqual(safeUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      expect(await service.getUserById('nonexistent')).toBeNull();
    });
  });
});
