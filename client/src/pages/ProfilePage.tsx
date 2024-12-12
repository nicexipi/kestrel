import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
}

export const ProfilePage = (): JSX.Element => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get<UserProfile>('/api/user/profile');
      setProfile(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar o perfil do utilizador',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Não foi possível carregar o perfil do utilizador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Perfil do Utilizador</h1>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">{profile.username}</h3>
          <p className="text-sm text-muted-foreground mt-2">Email: {profile.email}</p>
          <p className="text-sm text-muted-foreground mt-2">Jogos Jogados: {profile.gamesPlayed}</p>
          <p className="text-sm text-muted-foreground mt-2">Jogos Ganhos: {profile.gamesWon}</p>
        </CardContent>
      </Card>
    </div>
  );
}; 