# Payment Selection Backend - Gerenciamento Docker

Este documento descreve como usar os scripts Docker para gerenciar o ambiente de desenvolvimento do Payment Selection Backend.

## 📋 **Pré-requisitos**

- Docker 20.10+ instalado
- Docker Compose v2.0+ instalado
- Usuário com permissões para executar Docker

## 🚀 **Scripts Disponíveis**

### 1. **docker-setup.sh** - Configuração Inicial

Prepara o ambiente Docker e valida as configurações.

```bash
./scripts/docker-setup.sh
```

**O que faz:**
- ✅ Verifica se Docker e Docker Compose estão instalados
- ✅ Valida o arquivo `docker-compose.yml`
- ✅ Compara configurações entre `docker-compose.yml` e `application.yml`
- ✅ Cria rede Docker personalizada
- ✅ Exibe relatório de compatibilidade

### 2. **docker-start.sh** - Iniciar Serviços

Inicia o banco de dados PostgreSQL e aguarda ficar pronto.

```bash
./scripts/docker-start.sh
```

**O que faz:**
- 🔄 Para containers existentes se necessário
- 🚀 Inicia o PostgreSQL em background
- ⏳ Aguarda o banco ficar pronto (até 60s)
- 📊 Exibe status e informações de conexão
- 📝 Mostra logs recentes

**Saída esperada:**
```
=== Payment Selection Backend - Starting Services ===
[2025-09-07 15:07:58] Verificando containers existentes...
[2025-09-07 15:07:58] Iniciando serviços Docker...
[SUCCESS] Serviços iniciados em background.
[2025-09-07 15:07:58] Aguardando banco de dados ficar pronto...
[SUCCESS] Banco de dados está pronto!
```

### 3. **docker-stop.sh** - Parar Serviços

Para os serviços Docker com opção de remover containers.

```bash
# Parar serviços (manter containers)
./scripts/docker-stop.sh

# Parar e remover containers
./scripts/docker-stop.sh --remove
```

**Opções:**
- `--remove` ou `-r`: Remove containers após parar

### 4. **docker-restart.sh** - Reiniciar Serviços

Reinicia todos os serviços Docker.

```bash
./scripts/docker-restart.sh
```

**O que faz:**
- 🛑 Para containers existentes
- 🚀 Inicia novamente
- ⏳ Aguarda banco ficar pronto
- 📊 Exibe status final

### 5. **docker-clean.sh** - Limpeza Completa

Remove todos os recursos Docker do projeto.

```bash
# Limpeza com confirmação
./scripts/docker-clean.sh

# Limpeza sem confirmação
./scripts/docker-clean.sh --force

# Limpeza profunda do sistema
./scripts/docker-clean.sh --force --deep
```

**⚠️ ATENÇÃO:** Esta operação remove TODOS os dados do banco!

**Opções:**
- `--force` ou `-f`: Não pedir confirmação
- `--deep`: Limpeza profunda do sistema Docker
- `--help` ou `-h`: Mostrar ajuda

**O que remove:**
- 🗑️ Containers do projeto
- 💾 Volumes de dados (dados do banco)
- 🌐 Redes personalizadas
- 🖼️ Imagens não utilizadas

## 🔧 **Configurações Validadas**

Os scripts verificam automaticamente se as configurações estão alinhadas:

### **docker-compose.yml:**
```yaml
environment:
  POSTGRES_DB: payment_selection_db
  POSTGRES_USER: user
  POSTGRES_PASSWORD: password
```

### **application.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_selection_db
    username: user
    password: password
```

## 🏗️ **Boas Práticas Implementadas**

### **Segurança:**
- ✅ `no-new-privileges:true` - Previne escalação de privilégios
- ✅ Rede isolada para o projeto
- ✅ Volumes nomeados para persistência

### **Performance:**
- ✅ Configurações otimizadas do PostgreSQL
- ✅ Limites de recursos (CPU/Memória)
- ✅ Health checks robustos

### **Monitoramento:**
- ✅ Logs estruturados com rotação
- ✅ Health checks com retry e timeout
- ✅ Métricas de performance habilitadas

### **Manutenibilidade:**
- ✅ Scripts com logging colorido
- ✅ Validação de pré-requisitos
- ✅ Tratamento de erros
- ✅ Documentação inline

## 📊 **Informações de Conexão**

Após iniciar os serviços:

```
Host: localhost
Port: 5432
Database: payment_selection_db
Username: user
Password: password

URL JDBC: jdbc:postgresql://localhost:5432/payment_selection_db
```

### **Conectar via psql:**
```bash
psql -h localhost -p 5432 -U user -d payment_selection_db
```

### **Conectar via aplicação Spring Boot:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_selection_db
    username: user
    password: password
```

## 🔄 **Fluxo de Trabalho Típico**

### **Primeira vez:**
```bash
# 1. Configurar ambiente
./scripts/docker-setup.sh

# 2. Iniciar serviços
./scripts/docker-start.sh

# 3. Executar aplicação Spring Boot
mvn spring-boot:run
```

### **Desenvolvimento diário:**
```bash
# Iniciar ambiente
./scripts/docker-start.sh

# Trabalhar...

# Parar ambiente
./scripts/docker-stop.sh
```

### **Limpeza/Reset:**
```bash
# Limpeza completa
./scripts/docker-clean.sh --force

# Recriar ambiente
./scripts/docker-setup.sh
./scripts/docker-start.sh
```

## 🐛 **Troubleshooting**

### **Erro: "Docker daemon not running"**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### **Erro: "Permission denied"**
```bash
sudo usermod -aG docker $USER
# Fazer logout/login ou:
newgrp docker
```

### **Erro: "Port 5432 already in use"**
```bash
# Verificar processos usando a porta
sudo lsof -i :5432

# Parar PostgreSQL local se necessário
sudo systemctl stop postgresql
```

### **Banco não fica pronto**
```bash
# Verificar logs
docker-compose logs db

# Verificar health check
docker-compose ps
```

### **Configurações não batem**
```bash
# Executar validação
./scripts/docker-setup.sh

# Verificar arquivos manualmente
grep -n "payment_selection_db" docker-compose.yml
grep -n "payment_selection_db" src/main/resources/application.yml
```

## 📁 **Estrutura de Arquivos**

```
payment-selection-backend/
├── docker-compose.yml          # Configuração dos serviços
├── .env.example               # Exemplo de variáveis de ambiente
├── scripts/
│   ├── docker-setup.sh        # Configuração inicial
│   ├── docker-start.sh        # Iniciar serviços
│   ├── docker-stop.sh         # Parar serviços
│   ├── docker-restart.sh      # Reiniciar serviços
│   ├── docker-clean.sh        # Limpeza completa
│   └── init-db.sql           # Script de inicialização do DB
└── src/main/resources/
    └── application.yml        # Configurações da aplicação
```

## 🔒 **Variáveis de Ambiente**

Para personalizar as configurações, copie `.env.example` para `.env`:

```bash
cp .env.example .env
# Editar .env conforme necessário
```

## 📈 **Monitoramento**

### **Verificar status:**
```bash
docker-compose ps
docker-compose logs -f db
```

### **Métricas de performance:**
```bash
docker stats payment-selection-db
```

### **Conectar ao container:**
```bash
docker-compose exec db psql -U user -d payment_selection_db
```

---

**💡 Dica:** Execute `./scripts/docker-setup.sh` sempre que fizer alterações no `docker-compose.yml` para validar as configurações!

