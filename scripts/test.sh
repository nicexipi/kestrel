#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Executando testes..."

# Executa os testes com cobertura
npm run test:coverage

# Verifica o resultado
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    exit 1
fi

# Exibe o relatório de cobertura
echo -e "\n📊 Relatório de Cobertura:"
cat coverage/lcov-report/index.html | grep -A 4 "fraction"
