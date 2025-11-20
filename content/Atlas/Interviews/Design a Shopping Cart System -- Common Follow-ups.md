---
title:
draft: false
tags:
date: 2025-11-19
---
## Common Follow-ups

### Q: "How would you handle a flash sale with 100x normal traffic?"

**Answer**: "For flash sales, I'd implement several strategies:

**Pre-warm cache**

- Load popular items into Redis before sale starts
- Reduce cache misses during traffic spike

**Aggressive rate limiting**

- Normal: 1000 req/min per user
- Flash sale: 100 req/min per user
- Protects backend from overload

**Queue system**

- Add items to queue for async processing
- Process requests in order instead of real-time
- User sees queue position and estimated wait time

**Auto-scaling**

- Scale API servers from 10 to 50 based on CPU metrics
- Use Kubernetes HPA or AWS Auto Scaling

**Read-only mode**

- Temporarily disable non-critical writes
- Focus capacity on cart operations

**CDN for static content**

- Serve product images and details from CDN
- Reduces load on application servers

Most importantly, communicate with users - show queue position, estimated wait time, set expectations."

---
### Q: "What if two users try to add the last item in stock simultaneously?"

**Answer**: "This is a classic race condition. Solutions:

**Option 1: Reserve inventory first (before adding to cart)**

- Try to reserve inventory via inventory service
- If reservation fails, return out of stock error
- If succeeds, add to cart with reservation
- Release reservation after 10 minutes if not checked out
- Prevents overselling at cart level

**Option 2: Optimistic locking in inventory service**

- UPDATE inventory SET quantity = quantity - 1 WHERE item_id = ? AND quantity >= 1
- Only one update succeeds due to transaction isolation
- Second request gets 0 rows affected
- Return out of stock to second user

**Option 3: Accept over-selling, handle at checkout**

- Let both users add to cart
- Don't reserve inventory at cart level
- At checkout, first to pay wins
- Second gets out of stock error with voucher compensation

For Shopee, I'd use option 3 - better user experience, handle edge case at checkout with compensation for disappointed users."

---
### Q: "How do you prevent bots from adding items to cart and not buying?"

**Answer**: "Bot protection strategy:

**Rate limiting per IP**

- Block IPs making >1000 requests/hour
- Use progressive rate limiting (slow down, then block)

**CAPTCHA**

- Show CAPTCHA after suspicious behavior detected
- Don't show on every request (bad UX)

**Behavioral analysis**

- Bots add items in milliseconds
- Real users browse for seconds
- Track time between actions
- Flag accounts with bot-like patterns

**Temporary cart holds**

- Release cart items after 30 minutes of inactivity
- Run cleanup job to delete old cart items
- Prevents inventory hoarding

**Device fingerprinting**

- Track device fingerprint, not just IP
- Bots often use same device signature
- Block by fingerprint, not just IP

**Require login for high-demand items**

- For limited releases, require authentication
- Harder for bots to create accounts at scale"

---
### Q: "Your cache is showing 60% hit rate instead of 95%. How do you debug?"

**Answer**: "Systematic debugging approach:

**Check cache TTL**

- Run: redis-cli TTL cart:user_123
- If returning -1 (no expiry) or very short TTL, that's the issue
- Fix: Adjust TTL to appropriate value

**Check cache eviction**

- Run: redis-cli INFO stats | grep evicted_keys
- High evictions means not enough memory
- Fix: Add more Redis nodes or increase memory

**Check access patterns**

- Query: SELECT user_id, COUNT(*) FROM access_logs GROUP BY user_id
- Are we caching the right users? (80/20 rule)
- Fix: Cache only active users, not all users

**Check invalidation logic**

- Are we invalidating too aggressively?
- Every write = cache delete = next read is miss
- Fix: Reduce unnecessary invalidations

**Check cache warming**

- For popular users, pre-load cache
- Morning traffic spike = cache cold start
- Fix: Warm cache before peak hours

**Monitor cache key distribution**

- Run: redis-cli --bigkeys
- Are some keys huge, causing memory issues?
- Fix: Split large keys into smaller ones

Solution depends on root cause:

- Low memory: Add more Redis nodes
- Poor eviction policy: Switch to LRU
- Wrong caching strategy: Rethink what to cache"

---
### Q: "How would you migrate 10M carts from old schema to new schema with zero downtime?"

**Answer**: "Zero-downtime migration strategy:

**Phase 1: Dual writes (Week 1-2)**

- Write to both old and new schema simultaneously
- Old schema remains source of truth
- New schema receives copies for testing
- Monitor for errors in new schema writes

**Phase 2: Backfill (Week 2-3)**

- Background job migrates old data in batches
- Process 1000 carts at a time to avoid overload
- Transform old schema format to new schema
- Mark migrated records in old schema
- Continue until all old data migrated

**Phase 3: Dual reads (Week 3-4)**

- Try reading from new schema first
- If data found, return it
- If not found, fallback to old schema
- Verify data consistency between schemas
- Monitor error rates closely

**Phase 4: Switch (Week 4)**

- All reads and writes go to new schema only
- Old schema kept as backup
- Monitor for 1 week for any issues
- Have rollback plan ready

**Phase 5: Cleanup (Week 5)**

- After verifying everything works
- Drop old schema tables
- Remove dual-write code
- Update documentation

Key principles:

- Always maintain backward compatibility
- Feature flags to enable instant rollback
- Monitor error rates at each phase
- Have rollback plan ready at every step
- Test migration on staging environment first"