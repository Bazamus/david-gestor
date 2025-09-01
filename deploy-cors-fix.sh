#!/bin/bash

echo "🚀 Aplicando fix de CORS para Netlify..."

# Hacer commit de los cambios
git add server/src/index.ts
git commit -m "Fix CORS: Permitir acceso desde Netlify y deshabilitar restricciones de seguridad temporalmente"

# Push al repositorio
git push origin main

echo "✅ Cambios enviados al repositorio"
echo "🔄 Render debería hacer deploy automático en unos minutos"
echo "📝 Verifica el deploy en: https://david-gestor-api.onrender.com"
