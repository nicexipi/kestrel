import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  username: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres'),
  bggUsername: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      const response = await axios.post('/api/auth/register', {
        name: data.username,
        email: data.email,
        password: data.password,
        bggUsername: data.bggUsername
      });
      localStorage.setItem('token', response.data.token);
      
      if (data.bggUsername) {
        navigate('/setup-bgg');
      } else {
        navigate('/compare');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('root', {
          message: error.response?.data?.error || 'Erro ao criar conta',
        });
      } else {
        setError('root', {
          message: 'Erro ao criar conta',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Junte-se ao Kestrel e descubra seus jogos favoritos
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome</Label>
              <Input
                id="username"
                type="text"
                {...register('username')}
                placeholder="Seu nome"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="seu.email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="********"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bggUsername">
                Username BGG (opcional)
              </Label>
              <Input
                id="bggUsername"
                type="text"
                {...register('bggUsername')}
                placeholder="Seu username no BoardGameGeek"
              />
              <p className="text-sm text-muted-foreground">
                Pode adicionar depois se preferir
              </p>
              {errors.bggUsername && (
                <p className="text-sm text-red-500">{errors.bggUsername.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-sm text-red-500">{errors.root.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              Criar Conta
            </Button>
            <p className="text-sm text-center">
              Já tem uma conta?{' '}
              <a
                href="/login"
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Faça login
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}; 