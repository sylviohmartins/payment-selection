#!/bin/bash

# Script para configuração inicial do ambiente Docker
# Payment Selection Backend - PostgreSQL Setup

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

# Verificar se Docker está instalado
check_docker() {
    log "Verificando se Docker está instalado..."
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    success "Docker encontrado: $(docker --version)"
}

# Verificar se Docker Compose está instalado
check_docker_compose() {
    log "Verificando se Docker Compose está instalado..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose encontrado: $(docker-compose --version)"
    else
        success "Docker Compose encontrado: $(docker compose version)"
    fi
}

# Verificar se o arquivo docker-compose.yml existe
check_compose_file() {
    log "Verificando arquivo docker-compose.yml..."
    if [ ! -f "docker-compose.yml" ]; then
        error "Arquivo docker-compose.yml não encontrado no diretório atual."
        exit 1
    fi
    success "Arquivo docker-compose.yml encontrado."
}

# Validar configurações do banco de dados
validate_config() {
    log "Validando configurações do banco de dados..."
    
    # Extrair configurações do docker-compose.yml
    DB_NAME=$(grep "POSTGRES_DB:" docker-compose.yml | awk '{print $2}')
    DB_USER=$(grep "POSTGRES_USER:" docker-compose.yml | awk '{print $2}')
    DB_PASSWORD=$(grep "POSTGRES_PASSWORD:" docker-compose.yml | awk '{print $2}')
    
    log "Configurações do Docker Compose:"
    log "  - Database: $DB_NAME"
    log "  - User: $DB_USER"
    log "  - Password: $DB_PASSWORD"
    
    # Verificar se application.yml existe
    if [ -f "../src/main/resources/application.yml" ]; then
        log "Verificando compatibilidade com application.yml..."
        
        # Verificar se as configurações batem
        if grep -q "payment_selection_db" ../src/main/resources/application.yml && \
           grep -q "username: user" ../src/main/resources/application.yml && \
           grep -q "password: password" ../src/main/resources/application.yml; then
            success "Configurações do banco de dados estão alinhadas!"
        else
            warning "Configurações podem não estar alinhadas. Verifique application.yml"
        fi
    else
        warning "Arquivo application.yml não encontrado."
    fi
}

# Função principal
main() {
    log "=== Payment Selection Backend - Docker Setup ==="
    
    check_docker
    check_docker_compose
    check_compose_file
    validate_config

    success "Setup inicial concluído com sucesso!"
    log "Execute './tools/docker-start.sh' para iniciar os serviços."
}

# Executar função principal
main "$@"

