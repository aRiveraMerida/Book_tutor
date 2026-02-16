#!/bin/bash
# BookTutor - System Test Script
# Tests all components of the system

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:8000/api/v1}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "=================================================="
echo "  BookTutor - System Test"
echo "=================================================="
echo ""

# Test 1: Check if services are running
log_info "Testing infrastructure services..."

# Qdrant
if curl -s http://localhost:6333/readyz > /dev/null 2>&1; then
    log_success "Qdrant is running"
else
    log_error "Qdrant is not running"
    log_info "Start with: docker-compose up -d qdrant"
fi

# Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    log_success "Ollama is running"
    # Check for required models
    if ollama list 2>/dev/null | grep -q "qwen"; then
        log_success "Qwen model available"
    else
        log_warning "Qwen model not found. Run: ollama pull qwen3:8b"
    fi
    if ollama list 2>/dev/null | grep -q "bge-m3"; then
        log_success "BGE-M3 embedding model available"
    else
        log_warning "BGE-M3 model not found. Run: ollama pull bge-m3"
    fi
else
    log_error "Ollama is not running"
    log_info "Start with: ollama serve"
fi

echo ""

# Test 2: Backend API
log_info "Testing Backend API..."

if curl -s "$API_URL/health" > /dev/null 2>&1; then
    log_success "Backend API is running"
    
    # Get health details
    HEALTH=$(curl -s "$API_URL/health")
    echo "   Response: $HEALTH"
else
    log_error "Backend API is not running"
    log_info "Start with: cd backend && uvicorn main:app --reload"
    echo ""
    exit 1
fi

echo ""

# Test 3: Authentication
log_info "Testing Authentication..."

# Login as admin
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    log_success "Admin login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
    ROLE=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['role'])")
    echo "   Role: $ROLE"
else
    log_error "Admin login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Login as user
USER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "user", "password": "user123"}')

if echo "$USER_RESPONSE" | grep -q "access_token"; then
    log_success "User login successful"
else
    log_error "User login failed"
fi

echo ""

# Test 4: Asignaturas API
log_info "Testing Asignaturas API..."

ASIGNATURAS=$(curl -s "$API_URL/asignaturas" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ASIGNATURAS" | grep -q "\["; then
    COUNT=$(echo "$ASIGNATURAS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
    log_success "Asignaturas endpoint working ($COUNT asignaturas)"
    
    if [ "$COUNT" -gt 0 ]; then
        echo "   Available asignaturas:"
        echo "$ASIGNATURAS" | python3 -c "import sys, json; [print(f'     • {a[\"slug\"]}: {a[\"name\"]}') for a in json.load(sys.stdin)]"
    else
        log_warning "No asignaturas found. Run seed script to add test data."
    fi
else
    log_error "Asignaturas endpoint failed"
    echo "   Response: $ASIGNATURAS"
fi

echo ""

# Test 5: Chat API (if asignaturas exist)
if [ "$COUNT" -gt 0 ]; then
    log_info "Testing Chat RAG API..."
    
    # Get first asignatura slug
    SLUG=$(echo "$ASIGNATURAS" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['slug'])")
    
    CHAT_RESPONSE=$(curl -s -X POST "$API_URL/chat/$SLUG/ask" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"question": "¿De qué trata este tema?"}' \
        --max-time 60)
    
    if echo "$CHAT_RESPONSE" | grep -q "answer"; then
        log_success "Chat RAG working for '$SLUG'"
        ANSWER=$(echo "$CHAT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['answer'][:100] + '...')")
        echo "   Answer: $ANSWER"
    else
        log_error "Chat RAG failed"
        echo "   Response: $CHAT_RESPONSE"
    fi
fi

echo ""

# Test 6: Frontend
log_info "Testing Frontend..."

if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    log_success "Frontend is running at $FRONTEND_URL"
else
    log_warning "Frontend is not running"
    log_info "Start with: cd frontend && npm run dev"
fi

echo ""
echo "=================================================="
echo "  Test Summary"
echo "=================================================="
echo ""
echo "To fully test the system:"
echo ""
echo "  1. Start Docker:    open -a Docker"
echo "  2. Start services:  docker-compose up -d"
echo "  3. Start Ollama:    ollama serve"
echo "  4. Pull models:     ollama pull qwen3:8b && ollama pull bge-m3"
echo "  5. Start backend:   cd backend && uvicorn main:app --reload"
echo "  6. Seed data:       python scripts/seed_data.py"
echo "  7. Start frontend:  cd frontend && npm run dev"
echo "  8. Open browser:    http://localhost:3000"
echo ""
echo "Login credentials:"
echo "  Admin: admin / admin123"
echo "  User:  user / user123"
echo ""
