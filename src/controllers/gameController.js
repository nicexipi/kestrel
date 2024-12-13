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

// Listar jogos
const listGames = async (req, res) => {
  try {
    const { userId } = req;
    const { owned, wishlist, page = 1, limit = 20, search } = req.query;

    const where = {};
    
    if (owned === 'true' || wishlist === 'true') {
      where.userGames = {
        some: {
          userId,
          ...(owned === 'true' && { own: true }),
          ...(wishlist === 'true' && { wishlist: true })
        }
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          userGames: {
            where: { userId },
            select: {
              own: true,
              wishlist: true,
              userRating: true,
              numPlays: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          mechanics: {
            include: {
              mechanic: true
            }
          }
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.game.count({ where })
    ]);

    res.json({
      games,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar jogos:', error);
    res.status(500).json({ error: 'Erro ao listar jogos' });
  }
};

// Obter jogo por ID
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const game = await prisma.game.findUnique({
      where: { id: parseInt(id) },
      include: {
        userGames: {
          where: { userId },
          select: {
            own: true,
            wishlist: true,
            userRating: true,
            numPlays: true,
            userComment: true
          }
        },
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
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json(game);
  } catch (error) {
    console.error('Erro ao obter jogo:', error);
    res.status(500).json({ error: 'Erro ao obter jogo' });
  }
};

// Atualizar jogo
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, yearPublished, minPlayers, maxPlayers, playtime, imageUrl, complexity } = req.body;

    const game = await prisma.game.update({
      where: { id: parseInt(id) },
      data: {
        name,
        yearPublished,
        minPlayers,
        maxPlayers,
        playtime,
        imageUrl,
        complexity
      }
    });

    res.json(game);
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    res.status(500).json({ error: 'Erro ao atualizar jogo' });
  }
};

// Apagar jogo
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.game.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Jogo apagado com sucesso' });
  } catch (error) {
    console.error('Erro ao apagar jogo:', error);
    res.status(500).json({ error: 'Erro ao apagar jogo' });
  }
};

module.exports = {
  searchBGGGames,
  importBGGCollection,
  createGame,
  listGames,
  getGameById,
  updateGame,
  deleteGame
}; 