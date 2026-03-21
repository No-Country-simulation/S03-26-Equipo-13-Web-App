import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// ── Mock PrismaClient ──────────────────────────────────────────────────────────
const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: mockPrismaUser,
  })),
}));

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
  token: null,
  createdAt: new Date(),
};

const mockTokens = {
  access_token: 'access-tok',
  refresh_token: 'refresh-tok',
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserService = {};

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register', () => {
    const registerDto = {
      email: mockUser.email,
      password: 'plain-password',
      name: mockUser.name,
    };

    it('should register a user and return tokens with user info', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.access_token)
        .mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.register(registerDto);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaUser.create).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should use default role "agent" when role is not provided', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.access_token)
        .mockReturnValueOnce(mockTokens.refresh_token);

      await service.register(registerDto);

      expect(mockPrismaUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'agent' }),
        }),
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    const loginDto = { email: mockUser.email, password: 'plain-password' };

    it('should login and return tokens with user info', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaUser.update.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.access_token)
        .mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.login(loginDto);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw BadRequestException if password does not match', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  // ── getUserById ───────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('should return the user without sensitive fields', async () => {
      const safeUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      };
      mockPrismaUser.findUnique.mockResolvedValue(safeUser);

      const result = await service.getUserById('user-1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(safeUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should return a success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
