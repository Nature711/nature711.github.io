---
title:
draft: true
tags:
date:
---

---

## 1. What the log shows (Lua args)

Every rate-limit EVAL in your log uses:

- **ARGV[1]** = `60.000000` (refillDuration)  
- **ARGV[2]** = `0.600000` (consumeDuration for 1 token)

So the **effective** rate limit in use is the one that produces **refillDuration = 60** and **consumeDuration = 0.6**.

---

## 2. How args are computed (from config)

From `voucher-common/ratelimit/inadaptive_distr_limiter.go` and `voucher-ss-distribution/internal/config/ratelimit.go`:

- **refillDuration** = `Burst * (1 / Limit)` (Limit here = limit **per second**)
- **consumeDuration** = `n * (1 / Limit)` (for one request, n = 1)
- If **WindowSizeSecond** is set, the config turns “limit per window” into “limit per second”:  
  **limit_per_second = Limit / WindowSizeSecond**

So:

- `0.6 = 1 / Limit` ⇒ **Limit = 1/0.6 ≈ 1.667 tokens per second**
- `60 = Burst / Limit` ⇒ **Burst = 60 × (1/0.6) = 100**

So the effective config that produces **(60, 0.6)** is:

- **Limit (per second)** ≈ **1.667** (equivalently: 100 tokens per 60 seconds)
- **Burst** = **100**

So you effectively have **100 tokens burst** and **100 tokens per 60 seconds** refill. That’s why 4 requests in 10s are not limited: you’re using 4 tokens out of 100, and refill is ~1.67/s.

---

## 3. Why you’re not limited (mismatch with “2 per 60s”)

You said you expect: **“2 requests within 60s then rate limit”**.

That would require something like:

- **Limit** = 2 per 60s ⇒ limit per second = **2/60**
- **Burst** = **2**

Then:

- **refillDuration** = 2 × (60/2) = **60**
- **consumeDuration** = 1 × (60/2) = **30**

So for “2 per 60s” you would see Lua args **(60, 30)**, not **(60, 0.6)**.

Your log shows **(60, 0.6)** ⇒ the process is using the “100 per 60s, burst 100” config, not “2 per 60s, burst 2”. So the **config actually applied** is much more permissive than what you have in mind.

---

## 4. Where this config comes from

The Redis key is **`distribute_rate_limit:557533916`**, so the **key_prefix** is **`distribute_rate_limit`**. That’s the “distribute” rate limit (same one used in `batchCanAllow` / `allow`).

In the YAML under this repo:

- **integration_config.yml** has `rate_limit.rate_limit` with **limit: 100, burst: 100** and **no** `key_prefix` or `window_size_second`.
- With no `window_size_second`, **GetLimitAndBurst** uses **limit = 100 (per second)** and **burst = 100**, which would give **refillDuration = 1**, **consumeDuration = 0.01** → **(1, 0.01)**, not **(60, 0.6)**.

So **(60, 0.6)** does **not** come from the plain `limit: 100, burst: 100` in integration_config. It comes from a config where:

- **limit** is expressed over a **60s window** (e.g. limit 100 in 60s ⇒ 100/60 per second), and  
- **burst** is 100.

So the effective config in use is likely one of:

- **limit: 100, burst: 100, window_size_second: 60** (e.g. in another YAML or config source), or  
- Some other source (e.g. uniconfig / config server) that supplies a “100 per 60s, burst 100” (and key_prefix `distribute_rate_limit`).

Until you set the **distribute** rate limit to “2 per 60s, burst 2”, you will not see “2 requests within 60s then rate limit”.

---

## 5. What to change so “2 per 60s” works

You need the config that drives **distribute_rate_limit** to yield **limit_per_second = 2/60** and **burst = 2**.

Example for the **same** rate_limit block that is used for distribute (often the one under `rate_limit.rate_limit` or the one that has `key_prefix: "distribute_rate_limit"`):

- **limit: 2**
- **burst: 2**
- **window_size_second: 60**
- **key_prefix: "distribute_rate_limit"** (if your code uses this key for the distribute limiter)

Then **GetLimitAndBurst** will return limit = 2/60, burst = 2, and the Lua script will get **(60, 30)**. After 2 requests you’ll be at 0 tokens and the next request will be limited until refill.

**Summary:**  
You’re not limited because the **effective** config is “100 per 60s, burst 100” (Lua args 60 and 0.6), not “2 per 60s, burst 2”. Adjust the **distribute** rate limit config to limit 2, burst 2, window 60 (and correct key_prefix) so the script gets **(60, 30)** and you’ll get the “2 requests within 60s then rate limit” behavior.

---

config shape

```
"rate_limit": {
      "key_prefix": "distribute_rate_limit",
      "window_size_second": 60,
      "limit": 1,
      "burst": 1
  },
```

conversion logic (in `ratelimit.go`) 
- limit (limit') becomes a rate (i.e., token per second) -- limit / windowSizeSecond
- burst stays the same

`voucher-common` -- `inadaptive_distr_limiter.go`
- refillDuration = burst / limit' 
- consumeDuration = n / limit'

e.g., given config window size = 60 (s), limit = 1, burst = 1
- refillDuration = 1 / (1/60) = 60 -- time (s) for bucket to go from empty to full
- consumeDuration = 1 / (1/60) = 60 -- time (s) consumed by this request (usually n = 1)

```
local refill_duration = tonumber(ARGV[1]) -- the duration for all tokens to be refilled = (1 / limit) * burst

local consume_duration = tonumber(ARGV[2]) -- the duration for n tokens to be consumed = (1 / limit) * n
```

> That’s equivalent to: burst tokens, refilling at limit tokens per second, and each request costs n token(s).

