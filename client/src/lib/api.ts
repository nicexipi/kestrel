import axios, { AxiosResponse, AxiosError, AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  bggUsername?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface ApiError {
  message: string;
  status: number;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// Definir interface para o tipo de erro da API
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

// Definir interface para o request com _retry
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<unknown>>;

  private constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('api_cache');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as CacheItem<unknown>);
        });
        this.cleanup();
      }
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      localStorage.removeItem('api_cache');
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem('api_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.expiresIn) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp + item.expiresIn) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
    this.saveToStorage();
  }

  invalidate(pattern: string | RegExp): void {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }
}

// Criar instância do Axios com configurações base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const cache = CacheManager.getInstance();

// Interceptor de requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Verificar cache para GETs
    if (config.method?.toLowerCase() === 'get' && config.url) {
      const cacheKey = `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        const customAdapter: AxiosAdapter = () => Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: config.headers,
          config,
        });
        config.adapter = customAdapter;
      }
    }

    return config;
  },
  (error: unknown): Promise<never> => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    // Cachear respostas GET
    if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
      const cacheKey = `${response.config.url}${response.config.params ? JSON.stringify(response.config.params) : ''}`;
      cache.set(cacheKey, response.data);
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequest;

    // Tratar erro 401 (Não autorizado)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest) {
        originalRequest._retry = true;
      }

      // Se o token expirou, fazer logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Tratar erro 403 (Proibido)
    if (error.response?.status === 403) {
      const errorMessage = error.response.data?.error || "Você não tem permissão para realizar esta ação.";
      console.error("Acesso negado:", errorMessage);
    }

    // Tratar erro 429 (Rate Limit)
    if (error.response?.status === 429) {
      console.error("Muitas requisições: Por favor, aguarde um momento antes de tentar novamente.");
    }

    // Tratar erro 500 (Erro interno)
    if (error.response?.status !== undefined && error.response.status >= 500) {
      console.error("Erro no servidor: Ocorreu um erro inesperado. Tente novamente mais tarde.");
    }

    return Promise.reject(error);
  }
);

// Funções de API
export const authApi = {
  login: (data: { email: string; password: string }): Promise<AxiosResponse<AuthResponse>> => {
    cache.invalidate(/^\/api\//); // Limpar todo o cache no login
    return api.post('/auth/login', data);
  },
  
  register: (data: { name: string; email: string; password: string; bggUsername?: string }): Promise<AxiosResponse<AuthResponse>> => {
    cache.invalidate(/^\/api\//); // Limpar todo o cache no registro
    return api.post('/auth/register', data);
  },
  
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/profile'),
  
  logout: () => {
    cache.invalidate(/^\/api\//); // Limpar todo o cache no logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export const gamesApi = {
  importCollection: (username: string): Promise<AxiosResponse> => {
    cache.invalidate(/^\/api\/games/); // Limpar cache de jogos
    return api.post(`/games/bgg/import/${username}`);
  },
  
  getNextComparison: (dimensionId: string): Promise<AxiosResponse> =>
    api.get(`/comparisons/next?dimensionId=${dimensionId}`),
  
  submitComparison: (data: { 
    gameAId: string;
    gameBId: string;
    dimensionId: string;
    chosenGameId: string;
  }): Promise<AxiosResponse> => {
    cache.invalidate(/^\/api\/rankings/); // Limpar cache de rankings
    return api.post('/comparisons', data);
  },
  
  getRanking: (): Promise<AxiosResponse> =>
    api.get('/rankings'),

  getSyncStatus: (): Promise<AxiosResponse> =>
    api.get('/sync/status'),

  forceSyncCollection: (username: string): Promise<AxiosResponse> => {
    cache.invalidate(/^\/api\/games/); // Limpar cache de jogos
    return api.post('/sync/force', { username });
  },
};

export const profileApi = {
  getProfile: () => 
    api.get('/profile'),
  
  updateProfile: (data: { name: string; bggUsername?: string }) => {
    cache.invalidate(/^\/api\/profile/); // Limpar cache do perfil
    return api.put('/profile', data);
  },
};

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || 'Erro desconhecido',
      status: error.response?.status || 500,
    };
  }
  return {
    message: 'Erro desconhecido',
    status: 500,
  };
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const register = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post('/api/auth/logout');
  } catch (error) {
    throw handleApiError(error);
  }
};

export const checkAuth = async (): Promise<LoginResponse> => {
  try {
    const response = await axios.get<LoginResponse>('/api/auth/check');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Remover a diretiva @ts-expect-error e adicionar tipagem correta
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 