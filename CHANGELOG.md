# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-10

### Adicionado
- Sistema de autenticação com JWT e refresh token
- Integração com a API do BoardGameGeek
- Sistema de comparação de jogos
- Ranking personalizado por dimensões
- Exportação de dados em CSV
- Interface moderna com shadcn/ui
- Cache de requisições no frontend
- Sistema de logging com Winston
- Proteção contra CSRF e rate limiting
- Documentação completa da API

### Alterado
- Migração completa para TypeScript no frontend
- Refatoração do sistema de rotas
- Melhorias na UI/UX

### Corrigido
- Problemas de concorrência na sincronização
- Validação de dados inconsistente
- Erros de cache no frontend

## [0.2.0] - 2023-12-15

### Adicionado
- Primeira versão do frontend em React
- Sistema básico de autenticação
- Integração inicial com BGG
- Docker compose para desenvolvimento

### Alterado
- Estrutura do projeto reorganizada
- Melhorias na documentação

### Corrigido
- Problemas de CORS
- Erros na validação de dados

## [0.1.0] - 2023-11-01

### Adicionado
- Estrutura inicial do projeto
- Setup do Express.js
- Configuração do Prisma
- Rotas básicas da API
- Documentação inicial

[1.0.0]: https://github.com/seu-usuario/kestrel/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/seu-usuario/kestrel/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/seu-usuario/kestrel/releases/tag/v0.1.0 