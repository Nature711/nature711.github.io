---
title:
draft: true
tags:
date: 2026-02-04
---
## Background

> [!info] Goal
> We want to stress test the voucher system at production-like scale without breaking real users or polluting real data.

### Concept 1: FCST (Full Chain Stress Testing)

- Simulate **real user flows** (claim voucher → dispatch → use → cancel)
- At very **high QPS**
- Across **multiple services** (`ss_distribution`, `uservoucher`, `taskv2`, `ss.business`)
- **Before** major events (campaigns, sales, infra changes)

#### Problem with the current FCST 

##### 1. Stress test traffic hurts real traffic

- Same **rate limiters**, **circuit breakers**, Redis / DB path
- Implication: when stress testing ramps up -- 
	- Circuit breakers trip
	- Rate limiters block
	- Real user impacted

##### 2. Fake / unrealistic test data 

- Shadow vouchers behave differently from prod vouchers
- Hard to compare metrics: “is prod slower or just test weird?”
    
### Concept 2: Shadow traffic

Shadow traffic:
- Looks like real traffic
- Uses real code paths
    
- BUT:
    - Uses **shadow configs**
    - Uses **shadow rate limits**
    - Uses **shadow circuit breakers**
    - Uses **shadow data**

> “Prod-like traffic in a parallel universe”

So the whole project goal is:

**Split the system into two logical lanes:**
- Normal lane (real users)
- Shadow lane (FCST traffic)

#### How they split the lanes (high level)

Use **one signal** -- _“Is this shadow traffic?”_
    
Then propagate it everywhere:
- HTTP → SPEX → Kafka → downstream services

Once traffic is marked as _shadow_:
- Use `shadow.*` configs
- Use shadow rate limiters
- Use shadow circuit breakers
- Use shadow task configs
- Emit shadow metrics
    
---

### Where _your_ task fits in

From **Task Split**:

> **Add shadow config for rate limiter and resilience**  
> Services:
> 
> - `voucher-common`
>     
> - `voucher-uservoucher`
>     
> - `voucher-ss-distribution`  
>     **PIC**: Hu Tianran  
>     **Effort**: 1 day  
>     
>     Warm-up task 2 + Medium
>     

This is **purely about isolation**, not about new APIs, Kafka, or FCST flows.

---

## 3️⃣ What problem _you specifically_ are solving

### Without your work

- Shadow traffic hits:
    
    - the **same rate limiters**
        
    - the **same circuit breakers**
        
- If shadow traffic spikes:
    
    - circuit breaker opens
        
    - limiter throttles
        
    - 👉 normal traffic gets degraded
        

### With your work

- Shadow traffic:
    
    - uses **shadow configs**
        
    - trips **shadow breakers**
        
    - consumes **shadow quotas**
        
- Normal traffic is **untouched**
    

So you’re essentially adding **parallel safety rails**.

---

## 4️⃣ Your task, broken down cleanly

### 🎯 Your responsibility in one sentence

> **Teach the system to read `shadow.*` configs and use them when traffic is shadow.**

---

### Service 1: `voucher-ss-distribution`

You’ll touch **config only + interceptor logic**.

#### What changes conceptually

For each of these:

- `rate_limit`
    
- `multi_key_rate_limit_v2`
    
- `resilience_interceptor`
    

We now support **two versions**:

- normal
    
- shadow
    

#### Example mental model

Before:

`voucher.code.batch_get_code_using_cache`

After:

`voucher.code.batch_get_code_using_cache shadow.voucher.code.batch_get_code_using_cache`

Same logic, **different config keyspace**.

#### Flow you enable

1. Interceptor detects: _this is shadow traffic_
    
2. It looks for:
    
    - `shadow.xxx` config
        
3. If found → use it
    
4. If not found → fallback to normal config
    

👉 This fallback is important and explicitly mentioned.

---

### Service 2: `voucher-uservoucher`

Here it’s similar, but the naming is slightly different.

#### Rate limiting

You’ll add:

- `shadow_soft_rate_limit`
    
- `shadow_hard_rate_limit`
    

Under the same `default_rate_limit` config key.

#### Resilience

Same idea:

- normal key
    
- `shadow.` prefixed key
    

#### Flow

1. Interceptor / voucher-common layer detects shadow traffic
    
2. Reads shadow limiter + breaker
    
3. Applies them **instead of** normal ones
    

---

### Service 3: `voucher-common`

This is the **glue layer**.

Your responsibility here is typically:

- Ensure the “is shadow traffic” signal is:
    
    - detected
        
    - propagated
        
    - accessible to limiter / resilience logic
        

You’re not inventing logic — just making sure:

- shadow flag → correct config path


## TLDR

> [!info] Anchor
> I’m *isolating shadow traffic* from normal traffic by introducing *shadow-specific* rate limiter and circuit breaker configs in `voucher-uservoucher` and `voucher-ss-distribution`.
> When traffic is marked as shadow, the system reads `shadow.*` configs instead of normal ones, ensuring FCST stress testing doesn’t impact live users.

### Conceptual change 

What's being changed: 2 **“lookup decisions”**

#### Before (simplified)

```
cfg := rateLimitConfig.SoftRateLimit cb  := resilience[cmdName]
```
#### After

```
if isShadow(ctx) {
    cfg = rateLimitConfig.ShadowSoftRateLimit
    cb  = resilience["shadow."+cmdName]
    if cfg == nil { cfg = rateLimitConfig.SoftRateLimit }
    if cb  == nil { cb  = resilience[cmdName] }
} else {
    cfg = rateLimitConfig.SoftRateLimit
    cb  = resilience[cmdName]
}
```

