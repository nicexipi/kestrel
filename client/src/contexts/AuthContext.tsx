import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { AuthContext, User } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/compare');
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Email ou senha incorretos',
        variant: 'destructive',
      });
      throw error;
    }
  }, [navigate, toast]);

  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const register = useCallback(async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<{ token: string; user: User }>('/api/auth/register', {
        username,
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/compare');
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description: 'Não foi possível criar sua conta',
        variant: 'destructive',
      });
      throw error;
    }
  }, [navigate, toast]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 