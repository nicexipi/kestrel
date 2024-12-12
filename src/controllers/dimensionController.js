const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as dimensões
const listDimensions = async (req, res) => {
  try {
    const dimensions = await prisma.dimension.findMany({
      orderBy: {
        defaultWeight: 'desc'
      }
    });
    
    res.json(dimensions);
  } catch (error) {
    console.error('Erro ao listar dimensões:', error);
    res.status(500).json({ error: 'Erro ao listar dimensões' });
  }
};

module.exports = {
  listDimensions
}; 