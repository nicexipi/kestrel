import NodeCache from 'node-cache';
import { CacheService } from '../cache.service';
import { logger } from '../../utils/logger';

// Mock NodeCache e logger
jest.mock('node-cache');
jest.mock('../../utils/logger');

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockNodeCache: jest.Mocked<NodeCache>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup NodeCache mock
    mockNodeCache = new NodeCache() as jest.Mocked<NodeCache>;
    (NodeCache as jest.Mock).mockImplementation(() => mockNodeCache);
    
    // Create new instance for each test
    cacheService = new CacheService();
  });

  describe('constructor', () => {
    it('should create cache with default config', () => {
      // Assert
      expect(NodeCache).toHaveBeenCalledWith({
        stdTTL: 3600,
        checkperiod: 600,
        useClones: false,
      });
    });

    it('should create cache with custom config', () => {
      // Arrange
      const customConfig = {
        stdTTL: 7200,
        checkperiod: 300,
        useClones: true,
      };

      // Act
      new CacheService(customConfig);

      // Assert
      expect(NodeCache).toHaveBeenCalledWith(customConfig);
    });

    it('should setup expired event handler', () => {
      // Arrange
      const mockOn = jest.fn();
      (NodeCache as jest.Mock).mockImplementation(() => ({
        on: mockOn,
      }));

      // Act
      new CacheService();

      // Assert
      expect(mockOn).toHaveBeenCalledWith('expired', expect.any(Function));
    });
  });

  describe('get', () => {
    it('should return cached value when exists', async () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test-data' };
      mockNodeCache.get.mockReturnValue(value);

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(result).toBe(value);
      expect(mockNodeCache.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith(`Cache hit para chave: ${key}`);
    });

    it('should return undefined and log when value does not exist', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockNodeCache.get.mockReturnValue(undefined);

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNodeCache.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith(`Cache miss para chave: ${key}`);
    });

    it('should handle errors and return undefined', async () => {
      // Arrange
      const key = 'error-key';
      const error = new Error('Cache error');
      mockNodeCache.get.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith('Erro ao obter valor do cache:', {
        error,
        key,
      });
    });
  });

  describe('set', () => {
    it('should successfully set cache value', async () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test-data' };
      const ttl = 3600;
      mockNodeCache.set.mockReturnValue(true);

      // Act
      const result = await cacheService.set(key, value, ttl);

      // Assert
      expect(result).toBe(true);
      expect(mockNodeCache.set).toHaveBeenCalledWith(key, value, ttl);
      expect(logger.debug).toHaveBeenCalledWith(`Valor armazenado no cache para chave: ${key}`);
    });

    it('should handle errors when setting cache', async () => {
      // Arrange
      const key = 'error-key';
      const value = { data: 'test-data' };
      const error = new Error('Cache error');
      mockNodeCache.set.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await cacheService.set(key, value);

      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Erro ao armazenar valor no cache:', {
        error,
        key,
      });
    });
  });

  describe('del', () => {
    it('should successfully delete cache value', async () => {
      // Arrange
      const key = 'test-key';
      mockNodeCache.del.mockReturnValue(1);

      // Act
      const result = await cacheService.del(key);

      // Assert
      expect(result).toBe(1);
      expect(mockNodeCache.del).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith(`Cache removido para chave: ${key}`);
    });

    it('should handle when no value is deleted', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockNodeCache.del.mockReturnValue(0);

      // Act
      const result = await cacheService.del(key);

      // Assert
      expect(result).toBe(0);
      expect(mockNodeCache.del).toHaveBeenCalledWith(key);
    });

    it('should handle errors when deleting cache', async () => {
      // Arrange
      const key = 'error-key';
      const error = new Error('Cache error');
      mockNodeCache.del.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await cacheService.del(key);

      // Assert
      expect(result).toBe(0);
      expect(logger.error).toHaveBeenCalledWith('Erro ao remover valor do cache:', {
        error,
        key,
      });
    });
  });

  describe('flush', () => {
    it('should successfully flush cache', async () => {
      // Act
      await cacheService.flush();

      // Assert
      expect(mockNodeCache.flushAll).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache limpo completamente');
    });

    it('should handle errors when flushing cache', async () => {
      // Arrange
      const error = new Error('Cache error');
      mockNodeCache.flushAll.mockImplementation(() => {
        throw error;
      });

      // Act
      await cacheService.flush();

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Erro ao limpar cache:', { error });
    });
  });

  describe('stats', () => {
    it('should return cache statistics', async () => {
      // Arrange
      const mockStats = {
        hits: 10,
        misses: 5,
        keys: 15,
      };
      mockNodeCache.getStats.mockReturnValue(mockStats);

      // Act
      const result = await cacheService.stats();

      // Assert
      expect(result).toBe(mockStats);
      expect(mockNodeCache.getStats).toHaveBeenCalled();
    });
  });
});
