const axios = require('axios');
const { logger } = require('../utils/logger');

class BGGService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.BGG_API_BASE_URL,
      timeout: 10000,
    });
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  /**
   * Faz uma requisição com retry automático
   * @private
   */
  async retryableRequest(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;

      const isRetryable = 
        error.response?.status === 429 || // Rate limit
        error.response?.status === 202 || // Processing
        error.response?.status >= 500;    // Server error

      if (!isRetryable) throw error;

      logger.warn(`Erro na requisição BGG, tentando novamente em ${this.retryDelay}ms...`, {
        error: error.message,
        retriesLeft: retries - 1,
      });

      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      return this.retryableRequest(fn, retries - 1);
    }
  }

  /**
   * Busca a coleção de um usuário
   */
  async fetchCollection(username) {
    logger.info(`Buscando coleção do usuário ${username}`);

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
      return [];
    }

    const items = Array.isArray(response.data.items.item)
      ? response.data.items.item
      : [response.data.items.item];

    return items.map(item => ({
      bggId: parseInt(item.$.objectid),
      name: item.name[0].$.value,
      yearPublished: parseInt(item.yearpublished?.[0]) || null,
      imageUrl: item.image?.[0],
      description: item.description?.[0],
      minPlayers: parseInt(item.stats?.[0].$.minplayers) || null,
      maxPlayers: parseInt(item.stats?.[0].$.maxplayers) || null,
      playingTime: parseInt(item.stats?.[0].$.playingtime) || null,
      weight: parseFloat(item.stats?.[0].rating?.[0].averageweight?.[0]) || null,
    }));
  }

  /**
   * Busca detalhes de um jogo específico
   */
  async fetchGameDetails(gameId) {
    logger.info(`Buscando detalhes do jogo ${gameId}`);

    const response = await this.retryableRequest(() =>
      this.api.get('/thing', {
        params: {
          id: gameId,
          stats: 1,
        },
      })
    );

    if (!response.data?.items?.item?.[0]) {
      throw new Error('Jogo não encontrado');
    }

    const item = response.data.items.item[0];
    return {
      bggId: parseInt(item.$.id),
      name: item.name.find(n => n.$.type === 'primary')?.$.value,
      yearPublished: parseInt(item.yearpublished?.[0].$.value) || null,
      imageUrl: item.image?.[0],
      description: item.description?.[0],
      minPlayers: parseInt(item.minplayers?.[0].$.value) || null,
      maxPlayers: parseInt(item.maxplayers?.[0].$.value) || null,
      playingTime: parseInt(item.playingtime?.[0].$.value) || null,
      weight: parseFloat(item.statistics?.[0].ratings?.[0].averageweight?.[0].$.value) || null,
      categories: item.link
        ?.filter(l => l.$.type === 'boardgamecategory')
        .map(l => ({ id: l.$.id, value: l.$.value })) || [],
      mechanics: item.link
        ?.filter(l => l.$.type === 'boardgamemechanic')
        .map(l => ({ id: l.$.id, value: l.$.value })) || [],
      designers: item.link
        ?.filter(l => l.$.type === 'boardgamedesigner')
        .map(l => ({ id: l.$.id, value: l.$.value })) || [],
    };
  }

  /**
   * Busca jogos por nome
   */
  async searchGames(query) {
    logger.info(`Buscando jogos com query: ${query}`);

    const response = await this.retryableRequest(() =>
      this.api.get('/search', {
        params: {
          query,
          type: 'boardgame,boardgameexpansion',
        },
      })
    );

    if (!response.data?.items?.item) {
      return [];
    }

    const items = Array.isArray(response.data.items.item)
      ? response.data.items.item
      : [response.data.items.item];

    return items.map(item => ({
      bggId: parseInt(item.$.id),
      name: item.name[0].$.value,
      yearPublished: parseInt(item.yearpublished?.[0].$.value) || null,
      type: item.$.type,
    }));
  }
}

module.exports = new BGGService(); 