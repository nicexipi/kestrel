const helmet = require('helmet');
const csrf = require('csurf');
const cors = require('cors');

// Configuração do CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://kestrel.example.com'] // Substituir pelo domínio real em produção
    : ['http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600, // 10 minutos
};

// Configuração do Helmet
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://boardgamegeek.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
};

// Configuração do CSRF
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Middleware de segurança
const securityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  csrfProtection,
];

// Middleware para erros de CSRF
const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  res.status(403).json({
    error: 'Sessão inválida ou expirada. Por favor, recarregue a página.',
  });
};

module.exports = {
  securityMiddleware,
  handleCSRFError,
}; 