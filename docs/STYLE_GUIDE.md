# Guia de Estilo

## 📝 Princípios Gerais

1. **Clareza sobre Brevidade**
   - Código auto-documentado
   - Nomes descritivos
   - Funções pequenas e focadas

2. **Consistência**
   - Seguir padrões estabelecidos
   - Usar ferramentas de formatação
   - Manter convenções de nomenclatura

3. **Manutenibilidade**
   - Evitar duplicação
   - Modularizar código
   - Documentar decisões complexas

## 🔤 Nomenclatura

### Variáveis
```typescript
// ✅ Bom
const userCount = 5;
const isActive = true;
const firstName = 'João';

// ❌ Ruim
const cnt = 5;
const active = true;
const name = 'João';
```

### Funções
```typescript
// ✅ Bom
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

// ❌ Ruim
async function getUser(id: string): Promise<any> {
  // ...
}
```

### Classes
```typescript
// ✅ Bom
class UserAuthentication {
  private readonly tokenService: TokenService;
  
  async validateCredentials(email: string, password: string): Promise<boolean> {
    // ...
  }
}

// ❌ Ruim
class Auth {
  private svc: any;
  
  async check(e: string, p: string): Promise<boolean> {
    // ...
  }
}
```

### Interfaces
```typescript
// ✅ Bom
interface UserPreferences {
  theme: ThemePreference;
  language: Language;
  notifications: boolean;
}

// ❌ Ruim
interface IUserPrefs {
  t: string;
  l: string;
  n: boolean;
}
```

## 🏗️ Estrutura de Código

### Imports
```typescript
// ✅ Bom
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { formatDate } from '@/utils';
import styles from './styles.module.css';

// ❌ Ruim
import * as React from 'react';
import {User, Game, Collection} from '@/types';
import {formatDate, calculateScore, validateEmail} from '@/utils';
```

### Exports
```typescript
// ✅ Bom
export interface Config {
  // ...
}

export class ConfigService {
  // ...
}

// ❌ Ruim
interface Config {
  // ...
}
class ConfigService {
  // ...
}
export { Config, ConfigService };
```

## 📦 Organização de Arquivos

### Componentes React
```typescript
// UserProfile/index.tsx
export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className={styles.container}>
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}

// UserProfile/ProfileHeader.tsx
export function ProfileHeader({ user }: UserProfileProps) {
  // ...
}

// UserProfile/styles.module.css
.container {
  // ...
}
```

### Serviços
```typescript
// services/auth.service.ts
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}
  
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // ...
  }
}
```

## 🎨 CSS/Styling

### Classes
```css
/* ✅ Bom */
.button-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}

/* ❌ Ruim */
.btn1 {
  background-color: #007bff;
  padding: 10px;
}
```

### Variáveis
```css
/* ✅ Bom */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}

/* ❌ Ruim */
:root {
  --blue: #007bff;
  --gray: #6c757d;
  --s: 0.5rem;
  --m: 1rem;
}
```

## 📝 Comentários

### Documentação
```typescript
/**
 * Calcula o score ajustado baseado nas comparações do usuário
 * @param userId - ID do usuário
 * @param gameId - ID do jogo
 * @returns Score ajustado entre 0 e 10
 * @throws UserNotFoundError se usuário não existe
 */
async function calculateAdjustedScore(userId: string, gameId: string): Promise<number> {
  // ...
}
```

### Comentários em Linha
```typescript
// ✅ Bom
// Ajusta o score baseado no fator de confiança
const adjustedScore = score * confidenceFactor;

// ❌ Ruim
// Multiplica
const final = s * cf;
```

## 🧪 Testes

### Nomenclatura
```typescript
// ✅ Bom
describe('AuthService', () => {
  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      // ...
    });
    
    it('should throw error when credentials are invalid', async () => {
      // ...
    });
  });
});

// ❌ Ruim
describe('auth', () => {
  it('test1', async () => {
    // ...
  });
  
  it('test2', async () => {
    // ...
  });
});
```

### Arrange-Act-Assert
```typescript
// ✅ Bom
it('should calculate correct score', async () => {
  // Arrange
  const comparisons = mockComparisons();
  const service = new ScoreService();
  
  // Act
  const score = await service.calculateScore(comparisons);
  
  // Assert
  expect(score).toBe(8.5);
});
```

## 🔍 Logging

### Níveis
```typescript
// ✅ Bom
logger.error('Falha ao conectar à base de dados', { error });
logger.warn('Rate limit próximo do limite', { current, max });
logger.info('Usuário logado com sucesso', { userId });
logger.debug('Processando comparação', { gameA, gameB });

// ❌ Ruim
console.log('Erro:', error);
console.error(error);
```

### Contexto
```typescript
// ✅ Bom
logger.info('Iniciando sincronização BGG', {
  userId,
  username: bggUsername,
  lastSync,
  collectionSize
});

// ❌ Ruim
logger.info(`Sync started for ${userId}`);
```

## 🔒 Segurança

### Senhas e Secrets
```typescript
// ✅ Bom
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
const token = jwt.sign(payload, process.env.JWT_SECRET);

// ❌ Ruim
const hashedPassword = md5(password);
const token = jwt.sign(payload, 'my-secret-key');
```

### Validação
```typescript
// ✅ Bom
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// ❌ Ruim
if (email.includes('@')) {
  // válido
}
```

## 📦 Commits

### Mensagens
```bash
# ✅ Bom
feat(auth): adiciona refresh token
fix(api): corrige rate limiting
docs(readme): atualiza instruções de instalação

# ❌ Ruim
update code
fix bug
wip
```

## 📝 Notas Finais

1. **Code Review**
   - Seguir checklist
   - Feedback construtivo
   - Foco em qualidade

2. **Manutenção**
   - Refatorar regularmente
   - Atualizar dependências
   - Remover código morto

3. **Documentação**
   - Manter atualizada
   - Incluir exemplos
   - Explicar decisões
