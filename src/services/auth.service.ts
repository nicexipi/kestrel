import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3003/api',
      timeout: 5000,
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', credentials);
      logger.info(`Usuário ${credentials.email} autenticado com sucesso`);
      return response.data;
    } catch (error) {
      logger.error('Erro na autenticação:', { error, email: credentials.email });
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.api.post('/auth/validate', { token });
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
