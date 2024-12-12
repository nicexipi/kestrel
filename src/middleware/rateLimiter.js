const rateLimit = require('express-rate-limit');

// Configurações base para o rate limiter
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições, por favor tente novamente mais tarde',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
};

// Rate limiter para rotas de autenticação
const authLimiter = rateLimit({
  ...baseConfig,
  max: 5, // 5 tentativas a cada 15 minutos
  message: 'Muitas tentativas de login, por favor tente novamente mais tarde',
});

// Rate limiter para a API do BGG
const bggLimiter = rateLimit({
  ...baseConfig,
  max: 30, // 30 requisições a cada 15 minutos
  message: 'Limite de requisições ao BGG atingido, por favor tente novamente mais tarde',
});

// Rate limiter geral para a API
const apiLimiter = rateLimit({
  ...baseConfig,
  max: 100, // 100 requisições a cada 15 minutos
});

module.exports = {
  authLimiter,
  bggLimiter,
  apiLimiter,
}; 