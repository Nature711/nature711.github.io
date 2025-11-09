---
title:
draft: false
tags:
description:
date: 2025-11-09
---
## 1. High Availability (HA)

> [!info] **Goal**: System remains operational and accessible even when components fail

### Key Metrics

- **Uptime percentage**: 99.9% (three nines = 8.76 hours downtime/year), 99.99% (four nines = 52.6 minutes/year)
- **MTTR** (Mean Time To Repair): How quickly you recover from failures
- **Error rate**: Percentage of failed requests

### Common Solutions

#### Redundancy & Failover

- **Multi-instance deployment**: Run multiple copies of each service
- **Active-active**: All instances handle traffic simultaneously
- **Active-passive**: Standby instances ready to take over
- **Load balancers with health checks**: Auto-route traffic away from unhealthy instances

#### Database HA

- **Master-slave replication**: Read replicas for redundancy
- **Multi-master replication**: Multiple writable nodes
- **Automatic failover**: Promote replica to master when master fails
- **Database clustering**: MySQL Cluster

#### Geographic Distribution

- **Multi-region deployment**: Survive region-wide outages
- **DNS failover**: Route traffic to healthy regions
- **Cross-region replication**: Data available in multiple locations

#### Fault Tolerance Patterns

- **Circuit breakers**: Stop calling failing dependencies, fail fast
- **Retry with exponential backoff**: Gracefully handle transient failures
- **Bulkheads**: Isolate failures (one service failure doesn't cascade)
- **Timeouts**: Don't wait forever for responses
- **Graceful degradation**: Reduced functionality instead of complete failure

#### Monitoring & Alerting

- **Health checks**: Liveness and readiness probes
- **Synthetic monitoring**: Proactively test critical paths
- **Alerting**: PagerDuty for incident response

---
## 2. High Throughput

> [!info] **Goal**: Process maximum number of requests/transactions per unit time

### Key Metrics

- **QPS/TPS** (Queries/Transactions Per Second): How many operations handled
- **Request latency**: p50, p95, p99 response times
- **Saturation**: Resource utilization (CPU, memory, network at capacity)
- **Throughput**: MB/s processed, records/second

### Common Solutions

#### Horizontal Scaling

- **Add more servers**: Scale out rather than up
- **Load balancing**: Distribute requests evenly (Round-robin, least connections, consistent hashing)
- **Stateless services**: Any instance can handle any request

#### Caching

- **Application-level cache**: In-memory caches (Redis, Memcached)
- **Database query cache**: Reduce repeated expensive queries
- **CDN**: Cache static content closer to users
- **Cache strategies**: Cache-aside, write-through, write-back
- **Multi-level caching**: L1 (local), L2 (distributed)

#### Asynchronous Processing

- **Message queues**: Kafka, RabbitMQ for background jobs
- **Event-driven architecture**: Decouple services, process asynchronously
- **Batch processing**: Group operations instead of one-by-one
- **Non-blocking I/O**: Handle more concurrent connections (async/await, goroutines)

#### Database Optimization

- **Read replicas**: Distribute read load across multiple databases
- **Connection pooling**: Reuse database connections
- **Indexing**: Speed up queries
- **Denormalization**: Trade storage for speed
- **Query optimization**: Avoid N+1 queries, use proper indexes

#### Resource Optimization

- **Compression**: Reduce network bandwidth (gzip, brotli)
- **Protocol optimization**: HTTP/2, gRPC for efficient communication
- **Keep-alive connections**: Reduce connection overhead
- **Efficient serialization**: Protobuf instead of JSON

#### Concurrency

- **Thread/goroutine pools**: Maximize CPU utilization
- **Parallel processing**: Handle multiple requests simultaneously

---
## 3. High Scalability

> [!info] **Goal**: System can grow to handle increasing load by adding resources

### Key Metrics

- **Linear scalability**: 2x resources = 2x capacity
- **Cost per request**: Efficiency as you scale
- **Time to scale**: How quickly can you add capacity
- **Resource utilization**: Are you efficiently using added resources?

### Common Solutions

#### Horizontal Scalability (Scale Out)

- **Stateless architecture**: No session affinity needed
- **Microservices**: Scale individual services independently
- **Auto-scaling**: Automatically add/remove instances based on metrics
- **Container orchestration**: Kubernetes for dynamic scaling

#### Database Scalability

- **Sharding/Partitioning**: Split data across multiple databases
    - Horizontal sharding: By `user_id`, `region`, etc.
    - Vertical sharding: Split by table/domain
- **NoSQL databases**: Cassandra, MongoDB designed for horizontal scaling
- **CQRS**: Separate read and write databases, scale independently
- **Database federation**: Logical split by business domain

#### Data Management

- **Consistent hashing**: Distribute data evenly, minimal rebalancing
- **Data partitioning**: Time-based, range-based, hash-based
- **Hot shard handling**: Identify and split overloaded shards
- **TTL/Data archiving**: Move old data to cold storage

#### Service Architecture

- **Microservices**: Decompose monolith into independent services
- **API Gateway**: Single entry point, route to appropriate services
- **Service mesh**: Handle service-to-service communication (Istio, Linkerd)
- **Serverless**: Functions scale automatically (AWS Lambda)

#### Decoupling

- **Message queues**: Decouple producers from consumers
- **Event-driven architecture**: Services react to events independently
- **Pub/sub patterns**: One-to-many communication
- **Saga pattern**: Distributed transactions across services

#### Infrastructure

- **Cloud-native**: Leverage cloud auto-scaling capabilities
- **Infrastructure as Code**: Terraform, CloudFormation for reproducible infrastructure
- **Multi-cloud**: Avoid vendor lock-in, scale across providers
- **Edge computing**: Process data closer to users

#### Rate Limiting & Throttling

- **API rate limiting**: Protect from overload
- **Token bucket algorithm**: Smooth traffic spikes
- **Priority queues**: Critical requests processed first
- **Backpressure**: Signal upstream services to slow down

---
## Example: E-commerce Checkout Service

### High Availability

- Multiple instances across 3 AZs
- Database with master-slave replication
- Circuit breaker for payment gateway
- Health checks + automatic failover

### High Throughput

- Redis cache for product data (99% hit rate)
- Async order processing via Kafka
- Connection pooling to database (100 connections)
- CDN for product images
- Read replicas for order history queries

### High Scalability

- Auto-scaling: 10-100 instances based on CPU
- Database sharded by `user_id`
- Microservices: Separate cart, order, payment services
- Message queue handles 10K orders/sec burst

---
## Trade-offs Between Pillars

### Availability vs. Consistency

- Higher availability often means **eventual consistency**
- CAP theorem: Can't have all three at once

### Throughput vs. Latency

- Batching increases throughput but adds latency
- Caching improves throughput but adds complexity

### Scalability vs. Simplicity

- Sharding enables scale but increases operational complexity
- Microservices scale independently but harder to debug

### Cost vs. Performance

- More redundancy = higher availability but higher cost
- Over-provisioning for scalability wastes resources

---
## Summary

| Pillar           | Core Focus                   | Key Pattern                   | Example Metric             |
| ---------------- | ---------------------------- | ----------------------------- | -------------------------- |
| **Availability** | Stay up when failures happen | Redundancy + Failover         | 99.99% uptime              |
| **Throughput**   | Handle more requests/sec     | Caching + Async               | 100K QPS                   |
| **Scalability**  | Grow capacity linearly       | Horizontal scaling + Sharding | 2x resources = 2x capacity |

---
## Interview Tip

When discussing these, always:

1. **Connect to business impact**: "High availability ensures we don't lose revenue during checkout"

2. **Give specific numbers**: "We handle 50K QPS during normal hours, 200K during flash sales"

3. **Mention trade-offs**: "Sharding improves scalability but makes joins expensive"

4. **Use real examples**: "At my previous company, we used Redis to cache product catalog, improving throughput from 5K to 50K QPS"

---

> [!info] Related
> See [ByteByteGo System Design Cheat Sheet](https://bytebytego.com/guides/system-design-cheat-sheet/) for a beautiful visualization sheet.

