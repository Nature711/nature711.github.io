---
title:
draft: false
tags:
date: 2025-12-10
---
# **Value of the Insight Project (Business-Facing, Reliability-Focused)**

## **1. Big Picture: How Infra Adds Value**

An infrastructure team typically has three core objectives:

1. **Improve Reliability** — reduce incident rates, reduce MTTR, eliminate blind spots
    
2. **Improve Visibility** — provide clear, actionable metrics to diagnose issues
    
3. **Optimize Cost** — ensure resources and traffic paths are used efficiently
    

**Insight** sits squarely in the first two categories:

> **Insight improves reliability by giving business teams real-time visibility into the health of cross-region request flows, making failures diagnosable within seconds instead of hours.**

---

# 🚦 **2. The Problem Before Insight: Zero Visibility into Cross-Region Failures**

### ❌ Current blind spot (before Insight)

When two services (e.g., SG and US) communicate across regions:

`业务 Service A  →  Mediary  →  Cross-region Network  →  Mediary  →  Service B`

If something breaks, business teams could not answer:

- Is the issue inside their **own** service?
    
- Is it the **Mediary** forwarding layer?
    
- Is it the **cross-region network**?
    
- Is it just **one region** or **one AZ** that is broken?
    
- Is it a **latency spike** or a **hard failure**?
    

Teams often spent **>30 minutes** just identifying where the issue was, before even beginning mitigation.

This uncertainty directly increases:

- MTTR
    
- number of unnecessary escalations
    
- blame and confusion in incident channels
    
- pressure on business teams
    

---

# 🌍 **3. What Insight Adds: A Region-Aligned, Path-Aligned Probing System**

A key design choice:

> **Insight runs the probe in the same region and same execution path as the business service.**

If the business service runs in:

- SG
    
- US
    

Then Insight also deploys:

- SG Insight source → SG Mediary → US Mediary → US Insight sink
    
- US Insight source → US Mediary → SG Mediary → SG Insight sink
    

**It mirrors the real production path exactly.**  
This is what makes Insight so powerful.

---

# 🔍 **4. What Insight Measures**

Every 15 seconds, Insight sends:

- **end-to-end cross-region RPC probe**
    
- **per-hop probe** (Mediary → Mediary hops)
    

It records:

- latency
    
- success rate
    
- packet loss behavior
    
- retry patterns
    
- hop-by-hop performance
    

And exposes them in:

- **Prometheus metrics**
    
- **Grafana dashboards**
    

With alerting built on top.

---

# ⚡ **5. Why This Dramatically Improves Reliability**

## 📌 **(A) Instant problem localization**

With end-to-end AND per-hop metrics, you can immediately see:

|If this is high…|Root cause is likely…|
|---|---|
|SG→US latency ↑|Cross-region network issue|
|SG→SG latency ↑|Local AZ / Mediary issue|
|US Mediary failure ↑|Mediary node overload|
|End-to-end fails but hop metrics OK|Business service issue|

This compresses **MTTI (Mean Time To Identify)** from **30–60 minutes → < 1 minute**.

---

## 📌 **(B) Detect issues before users are affected**

Because probes run every 15s and are lightweight:

- Insight often detects rising latency **before** it hits business QPS
    
- Allows infra to reroute traffic or replace nodes proactively
    
- Reduces number of full-scale outages
    

Example patterns:

- TGW routing degradation
    
- Mediary overload (CPU buildup)
    
- Packet loss spikes
    
- Redis / DB region-to-region slowdowns
    

---

## 📌 **(C) Reduce noise and false alarms**

Before Insight:

- Business teams opened tickets blaming infra
    
- Infra blamed business
    
- No one knew who owned the incident
    

After Insight:

- A single graph shows precisely where the issue is
    
- No more guessing
    
- No more cross-team back-and-forth
    

Clarity → faster decisions → less confusion.

---

## 📌 **(D) Faster incident resolution (MTTR reduction)**

Insight shortens:

- **Time to detect**
    
- **Time to identify**
    
- **Time to confirm and communicate**
    

This directly reduces impact to:

- business metrics (login failure rate, registration rate)
    
- player experience
    
- operational load on on-call engineers
    

---

# 📈 **6. Quantifying Impact — A Framework You Can Use**

You can quantify Insight’s value using 4 measurable vectors:

---

### **(1) MTTR Reduction**

- Before: 30–60 minutes to identify root cause
    
- After Insight: < 1–2 minutes  
    → **80–95% reduction in identification time**
    

---

### **(2) Incident Prevention**

Insight proactively captures:

- intermittent packet loss
    
- cross-region latency spikes
    
- Mediary overload
    
- degraded network routes
    

You can phrase it like:

> Insight detects degradations 15–45 minutes before business-level metrics show anomalies, enabling proactive mitigation.

---

### **(3) Reduced Investigation Overhead**

- Fewer cross-team escalations
    
- Fewer manual checks
    
- Less guesswork
    

Estimated savings:

> 3–5 on-call engineer hours per incident.

---

### **(4) Reliability Improvements**

Metrics:

- improved cross-region SLA
    
- fewer “unknown cause” incidents
    
- lower number of false ownership escalations
    

---

# 📘 **7. Clean, Polished Version (Interview-Ready)**

Here’s a compact version you can use anywhere:

---

### **What Insight Is**

Insight is a **cross-region probing and observability system** designed to give business services real-time visibility into the health of their request paths.

---

### **Why It’s Valuable**

Before Insight, when a cross-region request path broke, teams had no idea whether the issue was in:

- the business service itself
    
- the Mediary forwarding layer
    
- the cross-region network
    
- or only a specific region/AZ
    

This significantly increased incident investigation time.

---

### **How Insight Works**

Insight deploys probes **in the same region as the business service**, sending continuous cross-region RPC tests every 15 seconds.  
It captures:

- hop-by-hop latency
    
- end-to-end latency
    
- success rate
    
- packet loss
    
- Mediary path behavior
    

All metrics appear in Prometheus and Grafana.

---

### **Business Impact**

- **Cuts incident identification time by ~90%**
    
- Enables **early detection** of network degradation
    
- Provides **clear ownership** during incidents
    
- Reduces false escalations & operational noise
    
- Improves service reliability and player experience