---
title:
draft: false
tags:
date: 2025-12-09
---
> [!info] High Level Goal
> To understand **how big distributed systems break, how we detect it, and how we recover.**

---
## Network failures vs. Business symptoms

> Not all failures look the same.

| Fault Type                                 | Business Symptoms                       | Why This Matters                                                                                    |
| ------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Packet loss (50%)**                      | latency ↑, occasional failures          | Real-world networks degrade _gradually_, not all-at-once                                            |
| **Latency injection (+1s)**                | latency ↑, **no failures**              | High latency doesn’t always mean outages; business logic resilience matters (e.g., retry / timeout) |
| **Machine unreachable / NIC down**         | 10–30s of errors during fail + recovery | Load balancer + client connection pooling behavior becomes visible                                  |
| **Graceful shutdown (supervisorctl stop)** | **No user impact**                      | Shows healthy service shutdown patterns                                                             |
| **Machine restart**                        | Errors during shutdown only             | Expected IF connections aren’t drained properly                                                     |

---
## Observability Metrics

- Detects **sudden network degradation**

```promql
increase(takumi_auto_cross_ping_failure_total[5m]) > 0
```

- Detects **slowness** even when not failing

```promql
takumi_auto_cross_ping_latency_ms > 300
```

- Ideal mediary latency values: 
	- same region: **70–80ms**
	- cross region: **100–200ms**

---
## Useful Tips

### Graceful Shutdown Behavior

`supervisorctl stop` / `pkill`

- sends **SIGTERM**, stops accepting new requests (i.e., *graceful shutdown*)
- allows in-flight requests to finish
- usually safe and clean → **no business impact**

`kill -9`

- sends **SIGKILL**
- forcefully kills process → partial outages

> [!info] Use Graceful Shutdown to enable: 
> - zero downtime deployment
> - smooth blue/green rollouts
> - safe restarts during production incidents

### Network Issue Simulation Tool

`tc` command: simulate network issues in production-like environments

- e.g., 50% packet loss: `tc qdisc add dev eth0 root netem loss 50%`
- 1s latency: `tc qdisc add dev eth0 root netem delay 1000ms`

> [!tip] Pro-tip
> `date; <command>` -- show precise timing for correlating with monitoring graphs

> [!info] Detailed usage: [[Fault Injection in Distributed Systems]]

---
## Infra Intuition Cheatsheet

| Symptom                      | Likely Root Cause                        |
| ---------------------------- | ---------------------------------------- |
| High latency, no errors      | congestion, latency injection, slow path |
| High latency + random errors | packet loss / jitter                     |
| Errors only at start/end     | node leaving/joining, LB failover        |
| Continuous errors            | full outage / route blackhole            |
| No errors during deploy      | graceful shutdown working                |

> [!info] Interview Talking Points
> [[Mediary Fault Drill Interview Points]]

