#!/bin/bash

# Script para parar os serviços Docker
# Payment Selection Backend - PostgreSQL Stop

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

# Verificar se há containers rodando
check_running_containers() {
    log "Verificando containers em execução..."
    
    if ! docker-compose ps | grep -q "Up"; then
        warning "Nenhum container está rodando."
        return 1
    fi
    
    return 0
}

# Parar serviços gracefully
stop_services() {
    log "Parando serviços Docker..."
    
    # Parar containers mantendo volumes
    docker-compose stop
    
    success "Serviços parados."
}

# Remover containers (opcional)
remove_containers() {
    if [ "$1" = "--remove" ] || [ "$1" = "-r" ]; then
        log "Removendo containers..."
        docker-compose down
        success "Containers removidos."
    else
        log "Containers mantidos. Use --remove para removê-los."
    fi
}

# Mostrar status final
show_final_status() {
    log "Status final:"
    docker-compose ps
}

# Mostrar opções de limpeza
show_cleanup_options() {
    log "=== Opções de Limpeza ==="
    log "Para remover containers: ./tools/docker-stop.sh --remove"
    log "Para limpeza completa: ./tools/docker-clean.sh"
    log "Para reiniciar: ./tools/docker-restart.sh"
}

# Função principal
main() {
    log "=== Payment Selection Backend - Stopping Services ==="
    
    check_directory
    
    if check_running_containers; then
        stop_services
        remove_containers "$1"
        show_final_status
        show_cleanup_options
        success "Operação concluída!"
    else
        log "Nada para parar."
    fi
}

# Executar função principal
main "$@"

