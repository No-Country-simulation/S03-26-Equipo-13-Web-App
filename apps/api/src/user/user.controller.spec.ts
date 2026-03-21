import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const safeUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'agent',
    createdAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── POST /users ───────────────────────────────────────────────────────────
  describe('create', () => {
    it('should call userService.create with the dto and return the result', async () => {
      const createDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      mockUserService.create.mockResolvedValue(safeUser);

      const result = await controller.create(createDto);

      expect(userService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(safeUser);
    });
  });

  // ── GET /users ────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should call userService.findAll and return the user list', async () => {
      const userList = [safeUser];
      mockUserService.findAll.mockResolvedValue(userList);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(userList);
    });
  });

  // ── GET /users/:id ────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should call userService.findOne with the id and return the user', async () => {
      mockUserService.findOne.mockResolvedValue(safeUser);

      const result = await controller.findOne('user-1');

      expect(userService.findOne).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(safeUser);
    });
  });

  // ── PATCH /users/:id ──────────────────────────────────────────────────────
  describe('update', () => {
    it('should call userService.update with id and dto, and return the result', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...safeUser, name: 'Updated Name' };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateDto);

      expect(userService.update).toHaveBeenCalledWith('user-1', updateDto);
      expect(result).toEqual(updatedUser);
    });
  });

  // ── DELETE /users/:id ─────────────────────────────────────────────────────
  describe('remove', () => {
    it('should call userService.remove with the id and return the result', async () => {
      mockUserService.remove.mockResolvedValue(safeUser);

      const result = await controller.remove('user-1');

      expect(userService.remove).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(safeUser);
    });
  });
});
