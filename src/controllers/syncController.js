const syncService = require('../services/syncService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obter status da sincronização
const getSyncStatus = async (req, res) => {
  try {
    const { userId } = req;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        games: {
          select: {
            own: true,
            prevOwned: true,
            want: true,
            wantToPlay: true,
            wantToBuy: true,
            wishlist: true,
            preordered: true,
            lastSync: true,
            syncErrors: true
          }
        }
      }
    });

    if (!user.bggUsername) {
      return res.status(400).json({
        error: 'Nome de utilizador BGG não configurado',
        status: 'not_configured'
      });
    }

    const status = syncService.getStatus();
    
    // Calcular estatísticas da coleção
    const collectionStats = {
      total: user.games.length,
      owned: user.games.filter(g => g.own).length,
      prevOwned: user.games.filter(g => g.prevOwned).length,
      wanted: user.games.filter(g => g.want).length,
      wantToPlay: user.games.filter(g => g.wantToPlay).length,
      wantToBuy: user.games.filter(g => g.wantToBuy).length,
      wishlist: user.games.filter(g => g.wishlist).length,
      preordered: user.games.filter(g => g.preordered).length,
      withErrors: user.games.filter(g => g.syncErrors).length
    };

    // Encontrar última sincronização bem-sucedida
    const lastSuccessfulSync = user.games
      .map(g => g.lastSync)
      .filter(date => date)
      .sort((a, b) => b - a)[0];

    // Encontrar erros recentes
    const recentErrors = user.games
      .filter(g => g.syncErrors)
      .map(g => ({
        gameId: g.gameId,
        error: g.syncErrors,
        lastSync: g.lastSync
      }))
      .sort((a, b) => (b.lastSync || 0) - (a.lastSync || 0))
      .slice(0, 5);

    const userStatus = {
      ...status,
      bggUsername: user.bggUsername,
      lastUserSync: user.lastBggSync,
      lastSuccessfulSync,
      collectionStats,
      recentErrors,
      nextScheduledSync: status.nextSyncTime
    };

    res.json(userStatus);
  } catch (error) {
    console.error('Erro ao obter status da sincronização:', error);
    res.status(500).json({ error: 'Erro ao obter status da sincronização' });
  }
};

// Forçar sincronização manual
const forceSyncCollection = async (req, res) => {
  try {
    const { userId } = req;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.bggUsername) {
      return res.status(400).json({
        error: 'Nome de utilizador BGG não configurado',
        status: 'not_configured'
      });
    }

    if (syncService.isRunning) {
      return res.status(409).json({
        error: 'Sincronização já em execução',
        status: 'running'
      });
    }

    // Iniciar sincronização em background
    syncService.syncUserCollection(user)
      .catch(error => console.error('Erro na sincronização manual:', error));

    res.json({
      message: 'Sincronização iniciada',
      status: 'started',
      bggUsername: user.bggUsername,
      startTime: new Date()
    });
  } catch (error) {
    console.error('Erro ao iniciar sincronização:', error);
    res.status(500).json({ error: 'Erro ao iniciar sincronização' });
  }
};

module.exports = {
  getSyncStatus,
  forceSyncCollection
}; 