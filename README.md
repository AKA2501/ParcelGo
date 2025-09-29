# ParcelGo

Microservices-powered courier platform with a React frontend, Spring Cloud Gateway, and Spring Boot services.

## Table of Contents

* [What Runs](#what-runs)
* [Prerequisites](#prerequisites)
* [Clone](#clone)
* [Directory Layout](#directory-layout)
* [Infrastructure (Postgres + Redis)](#infrastructure-postgres--redis)
* [Service Configuration](#service-configuration)

  * [user-service](#user-service)
  * [api-gateway](#api-gateway)
  * [routing-adapter](#routing-adapter)
* [Build & Run](#build--run)

  * [user-service](#user-service-1)
  * [api-gateway](#api-gateway-1)
  * [routing-adapter-optional](#routing-adapter-optional)
  * [order-service--tracking-service-optional](#order-service--tracking-service-optional)
  * [frontend](#frontend)
* [Quick API Smoke Tests](#quick-api-smoke-tests)
* [Common Pitfalls](#common-pitfalls)
* [Tear Down](#tear-down)
* [License](#license)

---

## What Runs

* **Frontend (React)**: `apps/web` (dev server)
* **API Gateway (Spring Cloud Gateway)**: `services/api-gateway` (port **8080**)
* **User Service (Spring Boot + JPA + Flyway)**: `services/user-service` (port **8101**)
* **Order Service** *(optional now)*: `services/order-service` (port **8102**)
* **Tracking Service** *(optional)*: `services/tracking-service` (HTTP+WS, port **8106**)
* **Routing Adapter** (geocoding proxy used by the map): `services/routing-adapter` (port **8110**)
* **Infra**: PostgreSQL + Redis (local or Docker)

**Gateway routes**

* `/api/users/**` → user-service:8101
* `/api/orders/**` → order-service:8102
* `/api/tracking/**` and `/ws/**` → tracking-service:8106
* `/api/geo/**` → routing-adapter:8110
* `/api/drivers/**` → user-service:8101

---

## Prerequisites

* **Java 17** (or 21)
* **Maven 3.9+**
* **Node 18+** (or 20+), **npm** (or **pnpm**)
* **Docker** (recommended for Postgres/Redis) *or* local installs
* **Git**

Quick checks:

```bash
java -version
mvn -v
node -v
npm -v
docker --version
```

---

## Clone

```bash
git clone <your-repo-url> parcelgo
cd parcelgo
```

---

## Directory Layout

```
apps/
  web/                       # React app (Vite/CRA)
services/
  api-gateway/               # Spring Cloud Gateway (8080)
  user-service/              # Users + Drivers (8101)
  order-service/             # (optional) Orders (8102)
  tracking-service/          # (optional) Tracking HTTP+WS (8106)
  routing-adapter/           # Node geocoding proxy (8110)
```

---

## Infrastructure (Postgres + Redis)

### Option A: Docker (recommended)

Create `docker-compose.yml` at repo root (if not present):

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: userdb
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports: ["6379:6379"]

volumes:
  pgdata:
```

Start:

```bash
docker compose up -d
```

### Option B: Local installs

* Postgres on `localhost:5432`; create DB `userdb` with user/password (e.g. `postgres/postgres`)
* Redis on `localhost:6379`

---

## Service Configuration

### user-service

`services/user-service/src/main/resources/application.yml`

```yaml
server:
  port: 8101

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/userdb
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate      # rely on Flyway, not auto DDL
    open-in-view: false
  flyway:
    enabled: true
    validate-migration-naming: true
```

**Flyway migrations** live under:

```
services/user-service/src/main/resources/db/migration/
```

Use **double underscore** in filenames:

* `V2__create_drivers.sql`
* `V3__create_driver_schedule.sql`

If naming is wrong, Flyway skips files.

### api-gateway

Ensure drivers route is present in `services/api-gateway/src/main/resources/application.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8101
          predicates: [ Path=/api/users/** ]
          filters: [ StripPrefix=1 ]
        - id: user-service-drivers
          uri: http://localhost:8101
          predicates: [ Path=/api/drivers/** ]
          filters: [ StripPrefix=1 ]
        - id: order-service
          uri: http://localhost:8102
          predicates: [ Path=/api/orders/** ]
          filters: [ StripPrefix=1 ]
        - id: tracking-service-http
          uri: http://localhost:8106
          predicates: [ Path=/api/tracking/** ]
          filters: [ StripPrefix=1 ]
        - id: tracking-service-ws
          uri: http://localhost:8106
          predicates: [ Path=/ws/** ]
        - id: routing-adapter
          uri: http://localhost:8110
          predicates: [ Path=/api/geo/** ]
          filters: [ StripPrefix=1 ]
```

### routing-adapter

If your repo includes the Node routing adapter:

```bash
cd services/routing-adapter
npm i
npm run dev    # or: npm start
```

It should listen on **8110** to match the gateway route.

---

## Build & Run

### user-service

```bash
cd services/user-service
mvn spring-boot:run
```

Watch logs for:

```
Migrating schema "public" to version "2 - create drivers"
Migrating schema "public" to version "3 - create driver schedule"
```

If you see “relation does not exist”, your migration filenames are likely wrong.

### api-gateway

```bash
cd services/api-gateway
mvn spring-boot:run
```

### routing-adapter (optional)

```bash
cd services/routing-adapter
npm i
npm run dev
```

### order-service & tracking-service (optional)

```bash
cd services/order-service
mvn spring-boot:run

cd ../tracking-service
mvn spring-boot:run
```

### frontend

```bash
cd apps/web
npm i        # or: pnpm i
npm run dev  # (Vite) or npm start (CRA)
```

Open the printed URL (e.g., `http://localhost:5173`).

---

## Quick API Smoke Tests

### Create a driver

```bash
curl -X POST http://localhost:8080/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Sam Courier",
    "email":"sam@example.com",
    "phone":"+919999999999",
    "vehicleRegistration":"DL-01-AB-1234",
    "maxWeightKg": 20,
    "startAddress": { "line1":"NH24 Bypass", "city":"Delhi", "state":"Delhi", "postalCode":"110091", "country":"IN", "latitude":28.6129, "longitude":77.2295 },
    "endAddress":   { "line1":"Sector 44", "city":"Gurugram", "state":"Haryana", "postalCode":"122003", "country":"IN", "latitude":28.4510, "longitude":77.0650 },
    "schedule":[
      {"day":1,"enabled":true,"start":"09:00","end":"18:00"},
      {"day":2,"enabled":true,"start":"09:00","end":"18:00"},
      {"day":3,"enabled":true,"start":"09:00","end":"18:00"},
      {"day":4,"enabled":true,"start":"09:00","end":"18:00"},
      {"day":5,"enabled":true,"start":"09:00","end":"18:00"}
    ]
  }'
```

### List drivers

```bash
curl http://localhost:8080/api/drivers
```

If these work from curl, the frontend will work through the gateway too.

---

## Common Pitfalls

* **Flyway skipped migrations**

  * Filenames must be `V<version>__<description>.sql` (**double underscore**).
  * Migrations directory: `services/user-service/src/main/resources/db/migration/`.
  * Add `spring.flyway.validate-migration-naming=true` to catch mistakes.

* **“relation does not exist” on driver_schedule**

  * Means `drivers` table wasn’t created yet; fix V2 filename and restart.

* **Ports already in use**

  * Change `server.port` in each `application.yml` or free the port.

* **CORS errors**

  * Call APIs via the gateway base URL (e.g., `http://localhost:8080/api/...`).
  * Gateway `globalcors` is open in `application.yml`.

* **Lat/Lng not saving**

  * Trace the chain:

    1. **Frontend console** payload has lat/lng.
    2. **Controller log** prints DTO with lat/lng.
    3. **Service log** before `save()` shows entity has lat/lng.
    4. **DB query**:
       `select start_lat,start_lng,end_lat,end_lng from drivers order by id desc limit 5;`
  * If it disappears at a step, fix that layer (DTO field names, mapping, schema).

* **Geocoding not working**

  * Ensure **routing-adapter** is running on **8110** (or point the frontend to your own geocoding API and update gateway config).

---

## Tear Down

```bash
# stop services (Ctrl+C in their terminals)
# stop and remove infra
docker compose down -v
```

---

## License

MIT (or your chosen license).
