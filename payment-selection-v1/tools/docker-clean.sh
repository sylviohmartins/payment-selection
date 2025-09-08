#!/bin/bash

# Script para limpeza completa dos recursos Docker
# Payment Selection Backend - PostgreSQL Clean

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

# Confirmar ação destrutiva
confirm_cleanup() {
    warning "ATENÇÃO: Esta operação irá remover TODOS os dados do banco!"
    warning "Isso inclui:"
    warning "  - Containers"
    warning "  - Volumes (dados do banco)"
    warning "  - Redes criadas"
    warning ""
    
    if [ "$1" != "--force" ] && [ "$1" != "-f" ]; then
        read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Operação cancelada."
            exit 0
        fi
    else
        warning "Modo --force ativado. Prosseguindo sem confirmação."
    fi
}

# Parar e remover containers
remove_containers() {
    log "Parando e removendo containers..."
    
    if docker-compose ps | grep -q "payment-selection"; then
        docker-compose down
        success "Containers removidos."
    else
        log "Nenhum container encontrado."
    fi
}

# Remover volumes
remove_volumes() {
    log "Removendo volumes de dados..."
    
    # Remover volumes específicos do projeto
    if docker volume ls | grep -q "payment-selection-backend_db_data"; then
        docker volume rm payment-selection-backend_db_data
        success "Volume de dados removido."
    else
        log "Volume de dados não encontrado."
    fi
    
    # Remover volumes órfãos
    ORPHAN_VOLUMES=$(docker volume ls -qf dangling=true)
    if [ ! -z "$ORPHAN_VOLUMES" ]; then
        log "Removendo volumes órfãos..."
        docker volume rm $ORPHAN_VOLUMES
        success "Volumes órfãos removidos."
    fi
}

# Remover redes
remove_networks() {
    log "Removendo redes personalizadas..."
    
    if docker network ls | grep -q "payment-selection-network"; then
        docker network rm payment-selection-network
        success "Rede personalizada removida."
    else
        log "Rede personalizada não encontrada."
    fi
}

# Remover imagens não utilizadas
remove_unused_images() {
    log "Removendo imagens não utilizadas..."
    
    UNUSED_IMAGES=$(docker images -qf dangling=true)
    if [ ! -z "$UNUSED_IMAGES" ]; then
        docker rmi $UNUSED_IMAGES
        success "Imagens não utilizadas removidas."
    else
        log "Nenhuma imagem não utilizada encontrada."
    fi
}

# Limpeza geral do Docker
docker_system_prune() {
    if [ "$1" = "--deep" ]; then
        log "Executando limpeza profunda do sistema Docker..."
        docker system prune -af --volumes
        success "Limpeza profunda concluída."
    else
        log "Para limpeza profunda do sistema, use: --deep"
    fi
}

# Mostrar espaço liberado
show_space_info() {
    log "=== Informações de Espaço ==="
    log "Espaço usado pelo Docker:"
    docker system df
}

# Função principal
main() {
    log "=== Payment Selection Backend - Docker Cleanup ==="
    
    check_directory
    confirm_cleanup "$1"
    
    remove_containers
    remove_volumes
    remove_networks
    remove_unused_images
    docker_system_prune "$2"
    
    show_space_info
    
    success "Limpeza concluída!"
    log "Para recriar o ambiente: ./tools/docker-setup.sh && ./tools/docker-start.sh"
}

# Mostrar ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Opções:"
    echo "  --force, -f    Não pedir confirmação"
    echo "  --deep         Executar limpeza profunda do sistema Docker"
    echo "  --help, -h     Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0                    # Limpeza normal com confirmação"
    echo "  $0 --force           # Limpeza sem confirmação"
    echo "  $0 --force --deep    # Limpeza completa sem confirmação"
}

# Verificar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Executar função principal
main "$@"

