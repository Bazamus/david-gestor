#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build del cliente..."

# Instalar dependencias
npm install

# Build del proyecto
npm run build

echo "✅ Build del cliente completado"
