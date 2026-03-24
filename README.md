# 🚀 Startup CRM - Guía de instalación y ejecución

Este proyecto es un monorepo con **frontend** (Next.js) y **backend** (NestJS + Prisma) usando Turborepo.

---

## 📋 Requisitos previos

Instala las siguientes herramientas antes de comenzar:

| Herramienta | Descarga |
|---|---|
| Git | https://git-scm.com/downloads |
| Node.js (v18 o superior) | https://nodejs.org |
| Docker Desktop | https://www.docker.com/products/docker-desktop |

---

## 📥 1. Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/No-Country-simulation/S03-26-Equipo-13-Web-App.git
cd S03-26-Equipo-13-Web-App
```

---

## 🐳 2. Levantar la base de datos y Redis con Docker

> ⚠️ Asegúrate de que **Docker Desktop esté abierto y corriendo** antes de ejecutar este comando.

```bash
docker-compose up -d
```

Esto levanta dos servicios:
- **PostgreSQL** en el puerto `5432`
- **Redis** en el puerto `6379`

---

## ⚙️ 3. Configurar variables de entorno del backend

Entra a la carpeta del backend y crea el archivo `.env`:

```bash
cd apps/api
cp .env.example .env
```

Abre el archivo `.env` y reemplaza su contenido con esto:

```env
DATABASE_URL="postgresql://crmuser:crmpass@localhost:5432/startupcrm"
JWT_SECRET="supersecretkey123"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT="3001"
```

**Cómo abrir el `.env` según tu sistema:**

- **Mac:** `open -e .env`
- **Windows:** `notepad .env`
- **Linux:** `nano .env`

---

## 🗄️ 4. Generar el cliente de Prisma y aplicar migraciones

Desde la carpeta `apps/api`, ejecuta:

```bash
npx prisma generate
npx prisma migrate deploy
```

---

## 📦 5. Instalar dependencias

Vuelve a la raíz del proyecto e instala todo:

```bash
cd ../..
npm install
```

---

## ▶️ 6. Levantar el proyecto

### Frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

---

### Backend

Abre una **segunda terminal**, entra a la carpeta del api y córrelo:

```bash
cd apps/api
PORT=3001 npm run start:dev
```

El backend estará disponible en: **http://localhost:3001**

---

## 📖 7. Ver la documentación de la API (Swagger)

Con el backend corriendo, abre en el navegador:

```
http://localhost:3001/docs
```

Ahí encontrarás todos los endpoints documentados e interactivos.

---

## 🔄 Cómo volver a levantar el proyecto (próximas veces)

Una vez instalado todo, solo necesitas hacer esto cada vez que quieras trabajar:

**Terminal 1 — Frontend:**
```bash
cd S03-26-Equipo-13-Web-App
docker-compose up -d
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd S03-26-Equipo-13-Web-App/apps/api
PORT=3001 npm run start:dev
```

---

## 🛑 Detener el proyecto

Para detener Docker:
```bash
docker-compose down
```

Para detener el frontend o backend: presiona `Ctrl + C` en cada terminal.

---

## 🐛 Problemas comunes

### `Cannot connect to the Docker daemon`
Docker Desktop no está corriendo. Ábrelo desde tus aplicaciones y espera a que aparezca el ícono de la ballena 🐳.

### `address already in use :::3000`
Ya hay un proceso usando ese puerto. Mátalo con:
- **Mac/Linux:** `pkill -f "next dev"`
- **Windows:** `netstat -ano | findstr :3000` y luego `taskkill /PID <número> /F`

### `Conflict. The container name is already in use`
Elimina los contenedores viejos:
```bash
docker rm -f startupcrm_db startupcrm_redis
docker-compose up -d
```

### `Module '@prisma/client' has no exported member`
Regenera el cliente de Prisma:
```bash
cd apps/api
npx prisma generate
```