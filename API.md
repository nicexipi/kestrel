# Documentação da API do Kestrel

## Autenticação

Todas as rotas protegidas requerem um token JWT no header `Authorization` no formato `Bearer <token>`.

### POST /api/auth/register
Registra um novo utilizador.

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "bggUsername": "string (opcional)"
}
```

**Response (201):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "token": "string"
}
```

### POST /api/auth/login
Autentica um utilizador.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "token": "string"
}
```

### POST /api/auth/refresh
Renova o token de acesso.

**Request:** Requer cookie `refreshToken`

**Response (200):**
```json
{
  "token": "string"
}
```

## Jogos

### GET /api/games
Lista os jogos do utilizador.

**Query Parameters:**
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 20)
- `sort`: campo para ordenação
- `order`: asc ou desc

**Response (200):**
```json
{
  "items": [
    {
      "id": "string",
      "bggId": "number",
      "name": "string",
      "yearPublished": "number",
      "imageUrl": "string",
      "description": "string",
      "minPlayers": "number",
      "maxPlayers": "number",
      "playingTime": "number",
      "weight": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

### POST /api/games/bgg/import/:username
Importa a coleção do BGG.

**Response (200):**
```json
{
  "message": "string",
  "imported": "number"
}
```

## Comparações

### GET /api/comparisons/next
Obtém o próximo par de jogos para comparação.

**Query Parameters:**
- `dimensionId`: ID da dimensão

**Response (200):**
```json
{
  "gameA": {
    "id": "string",
    "name": "string",
    "imageUrl": "string"
  },
  "gameB": {
    "id": "string",
    "name": "string",
    "imageUrl": "string"
  },
  "dimension": {
    "id": "string",
    "name": "string"
  }
}
```

### POST /api/comparisons
Submete uma comparação.

**Request:**
```json
{
  "gameAId": "string",
  "gameBId": "string",
  "dimensionId": "string",
  "chosenGameId": "string"
}
```

**Response (200):**
```json
{
  "message": "string",
  "nextComparison": {
    // Mesmo formato do GET /comparisons/next
  }
}
```

## Rankings

### GET /api/rankings/:userId
Obtém o ranking atual.

**Query Parameters:**
- `dimensionId`: ID da dimensão (opcional)
- `format`: "json" ou "csv"

**Response (200):**
```json
{
  "rankings": [
    {
      "position": "number",
      "game": {
        "id": "string",
        "name": "string",
        "imageUrl": "string"
      },
      "score": "number",
      "dimensionScores": [
        {
          "dimensionId": "string",
          "dimensionName": "string",
          "score": "number"
        }
      ]
    }
  ]
}
```

## Dimensões

### GET /api/dimensions
Lista todas as dimensões.

**Response (200):**
```json
{
  "dimensions": [
    {
      "id": "string",
      "name": "string",
      "defaultWeight": "number",
      "isMandatory": "boolean"
    }
  ]
}
```

### POST /api/dimensions
Cria uma nova dimensão.

**Request:**
```json
{
  "name": "string",
  "defaultWeight": "number",
  "isMandatory": "boolean"
}
```

**Response (201):**
```json
{
  "id": "string",
  "name": "string",
  "defaultWeight": "number",
  "isMandatory": "boolean"
}
```

## Sincronização

### GET /api/sync/status
Obtém o status da sincronização.

**Response (200):**
```json
{
  "status": "string",
  "lastSync": "string",
  "nextScheduledSync": "string",
  "collectionStats": {
    "total": "number",
    "owned": "number",
    "prevOwned": "number",
    "wanted": "number"
  }
}
```

### POST /api/sync/force
Força uma sincronização manual.

**Response (200):**
```json
{
  "message": "string",
  "status": "string",
  "startTime": "string"
}
```

## Códigos de Erro

- `400`: Requisição inválida
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `409`: Conflito
- `429`: Muitas requisições
- `500`: Erro interno do servidor

## Rate Limiting

- Autenticação: 5 tentativas a cada 15 minutos
- API do BGG: 30 requisições a cada 15 minutos
- API geral: 100 requisições a cada 15 minutos 