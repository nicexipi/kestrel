# Imagem base
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache openssl openssl-dev

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências do servidor
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências do servidor
RUN npm ci

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Gerar cliente Prisma
RUN npx prisma generate

# Configurar cliente
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

# Construir cliente
COPY client/ ./
RUN npm run build

# Voltar para o diretório principal
WORKDIR /app

# Copiar resto do código fonte do servidor
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"] 