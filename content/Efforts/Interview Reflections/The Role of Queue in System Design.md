---
title:
draft: false
tags:
date: 2025-12-13
---
> [!info] Background
> During recent system design interviews, I often found myself stuck when reasoning about performance bottlenecks, the solution was almost always to **introduce a queue** -- which decouples fast paths (which need to return immediately to user) from slow paths (e.g., writing to DB). 
> However, a discussion with a friend highlighted that “adding Kafka” is an oversimplified heuristic — different queueing systems (Kafka, traditional MQs, Redis-based queues) have distinct tradeoffs, and the right choice depends on the specific use case.

---
## What problem are we solving when "adding a Q"

### Decoupling

> Problem: Service A needs to talk to Service B, but if B is down or slow, A gets blocked or fails.

**With Q**: 

`User Request → Service A → Service B (slow / down) → ❌ Request stucks / fails`

**Without Q**:

```
User Request → Service A → Queue → ✓ (A returns immediately)
                              ↓
                         Service B (processes when ready)
```

**Benefits**: independent operation, loose coupling

### Load Leveling / Spike Absorption 

> Problem: Traffic spikes overwhelm downstream services, causing cascading failures.

**Without Q**: 

```
1000 requests/sec → Service B (can handle 100 req/sec) → 💥 Crashes
```

**With Q**: 

```
1000 requests/sec → Queue (buffers) → Service B processes at steady 100 req/sec
```

**Benefits**: Q as a shock absorber; downstream can catch up later & process at its own rate

### Async + Retry

> Problem: 