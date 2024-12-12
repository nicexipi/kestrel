const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const bggService = require('./bggService');

const prisma = new PrismaClient();

/**
 * Serviço responsável pela sincronização de coleções com o BGG
 */
class SyncService {
  constructor() {
    /** @type {boolean} Flag que indica se há uma sincronização em andamento */
    this.isRunning = false;
    /** @type {Date|null} Data da última sincronização */
    this.lastSync = null;
    /** @type {number} Intervalo entre sincronizações em milissegundos */
    this.syncInterval = 12 * 60 * 60 * 1000; // 12 horas
    /** @type {Map<string, boolean>} Mapa de usuários em sincronização */
    this.userSyncs = new Map();
    
    this.startAutoSync();
  }

  /**
   * Inicia o job de sincronização automática
   * @private
   */
  startAutoSync() {
    setInterval(async () => {
      try {
        if (this.isRunning) {
          logger.info('Sincronização já em andamento, aguardando próximo ciclo');
          return;
        }
        
        const users = await prisma.user.findMany({
          where: {
            bggUsername: { not: null },
            active: true,
          },
          select: {
            id: true,
            bggUsername: true,
            lastBggSync: true,
          },
        });

        for (const user of users) {
          // Verifica se o usuário já está em sincronização
          if (this.userSyncs.get(user.id)) {
            logger.info(`Usuário ${user.bggUsername} já está em sincronização`);
            continue;
          }

          const timeSinceLastSync = user.lastBggSync 
            ? Date.now() - user.lastBggSync.getTime() 
            : Infinity;

          if (timeSinceLastSync >= this.syncInterval) {
            await this.syncUserCollection(user);
          }
        }
      } catch (error) {
        logger.error('Erro na sincronização automática:', error);
      }
    }, 30 * 60 * 1000); // Verifica a cada 30 minutos
  }

  /**
   * Sincroniza a coleção de um usuário específico
   * @param {Object} user Usuário a ser sincronizado
   * @param {string} user.id ID do usuário
   * @param {string} user.bggUsername Username do BGG
   * @throws {Error} Se já houver uma sincronização em andamento para o usuário
   */
  async syncUserCollection(user) {
    if (this.userSyncs.get(user.id)) {
      throw new Error('Já existe uma sincronização em andamento para este usuário');
    }

    try {
      this.userSyncs.set(user.id, true);
      this.isRunning = true;
      logger.info(`Iniciando sincronização para ${user.bggUsername}`);

      const collection = await bggService.fetchCollection(user.bggUsername);
      
      // Processar jogos em lotes para evitar sobrecarga
      const batchSize = 50;
      for (let i = 0; i < collection.length; i += batchSize) {
        const batch = collection.slice(i, i + batchSize);
        await Promise.all(
          batch.map(game => 
            prisma.game.upsert({
              where: { bggId: game.bggId },
              update: {
                name: game.name,
                yearPublished: game.yearPublished,
                imageUrl: game.imageUrl,
                description: game.description,
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                playingTime: game.playingTime,
                weight: game.weight,
                lastSync: new Date(),
              },
              create: {
                bggId: game.bggId,
                name: game.name,
                yearPublished: game.yearPublished,
                imageUrl: game.imageUrl,
                description: game.description,
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                playingTime: game.playingTime,
                weight: game.weight,
                lastSync: new Date(),
              },
            })
          )
        );

        // Pequena pausa entre lotes para não sobrecarregar o banco
        if (i + batchSize < collection.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Atualizar timestamp de sincronização do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastBggSync: new Date(),
          syncErrors: null, // Limpar erros anteriores
        },
      });

      this.lastSync = new Date();
      logger.info(`Sincronização concluída para ${user.bggUsername}`);
    } catch (error) {
      logger.error(`Erro ao sincronizar coleção de ${user.bggUsername}:`, error);
      
      // Registrar erro no usuário
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          syncErrors: error.message,
        },
      });

      throw error;
    } finally {
      this.userSyncs.delete(user.id);
      this.isRunning = this.userSyncs.size > 0;
    }
  }

  /**
   * Retorna o status atual da sincronização
   * @returns {Object} Status da sincronização
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      nextSyncTime: this.lastSync 
        ? new Date(this.lastSync.getTime() + this.syncInterval)
        : null,
      activeSyncs: Array.from(this.userSyncs.entries()).map(([userId]) => userId),
    };
  }
}

module.exports = new SyncService(); 