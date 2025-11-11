---
title:
draft: false
tags:
date: 2025-11-09
---
## Project Overview

**Insight** is a non-intrusive, Go-based diagnostics system which monitors service connectivity and latency across regions in our internal microservice platform. It supports both **black-box** (end-to-end) and **white-box** (per-hop) probing modes, helping teams isolate infrastructure issues faster and with more precision.

It’s deployed as a standalone microservice built on **[[Takumi Framework|Takumi]]** (our in-house Golang framework), integrates seamlessly with **Prometheus**, **Consul**, and **Grafana**, and is actively used to diagnose cross-region communication problems without modifying any business services.

- **Environment:** Golang, Takumi framework, gRPC, Mediary (cross-region proxy), Consul (service discovery), Prometheus (metrics), Gateway
    
- **Role:** End-to-end contributor — system architecture, latency measurement pipeline, validation logic, alerting setup, developer documentation

---
## Background

### Problem

Services deployed in different cloud regions can’t communicate directly — they must go through an internal proxy forwarding layer.
    
### Pain Point

Business teams and infra engineers had **no easy way to observe or debug** cross-region latency or availability issues, especially when root cause lay in **infra hops (like Gateway or proxy)**.
    
### Goal

Build a tool that:
- Observes cross-region service reachability
- Measures latency at each infrastructure layer
- Requires **no changes** to existing business service code
- Integrates into our existing observability stack

---
## Core Architecture

### System Architecture 

```
Region A                          Region B
┌─────────────────┐              ┌─────────────────┐
│ Insight Service │              │ Insight Service │
│    (Sender)     │              │    (Receiver)   │
└────────┬────────┘              └────────▲────────┘
         │                                 │
         │ Same-region (via Consul)        │
         ├──────────► Service A            │
         │                                 │
         │ Cross-region (via Mediary)      │
         └─────► Mediary A ───────────► Mediary B
                    │                       │
                    │                       │
                    └───► Gateway B ────────┘
                              │
                              ▼
                         Service B

Metrics Flow:
Insight → Prometheus Exporter → Prometheus → Grafana
```

- **Takumi-based Insight Service**:
    - gRPC service with request/response time injection
    - Sits behind Gateway to simulate real traffic
        
- **Black-Box Mode**:
    - Sends test requests through full stack (Gateway → Proxy → Target)
    - Measures total latency + success rate
        
- **White-Box Mode**:
    - Adds timestamps and extracts hop-level metrics (gateway time, proxy delay, backend processing)
        
- **Monitoring**:
    - All metrics are exposed via Prometheus
    - Collected by Grafana & Thanos for historical analysis
    
### Data Flow

#### Intra-Region Path

1. Insight service queries Consul for service endpoints in same region
2. Sends gRPC request with start time in context
3. Target service responds
4. Insight calculates end-to-end latency and exports metric to Prometheus
    
#### Cross-Region Path (via Mediary)

1. Insight service sends request to local Mediary with target region/service info
2. Mediary A forwards to Mediary B (pre-configured cross-region routing)
3. Mediary B routes through Gateway B to target Service B
4. Response flows back through same path
5. Insight measures **end-to-end latency** including all intermediate hops

---
## Impact

- **Reliability:** Proactive detection of cross-region connectivity issues before they impact users
- **Developer Experience:** Business teams don't need to add monitoring code - it's transparent
- **Visibility:** First-time visibility into cross-region latency and intermediate component performance (Gateway, Mediary)
- **Risk Reduction:** Early detection of degraded performance or connectivity failures between regions
- **Scalability:** Monitoring system scales independently of business services; can monitor any gRPC service

---

>[!info] See also
>[[Insight -- Interview Talking Points]]

