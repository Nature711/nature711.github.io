---
title:
draft: false
tags:
description:
date: 2025-11-08
---
## Phase 1: Clarify Requirements (5 minutes)

### Ask These Questions:

**You**: "Before I start designing, I'd like to clarify a few things about the scope and requirements."

#### Functional Requirements:

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

#### Non-Functional Requirements:

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

## Phase 2: Back-of-Envelope Calculations (3 minutes)

Let's calculate to understand the scale:

### Storage Calculation:

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

### QPS Calculation:

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

### Bandwidth:

```
Average response size: 5KB (cart with 5 items)
Peak bandwidth: 50,000 QPS × 5KB = 250 MB/s = 2 Gbps
```

**Conclusion**: Need caching, horizontal scaling, and database read replicas.

---

## Phase 3: High-Level Architecture (5 minutes)

### Start Simple, Then Evolve:

#### Version 1: Baseline Architecture

```
┌──────────┐
│  Client  │ (Web/Mobile App)
└────┬─────┘
     │
     ↓
┌─────────────┐
│   Gateway   │ (API Gateway / Load Balancer)
└──────┬──────┘
       │
       ↓
┌──────────────┐
│ Cart Service │ (Stateless API servers)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Database   │ (MySQL)
└──────────────┘
```

**Explain**: "I'll start with a simple architecture and then discuss how to scale it."

---

#### Version 2: Production-Ready Architecture

```
                    ┌─────────────┐
                    │   Client    │
                    │ (Web/Mobile)│
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │ API Gateway │ (Nginx / AWS ALB)
                    │ Rate Limiter│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │Cart API │       │Cart API │       │Cart API │
   │Server 1 │       │Server 2 │       │Server 3 │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ↓                 ↓                 ↓
   ┌─────────┐      ┌──────────────────┐  ┌──────────┐
   │  Redis  │      │     MySQL        │  │ Message  │
   │ (Cache) │      │                  │  │  Queue   │
   │         │      │  ┌────────────┐  │  │ (Kafka)  │
   │ - Carts │      │  │   Master   │  │  └──────────┘
   │ - Session│     │  │  (Write)   │  │       │
   └─────────┘      │  └──────┬─────┘  │       │
                    │         │         │       ↓
                    │    ┌────┴────┐    │  ┌─────────┐
                    │    │Replicate│    │  │Analytics│
                    │    ↓         ↓    │  │ Service │
                    │  ┌────┐   ┌────┐ │  └─────────┘
                    │  │Read│   │Read│ │
                    │  │Rep1│   │Rep2│ │
                    │  └────┘   └────┘ │
                    └──────────────────┘
```

---

## Phase 4: API Design (3 minutes)

### RESTful API Endpoints:

```http
# Add item to cart
POST /api/v1/cart/items
Request:
{
  "user_id": "user_123",
  "item_id": "prod_456",
  "quantity": 2,
  "price": 29.99,
  "variant": {
    "size": "M",
    "color": "blue"
  }
}
Response:
{
  "success": true,
  "cart": {
    "user_id": "user_123",
    "items": [...],
    "total_items": 3,
    "total_price": 89.97
  }
}

# Get cart
GET /api/v1/cart?user_id=user_123
Response:
{
  "user_id": "user_123",
  "items": [
    {
      "item_id": "prod_456",
      "quantity": 2,
      "price": 29.99,
      "added_at": "2025-11-08T10:30:00Z"
    }
  ],
  "total_items": 2,
  "total_price": 59.98
}

# Update item quantity
PUT /api/v1/cart/items/{item_id}
Request:
{
  "user_id": "user_123",
  "quantity": 5
}

# Remove item
DELETE /api/v1/cart/items/{item_id}?user_id=user_123

# Clear cart
DELETE /api/v1/cart?user_id=user_123

# Checkout (convert cart to order)
POST /api/v1/cart/checkout
Request:
{
  "user_id": "user_123",
  "shipping_address": {...},
  "payment_method": {...}
}
```

---

## Phase 5: Database Design (5 minutes)

### Schema Design:

```sql
-- Cart Items Table (Main table)
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,          -- User identifier
    item_id VARCHAR(64) NOT NULL,          -- Product ID
    quantity INT NOT NULL DEFAULT 1,       -- How many
    price DECIMAL(10,2) NOT NULL,          -- Price at time of adding
    variant_data JSON,                      -- Size, color, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    PRIMARY KEY (user_id, item_id),        -- Composite PK (no duplicates)
    INDEX idx_user_id (user_id),           -- Fast user cart lookup
    INDEX idx_updated_at (updated_at)      -- For cleanup jobs
) ENGINE=InnoDB;

-- Example data:
+----------+---------+----------+-------+-------+------------------+
| user_id  | item_id | quantity | price | variant_data         |
+----------+---------+----------+-------+------------------+
| user_123 | prod_1  | 2        | 29.99 | {"size":"M","color":"blue"}|
| user_123 | prod_5  | 1        | 15.50 | {"size":"L"}         |
| user_456 | prod_3  | 3        | 45.00 | null                 |
+----------+---------+----------+-------+------------------+
```

### Why This Schema?

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

### Guest Cart Handling:

For unauthenticated users, use session ID as `user_id`:

```sql
-- Guest cart
INSERT INTO cart_items (user_id, item_id, quantity, price)
VALUES ('session_abc123', 'prod_1', 1, 29.99);

-- When user logs in, merge guest cart with user cart:
UPDATE cart_items 
SET user_id = 'user_123' 
WHERE user_id = 'session_abc123';
```

---

## Phase 6: Redis Cache Design (5 minutes)

### Cache Strategy: Cache-Aside Pattern

```go
// Read Operation (Get Cart)
func GetCart(userID string) (*Cart, error) {
    cacheKey := "cart:" + userID
    
    // 1. Try Redis first
    cachedData, err := redis.HGetAll(cacheKey)
    if err == nil && len(cachedData) > 0 {
        // Cache HIT - fast path
        return parseCartFromRedis(cachedData), nil
    }
    
    // 2. Cache MISS - query database
    cart, err := db.Query(`
        SELECT item_id, quantity, price, variant_data 
        FROM cart_items 
        WHERE user_id = ?
    `, userID)
    if err != nil {
        return nil, err
    }
    
    // 3. Store in Redis for next time
    for _, item := range cart.Items {
        redis.HSet(cacheKey, item.ItemID, serializeItem(item))
    }
    redis.Expire(cacheKey, 1*time.Hour)  // TTL = 1 hour
    
    return cart, nil
}

// Write Operation (Add Item)
func AddItemToCart(userID, itemID string, quantity int, price float64) error {
    // 1. Write to database first (source of truth)
    err := db.Execute(`
        INSERT INTO cart_items (user_id, item_id, quantity, price)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            quantity = quantity + VALUES(quantity),
            updated_at = CURRENT_TIMESTAMP
    `, userID, itemID, quantity, price)
    if err != nil {
        return err
    }
    
    // 2. Invalidate cache (delete from Redis)
    cacheKey := "cart:" + userID
    redis.Del(cacheKey)
    
    // Next read will reload from DB
    return nil
}
```

### Redis Data Structure:

**Use Redis Hash** (recommended for cart):

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

- ✅ Update individual items without fetching entire cart
- ✅ Efficient memory usage
- ✅ Atomic operations on single items

### Cache Performance:

```
Without Cache:
- All 50K QPS hit MySQL
- MySQL dies at ~1K QPS 💀

With Cache (95% hit rate):
- Redis handles: 47,500 QPS ✅
- MySQL handles: 2,500 QPS (cache misses) + 500 QPS (writes) = 3,000 QPS ✅
- Response time: 20ms → 1ms (20x faster)
```

---

## Phase 7: Scaling Strategy (8 minutes)

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

---

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

**Read/Write Split:**

```go
func GetCart(userID string) {
    // Read from replica
    return readReplica.Query("SELECT * FROM cart_items WHERE user_id = ?", userID)
}

func AddToCart(userID, itemID string) {
    // Write to master
    return master.Execute("INSERT INTO cart_items ...")
}
```

**Handling Replication Lag:**

```go
func AddToCart(userID, itemID string) {
    master.Execute("INSERT INTO cart_items ...")
    redis.Del("cart:" + userID)
    
    // Force next read from master (not replica)
    redis.Set("read_from_master:" + userID, "1", 5*time.Second)
}

func GetCart(userID string) {
    // Check if we should read from master
    if redis.Get("read_from_master:" + userID) != nil {
        return master.Query(...)  // Strong consistency
    }
    return replica.Query(...)  // Eventual consistency OK
}
```

---

### Step 3: Database Sharding (for 100M+ users)

**Shard by `user_id`** using consistent hashing:

```go
func GetShardForUser(userID string) int {
    hash := crc32.ChecksumIEEE([]byte(userID))
    return int(hash % NUM_SHARDS)
}

func GetCart(userID string) {
    shardID := GetShardForUser(userID)
    db := dbConnections[shardID]
    
    return db.Query("SELECT * FROM cart_items WHERE user_id = ?", userID)
}
```

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

- ✅ All cart operations are per-user (no cross-shard queries)
- ✅ Evenly distributes data
- ✅ Simple routing logic

---

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
│ ┌────┐  ┌────┐ │   │ ┌────┐  ┌────┐  │
│ │API │  │API │ │   │ │API │  │API │  │
│ └─┬──┘  └─┬──┘ │   │ └─┬──┘  └─┬──┘  │
│   │       │    │   │   │       │     │
│   ↓       ↓    │   │   ↓       ↓     │
│ ┌──────────┐   │   │ ┌──────────┐    │
│ │Redis + DB│   │   │ │Redis + DB│    │
│ └──────────┘   │   │ └──────────┘    │
└─────────────────┘   └─────────────────┘
```

**Benefits:**

- Singapore users → Singapore region (10ms latency)
- Indonesia users → Indonesia region (10ms latency)
- Fault isolation (one region down ≠ all down)

---

## Phase 8: Handle Edge Cases & Failures (5 minutes)

### Edge Case 1: Concurrent Updates

**Problem:** User clicks "Add to Cart" twice rapidly

```
Time 0: Request 1 arrives → Read quantity = 2
Time 1: Request 2 arrives → Read quantity = 2
Time 2: Request 1 writes quantity = 3
Time 3: Request 2 writes quantity = 3  ❌ Should be 4!
```

**Solution 1: Idempotency Key**

```http
POST /api/v1/cart/items
Headers:
  Idempotency-Key: uuid-12345

# Same key = same result (deduplicated)
```

```go
func AddToCart(userID, itemID string, idempotencyKey string) {
    // Check if we've seen this key before
    if redis.Exists("idempotency:" + idempotencyKey) {
        return getCachedResult(idempotencyKey)  // Return same result
    }
    
    // Process request
    result := processAddToCart(userID, itemID)
    
    // Cache result for 24 hours
    redis.Set("idempotency:" + idempotencyKey, result, 24*time.Hour)
    return result
}
```

**Solution 2: Optimistic Locking**

```sql
-- Add version column
ALTER TABLE cart_items ADD COLUMN version INT DEFAULT 0;

-- Update with version check
UPDATE cart_items 
SET quantity = quantity + 1, 
    version = version + 1
WHERE user_id = ? 
  AND item_id = ? 
  AND version = ?;  -- Only succeed if version matches

-- If 0 rows affected, retry
```

---

### Edge Case 2: Item Out of Stock

**Problem:** User adds item, but inventory runs out before checkout

**Solution: Check inventory at critical points**

```go
func AddToCart(userID, itemID string, quantity int) error {
    // 1. Check inventory service (optional - soft check)
    available := inventoryService.CheckAvailability(itemID, quantity)
    if !available {
        return errors.New("item out of stock")
    }
    
    // 2. Add to cart (may still succeed even if low stock)
    db.Execute("INSERT INTO cart_items ...")
    
    return nil
}

func Checkout(userID string) error {
    // 3. MUST check inventory again (hard check)
    cartItems := getCart(userID)
    
    for _, item := range cartItems {
        available := inventoryService.ReserveInventory(item.ItemID, item.Quantity)
        if !available {
            return errors.New("item " + item.ItemID + " no longer available")
        }
    }
    
    // 4. Create order
    createOrder(cartItems)
    
    // 5. Clear cart
    clearCart(userID)
    
    return nil
}
```

---

### Edge Case 3: Price Changes

**Problem:** Product price increases after user added to cart

**Solution: Store price at add-to-cart time**

```sql
-- Cart stores price when added
INSERT INTO cart_items (user_id, item_id, quantity, price)
VALUES ('user_123', 'prod_1', 2, 29.99);

-- At checkout, use cart price (not current product price)
SELECT item_id, quantity, price FROM cart_items WHERE user_id = 'user_123';
```

**Show price difference in UI:**

```go
func GetCart(userID string) {
    cartItems := db.Query("SELECT * FROM cart_items WHERE user_id = ?", userID)
    
    for i, item := range cartItems {
        currentPrice := productService.GetPrice(item.ItemID)
        if currentPrice != item.Price {
            cartItems[i].PriceChanged = true
            cartItems[i].CurrentPrice = currentPrice
        }
    }
    
    return cartItems
}
```

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

---

### Failure Scenario 2: Redis Cache Goes Down

**Problem:** Redis crashes

**Solution: Graceful degradation**

```go
func GetCart(userID string) {
    // Try cache first
    cart, err := getCartFromRedis(userID)
    if err == nil {
        return cart
    }
    
    // Redis down - fall back to database
    log.Warn("Redis unavailable, reading from DB")
    return getCartFromDatabase(userID)
}
```

**Impact:**

- Response time increases: 1ms → 20ms
- Database load increases: 2,500 QPS → 50,000 QPS
- May need to rate limit if DB can't handle load

**Prevention: Redis Sentinel / Cluster**

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

**Problem:** One API server dies

**Solution: Load balancer health checks**

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │ Health check every 5 seconds
   ┌───┴───┬───────┬───────┐
   ↓       ↓       ↓       ↓
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│API-1│ │API-2│ │API-3│ │API-4│
│  ✅  │ │  ✅  │ │  ❌  │ │  ✅  │
└─────┘ └─────┘ └─────┘ └─────┘
                  ↑
            (unhealthy - remove from pool)
```

**Health check endpoint:**

```go
GET /health
Response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-11-08T10:30:00Z"
}
```

**Load balancer removes unhealthy server:**

- Stops sending new requests
- Existing requests complete
- Traffic distributed to remaining servers

---

## Phase 9: Monitoring & Observability (3 minutes)

### Key Metrics to Track:

**1. Application Metrics (Prometheus)**

```go
// Request latency
httpRequestDuration := prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name: "cart_request_duration_seconds",
        Help: "Cart API request latency",
    },
    []string{"method", "endpoint"},
)

// Request count
httpRequestTotal := prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "cart_requests_total",
        Help: "Total cart API requests",
    },
    []string{"method", "endpoint", "status"},
)

// Cache hit rate
cacheHitRate := prometheus.NewGaugeVec(
    prometheus.GaugeOpts{
        Name: "cart_cache_hit_rate",
        Help: "Redis cache hit rate",
    },
    []string{"operation"},
)
```

**2. Database Metrics**

```
- Query latency (P50, P95, P99)
- Connection pool usage
- Slow query count (queries > 100ms)
- Replication lag (replica behind master by how much)
```

**3. Redis Metrics**

```
- Memory usage
- Evicted keys per second
- Cache hit rate
- Command latency
```

**4. Business Metrics**

```
- Active carts count
- Average cart size (items per cart)
- Cart abandonment rate
- Checkout conversion rate
```

---

### Alerting Rules:

```yaml
# High latency
- alert: HighCartLatency
  expr: cart_request_duration_seconds{quantile="0.99"} > 0.5
  for: 5m
  annotations:
    summary: "Cart API P99 latency > 500ms"

# Low cache hit rate
- alert: LowCacheHitRate
  expr: cart_cache_hit_rate < 0.9
  for: 10m
  annotations:
    summary: "Cache hit rate dropped below 90%"

# Database replication lag
- alert: HighReplicationLag
  expr: mysql_replication_lag_seconds > 10
  for: 5m
  annotations:
    summary: "Replication lag > 10 seconds"

# High error rate
- alert: HighErrorRate
  expr: rate(cart_requests_total{status="5xx"}[5m]) > 0.01
  for: 2m
  annotations:
    summary: "Error rate > 1%"
```

---

### Logging Strategy:

```go
// Structured logging
log.Info("cart_item_added", 
    "user_id", userID,
    "item_id", itemID,
    "quantity", quantity,
    "latency_ms", latency,
    "cache_hit", cacheHit,
)

// Error logging
log.Error("database_query_failed",
    "user_id", userID,
    "query", query,
    "error", err.Error(),
    "retry_count", retryCount,
)
```

**Log levels:**

- DEBUG: Detailed flow (disabled in production)
- INFO: Normal operations (cart added, checkout)
- WARN: Unusual but not error (cache miss, retry)
- ERROR: Failures (DB down, invalid data)

---

### Distributed Tracing:

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

## Phase 10: Security & Rate Limiting (2 minutes)

### Security Measures:

**1. Authentication & Authorization**

```go
func AddToCart(userID, itemID string, authToken string) error {
    // Verify token
    authenticatedUserID, err := validateJWT(authToken)
    if err != nil {
        return errors.New("unauthorized")
    }
    
    // Ensure user can only modify their own cart
    if authenticatedUserID != userID {
        return errors.New("forbidden: cannot modify another user's cart")
    }
    
    // Proceed with add to cart
    return addItemToCart(userID, itemID)
}
```

**2. Input Validation**

```go
func ValidateAddToCartRequest(req AddToCartRequest) error {
    // Validate user_id format
    if !isValidUserID(req.UserID) {
        return errors.New("invalid user_id format")
    }
    
    // Validate quantity
    if req.Quantity < 1 || req.Quantity > 999 {
        return errors.New("quantity must be between 1 and 999")
    }
    
    // Validate price (prevent negative prices)
    if req.Price < 0 || req.Price > 1000000 {
        return errors.New("invalid price")
    }
    
    // Sanitize item_id to prevent SQL injection
    if containsSQLInjection(req.ItemID) {
        return errors.New("invalid item_id")
    }
    
    return nil
}
```

**3. Rate Limiting**

Prevent abuse and protect system from overload:

```go
// Token bucket algorithm
type RateLimiter struct {
    redis *redis.Client
}

func (r *RateLimiter) AllowRequest(userID string) bool {
    key := "rate_limit:" + userID
    
    // Allow 100 requests per minute per user
    count, err := r.redis.Incr(key).Result()
    if err != nil {
        return true // Fail open (allow request if Redis unavailable)
    }
    
    if count == 1 {
        // First request - set expiration
        r.redis.Expire(key, 1*time.Minute)
    }
    
    return count <= 100
}

// Usage
func AddToCartHandler(w http.ResponseWriter, req *http.Request) {
    userID := getUserID(req)
    
    if !rateLimiter.AllowRequest(userID) {
        http.Error(w, "Rate limit exceeded. Try again later.", 429)
        return
    }
    
    // Process request
    addToCart(userID, ...)
}
```

**Rate limit tiers:**

```
Guest users: 10 requests/minute
Registered users: 100 requests/minute
Premium users: 1000 requests/minute
Internal services: No limit
```

**4. SQL Injection Prevention**

Always use prepared statements:

```go
// BAD - Vulnerable to SQL injection
query := "SELECT * FROM cart_items WHERE user_id = '" + userID + "'"
db.Query(query)

// GOOD - Safe with parameterized query
db.Query("SELECT * FROM cart_items WHERE user_id = ?", userID)
```

**5. API Security Headers**

```go
func SecurityMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Prevent clickjacking
        w.Header().Set("X-Frame-Options", "DENY")
        
        // Prevent XSS
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        
        // HTTPS only
        w.Header().Set("Strict-Transport-Security", "max-age=31536000")
        
        next.ServeHTTP(w, r)
    })
}
```

---

## Phase 11: Advanced Features (Bonus) (3 minutes)

### Feature 1: Cart Recommendations

**"Users who added this item also added..."**

```go
func GetCartRecommendations(userID string) []Product {
    cart := getCart(userID)
    itemIDs := extractItemIDs(cart)
    
    // Query recommendation service
    recommendations := recommendationService.GetRelatedProducts(itemIDs)
    
    // Filter out items already in cart
    return filterExistingItems(recommendations, itemIDs)
}
```

**Architecture addition:**

```
Cart Service
     ↓
Message Queue (Kafka)
     ↓
Analytics Service → ML Model → Recommendation DB
```

When item added to cart:

1. Publish event to Kafka
2. Analytics service processes for recommendations
3. ML model generates "frequently bought together" data

---

### Feature 2: Cart Sharing

**Share cart with friends/family**

```sql
-- Shared carts table
CREATE TABLE shared_carts (
    share_id VARCHAR(64) PRIMARY KEY,
    owner_user_id VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_owner (owner_user_id)
);
```

```go
func ShareCart(userID string) (string, error) {
    // Generate unique share link
    shareID := generateUUID()
    
    // Store share metadata
    db.Execute(`
        INSERT INTO shared_carts (share_id, owner_user_id, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `, shareID, userID)
    
    // Return share URL
    return "https://shopee.com/cart/shared/" + shareID, nil
}

func ViewSharedCart(shareID string) (*Cart, error) {
    // Get owner
    owner := db.QueryRow(`
        SELECT owner_user_id FROM shared_carts 
        WHERE share_id = ? AND expires_at > NOW()
    `, shareID)
    
    // Return owner's cart (read-only)
    return getCart(owner.UserID)
}
```

---

### Feature 3: Save for Later

**Move items from cart to "saved" list**

```sql
ALTER TABLE cart_items ADD COLUMN status ENUM('active', 'saved') DEFAULT 'active';
```

```go
func SaveForLater(userID, itemID string) error {
    return db.Execute(`
        UPDATE cart_items 
        SET status = 'saved' 
        WHERE user_id = ? AND item_id = ?
    `, userID, itemID)
}

func GetCart(userID string) (*Cart, error) {
    // Only get active items
    return db.Query(`
        SELECT * FROM cart_items 
        WHERE user_id = ? AND status = 'active'
    `, userID)
}

func GetSavedItems(userID string) ([]Item, error) {
    return db.Query(`
        SELECT * FROM cart_items 
        WHERE user_id = ? AND status = 'saved'
    `, userID)
}
```

---

### Feature 4: Cart Expiration & Cleanup

**Clean up abandoned carts to save storage**

```go
// Cron job runs daily
func CleanupAbandonedCarts() {
    // Delete carts not updated in 30 days
    result := db.Execute(`
        DELETE FROM cart_items 
        WHERE updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `)
    
    log.Info("cleaned_up_carts", "rows_deleted", result.RowsAffected)
}

// Before deleting, send reminder email
func SendCartReminderEmails() {
    // Find carts abandoned for 3 days
    abandonedCarts := db.Query(`
        SELECT user_id, COUNT(*) as item_count
        FROM cart_items
        WHERE updated_at BETWEEN 
            DATE_SUB(NOW(), INTERVAL 4 DAY) AND 
            DATE_SUB(NOW(), INTERVAL 3 DAY)
        GROUP BY user_id
    `)
    
    for _, cart := range abandonedCarts {
        emailService.Send(cart.UserID, "You have items in your cart!")
    }
}
```

---

### Feature 5: Cart Analytics Events

**Track user behavior for business intelligence**

```go
// Publish events to analytics pipeline
func AddToCart(userID, itemID string, quantity int) error {
    // Add to cart in database
    err := db.Execute(...)
    
    // Publish event (async, non-blocking)
    go publishEvent(Event{
        Type: "cart_item_added",
        UserID: userID,
        ItemID: itemID,
        Quantity: quantity,
        Timestamp: time.Now(),
        Metadata: map[string]interface{}{
            "source": "web",
            "device": "mobile",
        },
    })
    
    return err
}
```

**Analytics questions answered:**

- Which products are frequently added to cart but not purchased? (low conversion)
- What's the average time between add-to-cart and checkout?
- Which items are frequently removed from cart?
- Peak shopping hours by region

---

## Phase 12: Trade-offs Discussion (3 minutes)

### Trade-off 1: Consistency vs Availability

**Strong Consistency:**

```
User adds item → Write to master → Wait for replica sync → Return success
Pros: Always see latest data
Cons: Slower writes (50ms+), Lower availability
```

**Eventual Consistency:**

```
User adds item → Write to master → Return success immediately
Replicas sync in background (100ms lag)
Pros: Faster writes (10ms), Higher availability
Cons: May briefly see stale data
```

**Decision for Cart:** Eventual consistency is acceptable

- Users won't notice 100ms lag
- Cart is not mission-critical like payment
- Can force strong consistency at checkout

---

### Trade-off 2: Normalization vs Denormalization

**Normalized (Store product_id only):**

```sql
cart_items: user_id, product_id, quantity
products: product_id, name, price, image_url

-- Get cart requires JOIN
SELECT c.*, p.name, p.price 
FROM cart_items c 
JOIN products p ON c.product_id = p.product_id
```

**Pros:** Single source of truth, current prices **Cons:** Slower queries (JOIN), Higher DB load

**Denormalized (Store product details in cart):**

```sql
cart_items: user_id, product_id, quantity, price, name, image_url
```

**Pros:** Faster queries (no JOIN), Lower DB load **Cons:** Stale data if product changes, More storage

**Decision for Cart:** Denormalize price only

- Store price when added (user expectation)
- Fetch name/image from Product Service (can change)
- Best of both worlds

---

### Trade-off 3: Cache Invalidation Strategy

**Option A: Delete cache on write (Cache-Aside)**

```go
AddToCart() {
    db.Execute(...)
    redis.Del("cart:" + userID)  // Delete cache
    // Next read reloads from DB
}
```

**Pros:** Simple, Safe (DB is truth) **Cons:** First read after write is slow (cache miss)

**Option B: Update cache on write (Write-Through)**

```go
AddToCart() {
    db.Execute(...)
    cart := getCartFromDB(userID)
    redis.Set("cart:" + userID, cart)  // Update cache
}
```

**Pros:** No cache miss after write **Cons:** Extra DB read, Can get out of sync

**Decision for Cart:** Cache-Aside (Option A)

- Simpler implementation
- Safer (avoids cache inconsistency bugs)
- Cache miss penalty acceptable (20ms vs 1ms)

---

### Trade-off 4: Synchronous vs Asynchronous Processing

**Synchronous (Wait for all operations):**

```go
func AddToCart() {
    db.Execute(...)           // Wait
    redis.Del(...)            // Wait
    inventoryService.Check()  // Wait
    return success
}
```

**Pros:** Immediate consistency, Simple error handling **Cons:** Slower response time, Cascading failures

**Asynchronous (Fire and forget):**

```go
func AddToCart() {
    db.Execute(...)  // Wait (critical)
    
    go redis.Del(...)            // Async
    go publishToKafka(...)       // Async
    go updateRecommendations()   // Async
    
    return success  // Return immediately
}
```

**Pros:** Faster response, Isolated failures **Cons:** Eventual consistency, Complex error handling

**Decision for Cart:** Hybrid approach

- Critical path synchronous (DB write, cache invalidation)
- Non-critical async (analytics, recommendations)

---

### Trade-off 5: Microservices vs Monolith

**Monolith:**

```
Single application:
- Cart logic
- User logic
- Product logic
- Order logic
All in one codebase
```

**Pros:** Simple deployment, Easy testing, Low latency (in-process calls) **Cons:** Hard to scale independently, Single point of failure

**Microservices:**

```
Separate services:
- Cart Service
- User Service
- Product Service
- Order Service
Each with own DB
```

**Pros:** Independent scaling, Technology flexibility, Team autonomy **Cons:** Network overhead, Complex deployment, Distributed debugging

**Decision for Cart:** Start monolith, extract to microservice later

- Shopee scale requires microservices
- But prove product-market fit first with monolith
- Extract Cart Service when it becomes bottleneck

---

## Complete Interview Answer Template

Here's how to structure your entire answer in a 45-minute interview:

---

### **Minutes 0-5: Clarify Requirements**

**You**: "Let me clarify the requirements before designing the system."

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

### **Minutes 5-8: Capacity Planning**

**You**: "Let me do some back-of-envelope calculations."

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

### **Minutes 8-15: High-Level Design**

**You**: "Here's my high-level architecture."

Draw the diagram:

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

### **Minutes 15-20: Database Design**

**You**: "For the data model, I'll use this schema:"

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

Explain:

- "Composite PK prevents duplicates"
- "Index on user_id for fast lookups"
- "Denormalize price for consistency"
- "JSON for flexible variant data"

---

### **Minutes 20-25: Caching Strategy**

**You**: "I'll use Redis with cache-aside pattern."

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

"Using Redis hash for efficient item-level operations."

---

### **Minutes 25-35: Scaling Strategy**

**You**: "Here's how I'll scale to handle 10M users:"

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

Draw scaling diagram showing progression.

---

### **Minutes 35-40: Handle Edge Cases**

**You**: "Let me address some failure scenarios:"

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

### **Minutes 40-43: Monitoring & Observability**

**You**: "For production monitoring, I'd track:"

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

### **Minutes 43-45: Trade-offs & Wrap-up**

**You**: "Let me summarize the key trade-offs:"

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

"This design should handle 10M users with 50K QPS, <200ms latency, and 99.9% uptime."

---

## Key Talking Points to Impress Shopee Interviewers

### 1. **Show E-commerce Domain Knowledge**

"In my experience with marketplace systems, cart abandonment is around 70%, so we need efficient cleanup jobs and reminder emails to recover revenue."

### 2. **Reference Your Background**

"Similar to how I implemented notification systems with SES at my previous role, I'd use async message queues for cart events to avoid blocking the critical path."

"I've worked with gRPC services in the Takumi framework, so I'd expose cart operations as gRPC endpoints for low-latency internal communication."

### 3. **Think About Operations**

"I'd expose Prometheus metrics for latency, error rate, and cache hit rate, and visualize them in Grafana - similar dashboards helped us reduce P99 latency by 30% in my last project."

### 4. **Consider Regional Challenges**

"For Shopee's Southeast Asia market, multi-region deployment is critical. Indonesian users shouldn't experience 200ms latency because the database is in Singapore."

### 5. **Focus on Reliability**

"I'd implement circuit breakers for external service calls, so if the Product Service is slow, cart operations still succeed with cached data or graceful degradation."

### 6. **Discuss Real Trade-offs**

Don't just list options - explain WHY you'd choose one:

"I'd choose cache-aside over write-through because carts are read-heavy, and the complexity of keeping write-through consistent isn't worth the marginal performance gain."

---

## Common Follow-up Questions & Answers

### Q: "How would you handle a flash sale with 100x normal traffic?"

**A**: "For flash sales, I'd implement several strategies:

1. **Pre-warm cache**: Load popular items into Redis before sale starts
2. **Rate limiting**: Aggressive rate limits to protect backend (1000 req/min → 100 req/min)
3. **Queue system**: Add items to queue, process async instead of real-time
4. **Auto-scaling**: Scale API servers from 10 → 50 based on CPU metrics
5. **Read-only mode**: Temporarily disable non-critical writes
6. **CDN for static content**: Serve product images/details from CDN

Most importantly, **communicate with users** - show queue position, estimated wait time."

---

### Q: "What if two users try to add the last item in stock simultaneously?"

**A**: "This is a classic race condition. Solutions:

1. **Reserve inventory first** (before adding to cart):

```go
func AddToCart(userID, itemID string) error {
    // Try to reserve inventory
    reserved := inventoryService.TryReserve(itemID, 1)
    if !reserved {
        return errors.New("out of stock")
    }
    
    // Add to cart with reservation
    db.Execute("INSERT INTO cart_items ...")
    
    // Release reservation after 10 minutes if not checked out
    scheduleReservationExpiry(itemID, 10*time.Minute)
}
```

2. **Optimistic locking in inventory service**:

```sql
UPDATE inventory 
SET quantity = quantity - 1 
WHERE item_id = ? AND quantity >= 1;
-- Only one succeeds
```

3. **Accept over-selling, handle at checkout**:

- Let both add to cart
- At checkout, first to pay wins
- Second gets 'out of stock' error with voucher compensation

For Shopee, I'd use option 3 - better UX, handle edge case at checkout."

---

### Q: "How do you prevent bots from adding items to cart and not buying?"

**A**: "Bot protection strategy:

1. **Rate limiting per IP**: Block IPs making >1000 requests/hour
    
2. **CAPTCHA**: Show CAPTCHA after suspicious behavior
    
3. **Behavioral analysis**:
    
    - Bots add items in milliseconds
    - Real users browse for seconds
    - Flag accounts with bot-like patterns
4. **Temporary cart holds**:
    

```go
// Release cart items after 30 minutes of inactivity
func CleanupInactiveCarts() {
    db.Execute(`
        DELETE FROM cart_items 
        WHERE updated_at < NOW() - INTERVAL 30 MINUTE
    `)
}
```

5. **Fingerprinting**: Track device fingerprint, not just IP
6. **Require login**: For high-demand items, require authentication"

---

### Q: "Your cache is showing 60% hit rate instead of 95%. How do you debug?"

**A**: "Systematic debugging approach:

1. **Check cache TTL**:

```bash
redis-cli TTL cart:user_123
# If returning -1 (no expiry) or very short, that's the issue
```

2. **Check cache eviction**:

```bash
redis-cli INFO stats | grep evicted_keys
# High evictions = not enough memory
```

3. **Check access patterns**:

```sql
SELECT user_id, COUNT(*) as access_count 
FROM access_logs 
GROUP BY user_id 
ORDER BY access_count DESC;
# Are we caching the right users? (80/20 rule)
```

4. **Check invalidation logic**:

- Are we invalidating too aggressively?
- Every write = cache delete = next read is miss

5. **Check cache warming**:

- For popular users, pre-load cache
- Morning traffic spike = cache cold start

6. **Monitor cache key distribution**:

```bash
redis-cli --bigkeys
# Are some keys huge, causing memory issues?
```

Solution depends on root cause:

- Low memory → Add more Redis nodes
- Poor eviction policy → Switch to LRU
- Wrong caching strategy → Rethink what to cache"

---

### Q: "How would you migrate 10M carts from old schema to new schema with zero downtime?"

**A**: "Zero-downtime migration strategy:

**Phase 1: Dual writes (Week 1-2)**

```go
func AddToCart(userID, itemID string) {
    // Write to old schema
    oldDB.Execute("INSERT INTO cart_items ...")
    
    // Also write to new schema
    newDB.Execute("INSERT INTO cart_items_v2 ...")
}
```

**Phase 2: Backfill (Week 2-3)**

```go
// Background job migrates old data
func MigrateOldCarts() {
    oldCarts := oldDB.Query("SELECT * FROM cart_items WHERE migrated = 0 LIMIT 1000")
    
    for _, cart := range oldCarts {
        newCart := transformToNewSchema(cart)
        newDB.Execute("INSERT INTO cart_items_v2 ...", newCart)
        
        oldDB.Execute("UPDATE cart_items SET migrated = 1 WHERE id = ?", cart.ID)
    }
}
```

**Phase 3: Dual reads (Week 3-4)**

```go
func GetCart(userID string) {
    // Try new schema first
    cart := newDB.Query("SELECT * FROM cart_items_v2 WHERE user_id = ?", userID)
    if cart != nil {
        return cart
    }
    
    // Fallback to old schema
    return oldDB.Query("SELECT * FROM cart_items WHERE user_id = ?", userID)
}
```

**Phase 4: Switch (Week 4)**

- All reads/writes go to new schema
- Monitor for 1 week

**Phase 5: Cleanup (Week 5)**

- Drop old schema after verifying everything works

Key principles:

- Always maintain backward compatibility
- Feature flags to rollback instantly
- Monitor error rates at each phase
- Have rollback plan ready"

---

## Final Tips for the Interview

### DO:

✅ **Ask clarifying questions** - Shows you think before coding  
✅ **Draw diagrams** - Visual communication is key  
✅ **Discuss trade-offs** - No perfect solution, show you understand pros/cons  
✅ **Scale incrementally** - Start simple, then add complexity  
✅ **Think about failures** - What happens when things break?  
✅ **Reference your experience** - "In my previous role, I..."  
✅ **Consider operations** - Monitoring, debugging, maintenance  
✅ **Think about business impact** - Cart abandonment, conversion rate

### DON'T:

❌ Jump straight to solution without clarifying  
❌ Over-engineer for scale you don't need  
❌ Ignore failures and edge cases  
❌ Forget about monitoring and operations  
❌ Get defensive when challenged - embrace feedback  
❌ Use buzzwords without understanding (blockchain, AI, etc.)  
❌ Say "I don't know" without attempting to reason through it
