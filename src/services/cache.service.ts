import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

interface CacheConfig {
  stdTTL: number;        // Tempo padrão de vida em segundos
  checkperiod: number;   // Período para checar expiração em segundos
  useClones: boolean;    // Se deve clonar os objetos
}

class CacheService {
  private cache: NodeCache;
  private readonly defaultConfig: CacheConfig = {
    stdTTL: 3600,        // 1 hora
    checkperiod: 600,    // 10 minutos
    useClones: false,    // Evita overhead de clonagem
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new NodeCache({
      ...this.defaultConfig,
      ...config,
    });

    this.cache.on('expired', (key: string) => {
      logger.info(`Cache expirado para chave: ${key}`);
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = this.cache.get<T>(key);
      if (value === undefined) {
        logger.debug(`Cache miss para chave: ${key}`);
      } else {
        logger.debug(`Cache hit para chave: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error('Erro ao obter valor do cache:', { error, key });
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const success = this.cache.set(key, value, ttl);
      if (success) {
        logger.debug(`Valor armazenado no cache para chave: ${key}`);
      }
      return success;
    } catch (error) {
      logger.error('Erro ao armazenar valor no cache:', { error, key });
      return false;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const deleted = this.cache.del(key);
      if (deleted > 0) {
        logger.debug(`Cache removido para chave: ${key}`);
      }
      return deleted;
    } catch (error) {
      logger.error('Erro ao remover valor do cache:', { error, key });
      return 0;
    }
  }

  async flush(): Promise<void> {
    try {
      this.cache.flushAll();
      logger.info('Cache limpo completamente');
    } catch (error) {
      logger.error('Erro ao limpar cache:', { error });
    }
  }

  async stats(): Promise<NodeCache.Stats> {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
