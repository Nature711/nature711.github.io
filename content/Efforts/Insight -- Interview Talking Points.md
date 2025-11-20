---
title:
draft: false
tags:
date: 2025-11-09
---
## Describing the Project

### In 30 sec

> **S**: Cross-region service calls had to go through a forwarding layer, and we lacked visibility into latency or failures across that path.  

> **T**: We need a diagnostics tool to monitor cross-region performance and isolate infrastructure issues.  

> **A**: I built a Go-based internal probing tool to monitor cross-region service latency in our distributed infrastructure. It performs non-intrusive black-box and white-box probes across regions, measuring both end-to-end latency and server-side processing time through our gateway and cross-region forwarding layer, and exposing them as metrics to Prometheus.

> **R**: This gives our infra teams a real-time, global view of inter-region health and lets us identify issues — like routing degradation or overloaded proxy nodes — well before they impact users.

### In 2 min

> **S**: 
> In our setup, services deployed in different regions can't talk to each other directly — they have to go through a **proxy forwarding layer**, which introduces extra hops like Gateway and Mediary. But at the time, we had very limited visibility into what was happening along that path — if something went wrong, it was hard to tell _where_ the problem was.

> **T**: 
> I was asked to build an observability system that could help us **monitor cross-region service health and break down latency by infrastructure hop**, ideally without requiring changes to any business code.

> **A**:
> I built Insight as a **non-intrusive, Go-based probe** that simulates real inter-region traffic using gRPC. It measures both **end-to-end latency** and **server-side timing** by leveraging standard context metadata provided by our framework. For cross-region calls, the probe explicitly routes traffic through the forwarding layer so we can measure that path independently.
> 
> Insight exposes these probe results as Prometheus metrics — for example:  
> **`cross_region_latency_ms{source="eu", target="sg"}`**  
> We also correlate that with host-level metrics from the forwarding nodes themselves, like CPU usage derived from `node_cpu_seconds_total`.
> 
> On Grafana, we get a **live cross-region latency map**. If EU→SG latency suddenly jumps, we can immediately see whether:
> - the forwarding nodes are overloaded,
> - the network path is degrading, or
> - the gateway is slowing down.

> **R**: 
>This has significantly improved our ability to detect issues early, isolate problems quickly, and plan capacity for regional traffic. It turned cross-region communication from a black box into something observable, without requiring any changes from business services.

---
## Challenges & Resolution

### Navigating Takumi's hidden complexity

> **S**:  
> One of the more interesting challenges I ran into during the Insight project was actually working with **Takumi**, which is our internal Go framework. 
> While Takumi abstracts a lot of infra functionality, it had minimal documentation and behaved unpredictably when stepping outside its default flow.

> **T**:  
> To deliver the observability tool, I needed to deeply understand how Takumi works under the hood — even though it wasn’t well-documented or transparent.

> **A**:  
> To deal with this, I decided to treat Takumi as a **first-class dependency** rather than a black box, and built a workflow to understand it deeply. I:
> 
> - pulled the full Takumi codebase and related dependencies to my local workspace (using `go mod vendor`)
> - configured **Cursor** with custom rules (`.cursor/ruls`), so that it could index those dependency directories more accurately
> - installed Go language server (`golps`), which enabled features like symbol resolution, jump-to-definition, allowing me to trace Takumi's internal logic more efficiently
> 
> This setup let me **leverage AI tools efficiently** — not just for code suggestions, but as a way to **accelerate deep code navigation and debugging**. When something broke, I wasn’t stuck grepping logs — I could follow the flow all the way into Takumi’s internals.
> 
> Along the way, I documented common pitfalls and created an internal "gotchas" guide to help others debug faster.

> **R**:  
> In the end, this whole workflow helped me understand Takumi on a much deeper level, and it gave me a repeatable way to handle **complex internal systems**, which I now see as a core skill in any real-world engineering team.

---
## Follow-up Q&A

[[Insight -- Follow-up Q&A]]

---
## Resume Points

> [!important] ATS optimized 
> Built a Go-based cross-region monitoring service that measures service latency through non-intrusive health checks, integrating with internal Gateway, Consul, and Prometheus to provide hop-level infrastructure visibility for faster incident isolation

- Designed and implemented black-box and white-box probing logic integrated with **Prometheus / Grafana / Thanos**, improving cross-region observability and reliability.

- Leveraged **AI-assisted tooling (Cursor + gopls)** to navigate internal frameworks efficiently, accelerating development and debugging within complex, undocumented systems.