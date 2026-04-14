#!/usr/bin/env bash
# deploy.sh — Build y arranque de producción (Turborepo + PM2)
set -euo pipefail

ROOT="/var/www/S03-26-Equipo-13-Web-App"
cd "$ROOT"

echo "==> [1/5] Instalando dependencias..."
npm ci --prefer-offline

echo "==> [2/5] Generando cliente Prisma..."
cd apps/api && npx prisma generate && cd "$ROOT"

echo "==> [3/5] Ejecutando migraciones de base de datos..."
cd apps/api && npx prisma migrate deploy && cd "$ROOT"

echo "==> [4/5] Construyendo apps (turbo build)..."
npm run build

echo "==> [5/5] Iniciando/recargando PM2..."
if pm2 list | grep -q "crm-api"; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi

pm2 save
pm2 status

echo ""
echo "Despliegue completado."
echo "  Frontend : https://vigu.blog"
echo "  Backend  : https://api.vigu.blog"
echo "  API Docs : https://api.vigu.blog/api"
