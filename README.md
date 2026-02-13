# EcoNova Trace

Sistema de trazabilidad para economía circular — pirólisis de plástico agrícola → combustible alternativo.

Registra la cadena completa: **origen del residuo → pirólisis → producto → laboratorio → certificado digital verificable**.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React + Tailwind CSS
- **Database:** PostgreSQL + Prisma
- **Auth:** JWT (jose, edge-compatible)
- **Deploy:** Railway

## Setup Local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar env vars
cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET

# 3. Crear tablas en DB
npx prisma db push

# 4. Seed con datos reales (ECO-001 y ECO-002)
npm run db:seed

# 5. Iniciar dev server
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

**Login de prueba:**
- Email: `daniel@econova.com.mx`
- Password: `change-me-on-first-login` ← cambiar después del primer login

## Deploy en Railway

1. Crear proyecto en Railway
2. Agregar PostgreSQL addon
3. Conectar repo de GitHub
4. Configurar variables de entorno:
   - `DATABASE_URL` (auto de Railway PostgreSQL)
   - `JWT_SECRET` (generar: `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` = `https://trace.econova.com.mx`
5. Custom domain: `trace.econova.com.mx`

## API Routes

```
POST   /api/auth/login          Login
GET    /api/batches              Listar lotes
POST   /api/batches              Crear lote
GET    /api/batches/:id          Detalle de lote
PATCH  /api/batches/:id          Actualizar lote
GET    /api/batches/:id/readings Lecturas térmicas
POST   /api/batches/:id/readings Registrar lectura
GET    /api/batches/:id/events   Eventos operativos
POST   /api/batches/:id/events   Registrar evento
GET    /api/batches/:id/lab      Resultados de lab
POST   /api/batches/:id/lab      Agregar resultado lab
POST   /api/batches/:id/certificate  Generar certificado
GET    /api/certificates/:code   Verificación pública
GET    /api/stats                KPIs globales
```

## GHG Methodology

Cálculo de ciclo de vida completo (hasta combustión del aceite):

- **Sin EcoNova:** Quema a cielo abierto → IPCC 2006 Vol 5 Table 5.3
- **Con EcoNova:** Pirólisis (diesel + electricidad) + combustión aceite − char secuestrado
- **Resultado:** ~88% reducción de emisiones por lote

---

**EcoNova México** · Economía circular que se opera, se mide y se demuestra.
