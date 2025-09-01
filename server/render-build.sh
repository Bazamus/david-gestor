#!/bin/bash

# Script de build específico para Render
echo "🚀 Iniciando build del servidor para Render..."

# Instalar todas las dependencias (incluyendo devDependencies para el build)
npm install

# Build del proyecto TypeScript
npm run build

echo "✅ Build del servidor para Render completado"
