# Payment Selection Backend

Sistema backend para seleção de pagamentos em massa com paginação, desenvolvido em Java 21 com Spring Boot 3.4.5 e Aurora PostgreSQL.

## Visão Geral

Este sistema implementa uma solução para gerenciar seleções em massa de pagamentos com suporte a paginação, conforme especificado nos requisitos. O sistema permite:

- Selecionar/desmarcar itens individualmente
- Selecionar/desmarcar todos os itens de uma página
- Selecionar todos os itens que atendem ao filtro
- Desmarcar todos os itens
- Manter o estado de seleção entre navegações de página
- Aplicar ações em lote (pagamento ou cancelamento)

## Tecnologias

- **Java**: 21
- **Spring Boot**: 3.4.5
- **Spring Data JPA**: Para persistência de dados
- **PostgreSQL**: Banco de dados principal (Aurora PostgreSQL em produção)
- **H2**: Banco de dados em memória para testes
- **Maven**: Gerenciamento de dependências
- **JUnit 5**: Framework de testes

## Arquitetura

### Modelo de Dados

#### Tabela Selection
Armazena as sessões de seleção com:
- `id`: Identificador único da sessão
- `user_id`: ID do usuário proprietário
- `mode`: Modo de seleção (ALL ou NONE)
- `filter_json`: Filtros aplicados (JSONB)
- `include_ids`: IDs explicitamente incluídos (JSONB)
- `exclude_ids`: IDs explicitamente excluídos (JSONB)
- `version`: Controle de concorrência otimista
- `created_at` e `expires_at`: Controle de tempo de vida

#### Tabela Payment
Representa os pagamentos do sistema com:
- `id`: Identificador único
- `status`: Status do pagamento (A_PAGAR, PAID, CANCELLED)
- `vencimento`: Data de vencimento
- `valor`: Valor do pagamento
- `descricao`: Descrição do pagamento

### API REST

#### Endpoints

1. **POST /selections**
   - Cria uma nova sessão de seleção
   - Body: `{ "filter": {...}, "mode": "NONE|ALL" }`
   - Response: `{ "selectionId": "uuid", "selectedCount": number }`

2. **PATCH /selections/{id}**
   - Atualiza uma sessão de seleção
   - Body: `{ "mode": "ALL|NONE", "includeIds": [1,2,3], "excludeIds": [4,5] }`
   - Response: `{ "selectionId": "uuid", "selectedCount": number }`

3. **POST /selections/{id}/apply**
   - Aplica ação em lote
   - Body: `{ "action": "PAY|CANCEL" }`
   - Response: 200 OK

4. **GET /selections/health**
   - Health check do serviço
   - Response: "Payment Selection Backend is running!"

## Configuração e Execução

### Pré-requisitos

- Java 21
- Maven 3.6+
- PostgreSQL 12+ (para produção)

### Configuração do Banco de Dados

1. Instale e configure o PostgreSQL
2. Crie um banco de dados chamado `payment_selection`
3. Ajuste as configurações em `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_selection
    username: seu_usuario
    password: sua_senha
```

### Executando a Aplicação

1. Clone o projeto
2. Navegue até o diretório do projeto
3. Execute os comandos:

```bash
# Compilar o projeto
mvn clean compile

# Executar os testes
mvn test

# Executar a aplicação
mvn spring-boot:run
```

A aplicação estará disponível em `http://localhost:8080`

### Executando com Docker (Opcional)

```bash
# Construir a imagem
docker build -t payment-selection-backend .

# Executar com PostgreSQL
docker-compose up
```

## Testando a API

### Exemplo de Uso

1. **Criar uma seleção:**
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

2. **Marcar itens específicos:**
```bash
curl -X PATCH http://localhost:8080/selections/{selectionId} \
  -H "Content-Type: application/json" \
  -d '{
    "includeIds": [1, 2, 3]
  }'
```

3. **Selecionar todos:**
```bash
curl -X PATCH http://localhost:8080/selections/{selectionId} \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ALL"
  }'
```

4. **Aplicar pagamento:**
```bash
curl -X POST http://localhost:8080/selections/{selectionId}/apply \
  -H "Content-Type: application/json" \
  -d '{
    "action": "PAY"
  }'
```

## Estrutura do Projeto

```
src/
├── main/
│   ├── java/com/example/paymentselection/
│   │   ├── PaymentSelectionApplication.java
│   │   ├── config/
│   │   │   └── CorsConfig.java
│   │   ├── controller/
│   │   │   └── SelectionController.java
│   │   ├── dto/
│   │   │   ├── CreateSelectionRequest.java
│   │   │   ├── UpdateSelectionRequest.java
│   │   │   ├── ApplySelectionRequest.java
│   │   │   └── SelectionResponse.java
│   │   ├── entity/
│   │   │   ├── Selection.java
│   │   │   └── Payment.java
│   │   ├── enums/
│   │   │   ├── Mode.java
│   │   │   └── Action.java
│   │   ├── repository/
│   │   │   ├── SelectionRepository.java
│   │   │   └── PaymentRepository.java
│   │   ├── service/
│   │   │   ├── SelectionService.java
│   │   │   └── UserService.java
│   │   └── util/
│   │       └── JsonUtils.java
│   └── resources/
│       ├── application.yml
│       └── schema.sql
└── test/
    ├── java/com/example/paymentselection/
    │   ├── controller/
    │   │   └── SelectionControllerTest.java
    │   └── service/
    │       └── SelectionServiceTest.java
    └── resources/
        └── application-test.yml
```

## Características Técnicas

### Performance
- Uso de JSONB para armazenar listas de IDs (evita tabelas auxiliares)
- Operações em lote para atualizações massivas
- Índices otimizados para consultas frequentes

### Segurança
- Validação de usuário em todas as operações
- Isolamento de dados por usuário
- Controle de concorrência otimista

### Escalabilidade
- Suporte a TTL para limpeza automática de sessões
- Possibilidade de processamento assíncrono para grandes volumes
- Arquitetura preparada para microserviços

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

