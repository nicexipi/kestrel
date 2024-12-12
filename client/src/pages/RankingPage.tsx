import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export const RankingPage = (): JSX.Element => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRanking = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/games/ranking');
      if (!response.ok) {
        throw new Error('Erro ao carregar ranking');
      }
      const data = await response.json();
      setGames(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o ranking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const handleCompareClick = (): void => {
    navigate('/compare');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Ranking de Jogos</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompareClick}
            >
              Comparar
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {games.map((game, index) => (
          <Card key={game.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    #{index + 1}
                  </span>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">
                    {game.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Pontuação:
                      </span>
                      <span className="ml-2 font-medium">
                        {game.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {games.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-lg text-muted-foreground">
            Nenhum jogo encontrado no ranking.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Faça algumas comparações para começar a construir seu ranking!
          </p>
        </div>
      )}
    </div>
  );
}; 