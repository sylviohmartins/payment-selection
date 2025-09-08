# Instruções de Execução - Payment Selection Backend

## Pré-requisitos

### Software Necessário
- **Java 21** (OpenJDK ou Oracle JDK)
- **Maven 3.6+**
- **PostgreSQL 12+** (para produção)
- **Git** (para clonar o repositório)

### Verificação dos Pré-requisitos

```bash
# Verificar Java
java -version
# Deve mostrar: openjdk version "21.x.x" ou similar

# Verificar Maven
mvn -version
# Deve mostrar: Apache Maven 3.6.x ou superior

# Verificar PostgreSQL (se instalado)
psql --version
# Deve mostrar: psql (PostgreSQL) 12.x ou superior
```

## Configuração do Ambiente

### 1. Configuração do Banco de Dados

#### Opção A: PostgreSQL (Produção)
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres createdb payment_selection

# Criar usuário (opcional)
sudo -u postgres psql -c "CREATE USER payment_user WITH PASSWORD 'payment_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE payment_selection TO payment_user;"
```

#### Opção B: H2 Database (Desenvolvimento/Teste)
Para desenvolvimento rápido, o projeto já está configurado para usar H2 em memória nos testes.

### 2. Configuração da Aplicação

Edite o arquivo `src/main/resources/application.yml` conforme seu ambiente:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_selection
    username: postgres  # ou payment_user
    password: postgres  # ou payment_pass
```

## Execução da Aplicação

### 1. Compilação e Testes

```bash
# Navegar para o diretório do projeto
cd payment-selection-backend

# Limpar e compilar
mvn clean compile

# Executar testes
mvn test

# Compilar e empacotar (opcional)
mvn package
```

### 2. Executar a Aplicação

#### Opção A: Via Maven (Desenvolvimento)
```bash
mvn spring-boot:run
```

#### Opção B: Via JAR (Produção)
```bash
# Gerar o JAR
mvn package

# Executar o JAR
java -jar target/payment-selection-backend-1.0.0.jar
```

### 3. Verificação da Execução

A aplicação estará disponível em: `http://localhost:8080`

Teste o health check:
```bash
curl http://localhost:8080/selections/health
# Resposta esperada: "Payment Selection Backend is running!"
```

## Testando a API

### 1. Usando o Script de Teste

```bash
# Executar o script de teste automatizado
./test-api.sh
```

### 2. Testes Manuais com curl

#### Criar uma Seleção
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

#### Marcar Itens Específicos
```bash
curl -X PATCH http://localhost:8080/selections/{SELECTION_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "includeIds": [1, 2, 3]
  }'
```

#### Selecionar Todos
```bash
curl -X PATCH http://localhost:8080/selections/{SELECTION_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ALL"
  }'
```

#### Aplicar Pagamento
```bash
curl -X POST http://localhost:8080/selections/{SELECTION_ID}/apply \
  -H "Content-Type: application/json" \
  -d '{
    "action": "PAY"
  }'
```

### 3. Usando Postman

Importe a coleção de requests:

1. **POST** `http://localhost:8080/selections`
   - Body (JSON):
   ```json
   {
     "filter": {
       "status": "A_PAGAR",
       "vencimentoAte": "2024-12-31"
     },
     "mode": "NONE"
   }
   ```

2. **PATCH** `http://localhost:8080/selections/{selectionId}`
   - Body (JSON):
   ```json
   {
     "includeIds": [1, 2, 3]
   }
   ```

3. **POST** `http://localhost:8080/selections/{selectionId}/apply`
   - Body (JSON):
   ```json
   {
     "action": "PAY"
   }
   ```

## Configurações Avançadas

### 1. Configuração de CORS

O CORS já está configurado para aceitar requisições de qualquer origem. Para produção, edite `CorsConfig.java`:

```java
configuration.setAllowedOriginPatterns(Arrays.asList("https://meudominio.com"));
```

### 2. Configuração de Logging

Ajuste o nível de log em `application.yml`:

```yaml
logging:
  level:
    com.example.paymentselection: INFO  # DEBUG para desenvolvimento
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
```

### 3. Configuração de TTL das Seleções

Por padrão, as seleções expiram em 4 horas. Para alterar, edite `SelectionService.java`:

```java
selection.setExpiresAt(Instant.now().plus(Duration.ofHours(8))); // 8 horas
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais em `application.yml`
   - Teste a conexão: `psql -h localhost -U postgres -d payment_selection`

2. **Porta 8080 já em uso**
   - Altere a porta em `application.yml`:
   ```yaml
   server:
     port: 8081
   ```

3. **Erro de compilação Java**
   - Verifique a versão do Java: `java -version`
   - Configure JAVA_HOME se necessário:
   ```bash
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
   ```

4. **Testes falhando**
   - Execute apenas os testes unitários: `mvn test -Dtest=*ServiceTest`
   - Execute apenas os testes de integração: `mvn test -Dtest=*ControllerTest`

### Logs Úteis

```bash
# Ver logs da aplicação
tail -f logs/spring.log

# Ver logs do PostgreSQL (Ubuntu)
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Deployment

### 1. Preparação para Produção

```bash
# Gerar JAR otimizado
mvn clean package -Pprod

# Verificar o JAR gerado
ls -la target/payment-selection-backend-1.0.0.jar
```

### 2. Variáveis de Ambiente

```bash
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/payment_selection
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=prod_password
```

### 3. Execução em Produção

```bash
# Com variáveis de ambiente
java -jar target/payment-selection-backend-1.0.0.jar

# Ou com arquivo de configuração externo
java -jar target/payment-selection-backend-1.0.0.jar --spring.config.location=classpath:/application-prod.yml
```

## Monitoramento

### Health Check
```bash
curl http://localhost:8080/selections/health
```

### Métricas (se habilitado)
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Consulte a documentação do Spring Boot
3. Verifique as configurações do banco de dados
4. Execute os testes para validar o ambiente



## 🐳 **Configuração do Banco de Dados com Docker Compose**

Para rodar o backend com um banco de dados PostgreSQL localmente, você pode usar o `docker-compose.yml` fornecido na raiz do projeto.

### **Pré-requisitos:**
- Docker e Docker Compose instalados na sua máquina.

### **Passos para subir o banco de dados:**
1. Navegue até a raiz do projeto `payment-selection-backend` no seu terminal.
2. Execute o seguinte comando para iniciar o contêiner do PostgreSQL:
   ```bash
   docker-compose up -d
   ```
   Este comando irá baixar a imagem do PostgreSQL (se ainda não tiver), criar e iniciar um contêiner chamado `payment-selection-db` na porta `5432`.
3. Para verificar se o banco de dados está rodando e saudável, você pode usar:
   ```bash
   docker-compose ps
   docker-compose logs db
   ```

### **Conexão do Backend com o Banco de Dados:**

O backend está configurado para se conectar a um banco de dados PostgreSQL com as seguintes credenciais (definidas no `application.yml`):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_selection_db
    username: user
    password: password
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
```

- **`url: jdbc:postgresql://localhost:5432/payment_selection_db`**: Indica que o banco de dados está rodando localmente (`localhost`) na porta padrão do PostgreSQL (`5432`) e o nome do banco de dados é `payment_selection_db`.
- **`username: user`** e **`password: password`**: São as credenciais de acesso ao banco de dados, que correspondem às variáveis de ambiente definidas no `docker-compose.yml`.

**Observação:** Se você estiver rodando o backend dentro de um contêiner Docker na mesma rede do `db` service, você deve usar o nome do serviço (`db`) como hostname na URL do banco de dados:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/payment_selection_db
    username: user
    password: password
```

Para parar e remover o contêiner do banco de dados:
```bash
docker-compose down
```


