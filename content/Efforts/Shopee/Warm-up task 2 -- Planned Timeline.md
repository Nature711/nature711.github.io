---
title:
draft: true
tags:
date:
---
# Cursor Plan 

## Day 1: Deep Dive & Setup (Foundation)

### Morning: Understanding Phase

1. **Read the codebase** (2-3 hours)
    
    - Clone all 3 repos: voucher-common, voucher-uservoucher, voucher-ss-distribution
    - Find where rate limiters/circuit breakers are implemented in voucher-common
    - Search for keywords: `rate_limit`, `circuit_breaker`, `resilience_interceptor`
    - Understand how traffic is currently identified (look for shadow traffic detection logic)
2. **Map existing configs** (1-2 hours)im staritn
    
    - Document all current rate limiter configs in both services
    - Create a spreadsheet: Config Name | Service | Current Values | Needs Shadow Version?
    - Reference sections 4.1.1 and 4.1.2 in the doc

### Afternoon: Design Phase

3. **Write technical design doc** (2 hours)
    
    - How shadow traffic will be detected/flagged
    - Config naming convention (shadow. vs shadow_)
    - List all configs to duplicate
    - Pseudo-code for routing logic
4. **Get design reviewed** (1 hour)
    
    - Share with yu.jin or team lead
    - Clarify any questions from the document

---

## Day 2: voucher-common Implementation (Core Logic)

### Morning: Core Changes

1. **Implement shadow traffic detection** (2-3 hours)
    
    - Modify interceptor to check if request has shadow flag
    - Add logic to prefix config keys with "shadow." when shadow traffic detected
    - Example: If shadow traffic → look for "shadow.ads_voucher_rate_limit" instead of "ads_voucher_rate_limit"
2. **Add tests** (1 hour)
    
    - Unit tests for shadow traffic detection
    - Test that correct config is loaded for shadow vs normal traffic

### Afternoon: Integration & Review

3. **Local testing** (2 hours)
    
    - Run voucher-common tests
    - Mock shadow traffic and verify routing works
4. **Code review prep** (1 hour)
    
    - Self-review code
    - Add comments/documentation
    - Create PR for voucher-common

---

## Day 3: voucher-uservoucher Implementation

### Morning: Config Setup

1. **Duplicate configs** (2 hours)
    
    - Reference section 4.1.2
    - Create shadow versions of:
        - `user_voucher_kv_config`
        - `default_rate_limit`
        - `resilience`
    - Add shadow. prefix to config keys
2. **Update service code** (1 hour)
    
    - Ensure service uses updated voucher-common
    - Verify shadow traffic flows through correctly

### Afternoon: Testing

3. **Local testing** (2 hours)
    
    - Test with shadow traffic flag enabled
    - Verify shadow configs are being used
    - Test fallback to normal config when shadow flag absent
4. **Create PR** (1 hour)
    
    - Document changes
    - Link to voucher-common PR

---

## Day 4: voucher-ss-distribution Implementation

### Morning: Config Setup

1. **Duplicate configs** (2-3 hours)
    - Reference section 4.1.1
    - Create shadow versions of:
        - `resilience_interceptor` (circuit breakers)
        - `multi_key_rate_limit_v2`
        - `rate_limit`
    - Follow same pattern as Day 3

### Afternoon: Testing & Integration

2. **Local testing** (2 hours)
    
    - Test shadow traffic routing
    - Test circuit breaker isolation
    - Verify rate limits work independently
3. **Integration test** (1 hour)
    
    - Test end-to-end flow: distribution → user voucher
    - Verify shadow traffic stays isolated
4. **Create PR** (1 hour)
    

---

## Day 5: Buffer Day (Integration, Review, Fixes)

### Morning: PR Reviews & Fixes

1. **Address review comments** (2-3 hours)
    - Fix any issues from code reviews
    - Update tests if needed
    - Re-test locally

### Afternoon: Documentation & Handoff

2. **Write deployment plan** (1 hour)
    
    - Config rollout sequence
    - Rollback plan if issues arise
    - Monitoring metrics to watch
3. **Update documentation** (1 hour)
    
    - Add comments about shadow config structure
    - Document how to add new shadow configs in future
4. **Demo to team** (1 hour)
    
    - Show shadow traffic routing working
    - Explain changes made
    - Update Jira tickets to "Ready for QA"

---

## Key Success Criteria:

✅ Shadow traffic uses separate configs  
✅ Normal traffic unaffected  
✅ All tests passing  
✅ PRs reviewed and merged  
✅ Documentation complete

## Pro Tips:

- **Start with voucher-common** - it's the foundation
- **Copy-paste pattern** - once you do one config, others are similar
- **Test early, test often** - don't wait until Day 5
- **Ask questions early** - Day 1 is for clarifications
- **Keep it simple** - you're mostly duplicating configs, not creating new logic

**Communication checkpoints:**

- End of Day 1: Share design doc
- End of Day 2: Share voucher-common PR
- End of Day 3: Update on progress
- End of Day 4: All PRs ready for review

---
# ChatGPT Plan

## Guiding principle

Do it **inside-out**:

1. define **one source of truth** for “is shadow?”
    
2. implement **config selection** (shadow → shadow config; else normal; fallback)
    
3. roll it out service-by-service
    
4. prove it with **tests + a tiny validation run**

---

## Day 1 — Understand + set up the core primitives (lowest risk)

**Goal:** You can answer: _where shadow flag comes from, and how code decides which config key to use._

1. **Trace “shadow flag” source**
    
    - Find how a request is identified as shadow (req_meta field / baggage / header / client name).
        
    - Write down: _signal name + where parsed + where stored (ctx?)_
        
2. **In `voucher-common`: implement/confirm**
    
    - `IsShadow(ctx) bool`
        
    - `WithShadow(ctx, bool) context.Context`
        
    - Helper: `ShadowKey(cmd string) string { return "shadow." + cmd }`
        
3. **Write tiny unit tests (pure functions)**
    
    - `IsShadow` default false
        
    - `WithShadow` round-trip works
        
    - `ShadowKey("a.b") == "shadow.a.b"`
        

**Deliverable:** one small MR-ready change in `voucher-common` (or at least a local branch).

---

## Day 2 — Finish `voucher-common` selectors (reusable logic)

**Goal:** Extract the “choose shadow config with fallback” logic once.

1. Add selector helpers:
    
    - `PickResilienceConfig(res map[string]Cfg, cmd string, isShadow bool) (Cfg, usedKey string)`
        
    - `PickRateLimitRule(cfg DefaultRateLimit, kind Soft/Hard, isShadow bool) Rule`
        
2. Unit tests (table-driven):
    
    - shadow key exists → uses shadow
        
    - shadow key missing → falls back to normal
        
    - normal request → uses normal
        
3. Keep interfaces minimal so services can adopt easily.
    

**Deliverable:** `voucher-common` MR with selectors + tests.

---

## Day 3 — Apply to `voucher-uservoucher` (one service end-to-end)

**Goal:** `voucher-uservoucher` uses shadow limiter + shadow resilience when shadow traffic.

1. **Config struct changes**
    
    - Extend `default_rate_limit` struct to include:
        
        - `ShadowSoftRateLimit`
            
        - `ShadowHardRateLimit`
            
    - Ensure config parsing works (no panic when absent)
        
2. **Wire `IsShadow(ctx)`**
    
    - If already set in interceptor → just consume it
        
    - If not → set it once in interceptor (but prefer doing in common)
        
3. **Replace selection points**
    
    - Rate limiter: call your `voucher-common` selector
        
    - Resilience: call your `voucher-common` selector for `resilience` map
        
4. **Service-level tests**
    
    - If selection is pure → unit tests are enough
        
    - Add 1 minimal integration-ish test only if cheap (optional)
        

**Deliverable:** `voucher-uservoucher` MR + config schema update.

---

## Day 4 — Apply to `voucher-ss-distribution` (mirror the pattern)

**Goal:** same behavior in distribution service, but different config keys.

1. Implement resilience selection:
    
    - `shadow.<cmd>` lookup first, fallback normal
        
2. Implement rate limit selection:
    
    - `rate_limit`: split into `default_rate_limit` vs `shadow_rate_limit` style (as per doc)
        
    - `multi_key_rate_limit_v2`: add `shadow_` prefixed keys (as per doc)
        
3. Unit tests:
    
    - selection + fallback
        
    - don’t overdo—focus on correctness
        

**Deliverable:** `voucher-ss-distribution` MR.

---

## Day 5 — Validation + cleanup + buffer

**Goal:** prove it works + polish for review.

1. **Config center / local config verification**
    
    - Ensure shadow configs exist (even minimal) in the expected keys.
        
    - Confirm fallback works when shadow configs absent.
        
2. **Minimal runtime validation**
    
    - Send one “normal” request and one “shadow” request.
        
    - Check logs/metrics show which config key was used:
        
        - e.g. log `used_config_key=shadow.xxx` vs `xxx`
            
    - If logging doesn’t exist, add a **single debug log** guarded by sampling.
        
3. **MR hygiene**
    
    - clear description: what changed, how to test, rollback plan
        
    - screenshot/snippet of config examples
        

**Deliverable:** all three MRs ready/merged, plus quick verification note.
    