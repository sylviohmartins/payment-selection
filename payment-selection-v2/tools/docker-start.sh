#!/bin/bash

# Script para iniciar os serviços Docker
# Payment Selection Backend - PostgreSQL Start

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
check_directory() {
    if [ ! -f "docker-compose.yml" ]; then
        error "Execute este script a partir do diretório raiz do projeto (onde está o docker-compose.yml)"
        exit 1
    fi
}

# Parar containers existentes se estiverem rodando
stop_existing() {
    log "Verificando containers existentes..."
    if docker-compose ps | grep -q "payment-selection-db"; then
        warning "Container já está rodando. Parando primeiro..."
        docker-compose down
    fi
}

# Iniciar serviços
start_services() {
    log "Iniciando serviços Docker..."

    # Iniciar em modo detached
    docker-compose up -d

    success "Serviços iniciados em background."
}

# Aguardar banco de dados ficar pronto
wait_for_db() {
    log "Aguardando banco de dados ficar pronto..."

    # Aguardar até 60 segundos
    TIMEOUT=60
    COUNTER=0

    while [ $COUNTER -lt $TIMEOUT ]; do
        if docker-compose exec -T db pg_isready -U user -d payment_selection_db > /dev/null 2>&1; then
            success "Banco de dados está pronto!"
            return 0
        fi

        echo -n "."
        sleep 2
        COUNTER=$((COUNTER + 2))
    done

    error "Timeout: Banco de dados não ficou pronto em ${TIMEOUT}s"
    return 1
}

# Mostrar status dos serviços
show_status() {
    log "Status dos serviços:"
    docker-compose ps

    log "Logs recentes:"
    docker-compose logs --tail=10
}

# Mostrar informações de conexão
show_connection_info() {
    log "=== Informações de Conexão ==="
    log "Host: localhost"
    log "Port: 5432"
    log "Database: payment_selection_db"
    log "Username: user"
    log "Password: password"
    log ""
    log "URL JDBC: jdbc:postgresql://localhost:5432/payment_selection_db"
    log ""
    log "Para conectar via psql:"
    log "  psql -h localhost -p 5432 -U user -d payment_selection_db"
}

# Função principal
main() {
    log "=== Payment Selection Backend - Starting Services ==="

    check_directory
    stop_existing
    start_services

    if wait_for_db; then
        show_status
        show_connection_info
        success "Serviços iniciados com sucesso!"
        log "Execute './tools/docker-stop.sh' para parar os serviços."
    else
        error "Falha ao iniciar os serviços."
        docker-compose logs
        exit 1
    fi
}

# Executar função principal
main "$@"

