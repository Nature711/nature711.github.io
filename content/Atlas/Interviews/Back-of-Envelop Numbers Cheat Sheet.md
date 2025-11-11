---
title:
draft: false
tags:
date: 2025-11-08
---
## Scale Triggers

- 1K QPS → Separate DB
- 10K QPS → Add caching
- 50K QPS → Horizontal scaling + Load balancer
- 100K QPS → Read replicas
- 500K QPS → Sharding
- 1M+ QPS → Multi-region

## Cache Hit Rate

- 90%+ = Good
- 80-90% = Acceptable
- <80% = Need optimization

## DB Rules

- Index on columns in WHERE clause
- Denormalize for read-heavy workloads
- Shard by primary access pattern (user_id for cart)
- Use replicas for reads, master for writes

## Reliability

- Health checks every 5-10 seconds
- Circuit breakers for external services
- Graceful degradation when dependencies fail
- Exponential backoff for retries

## Monitoring

- P50, P95, P99 latency
- Error rate
- Cache hit rate
- Database replication lag
- CPU, memory, disk usage
