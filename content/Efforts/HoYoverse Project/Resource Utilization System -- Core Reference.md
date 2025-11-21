---
title:
draft: false
tags:
date: 2025-11-10
---
## Project Overview

Built and delivered a **cloud resource utilization reporting system** to give business units visibility into AWS resource consumption and identify cost-optimization opportunities. 
The system continuously collects, validates, and stores utilization metrics (CPU %, memory, disk I/O etc.) across EC2, RDS and other AWS resources—automating what used to be a manual cost-tracking process.

- **Environment:** AWS (EC2 / RDS / MSK), Prometheus + YACE exporter, PolarDB, Python
    
- **Role:** End-to-end owner — architecture, data pipeline, validation, alerting and documentation

---
## Background

### Problem

Previously, business teams lacked a central view of resource usage across accounts. Data came from disparate dashboards and manual CloudWatch queries ( expensive per API call ).  
This made cost optimization reactive and error-prone.

### Pain Points

- Fragmented data sources (CloudWatch, OpsDB, Prometheus)
- High manual effort for monthly cost analysis
- No alerting or data validation pipeline

### Goal

Build a system that:

- Gives business units clear, unified visibility into AWS resource utilization
- Helps teams identify and reduce underutilized resources, driving **cost optimization**
- Automates manual reporting workflows to improve efficiency and reliability
- Itself is **robust, low-cost, and reliable**, minimizing operational overhead

---
## Core Architecture

### System Architecture

```
        +-------------------+
        |   AWS Services    |  (EC2, RDS, EBS, etc.)
        +---------+---------+
                  |
        [YACE Exporter / CloudWatch API]
                  |
        +---------v---------+
        | Data Collection   |  (Prometheus scrape, OpsDB)
        +---------+---------+
                  |
        | Transformation + Validation |
                  |
        +---------v---------+
        | Storage Layer     |  (PolarDB + File System)
        +---------+---------+
                  |
        +---------v-------------+
        | Monitoring + Alerting |
        +-----------------------+
```

1. **Collector** – multi-source metric collection
    
2. **Processor** – data transformation & NaN handling
    
3. **Storage** – dual storage (file + DB) with idempotent writes
    
4. **Monitor** – system health and data quality alerts

### Data Flow

#### 1. Collect

- CloudWatch → **YACE** scrapes once per metric namespace (cost-efficient), exposes Prometheus metrics. Prometheus scrapes YACE at fixed intervals.

- **OpsDB / other sources** are polled for metadata or missing dimensions (owner, BU, tags).

#### 2. Transform & Validate
    
- ETL job (Python) loads from Prometheus, normalizes to a **unified schema** (`resource_id`, `ts`, `cpu%`, `mem%`, `disk_io`, `tags`).

- Runs **completeness checks**, range checks, timestamp alignment, and mapping accuracy; bad rows quarantined for retry/backfill.
    
#### 3. Store
    
- **Dual-write**: append-only **files** (cheap raw archive) + **PolarDB** (query/BI). Writes are **idempotent** to tolerate retries.

#### 4. Serve & Monitor
    
- BI/SQL consumers read from PolarDB; scheduled reports power **cost-optimization** and capacity planning.
    
- **Health alerts** on collection failures, data gaps, and pipeline errors (“monitor the monitoring”).

---
## Design Highlights

- **Efficient Data Collection:** Integrated **YACE** to scrape CloudWatch metrics once and expose them to **Prometheus**, avoiding repetitive API calls. Added **Prometheus recording rules** (1m/5m aggregates) to reduce query load and speed up ETL processing.
    
- **Reliable Processing Pipeline:** Developed a **Python ETL job** that retrieves Prometheus metrics, performs transformation and validation, and handles missing values, NaNs, and timestamp misalignments through retries and normalization.
    
- **Robust Storage Design:** Implemented a **dual-storage strategy** (file system + **PolarDB**) with **idempotent writes**, ensuring consistency, recoverability, and low operational cost.
    
- **Comprehensive Monitoring:** Added built-in health checks and alerts for collection failures, processing errors, and data anomalies, with detailed logging for troubleshooting.
    
- **Scalable & Maintainable:** Modular architecture and parameterized configs make it easy to extend to new AWS services or integrate with future cost-management and analytics platforms.

---
## Impact

| Dimension        | Before                          | After                                         |
| ---------------- | ------------------------------- | --------------------------------------------- |
| **Visibility**   | Scattered CloudWatch dashboards | Unified utilization view in PolarDB + Grafana |
| **Cost Insight** | Manual analysis per team        | Automated reports identifying idle resources  |
| **Data Quality** | Ad hoc queries, incomplete      | 100% collection success, 0 data loss          |
| **Efficiency**   | Manual collection hours / week  | Fully automated nightly runs + alerting       |

**Business Impact**

- Enabled data-driven cost reduction and capacity planning
- Eliminated manual aggregation workload
- Provided foundation for future predictive analytics
    
---

> [!info] See also
> [[Resource Utilization System -- Interview Talking Points]]

