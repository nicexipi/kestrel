import axios from 'axios';
import { AuthService } from '../auth.service';
import { logger } from '../../utils/logger';

// Mock do axios e logger
jest.mock('axios');
jest.mock('../../utils/logger');

describe('AuthService', () => {
  let authService: AuthService;
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  const mockResponse = {
    token: 'mock-token',
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup axios mock
    mockAxios.create.mockReturnValue({
      post: jest.fn(),
    } as any);
    
    // Create new instance for each test
    authService = new AuthService();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const axiosInstance = mockAxios.create();
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      // Act
      const result = await authService.login(mockCredentials);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(logger.info).toHaveBeenCalledWith(
        `Usuário ${mockCredentials.email} autenticado com sucesso`
      );
    });

    it('should throw and log error on failed login', async () => {
      // Arrange
      const mockError = new Error('Login failed');
      const axiosInstance = mockAxios.create();
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.login(mockCredentials)).rejects.toThrow('Login failed');
      expect(logger.error).toHaveBeenCalledWith('Erro na autenticação:', {
        error: mockError,
        email: mockCredentials.email
      });
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const axiosInstance = mockAxios.create();
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce({ data: { valid: true } });

      // Act
      const result = await authService.validateToken(mockToken);

      // Assert
      expect(result).toBe(true);
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/validate', { token: mockToken });
    });

    it('should return false for invalid token', async () => {
      // Arrange
      const mockToken = 'invalid-token';
      const axiosInstance = mockAxios.create();
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

      // Act
      const result = await authService.validateToken(mockToken);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should use default API URL if environment variable is not set', () => {
      // Arrange
      process.env.API_BASE_URL = undefined;

      // Act
      new AuthService();

      // Assert
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3003/api',
        timeout: 5000,
      });
    });

    it('should use environment variable API URL if set', () => {
      // Arrange
      process.env.API_BASE_URL = 'https://api.example.com';

      // Act
      new AuthService();

      // Assert
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 5000,
      });
    });
  });
});
