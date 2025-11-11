---
title:
draft: false
tags:
date: 2025-11-09
---
## Step 1: Clarify & Gather Context

> Before diving into debugging, I'd want to understand the scope and context:"

**Questions to ask:**

- "How high is the latency? What's normal vs current? (e.g., 100ms → 2s?)"
- "When did this start? Sudden spike or gradual increase?"
- "Is it affecting all users or specific segments? (region, device, user type)"
- "Is it all endpoints or specific ones?"
- "Any recent deployments or infrastructure changes?"
- "What's the traffic pattern? Normal load or spike?"

---
## Step 2: Check Monitoring & Metrics

> "I'd start by looking at our observability stack to identify WHERE the latency is coming from:"

### Application Metrics

- Request latency percentiles (p50, p95, p99) - which percentile is affected?
- Error rates - are errors correlated with high latency?
- Request throughput - has QPS increased?
- Response size - are we returning more data?

### Infrastructure Metrics

- CPU usage - are we CPU bound?
- Memory usage - memory leak? GC pressure?
- Network I/O - bandwidth saturation?
- Disk I/O - slow reads/writes?
- Connection pool exhaustion - are we out of DB connections?

### Dependency Latency

- Database query times - slow queries?
- External API calls - third-party service degradation?
- Cache hit rates - is cache working?
- Message queue lag - backlog building up?


> **Tool mentions:** "I'd use tools like Grafana/Prometheus for metrics, Jaeger/Zipkin for distributed tracing, and application logs."

---
### Step 3: Analyze Distributed Traces

> "Next, I'd look at distributed tracing to see the request flow:"

Example trace breakdown:
```
Total latency: 2000ms
├─ API Gateway: 5ms
├─ Auth Service: 10ms
├─ Main Service: 50ms
│  ├─ Business Logic: 5ms
│  ├─ Database Query: 1800ms  ← BOTTLENECK FOUND
│  └─ Cache Check: 5ms
└─ Response Serialization: 135ms
```

> "This tells me exactly where time is spent. If database queries are taking 1800ms when they should take 50ms, that's my smoking gun."

---
### Step 4: Investigate the Root Cause

### Scenario A: Database is Slow

**Investigation steps:**

1. **Check slow query logs**
    - Which queries are slow?
    - Look at EXPLAIN plans - missing indexes? Full table scans?
    
2. **Database metrics**
    - Connection pool utilization - running out of connections?
    - Lock contention - queries waiting on locks?
    - Replication lag - read replicas behind?
    
3. **Data growth**
    - Did table size explode? (e.g., 1M rows → 100M rows)
    - Are indexes still effective?

> [!quote] Example answer
> 
> I'd run `EXPLAIN` on the slow queries. 
> Let's say I find a query doing a full table scan on an orders table that grew from 1M to 50M rows. The query is:
> `SELECT * FROM orders WHERE user_id = ? AND status = 'pending' 
> ORDER BY created_at DESC LIMIT 20`
> I'd check if there's a composite index on (user_id, status, created_at). 
> If not, that's likely the issue.

### Scenario B: High CPU/Memory

**Investigation steps:**

1. **Profile the application**
    - Use pprof (Go), jProfiler (Java), etc.
    - Identify hot paths in code
    
2. **Check for resource leaks**
    - Memory leak - growing heap, GC thrashing
    - Goroutine/thread leak - too many concurrent operations
    
3. **Look for inefficient code**
    - N+1 query problem
    - Inefficient algorithms
    - Serialization/deserialization bottlenecks

> [!quote] Example answer
> If CPU is at 100%, I'd take a CPU profile. Let's say I find 80% of CPU time is spent in JSON serialization. I'd investigate:
> - Are we serializing huge objects?
> - Can we use more efficient serialization (protobuf)?
> - Can we paginate the response?

### Scenario C: External Dependency Issues

**Investigation steps:**

1. **Check dependency health**
    - Is the third-party API slow or down?
    - Circuit breaker triggered?
    
2. **Network issues**
    - DNS resolution slow?
    - Network latency increased?

3. **Rate limiting**
    - Are we being rate limited?

> [!quote] Example answer
> If I see our payment gateway calls taking 5 seconds when they normally take 
> 200ms, I'd:
> 1. Check their status page
> 2. Implement/verify timeouts (don't wait forever)
> 3. Check circuit breaker status
> 4. Consider fallback strategies

### Scenario D: Traffic Spike

**Investigation steps:**

1. **Analyze traffic patterns**
    - Marketing campaign? Flash sale? Bot attack?
    - Which endpoints are hot?
    
2. **Resource saturation**
    - Need to scale horizontally?
    - Auto-scaling working?

> [!quote] Example answer
> If traffic increased 10x due to a flash sale, I'd check:
> - Is auto-scaling keeping up?
> - Are we hitting rate limits?
> - Is the database the bottleneck? (can scale app servers but DB is fixed)
> - Do we need to enable caching or queue requests?

---
## Step 5: Immediate Mitigation

> "While investigating root cause, I'd implement quick mitigations:"

- **Scale up/out** - Add more instances if resource-bound
- **Enable caching** - Cache expensive queries/API calls
- **Rate limiting** - Protect the system from overload
- **Circuit breakers** - Fail fast on slow dependencies
- **Rollback** - If recent deployment caused it
- **Query optimization** - Add missing indexes
- **Increase timeouts** - If safe to do so (with caution)

---
## Step 6: Long-term Fixes

> "After stabilizing, I'd implement permanent solutions:"

### Database optimization
    
- Add proper indexes
- Partition large tables
- Implement read replicas
- Cache frequently accessed data
    
### Code optimization
    
- Fix N+1 queries
- Batch API calls
- Use async processing for heavy tasks
- Implement pagination

### Architecture changes
    
- Move heavy operations to background jobs
- Implement CQRS (separate read/write paths)
- Use CDN for static content
- Implement proper caching layers (Redis, CDN)

---
## Complete Answer

> [!info] Example
> **First, I'd gather context**: When did this start? Is it all users or specific segments? Any recent changes? What's the actual latency - are we talking 2 seconds instead of 200ms?
> 
> **Second, I'd check our monitoring**. I'd look at application metrics like p95/p99 latency, error rates, and throughput. Then infrastructure metrics - CPU, memory, disk I/O. And finally dependency latency - database, cache, external APIs.
> 
> **Third, I'd use distributed tracing** to see exactly where time is spent in the request flow. For example, if I see a request taking 2 seconds and the trace shows 1.8 seconds in database queries, that's my bottleneck.
> 
> **Fourth, I'd drill down**. Let's say database is the issue. I'd check slow query logs, run EXPLAIN on suspicious queries, and check for missing indexes. Maybe I find a query doing a full table scan on a table that grew from 1 million to 50 million rows because we're missing a composite index.
> 
> **Fifth, immediate mitigation**. While investigating, I'd add the missing index, scale up database resources if needed, or enable query caching to reduce load.
> 
> **Finally, long-term fixes**. I'd review our indexing strategy, implement proper monitoring alerts for slow queries, and maybe consider sharding the table if it's growing too large.
> 
> Throughout this, I'd document findings and communicate with the team, especially if it's affecting users."

---
## The Underlying Logic: What They're Evaluating

- **Systematic approach** - not random guessing  
- **Understanding of full stack** - app, database, network, infrastructure  
- **Use of tools** - monitoring, tracing, profiling  
- **Prioritization** - quick wins vs long-term fixes  
- **Communication** - can you explain your process clearly?  
- **Real-world experience** - have you actually done this before?

---

> [!info]- Further Exploration
> 
> If they probe deeper, be ready to discuss:
> 
> ### Database Debugging
> 
> ```
> - EXPLAIN plan analysis
> - Index selection (B-tree vs Hash, composite indexes)
> - Lock contention (row-level vs table-level)
> - Connection pool tuning
> - Query plan cache invalidation
> ```
> 
> ### Memory Issues
> 
> ```
> - Heap dump analysis
> - GC logs (Stop-the-world pauses?)
> - Memory leak detection
> - Object retention analysis
> ```
> 
> ### Network Issues
> 
> ```
> - TCP connection exhaustion
> - DNS resolution caching
> - Keep-alive vs short-lived connections
> - Network latency vs application latency
> ```
> 