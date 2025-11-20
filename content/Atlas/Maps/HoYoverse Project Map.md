---
title:
draft: false
tags:
description:
date: 2025-11-02
---
> [!info]
> A map of real-world systems I’ve worked on at HoYoverse — ranging from observability stacks to resource governance and distributed systems.
> 
> Each project note includes **core reference**, **design intent**, and **interview talking points** — following my own documentation standards.

## Resource Governance & Reporting

- [[Resource Utilization System -- Core Reference]]  
  Infra-wide cost & usage reporting across AWS using Prometheus, YACE, recording rules

- [[Resource Utilization System -- Interview Talking Points]]  
  Key design insights, metrics collected, and follow-up questions for interviews

---
## Latency & Network Diagnostics

- [[Insight -- Core Reference]]  
  Cross-region probe service with hop-level latency tracing, Takumi/Mediary-aware

- [[Insight -- Interview Talking Points]]  
  Architecture walkthrough and design motivation for infra interview context

- [[Global Network Probe System]]  
  Real-time network diagnostics using distributed ping/trace and anomaly surfacing

---
## Messaging, Pipelines & Distributed Systems

- [[Kafka MM2 Rollback System]]  
  Monitoring and fallback for MirrorMaker2 replication (Prometheus + Grafana stack)

- [[SES Asynchronous Report Pipeline]]  
  Cost-optimized, multi-stage email reporting system (CloudWatch + Lambda + S3)

---
## Access & Deployment Automation

- [[Nginx-based Resource Whitelisting Automation]]  
  Dynamic config templating with NGX Lua, GitOps-style deployment, access audit logging

- [[AWS SaaS Deployment with CloudFormation]]  
  Automated deployment of SaaS pipelines with IaC, multi-region account separation

---
## Observability Patterns

- [[Observability & Monitoring]]  
  Generalizable practices extracted from project work (dashboards, exporters, alerts)

---
## Documentation Standards

- [[Project Documentation Template (Detailed)]] — full architecture, challenges, metrics, outcomes  
- [[Project Documentation Template (Concise)]] — compact summary for resume/interview use


