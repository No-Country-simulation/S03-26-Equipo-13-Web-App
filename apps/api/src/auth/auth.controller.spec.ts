import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    access_token: 'access-tok',
    refresh_token: 'refresh-tok',
    user: { id: 'user-1', email: 'test@example.com', name: 'Test', role: 'agent' },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // POST /auth/register
  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a user and return the auth response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw HttpException when authService.register throws', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // POST /auth/login 
  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login and return the auth response', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw HttpException when authService.login throws', async () => {
      mockAuthService.login.mockRejectedValue(
        new Error('Invalid email or password'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  // POST /auth/logout
  describe('logout', () => {
    it('should call authService.logout and return the result', async () => {
      const logoutResult = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(logoutResult);

      const result = await controller.logout({});

      expect(authService.logout).toHaveBeenCalled();
      expect(result).toEqual(logoutResult);
    });
  });

  // GET /auth/me 
  describe('me', () => {
    it('should return the current user when userId is present in request', async () => {
      const userProfile = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'agent',
        createdAt: new Date(),
      };
      mockAuthService.getUserById.mockResolvedValue(userProfile);

      const req = { user: { id: 'user-1' } };
      const result = await controller.me(req);

      expect(authService.getUserById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(userProfile);
    });

    it('should throw UNAUTHORIZED HttpException when userId is missing', async () => {
      const req = { user: null };

      await expect(controller.me(req)).rejects.toThrow(HttpException);
      await expect(controller.me(req)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });
});
