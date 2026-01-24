---
title:
draft: true
tags:
date: 2026-01-18
---
## Mental Model

```
Your business logic (already done)
        ↑
Shopee runtime framework (GAS)
        ↑
Shopee infra & platforms (CMDB / SPEX / DB / Redis / CI / Observability)
```

---
## Concepts

### GAS

> the Operating System for company's backend services

- GAS = Go Application Server
- runtime framework that hosts your business logic, while platform supplies infra concerns
- technically, it: 
	- runs a central *Engine* that owns the `main()` function
	- loads *Business Modules* written by developers
	- *injects* ingress / egress implementations via SPI / SP
	- manages application lifecycle
	- provides common capabilities: logging, metrics, health checks, config...

> Read more: [[GAS Framework]]

### SPEX

> the language + network + rules services use to communicate

- company's internal service-to-service RPC platform + service mesh
- what it provides:
	- RPC protocol
	- service discovery
	- traffic routing
	- API governance
	- access control
	- observability
	- retry / timeouts

> Read more: [[SPEX]]

#### GAS vs. SPEX

| Aspect                         | SPEX                                                | GAS                                                       |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------------------- |
| What it's about                | microservice network & contract                     | application runtime & framework                           |
| What qns it's trying to answer | How do services talk to each other safely at scale? | How do I write a Shopee service without rebuilding infra? |
| What it concerns               | lifecycle, SPI, config, metrics                     | service identity, RPC, governance                         |

#### SPEX Client vs. Server

> SPEX server + client turn *distributed service communication (RPC)* into *local function calls* by hiding discovery, routing, and network concerns.

|              | SPEX Server (Ingress abstraction)<br>                                               | SPEX Client (Egress abstraction)                                                          |
| ------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| what         | a runtime component that *listens for* SPEX RPC calls and *executes business logic* | a runtime component that *initiates* SPEX RPC calls to other services *via the SPEX mesh* |
| direction    | Inbound (Ingress)                                                                   | Outbound (Egress)                                                                         |
| triggered by | other services                                                                      | your business logic                                                                       |
| exposes      | commands (RPC endpoints)                                                            | methods to call commands                                                                  |
| defined by   | `.proto` service definitions + handlers                                             | `.proto` service definitions (client stubs)                                               |
| analogy      | "how others call me"                                                                | "how I call others"                                                                       |

### CMDB

> service inventory + ownership + deployment anchor

- CMDB = Configuration Management DataBase
- company's authoritative *registry* of services as *operational assets*
- what it records: 
	- service name
	- service owner
	- service type (HTTP / SPEX / cron...)
	- how it's deployed (pipeline, env)
	- what resources it has (DB, cache, metrics...)
	- risk & impact classification (P0-P4, DR, downtime toleration)

---
## Progress Checklist

- [x] framework overview: what it is, what problem it solves, how it solves it (at a high level, the structure)
- [x] understand how to add the "business logic" (using a cron module)
- [x] connect the business logic (cron) with config -- understand how DIP & SPI works in practice, by understanding how to abstract config from business logic
- [ ] 