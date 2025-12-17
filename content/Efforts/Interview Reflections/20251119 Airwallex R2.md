---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-11-19
---
## Meta

- Company:  Airwallex
- Role: [Software Engineer II, Cloud Infra](https://careers.airwallex.com/job/50c44f36-f889-40e4-ba32-84b20d2cada4/software-engineer-ii-cloud-infra/)
- Interviewer: Michael Liu (Staff DevOps Engineer)
- Focus: System Design

---
## Problem Statement

**Design a distributed key-value store** that supports CRUD, considering: 

- scaling, sharding, replication
- consistency, consensus / leader election
- hot keys, caching
- multi-region deployments, performance optimizations
- security...

---
## What I said

### 1. Initial Architecture (Very Simple CRUD)

- Client → API Gateway → KV Store Service → NoSQL DB
- API Gateway routes CRUD requests
- KV store simply reads/writes to DB
    
### 2. Scaling → Sharding

- **Hash-based sharding** → map keys to shards
- API gateway determines shard based on hash(key)
- Limitation: hash-based sharding breaks when resizing cluster
- Improvement: **consistent hashing** to reduce data movement

### 3. Replication for Availability

#### Leader-based replication

- master node handles all writes
- slaves replicate from master
- synchronous vs asynchronous
- strong consistency vs high throughput tradeoff
    
#### Where I got confused

- was about to mention leaderless replication but not sure how it fits
- mentioned quorum reads/writes but didn't connect them properly
    
Mentioned: 
- client can read from majority replicas
- if majority agrees on value → consistent

Missed: 
- **Quorum = W + R > N**
- Quorum consistency is mainly used in **leaderless systems** (e.g., Dynamo, Cassandra)
- How quorum READ and WRITE work together

### 4. Consensus Protocols (Paxos / Raft)**

The interviewer asked about: 
- how to pick a new leader
- how is Paxos different from Raft, when to use which and what to consider
    
Mentioned: 
- Paxos is complicated; Raft is easier
- Didn’t articulate “log replication”, “leader election”, “majority quorum”, “append-only log semantics”
    
Missed: 
- Paxos = consensus on a value (per log index)
- Not just leader election
- Used to form a replicated log → strong consistency
- Raft = same idea but simpler: leader handles append entries
    
### 5. Hot Key Handling

- Key rewriting (key → key1, key2)
- Load balancer does the distribution & aggregation logic 
    
Missed: 
- who writes these multiple keys
- how metadata is tracked
    
### 6. Redis Caching

- Redis cache for hot-key storage / retrieval 
- Redis cluster for HA & scalability

Missed: 
- write-through / write-back / cache invalidation
- stale reads
- cache failure modes
- consistency guarantees

### 7. Multi-Region / AZ Availability

- deploying shards in different AZs
- cross-region routing
- failover if one region dies


Missed: 
- cross-region replication lag
- strong vs eventual consistency
- read locality vs write cost
- global consensus being expensive (Paxos, Spanner)
    

### 8. Performance Optimization

- batching
- connection pooling
- scaling out DB
- scaling up node power

- had a slip where I mentioned “DB indexing” for NoSQL (self-corrected immediately) 

### 9. Security

- authentication
- RBAC
- private subnets
- firewall rules
- data encryption at rest + in transit

### Final Architecture Diagram

![[airwallex-r2-distributed-kv-design.png|600]]
