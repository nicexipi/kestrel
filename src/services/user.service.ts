import { prisma } from '../prisma';
import { hash, compare } from 'bcryptjs';
import { logger } from '../utils/logger';
import { authService } from './auth.service';

interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
  bggUsername?: string;
}

interface UserLoginInput {
  email: string;
  password: string;
}

class UserService {
  async register(input: UserRegistrationInput) {
    const { name, email, password, bggUsername } = input;
    const passwordHash = await hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          bggUsername,
        },
      });
      logger.info(`Usuário registrado: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Erro ao registrar usuário:', { error });
      throw new Error('Erro ao registrar usuário.');
    }
  }

  async login(input: UserLoginInput) {
    const { email, password } = input;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !(await compare(password, user.passwordHash))) {
        throw new Error('Credenciais inválidas.');
      }

      logger.info(`Usuário logado: ${user.email}`);
      return authService.generateToken(user);
    } catch (error) {
      logger.error('Erro ao fazer login:', { error });
      throw new Error('Erro ao fazer login.');
    }
  }
}

export const userService = new UserService();
