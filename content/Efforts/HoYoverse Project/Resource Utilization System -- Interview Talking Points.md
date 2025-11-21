---
title:
draft: false
tags:
date: 2025-11-10
---
## Describing the Project 

### In 30 sec

> **S**: Infra teams didn’t have a clear view of AWS resource usage — everything was manual and fragmented.  

> **T**: I was asked to build a system that could **centralize resource utilization data**, enable **cost optimization**, and be **robust yet low-cost** to operate.

> A: I built a **Python ETL pipeline** that transformed, validated, and stored metrics in **PolarDB**, with full health monitoring.  
> To keep it **efficient and cost-effective**, I used **YACE** for one-time CloudWatch scraping and **Prometheus recording rules** for pre-aggregation, which cut both query load and cost significantly.

> R: It’s fully monitored, low-cost, and reliable — and now teams can easily see under-used resources and make data-driven cost decisions.

### In 2 min

> **S:**
> Before this project, business teams had **no centralized visibility** into AWS resource usage.  
> Data was fragmented across CloudWatch dashboards, making cost optimization slow, manual, and error-prone.

> **T:**
> I was tasked to **design and deliver** a system that could collect, validate, and centralize utilization data across multiple AWS accounts — while keeping it **robust and low-cost**.

> **A:**
> I designed an end-to-end pipeline:
> 
> - Integrated **YACE** and **Prometheus** for efficient metric collection, using **recording rules** to pre-aggregate data and reduce query load.
>     
> - Built a **Python ETL job** to pull Prometheus metrics, transform and validate them, and load them into **PolarDB** with idempotent writes.
>     
> - Added **monitoring and alerting** for system health, collection gaps, and data quality issues.
>     
> - Documented everything and handed over to business teams with clear usage guides.
    
> **R:**
> The system achieved **100% data-collection success** and **zero data loss**, replacing manual reporting with an automated, reliable workflow.  
> It enabled teams to **identify underutilized resources**, supported **cost-optimization initiatives**, and became a reusable framework for future analytics.

---
## Challenges & Resolution

### Prometheus recording rules challenge

> **S:**
> When I first built the ETL job, I queried Prometheus directly for raw metrics.  
> It technically worked, but queries kept timing out and sometimes returning incomplete data.

> **T:**  
> I needed to make the data pipeline **reliable, responsive, and cost-efficient**, not just "hoping it would work".

> **A:**  
> After digging deeper, I realized the real problem wasn’t the query code — it was architectural: we were forcing Prometheus to aggregate millions of samples on demand, which it’s not designed for.  
> So I rethought the design and introduced **recording rules** to pre-compute 1- and 5-minute CPU and memory metrics. 
> That moved the heavy computation upstream, so the ETL could just read small, ready-to-use series.

> **R:**  
> The change cut query latency from minutes to seconds and stabilized the whole pipeline — and it taught me that reliability often comes from **putting computation in the right place**, not just fixing code.

>[!info]- How Prometheus Recording Rules Work
> Recording rules reduce the load on Prometheus by **pre-calculating** the results of computationally expensive queries and saving them as new, simple time series data — trading **Space** (additional storage) for **Time** (faster query).
> 
> Instead of the query engine re-running a complex aggregation over raw data every time a dashboard or alert requests it, the "ruler" component runs the calculation periodically in the background.
> 
> Benefits:
> 
> - **Faster Dashboard/Alert Loads:** Queries read the small, pre-computed result rather than the large volume of raw data.
> - **Amortized Computation:** The heavy lifting is done once per evaluation interval, not every time the data is accessed.
> - **Data Aggregation:** Thousands of raw time series are aggregated into a few simple ones, reducing the amount of data processed during queries.
> - **Eliminates Redundancy:** A single recording rule replaces multiple identical slow queries across different dashboards and alerts.

---
## Follow-up Q&A

- **Q:** How would you scale to more AWS accounts?  
    **A:** Abstract collector config per account and parallelize scrapes.
    
- **Q:** What if collection fails?  
    **A:** Alert + retry + backfill logic for missed intervals.
    
- **Q:** How do you ensure accuracy of CloudWatch metrics?  
    **A:** Cross-validate with OpsDB and Prometheus data sources.

---
## Resume Points

### Backend Engineer Focus

> **Designed and implemented a modular Python data pipeline** that collected, validated, and stored AWS resource utilization metrics via Prometheus and PolarDB, transforming fragmented cloud data into a reliable backend service for automated cost reporting and analysis.

### Infra / Cloud Engineer Focus

> **Built an end-to-end cloud resource utilization pipeline** integrating Prometheus, YACE, and PolarDB to automate AWS metric collection and validation, achieving reliable, low-cost visibility into infrastructure usage and supporting cost optimization at scale.

### Platform Engineer Focus

> **Developed a production-grade data pipeline** for cloud resource utilization reporting, integrating observability, validation, and storage layers to provide a scalable, self-monitored foundation for cross-team cost analytics and infrastructure insights.

### Generic / Multi-role Version

> **Architected and delivered a robust data pipeline** that automated the collection, transformation, and storage of AWS utilization metrics, improving data reliability, operational efficiency, and visibility across business units.
