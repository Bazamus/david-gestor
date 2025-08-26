# 🚀 Script de Preparación para Despliegue en Vercel (PowerShell)
# Este script prepara el proyecto para ser subido a GitHub y desplegado en Vercel

Write-Host "🚀 Preparando proyecto para despliegue en Vercel..." -ForegroundColor Blue

# Función para imprimir mensajes con colores
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json") -or -not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Error "Este script debe ejecutarse desde la raíz del proyecto (project-manager/)"
    exit 1
}

Write-Status "Verificando estructura del proyecto..."

# Verificar archivos críticos
$requiredFiles = @(
    "package.json",
    "vercel.json",
    "README.md",
    "DEPLOYMENT.md",
    ".gitignore",
    "client/package.json",
    "server/package.json",
    "api/index.ts"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "Archivo faltante: $file"
        exit 1
    }
}

Write-Success "Estructura del proyecto verificada"

# Verificar que no hay archivos .env committeados
Write-Status "Verificando archivos de configuración..."

if ((Test-Path ".env") -or (Test-Path "client/.env") -or (Test-Path "server/.env")) {
    Write-Warning "Se encontraron archivos .env. Asegúrate de que estén en .gitignore"
}

# Verificar que los archivos de ejemplo existen
if (-not (Test-Path "client/env.example") -or -not (Test-Path "server/env.example")) {
    Write-Warning "Archivos env.example faltantes. Creando..."
    
    if (-not (Test-Path "client/env.example")) {
        @"
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
"@ | Out-File -FilePath "client/env.example" -Encoding UTF8
    }
    
    if (-not (Test-Path "server/env.example")) {
        @"
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
"@ | Out-File -FilePath "server/env.example" -Encoding UTF8
    }
}

Write-Success "Archivos de configuración verificados"

# Verificar dependencias
Write-Status "Verificando dependencias..."

if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules no encontrado. Instalando dependencias..."
    npm install
}

if (-not (Test-Path "client/node_modules")) {
    Write-Warning "client/node_modules no encontrado. Instalando dependencias del cliente..."
    Set-Location client
    npm install
    Set-Location ..
}

if (-not (Test-Path "server/node_modules")) {
    Write-Warning "server/node_modules no encontrado. Instalando dependencias del servidor..."
    Set-Location server
    npm install
    Set-Location ..
}

Write-Success "Dependencias verificadas"

# Verificar que el build funciona
Write-Status "Probando build del proyecto..."

# Build del servidor
Write-Status "Building servidor..."
Set-Location server
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build del servidor exitoso"
} else {
    Write-Error "Error en build del servidor"
    exit 1
}
Set-Location ..

# Build del cliente
Write-Status "Building cliente..."
Set-Location client
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build del cliente exitoso"
} else {
    Write-Error "Error en build del cliente"
    exit 1
}
Set-Location ..

Write-Success "Build del proyecto exitoso"

# Verificar configuración de Git
Write-Status "Verificando configuración de Git..."

if (-not (Test-Path ".git")) {
    Write-Error "No se encontró repositorio Git. Inicializa Git primero:"
    Write-Host "  git init" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/Bazamus/gestor-proyectos.git" -ForegroundColor Yellow
    exit 1
}

# Verificar que el remote está configurado correctamente
$remoteUrl = git remote get-url origin
if ($remoteUrl -notlike "*Bazamus/gestor-proyectos*") {
    Write-Warning "El remote origin no apunta al repositorio correcto"
    Write-Status "Configurando remote origin..."
    git remote set-url origin https://github.com/Bazamus/gestor-proyectos.git
}

Write-Success "Configuración de Git verificada"

# Mostrar estado actual de Git
Write-Status "Estado actual del repositorio:"
git status --porcelain

# Preguntar si quiere hacer commit y push
Write-Host ""
$response = Read-Host "¿Quieres hacer commit y push de los cambios? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Status "Haciendo commit y push..."
    
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
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cambios subidos exitosamente a GitHub"
    } else {
        Write-Error "Error al subir cambios a GitHub"
        exit 1
    }
} else {
    Write-Warning "No se hicieron cambios en Git. Recuerda hacer commit y push manualmente:"
    Write-Host "  git add ." -ForegroundColor Yellow
    Write-Host "  git commit -m 'Preparar para despliegue en Vercel'" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Yellow
}

Write-Host ""
Write-Success "🎉 Proyecto preparado para despliegue en Vercel!"
Write-Host ""
Write-Status "Próximos pasos:"
Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Haz clic en 'New Project'" -ForegroundColor Cyan
Write-Host "3. Importa el repositorio 'Bazamus/gestor-proyectos'" -ForegroundColor Cyan
Write-Host "4. Configura las variables de entorno según DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "5. Haz clic en 'Deploy'" -ForegroundColor Cyan
Write-Host ""
Write-Status "Para más detalles, consulta DEPLOYMENT.md"
Write-Host ""
