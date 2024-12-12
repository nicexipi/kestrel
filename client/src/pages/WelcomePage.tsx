import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6Icon, Users2Icon, TrophyIcon } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-bold tracking-tight text-primary">
              Kestrel
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground">
              Ranking Personalizado de Jogos de Tabuleiro
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 py-8">
            {/* Features */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <Dice6Icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Compare Jogos</h3>
                <p className="text-sm text-muted-foreground">
                  Descubra suas preferências através de comparações simples
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <TrophyIcon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Ranking Pessoal</h3>
                <p className="text-sm text-muted-foreground">
                  Construa um ranking único baseado nas suas escolhas
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <Users2Icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Integração BGG</h3>
                <p className="text-sm text-muted-foreground">
                  Sincronize facilmente com sua coleção do BoardGameGeek
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link to="/register">
                  Criar Conta
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            <p>
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Termos de Uso
              </Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}; 