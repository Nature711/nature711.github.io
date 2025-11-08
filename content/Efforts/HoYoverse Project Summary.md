---
title:
draft: false
tags:
description:
date: 2025-10-25
---
## Opening

I’ve been working at HoYoverse as a software engineer, focusing on internal **infrastructure and observability tooling**.

Over the past year, I’ve built things like a cloud resource utilization reporting system, a Kafka rollback platform using MirrorMaker2, a cross-region network probe system, and some service quality testing tools using our in-house Golang framework.

These experiences have given me a strong foundation in how large-scale systems are deployed, monitored, and maintained. 

I’m now looking for a role where I can grow further by working on [**infra / platform / AI infrastructure / system design** ← tailor here] at a deeper level, and contribute to systems that are widely used across the org.

---
## Observability & Monitoring

### Main Idea

> Our monitoring setup mainly uses **Prometheus**, **Grafana**, and **Consul** for service discovery.  
> Basically, every service exposes its own metrics — like Kafka using JMX, or our network exporter that checks inter-region latency.  
> 
> Instead of hardcoding targets in Prometheus, we let services **register themselves to Consul**, and Prometheus automatically discovers them from there.  
> This makes things a lot more flexible — when a new service instance comes online, it just appears in the monitoring system without anyone touching configs.
> 
> Grafana then pulls from Prometheus, so teams can visualize everything — things like replication lag for Kafka, or latency across data centers.
> 
> We also have **Thanos** sitting on top for long-term metric storage and cross-region queries, so we can still query old data or global views easily.

### Example

For example, when we built the Kafka MirrorMaker2 replication setup, we added JMX exporters to expose lag and throughput metrics. Prometheus picks them up through Consul automatically, and Grafana dashboards show replication health in real time.  
Similarly, for the network exporter project, we exposed latency and reachability metrics between regions, and it followed the same pattern — register to Consul, scrape from Prometheus, visualize in Grafana.

### Highlight

The key idea is that we rely on **dynamic discovery** instead of static configs, and it saves a lot of maintenance when services scale or move. It’s pretty much a standard for modern observability setups.

---
## Kafka & MM2

### Main Idea

> I built a **Kafka cross-cluster replication and rollback system** based on MirrorMaker 2.  
> The initiative came from AWS — they required a **forced upgrade of our MSK service**, and we needed a safe way for business teams to **rollback their data pipelines** if anything went wrong during the upgrade.
> 
> To make this easy for them, I built a **click-and-deploy workflow** —
> Users only needed to write a simple configuration file specifying the source and target clusters, and the system handled everything — packaging, deployment, and monitoring.  
>
> Under the hood, we downloaded **MirrorMaker 2 binaries** and packaged them into a lightweight **Docker container**.  When deployed, MM2 starts to replicate topics and consumer offsets between clusters, ensuring a smooth rollback from one version of the cluster to another.
> 
> We also added **JMX-based metrics** for replication lag and throughput, integrated with our existing **Prometheus + Grafana + Consul monitoring setup** — the same best practices described in our observability framework.  That gave teams full visibility into replication health and data consistency.

### Highlight

Overall, the system turned what used to be a risky manual operation into a **click-and-deploy workflow** with automated monitoring and rollback support. It gave business teams confidence to perform MSK upgrades safely while maintaining data integrity and service continuity.

---
## Network Exporter

### Main Idea

> I developed a **Global Network Probe System** — basically a Prometheus-compatible exporter that continuously monitors network connectivity between different regions / services. 
> 
> The goal was to give our infra team **visibility** into cross-region latency, packet loss, and connectivity health, because many incidents turned out to be network-related rather than application issues.
> 
> Technically, it works at the **network layer** — not the application layer — by running periodic **ICMP, TCP, and MTR tests** between probe nodes deployed in each region. 
> Each probe reports metrics like latency and packet loss.
> Those metrics are exported in **Prometheus format**, registered with **Consul** for automatic service discovery, and visualized in **Grafana** dashboards for real-time monitoring.
> 
> We designed the system with **AZ-level deployment** so we could pinpoint whether an issue came from an entire region, a single availability zone, or a specific route.  

### Example

This level of granularity made troubleshooting much faster.  
For example, during a **Transit Gateway (TGW) routing degradation**, our probes detected rising latency in one path hours before it affected application traffic, so we were able to reroute early and avoid a major impact.

The metrics were also standardized so engineers could interpret them consistently — e.g., **ICMP latency for raw path health**, **TCP connection success rate for service reachability**, and **MTR hop deviation** for routing instability.  
Combined with alerts, this became a key layer in our observability stack, bridging the gap between network infrastructure and application performance.

### Highlight

Overall, the system turned “network blind spots” into **measurable, actionable insights** — helping teams detect issues early, reduce incident MTTR, and make data-driven decisions on traffic routing and peering.

---
## CI/CD & Deployment

### Main Idea

> For deployment, everything — code, configurations, and infrastructure files — is version-controlled in a **Git repository**. 
> When we make a change, say updating a configuration, we **merge it into main and tag a new version**, which triggers a packaging process which uploads the artifact to our internal **OSS storage**. From there, we go to our **Ops platform** to create a release based on that tag. 
> 
> Behind the scene, that triggers a **Jenkins pipeline**. Jenkins then calls **Ansible**, which connects to all target machines through SSH to run the actual deployment steps — like copying new files, doing syntax checks, and reloading services such as Nginx.  
> 
> The whole flow is **automated, logged, and auditable**, so we can trace exactly what was deployed and by whom.

### Example

One good example is the **Nginx whitelist proxy system** we use for managing cross-environment access.  
Each Nginx config file defines what source IPs can reach which backend services.  
All these configs are stored in Git, and whenever we update the whitelist, the same pipeline packages the change, pushes it out via Jenkins + Ansible, and reloads Nginx across all proxy servers automatically.

### Highlight 

The key idea is treating deployment like code — everything versioned, automated, and traceable, which makes scaling and debugging much easier.

---
## Cost & Resource Utilization System

### Main Idea

> One of the projects I fully owned was a **cloud resource utilization reporting system**.  
> The goal was to help business teams clearly see their AWS usage — EC2, RDS, and so on — and identify under-used resources for cost optimization.
> I designed and implemented it end to end — from data collection and validation to alerting and health checks.  
> 
> It’s a **Python-based system** that gathers metrics from AWS CloudWatch. 
> But since CloudWatch queries are charged per API call, I deployed **YACE (Yet Another CloudWatch Exporter)** to scrape CloudWatch once and expose them, which Prometheus can then scrape at low cost.
> The system processes metrics like CPU, memory, and disk utilization, converts them into a unified format, and stores them in **PolarDB** for reporting and analysis.  
> During development, I spent quite a bit of time handling the **edge cases and reliability issues**, like **data validation** and **idempotent operations**, to make sure everything runs safely and consistently.  
> On top of that, I added **alerting** not just for usage thresholds but also for system health — for example, if a data batch fails or collection stops.
> 
> Overall, it’s a complete automated pipeline — data ingestion, validation, storage, and monitoring — and it’s now used by multiple teams for visibility and data-driven cost decisions.

### Highlight

This was my first true end-to-end project — from business requirements to implementation and operations — and it really taught me how to build something reliable that delivers real value.

---
## Developing with the Takumi Framework

### Main Idea

> We have an internal Golang framework called **Takumi**, which is like our standard scaffolding for backend services.  
> It bundles together all the core infra pieces — Prometheus metrics, Consul service registry, Zest config management, Gateway routing, and gRPC communication — everything you need to run a microservice in our ecosystem.
> When we create a new service, Takumi already handles all that setup, so we can focus on the business logic while still following best practices.

### Example

I used Takumi to build a service called **Insight**, which is basically a “service quality testing tool.”  
It’s meant for both black-box and white-box testing — checking if services are reachable, how they perform under different calls, and if the internal components are connected properly.  
It integrates with Gateway, uses gRPC for communication, and exposes its own metrics for Prometheus.  
It’s still in development, but it’s already a good example of how our infra team builds tools that are observability-first and easy to integrate.

### Highlight

Working with Takumi really helped me see what “production-ready” means — that every service should come with monitoring, config management, and discovery built in by default, not added later.

---
## Tips
### Why're you looking for new roles

Yeah — I’ve been reflecting on that a lot.
Right now, I’m the only junior on my team, and while I’ve learned a lot just by being around really experienced engineers, the structure doesn’t really support junior growth.
There’s no clear ownership or technical path for me, and the kind of work I get is often fragmented or operational.
So I’m looking for a place where I can take on **more meaningful, engineering-driven work**, where I can actually build and operate systems that create real impact. 

### What I’ve Learned

I think overall, this past year has been about connecting the dots — seeing how deployment, monitoring, and cost optimization all tie together.  
Even if I wasn’t building everything from scratch, I learned to really understand how infra works end to end.  
Now, I’m ready to move into a role where I can build and operate these systems myself — taking the lessons from what I’ve seen and turning them into my own engineering work.

### When I Don’t Know the Answer

I wasn’t directly responsible for that part, but I understand the concept —  
for example, [give a brief conceptual idea].  
It’s actually something I’ve been reading up on recently because I want to strengthen that area.

