import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    createUser: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const expectedResult = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
      };

      mockUsersService.createUser.mockResolvedValue(expectedResult);

      const result = await controller.createUser(createUserDto);

      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      const userId = 1;
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        createdAt: new Date(),
      };

      mockUsersService.findUserById.mockResolvedValue(expectedResult);

      const result = await controller.findUserById(userId);

      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        createdAt: new Date(),
      };

      mockUsersService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 1;
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        createdAt: new Date(),
      };

      mockUsersService.deleteUser.mockResolvedValue(expectedResult);

      const result = await controller.deleteUser(userId);

      expect(usersService.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });
});
