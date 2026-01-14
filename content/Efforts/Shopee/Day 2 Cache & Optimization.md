---
title:
draft: true
tags:
date: 2026-01-08
---
## Step 2.1 — Config + toggles (no behavior change yet)

**Do**

- Add config (env-based) shared by both servers:
    
    - TCP addr, HTTP addr
        
    - timeouts (dial/read/write/db/http)
        
    - `CACHE_ENABLED`, Redis addr, cache TTL
        
- Wire config into `cmd/http` and `cmd/tcp` (still behaves same)
    

**Cursor rule**

```text
# Iter2-Step2.1: Config + toggles only

Implement ONLY:
- Add minimal config package (env-based) used by cmd/http and cmd/tcp.
- Config fields: HTTP_ADDR, TCP_ADDR, timeouts (HTTP/TCP dial/read/write/DB), CACHE_ENABLED, REDIS_ADDR, CACHE_TTL.
- Wire config into mains without changing business logic behavior.

Do NOT:
- Add Redis client
- Add new validations/timeouts behavior
- Change protobuf schema
```

>[!info]- Takeaway
>This step makes the system _configurable and controllable without changing code_, so that upcoming robustness and cache features can be safely added, toggled, and tuned. 
>This is achieved by introducing a centralized, environment-driven configuration (addresses, timeouts, cache flags, Redis settings) and wiring it into both the HTTP and TCP binaries, while deliberately keeping runtime behavior unchanged. 
>The outcome is that all operational decisions become explicit, adjustable knobs rather than hard-coded values, enabling clean iteration, safe comparisons (cache vs no cache), and disciplined system evolution in later steps.

---

## Step 2.2 — Timeouts & context (end-to-end)

**Do**

- HTTP server: handler-level timeout + request body size limit (login only)
    
- TCP client: dial timeout + read/write deadlines per request
    
- TCP server: read/write deadlines per connection/request
    
- MySQL: `QueryContext` with timeout context
    

**Cursor rule**

```text
# Iter2-Step2.2: Add timeouts + context deadlines end-to-end

Implement ONLY:
- HTTP: enforce handler timeout and limit body size for /login.
- TCP client: dial timeout + per-request read/write deadlines.
- TCP server: set read/write deadlines when reading/writing frames.
- MySQL: use context with timeout for user lookup query.

Do NOT:
- Add Redis cache
- Add new endpoints
- Add connection pooling beyond existing DB pool settings
```

> [!info] Takeaway
> This step ensures the system never hangs by explicitly bounding the lifetime of every operation across the request path (HTTP → TCP → MySQL). 
> This is achieved by adding handler-level HTTP timeouts and body limits, TCP dial/read/write deadlines on both client and server sides, and context-based timeouts for database queries. 
> The outcome is a service that fails fast and cleanly when dependencies are slow or unavailable, avoids resource leaks and goroutine buildup under concurrency, and produces stable, predictable behavior suitable for load testing and further iteration.

---

## Step 2.3 — Input validation + safe errors (no cache yet)

**Do**-

- Validate username/password: required + length bounds
    
- Standardize error behavior:
    
    - wrong password and unknown user → same generic error message
        
- Ensure errors always return a valid protobuf `LoginResponse` (no silent close)
    

_(Optional schema update: add `error_code` if you want; otherwise keep `error_message` but standardize strings.)_

**Cursor rule**

```text
# Iter2-Step2.3: Input validation + safe error semantics

Implement ONLY:
- Validate /login inputs: non-empty + basic length limits.
- In TCP login handler: return a generic auth failure message for both unknown user and wrong password.
- Ensure all error paths still write a valid framed protobuf LoginResponse.
- If adding error_code to protobuf, update both servers accordingly and keep changes minimal.

Do NOT:
- Add Redis cache
- Add profile updates
- Add performance tooling
```

> [!info] Takeaways
> This step makes the login path safe, predictable, and hard to misuse by enforcing input validation and consistent error behavior. 
> This is achieved by validating credentials early at the HTTP layer, re-validating at the TCP layer, and standardizing authentication failures so that unknown users and wrong passwords return the same generic response while always replying with a valid protobuf message. 
> The outcome is a stable and secure login API that rejects bad inputs cheaply, avoids information leakage, and behaves consistently under both normal and failure conditions.

---

## Step 2.4 — Request ID propagation + minimal structured logs

**Do**

- Generate `request_id` at HTTP layer (or accept from header) and include in TCP request
    
- TCP server logs: request_id, op=login, latency_ms, result, error type (safe)
    
- HTTP server logs: request_id, latency_ms, downstream error
    

_(If you don’t already have an envelope message with request_id, add it now; keep minimal.)_

**Cursor rule**

```text
# Iter2-Step2.4: request_id propagation + minimal structured logging

Implement ONLY:
- Add request_id propagation HTTP -> TCP:
  - generate request_id in HTTP if missing
  - include in protobuf request (either envelope or extend LoginRequest)
- Add minimal structured logs in both servers:
  - request_id, op, latency, status, cache_hit (placeholder for now)

Do NOT:
- Add Redis cache
- Add new endpoints
- Introduce heavy logging frameworks (use standard log package)
```

> [!info] Takeaway
> This step makes every login request traceable across the system so failures and latency can be understood under concurrency. 
> This is achieved by generating or propagating a `request_id` at the HTTP layer, passing it through the protobuf request to the TCP server, and emitting minimal, structured logs on both sides that include the request ID, operation, latency, result, and error type. 
> The outcome is an end-to-end correlated view of each request, enabling effective debugging, performance analysis, and confident iteration without adding heavy observability tooling.

> HTTP Latency: end-to-end, including: request parsing, validation, tcp client call, waiting for tcp response, response serialization 
> - this is about "how long the user wait"
> TCP Latency: pure business logic, cache lookup, db query, password verification
> - how long the core logic take, usually way faster than http latency

---

## Step 2.5 — Redis cache layer (TCP server only) + toggle

**Do**

- Add `internal/cache` with Redis client (go-redis)
    
- Implement login cache:
    
    - Key: `auth:<username>` → password_hash (and optionally nickname/avatar_ref)
        
    - TTL from config
        
- Behavior:
    
    - If cache enabled: try GET → if hit, verify password and return (if you cache profile too, return it)
        
    - If miss: query MySQL → SET cache → return
        
- Log cache hit/miss in TCP server
    

**Cursor rule**

```text
# Iter2-Step2.5: Redis cache for login (TCP server only) + toggle

Implement ONLY:
- Add Redis cache package and wire into TCP server behind CACHE_ENABLED flag.
- Cache keys: auth:<username> storing password_hash (optionally include nickname/avatar_ref if minimal).
- TTL configurable via CACHE_TTL.
- Login flow:
  - cache enabled: GET -> if hit, verify -> respond
  - miss: DB lookup -> SET -> respond
- Add logs for cache_hit true/false.

Do NOT:
- Access Redis from HTTP server
- Implement profile updates or cache invalidation beyond TTL
- Add load testing or perf tuning
```

> [!info] Takeaway


---

## Step 2.6 — Verification notes + minimal tests update

**Do**

- Update README run instructions:
    
    - how to run Redis
        
    - how to enable/disable cache
        
    - sample curl commands
        
- (Optional) Add a small unit test for cache key format / serialization if you have a codec
    

**Cursor rule**

```text
# Iter2-Step2.6: Docs + minimal verification

Implement ONLY:
- Update README with:
  - Redis startup instructions
  - env vars to toggle CACHE_ENABLED
  - expected log indicators for cache hit/miss
- Add minimal tests only if trivial (no big refactors).

Do NOT:
- Add performance report
- Add new features
```
