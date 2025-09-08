# Documentação da API - Payment Selection Backend

## Visão Geral

A API do Payment Selection Backend fornece endpoints para gerenciar seleções em massa de pagamentos com suporte a paginação. A API segue os princípios REST e utiliza JSON para troca de dados.

**Base URL:** `http://localhost:8080`

## Autenticação

Atualmente, a API utiliza um sistema simplificado de autenticação para demonstração. Em produção, deve ser implementado um sistema robusto de autenticação (JWT, OAuth2, etc.).

## Endpoints

### 1. Health Check

Verifica se o serviço está funcionando.

**Endpoint:** `GET /selections/health`

**Resposta:**
```
Status: 200 OK
Content-Type: text/plain

Payment Selection Backend is running!
```

**Exemplo:**
```bash
curl -X GET http://localhost:8080/selections/health
```

---

### 2. Criar Seleção

Cria uma nova sessão de seleção com filtros específicos.

**Endpoint:** `POST /selections`

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "filter": {
    "status": "A_PAGAR",
    "vencimentoAte": "2024-12-31"
  },
  "mode": "NONE"
}
```

**Parâmetros:**
- `filter` (object, obrigatório): Filtros para buscar pagamentos
  - `status` (string): Status dos pagamentos (ex: "A_PAGAR", "PAID", "CANCELLED")
  - `vencimentoAte` (string, formato: YYYY-MM-DD): Data limite de vencimento
- `mode` (string, obrigatório): Modo inicial da seleção
  - `"NONE"`: Nenhum item selecionado inicialmente
  - `"ALL"`: Todos os itens filtrados selecionados inicialmente

**Resposta de Sucesso:**
```json
{
  "selectionId": "550e8400-e29b-41d4-a716-446655440000",
  "selectedCount": 10
}
```

**Status Codes:**
- `201 Created`: Seleção criada com sucesso
- `400 Bad Request`: Dados inválidos no body da requisição

**Exemplo:**
```bash
curl -X POST http://localhost:8080/selections \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "status": "A_PAGAR",
      "vencimentoAte": "2024-12-31"
    },
    "mode": "NONE"
  }'
```

---

### 3. Atualizar Seleção

Atualiza uma sessão de seleção existente, permitindo marcar/desmarcar itens ou alterar o modo.

**Endpoint:** `PATCH /selections/{selectionId}`

**Headers:**
- `Content-Type: application/json`

**Parâmetros de URL:**
- `selectionId` (UUID, obrigatório): ID da sessão de seleção

**Body (todos os campos são opcionais):**
```json
{
  "mode": "ALL",
  "includeIds": [1, 2, 3],
  "excludeIds": [4, 5]
}
```

**Parâmetros do Body:**
- `mode` (string, opcional): Novo modo da seleção
  - `"ALL"`: Selecionar todos os itens filtrados
  - `"NONE"`: Desmarcar todos os itens
- `includeIds` (array de números, opcional): IDs para incluir na seleção
- `excludeIds` (array de números, opcional): IDs para excluir da seleção

**Lógica de Atualização:**
- Se `mode` for especificado, as listas de inclusão/exclusão são resetadas
- Se `includeIds` for especificado:
  - No modo `NONE`: IDs são adicionados à lista de inclusão
  - No modo `ALL`: IDs são removidos da lista de exclusão
- Se `excludeIds` for especificado:
  - No modo `ALL`: IDs são adicionados à lista de exclusão
  - No modo `NONE`: IDs são removidos da lista de inclusão

**Resposta de Sucesso:**
```json
{
  "selectionId": "550e8400-e29b-41d4-a716-446655440000",
  "selectedCount": 15
}
```

**Status Codes:**
- `200 OK`: Seleção atualizada com sucesso
- `404 Not Found`: Seleção não encontrada
- `400 Bad Request`: Dados inválidos

**Exemplos:**

Selecionar todos:
```bash
curl -X PATCH http://localhost:8080/selections/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"mode": "ALL"}'
```

Marcar itens específicos:
```bash
curl -X PATCH http://localhost:8080/selections/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"includeIds": [1, 2, 3]}'
```

Desmarcar itens específicos:
```bash
curl -X PATCH http://localhost:8080/selections/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"excludeIds": [4, 5]}'
```

---

### 4. Aplicar Ação

Aplica uma ação em lote nos itens selecionados e remove a sessão de seleção.

**Endpoint:** `POST /selections/{selectionId}/apply`

**Headers:**
- `Content-Type: application/json`

**Parâmetros de URL:**
- `selectionId` (UUID, obrigatório): ID da sessão de seleção

**Body:**
```json
{
  "action": "PAY"
}
```

**Parâmetros:**
- `action` (string, obrigatório): Ação a ser aplicada
  - `"PAY"`: Marcar pagamentos como pagos
  - `"CANCEL"`: Cancelar pagamentos

**Resposta de Sucesso:**
```
Status: 200 OK
```

**Status Codes:**
- `200 OK`: Ação aplicada com sucesso
- `404 Not Found`: Seleção não encontrada
- `400 Bad Request`: Ação inválida

**Exemplo:**
```bash
curl -X POST http://localhost:8080/selections/550e8400-e29b-41d4-a716-446655440000/apply \
  -H "Content-Type: application/json" \
  -d '{"action": "PAY"}'
```

## Fluxo de Uso Típico

### 1. Cenário: Selecionar e Pagar Alguns Itens

```bash
# 1. Criar seleção
RESPONSE=$(curl -s -X POST http://localhost:8080/selections \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"status": "A_PAGAR", "vencimentoAte": "2024-12-31"},
    "mode": "NONE"
  }')

# 2. Extrair selectionId (assumindo jq disponível)
SELECTION_ID=$(echo $RESPONSE | jq -r '.selectionId')

# 3. Marcar itens específicos
curl -X PATCH http://localhost:8080/selections/$SELECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"includeIds": [1, 2, 3, 4, 5]}'

# 4. Aplicar pagamento
curl -X POST http://localhost:8080/selections/$SELECTION_ID/apply \
  -H "Content-Type: application/json" \
  -d '{"action": "PAY"}'
```

### 2. Cenário: Selecionar Todos Exceto Alguns

```bash
# 1. Criar seleção em modo ALL
RESPONSE=$(curl -s -X POST http://localhost:8080/selections \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"status": "A_PAGAR"},
    "mode": "ALL"
  }')

SELECTION_ID=$(echo $RESPONSE | jq -r '.selectionId')

# 2. Excluir itens específicos
curl -X PATCH http://localhost:8080/selections/$SELECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"excludeIds": [10, 11, 12]}'

# 3. Aplicar pagamento
curl -X POST http://localhost:8080/selections/$SELECTION_ID/apply \
  -H "Content-Type: application/json" \
  -d '{"action": "PAY"}'
```

### 3. Cenário: Navegação entre Páginas

```bash
# 1. Criar seleção
SELECTION_ID="..." # obtido da criação

# 2. Usuário na página 1 - marcar todos da página
curl -X PATCH http://localhost:8080/selections/$SELECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"includeIds": [1, 2, 3, 4, 5]}'

# 3. Usuário navega para página 2 - marcar alguns itens
curl -X PATCH http://localhost:8080/selections/$SELECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"includeIds": [6, 7, 8]}'

# 4. Usuário volta para página 1 - desmarcar um item
curl -X PATCH http://localhost:8080/selections/$SELECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"excludeIds": [2]}'

# 5. Aplicar ação (itens 1, 3, 4, 5, 6, 7, 8 serão afetados)
curl -X POST http://localhost:8080/selections/$SELECTION_ID/apply \
  -H "Content-Type: application/json" \
  -d '{"action": "PAY"}'
```

## Códigos de Erro

### Códigos HTTP Padrão

- `200 OK`: Requisição processada com sucesso
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos na requisição
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### Formato de Erro

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/selections"
}
```

## Limitações e Considerações

### 1. TTL das Seleções
- Seleções expiram automaticamente em 4 horas
- Após expiração, tentativas de atualização retornarão 404

### 2. Concorrência
- Sistema utiliza controle de concorrência otimista
- Atualizações simultâneas podem gerar conflitos

### 3. Performance
- Operações em lote são otimizadas para grandes volumes
- Recomenda-se limitar seleções a 10.000 itens por vez

### 4. Filtros Suportados
Atualmente suportados:
- `status`: String exata
- `vencimentoAte`: Data no formato YYYY-MM-DD

## Versionamento

**Versão Atual:** v1.0

A API segue versionamento semântico. Mudanças breaking serão introduzidas apenas em versões major.

## Rate Limiting

Atualmente não implementado. Em produção, recomenda-se:
- 100 requisições por minuto por usuário
- 1000 requisições por minuto por IP

## Segurança

### Headers de Segurança Recomendados

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Validação de Entrada

- Todos os inputs são validados
- IDs são verificados quanto ao formato UUID
- Datas são validadas quanto ao formato ISO

## Monitoramento

### Métricas Disponíveis

- Número de seleções ativas
- Tempo médio de processamento
- Taxa de erro por endpoint
- Volume de itens processados

### Logs

Logs estruturados em formato JSON incluindo:
- Request ID para rastreamento
- User ID para auditoria
- Timestamps precisos
- Detalhes de erro quando aplicável


## 🔍 **Endpoint de Busca de Pagamentos**

### **GET /api/payments/search**

Busca pagamentos com filtros e paginação.

#### **Parâmetros de Query:**
- `status` (opcional): Status do pagamento (A_PAGAR, PAID, CANCELLED)
- `vencimentoAte` (opcional): Data limite de vencimento (formato: YYYY-MM-DD)
- `page` (opcional): Número da página (padrão: 0)
- `size` (opcional): Tamanho da página (padrão: 10)
- `sort` (opcional): Campo para ordenação (padrão: id)
- `direction` (opcional): Direção da ordenação - asc ou desc (padrão: asc)

#### **Exemplo de Requisição:**
```bash
GET /api/payments/search?status=A_PAGAR&vencimentoAte=2024-12-31&page=0&size=10&sort=vencimento&direction=asc
```

#### **Resposta de Sucesso (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "descricao": "Fatura de Energia Elétrica",
      "valor": 250.75,
      "vencimento": "2024-09-10",
      "status": "A_PAGAR",
      "createdAt": "2024-09-01T10:00:00Z",
      "updatedAt": "2024-09-01T10:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "ascending": true
    }
  },
  "totalElements": 17,
  "totalPages": 2,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

#### **Códigos de Status:**
- `200 OK`: Busca realizada com sucesso
- `400 Bad Request`: Parâmetros inválidos
- `500 Internal Server Error`: Erro interno do servidor

## 🏥 **Spring Boot Actuator - Monitoramento e Gerenciamento**

O backend utiliza o Spring Boot Actuator para fornecer endpoints de monitoramento e gerenciamento em produção.

### **Endpoints Disponíveis:**

#### **GET /actuator/health**
Health check completo da aplicação, incluindo status do banco de dados.

**Resposta de Sucesso (200 OK):**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 91943821312,
        "threshold": 10485760,
        "path": "/home/ubuntu/payment-selection-backend/."
      }
    }
  }
}
```

#### **GET /actuator/info**
Informações sobre a aplicação.

**Resposta de Sucesso (200 OK):**
```json
{
  "app": {
    "name": "Payment Selection Backend",
    "description": "Sistema de seleção de pagamentos em massa com paginação",
    "version": "1.0.0",
    "encoding": "UTF-8",
    "java": {
      "version": "21"
    }
  }
}
```

#### **GET /actuator/metrics**
Métricas da aplicação (JVM, HTTP, banco de dados, etc.).

#### **GET /actuator/env**
Informações sobre o ambiente e configurações.

#### **GET /actuator/configprops**
Propriedades de configuração da aplicação.

#### **GET /actuator/beans**
Lista de todos os beans Spring registrados.

#### **GET /actuator/mappings**
Lista de todos os endpoints REST mapeados.

#### **POST /actuator/shutdown**
Endpoint para desligamento graceful da aplicação (requer autenticação em produção).

### **Configurações de Segurança:**

Em produção, é recomendado restringir o acesso aos endpoints do Actuator:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: never
    shutdown:
      enabled: false
```

## 🛑 **Graceful Shutdown**

O backend está configurado para realizar desligamento graceful, garantindo que:

- Requisições em andamento sejam finalizadas
- Conexões de banco de dados sejam fechadas adequadamente
- Recursos sejam liberados corretamente
- Timeout configurado para 30 segundos

### **Configuração:**
```yaml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

### **Como Funciona:**
1. Aplicação para de aceitar novas requisições
2. Aguarda conclusão das requisições em andamento (até 30s)
3. Fecha conexões de banco de dados
4. Libera recursos e finaliza a aplicação

