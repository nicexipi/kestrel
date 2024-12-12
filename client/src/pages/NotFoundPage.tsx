import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dice6Icon, HomeIcon } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Dice6Icon className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-4xl font-bold">Página não encontrada</h1>
          <p className="text-muted-foreground">
            Parece que você rolou um dado errado e caiu em uma página que não existe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <HomeIcon className="h-4 w-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/compare">
              <Dice6Icon className="h-4 w-4 mr-2" />
              Comparar jogos
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Erro 404 - Página não encontrada</p>
        </div>
      </div>
    </div>
  );
}; 