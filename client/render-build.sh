#!/bin/bash

# Script de build específico para Render
echo "🚀 Iniciando build del cliente para Render..."

# Instalar dependencias
npm install

# Build del proyecto
npm run build

echo "✅ Build del cliente para Render completado"
