import axios from 'axios';
import { BGGService, BGGError } from '../bggService';
import { cacheService } from '../cache.service';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../cache.service');
jest.mock('../../utils/logger');

describe('BGGService', () => {
  let bggService: BGGService;
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockCache = cacheService as jest.Mocked<typeof cacheService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup axios mock
    mockAxios.create.mockReturnValue({
      get: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);
    
    // Create new instance for each test
    bggService = new BGGService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://boardgamegeek.com/xmlapi2',
        timeout: 10000,
      });
    });

    it('should use custom BGG API URL from environment', () => {
      // Arrange
      process.env.BGG_API_BASE_URL = 'https://custom-bgg-api.com';

      // Act
      new BGGService();

      // Assert
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom-bgg-api.com',
        timeout: 10000,
      });
    });
  });

  describe('fetchCollection', () => {
    const username = 'testuser';
    const cacheKey = 'bgg:collection:testuser';
    const mockCollection = {
      games: [
        {
          bggId: 1,
          name: 'Test Game',
          yearPublished: 2020,
          imageUrl: 'http://example.com/image.jpg',
          description: 'Test description',
          minPlayers: 2,
          maxPlayers: 4,
          playingTime: 60,
          weight: 2.5,
        },
      ],
      totalItems: 1,
      username: 'testuser',
    };

    it('should return cached collection if available', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(mockCollection);

      // Act
      const result = await bggService.fetchCollection(username);

      // Assert
      expect(result).toBe(mockCollection);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockAxios.create().get).not.toHaveBeenCalled();
    });

    it('should fetch and cache collection if not in cache', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const mockResponse = {
        data: {
          items: {
            item: [{
              $: { objectid: '1' },
              name: [{ $: { value: 'Test Game' } }],
              yearpublished: ['2020'],
              image: ['http://example.com/image.jpg'],
              description: ['Test description'],
              stats: [{
                $: {
                  minplayers: '2',
                  maxplayers: '4',
                  playingtime: '60',
                },
                rating: [{
                  averageweight: ['2.5'],
                }],
              }],
            }],
          },
        },
      };
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await bggService.fetchCollection(username);

      // Assert
      expect(result).toEqual(mockCollection);
      expect(axiosInstance.get).toHaveBeenCalledWith('/collection', {
        params: {
          username,
          stats: 1,
          own: 1,
        },
      });
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, mockCollection, expect.any(Number));
    });

    it('should handle empty collection', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const mockResponse = {
        data: {},
      };
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await bggService.fetchCollection(username);

      // Assert
      expect(result).toEqual({
        games: [],
        totalItems: 0,
        username,
      });
    });

    it('should retry on rate limit error', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const rateLimitError = new BGGError('Rate limit excedido', 429, { retryAfter: '5' });
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ data: {} });

      // Act
      const promise = bggService.fetchCollection(username);
      
      // Fast-forward retry delay
      jest.advanceTimersByTime(5000);
      
      const result = await promise;

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        games: [],
        totalItems: 0,
        username,
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw error after max retries', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const rateLimitError = new BGGError('Rate limit excedido', 429, { retryAfter: '5' });
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock).mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(bggService.fetchCollection(username)).rejects.toThrow(BGGError);
      expect(axiosInstance.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('fetchGameDetails', () => {
    const gameId = 1234;
    const cacheKey = 'bgg:game:1234';
    const mockGame = {
      bggId: 1234,
      name: 'Test Game',
      yearPublished: 2020,
      imageUrl: 'http://example.com/image.jpg',
      description: 'Test description',
      minPlayers: 2,
      maxPlayers: 4,
      playingTime: 60,
      weight: 2.5,
    };

    it('should return cached game details if available', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(mockGame);

      // Act
      const result = await bggService.fetchGameDetails(gameId);

      // Assert
      expect(result).toBe(mockGame);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockAxios.create().get).not.toHaveBeenCalled();
    });

    it('should fetch and cache game details if not in cache', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const mockResponse = {
        data: {
          items: {
            item: [{
              $: { id: '1234' },
              name: [{ $: { type: 'primary', value: 'Test Game' } }],
              yearpublished: [{ $: { value: '2020' } }],
              image: ['http://example.com/image.jpg'],
              description: ['Test description'],
              minplayers: [{ $: { value: '2' } }],
              maxplayers: [{ $: { value: '4' } }],
              playingtime: [{ $: { value: '60' } }],
              statistics: [{
                ratings: [{
                  averageweight: [{ $: { value: '2.5' } }],
                }],
              }],
            }],
          },
        },
      };
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await bggService.fetchGameDetails(gameId);

      // Assert
      expect(result).toEqual(mockGame);
      expect(axiosInstance.get).toHaveBeenCalledWith('/thing', {
        params: {
          id: gameId,
          stats: 1,
        },
      });
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, mockGame, expect.any(Number));
    });

    it('should throw error when game is not found', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(undefined);
      const mockResponse = {
        data: {
          items: {},
        },
      };
      const axiosInstance = mockAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(bggService.fetchGameDetails(gameId)).rejects.toThrow(BGGError);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
