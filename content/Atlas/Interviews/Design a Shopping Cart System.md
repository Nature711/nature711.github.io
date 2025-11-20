---
title:
draft: false
tags:
date: 2025-11-08
---
## Phase 1: Clarify Requirements

### Functional Requirements

- "What operations should the cart support?"
    - Add item to cart
    - Remove item from cart
    - Update item quantity
    - View cart
    - Clear cart
    - Merge carts (logged in user + guest cart)
- "Should we handle guest carts (unauthenticated users)?"
    - Yes - store by session ID
- "What about cart persistence - how long should carts be saved?"
    - Active users: Keep indefinitely
    - Inactive: Clean up after 30 days

#### Non-Functional Requirements

- "What's the expected scale?"
    - **DAU**: 10 million daily active users
    - **Peak QPS**: 50,000 requests per second
    - **Read:Write ratio**: 100:1 (users view cart 100x more than they modify it)
- "What regions do we need to support?"
    - Southeast Asia: Singapore, Indonesia, Malaysia, Thailand, Vietnam, Philippines
- "What are the latency requirements?"
    - **Target**: < 200ms for all cart operations
    - **P99 latency**: < 500ms
- "What about availability?"
    - **Target**: 99.9% uptime (SLA)
    - Cart is critical but not as critical as checkout
- "Any consistency requirements?"
    - **Eventual consistency is acceptable** for cart viewing
    - **Strong consistency needed** for checkout (when converting cart to order)

---
## Phase 2: Back-of-Envelope Calculations

### Storage Calculation

```
Assumptions:
- 10M daily active users
- Average 5 items per cart
- Each cart item: ~200 bytes

Total daily cart data:
= 10M users × 5 items × 200 bytes
= 10M × 1KB
= 10GB per day

Keep carts for 30 days:
= 10GB × 30 = 300GB total storage

With 3x replication: ~1TB storage needed
```

### QPS Calculation

```
Peak QPS: 50,000 requests/second
Read:Write = 100:1

Read QPS: 50,000 × (100/101) ≈ 49,500 QPS
Write QPS: 50,000 × (1/101) ≈ 500 QPS

Database can handle:
- Without cache: ~1,000 QPS max
- With cache (95% hit rate): 49,500 × 0.05 = 2,475 cache misses
- Total DB load: 2,475 + 500 = ~3,000 QPS ✅ Manageable
```

### Bandwidth

```
Average response size: 5KB (cart with 5 items)
Peak bandwidth: 50,000 QPS × 5KB = 250 MB/s = 2 Gbps
```

**Conclusion**: Need caching, horizontal scaling, and database read replicas.

---
## Phase 3: High-Level Architecture

### Version 1: Baseline Architecture

>[!info]- Diagram
> ```
> ┌──────────┐
> │  Client  │ (Web/Mobile App)
> └────┬─────┘
>      │
>      ↓
> ┌─────────────┐
> │   Gateway   │ (API Gateway / Load Balancer)
> └──────┬──────┘
>        │
>        ↓
> ┌──────────────┐
> │ Cart Service │ (Stateless API servers)
> └──────┬───────┘
>        │
>        ↓
> ┌──────────────┐
> │   Database   │ (MySQL)
> └──────────────┘
> ```
> 

### Version 2: Production-Ready Architecture

>[!info]- Diagram
> ```
>                     ┌─────────────┐
>                     │   Client    │
>                     │ (Web/Mobile)│
>                     └──────┬──────┘
>                            │
>                            ↓
>                     ┌─────────────┐
>                     │ API Gateway │ (Nginx / AWS ALB)
>                     │ Rate Limiter│
>                     └──────┬──────┘
>                            │
>         ┌──────────────────┼──────────────────┐
>         │                  │                  │
>         ↓                  ↓                  ↓
>    ┌─────────┐       ┌─────────┐       ┌─────────┐
>    │Cart API │       │Cart API │       │Cart API │
>    │Server 1 │       │Server 2 │       │Server 3 │
>    └────┬────┘       └────┬────┘       └────┬────┘
>         │                 │                  │
>         └─────────────────┼──────────────────┘
>                           │
>         ┌─────────────────┼─────────────────┐
>         │                 │                 │
>         ↓                 ↓                 ↓
>    ┌─────────┐      ┌──────────────────┐  ┌──────────┐
>    │  Redis  │      │     MySQL        │  │ Message  │
>    │ (Cache) │      │                  │  │  Queue   │
>    │         │      │  ┌────────────┐  │  │ (Kafka)  │
>    │ - Carts │      │  │   Master   │  │  └──────────┘
>    │ - Session│     │  │  (Write)   │  │       │
>    └─────────┘      │  └──────┬─────┘  │       │
>                     │         │        │       ↓
>                     │    ┌────┴────┐   │  ┌─────────┐
>                     │    │Replicate│   │  │Analytics│
>                     │    ↓         ↓   │  │ Service │
>                     │  ┌────┐   ┌────┐ │  └─────────┘
>                     │  │Read│   │Read│ │
>                     │  │Rep1│   │Rep2│ │
>                     │  └────┘   └────┘ │
>                     └──────────────────┘
> ```

---
## Phase 4: API Design (CRUD)

### Add item to cart

```http
POST /cart/items
```

- Request includes: `user_id`, `item_id`, quantity, price, variant details
- Response returns: updated cart with total items and total price

### Get cart

```http
GET /cart?user_id=user_123
```

- Returns all items in cart with quantities, prices, timestamps
- Includes total items count and total price

### Update item quantity

```http
PUT /cart/items/{item_id}
```

- Request includes: `user_id`, new quantity
- Updates the quantity for specific item

### Remove item

```http
DELETE /api/v1/cart/items/{item_id}?user_id=user_123
```

- Removes specific item from cart

---
## Phase 5: Database Design
### Schema Design

> [!info]- Schema
> 
> ```sql
> -- Cart Items Table (Main table)
> CREATE TABLE cart_items (
>     id BIGINT PRIMARY KEY AUTO_INCREMENT,
>     user_id VARCHAR(64) NOT NULL,          -- User identifier
>     item_id VARCHAR(64) NOT NULL,          -- Product ID
>     quantity INT NOT NULL DEFAULT 1,       -- How many
>     price DECIMAL(10,2) NOT NULL,          -- Price at time of adding
>     variant_data JSON,                      -- Size, color, etc.
>     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
>     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
>     
>     -- Indexes
>     PRIMARY KEY (user_id, item_id),        -- Composite PK (no duplicates)
>     INDEX idx_user_id (user_id),           -- Fast user cart lookup
>     INDEX idx_updated_at (updated_at)      -- For cleanup jobs
> ) ENGINE=InnoDB;
> 
> -- Example data:
> +----------+---------+----------+-------+-------+--------------------+
> | user_id  | item_id | quantity | price | variant_data               |
> +----------+---------+----------+-------+----------------------------+
> | user_123 | prod_1  | 2        | 29.99 | {"size":"M","color":"blue"}|
> | user_123 | prod_5  | 1        | 15.50 | {"size":"L"}               |
> | user_456 | prod_3  | 3        | 45.00 | null                       |
> +----------+---------+----------+-------+----------------------------+
> ```

**1. Composite Primary Key `(user_id, item_id)`:**

- Prevents duplicate items in cart
- Fast lookup: "Does user_123 have prod_1?"

**2. Denormalize `price`:**

- Store price when added, not reference product table
- **Why?** Prices change, but user expects checkout price = add-to-cart price

**3. Use JSON for `variant_data`:**

- Flexible schema (different products have different variants)
- Don't need to add columns for every possible variant

**4. Index on `user_id`:**

- Most queries: `SELECT * FROM cart_items WHERE user_id = ?`
- Without index: Full table scan (slow!)
- With index: O(log n) lookup

**5. Index on `updated_at`:**

- For cleanup job: `DELETE FROM cart_items WHERE updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`

---
## Phase 6: Redis Cache Design

### Cache Strategy: Cache-Aside Pattern

**Read Operation (Get Cart)**

1. Try Redis first with cache key `cart:user_id`
2. Cache HIT: Return cached data immediately (fast path)
3. Cache MISS: Query database
4. Store result in Redis for next time with TTL = 1 hour
5. Return cart data

**Write Operation (Add Item)**

1. Write to database first (source of truth)
2. Use `INSERT ON DUPLICATE KEY UPDATE` for quantity updates
3. Invalidate cache by deleting Redis key
4. Next read will reload from database

### Redis Data Structure

Use **Redis Hash** (recommended for cart):

```redis
Key: "cart:user_123"
Hash fields:
  prod_1 → '{"qty":2,"price":29.99,"variant":{"size":"M"}}'
  prod_5 → '{"qty":1,"price":15.50,"variant":null}'

Commands:
- HSET cart:user_123 prod_1 '{"qty":2,"price":29.99}'
- HGETALL cart:user_123              (Get entire cart)
- HDEL cart:user_123 prod_1          (Remove item)
- HLEN cart:user_123                 (Count items)
- EXPIRE cart:user_123 3600          (Set TTL)
```

**Why Hash over String?**

- Update individual items without fetching entire cart
- Efficient memory usage
- Atomic operations on single items

### Cache Performance

**Without Cache**

- All 50K QPS hit MySQL
- MySQL dies at ~1K QPS

**With Cache (95% hit rate)**

- Redis handles: 47,500 QPS
- MySQL handles: 2,500 QPS (cache misses) + 500 QPS (writes) = 3,000 QPS
- Response time: 20ms → 1ms (20x faster)

---
## Phase 7: Scaling Strategy

### Step 1: Horizontal Scaling (API Servers)

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴────┬─────────┬─────────┐
   ↓        ↓         ↓         ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│API-1 │ │API-2 │ │API-3 │ │API-4 │  (Stateless servers)
└──────┘ └──────┘ └──────┘ └──────┘
```

**Key principle: Stateless servers**

- No session storage in memory
- Any server can handle any request
- Can add/remove servers dynamically

**Load balancing strategy:**

- **Round robin** for even distribution
- **Least connections** if some requests are slower
- **Health checks**: Remove unhealthy servers automatically

### Step 2: Database Read Replicas

```
                ┌────────────┐
                │   Master   │ ← All WRITES
                │  (Primary) │
                └──────┬─────┘
                       │
              ┌────────┴────────┐
              │   Replication   │
              ↓                 ↓
        ┌──────────┐      ┌──────────┐
        │ Replica 1│      │ Replica 2│ ← READS
        │  (Read)  │      │  (Read)  │
        └──────────┘      └──────────┘
```

**Read/Write Split**

- Read operations (GetCart): Query read replicas
- Write operations (AddToCart): Execute on master
- Master replicates changes to replicas

**Handling Replication Lag**

- After write operation, delete cache and set flag
- Flag indicates: read from master for next 5 seconds
- Ensures user sees their own writes immediately
- After flag expires, reads go back to replicas
- Balances strong consistency for writes with eventual consistency for reads

### Step 3: Database Sharding (for 100M+ users)

**Shard by `user_id`** using consistent hashing:

- Hash the user_id to determine shard number
- Route all operations for that user to specific shard
- Each shard handles subset of users

**Shard architecture:**

```
                API Servers
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    ┌───────┐    ┌───────┐    ┌───────┐
    │Shard 0│    │Shard 1│    │Shard 2│
    │users  │    │users  │    │users  │
    │0-33M  │    │34-66M │    │67-100M│
    └───────┘    └───────┘    └───────┘
```

**Why shard by `user_id`?**

- All cart operations are per-user (no cross-shard queries)
- Evenly distributes data
- Simple routing logic

### Step 4: Multi-Region Deployment

```
┌─────────────────────────────────────────────────────┐
│              Global Load Balancer (DNS)             │
│         (Routes to nearest region by geo)           │
└────┬─────────────────────┬──────────────────────────┘
     │                     │
     ↓                     ↓
┌─────────────────┐   ┌─────────────────┐
│ Singapore Region│   │ Indonesia Region│
│                 │   │                 │
│ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │Load Balancer│ │   │ │Load Balancer│ │
│ └──────┬──────┘ │   │ └──────┬──────┘ │
│        │        │   │        │        │
│   ┌────┴───┐    │   │   ┌────┴───┐    │
│   ↓        ↓    │   │   ↓        ↓    │
│ ┌────┐  ┌────┐  │   │ ┌────┐  ┌────┐  │
│ │API │  │API │  │   │ │API │  │API │  │
│ └─┬──┘  └─┬──┘  │   │ └─┬──┘  └─┬──┘  │
│   │       │     │   │   │       │     │
│   ↓       ↓     │   │   ↓       ↓     │
│ ┌──────────┐    │   │ ┌──────────┐    │
│ │Redis + DB│    │   │ │Redis + DB│    │
│ └──────────┘    │   │ └──────────┘    │
└─────────────────┘   └─────────────────┘
```

**Benefits:**

- Singapore users → Singapore region (10ms latency)
- Indonesia users → Indonesia region (10ms latency)
- Fault isolation (one region down ≠ all down)

---
## Phase 8: Handle Edge Cases & Failures

### Edge Case 1: Concurrent Updates

**Problem:** User clicks "Add to Cart" twice rapidly

```
Time 0: Request 1 arrives → Read quantity = 2
Time 1: Request 2 arrives → Read quantity = 2
Time 2: Request 1 writes quantity = 3
Time 3: Request 2 writes quantity = 3  ❌ Should be 4!
```

**Solution 1: Idempotency Key**

- Client generates unique key per request
- Server checks if key already processed
- If yes, return cached result
- If no, process and cache result for 24 hours
- Same key always returns same result (deduplicated)

**Solution 2: Optimistic Locking**

- Add version column to cart_items table
- UPDATE statement includes WHERE version = current_version
- Only succeeds if version matches
- If 0 rows affected, version changed (concurrent update detected)
- Retry with new version

### Edge Case 2: Item Out of Stock

**Problem**: User adds item, but inventory runs out before checkout

**Solution: Check inventory at critical points**

Add to cart flow:

- Check inventory service for availability (soft check)
- If available, add to cart
- User may still succeed even if low stock

Checkout flow:

- MUST check inventory again (hard check)
- Reserve inventory for each item
- If any item unavailable, return error
- If all available, create order and clear cart

Key principle: Soft check at add-to-cart, hard check at checkout

### Edge Case 3: Price Changes

**Problem**: Product price increases after user added to cart

**Solution: Store price at add-to-cart time**

- Cart stores price when item added
- At checkout, use cart price (not current product price)
- This matches user expectation

**Show price difference in UI**

- When fetching cart, compare cart price vs current price
- If different, flag item as price_changed
- Display both old and current price to user
- User decides whether to proceed

---
### Failure Scenario 1: Database Goes Down

**Problem:** MySQL master crashes

**Solution: Promote replica to master**

```
Before:
Master (DOWN) ❌
  ↓
Replica 1, Replica 2

After:
Replica 1 (NEW MASTER) ✅
  ↓
Replica 2
```

**Automatic failover with orchestration:**

- Use MySQL Replication Manager or Orchestrator
- Detects master failure in ~10 seconds
- Automatically promotes replica
- Updates connection strings

**During failover:**

- Writes fail for ~10-30 seconds
- Reads continue working (from replicas)
- Cart viewing still works, adding items temporarily fails

### Failure Scenario 2: Redis Cache Goes Down

**Problem**: Redis crashes

**Solution: Graceful degradation**

Read operation logic:

- Try cache first
- If Redis unavailable, log warning
- Fall back to database directly
- Return cart data from database

**Impact**

- Response time increases: 1ms → 20ms
- Database load increases: 2,500 QPS → 50,000 QPS
- May need rate limiting if database can't handle load

**Prevention: Redis Sentinel / Cluster**

- Deploy Redis with master and replicas
- Sentinel monitors health
- Auto-failover if master dies
- Replicas promoted automatically

```
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Redis   │   │ Redis   │   │ Redis   │
│ Master  │───│ Replica │   │ Replica │
└─────────┘   └─────────┘   └─────────┘
     ↑             ↑             ↑
     └─────────────┴─────────────┘
           Sentinel monitors
     (auto-failover if master dies)
```

---
### Failure Scenario 3: API Server Crashes

**Problem**: One API server dies

**Solution: Load balancer health checks**

Health check mechanism:

- Load balancer pings /health endpoint every 5 seconds
- If server fails health check, marked unhealthy
- Load balancer stops sending new requests
- Existing requests complete gracefully
- Traffic redistributed to healthy servers

Health check endpoint response:

- Status: healthy/unhealthy
- Database connection status
- Redis connection status
- Timestamp

---
## Phase 9: Monitoring & Observability

### Key Metrics to Track

**Application Metrics (Prometheus)**

- Request latency (P50, P95, P99)
- Request count by method, endpoint, status
- Cache hit rate by operation
- Error rate

**Database Metrics**

- Query latency (P50, P95, P99)
- Connection pool usage
- Slow query count (queries > 100ms)
- Replication lag (replica behind master)

**Redis Metrics**

- Memory usage
- Evicted keys per second
- Cache hit rate
- Command latency

**Business Metrics**

- Active carts count
- Average cart size (items per cart)
- Cart abandonment rate
- Checkout conversion rate

### Alerting Rules

**High latency alert**

- Trigger: P99 latency > 500ms for 5 minutes
- Action: Page on-call engineer

**Low cache hit rate alert**

- Trigger: Cache hit rate < 90% for 10 minutes
- Action: Investigate cache issues

**Database replication lag alert**

- Trigger: Replication lag > 10 seconds for 5 minutes
- Action: Check replica health

**High error rate alert**

- Trigger: Error rate > 1% for 2 minutes
- Action: Page on-call engineer

### Logging Strategy

**Structured logging format**

- Log level: DEBUG, INFO, WARN, ERROR
- Include: timestamp, trace_id, user_id, operation, latency, status
- Normal operations: INFO level
- Errors: ERROR level with stack trace
- Retries: WARN level

**Log levels in production**

- DEBUG: Disabled (too verbose)
- INFO: Cart operations (add, remove, checkout)
- WARN: Unusual but not error (cache miss, retry)
- ERROR: Failures (database down, invalid data)

---
### Distributed Tracing

```
Request flow with trace ID:

Client request [trace_id: abc123]
  ↓
API Gateway [abc123] - 2ms
  ↓
Cart Service [abc123] - 50ms
  ├─ Redis GET [abc123] - 1ms (cache miss)
  └─ MySQL Query [abc123] - 45ms
     └─ Index scan - 40ms
```

**Tools:** Jaeger, Zipkin, AWS X-Ray

**Benefits:**

- Find bottlenecks
- Debug slow requests
- Understand dependencies

---
## Phase 10: Security & Rate Limiting

### Security Measures

#### Authentication & Authorization

- Verify JWT token on every request
- Extract authenticated user_id from token
- Ensure user can only modify their own cart
- Return 401 Unauthorized for invalid token
- Return 403 Forbidden for wrong user_id

#### Input Validation

- Validate user_id format
- Validate quantity range (1-999)
- Validate price range (prevent negative prices)
- Sanitize item_id to prevent SQL injection
- Return 400 Bad Request for invalid input

#### SQL Injection Prevention

- Always use prepared statements with parameters
- Never concatenate user input into SQL queries
- Use parameterized queries with placeholders

#### API Security Headers

- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent XSS)
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: HTTPS only

### Rate Limiting

Token bucket algorithm implementation:

- Store request count in Redis
- Key format: "rate_limit:user_id"
- Increment counter on each request
- If count = 1, set expiration to 1 minute
- Allow request if count <= limit
- Return 429 Too Many Requests if exceeded
- Different tiers for different types of users / services

---
## Phase 11: Trade-offs Discussion

### Trade-off 1: Consistency vs Availability

**Strong Consistency**

- Write to master, wait for replica sync, then return success
- Pros: Always see latest data
- Cons: Slower writes (50ms+), lower availability

**Eventual Consistency**

- Write to master, return success immediately
- Replicas sync in background (100ms lag)
- Pros: Faster writes (10ms), higher availability
- Cons: May briefly see stale data

**Decision for Cart**: Eventual consistency acceptable

- Users won't notice 100ms lag
- Cart not mission-critical like payment
- Can force strong consistency at checkout

---
### Trade-off 2: Normalization vs Denormalization

**Normalized (Store product_id only)**

- Cart table has: `user_id`, `product_id`, quantity
- Products table has: `product_id`, name, price, image_url
- Get cart requires JOIN between tables
- **Pros**: Single source of truth, current prices
- **Cons**: Slower queries (JOIN overhead), higher database load

**Denormalized (Store product details in cart)**

- Cart table has: `user_id`, `product_id`, quantity, price, name, image_url
- No JOIN needed
- **Pros**: Faster queries, lower database load
- **Cons**: Stale data if product changes, more storage

**Decision for Cart**: Denormalize price only

- Store price when added (user expectation)
- Fetch name/image from Product Service (can change)
- Best of both worlds

---
### Trade-off 3: Cache Invalidation Strategy

#### Option A: Delete cache on write (Cache-Aside)

- On write: Update database, delete cache key
- Next read: Cache miss, reload from database
- Pros: Simple, safe (database is source of truth)
- Cons: First read after write is slow (cache miss)

- **Pros:** Simple, Safe (DB is truth) 
- **Cons:** First read after write is slow (cache miss)

#### Option B: Update cache on write (Write-Through)

- On write: Update database, fetch latest data, update cache
- Next read: Cache hit, fast
- Pros: No cache miss after write
- Cons: Extra database read, risk of cache inconsistency

- **Pros:** No cache miss after write 
- **Cons:** Extra DB read, Can get out of sync

#### Decision for Cart: Cache-Aside

- Simpler implementation
- Safer (avoids cache inconsistency bugs)
- Cache miss penalty acceptable (20ms vs 1ms)

---
### Trade-off 4: Synchronous vs Asynchronous Processing

#### Synchronous (Wait for all operations)

```go
func AddToCart() {
    db.Execute(...)           // Wait
    redis.Del(...)            // Wait
    inventoryService.Check()  // Wait
    return success
}
```

- **Pros:** Immediate consistency, Simple error handling 
- **Cons:** Slower response time, Cascading failures

#### Asynchronous (Fire and forget)

```go
func AddToCart() {
    db.Execute(...)  // Wait (critical)
    
    go redis.Del(...)            // Async
    go publishToKafka(...)       // Async
    go updateRecommendations()   // Async
    
    return success  // Return immediately
}
```

- **Pros:** Faster response, Isolated failures 
- **Cons:** Eventual consistency, Complex error handling

#### Decision for Cart: Hybrid approach

- Critical path synchronous (DB write, cache invalidation)
- Non-critical async (analytics, recommendations)

---
### Trade-off 5: Microservices vs Monolith

#### Monolith

- Single application with cart, user, product, order logic
- All in one codebase
- **Pros**: Simple deployment, easy testing, low latency (in-process calls)
- **Cons**: Hard to scale independently, single point of failure

#### Microservices

- Separate services: Cart Service, User Service, Product Service, Order Service
- Each with own database
- **Pros**: Independent scaling, technology flexibility, team autonomy
- **Cons**: Network overhead, complex deployment, distributed debugging

#### Decision for Cart: Start monolith, extract to microservice later

- Shopee scale requires microservices
- But prove product-market fit first with monolith
- Extract Cart Service when it becomes bottleneck

---
## Key Talking Points to Impress Interviewers

### 1. Show E-commerce Domain Knowledge

"In my experience with marketplace systems, cart abandonment is around 70%, so we need efficient cleanup jobs and reminder emails to recover revenue."

### 2. Reference Your Background

"Similar to how I implemented notification systems with SES at my previous role, I'd use async message queues for cart events to avoid blocking the critical path."

"I've worked with gRPC services in the Takumi framework, so I'd expose cart operations as gRPC endpoints for low-latency internal communication."

### 3. Think About Operations

"I'd expose Prometheus metrics for latency, error rate, and cache hit rate, and visualize them in Grafana - similar dashboards helped us reduce P99 latency by 30% in my last project."

### 4. Consider Regional Challenges

"For Shopee's Southeast Asia market, multi-region deployment is critical. Indonesian users shouldn't experience 200ms latency because the database is in Singapore."

### 5. Focus on Reliability

"I'd implement circuit breakers for external service calls, so if the Product Service is slow, cart operations still succeed with cached data or graceful degradation."

### 6. Discuss Real Trade-offs

Don't just list options - explain WHY you'd choose one:

"I'd choose cache-aside over write-through because carts are read-heavy, and the complexity of keeping write-through consistent isn't worth the marginal performance gain."

---
## Final Tips for the Interview

 - **Ask clarifying questions** - Shows you think before coding  
 - **Draw diagrams** - Visual communication is key  
 - **Discuss trade-offs** - No perfect solution, show you understand pros/cons  
 - **Scale incrementally** - Start simple, then add complexity  
 - **Think about failures** - What happens when things break?  
 - **Reference your experience** - "In my previous role, I..."  
 - **Consider operations** - Monitoring, debugging, maintenance  
 - **Think about business impact** - Cart abandonment, conversion rate

---

> [!info] See also: 
> - [[Design a Shopping Cart System -- Complete Interview Template|Complete Interview Answer Template]]
> - [[Design a Shopping Cart System -- Common Follow-ups|Common Follow-ups]]

