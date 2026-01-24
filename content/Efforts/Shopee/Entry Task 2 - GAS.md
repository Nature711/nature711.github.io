---
title:
draft: true
tags:
date: 2026-01-21
---
## Before GAS

### Characteristic 

- Custom HTTP server: manual net/http with JSON endpoints
- Custom TCP server: raw TCP with protobuf
- Manual wiring: main.go starts both servers with goroutines
- Environment-based config: config.LoadConfig() from env vars
- Direct dependencies: manual initialization of DB, cache, pools

### Flow

```
Browser
  ↓
HTTP server (net/http)
  ↓
TCP server (custom protobuf)
  ↓
MySQL / Redis
```

1. Browser → HTTP Server (port 8080)
2. HTTP Server → TCP Server (raw TCP, protobuf)
3. TCP Server → MySQL (direct connection)
4. TCP Server → Redis (direct connection)
5. Response flows back

---
## After GAS

### Characteristic

- Protobuf-based services: RPC-style service definitions
- Dependency injection: `inject:""` tags for dependencies
- Module registration: mod/server/module.go registers services
- YAML configuration: `etc/server.yml` instead of env vars
- Built-in infrastructure: Spex handles HTTP/TCP, health checks, logging

### Flow

```
User Browser
    ↓ (HTTP Request)
[GAS HTTP Service]
    ↓ (SPEX Call via SPEX Client SPI)
[GAS SPEX Service]
    ↓ (DB/Redis via SPIs)
[MySQL RDS] + [Redis CacheCloud]
```

1. Browser → GAS **HTTP Service** (deployed CMDB Service)
2. HTTP Service → GAS **SPEX Service** (another deployed CMDB Service, via SPEX network)
3. SPEX Service → RDS MySQL (via DB SPI)
4. SPEX Service → CacheCloud Redis (via Cache SPI)
5. Response flows back through SPEX → HTTP

---
## Mapping

### TCP Server → GAS SPEX Service

- Raw TCP + protobuf → **SPEX Server SPI**
- Business logic stays, middleware access via GAS SPIs
- Serves internal RPC calls within Shopee's service mesh

### HTTP Server → GAS HTTP Service

- HTTP endpoints → HTTP Server SPI
- Acts as gateway: HTTP in → SPEX calls out → HTTP response back
- Uses **SPEX Client SPI** to call your SPEX service

### MySQL → DB SPI (GDBC)

- Direct MySQL client → GAS DB SPI
- Config from SPEX config center

### Redis → Cache SPI

- Direct Redis client → GAS Cache SPI
- Config from SPEX config center

### Config files → SPEX Config Center

- All configs centralized and managed via Config SPI

---
## Clarification

### The Role of HTTP Service

Old TCP Server → New SPEX Server
- Handles business logic
- Uses **SPEX Server SPI** (acts as *server*, receives requests)

Old HTTP Server → New HTTP Server -- also **acts as a SPEX Client** ✅ 
- Still serves HTTP requests to browsers
- Uses **HTTP Server SPI** (acts as *HTTP server*)
- Uses **SPEX Client SPI** (acts as ***SPEX client*** to call your SPEX service / server)

> [!important] The new HTTP service has 2 roles: 
> 1. **Server role**: receives HTTP requests from browsers
> 2. **Client role**: calls (via SPEX Client SPI) SPEX service (original TCP server)

### Ingress vs. Egress (in GAS Terms)

#### HTTP Service

- **Ingress SPI**: HTTP Server SPI (receives HTTP)
- **Egress SPI**: SPEX Client SPI (sends SPEX calls)

#### SPEX Service

- **Ingress SPI**: SPEX Server SPI (receives SPEX calls)
- **Egress SPI**: DB SPI + Cache SPI (sends DB/Redis calls)

---
## Request Flow

```
1. Client sends HTTP POST to http://localhost:8080/api/echo
   ↓
2. HTTP Server SPI receives request
   ↓
3. Routes to httpService.handleEcho()
   ↓
4. Creates SPEX request: pb.EchoRequest{Data: "hello"}
   ↓
5. SPEX Client calls: spexClient.Echo(ctx, spexReq)
   ↓
6. SPEX Client Agent:
   - Looks up "voucher.tianranhuspex" in SPEX registry
   - Finds service instance(s)
   - Serializes request to protobuf
   - Sends via Unix socket (/tmp/spex.sock) to SPEX agent
   ↓
7. SPEX Agent routes to SPEX service instance
   ↓
8. SPEX Server SPI receives RPC call
   ↓
9. Routes to spexService.Echo() handler
   ↓
10. Business logic: strings.ToUpper(req.GetData())
    ↓
11. Returns pb.EchoResponse{Data: "HELLO"}
    ↓
12. Response flows back through SPEX network
    ↓
13. HTTP service receives response
    ↓
14. Returns JSON: {"status": "success", "data": "HELLO"}
```

```
┌─────────────────────────────────────────────────────────┐
│                    SPEX Network                         │
│  (Service Discovery & RPC via Unix Socket)              │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐              │
│  │ SPEX Service │◄────────┤ HTTP Service │              │
│  │   (Server)   │  RPC    │   (Client)   │              │
│  └──────────────┘         └──────────────┘              │
│        │                         │                      │
│        └─────────┬───────────────┘                      │
│                  │                                      │
│            /tmp/spex.sock                               │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐
│  SPEX Service    │              │  HTTP Service    │
│                  │              │                  │
│  Admin: :8081    │              │  Admin: :8082    │
│  (health, etc)   │              │  (health, etc)   │
│                  │              │                  │
│  SPEX RPC:       │              │  HTTP API: :8080 │
│  (via socket)    │              │  (/api/echo)     │
└──────────────────┘              └──────────────────┘
```

```
curl -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -H "shopee-baggage: PFB=$PFB_NAME" \
  -d '{"data": "hello world"}'
```
