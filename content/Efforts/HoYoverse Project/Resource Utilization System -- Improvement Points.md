---
title:
draft: false
tags:
date: 2025-12-01
---
## Unified Resource Metadata & Ownership Mapping

**Problem (v1):**  

Some teams don’t know which resources belong to whom → no accountability.

**Improvement:**  

Introduce a metadata layer with:

- auto-tagging logic
- team/owner mapping
- BU/project attribution
- environment classification
    

**Benefit:**

- Enables chargeback / showback
- Easy to know “which team owns this idle resource?”
- Automatic reporting per BU

---
## Historical Storage Optimization

**Problem (v1):**  

PolarDB storage grows quickly with new metrics.

**Improvement:**

- Move long-term raw data to OSS/S3
- Partition tables by date

**Benefit:**

- Cheaper storage
- Faster queries
- Enables long-term retention

---
## Scalability

### Current System

- **Collection layer**: Prometheus + YACE pulling CloudWatch
- **Processing layer**: Python ETL jobs (ingest, validate, transform)
- **Storage layer**: PolarDB + file-based storage
- **Design**: modular, config-driven, idempotent batch pipeline

### Collection Layer Scaling

- Run **multiple YACE exporters** (per account / per region)
- Limit what each exporter collects (different jobs / services)
- Use **Prometheus sharding + Thanos** or federation to split scrape load

### Processing Layer Scaling

- **Shard jobs by key**: account, region, service, or time window
- Run multiple ETL workers in parallel (cron jobs / workers in a queue)
- Keep processing **idempotent**, so re-runs are safe

### Storage layer scaling

- **Partition tables** in PolarDB by date + account/region
- Move older raw data to cheap storage (S3/OSS)

> “We can scale it horizontally: add more YACE exporters and Prometheus shards on the collection side, shard ETL jobs by account or region so multiple workers run in parallel, and partition the PolarDB tables plus offload old raw data to S3. Because the pipeline is batch-based and idempotent, scaling out is mostly about adding more workers and partitions rather than redesigning logic.”

