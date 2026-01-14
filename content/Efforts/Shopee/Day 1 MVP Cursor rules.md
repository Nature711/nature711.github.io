---
title:
draft: true
tags:
date: 2026-01-08
---
## Step 1 — Repo skeleton + docs placeholders

**Actionable tasks**

- Create folder structure: `cmd/http`, `cmd/tcp`, `internal/{transport,proto,store,service}`, `docs/`
    
- Initialize Go module + basic Makefile (optional) / simple run commands in README
    
- Add empty doc files: `docs/design.md`, `docs/iteration.md`, `docs/checklist.md`
    

**Cursor rule (Step 1)**

```text
# Day1-Step1: Repo skeleton only

Implement ONLY:
- Create directories: cmd/http, cmd/tcp, internal/transport, internal/proto, internal/store, internal/service, docs
- Initialize go module (go.mod) and ensure `go test ./...` runs (even if no tests yet)
- Add minimal README with run placeholders
- Create empty docs files: docs/design.md, docs/iteration.md, docs/checklist.md

Do NOT:
- Add protobuf schemas
- Add TCP/HTTP servers
- Add MySQL/Redis
```

>[!info]- takeaways
> ### 1) “Two binaries” design
> 
> You’re intentionally building **two executables**:
> 
> - `cmd/http` → HTTP edge
>     
> - `cmd/tcp` → core service
>     
> 
> This mirrors real microservice boundaries. In Go, `cmd/` keeps this clean.
> 
> ### 2) “internal” package boundary
> 
> Go’s `internal/` is a language-enforced boundary:
> 
> - Anything inside `internal/` can only be imported by code within the parent module.
>     
> - Prevents accidental coupling and keeps your API surface small.
>     
> 
> ### 3) Layering as a discipline, not an idea
> 
> By creating separate directories early, you’re training:
> 
> - HTTP code cannot “reach into” DB code
>     
> - Business logic is not mixed with transport code
>     
> 
> The structure itself acts like guardrails.

---

## Step 2 — Protobuf schema (login only)

**Actionable tasks**

- Add `proto/auth.proto` (or `internal/proto/auth.proto`)
    
- Add generated Go code (use `protoc` output) and a short “how to generate” note in README
    
- Messages: `LoginRequest`, `LoginResponse` (plus optional envelope)
    

**Cursor rule (Step 2)**

```text
# Day1-Step2: Protobuf schema for Login only

Implement ONLY:
- Add protobuf definition for login:
  - LoginRequest { string username; string password; }
  - LoginResponse { bool success; string username; string nickname; string avatar_ref; string error_message; }
- Include a minimal top-level envelope ONLY if needed for future dispatch; otherwise keep simplest.
- Add generated Go code (or clearly document generation command if repo policy prefers not committing generated code).

Do NOT:
- Implement TCP framing or servers
- Implement DB access
- Implement HTTP endpoints
```

> [!info]- Takeaways
> 
> ### What protobuf is
> 
> Protobuf is a **schema + binary encoding** system:
> 
> - You define data structures in `.proto`
>     
> - `protoc` generates language-specific structs (Go types)
>     
> - You send the encoded bytes over the wire
>     
> 
> ### Why you need this now
> 
> Because HTTP and TCP server need a **shared language**:
> 
> - If you change fields later, you want backward compatibility
>     
> - You want efficient encoding for performance testing
>     
> 
> ### What you’re _not_ doing
> 
> You are not doing RPC (no gRPC). You are only doing:
> 
> - **data definitions**
>     
> - **serialization format**
>     
> 
> ### What you’re _not_ doing
> 
> You are not doing RPC (no gRPC). You are only doing:
> 
> - **data definitions**
>     
> - **serialization format**

---
## Step 3 — TCP framing utilities + unit test

**Actionable tasks**

- Implement length-prefixed framing in `internal/transport`
    
    - `WriteFrame(w, []byte)` / `ReadFrame(r)` or similar
        
- Unit test round-trip for framing (including boundary cases like empty / large payload)
    

**Cursor rule (Step 3)**

```text
# Day1-Step3: TCP length-prefixed framing + tests

Implement ONLY:
- In internal/transport, implement length-prefixed framing:
  - 4-byte big-endian uint32 length + payload bytes
  - ReadFrame must read exactly one frame from an io.Reader
  - WriteFrame writes one frame to an io.Writer
- Add unit tests for:
  - round-trip payload
  - multiple frames back-to-back
  - invalid length / short reads behavior (minimal, reasonable)

Do NOT:
- Start TCP server
- Add protobuf parsing/handling
- Add MySQL/HTTP
```

> [!info]- Takeaway
> > we need to do this because we're not allowed to use grpc. 
>
> **Problem:**  
> TCP is a **byte stream**, not a message protocol.  
> Reads and writes do **not** preserve message boundaries.
> 
> **Solution:**  
> Add a **framing protocol** so the receiver knows where one message ends.
> 
> **What we implement:**  
> A simple **length-prefixed frame**:
> 
> ```
> [4-byte big-endian length][message bytes]
> ```
> 
> **Why it’s needed:**
> 
> - Prevents partial reads / message mixing
>     
> - Enables reliable request–response over TCP
>     
> - Replaces what gRPC / net/rpc would normally hide
>     
> 
> **What Step 3 delivers:**
> 
> - `WriteFrame` → writes one framed message
>     
> - `ReadFrame` → reads exactly one framed message
>     
> - Unit tests prove correctness without any servers
>     
> 
> **Key takeaway:**
> 
> _Step 3 turns raw TCP into a reliable message channel._

> [!info]- Explanation
> Framing is needed because TCP is a byte stream with no message boundaries. 
> By adding a length-prefixed frame (`[length][protobuf bytes]`), the TCP server can safely read **exactly one request or response per frame**. 
> The framer enforces a **max frame size** so oversized messages are rejected early at the transport layer, before protobuf parsing or business logic runs, protecting memory and CPU. 
> This does **not** waste space: frames are variable-length, so a small message only adds a 4-byte header. 
> In effect, framing provides the minimal safety and message-delimiting guarantees that gRPC would normally handle for you.

---
## Step 4 — TCP server (login stub, no DB yet)

**Actionable tasks**

- Build `cmd/tcp` server:
    
    - listens on port
        
    - accepts connections
        
    - reads 1 framed protobuf request
        
    - returns a deterministic stub response (e.g., always “not implemented”)
        
- Add deadlines
    

**Cursor rule (Step 4)**

```text
# Day1-Step4: TCP server skeleton (Login stub)

Implement ONLY:
- cmd/tcp main that:
  - listens on TCP
  - accepts connections
  - per connection: read one frame, unmarshal LoginRequest, return LoginResponse (stubbed)
  - uses read/write deadlines
  - logs basic errors
- Keep service logic minimal: always return success=false with error_message="not implemented" (for now)

Do NOT:
- Add MySQL integration
- Add HTTP server
- Add caching or other operations
```

> [!info]- Takeaway
> ### 1) `cmd/tcp/main.go`
> 
> - Parse env/config (minimal): `TCP_ADDR` default `:9090`
>     
> - `net.Listen("tcp", addr)`
>     
> - accept loop
>     
> - for each conn: handle in goroutine
>     
> 
> ### 2) Connection handler
> 
> Per connection:
> 
> - set read/write deadlines (e.g. 2s–5s)
>     
> - `ReadFrame(conn)` → bytes
>     
> - `proto.Unmarshal` into `LoginRequest`
>     
> - create stub `LoginResponse`:
>     
>     - `success=false`
>         
>     - `error_message="not implemented"`
>         
> - `proto.Marshal(resp)` → bytes
>     
> - `WriteFrame(conn, bytes)`
>     
> 
> No business logic yet.

---

## Step 5 — MySQL store + real login verification (TCP server)

**Actionable tasks**

- Add `internal/store/mysql` with `GetUserByUsername`
    
- Add `users` table SQL in `scripts/sql/schema.sql` + `scripts/sql/seed_small.sql`
    
- Update TCP login handler to query DB and verify password
    
    - For MVP, acceptable: store plaintext in DB _temporarily_ but document TODO; better: bcrypt if allowed
        

**Cursor rule (Step 5)**

```text
# Day1-Step5: MySQL store + real login in TCP server

Implement ONLY:
- Add MySQL access layer in internal/store:
  - connect via go-sql-driver/mysql
  - function to fetch user row by username (password_hash(or password), nickname, avatar_ref)
  - configure connection pool minimally
- Update TCP login handler to:
  - query by username
  - verify password (prefer bcrypt; if not used, keep simplest and add TODO + doc note)
  - return LoginResponse with user fields on success, else error_message
- Add SQL scripts:
  - scripts/sql/schema.sql
  - scripts/sql/seed_small.sql (insert a few users for local testing)

Do NOT:
- Add Redis cache
- Add profile update endpoints
- Add seeding 10M
```

---

## Step 6 — HTTP server /login endpoint (thin forwarding client)

**Actionable tasks**

- Build `cmd/http` server:
    
    - POST `/login` takes username/password (form or JSON)
        
    - forwards to TCP server using protobuf + framing
        
    - returns JSON response
        
- HTTP server must not touch DB
    

**Cursor rule (Step 6)**

```text
# Day1-Step6: HTTP /login forwards to TCP

Implement ONLY:
- cmd/http main that:
  - exposes POST /login
  - parses username/password (JSON or form, pick one and document)
  - sends LoginRequest to TCP server using internal/transport framing
  - receives LoginResponse and returns JSON/text
- Add minimal TCP client code (dial + deadlines). Keep simple (no pooling yet).

Do NOT:
- Connect to MySQL/Redis from HTTP
- Add other endpoints
- Add connection pooling or perf optimizations
```

---

## Step 7 — Manual verification notes (runbook snippet)

**Actionable tasks**

- Update README with exact commands:
    
    - create table + seed
        
    - run tcp server
        
    - run http server
        
    - curl login success/fail examples
        

**Cursor rule (Step 7)**

```text
# Day1-Step7: README run instructions only

Implement ONLY:
- Update README with exact local run steps:
  - MySQL schema + seed_small.sql
  - start tcp server
  - start http server
  - curl examples for success/failure
- No code changes unless required to make commands accurate.
```

> [!info] Username as unique id
> For this task, `username` is treated as the stable unique identifier.  
In a production system, we would typically introduce an internal immutable `user_id` and allow usernames to be mutable, but that complexity is intentionally out of scope here.

