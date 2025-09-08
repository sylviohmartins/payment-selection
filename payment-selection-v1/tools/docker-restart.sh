#!/bin/bash

# Script para reiniciar os serviços Docker
# Payment Selection Backend - PostgreSQL Restart

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

# Reiniciar serviços
restart_services() {
    log "Reiniciando serviços Docker..."
    
    # Parar serviços se estiverem rodando
    if docker-compose ps | grep -q "Up"; then
        log "Parando serviços existentes..."
        docker-compose down
    fi
    
    # Aguardar um momento
    sleep 2
    
    # Iniciar novamente
    log "Iniciando serviços..."
    docker-compose up -d
    
    success "Serviços reiniciados."
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
    log "Status dos serviços após reinicialização:"
    docker-compose ps
    
    log "Logs recentes:"
    docker-compose logs --tail=5
}

# Função principal
main() {
    log "=== Payment Selection Backend - Restarting Services ==="
    
    check_directory
    restart_services
    
    if wait_for_db; then
        show_status
        success "Serviços reiniciados com sucesso!"
    else
        error "Falha ao reiniciar os serviços."
        docker-compose logs
        exit 1
    fi
}

# Executar função principal
main "$@"

