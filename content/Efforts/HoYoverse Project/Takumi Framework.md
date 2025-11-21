---
title:
draft: false
tags:
date: 2025-11-09
---
## What is Takumi

Takumi is the **standard Golang application framework** used inside the company for building:

- gRPC services (preferred & standardized)
- Command-line tools / daemons
- HTTP services (only via Gateway)
- One-shot jobs (scripts / cron-like)

---
## Motivation — Why Takumi

### Problem Before Takumi

- Everyone wrote Go services differently (inconsistent conventions).
- Repeated boilerplate: logging, metrics, shutdown, service registry, etc.
- Poor observability & debugging across services.
- Complicated production deployment due to lack of standard infra integrations.

### What Takumi **abstracts away**

| Concern | What Takumi Provides |
|--------|------------------------|
| **Service Config** | Uses `Zest` to centralize config management |
| **Metrics** | Built-in Prometheus metrics (just expose) |
| **Logging** | Unified logging interface with automatic context |
| **Tracing** | Integrated request tracing from HoYoCloud to app |
| **Graceful Shutdown** | Default hooks with `terminator` |
| **Service Registry** | Built-in Consul-style service registration |
| **Codegen** | `protoc-gen-takumi` simplifies proto → gRPC Go |
| **gRPC Interop** | Strong support for internal communication |
| **Project Generator** | `luban` scaffolds out the base template |

### Why it matters

- Reduces **boilerplate** and lets devs focus on **business logic**
- Makes internal services **observable by default**
- Ensures deployment / shutdown behavior is **predictable**
- Enables **standardized inter-service communication** (via gRPC)
- Supports easier **onboarding** of new team members
- Improves **debuggability, reliability, and scale**


> [!info]+ Analogy
> Takumi = Your Car's Engine + Transmission + Brakes
> 
> Your Code = Your Driving + Navigation + Destination
> 
> - Takumi provides: The infrastructure (engine, transmission, brakes)
> 
> - You provide: The business logic (where to go, how to drive)
> 
> - Together: You get a complete, working application

---
## How to use Takumi

### Engineering Principles

- Make everything **testable**
- Use gRPC for all internal services (HTTP only via Gateway)
- Ensure services handle **graceful shutdowns**
- Always test for:
  - Metrics exposure
  - Tracing integration
  - Config loading from Zest
- Be opinionated, but **iterative** — improve project styles over time

### Project Lifecycle in Takumi

1. Use `luban` to scaffold a project
2. Copy required `.proto` files and generate gRPC stubs
3. Write business logic inside handlers
4. Register service with registry
5. Deploy using **HoYoCloud**
6. Monitor via **Prometheus / Grafana**
7. Maintain config via **Zest**
8. Handle graceful shutdown via `terminator`

---
## Takeaways

- The power of a good internal framework lies in **abstraction + convention**.
- Takumi enforces a “**shared mental model**” of how services are built and operated.
- A new joiner can spin up a service with observability, config, and infra out of the box.
- This is what **platform engineering** looks like — empowering teams to deliver faster and more safely.