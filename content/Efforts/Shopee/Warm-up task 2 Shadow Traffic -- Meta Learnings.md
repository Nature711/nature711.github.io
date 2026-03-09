---
title:
draft: true
tags:
date: 2026-03-03
---
## A) Architecture questions

1. Where exactly is resilience_interceptor placed?
    
    - Client side?
        
    - Server side?
        
    - Around Spex client?

> client-side, around spex client
> registered as a client interceptor; wraps outbound spex calls 
        
2. What metrics does circuit breaker record?
    
    - Timeout?
        
    - Error?
        
    - Both?
        
    - Sliding window or rolling counter?

> based on config: timeout + error
> need to confirm further in shopee/common repo
        
3. Is shadow isolation done at:
    
    - Key prefix level?
        
    - Interceptor registry level?
        
    - Both?

> both -- key-prefix level; Normal and shadow use different configs and thus different KeyPrefix when shadow is configured; different limiter instances are initialized; redis key are separated by prefix
> interceptor -- different effective cmd retrieves different interceptor instances (with its own internal counters)
        
4. What is the fallback behavior when shadow config missing?
    
    - Share limiter?
        
    - Separate limiter?
        
    - Intentionally isolated?

> separate instance, but same config value
---

## B) System-level questions

5. What is the global QPS target of this service?

> need SLO/SLA doc, capacity plan
    
6. What happens if Redis is down?

> ? 
    
7. What happens if circuit breaker is misconfigured?
    
8. How do we observe rate limit metrics in Grafana?
    
9. Are circuit states exported as metrics?
    

---

## C) Design philosophy questions

10. Why token bucket instead of sliding window?

> burst allowance?
    
11. Why Lua instead of multiple commands?

> atomicity
    
12. Why circuit breaker instead of simple retry?

> When a downstream is failing, retries keep sending traffic and can make the failure worse. A circuit breaker stops sending traffic (open), then probes (half-open) and only restores (closed) when the downstream is healthy. So it’s about failing fast and not amplifying load on a failing dependency. Exact policy (when it opens, when it half-opens, timeouts) is in common/resilience.

---

# 5️⃣ What would “mastery” look like?

If you fully master this domain, you can answer:

- How rate limiter behaves under burst traffic

> token refill, burst size, redis key TTL
    
- How circuit transitions: Closed → Open → Half-Open

> conditions & timeouts
    
- How shadow separation prevents state bleed
    
- What Redis keys represent
    
- How to debug live production issue
    
---

# 6️⃣ Bigger reflection (important)

You just touched:

- Distributed algorithms
    
- Reliability engineering
    
- State isolation
    
- Load protection
    
- Traffic shaping
    

This is not just “fix a ticket”.

This is infrastructure thinking.

---

# 7️⃣ If you want to elevate one more level

You can ask yourself:

> “What failure scenario would still break us?”

Examples:

- Redis cluster down
    
- Redis latency spikes
    
- Circuit breaker misfires
    
- Shadow accidentally using same prefix
    
- Partial config rollout
    

That’s SRE thinking.

---

# 8️⃣ If I were mentoring you, I’d ask:

1. Can you draw the full flow:
    
    HTTP → Spex → Interceptor → Circuit → Client → Redis

> API handler → Spex client → resilience interceptor (Wrap) → GetProtector(effectiveName) → Protect (circuit/timeout in common/resilience) → invoke → downstream; rate limit path is separate (e.g. distribution pipeline → rateLimiter.Allow / multi-key limiter → Redis EVAL).
    
2. Can you explain to a new teammate why shadow isolation matters?

> So shadow traffic (e.g. experiments, canary) doesn’t share rate-limit or circuit state with production; no state bleed and safe to test.
    
3. Can you explain the difference between rate limiting and circuit breaking?

> Rate limiting = cap rate (and/or burst) per key. Circuit breaking = stop sending to a failing dependency for a period, then probe; about protecting the dependency and failing fast.

---
How do we decide rate limiter / interceptor config values?
- Based on estimated QPS of the system? 

What's the system before vs. after? 
- how is shadow traffic currently flowing? 
- how much impact is it really for production traffic?

Why token bucket algo for rate limiter? 

What's the bigger context? 
- under part of a bigger initiative?



