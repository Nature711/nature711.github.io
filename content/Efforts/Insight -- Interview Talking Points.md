---
title:
draft: false
tags:
description:
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
> I was building a cross-region observability tool on top of **Takumi**, our internal Go framework. While Takumi abstracts a lot of infra functionality, it had minimal documentation and behaved unpredictably when stepping outside its default flow.

> **T**:  
> To deliver the observability tool, I needed to work closely with Takumi’s internal components — like config injection, lifecycle hooks, and metric registration — even though their behavior was undocumented and difficult to debug.

> **A**:  
> I cloned Takumi’s source code into my project and set up **Cursor** as my reading/debugging environment. I configured custom navigation rules so I could jump between Takumi’s layers easily and trace internal behavior. I documented every “gotcha” I found and compiled an internal guide to help others avoid the same pitfalls.

> **R**:  
> This let me **move from “guess and check” to actual understanding**, which improved both the reliability of my code and my ability to debug future issues.  
> More Importantly, I gained the ability to navigate and work productively with internal systems — something I now see as essential in any real-world engineering team.


> [!info]- More Detailed Version
> One of the biggest challenges in this project was actually working with **Takumi**, our in-house Go application framework.  
> On paper, it's designed to handle everything for you — service discovery, config loading, Prometheus metrics, graceful shutdown, etc.  
> But in reality, it has a lot of **undocumented behaviors**, **hard-to-reason-about abstractions**, and what I’d call "black magic" — meaning: when you step even slightly outside of the happy path, **strange things happen**, and it’s not always clear why.
> 
> I hit this multiple times during development — like when metrics weren’t exposed correctly, or tracing headers weren’t propagating as expected.  
> Rather than guess or workaround blindly, I decided to **dig into Takumi’s source code** to understand how it really works.
> 
> To do this efficiently, I:
> 
> - Pulled the entire Takumi repo and all relevant dependencies into my local project
>     
> - Used **Cursor** to configure a unified workspace with proper symbol resolution and jump-to-definition across packages
>     
> - Wrote custom Cursor rules so I could navigate internal abstractions, like the lifecycle hooks and config injection flow
>     
> - Traced through multiple layers of internal service setup logic to understand where behavior diverged
>     
> After figuring things out, I also started maintaining **internal notes** to document these “gotchas” — basically creating a dev guide for others who might run into the same problems.
> 
> This dramatically improved my ability to work with internal infrastructure code, and helped stabilize Insight’s behavior under different environments.  
> 
> The guide I wrote is now used internally by other team members working with Takumi.  
> More importantly, I developed the confidence and methodology to deal with undocumented or "black magic" systems — which I’ve come to see as a core part of backend/infra work.

---

