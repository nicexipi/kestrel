# Kestrel - Sistema de Ranking de Jogos de Tabuleiro

[![CI/CD](https://github.com/nicexipi/kestrel/actions/workflows/ci.yml/badge.svg)](https://github.com/nicexipi/kestrel/actions/workflows/ci.yml)

Sistema de classificação e ranking de jogos de tabuleiro usando análise comparativa.

## 🚀 Tecnologias

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Winston para logging
- Zod para validação
- Rate limiting e CSRF protection

### Frontend
- React.js com TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios com interceptors
- Cache local

### Integração
- BoardGameGeek API
- Docker
- GitHub Actions (em breve)

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL
- Docker (opcional, mas recomendado)
- Git

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd kestrel
```

2. Instale as dependências do backend:
```bash
npm install
```

3. Instale as dependências do frontend:
```bash
cd client
npm install
cd ..
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. Configure a base de dados:
```bash
# Crie a base de dados PostgreSQL
npx prisma migrate dev
```

6. Inicie o servidor de desenvolvimento:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🗄️ Estrutura do Projeto

```
kestrel/
├── src/                    # Código fonte do backend
│   ├── controllers/        # Controladores da API
│   ├── middleware/         # Middlewares Express
│   ├── routes/            # Rotas da API
│   ├── services/          # Serviços de negócio
│   └── utils/             # Utilitários
├── client/                # Código fonte do frontend
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos React
│   │   ├── lib/          # Utilitários e serviços
│   │   ├── pages/        # Páginas da aplicação
│   │   └── styles/       # Estilos CSS
│   └── public/           # Arquivos estáticos
├── prisma/               # Schema e migrações
└── docs/                # Documentação
```

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kestrel_db?schema=public"
DB_PASSWORD="your-password"

# JWT
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server
PORT=3000
NODE_ENV=development

# BGG API
BGG_API_BASE_URL="https://boardgamegeek.com/xmlapi2"
```

## 📦 Deploy

### Docker

1. Construa as imagens:
```bash
docker-compose build
```

2. Inicie os containers:
```bash
docker-compose up -d
```

### Manual

1. Construa o frontend:
```bash
cd client
npm run build
cd ..
```

2. Inicie o servidor:
```bash
npm start
```

## 🛠️ Desenvolvimento

### Comandos Úteis

```bash
# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Gerar cliente Prisma
npx prisma generate

# Visualizar base de dados
npx prisma studio

# Lint
npm run lint

# Testes (em breve)
npm test
```

### Convenções de Código

- Utilize TypeScript sempre que possível
- Siga o estilo do Prettier
- Commits seguem o padrão Conventional Commits
- Documentação em português de Portugal

## 📄 Documentação

- [API](./API.md)
- [Contribuição](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🔍 Features

- [x] Autenticação JWT com refresh token
- [x] Integração com BGG
- [x] Comparação de jogos
- [x] Ranking personalizado
- [x] Exportação CSV
- [x] Sincronização automática
- [x] Cache de requisições
- [ ] PWA
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Backup de dados

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Desenvolvedor Principal - [Seu Nome]
- [Lista de contribuidores](https://github.com/seu-usuario/kestrel/contributors)

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- Email: support@kestrel.example.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/kestrel/issues)
- Discord: [Servidor Kestrel](https://discord.gg/kestrel) 

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 