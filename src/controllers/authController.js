const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

// Função auxiliar para gerar tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m' // Token de acesso expira em 15 minutos
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // Refresh token expira em 7 dias
  });

  return { accessToken, refreshToken };
};

// Registro de novo utilizador
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Guardar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    });

    // Configurar cookie seguro para o refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: accessToken
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registar utilizador' });
  }
};

// Login de utilizador
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Guardar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Configurar cookie seguro
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: accessToken
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Refresh token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    // Verificar se o token existe e é válido
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() },
        revoked: false
      }
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    try {
      // Verificar assinatura do token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Gerar novo access token
      const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ token: accessToken });
    } catch (err) {
      // Revogar token se inválido
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      });
      
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
  } catch (error) {
    logger.error('Erro no refresh:', error);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Revogar refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    }

    // Limpar cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout
}; 