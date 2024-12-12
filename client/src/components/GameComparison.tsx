import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Game {
  id: string;
  name: string;
  image: string;
  description: string;
  yearPublished: number;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
}

interface ComparisonProps {
  dimensionId: string;
  dimensionName: string;
  onComparisonComplete: () => void;
}

interface ComparisonResponse {
  gameA: Game;
  gameB: Game;
}

export const GameComparison = ({
  dimensionId,
  dimensionName,
  onComparisonComplete,
}: ComparisonProps): JSX.Element => {
  const [games, setGames] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchGames = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get<ComparisonResponse>('/api/comparisons/next', {
        params: { dimensionId },
      });
      setGames(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar jogos',
        description: 'Não foi possível carregar os jogos para comparação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [dimensionId, toast]);

  const handleChoice = async (chosenGameId: string): Promise<void> => {
    if (!games) return;

    try {
      await axios.post('/api/comparisons', {
        gameAId: games.gameA.id,
        gameBId: games.gameB.id,
        dimensionId,
        chosenGameId,
      });

      onComparisonComplete();
      fetchGames();
    } catch (error) {
      toast({
        title: 'Erro ao registar escolha',
        description: 'Não foi possível salvar sua escolha',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!games) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Não há mais jogos para comparar nesta dimensão.
        </p>
      </div>
    );
  }

  const renderGame = (game: Game, onClick: () => void): JSX.Element => (
    <Card
      className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="aspect-square relative mb-4">
          <img
            src={game.image}
            alt={game.name}
            className="object-contain w-full h-full"
          />
        </div>
        <h3 className="text-lg font-semibold mb-2">{game.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {game.yearPublished} • {game.minPlayers}-{game.maxPlayers} jogadores • {game.playingTime} min
        </p>
        <Button className="w-full">Escolher</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Qual jogo é melhor em termos de {dimensionName.toLowerCase()}?
        </h2>
        <p className="text-sm text-muted-foreground">
          Clique no jogo que você considera superior nesta dimensão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderGame(games.gameA, () => handleChoice(games.gameA.id))}
        {renderGame(games.gameB, () => handleChoice(games.gameB.id))}
      </div>
    </div>
  );
}; 