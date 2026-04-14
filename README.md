# 🚀 Startup CRM — Guía de instalación y ejecución

Este proyecto es un monorepo con **frontend** (Next.js) y **backend** (NestJS + Prisma) usando Turborepo.

---

## 📋 Requisitos previos

| Herramienta | Descarga |
|---|---|
| Git | https://git-scm.com/downloads |
| Node.js (v18 o superior) | https://nodejs.org |
| Docker Desktop | https://www.docker.com/products/docker-desktop |

---

## 📥 1. Clonar el repositorio

```bash
git clone https://github.com/No-Country-simulation/S03-26-Equipo-13-Web-App.git
cd S03-26-Equipo-13-Web-App
```

---

## 🐳 2. Levantar la base de datos y Redis con Docker

```bash
docker-compose up -d
```

Levanta:
- **PostgreSQL** en el puerto `5432`
- **Redis** en el puerto `6379`

---

## ⚙️ 3. Configurar variables de entorno del backend

```bash
cd apps/api
cp .env.example .env
```

Abre el `.env` y completa los valores:

```env
# Base de datos
DATABASE_URL="postgresql://crmuser:crmpass@localhost:5432/startupcrm"

# Auth
JWT_SECRET="supersecretkey123"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT="3001"

# WhatsApp Cloud API (Meta Developers)
WHATSAPP_TOKEN="tu_token_de_meta"
WHATSAPP_PHONE_ID="tu_phone_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="tu_business_account_id"
WEBHOOK_VERIFY_TOKEN="token_secreto_que_tu_eliges"

# Brevo (email) — opcional por ahora
BREVO_API_KEY=""
```

---

## 🗄️ 4. Generar Prisma y aplicar migraciones

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
```

---

## 📦 5. Instalar dependencias

```bash
cd ../..
npm install
```

---

## ▶️ 6. Levantar el proyecto

**Terminal 1 — Frontend:**
```bash
npm run dev
```
Disponible en: http://localhost:3000

**Terminal 2 — Backend:**
```bash
cd apps/api
PORT=3001 npm run start:dev
```
Disponible en: http://localhost:3001

**Swagger docs:** http://localhost:3001/docs

---

## 🧪 7. Correr tests

```bash
cd apps/api
npm run test
```

---

## 📡 8. Configurar webhook de WhatsApp (para desarrollo local)

Necesitas una URL pública para que Meta pueda llamar al webhook:

```bash
# Instalar ngrok si no lo tienes
npm install -g ngrok

# Con el backend corriendo, en otra terminal:
ngrok http 3001
```

Luego en el portal de Meta Developers → tu app → WhatsApp → Configuración:
- **Webhook URL:** `https://xxxx.ngrok.io/messages/webhook/whatsapp`
- **Verify Token:** el valor de `WEBHOOK_VERIFY_TOKEN` en tu `.env`
- **Suscribirse a:** `messages` y `message_status_updates`

---

## 🏗️ Arquitectura del backend

```
apps/api/src/
├── auth/           POST /auth/register, login, logout | GET /auth/me | PATCH /auth/setup-channels
├── contacts/       CRUD completo + tags + paginación
├── tasks/          CRUD + recordatorios con BullMQ
├── messages/       WhatsApp (Meta Cloud API) + Email (Brevo) + Socket.io en tiempo real
├── flows/          Flujos automáticos con BullMQ
├── templates/      Plantillas WhatsApp con webhook de aprobación Meta
├── analytics/      KPIs dashboard + exportación CSV en background
├── user/           CRUD usuarios (solo admin)
├── prisma/         PrismaService global
└── common/         Guards (JWT, Roles) + Decoradores
```

**22 endpoints documentados en Swagger** — todos con autenticación JWT excepto los webhooks de Meta.

---

## 📊 Estado del proyecto

### ✅ Backend — completo
- [x] Auth con JWT + Redis (refresh token)
- [x] CRUD Contactos con filtros, paginación y tags
- [x] Tareas con recordatorios BullMQ
- [x] Mensajería WhatsApp — envío real vía Meta Cloud API, webhook inbound, status updates (sent/delivered/read/failed)
- [x] Mensajería Email — estructura lista, pendiente conectar Brevo API key
- [x] Flujos automáticos con BullMQ
- [x] Plantillas WhatsApp con webhook de aprobación Meta
- [x] Analytics: KPIs + gráfica de mensajes + exportación CSV
- [x] WebSockets (Socket.io) para chat en tiempo real
- [x] Swagger documentación completa en `/docs`
- [x] Tests unitarios — 115 tests, 0 failures

### 🔲 Pendiente
- [ ] Frontend — 11 pantallas del MVP
- [ ] Integración Brevo SMTP (agregar BREVO_API_KEY al .env)
- [ ] Deploy en VPS / Railway
- [ ] Configurar webhook en Meta con URL de producción

---

## 🛑 Detener el proyecto

```bash
docker-compose down   # detener Docker
# Ctrl+C en cada terminal para detener frontend y backend
```

---

## 🐛 Problemas comunes

### `Cannot connect to the Docker daemon`
Docker Desktop no está corriendo. Ábrelo y espera el ícono de la ballena 🐳.

### `address already in use :::3000`
```bash
# Mac/Linux
pkill -f "next dev"
# Windows
netstat -ano | findstr :3000
taskkill /PID <número> /F
```

### `Conflict. The container name is already in use`
```bash
docker rm -f startupcrm_db startupcrm_redis
docker-compose up -d
```

### `Module '@prisma/client' has no exported member`
```bash
cd apps/api
npx prisma generate
```

### `Cannot find module 'src/...'`
El proyecto usa paths absolutos (`src/...`). Asegúrate de correr el backend desde `apps/api/`.
