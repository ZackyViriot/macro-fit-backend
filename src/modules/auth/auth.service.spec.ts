import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword123',
      createdAt: new Date('2024-01-01'),
    };

    const mockJwtPayload = {
      sub: mockUser.id,
      email: mockUser.email,
      name: `${mockUser.firstName} ${mockUser.lastName}`,
    };

    const mockTransformedUser = {
      id: mockUser.id,
      first_name: mockUser.firstName,
      last_name: mockUser.lastName,
      email: mockUser.email,
      created_at: mockUser.createdAt,
    };

    it('should successfully sign in a user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockToken = 'jwt-token-123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual({
        access_token: mockToken,
        user: mockTransformedUser,
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(NotFoundException);
      await expect(service.signIn(email, password)).rejects.toThrow('User not found');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const userWithoutPassword = { ...mockUser, password: null as any };

      usersService.findByEmail.mockResolvedValue(userWithoutPassword);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(email, password)).rejects.toThrow('User does not have a password');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(email, password)).rejects.toThrow('Invalid password');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should call bcrypt.compare with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      // Act
      await service.signIn(email, password);

      // Assert
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should call jwtService.signAsync with correct payload', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      // Act
      await service.signIn(email, password);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload);
    });

    it('should transform user data correctly', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(result.user).toEqual(mockTransformedUser);
    });
  });
});
