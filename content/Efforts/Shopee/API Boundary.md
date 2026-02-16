---
title:
draft: false
tags:
date: 2026-02-13
---
## What

An **API boundary** is the **line between two components** where they interact through a **contract**.

- Component A can only “see” Component B through the **API surface** (method signatures, request/response schema, error semantics, timeouts, SLAs, etc.)
- Everything behind that line is an **implementation detail** that should not leak across the boundary
    
### Example

- HTTP endpoint ↔ your service
- SPEX command ↔ your handler
- Domain service ↔ repo layer
- Repo ↔ downstream RPC/DB/cache
- Service ↔ config system

 > [!tip] Useful way to spot boundaries: where **responsibilities** & **failure modes** change

---
## Why it matters

1. **Correctness**  
    If you leak assumptions across boundaries (“downstream always returns all-or-nothing”, “batch size unlimited”), edge cases become incidents—like your cancel flow failing when `len(identifiers) > 50`.
    
2. **Evolvability**  
    If upstream code depends on downstream quirks, any change forces coordinated releases and turns small changes into big ones.
    
3. **Reliability & debuggability**  
    Boundaries define who owns retries, timeouts, fallback, circuit breakers, and logging context. Shadow traffic isolation is _exactly_ a boundary decision: normal lane vs shadow lane uses different limiter/breaker configs.
    
4. **Team scaling**  
    Clear boundaries allow teams to work independently with predictable contracts.
    

## The key idea: “Who owns what?”

Boundary design is mostly about **responsibility assignment**:

### At a boundary, someone must own:

- Input validation (what’s allowed / rejected)
    
- Output guarantees (what is returned, when missing, ordering, determinism)
    
- Error taxonomy (what errors exist and what they mean)
    
- Timeouts & retries (who retries? how many? idempotency?)
    
- Observability (what gets logged/metric’d and with what tags)
    
- Backward compatibility (how changes roll out)
    

If you don’t decide, production decides for you (usually badly).

## How to apply it (a concrete checklist)

When you touch any boundary, ask these 8 questions:

1. **Contract:** What do I promise upstream? (response + error meanings)
    
2. **Assumptions:** What am I assuming about downstream? Are they valid?
    
3. **Failure modes:** Timeout? partial success? limit exceeded? rate limited?
    
4. **Ownership:** Who handles retries/fallback—this layer or caller?
    
5. **Idempotency:** If retried, will it double-apply? What’s the idempotency key?
    
6. **Coupling:** Am I leaking downstream details upward (error codes, shapes, limits)?
    
7. **Observability:** If this fails at 3am, can we tell where (upstream vs downstream)?
    
8. **Change safety:** If downstream changes, will upstream break?
    

## Tie it to your work (so it sticks)

### Example A: Entry Task Go — HTTP server ↔ TCP server boundary

You were forced to separate concerns: HTTP only forwards; TCP owns auth + DB. That is boundary enforcement for security/performance and to avoid “web directly connects to MySQL”.

### Example B: TCC warm-up — Repo ↔ downstream API boundary

Downstream API had a **hard limit (50)**. Your repo’s job is to:

- adapt to downstream constraints (batching),
    
- while preserving a stable contract to upstream (GetMulti still “just works”).  
    That’s classic boundary work: **shield upstream from downstream weirdness**.
    

### Example C: Shadow isolation — “traffic lane” boundary

Your “isShadow” signal creates a _logical boundary_ across the whole chain: once marked shadow, it should use `shadow.*` limiter/breaker configs, with fallback.  
This is boundary design across services: same API, different policy lane.

## Related concepts (you’ll see them everywhere)

- **Abstraction leakage:** downstream quirks bleeding into upstream logic
    
- **Contract vs implementation:** only contract is stable; implementation can change
    
- **Error semantics:** not just “return error”, but _what does it mean and what should caller do?_
    
- **Backward compatibility:** versioning, optional fields, additive change, deprecation
    
- **Bulkheads/isolation:** shadow vs normal lanes, circuit breakers, rate limiters
    
- **Layering:** handler/service/domain/repo—each boundary should have a crisp role
    
---

In a system:

- **Upstream** = the component that sends requests _to you_
- **Downstream** = the component that _you call_
    

Think in terms of **data flow direction**.

If data flows:

```
Client → API → Service → DB
```

From the Service’s perspective:

- API = upstream
    
- DB = downstream
    

It’s relative to where you’re standing.

---

# 2️⃣ In Your TCC Example

In your cancellation fix:

```
HTTP API
   ↓
TCC Cancel Service
   ↓
UseService
   ↓
Repo
   ↓
External Voucher API
```

If you're modifying the **Repo layer**:

- Upstream = UseService (calls you)
    
- Downstream = External Voucher API (you call it)
    

So:

- If downstream API changes behavior → your repo must adapt
    
- If you change repo error behavior → upstream services may break
    

That’s why error semantics matter.

---

# 3️⃣ Why This Concept Is Important

Because production systems are chains.

When something fails, you must ask:

- Is the problem upstream?
    
- Is the problem downstream?
    
- Or is it inside this component?
    

Example:

If cancellation fails:

- Did upstream send malformed identifiers?
    
- Did downstream API reject batch > 50?
    
- Or did your batching logic break?
    

Without upstream/downstream thinking, debugging becomes chaotic.

---

# 4️⃣ Another Mental Model (Water Flow)

Imagine a river.

Water flows from mountains → through cities → into ocean.

- Upstream = where water comes from
    
- Downstream = where water flows next
    

If pollution appears downstream, the cause might be upstream.

Same with systems.

---

# 5️⃣ In API Design Terms

Upstream cares about:

- Your input contract
    
- Your response format
    
- Your error codes
    

Downstream cares about:

- How you call them
    
- Timeout settings
    
- Retry logic
    
- Batch size
    
- Idempotency

---

# 6️⃣ The Real Engineering Upgrade

When they say:

> Need improvement in system/component boundary & API design

What they really want is this mindset:

When writing code, always ask:

- What does my upstream expect?
    
- What does my downstream guarantee?
    
- Am I leaking downstream behavior upward?
    
- Am I masking downstream errors incorrectly?
    

That’s production maturity.

---

If I give you a scenario:

> Downstream API sometimes partially succeeds — returns 30 successes and 20 failures.

From a repo layer perspective, what are your options in propagating this to upstream?

Think about it for a second.