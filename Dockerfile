# Imagem base
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache openssl openssl-dev

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"] 