---
title:
draft: false
tags:
date: 2025-11-10
---
## Main Idea

> Our monitoring setup mainly uses **Prometheus**, **Grafana**, and **Consul** for service discovery.  
> Basically, every service exposes its own metrics — like Kafka using JMX, or our network exporter that checks inter-region latency.  
> 
> Instead of hardcoding targets in Prometheus, we let services **register themselves to Consul**, and Prometheus automatically discovers them from there.  
> This makes things a lot more flexible — when a new service instance comes online, it just appears in the monitoring system without anyone touching configs.
> 
> Grafana then pulls from Prometheus, so teams can visualize everything — things like replication lag for Kafka, or latency across data centers.
> 
> We also have **Thanos** sitting on top for long-term metric storage and cross-region queries, so we can still query old data or global views easily.

## Example

For example, when we built the Kafka MirrorMaker2 replication setup, we added JMX exporters to expose lag and throughput metrics. Prometheus picks them up through Consul automatically, and Grafana dashboards show replication health in real time.  
Similarly, for the network exporter project, we exposed latency and reachability metrics between regions, and it followed the same pattern — register to Consul, scrape from Prometheus, visualize in Grafana.

## Highlight

The key idea is that we rely on **dynamic discovery** instead of static configs, and it saves a lot of maintenance when services scale or move. It’s pretty much a standard for modern observability setups.
