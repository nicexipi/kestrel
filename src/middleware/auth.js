const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('Token não fornecido', { 
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Extrair o token do header (formato: "Bearer token")
    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Token não fornecido no formato correto', { 
        ip: req.ip,
        path: req.path,
        authHeader,
      });
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          bggUsername: true,
          role: true,
          active: true,
        },
      });

      // Verificar se o usuário existe e está ativo
      if (!user || !user.active) {
        logger.warn('Usuário não encontrado ou inativo', { 
          userId: decoded.id,
          ip: req.ip,
          path: req.path,
        });
        return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      }

      // Adicionar usuário ao objeto request
      req.user = user;

      // Log de acesso bem-sucedido
      logger.debug('Acesso autenticado', {
        userId: user.id,
        email: user.email,
        path: req.path,
        method: req.method,
      });
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        logger.warn('Token inválido', { 
          ip: req.ip,
          path: req.path,
          error: error.message,
        });
        return res.status(401).json({ error: 'Token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        logger.warn('Token expirado', { 
          ip: req.ip,
          path: req.path,
        });
        return res.status(401).json({ error: 'Token expirado' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Erro na autenticação:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path,
    });
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

module.exports = authMiddleware; 