import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/axios';
import { AuthContext, User } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar token ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, skipping auth check');
        return;
      }

      setIsLoading(true);
      console.log('Checking authentication...');

      try {
        const response = await api.get<{ user: User }>('/api/auth/profile');
        console.log('Auth check successful:', response.data);
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    console.log('Attempting login with email:', email);

    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Resposta inválida do servidor');
      }

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const logout = useCallback(async (): Promise<void> => {
    console.log('Logging out...');
    setIsLoading(true);
    
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Até breve!',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar o estado local
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
      navigate('/login');
    }
  }, [navigate, toast]);

  const register = useCallback(async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    console.log('Attempting registration for:', email);

    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/register', {
        name: username,
        email,
        password,
      });

      console.log('Registration response:', response.data);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Resposta inválida do servidor');
      }

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      toast({
        title: 'Conta criada com sucesso',
        description: 'Bem-vindo ao Kestrel!',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Erro ao criar conta';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro no registro',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const contextValue = {
    user,
    isLoading,
    login,
    logout,
    register,
  };

  console.log('Auth context state:', { user, isLoading });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 