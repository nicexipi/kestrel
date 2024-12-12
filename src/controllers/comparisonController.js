const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Constantes para cálculos
const DECAY_FACTOR = 0.01; // λ para decaimento temporal
const DEFAULT_INITIAL_SCORE = 5.5;
const TIME_WEIGHT = 0.6; // Peso para o fator tempo (60%)
const COMPARISON_WEIGHT = 0.4; // Peso para o fator número de comparações (40%)

// Função auxiliar para calcular o fator de decaimento temporal
const calculateTemporalDecay = (daysAgo) => {
  return Math.exp(-DECAY_FACTOR * daysAgo);
};

// Função auxiliar para normalizar pontuações
const normalizeScores = (scores) => {
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  
  return scores.map(score => {
    if (max === min) return 5.5; // Valor médio se todos forem iguais
    return 1 + (9 * (score - min) / (max - min));
  });
};

// Função auxiliar para calcular prioridade de seleção
const calculateSelectionPriority = (comparisonsCount, lastComparisonDate) => {
  const now = new Date();
  const daysAgo = lastComparisonDate 
    ? (now - new Date(lastComparisonDate)) / (1000 * 60 * 60 * 24)
    : Number.MAX_SAFE_INTEGER; // Se nunca foi comparado, máxima prioridade temporal
  
  // Normalizar os fatores para escala 0-1
  const timeScore = Math.min(daysAgo / 30, 1); // Normaliza para 30 dias
  const comparisonScore = Math.exp(-comparisonsCount / 5); // Decaimento exponencial baseado no número de comparações
  
  // Combinar os fatores com seus pesos
  return (timeScore * TIME_WEIGHT) + (comparisonScore * COMPARISON_WEIGHT);
};

// Obter jogos para comparação
const getGamesForComparison = async (req, res) => {
  try {
    const { userId, dimensionId } = req.query;

    // Buscar jogos da coleção do utilizador
    const userGames = await prisma.userGame.findMany({
      where: { userId },
      include: { game: true }
    });

    if (userGames.length < 2) {
      return res.status(400).json({ error: 'Necessário pelo menos 2 jogos para comparação' });
    }

    // Buscar informações de comparação para cada jogo
    const gamesWithPriority = await Promise.all(
      userGames.map(async (ug) => {
        // Contar número total de comparações
        const comparisons = await prisma.comparison.count({
          where: {
            OR: [
              { gameAId: ug.gameId },
              { gameBId: ug.gameId }
            ],
            dimensionId
          }
        });

        // Buscar data da última comparação
        const lastComparison = await prisma.comparison.findFirst({
          where: {
            OR: [
              { gameAId: ug.gameId },
              { gameBId: ug.gameId }
            ],
            dimensionId
          },
          orderBy: {
            comparisonDate: 'desc'
          }
        });

        const priority = calculateSelectionPriority(
          comparisons,
          lastComparison?.comparisonDate
        );

        return {
          ...ug.game,
          comparisons,
          lastComparisonDate: lastComparison?.comparisonDate,
          priority
        };
      })
    );

    // Ordenar por prioridade (maior para menor) e selecionar os dois primeiros
    gamesWithPriority.sort((a, b) => b.priority - a.priority);
    const [gameA, gameB] = gamesWithPriority.slice(0, 2);

    // Adicionar informações de diagnóstico na resposta
    res.json({
      gameA: {
        ...gameA,
        diagnostics: {
          comparisons: gameA.comparisons,
          lastComparison: gameA.lastComparisonDate,
          priority: gameA.priority
        }
      },
      gameB: {
        ...gameB,
        diagnostics: {
          comparisons: gameB.comparisons,
          lastComparison: gameB.lastComparisonDate,
          priority: gameB.priority
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter jogos para comparação:', error);
    res.status(500).json({ error: 'Erro ao obter jogos para comparação' });
  }
};

// Registrar uma comparação
const submitComparison = async (req, res) => {
  try {
    const { userId, gameAId, gameBId, chosenGameId, dimensionId } = req.body;

    // Registrar a comparação
    const comparison = await prisma.comparison.create({
      data: {
        userId,
        gameAId,
        gameBId,
        chosenGameId,
        dimensionId
      }
    });

    // Atualizar pontuações
    await updateScores(userId, dimensionId);

    res.status(201).json(comparison);
  } catch (error) {
    console.error('Erro ao submeter comparação:', error);
    res.status(500).json({ error: 'Erro ao submeter comparação' });
  }
};

// Função auxiliar para atualizar pontuações
const updateScores = async (userId, dimensionId) => {
  // Buscar todas as comparações do utilizador para esta dimensão
  const comparisons = await prisma.comparison.findMany({
    where: {
      userId,
      dimensionId
    },
    orderBy: {
      comparisonDate: 'desc'
    }
  });

  // Calcular pontuações para cada jogo
  const gameScores = new Map();
  const gameFrequency = new Map();

  comparisons.forEach(comp => {
    const now = new Date();
    const daysAgo = (now - comp.comparisonDate) / (1000 * 60 * 60 * 24);
    const decayFactor = calculateTemporalDecay(daysAgo);

    // Incrementar frequência
    gameFrequency.set(comp.gameAId, (gameFrequency.get(comp.gameAId) || 0) + 1);
    gameFrequency.set(comp.gameBId, (gameFrequency.get(comp.gameBId) || 0) + 1);

    // Atualizar pontuações
    if (comp.chosenGameId === comp.gameAId) {
      gameScores.set(comp.gameAId, (gameScores.get(comp.gameAId) || 0) + (1 * decayFactor));
      gameScores.set(comp.gameBId, (gameScores.get(comp.gameBId) || 0));
    } else if (comp.chosenGameId === comp.gameBId) {
      gameScores.set(comp.gameAId, (gameScores.get(comp.gameAId) || 0));
      gameScores.set(comp.gameBId, (gameScores.get(comp.gameBId) || 0) + (1 * decayFactor));
    } else {
      // Empate
      gameScores.set(comp.gameAId, (gameScores.get(comp.gameAId) || 0) + (0.5 * decayFactor));
      gameScores.set(comp.gameBId, (gameScores.get(comp.gameBId) || 0) + (0.5 * decayFactor));
    }
  });

  // Normalizar pontuações
  const gameIds = Array.from(gameScores.keys());
  const scores = Array.from(gameScores.values());
  const normalizedScores = normalizeScores(scores);

  // Atualizar pontuações no banco de dados
  await Promise.all(
    gameIds.map(async (gameId, index) => {
      await prisma.adjustedScore.upsert({
        where: {
          userId_gameId_dimensionId: {
            userId,
            gameId,
            dimensionId
          }
        },
        update: {
          score: normalizedScores[index],
          frequency: gameFrequency.get(gameId)
        },
        create: {
          userId,
          gameId,
          dimensionId,
          score: normalizedScores[index],
          frequency: gameFrequency.get(gameId)
        }
      });
    })
  );

  // Atualizar rankings
  await updateRankings(userId);
};

// Função auxiliar para atualizar rankings
const updateRankings = async (userId) => {
  // Buscar todas as dimensões ativas
  const dimensions = await prisma.dimension.findMany();
  
  // Buscar todos os jogos do utilizador
  const userGames = await prisma.userGame.findMany({
    where: { userId },
    include: {
      game: true
    }
  });

  // Para cada jogo, calcular a pontuação final
  const finalScores = await Promise.all(
    userGames.map(async (userGame) => {
      const scores = await prisma.adjustedScore.findMany({
        where: {
          userId,
          gameId: userGame.gameId
        }
      });

      // Calcular média ponderada das dimensões
      let totalWeight = 0;
      let weightedScore = 0;

      dimensions.forEach(dim => {
        const score = scores.find(s => s.dimensionId === dim.id);
        if (score) {
          weightedScore += score.score * (dim.defaultWeight / 100);
          totalWeight += dim.defaultWeight / 100;
        }
      });

      const finalScore = totalWeight > 0 ? weightedScore / totalWeight : DEFAULT_INITIAL_SCORE;

      return {
        gameId: userGame.gameId,
        score: finalScore
      };
    })
  );

  // Ordenar por pontuação e atualizar rankings
  finalScores.sort((a, b) => b.score - a.score);
  
  await Promise.all(
    finalScores.map(async (score, index) => {
      await prisma.adjustedRanking.upsert({
        where: {
          userId_gameId: {
            userId,
            gameId: score.gameId
          }
        },
        update: {
          normalizedScore: score.score,
          rankPosition: index + 1
        },
        create: {
          userId,
          gameId: score.gameId,
          normalizedScore: score.score,
          rankPosition: index + 1
        }
      });
    })
  );
};

// Obter ranking atual
const getCurrentRanking = async (req, res) => {
  try {
    const { userId } = req.params;

    const ranking = await prisma.adjustedRanking.findMany({
      where: { userId },
      include: {
        game: true
      },
      orderBy: {
        rankPosition: 'asc'
      }
    });

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({ error: 'Erro ao obter ranking' });
  }
};

module.exports = {
  getGamesForComparison,
  submitComparison,
  getCurrentRanking
}; 