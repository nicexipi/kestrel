import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { cacheService } from './cache.service';

interface BGGGame {
  bggId: number;
  name: string;
  yearPublished: number | null;
  imageUrl: string | null;
  description: string | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playingTime: number | null;
  weight: number | null;
}

interface BGGCollection {
  games: BGGGame[];
  totalItems: number;
  username: string;
}

class BGGError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: any
  ) {
    super(message);
    this.name = 'BGGError';
  }
}

export class BGGService {
  private api: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly cacheKeyPrefix: string = 'bgg:';
  private readonly cacheDuration: number = 3600; // 1 hora

  constructor() {
    this.api = axios.create({
      baseURL: process.env.BGG_API_BASE_URL || 'https://boardgamegeek.com/xmlapi2',
      timeout: 10000,
    });
    this.maxRetries = 3;
    this.retryDelay = 5000;

    // Interceptor para tratamento de erros
    this.api.interceptors.response.use(
      response => response,
      error => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 429) {
          throw new BGGError('Rate limit excedido', status, { retryAfter: error.response?.headers['retry-after'] });
        }

        if (status === 404) {
          throw new BGGError('Recurso não encontrado', status, { url: error.config?.url });
        }

        if (status >= 500) {
          throw new BGGError('Erro no servidor BGG', status, { url: error.config?.url });
        }

        throw new BGGError(message, status);
      }
    );
  }

  private async retryableRequest<T>(fn: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (!(error instanceof BGGError)) {
        throw error;
      }

      if (retries === 0 || error.statusCode === 404) {
        throw error;
      }

      const isRetryable = 
        error.statusCode === 429 || 
        error.statusCode === 202 || 
        error.statusCode >= 500;

      if (!isRetryable) {
        throw error;
      }

      const delay = error.statusCode === 429 && error.context?.retryAfter
        ? parseInt(error.context.retryAfter) * 1000
        : this.retryDelay;

      logger.warn(`Erro na requisição BGG, tentando novamente em ${delay}ms...`, {
        error: error.message,
        retriesLeft: retries - 1,
        statusCode: error.statusCode,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryableRequest(fn, retries - 1);
    }
  }

  async fetchCollection(username: string): Promise<BGGCollection> {
    const cacheKey = `${this.cacheKeyPrefix}collection:${username}`;
    
    // Tentar obter do cache
    const cached = await cacheService.get<BGGCollection>(cacheKey);
    if (cached) {
      return cached;
    }

    logger.info(`Buscando coleção do usuário ${username}`);

    try {
      const response = await this.retryableRequest(() =>
        this.api.get('/collection', {
          params: {
            username,
            stats: 1,
            own: 1,
          },
        })
      );

      if (!response.data?.items?.item) {
        return {
          games: [],
          totalItems: 0,
          username,
        };
      }

      const items = Array.isArray(response.data.items.item)
        ? response.data.items.item
        : [response.data.items.item];

      const collection: BGGCollection = {
        games: items.map(item => ({
          bggId: parseInt(item.$.objectid),
          name: item.name[0].$.value,
          yearPublished: parseInt(item.yearpublished?.[0]) || null,
          imageUrl: item.image?.[0] || null,
          description: item.description?.[0] || null,
          minPlayers: parseInt(item.stats?.[0].$.minplayers) || null,
          maxPlayers: parseInt(item.stats?.[0].$.maxplayers) || null,
          playingTime: parseInt(item.stats?.[0].$.playingtime) || null,
          weight: parseFloat(item.stats?.[0].rating?.[0].averageweight?.[0]) || null,
        })),
        totalItems: items.length,
        username,
      };

      // Armazenar no cache
      await cacheService.set(cacheKey, collection, this.cacheDuration);

      return collection;
    } catch (error) {
      if (error instanceof BGGError) {
        throw error;
      }
      throw new BGGError('Erro ao buscar coleção', undefined, { username, error });
    }
  }

  async fetchGameDetails(gameId: number): Promise<BGGGame> {
    const cacheKey = `${this.cacheKeyPrefix}game:${gameId}`;
    
    // Tentar obter do cache
    const cached = await cacheService.get<BGGGame>(cacheKey);
    if (cached) {
      return cached;
    }

    logger.info(`Buscando detalhes do jogo ${gameId}`);

    try {
      const response = await this.retryableRequest(() =>
        this.api.get('/thing', {
          params: {
            id: gameId,
            stats: 1,
          },
        })
      );

      if (!response.data?.items?.item?.[0]) {
        throw new BGGError('Jogo não encontrado', 404, { gameId });
      }

      const item = response.data.items.item[0];
      const game: BGGGame = {
        bggId: parseInt(item.$.id),
        name: item.name.find((n: any) => n.$.type === 'primary')?.$.value,
        yearPublished: parseInt(item.yearpublished?.[0].$.value) || null,
        imageUrl: item.image?.[0] || null,
        description: item.description?.[0] || null,
        minPlayers: parseInt(item.minplayers?.[0].$.value) || null,
        maxPlayers: parseInt(item.maxplayers?.[0].$.value) || null,
        playingTime: parseInt(item.playingtime?.[0].$.value) || null,
        weight: parseFloat(item.statistics?.[0].ratings?.[0].averageweight?.[0].$.value) || null,
      };

      // Armazenar no cache
      await cacheService.set(cacheKey, game, this.cacheDuration);

      return game;
    } catch (error) {
      if (error instanceof BGGError) {
        throw error;
      }
      throw new BGGError('Erro ao buscar detalhes do jogo', undefined, { gameId, error });
    }
  }
}

export const bggService = new BGGService();