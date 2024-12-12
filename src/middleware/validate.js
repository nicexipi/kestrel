const { z } = require('zod');

// Schemas de validação
const schemas = {
  auth: {
    register: z.object({
      name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string()
        .min(8, 'A password deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'A password deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'A password deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'A password deve conter pelo menos um número'),
      bggUsername: z.string().optional(),
    }),
    login: z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Password inválida'),
    }),
  },
  games: {
    import: z.object({
      username: z.string().min(1, 'Username BGG é obrigatório'),
    }),
    compare: z.object({
      gameAId: z.string().uuid('ID do jogo A inválido'),
      gameBId: z.string().uuid('ID do jogo B inválido'),
      dimensionId: z.string().uuid('ID da dimensão inválido'),
      chosenGameId: z.string().uuid('ID do jogo escolhido inválido'),
    }),
  },
};

// Middleware de validação
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validar o corpo da requisição
      const validatedData = await schema.parseAsync(req.body);
      
      // Substituir o corpo da requisição pelos dados validados
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatar erros do Zod
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Erro de validação',
          details: errors,
        });
      }
      
      // Outros erros
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  };
};

module.exports = {
  validate,
  schemas,
}; 