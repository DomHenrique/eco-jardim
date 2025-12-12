#!/bin/bash

# Script para build e push da imagem Docker para o Docker Hub
# Repositório: domhenrique/eco-jardim

set -e  # Para o script se houver erro

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Build e Push Docker Image ===${NC}"

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}Erro: Arquivo .env.local não encontrado!${NC}"
    echo "Crie o arquivo .env.local com as variáveis necessárias:"
    echo "  VITE_SUPABASE_URL=sua_url"
    echo "  VITE_SUPABASE_ANON_KEY=sua_key"
    echo "  GEMINI_API_KEY=sua_api_key"
    exit 1
fi

# Carregar variáveis de ambiente
source .env.local

# Verificar se as variáveis estão definidas
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Erro: Variáveis de ambiente não definidas!${NC}"
    exit 1
fi

# Definir tag (padrão: latest, ou usar argumento)
TAG=${1:-latest}
IMAGE_NAME="domhenrique/eco-jardim:$TAG"

echo -e "${GREEN}Tag da imagem: $TAG${NC}"

# 1. Login no Docker Hub (se necessário)
echo -e "${BLUE}1. Fazendo login no Docker Hub...${NC}"
docker login

# 2. Build da imagem
echo -e "${BLUE}2. Construindo a imagem Docker...${NC}"
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  --build-arg GEMINI_API_KEY="$GEMINI_API_KEY" \
  -t "$IMAGE_NAME" \
  .

# 3. Também criar tag 'latest' se não for a tag principal
if [ "$TAG" != "latest" ]; then
    echo -e "${BLUE}3. Criando tag adicional 'latest'...${NC}"
    docker tag "$IMAGE_NAME" "domhenrique/eco-jardim:latest"
fi

# 4. Push da imagem
echo -e "${BLUE}4. Enviando imagem para Docker Hub...${NC}"
docker push "$IMAGE_NAME"

if [ "$TAG" != "latest" ]; then
    docker push "domhenrique/eco-jardim:latest"
fi

echo -e "${GREEN}✅ Sucesso! Imagem publicada:${NC}"
echo -e "${GREEN}   - $IMAGE_NAME${NC}"
if [ "$TAG" != "latest" ]; then
    echo -e "${GREEN}   - domhenrique/eco-jardim:latest${NC}"
fi

echo ""
echo -e "${BLUE}Para usar a imagem:${NC}"
echo -e "  docker pull $IMAGE_NAME"
echo -e "  docker run -p 80:80 $IMAGE_NAME"
