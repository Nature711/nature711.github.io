---
title:
draft: false
tags:
date: 2026-01-06
---
## Background

What: a user management system for login & edit profile

Functional requirement: 
- user input username & password --> system authenticate 
	- if success --> display user info
	- otherwise --> display error msg
- logged in user --> can edit profile 
	- username, nickname, picture upload

Non functional
- 1000 concurrent http requests
- with cache: 16,000 QPS from at least 200 unique users; try 25k if possible
- without cache: 8,000 QPS from at least 200 unique users; try 15k if possible

Design constraint
- separate HTTP & TCP server -- HTTP for receiving request (client facing); forwarding to TCP server which holds main logic (business logic -- authentication, query db) 
	- analogy: 2 microservices responsible for different things & communicate with each other
- user info: stored in mysql 
- request & response: protobuf

> [!ino] Mindset
> “I’m not just building a login system.  
I’m learning how Shopee builds, reasons about, and operates backend services at scale.”

---
## Takeaways

### End-to-end backend lifecycle

```
Browser
  → HTTP server
      → TCP request (protobuf)
          → Auth logic
              → Cache (if hit)
              → MySQL (if miss)
          → TCP response
      → HTTP response

```

### Performance intuition

---
## Gotchas (Whys)

### Why separating HTTP & TCP servers? 

> common microservice pattern used at scale

1. separation of concerns 
- HTTP server: handle web protocol stuff (CORS, sessions, cookies)
- TCP server: handle actual business logic (authentication, data validation, DB queries)

2. scalability
- multiple http servers can connect to the same TCP server
	- e.g., during flash sale, can easily spin up more HTTP servers, while connecting to the same & stable TCP server
- each scale independently

1. security 
- db never directly expose directly to web layer
- tcp server as a security gateway

1. technology flexibility
- changing one part doesn't affect the other
- shared backend logic as in VSS

### Why protobuf

1. performance (as compared to JSON)
	- binary vs huge JSON, former has much faster parse time; matters significantly at scale
2. type safety (enforced by compiler)

### Why cache

1. without cache: 1 login --> 1 db query (16k QPS --> reaches mysql limit)
2. with cache (aim for high hit rate ~80% --> DB survive during peak)

- cache is useful here
	- for read-heavy workflow -- more login (read); less update 
	- hotspot user -- 20% user generates 80% traffic; repeated request

### Why MySQL

1. acid transaction 
2. strong consistency

---
## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  [Chrome/Firefox] → HTTP Requests (JSON or Form Data)       │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      HTTP SERVER (Go)                        │
│  - Serve static HTML/CSS/JS                                 │
│  - Handle HTTP routes: /login, /profile, /update            │
│  - Session management (cookies)                             │
│  - Convert HTTP → TCP call                                  │
│  - No business logic here!                                  │
└────────────────────────────┬────────────────────────────────┘
                             ↓ TCP + Protobuf
┌─────────────────────────────────────────────────────────────┐
│                      TCP SERVER (Go)                         │
│  - Listen on TCP port (e.g., :8080)                         │
│  - Decode Protobuf messages                                 │
│  - Business logic:                                          │
│    • Authenticate user (check password hash)                │
│    • Validate input (SQL injection prevention)              │
│    • Rate limiting                                          │
│  - Connection pooling to MySQL/Redis                        │
│  - Encode response as Protobuf                              │
└──────────────┬───────────────────────────┬──────────────────┘
               ↓                           ↓
    ┌──────────────────┐       ┌──────────────────┐
    │  REDIS CACHE     │       │  MYSQL DATABASE  │
    │  - User sessions │       │  - users table   │
    │  - User profiles │       │  - 10M records   │
    │  - TTL: 5 min    │       │  - Indexed       │
    └──────────────────┘       └──────────────────┘
```

## Database Schema

### Users table

