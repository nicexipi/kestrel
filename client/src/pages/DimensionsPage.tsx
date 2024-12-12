import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface Dimension {
  id: string;
  name: string;
  description: string;
}

export const DimensionsPage = (): JSX.Element => {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchDimensions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get<Dimension[]>('/api/dimensions');
      setDimensions(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dimensões',
        description: 'Não foi possível carregar as dimensões',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDimensions();
  }, [fetchDimensions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Dimensões</h1>
      </header>

      <div className="grid gap-4">
        {dimensions.map((dimension) => (
          <Card key={dimension.id} className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">
                {dimension.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {dimension.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dimensions.length === 0 && !isLoading && (
        <div className="text-center p-8">
          <p className="text-lg text-muted-foreground">
            Nenhuma dimensão encontrada.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Crie algumas dimensões para começar a comparar jogos!
          </p>
        </div>
      )}
    </div>
  );
}; 