import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface PrivacySection {
  title: string;
  content: React.ReactNode;
}

export const PrivacyPage: React.FC = () => {
  const sections: PrivacySection[] = [
    {
      title: '1. Recolha de Dados',
      content: (
        <>
          <p>
            O Kestrel recolhe apenas os dados necessários para o funcionamento do serviço:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Nome e email para identificação</li>
            <li>Username do BoardGameGeek (opcional)</li>
            <li>Dados da sua coleção de jogos do BGG</li>
            <li>Suas comparações e preferências de jogos</li>
          </ul>
        </>
      ),
    },
    {
      title: '2. Utilização dos Dados',
      content: (
        <>
          <p>
            Os seus dados são utilizados para:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Manter e melhorar o serviço</li>
            <li>Gerar rankings personalizados</li>
            <li>Sincronizar com sua coleção do BGG</li>
            <li>Comunicar atualizações importantes</li>
          </ul>
        </>
      ),
    },
    {
      title: '3. Proteção de Dados',
      content: (
        <>
          <p>
            Implementamos medidas de segurança para proteger seus dados:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Encriptação de passwords</li>
            <li>Conexões seguras (HTTPS)</li>
            <li>Proteção contra ataques CSRF</li>
            <li>Rate limiting para prevenir abusos</li>
          </ul>
        </>
      ),
    },
    {
      title: '4. Cookies',
      content: (
        <>
          <p>
            Utilizamos cookies essenciais para:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Manter sua sessão</li>
            <li>Lembrar suas preferências</li>
            <li>Melhorar a performance</li>
          </ul>
        </>
      ),
    },
    {
      title: '5. Seus Direitos',
      content: (
        <>
          <p>
            Você tem o direito de:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Aceder aos seus dados</li>
            <li>Corrigir dados incorretos</li>
            <li>Exportar seus dados</li>
            <li>Solicitar a eliminação da sua conta</li>
          </ul>
        </>
      ),
    },
    {
      title: '6. Contacto',
      content: (
        <p>
          Para questões sobre privacidade, contacte-nos através do email:
          privacy@kestrel.example.com
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center space-y-2">
            <Shield className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
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