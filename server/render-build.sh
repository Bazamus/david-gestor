#!/bin/bash

# Script de build específico para Render
echo "🚀 Iniciando build del servidor para Render..."

# Instalar dependencias
npm ci --only=production

# Build del proyecto TypeScript
npm run build

echo "✅ Build del servidor para Render completado"
