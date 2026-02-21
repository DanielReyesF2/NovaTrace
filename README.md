# EcoNova Trace

Sistema de trazabilidad para economía circular — pirólisis de plástico agrícola → combustible alternativo.

Registra la cadena completa: **origen del residuo → pirólisis → producto → laboratorio → certificado digital verificable**.

## Problema que resuelve

En México, miles de toneladas de plástico agrícola (acolchados, mangueras, envases) terminan quemados a cielo abierto, liberando ~3.4 kg CO₂eq por cada kg de plástico. EcoNova transforma ese residuo en **aceite pirolítico** (combustible alternativo) mediante pirólisis, logrando una **reducción del ~88% de emisiones GEI**.

NovaTrace es la plataforma que **demuestra con datos verificables** cada lote procesado: desde el campo donde se recolectó el plástico, pasando por el reactor de pirólisis, hasta el certificado digital que un inversionista o auditor puede verificar escaneando un QR.

## Cadena de trazabilidad

```
Plástico agrícola (Michoacán, Jalisco, etc.)
        ↓
  Recolección + Transporte documentado
        ↓
  Planta EcoNova — Reactor DY-500
        ↓
  PIRÓLISIS (~8h, hasta 520°C)
  ├── Lecturas térmicas cada 5 min
  ├── Eventos operativos (válvulas, fases, incidentes)
  └── Fotos del proceso
        ↓
  Aceite pirolítico + Char (residuo sólido)
        ↓
  Laboratorio certificado (Diamond Internacional, SGS, Intertek)
  └── Pruebas ASTM: viscosidad, azufre, agua, flash point, densidad
        ↓
  Certificado digital verificable
  └── QR → /verify/{code} (público, sin login)
```

## Stack

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| **Framework** | Next.js 14 (App Router) | Full-stack, SSR para verificación pública |
| **Frontend** | React 18 + Tailwind CSS | Design system custom (paleta `eco-*`) |
| **Base de datos** | PostgreSQL (Neon) + Prisma 6.3 | Relacional, type-safe, migraciones |
| **Auth** | JWT via `jose` (HS256) | Edge-compatible, cookies HTTP-only |
| **Validación** | Zod | Schemas para todas las entradas de API |
| **Gráficas** | Recharts | Perfiles térmicos, tendencias, KPIs |
| **Mapas** | react-simple-maps | Mapa de México con orígenes de feedstock |
| **QR** | qrcode.react | Códigos para certificados |
| **PDF** | @react-pdf/renderer | Exportación de certificados |
| **AI** | Nova AI Gateway (Claude) | Análisis inteligente de lotes via SSE |
| **Deploy** | Railway / Vercel | DB en Neon, app en Railway o Vercel |

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
- Password: `change-me-on-first-login` — cambiar despues del primer login

### Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion (`prisma generate && next build`) |
| `npm run start` | Servidor de produccion |
| `npm run db:push` | Push del schema a la DB |
| `npm run db:migrate` | Correr migraciones |
| `npm run db:seed` | Seed base (2 lotes) |
| `npm run db:seed-flii` | Seed completo (12 lotes, curva de aprendizaje) |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:reset` | Reset completo de migraciones |

## Variables de entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string de Neon PostgreSQL | `postgresql://user:pass@ep-xxx.neon.tech/econova_trace?sslmode=require` |
| `JWT_SECRET` | Secret para firmar tokens JWT | Generar: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL publica de la app | `https://trace.econova.com.mx` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la app | `EcoNova Trace` |
| `NOVA_GATEWAY_URL` | Endpoint del Nova AI Gateway | `https://econova-ai-platform-production.up.railway.app` |
| `NOVA_API_KEY` | Bearer token para Nova AI | Token de autenticacion |

## Arquitectura

```
src/
├── app/
│   ├── (dashboard)/              # Rutas protegidas (requieren auth)
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── batch/[id]/page.tsx   # Detalle de lote
│   │   ├── analytics/page.tsx    # Analytics operativos
│   │   ├── impact/page.tsx       # Impacto ambiental (GHG)
│   │   └── map/page.tsx          # Mapa de trazabilidad Mexico
│   ├── (public)/                 # Rutas publicas
│   │   └── verify/[code]/        # Verificacion de certificado (QR)
│   ├── api/                      # 15+ endpoints REST
│   └── login/page.tsx            # Autenticacion
├── components/
│   ├── batch/       (11)         # BatchDetail, ThermalChart, SankeyFlow, AIInsights...
│   ├── analytics/   (8)          # KPIs, tendencias, comparaciones
│   ├── impact/      (5)          # GHG waterfall, creditos de carbono, proyecciones
│   ├── dashboard/   (3)          # Hero, pipeline, Nova AI summary
│   ├── nova/        (2)          # Chat flotante con AI
│   ├── map/         (2)          # Mapa interactivo de Mexico
│   └── ui/          (2)          # SkeletonLoader, AnimatedCounter
├── lib/
│   ├── auth.ts                   # JWT sign/verify, sesiones, RBAC
│   ├── ghg.ts                    # Calculadora GHG (IPCC 2006)
│   ├── nova-ai.ts                # Integracion Nova AI Gateway
│   ├── prisma.ts                 # Singleton Prisma Client
│   ├── utils.ts                  # Generacion de codigos de lote
│   └── validations.ts            # Schemas Zod
├── hooks/
│   └── useNovaChat.ts            # Hook SSE para streaming de AI
└── middleware.ts                  # Auth global
```

### Patrones clave

- **Server Components**: Las paginas son `async` y consultan Prisma directamente en el servidor
- **Client Components**: Charts, formularios, chat AI — usan `"use client"`
- **Serializacion**: `JSON.parse(JSON.stringify(data))` para pasar datos de Prisma a componentes cliente
- **Route Groups**: `(dashboard)` para rutas protegidas, `(public)` para verificacion de certificados
- **Middleware**: Verifica JWT en cada request, inyecta `x-user-id` y `x-user-role` en headers

## Modelo de datos

```
USER ─── Roles: ADMIN | OPERATOR | VIEWER

BATCH (entidad central, ~80 campos)
  ├── Identidad: codigo unico, fecha, estado (ACTIVE/COMPLETED/INCOMPLETE/TEST)
  ├── Feedstock: tipo, origen, peso, contaminacion %
  ├── Producto: litros aceite, peso residuo, rendimiento %
  ├── Proceso: duracion, temp maxima, diesel consumido
  ├── Energia: electricidad, gas recirculado, calorificos (ISO 14040)
  ├── Transporte: modo, distancia, combustible, CO2 (ISO 14040)
  ├── Emisiones: CO2, CH4, NOx, SOx, PM, agua (ISO 14040)
  ├── ISCC+: cert ID, balance de masa, metodo de asignacion
  ├── Verra: codigo plastico, escenario baseline, adicionalidad
  └── GHG: co2Baseline, co2Project, co2Avoided

  └── Relaciones 1:N →
      ├── READING        Lecturas termicas cada 5 min
      ├── PROCESS EVENT  Eventos operativos (valvulas, fases, incidentes)
      ├── PHOTO          Fotos (feedstock, proceso, producto, etiqueta)
      ├── LAB RESULT     Resultados de laboratorio (ASTM)
      └── CERTIFICATE    Certificados digitales (QR + SHA-256)
```

### Codigo de lote

Formato: `{Ano}/{Mes}/{Reactor}/{Feedstock}/{Consecutivo}`

```
C/02/1/LDPA/02
↑  ↑  ↑  ↑   ↑
|  |  |  |   └─ 2do lote del mes
|  |  |  └───── LDPE Agricola
|  |  └──────── Reactor 1 (DY-500)
|  └─────────── Febrero
└────────────── 2026 (A=2024, B=2025, C=2026)
```

## API Routes

```
POST   /api/auth/login              Login (email + password → JWT cookie)
POST   /api/auth/logout             Logout (limpia cookie)

GET    /api/batches                  Listar lotes
POST   /api/batches                  Crear lote (OPERATOR+)
GET    /api/batches/:id              Detalle completo de lote
PATCH  /api/batches/:id              Actualizar lote (auto-calcula GHG al completar)

GET    /api/batches/:id/readings     Lecturas termicas
POST   /api/batches/:id/readings     Registrar lectura (actualiza maxReactorTemp)
GET    /api/batches/:id/events       Eventos operativos
POST   /api/batches/:id/events       Registrar evento
GET    /api/batches/:id/photos       Fotos del lote
POST   /api/batches/:id/photos       Agregar foto
GET    /api/batches/:id/lab          Resultados de laboratorio
POST   /api/batches/:id/lab          Agregar resultado lab
POST   /api/batches/:id/certificate  Generar certificado digital (ADMIN)
GET    /api/batches/:id/insights     Analisis AI del lote

GET    /api/certificates/:code       Verificacion publica de certificado
GET    /api/stats                     KPIs globales (health check)
GET    /api/analytics                 Analytics detallados
POST   /api/nova/chat                Chat AI via SSE streaming
```

## Metodologia GHG

Calculo de ciclo de vida completo basado en estandares internacionales:

### Baseline (sin EcoNova)
Quema a cielo abierto — IPCC 2006 Vol 5 Table 5.3:
- CO₂: 3.08 kg/kg PE (98% oxidacion del 85.7% carbono)
- CH₄: 0.0065 kg/kg PE (GWP: 28)
- N₂O: 0.0005 kg/kg PE (GWP: 265)
- **Total: ~3.4 kg CO₂eq por kg de plastico**

### Proyecto (con EcoNova)
Pirolisis + ciclo de vida completo:
- Emisiones proceso: diesel (3.15 kg CO₂/kg) + electricidad (0.435 kg CO₂/kWh, IEA Mexico 2023)
- Combustion del aceite: cuando se usa como combustible downstream
- Secuestro de char: 15% del carbono queda atrapado en biochar (emisiones negativas)

### Resultado
- **~88% reduccion de emisiones por lote**
- CO₂ evitado = Baseline - Proyecto
- Se calcula automaticamente al completar un lote (PATCH con status=COMPLETED)

### Cumplimiento de estandares
- **ISO 14040:2006** — Evaluacion de ciclo de vida (LCA)
- **ISCC+** — Cadena de custodia, balance de masa
- **Verra Plastic Credits** — Creditos plasticos, adicionalidad, escenario baseline

## Roles y permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total: crear lotes, generar certificados, ver analytics |
| **OPERATOR** | Crear/actualizar lotes, registrar lecturas, eventos, fotos, lab |
| **VIEWER** | Solo lectura: dashboard, analytics, impacto, verificacion |

## Deploy

### Base de datos (Neon)

1. Crear proyecto en [Neon](https://neon.tech)
2. Copiar la connection string (`DATABASE_URL`)

### Aplicacion (Railway)

1. Conectar repo de GitHub
2. Configurar variables de entorno:
   - `DATABASE_URL` (connection string de Neon)
   - `JWT_SECRET` (generar: `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` = `https://trace.econova.com.mx`
   - `NOVA_GATEWAY_URL` (si se usa Nova AI)
   - `NOVA_API_KEY` (si se usa Nova AI)
3. Custom domain: `trace.econova.com.mx`
4. Health check: `/api/stats` (timeout 300s)
5. Start command: `npx prisma migrate deploy && npx next start -H 0.0.0.0 -p ${PORT:-3000}`

### Aplicacion (Vercel)

1. Conectar repo de GitHub
2. Mismas variables de entorno
3. Build command: `prisma generate && next build` (automatico)

## Nova AI

NovaTrace integra **Nova AI Gateway** (plataforma AI de EcoNova desplegada en Railway) para analisis inteligente:

### Insights de lote (`/api/batches/:id/insights`)
- Envia datos completos del lote (feedstock, temperaturas, eventos, lab, GHG)
- Nova genera analisis estructurado: resumen, highlights, analisis termico, recomendaciones
- Cache en memoria: 30 min (lotes activos), 24h (lotes completados)

### Chat flotante (`/api/nova/chat`)
- Widget de chat disponible en todas las paginas del dashboard
- SSE streaming para respuestas en tiempo real
- Persistencia de conversacion via sessionStorage

## Seeds disponibles

| Script | Lotes | Descripcion |
|--------|-------|-------------|
| `seed.ts` | 2 | Base: ECO-001 (completado, 50kg) + ECO-002 (incompleto, tapon) |
| `seed-flii.ts` | 12 | Curva de aprendizaje Oct 2024 → Feb 2025 (10% → 60% yield) |
| `seed-perfect.ts` | 1 | Lote ideal: 450kg, 330L aceite, 80% rendimiento, 109 lecturas |
| `seed-lote2-continuation.ts` | — | Correccion: lecturas faltantes del ECO-002 |

---

**EcoNova Mexico** · Economia circular que se opera, se mide y se demuestra.
