require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cookieParser = require('cookie-parser');

// Importar middlewares
const { securityMiddleware, handleCSRFError } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const { logger, requestLogger, errorLogger } = require('./utils/logger');

const app = express();
const prisma = new PrismaClient();

// Middlewares de segurança
app.use(cookieParser());
app.use(securityMiddleware);
app.use(apiLimiter);

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(requestLogger);

// Rotas
app.use('/api', require('./routes'));

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Tratamento de erros CSRF
app.use(handleCSRFError);

// Tratamento de erros 404
app.use((req, res) => {
  logger.warn('Rota não encontrada:', {
    method: req.method,
    url: req.url,
  });
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use(errorLogger);
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;

// Inicialização do servidor
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('📦 Conexão com o banco de dados estabelecida');
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`🔗 API disponível em http://localhost:${PORT}/api`);
      logger.info(`💚 Verificação de saúde em http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, _promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer(); 