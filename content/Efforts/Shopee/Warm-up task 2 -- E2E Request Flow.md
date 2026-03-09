---
title:
draft: true
tags:
date: 2026-02-24
---
## ss_distribution batch_distribute_voucher

### single key rate limit

#### E2E Flow

![[ss-distribution-single-key-rl-flow|800]]

#### Redis operations

> [!info]- Redis flow
> ## 1. **Redis EVAL (rate_limit-cmder) – “Can I allow this user?”**
> 
> **Log:**  
> `cache_operation":"EVAL"`, `db.instance":"rate_limit-cmder"`, key `distribute_rate_limit:557533916`, args `60.0`, `0.6`, response `-59400000`.
> 
> **What it is:**  
> Distributed rate limit check for **batch distribute**: “is user 557533916 within their distribute rate limit?”
> 
> **Where it’s used:**  
> - Step **checkRateLimitAvailability** runs first in the batch distribute flow (`service.go` → `batchCanAllow`).  
> - It calls `s.rateLimiter.CanAllow(ctx, strconv.FormatInt(userID, 10))` so the key is `{key_prefix}:{userID}` → `distribute_rate_limit:557533916` (`service_steps.go` 625–637, 634–637).  
> - Implementation is voucher-common’s **token-bucket** limiter: `InadaptiveDistrLimiter.CanAllowN` runs a Lua script that **does not consume** a token; it only checks if a token would be available (`inadaptive_can_allow_n.go`).
> 
> **Why EVAL:**  
> - The script uses Redis `TIME` and the key’s last-refill time to compute “would one more request be allowed?” and returns a **wait time in microseconds**.  
> - Negative return = “allowed now” (no wait). Your `-59400000` means “allowed” (often interpreted as “you could have allowed ~59.4s ago”).  
> - Args come from config: `refillDuration = burst * (1/limit)`, `consumeDuration = n * (1/limit)`. So `60.0` and `0.6` match your rate_limit config (e.g. limit/burst from config) for a single “can I allow 1?” check.
> 
> **Why:**  
> So a user can’t exceed the configured “distribute” rate (e.g. N vouchers per minute). The check runs before any voucher is actually distributed.
> 
> ---
> 
> ## 2. **Redis SET (dlock-cmder) – “Lock this user+voucher”**
> 
> **Log:**  
> `cache_operation":"SET"`, `db.instance":"dlock-cmder"`,  
> `req":"set vss:voucher_distribute:557533916_1363390962614272 lockValue ex 5 nx"`, `resp":"true"`.
> 
> **What it is:**  
> Acquiring a **per-(user, voucher) lock** so only one distribute flow can run for that (userID, voucherID) at a time.
> 
> **Where it’s used:**  
> - Inside **distributeOneBasic** (the per-item distribute), the code does **lock → check duplicate → allow (consume rate limit) → create user voucher → unlock** (`service_steps.go` 129–133, 661–666).  
> - Key is built as `vss:voucher_distribute:{userID}_{voucherID}` via `dlock.GetLockKeyByUserIDAndVoucherID` and `util.GetCacheKey("voucher_distribute", userID, voucherID)` (`dlock/key.go`, `util/common.go` with prefix `vss`).  
> - `TryLock` is implemented as Redis **SET key value EX 5 NX**: hold the lock for 5 seconds; only succeed if the key doesn’t exist.
> 
> **Why:**  
> Avoids duplicate or conflicting distributes for the same user+voucher (e.g. double-claim) and serializes concurrent requests for the same (user, voucher).
> 
> ---
> 
> ## 3. **Redis DEL (dlock-cmder) – “Release the lock”**
> 
> **Log:**  
> `cache_operation":"DEL"`, `db.instance":"dlock-cmder"`,  
> `req":"del vss:voucher_distribute:557533916_1363390962614272"`, `resp":"1"`.
> 
> **What it is:**  
> Releasing the same lock after the distribute step for that (user, voucher) is done.
> 
> **Where it’s used:**  
> - `defer s.unlock(ctx, userID, voucherID)` in `distributeOneBasic` (`service_steps.go` 133), which calls `dLockService.Unlock(ctx, key)` → Redis **DEL** of `vss:voucher_distribute:557533916_1363390962614272` (`service_steps.go` 673–678).
> 
> **Why:**  
> So the next request for the same (user, voucher) can acquire the lock again (or another instance can), and the lock doesn’t stick around after the flow finishes.
> 
> ---
> 
> ## Order in the flow (for one batch_distribute_voucher request)
> 
> 1. **EVAL (rate_limit-cmder)** – Check rate limit for user `557533916` (key `distribute_rate_limit:557533916`). Allowed → continue.  
> 2. … other steps (load vouchers, load codes, check distributable, etc.) …  
> 3. For this (user, voucher): **SET … NX** (dlock-cmder) – Take the distribute lock for `557533916` and voucher `1363390962614272`.  
> 4. Check user voucher duplicate, consume rate limit (another EVAL if you use `Allow`), create user voucher.  
> 5. **DEL** (dlock-cmder) – Release the lock.
> 
> So in your log snippet, the **rate limiting logic** is the **EVAL** on `rate_limit-cmder` with key `distribute_rate_limit:557533916` (and the later consume, if any, would be another EVAL). The **SET/DEL** on `dlock-cmder` are for **mutex/lock** so only one distribute runs per (user, voucher) at a time, and they are not the rate limit itself but work together with it in the same flow.

---
### multi-key rate limit v2

#### E2E Flow

![[ss-distribution-multi-key-rl-v2-flow|800]]

---
### resilience interceptor 

![[ss-distribution-resilience-flow|800]]