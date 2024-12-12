import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { DiceIcon } from 'lucide-react';

interface ApiError {
  error: string;
}

const setupSchema = z.object({
  bggUsername: z.string().min(1, 'Username BGG é obrigatório'),
});

type SetupFormData = z.infer<typeof setupSchema>;

export const SetupBGGPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupFormData): Promise<void> => {
    try {
      await axios.post<void>(`/api/games/bgg/import/${data.bggUsername}`);
      toast({
        title: "Sucesso",
        description: "Coleção importada com sucesso",
      });
      navigate('/compare');
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast({
        title: "Erro",
        description: error.response?.data?.error || 'Erro ao importar coleção',
        variant: "destructive",
      });
    }
  };

  const skipSetup = (): void => {
    navigate('/compare');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <DiceIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Configurar BoardGameGeek
          </CardTitle>
          <CardDescription className="text-center">
            Importe sua coleção do BoardGameGeek para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bggUsername" className="text-sm font-medium">
                Username BGG
              </label>
              <Input
                id="bggUsername"
                placeholder="Seu username no BoardGameGeek"
                {...register('bggUsername')}
                aria-describedby="bggUsername-error"
              />
              {errors.bggUsername && (
                <p 
                  id="bggUsername-error"
                  className="text-sm text-destructive"
                >
                  {errors.bggUsername.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A importar...' : 'Importar Coleção'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Button
              variant="ghost"
              onClick={skipSetup}
              className="text-sm hover:text-primary"
            >
              Configurar depois
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Você pode importar ou atualizar sua coleção a qualquer momento
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}; 