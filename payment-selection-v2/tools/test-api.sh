#!/bin/bash

# Script para testar a API do Payment Selection Backend
# Certifique-se de que a aplicação está rodando em http://localhost:8080

BASE_URL="http://localhost:8080"

echo "=== Testando API do Payment Selection Backend ==="
echo

# 1. Health Check
echo "1. Testando Health Check..."
curl -X GET "$BASE_URL/selections/health"
echo -e "\n"

# 2. Criar uma nova seleção
echo "2. Criando uma nova seleção..."
SELECTION_RESPONSE=$(curl -s -X POST "$BASE_URL/selections" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "status": "A_PAGAR",
      "vencimentoAte": "2024-12-31"
    },
    "mode": "NONE"
  }')

echo "Resposta: $SELECTION_RESPONSE"
echo

# Extrair o selectionId da resposta (usando jq se disponível, senão usar grep/sed)
if command -v jq &> /dev/null; then
    SELECTION_ID=$(echo "$SELECTION_RESPONSE" | jq -r '.selectionId')
else
    SELECTION_ID=$(echo "$SELECTION_RESPONSE" | grep -o '"selectionId":"[^"]*"' | cut -d'"' -f4)
fi

echo "Selection ID: $SELECTION_ID"
echo

# 3. Marcar itens específicos
echo "3. Marcando itens específicos (IDs 1, 2, 3)..."
curl -s -X PATCH "$BASE_URL/selections/$SELECTION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "includeIds": [1, 2, 3]
  }'
echo -e "\n"

# 4. Selecionar todos
echo "4. Selecionando todos os itens..."
curl -s -X PATCH "$BASE_URL/selections/$SELECTION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ALL"
  }'
echo -e "\n"

# 5. Excluir alguns itens
echo "5. Excluindo alguns itens (IDs 4, 5)..."
curl -s -X PATCH "$BASE_URL/selections/$SELECTION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "excludeIds": [4, 5]
  }'
echo -e "\n"

# 6. Aplicar pagamento (comentado para não alterar dados)
echo "6. Aplicando pagamento (descomentado para teste real)..."
echo "# curl -s -X POST \"$BASE_URL/selections/$SELECTION_ID/apply\" \\"
echo "#   -H \"Content-Type: application/json\" \\"
echo "#   -d '{ \"action\": \"PAY\" }'"
echo

echo "=== Teste concluído ==="
echo "Para executar o pagamento real, descomente a seção 6 no script."

