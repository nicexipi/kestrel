# Roadmap do Projeto Kestrel

## ✅ Funcionalidades Implementadas

### 1. Autenticação
- Registo de utilizadores
- Login/Logout
- Proteção de rotas
- Gestão de tokens JWT

### 2. Integração BGG
- Configuração da API do BGG
- Importação da coleção de jogos
- Sincronização de dados básicos dos jogos

### 3. Interface Base
- Layout principal com navegação
- Páginas base (Welcome, Login, Register, etc.)
- Sistema de notificações (toasts)
- Componentes UI reutilizáveis

### 4. Infraestrutura
- Base de dados configurada
- Sistema de logging
- Middleware de segurança
- Pipeline CI/CD

## 🚧 Funcionalidades Pendentes

### Fase 1 - MVP (Core)

#### 1. Sistema de Comparação
- [ ] Implementar lógica de seleção de jogos para comparação
- [ ] Algoritmo de ranking
- [ ] Sistema de pontuação
- [ ] Histórico de comparações

#### 2. Gestão de Dimensões
- [ ] CRUD de dimensões de avaliação
- [ ] Pesos personalizados por dimensão
- [ ] Interface de gestão de dimensões
- [ ] Validação de dimensões

#### 3. Rankings
- [ ] Geração de rankings baseados nas comparações
- [ ] Visualiza��ão de rankings por dimensão
- [ ] Exportação de rankings
- [ ] Histórico de alterações no ranking

#### 4. Perfil de Utilizador
- [ ] Edição de perfil
- [ ] Preferências de utilizador
- [ ] Estatísticas de uso
- [ ] Gestão da coleção

### Fase 2 - Melhorias

#### 5. Sincronização BGG Avançada
- [ ] Sincronização periódica automática
- [ ] Gestão de erros de sincronização
- [ ] Interface de progresso de sincronização
- [ ] Cache de dados do BGG

#### 6. Funcionalidades Sociais
- [ ] Partilha de rankings
- [ ] Comparação de rankings entre utilizadores
- [ ] Comentários em jogos
- [ ] Sistema de seguir utilizadores

#### 7. Análise e Estatísticas
- [ ] Dashboard com estatísticas
- [ ] Gráficos de evolução
- [ ] Análise de tendências
- [ ] Relatórios exportáveis

#### 8. Gestão de Jogos
- [ ] Edição manual de informações de jogos
- [ ] Adição de jogos não presentes no BGG
- [ ] Marcadores/tags personalizados
- [ ] Notas privadas

### Fase 3 - Polimento

#### 9. Melhorias de UX
- [ ] Feedback visual durante comparações
- [ ] Animações e transições
- [ ] Modo escuro
- [ ] Interface responsiva melhorada

#### 10. Funcionalidades Avançadas
- [ ] Sistema de achievements
- [ ] Recomendações baseadas em preferências
- [ ] Integração com outras plataformas
- [ ] API pública documentada

#### 11. Testes
- [ ] Testes unitários completos
- [ ] Testes de integração
- [ ] Testes end-to-end
- [ ] Testes de performance

#### 12. Documentação
- [ ] Manual do utilizador
- [ ] Documentação técnica detalhada
- [ ] Guias de contribuição expandidos
- [ ] Exemplos de uso da API

## Prioridades

1. **Fase 1 - MVP**: Funcionalidades essenciais para ter um produto utilizável
2. **Fase 2 - Melhorias**: Funcionalidades que melhoram a experiência do utilizador
3. **Fase 3 - Polimento**: Refinamentos e funcionalidades avançadas

## Notas
- Este roadmap é um documento vivo e será atualizado conforme o desenvolvimento avança
- As prioridades podem ser ajustadas com base no feedback dos utilizadores
- Cada funcionalidade será desenvolvida seguindo as melhores práticas de código e testes 