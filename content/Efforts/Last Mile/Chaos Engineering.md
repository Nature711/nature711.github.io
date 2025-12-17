---
title:
draft: false
tags:
date: 2025-12-09
---
> [!info] Concept
> Chaos Engineering: the practice of deliberately introducing *controlled failures* into a system to build confidence in its ability to *withstand real-world turbulence*. 

## Key Principles & Goals

- **Proactive resilience:** The core goal is to find weaknesses before they lead to significant problems for users.
- **Controlled experimentation:** Chaos engineering involves hypothesis-driven, controlled experiments, not random destruction.
- **Hypothesize steady state:** A steady state of normal system behavior is defined, and the hypothesis is that it will remain steady despite the introduced failure.- **Minimize blast radius:** Experiments are designed to have a limited impact to avoid causing widespread damage.- **Validate monitoring:** Experiments help validate that monitoring and alerting systems are working correctly.

---
## How it works

- **Define steady state:** Establish a baseline of normal system performance

- **Form a hypothesis:** Make an assumption about how the system will behave under a specific failure scenario, e.g., "If a web server fails, the load balancer will redirect traffic to healthy servers"

- **Introduce a failure:** Use tools to inject a controlled fault, such as increasing CPU usage, introducing network latency, or shutting down a server

> [!info] How to introduce failures: [[Fault Injection in Distributed Systems]]

- **Observe the system:** Monitor how the system responds to the failure and compare it to the hypothesis

- **Fix vulnerabilities:** Based on the results, make necessary fixes to improve the system's resilience

> [!info] Drill in action: [[Mediary Fault Drill]]

---
## Benefits of chaos engineering

- Increases availability and reliability.
- Reduces Mean Time To Resolution (MTTR) and Mean Time To Detection (MTTD).
- Improves incident response preparedness by simulating real-world events.
- Helps validate disaster recovery plans.
- Validates that redundancy and failover mechanisms are working correctly.