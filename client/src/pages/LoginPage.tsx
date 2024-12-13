import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-hooks';
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A password deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = (): JSX.Element => {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      console.log('Usuário já autenticado, redirecionando...', user);
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      console.log('Iniciando tentativa de login...', { email: data.email });
      await login(data.email, data.password);
      console.log('Login bem-sucedido');
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      
      setError('root', {
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
      });

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        Object.keys(serverErrors).forEach((field) => {
          if (field in loginSchema.shape) {
            setError(field as keyof LoginFormData, {
              message: serverErrors[field],
            });
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Entrar no Kestrel
          </CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e password para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                aria-describedby="email-error"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p 
                  id="email-error"
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                aria-describedby="password-error"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p 
                  id="password-error"
                  className="text-sm text-destructive"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div 
                role="alert"
                className="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
              >
                {errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Ainda não tem uma conta?{' '}
            <Button
              variant="link"
              className="text-sm hover:text-primary"
              asChild
            >
              <Link to="/register">Registre-se</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}; 