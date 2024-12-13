const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register'
];

const authMiddleware = (req, res, next) => {
  // Verificar se é uma rota pública
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Obter token do header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Verificar formato do token
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  // Verificar validade do token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn('Token inválido:', err);
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.userId = decoded.id;
    return next();
  });
};

module.exports = authMiddleware; 