const helmet = require('helmet');
const csrf = require('csurf');
const cors = require('cors');

// Configuração do CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://kestrel.example.com'] // Substituir pelo domínio real em produção
    : ['http://localhost:3000', 'http://localhost:3003'],
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
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://rsms.me"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://rsms.me"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3003"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
};

// Middleware de segurança
const securityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
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