#!/bin/bash
# BookTutor - Start Script
# Usage:
#   ./scripts/start.sh dev      - Start development mode
#   ./scripts/start.sh prod     - Start production mode
#   ./scripts/start.sh services - Start only infrastructure services
#   ./scripts/start.sh stop     - Stop all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_env() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_info "Please edit .env with your configuration"
    fi
}

check_ollama() {
    if ! command -v ollama &> /dev/null; then
        log_warning "Ollama not found. Install from https://ollama.ai"
        return 1
    fi
    
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        log_warning "Ollama not running. Starting..."
        ollama serve &
        sleep 3
    fi
    
    # Check for required models
    if ! ollama list | grep -q "qwen3:8b"; then
        log_info "Pulling qwen3:8b model..."
        ollama pull qwen3:8b
    fi
    
    if ! ollama list | grep -q "bge-m3"; then
        log_info "Pulling bge-m3 embedding model..."
        ollama pull bge-m3
    fi
    
    log_success "Ollama ready"
}

start_services() {
    log_info "Starting infrastructure services..."
    docker-compose -f docker-compose.yml up -d
    
    # Wait for services
    log_info "Waiting for services to be healthy..."
    sleep 5
    
    # Check Qdrant
    until curl -s http://localhost:6333/readyz &> /dev/null; do
        log_info "Waiting for Qdrant..."
        sleep 2
    done
    log_success "Qdrant ready"
    
    log_success "All services started"
}

start_dev() {
    log_info "Starting BookTutor in DEVELOPMENT mode..."
    
    check_env
    check_ollama
    start_services
    
    # Start backend
    log_info "Starting backend..."
    cd backend
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    # Run backend in background
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    log_info "Starting frontend..."
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_success "BookTutor started!"
    echo ""
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    echo "  Qdrant:   http://localhost:6333/dashboard"
    echo ""
    echo "Press Ctrl+C to stop..."
    
    # Trap to cleanup on exit
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait
}

start_prod() {
    log_info "Starting BookTutor in PRODUCTION mode..."
    
    check_env
    
    # Verify SECRET_KEY is set
    source .env
    if [ "$SECRET_KEY" = "change-this-in-production-use-openssl-rand-hex-32" ]; then
        log_error "Please set a secure SECRET_KEY in .env"
        log_info "Generate one with: openssl rand -hex 32"
        exit 1
    fi
    
    log_info "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log_success "BookTutor started in production mode!"
    echo ""
    echo "  Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "  Backend:  http://localhost:${API_PORT:-8000}"
    echo ""
}

stop_all() {
    log_info "Stopping all services..."
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Kill any running dev processes
    pkill -f "uvicorn main:app" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    log_success "All services stopped"
}

show_status() {
    echo ""
    log_info "Docker containers:"
    docker ps --filter "name=booktutor" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

# Main
case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    services)
        check_env
        start_services
        ;;
    stop)
        stop_all
        ;;
    status)
        show_status
        ;;
    *)
        echo "BookTutor - Start Script"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  dev       Start in development mode (hot reload)"
        echo "  prod      Start in production mode (Docker)"
        echo "  services  Start only infrastructure (Qdrant, PostgreSQL, Redis)"
        echo "  stop      Stop all services"
        echo "  status    Show running containers"
        echo ""
        ;;
esac
