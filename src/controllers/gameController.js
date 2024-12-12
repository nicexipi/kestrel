const { PrismaClient } = require('@prisma/client');
const bggService = require('../services/bggService');

const prisma = new PrismaClient();

// Buscar jogos no BGG
const searchBGGGames = async (req, res) => {
  try {
    const { query, exact } = req.query;
    const games = await bggService.searchGames(query, exact === 'true');
    res.json(games);
  } catch (error) {
    console.error('Erro na busca BGG:', error);
    res.status(500).json({ error: 'Erro ao buscar jogos no BGG' });
  }
};

// Importar coleção do BGG
const importBGGCollection = async (req, res) => {
  try {
    const { username } = req.params;
    const { userId } = req;
    const { 
      own = true, 
      want = false, 
      wantToPlay = false, 
      wantToBuy = false, 
      wishlist = false, 
      preordered = false, 
      forTrade = false 
    } = req.query;

    // Buscar coleção com os filtros especificados
    const collection = await bggService.getUserCollection(username, {
      own,
      want,
      wantToPlay,
      wantToBuy,
      wishlist,
      preordered,
      forTrade
    });

    const importedGames = [];
    const errors = [];

    for (const item of collection) {
      try {
        // Buscar detalhes completos do jogo
        const gameDetails = await bggService.getGameDetails(item.id);
        
        // Criar ou atualizar o jogo no banco de dados
        const game = await prisma.game.upsert({
          where: { bggId: parseInt(item.id) },
          update: {
            name: gameDetails.name,
            yearPublished: gameDetails.yearPublished,
            minPlayers: gameDetails.minPlayers,
            maxPlayers: gameDetails.maxPlayers,
            playtime: `${gameDetails.playingTime} min`,
            imageUrl: gameDetails.image,
            complexity: gameDetails.stats.averageWeight
          },
          create: {
            bggId: parseInt(item.id),
            name: gameDetails.name,
            yearPublished: gameDetails.yearPublished,
            minPlayers: gameDetails.minPlayers,
            maxPlayers: gameDetails.maxPlayers,
            playtime: `${gameDetails.playingTime} min`,
            imageUrl: gameDetails.image,
            complexity: gameDetails.stats.averageWeight
          }
        });

        // Adicionar à coleção do utilizador com estados
        await prisma.userGame.upsert({
          where: {
            userId_gameId: {
              userId,
              gameId: game.id
            }
          },
          update: {
            bggCollectionId: item.collectionId,
            own: item.status.own,
            prevOwned: item.status.prevOwned,
            forTrade: item.status.forTrade,
            want: item.status.want,
            wantToPlay: item.status.wantToPlay,
            wantToBuy: item.status.wantToBuy,
            wishlist: item.status.wishlist,
            wishlistPriority: item.status.wishlistPriority,
            preordered: item.status.preordered,
            userRating: item.rating.userRating,
            userComment: item.rating.userComment,
            numPlays: item.numPlays,
            lastSync: new Date()
          },
          create: {
            userId,
            gameId: game.id,
            bggCollectionId: item.collectionId,
            own: item.status.own,
            prevOwned: item.status.prevOwned,
            forTrade: item.status.forTrade,
            want: item.status.want,
            wantToPlay: item.status.wantToPlay,
            wantToBuy: item.status.wantToBuy,
            wishlist: item.status.wishlist,
            wishlistPriority: item.status.wishlistPriority,
            preordered: item.status.preordered,
            userRating: item.rating.userRating,
            userComment: item.rating.userComment,
            numPlays: item.numPlays,
            lastSync: new Date()
          }
        });

        // Processar categorias
        for (const category of gameDetails.categories) {
          const dbCategory = await prisma.gameCategory.upsert({
            where: { name: category.value },
            update: {},
            create: { name: category.value }
          });

          await prisma.gameCategoryAssignment.upsert({
            where: {
              gameId_categoryId: {
                gameId: game.id,
                categoryId: dbCategory.id
              }
            },
            update: {},
            create: {
              gameId: game.id,
              categoryId: dbCategory.id
            }
          });
        }

        // Processar mecânicas
        for (const mechanic of gameDetails.mechanics) {
          const dbMechanic = await prisma.gameMechanic.upsert({
            where: { name: mechanic.value },
            update: {},
            create: { name: mechanic.value }
          });

          await prisma.gameMechanicAssignment.upsert({
            where: {
              gameId_mechanicId: {
                gameId: game.id,
                mechanicId: dbMechanic.id
              }
            },
            update: {},
            create: {
              gameId: game.id,
              mechanicId: dbMechanic.id
            }
          });
        }

        // Processar designers
        for (const designer of gameDetails.designers) {
          const dbAuthor = await prisma.gameAuthor.upsert({
            where: { name: designer.value },
            update: {},
            create: { name: designer.value }
          });

          await prisma.gameAuthorAssignment.upsert({
            where: {
              gameId_authorId_role: {
                gameId: game.id,
                authorId: dbAuthor.id,
                role: 'designer'
              }
            },
            update: {},
            create: {
              gameId: game.id,
              authorId: dbAuthor.id,
              role: 'designer'
            }
          });
        }

        importedGames.push({
          ...game,
          status: item.status,
          rating: item.rating
        });
      } catch (error) {
        console.error(`Erro ao importar jogo ${item.id}:`, error);
        errors.push({
          gameId: item.id,
          gameName: item.name,
          error: error.message
        });
      }
    }

    res.json({
      message: `${importedGames.length} jogos importados com sucesso`,
      errors: errors.length > 0 ? errors : undefined,
      games: importedGames
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    res.status(500).json({ error: 'Erro ao importar coleção do BGG' });
  }
};

// Criar novo jogo
const createGame = async (req, res) => {
  try {
    const { name, bggId } = req.body;
    let gameData = { name };

    if (bggId) {
      try {
        const bggData = await bggService.getGameDetails(bggId);
        gameData = {
          name: bggData.name,
          bggId: parseInt(bggId),
          yearPublished: bggData.yearPublished,
          minPlayers: bggData.minPlayers,
          maxPlayers: bggData.maxPlayers,
          playtime: `${bggData.playingTime} min`,
          imageUrl: bggData.image,
          complexity: bggData.stats.averageWeight
        };
      } catch (error) {
        console.error('Erro ao buscar dados do BGG:', error);
        // Continuar com os dados básicos se houver erro no BGG
      }
    }

    const game = await prisma.game.create({
      data: gameData
    });

    res.status(201).json(game);
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    res.status(500).json({ error: 'Erro ao criar jogo' });
  }
};

// Listar todos os jogos
const listGames = async (req, res) => {
  try {
    const { userId } = req;
    const games = await prisma.game.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        },
        mechanics: {
          include: {
            mechanic: true
          }
        },
        authors: {
          include: {
            author: true
          }
        },
        userGames: {
          where: {
            userId
          }
        }
      }
    });

    // Adicionar flag de propriedade
    const gamesWithOwnership = games.map(game => ({
      ...game,
      owned: game.userGames.length > 0
    }));

    res.json(gamesWithOwnership);
  } catch (error) {
    console.error('Erro ao listar jogos:', error);
    res.status(500).json({ error: 'Erro ao listar jogos' });
  }
};

// Buscar jogo por ID
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        mechanics: {
          include: {
            mechanic: true
          }
        },
        authors: {
          include: {
            author: true
          }
        },
        userGames: {
          where: {
            userId
          }
        },
        adjustedScores: {
          where: {
            userId
          },
          include: {
            dimension: true
          }
        },
        adjustedRankings: {
          where: {
            userId
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    // Adicionar informações de propriedade e pontuações
    const gameWithDetails = {
      ...game,
      owned: game.userGames.length > 0,
      scores: game.adjustedScores.reduce((acc, score) => {
        acc[score.dimension.name] = score.score;
        return acc;
      }, {}),
      ranking: game.adjustedRankings[0]?.rankPosition
    };

    res.json(gameWithDetails);
  } catch (error) {
    console.error('Erro ao buscar jogo:', error);
    res.status(500).json({ error: 'Erro ao buscar jogo' });
  }
};

// Atualizar jogo
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = {
      ...req.body,
      userId: req.user.id
    };

    // Se fornecido BGG ID, atualizar com dados do BGG
    if (updateData.bggId) {
      try {
        const bggData = await bggService.getGameDetails(updateData.bggId);
        updateData = {
          ...updateData,
          name: bggData.name,
          yearPublished: bggData.yearPublished,
          minPlayers: bggData.minPlayers,
          maxPlayers: bggData.maxPlayers,
          playtime: `${bggData.playingTime} min`,
          imageUrl: bggData.image,
          complexity: bggData.stats.averageWeight
        };
      } catch (error) {
        console.error('Erro ao buscar dados do BGG:', error);
        // Continuar com os dados fornecidos se houver erro no BGG
      }
    }

    const game = await prisma.game.update({
      where: { id },
      data: updateData
    });

    res.json(game);
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    res.status(500).json({ error: 'Erro ao atualizar jogo' });
  }
};

// Deletar jogo
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.game.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar jogo:', error);
    res.status(500).json({ error: 'Erro ao deletar jogo' });
  }
};

// Adicionar jogo à coleção do utilizador
const addGameToCollection = async (req, res) => {
  try {
    const { gameId } = req.body;
    const { userId } = req;

    const userGame = await prisma.userGame.create({
      data: {
        userId,
        gameId
      },
      include: {
        game: true
      }
    });

    res.status(201).json(userGame);
  } catch (error) {
    console.error('Erro ao adicionar jogo à coleção:', error);
    res.status(500).json({ error: 'Erro ao adicionar jogo à coleção' });
  }
};

// Remover jogo da coleção do utilizador
const removeGameFromCollection = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req;

    await prisma.userGame.delete({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover jogo da coleção:', error);
    res.status(500).json({ error: 'Erro ao remover jogo da coleção' });
  }
};

module.exports = {
  searchBGGGames,
  importBGGCollection,
  createGame,
  listGames,
  getGameById,
  updateGame,
  deleteGame,
  addGameToCollection,
  removeGameFromCollection
}; 