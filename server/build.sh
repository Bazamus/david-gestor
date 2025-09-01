#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build del servidor..."

# Instalar dependencias
npm install

# Build del proyecto TypeScript
npm run build

echo "✅ Build del servidor completado"
