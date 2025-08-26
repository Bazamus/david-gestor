#!/bin/bash

# 🚀 Script de Preparación para Despliegue en Vercel
# Este script prepara el proyecto para ser subido a GitHub y desplegado en Vercel

echo "🚀 Preparando proyecto para despliegue en Vercel..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto (project-manager/)"
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# Verificar archivos críticos
required_files=(
    "package.json"
    "vercel.json"
    "README.md"
    "DEPLOYMENT.md"
    ".gitignore"
    "client/package.json"
    "server/package.json"
    "api/index.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Archivo faltante: $file"
        exit 1
    fi
done

print_success "Estructura del proyecto verificada"

# Verificar que no hay archivos .env committeados
print_status "Verificando archivos de configuración..."

if [ -f ".env" ] || [ -f "client/.env" ] || [ -f "server/.env" ]; then
    print_warning "Se encontraron archivos .env. Asegúrate de que estén en .gitignore"
fi

# Verificar que los archivos de ejemplo existen
if [ ! -f "client/env.example" ] || [ ! -f "server/env.example" ]; then
    print_warning "Archivos env.example faltantes. Creando..."
    
    if [ ! -f "client/env.example" ]; then
        cat > client/env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration (if needed for direct client access)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=Gestor de Proyectos
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_TIME_TRACKING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_IMPORT=true
EOF
    fi
    
    if [ ! -f "server/env.example" ]; then
        cat > server/env.example << 'EOF'
# Configuración del servidor
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Rate Limiting (Development)
DISABLE_RATE_LIMIT=true
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
EOF
    fi
fi

print_success "Archivos de configuración verificados"

# Verificar dependencias
print_status "Verificando dependencias..."

if [ ! -d "node_modules" ]; then
    print_warning "node_modules no encontrado. Instalando dependencias..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    print_warning "client/node_modules no encontrado. Instalando dependencias del cliente..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    print_warning "server/node_modules no encontrado. Instalando dependencias del servidor..."
    cd server && npm install && cd ..
fi

print_success "Dependencias verificadas"

# Verificar que el build funciona
print_status "Probando build del proyecto..."

# Build del servidor
print_status "Building servidor..."
cd server
if npm run build; then
    print_success "Build del servidor exitoso"
else
    print_error "Error en build del servidor"
    exit 1
fi
cd ..

# Build del cliente
print_status "Building cliente..."
cd client
if npm run build; then
    print_success "Build del cliente exitoso"
else
    print_error "Error en build del cliente"
    exit 1
fi
cd ..

print_success "Build del proyecto exitoso"

# Verificar configuración de Git
print_status "Verificando configuración de Git..."

if [ ! -d ".git" ]; then
    print_error "No se encontró repositorio Git. Inicializa Git primero:"
    echo "  git init"
    echo "  git remote add origin https://github.com/Bazamus/gestor-proyectos.git"
    exit 1
fi

# Verificar que el remote está configurado correctamente
if ! git remote get-url origin | grep -q "Bazamus/gestor-proyectos"; then
    print_warning "El remote origin no apunta al repositorio correcto"
    print_status "Configurando remote origin..."
    git remote set-url origin https://github.com/Bazamus/gestor-proyectos.git
fi

print_success "Configuración de Git verificada"

# Mostrar estado actual de Git
print_status "Estado actual del repositorio:"
git status --porcelain

# Preguntar si quiere hacer commit y push
echo ""
read -p "¿Quieres hacer commit y push de los cambios? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Haciendo commit y push..."
    
    # Agregar todos los archivos
    git add .
    
    # Commit
    git commit -m "Preparar proyecto para despliegue en Vercel
    
    - Agregar configuración de Vercel (vercel.json)
    - Crear archivo de API serverless (api/index.ts)
    - Actualizar README.md con instrucciones de despliegue
    - Agregar archivos de ejemplo para variables de entorno
    - Configurar scripts de build y despliegue
    - Agregar .gitignore completo
    - Crear guía de despliegue detallada"
    
    # Push
    if git push origin main; then
        print_success "Cambios subidos exitosamente a GitHub"
    else
        print_error "Error al subir cambios a GitHub"
        exit 1
    fi
else
    print_warning "No se hicieron cambios en Git. Recuerda hacer commit y push manualmente:"
    echo "  git add ."
    echo "  git commit -m 'Preparar para despliegue en Vercel'"
    echo "  git push origin main"
fi

echo ""
print_success "🎉 Proyecto preparado para despliegue en Vercel!"
echo ""
print_status "Próximos pasos:"
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Haz clic en 'New Project'"
echo "3. Importa el repositorio 'Bazamus/gestor-proyectos'"
echo "4. Configura las variables de entorno según DEPLOYMENT.md"
echo "5. Haz clic en 'Deploy'"
echo ""
print_status "Para más detalles, consulta DEPLOYMENT.md"
echo ""
