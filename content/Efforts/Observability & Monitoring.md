---
title:
draft: false
tags:
description:
date: 2025-11-03
---
## Background

- Infrastructure is **dynamic** — services scale, restart, relocate.
- Traditional static target configs don't work well.

> [!info] Goal
> To enable **auto-discovery + unified metrics ingestion + global observability**

---
## Core Architecture Stack

|Layer|Tool|Purpose|
|---|---|---|
|Exporter|(e.g. JMX, ICMP)|Exposes metrics at `/metrics` endpoint|
|Consul Agent|Consul Client|Runs **on each node**, registers local services to server|
|Consul Server|Clustered core|Holds **global service registry**, queried by Prometheus|
|Prometheus|Metrics engine|Scrapes services (via Consul), stores short-term metrics|
|Thanos|Storage + HA|Adds **long-term + cross-region** support to Prometheus|
|Grafana|Visualization|Dashboards to display Prometheus metrics|

---
## Components breakdown

### 1. Service

> An application or system process that performs business or platform functions.  
> It may emit internal metrics directly or rely on an exporter.

**Characteristics**
- Runs continuously and exposes operational data such as request counts, latency, or error rates.
- Metrics are exposed via an HTTP endpoint (`/metrics`) or through an attached exporter.
    
**Interactions**
- Provides metrics endpoint(s) for exporters (or Prometheus direcrtly) to scrape.

### 2. Exporter

> A component that converts internal state or external system data into Prometheus-compatible metrics.

**Types**
- _Sidecar Exporter_: Runs alongside a service (e.g., JMX exporter for Kafka).
- _Node Exporter_: Collects host-level system metrics.
- _Blackbox Exporter_: Probes endpoints or network paths.
- _Custom Exporter_: Purpose-built for domain-specific data.
    
**Interactions**
- Gathers data from a source (API, system call, log).
- Exposes an HTTP `/metrics` endpoint for Prometheus.
- Often registered to service discovery automatically.

### 3. Consul Agent (Client)

> A lightweight process running on each host or environment node that handles **local service registration**.

**Functions**
- Registers local services and exporters with metadata (name, tags, port).
- Performs health checks; removes unhealthy instances automatically.
- Maintains a local cache of cluster state for resilience.
    
**Interactions**
- Communicates with Consul Servers to sync registrations.
- Provides real-time health and presence information for discovery consumers such as Prometheus.

### 4. Consul Server

> The central registry that stores the global service catalog.

**Functions**
- Aggregates data from all Consul Agents.
- Offers APIs for service discovery (`/v1/catalog/services`).
- Maintains health, tags, and metadata for each service.

**Interactions**
- Queried by Prometheus via `consul_sd_config` for target discovery.
- Synchronizes continuously with Consul Agents to reflect current topology.

### 5. Prometheus

> A time-series database and metrics collector based on a pull model.

**Functions**
- Hardcoded or dynamic targets.
- Periodically scrapes `/metrics` endpoints and stores time-series data locally.
- Supports rules for recording and alerting.
- Provides PromQL for flexible querying.

**Interactions**
- Pulls target information from Consul or other discovery systems.
- Scrapes metrics from exporters.
- Serves data to visualization or aggregation tools.

### 6. Grafana

> A visualization and analytics platform for time-series data.

**Functions**
- Queries data sources such as Prometheus or Thanos using PromQL.
- Provides dashboards for real-time visualization and historical analysis.
- Supports alerting, templating, and multi-datasource correlation.

**Interactions**
- Reads metrics from Prometheus or Thanos Query.
- Displays aggregated metrics to operators, SREs, and developers.

### ### 7. Thanos Sidecar

> A sidecar process that extends Prometheus with long-term storage and federation capabilities.

**Functions**
- Uploads Prometheus TSDB blocks to remote object storage (S3, GCS, etc.).
- Exposes a Store API for Thanos Query components.
- Enables high-availability Prometheus setups.

**Interactions**
- Reads Prometheus data directory.
- Pushes blocks to storage backend.
- Responds to Thanos Query requests for local data.

### 8. Thanos Query / Store / Compactor

> Distributed components that enable global querying, deduplication, and historical data management.

**Roles**
- **Thanos Query**: Executes federated queries across multiple Prometheus or Store endpoints.
- **Thanos Store**: Fetches metrics from long-term storage.
- **Thanos Compactor**: Downsamples, deduplicates, and compacts historical data for efficiency.
    
**Interactions**
- Query fan-out across multiple data sources.
- Combine local (real-time) and remote (archived) metrics for a unified global view.
- Serves data to Grafana and other consumers via PromQL.

> [!info] Data Flow Summary
> 1. **Service / Exporter** exposes metrics →
> 2. **Consul Agent** registers the instance →
> 3. **Consul Server** aggregates all registered services →
> 4. **Prometheus** discovers and scrapes metrics dynamically →
> 5. **Thanos Sidecar** stores blocks for long-term retention →
> 6. **Thanos Query** federates global queries →
> 7. **Grafana** visualizes data →
> 8. **Alertmanager** routes alerts based on Prometheus rules.

---
## Related Projects

### [[Kafka MM2 Rollback System]]

- MM2 wrapped in Docker
- JMX Exporter exposes `replication.lag`, `throughput`
- Registered with Consul
- Prometheus scrapes → Grafana dashboards show real-time replication health

### [[Global Network Probe System]]

- Custom probes (ICMP, TCP, MTR) deployed in each AZ
- Export Prometheus-compatible metrics (latency, packet loss, routing hops)
- Registered with Consul → Scraped by Prometheus → Visualized in Grafana 