---
title:
draft: false
tags:
date: 2025-11-19
---
## Complete Interview Template

### Minutes 0-5: Clarify Requirements

**Functional:**

- "The cart should support add, remove, update, view, and checkout operations. Should we handle guest carts?"
- "How long should carts persist?"

**Non-functional:**

- "What's the expected scale? DAU? Peak QPS?"
    - Answer: 10M DAU, 50K QPS
- "What regions?"
    - Answer: Southeast Asia
- "Latency requirements?"
    - Answer: <200ms
- "Consistency requirements?"
    - Answer: Eventual consistency OK, except checkout

---
### Minutes 5-8: Capacity Planning

```
Storage: 10M users × 5 items × 200 bytes = 10GB/day
30 days retention = 300GB with replication = ~1TB

QPS: 50K total
- Read: 49,500 QPS (99%)
- Write: 500 QPS (1%)

With 95% cache hit rate:
- Redis: 47,500 QPS ✅
- DB: 2,975 QPS ✅ Manageable
```

---
### Minutes 8-15: High-Level Design

```
Client → Gateway → Load Balancer 
                      ↓
               [API Servers] (stateless)
                      ↓
            ┌─────────┴─────────┐
            ↓                   ↓
       [Redis Cache]        [MySQL]
                          (Master + Replicas)
```

Walk through request flow:

1. Client sends request to gateway
2. Load balancer routes to API server
3. API checks Redis cache first
4. On cache miss, query MySQL replica
5. Store in cache for next request

---
### Minutes 15-20: Database Design

```sql
CREATE TABLE cart_items (
    user_id VARCHAR(64),
    item_id VARCHAR(64),
    quantity INT,
    price DECIMAL(10,2),
    variant_data JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    PRIMARY KEY (user_id, item_id),
    INDEX idx_user_id (user_id)
);
```


- Composite PK prevents duplicates
- Index on `user_id` for fast lookups
- Denormalize price for consistency
- JSON for flexible variant data

---
### Minutes 20-25: Caching Strategy

- Use Redis with cache-aside pattern
- Using Redis hash for efficient item-level operations

```
Read flow:
1. Check Redis (GET cart:user_123)
2. If miss, query MySQL
3. Store in Redis with 1-hour TTL

Write flow:
1. Update MySQL
2. Delete Redis key
3. Next read reloads from DB
```

---
### Minutes 25-35: Scaling Strategy

How to scale to handle 10M users:

**1. Horizontal scaling:**

- Multiple stateless API servers behind load balancer
- Can add servers dynamically

**2. Database scaling:**

- Add read replicas for read traffic
- Master handles writes, replicas handle reads
- If needed, shard by user_id using consistent hashing

**3. Multi-region:**

- Deploy in each geographic region
- Route users to nearest region
- Reduces latency from 200ms to 10ms

---
### Minutes 35-40: Handle Edge Cases

**1. Concurrent updates:**

- Use idempotency keys to prevent duplicate adds
- Optimistic locking with version numbers

**2. Database failure:**

- Promote replica to master (auto-failover)
- Writes fail for ~30 seconds during failover
- Reads continue working

**3. Cache failure:**

- Fall back to database
- Response time degrades but system still works

**4. Price changes:**

- Store price when added (user expectation)
- Show price difference in UI if current price changed

---
### Minutes 40-43: Monitoring & Observability

**Metrics:**

- P99 latency (alert if >500ms)
- Cache hit rate (alert if <90%)
- Error rate (alert if >1%)
- Database replication lag

**Logging:**

- Structured logs with trace IDs
- Track all cart operations

**Alerting:**

- PagerDuty for critical issues
- Slack for warnings

---
### Minutes 43-45: Trade-offs & Wrap-up

**1. Eventual consistency over strong consistency**

- Faster, more available
- Acceptable for cart (not payment)

**2. Cache-aside over write-through**

- Simpler, safer
- Slight performance penalty acceptable

**3. Denormalize price only**

- Balance between consistency and performance

**Improvements if more time:**

- Add recommendation engine
- Implement cart sharing
- Advanced analytics

> This design should handle 10M users with 50K QPS, <200ms latency, and 99.9% uptime.