# Guia de Contribuição

Obrigado por considerar contribuir para o Kestrel! Este documento fornece diretrizes e informações importantes para contribuidores.

## 🌟 Como Contribuir

1. **Fork e Clone**
   ```bash
   git clone https://github.com/seu-usuario/kestrel.git
   cd kestrel
   ```

2. **Configurar Ambiente**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

3. **Criar Branch**
   ```bash
   git checkout -b feature/sua-feature
   ```

4. **Desenvolver**
   - Escreva código limpo e bem documentado
   - Siga as convenções do projeto
   - Adicione testes quando possível

5. **Testar**
   ```bash
   npm run lint
   npm test
   ```

6. **Commit**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   ```

7. **Push e Pull Request**
   ```bash
   git push origin feature/sua-feature
   ```

## 📝 Convenções

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Código

- Use TypeScript quando possível
- Siga o estilo do Prettier
- Mantenha a documentação atualizada
- Escreva testes para novas funcionalidades

### Pull Requests

- Descreva claramente as mudanças
- Referencie issues relacionadas
- Mantenha o escopo focado
- Inclua screenshots se relevante

## 🔍 Processo de Review

1. **Verificação Automática**
   - Lint passa
   - Testes passam
   - Build completa

2. **Review Manual**
   - Código limpo e legível
   - Documentação adequada
   - Segue padrões do projeto
   - Funcionalidade testada

3. **Feedback**
   - Construtivo e respeitoso
   - Focado em melhorias
   - Sugestões claras

## 📋 Checklist

Antes de submeter um PR, verifique:

- [ ] Código segue os padrões
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Commits seguem convenções
- [ ] Branch atualizada com main
- [ ] PR tem descrição clara
- [ ] Screenshots incluídos (se UI)

## 🐛 Reportando Bugs

1. **Verifique Issues Existentes**
   - Procure por issues similares
   - Evite duplicatas

2. **Crie Nova Issue**
   - Use o template fornecido
   - Seja específico
   - Inclua:
     - Passos para reproduzir
     - Comportamento esperado
     - Comportamento atual
     - Screenshots/logs
     - Ambiente (OS, browser, etc)

## 💡 Sugerindo Melhorias

1. **Descreva o Problema**
   - Explique a situação atual
   - Identifique pontos de melhoria

2. **Proponha Solução**
   - Seja específico
   - Considere impactos
   - Sugira implementação

## 🚀 Desenvolvimento Local

### Backend
```bash
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

### Base de Dados
```bash
# Criar migração
npx prisma migrate dev

# Visualizar dados
npx prisma studio
```

## 📚 Recursos

- [Documentação da API](./API.md)
- [Guia de Estilo](./docs/STYLE_GUIDE.md)
- [Arquitetura](./docs/ARCHITECTURE.md)

## ❓ Dúvidas

- Abra uma issue
- Contacte: support@kestrel.example.com
- Discord: [Servidor Kestrel](https://discord.gg/kestrel)

## 📜 Código de Conduta

- Seja respeitoso
- Mantenha discussões construtivas
- Foque em melhorar o projeto
- Ajude outros contribuidores

## 🙏 Agradecimentos

Agradecemos a todos os contribuidores que ajudam a fazer do Kestrel um projeto melhor! 