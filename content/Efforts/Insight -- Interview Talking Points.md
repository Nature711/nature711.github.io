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

> **A**: I built **Insight**, a Go-based service that performs non-intrusive black-box and white-box probes across services, breaking down latency into hop-level segments like gateway, proxy, and target.  

> **R**: It’s now used by infra teams to detect degradation early, isolate faults faster, and improve observability without requiring any changes to business code.

### In 2 min

> **S**: 
> In our setup, services deployed in different regions can't talk to each other directly — they have to go through a **proxy forwarding layer**, which introduces extra hops like Gateway and Mediary. But at the time, we had very limited visibility into what was happening along that path — if something went wrong, it was hard to tell _where_ the problem was.

> **T**: 
> I was asked to build an observability system that could help us **monitor cross-region service health and break down latency by infrastructure hop**, ideally without requiring changes to any business code.

> A:
> I built the service in **Go**, using our internal framework called **Takumi**. The idea was to simulate real production traffic by sending gRPC requests across regions — and for each request, we’d capture timing data at different points. That let us measure both **end-to-end latency** and **hop-level delays** — like how much time was spent in the Gateway, the forwarding layer, and the actual target service.
> 
> Inside the same region, services are discovered dynamically through **Consul**, but cross-region paths had to be routed explicitly through Mediary. I handled all of that logic inside Insight, and exposed the metrics through **Prometheus**, which were then visualized on **Grafana**.

> **R**: 
> Insight became a critical tool used by infra teams to diagnose latency issues and improve cross-region reliability. It’s now integrated into our standard observability stack, and helped reduce incident isolation time significantly.

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

[To-do]

---
## Resume Points

> [!important] ATS optimized 
> Built a Go-based cross-region monitoring service that measures service latency through non-intrusive health checks, integrating with internal Gateway, Consul, and Prometheus to provide hop-level infrastructure visibility for faster incident isolation

- Designed and implemented black-box and white-box probing logic integrated with **Prometheus / Grafana / Thanos**, improving cross-region observability and reliability.

- Leveraged **AI-assisted tooling (Cursor + gopls)** to navigate internal frameworks efficiently, accelerating development and debugging within complex, undocumented systems.