---
title:
draft: false
tags:
date:
---
## Modular Probe Engine (Plug-in Architecture)

**Problem (v1):**  
Ping tests are hard-coded into the service (Layer-7 Application)

**Improvement:**  
Introduce a **probe interface**, then implement:

- HTTPProbe
- gRPCProbe
- TCPConnectProbe
- DatabaseProbe (ClickHouse / Redis ping), etc.

**Benefit:**

- Easily extendable
- Other teams can contribute probes
- Keeps Insight maintainable long-term

---
## Baseline Normalization & Noise Reduction

**Problem (v1):**  

Raw network metrics are noisy (daily variation, cross-region jitter).

**Improvement:**  

Add:
- Baseline calculation per hour-of-day
- Deviation-based alerts instead of static thresholds
- Jitter smoothing (EWMA)
- Automatic outlier filtering

**Benefit:**

- Far fewer false alerts
- Better signal quality
- Helps identify _true_ performance regressions

----
## Probe Scheduling Improvements

**Problem (v1):**  

Probes run at fixed intervals; not load aware.

**Improvement:**

- Adaptive frequency (increase probing when degradation detected)
- Randomized intervals to avoid thundering herd
- Sliding window metrics
    

**Benefit:**  
Lower overhead + more accurate detection.

---
## Historical Trend Analysis

**Problem (v1):**  

Only real-time Prometheus metrics, no long-term analytics.

**Improvement:**

- Export metrics to Thanos for long-term retention
- Add trend dashboards (weekly/monthly latency patterns)
- Correlate network latency with deployment events
    

**Benefit:**

- Understand long-term baseline
- Detect slow regressions
- Improves incident root-cause analysis