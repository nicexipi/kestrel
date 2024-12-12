import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

interface TermsSection {
  title: string;
  content: React.ReactNode;
}

export const TermsPage: React.FC = () => {
  const sections: TermsSection[] = [
    {
      title: '1. Aceitação dos Termos',
      content: (
        <p>
          Ao utilizar o Kestrel, você concorda com os &ldquo;Termos de Serviço&rdquo; aqui apresentados.
          Se não concordar com algum destes termos, não utilize este serviço.
        </p>
      ),
    },
    {
      title: '2. Descrição do Serviço',
      content: (
        <>
          <p>
            O Kestrel é uma plataforma de ranking personalizado de jogos de tabuleiro que permite aos utilizadores:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Importar sua coleção do BoardGameGeek</li>
            <li>Criar rankings personalizados</li>
            <li>Comparar jogos em diferentes dimensões</li>
            <li>Exportar dados da sua coleção</li>
          </ul>
        </>
      ),
    },
    {
      title: '3. Conta do Utilizador',
      content: (
        <>
          <p>
            Para utilizar o Kestrel, é necessário criar uma conta. Você é responsável por:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Manter a confidencialidade da sua password</li>
            <li>Todas as atividades que ocorrem na sua conta</li>
            <li>Notificar-nos imediatamente de qualquer uso não autorizado</li>
          </ul>
        </>
      ),
    },
    {
      title: '4. Propriedade Intelectual',
      content: (
        <p>
          O Kestrel respeita os direitos de propriedade intelectual do BoardGameGeek e outros.
          Os dados dos jogos são fornecidos através da API pública do BoardGameGeek.
        </p>
      ),
    },
    {
      title: '5. Limitação de Responsabilidade',
      content: (
        <p>
          O Kestrel é fornecido "como está", sem garantias de qualquer tipo.
          Não nos responsabilizamos por quaisquer danos decorrentes do uso do serviço.
        </p>
      ),
    },
    {
      title: '6. Modificações',
      content: (
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento.
          As alterações entram em vigor imediatamente após a publicação.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center space-y-2">
            <ScrollText className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-2xl">Termos de Uso</CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-slate max-w-none">
            {sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                {section.content}
              </section>
            ))}

            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 