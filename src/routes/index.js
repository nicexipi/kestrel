const express = require('express');
const router = express.Router();

// Importar controllers
const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');
const comparisonController = require('../controllers/comparisonController');
const syncController = require('../controllers/syncController');
const dimensionController = require('../controllers/dimensionController');

// Importar middlewares
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter, bggLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

// Rotas públicas de autenticação
router.post('/auth/register', 
  authLimiter,
  validate(schemas.auth.register),
  authController.register
);

router.post('/auth/login',
  authLimiter,
  validate(schemas.auth.login),
  authController.login
);

// Rotas protegidas
router.use(authMiddleware);
router.use(apiLimiter);

// Rotas de perfil
router.get('/profile',
  authController.getProfile
);

router.put('/profile',
  validate(schemas.auth.updateProfile),
  authController.updateProfile
);

// Rotas de dimensões
router.get('/dimensions',
  dimensionController.listDimensions
);

// Rotas de jogos
router.get('/games/bgg/search',
  bggLimiter,
  validate(schemas.games.search),
  gameController.searchBGGGames
);

router.post('/games/bgg/import/:username',
  bggLimiter,
  validate(schemas.games.import),
  gameController.importBGGCollection
);

router.get('/games',
  gameController.listGames
);

router.get('/games/:id',
  gameController.getGameById
);

router.post('/games',
  validate(schemas.games.create),
  gameController.createGame
);

router.put('/games/:id',
  validate(schemas.games.update),
  gameController.updateGame
);

router.delete('/games/:id',
  gameController.deleteGame
);

// Rotas de comparações
router.get('/comparisons/next',
  validate(schemas.games.nextComparison),
  comparisonController.getGamesForComparison
);

router.post('/comparisons',
  validate(schemas.games.compare),
  comparisonController.submitComparison
);

router.get('/rankings/:userId',
  comparisonController.getCurrentRanking
);

// Rotas de sincronização
router.get('/sync/status',
  syncController.getSyncStatus
);

router.post('/sync/force',
  bggLimiter,
  syncController.forceSyncCollection
);

// Log todas as rotas registadas
logger.info('🗺️ Rotas registadas:', 
  router.stack
    .filter(r => r.route)
    .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`)
);

module.exports = router; 