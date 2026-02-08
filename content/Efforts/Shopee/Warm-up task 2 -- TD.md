---
title:
draft: true
tags:
date: 2026-02-05
---
## Big picture

> Goal: Run FCST with prod-like traffic and high QPS, without affecting real users. 

Currently, stress & real traffic share the same rate limiters & circuit breakers (resilience).
So when FCST ramps up, real traffic can be affected as well. 

Idea: Treat traffic as 2 lanes: 
- Normal Lane -- real users --> existing configs & limiters
- Shadow Lane -- FCST traffic --> separate "shadow" config & limiters

One signal drives everything: “*Is this shadow traffic?*”
That flag is propagated (e.g. HTTP → SPEX → Kafka → downstream). 
When shadow == true:
- Use shadow.* configs
- Use shadow rate limiters and shadow circuit breakers

---
## Current state

### 2.1 voucher-common (shared glue)

|Component|Where|Current behavior|
|---|---|---|
|Resilience interceptor|voucher-common/interceptor/resilience/resilience.go|Single config key (default resilience_interceptor). Binds a map[string]resilience.Config keyed by command name (e.g. voucher.code.batch_get_code_using_cache). In Wrap(), it does resilience.GetProtector(cmd) and protects the call. No shadow: one config namespace, one set of protectors.|
|Config key|options.go|configKey (default InterceptorName). No shadow. variant.|
|Context / client|ctxmeta/util.go, spi_context.go|Only client name in context (GetContextWithClient, GetClientNameFromContext). No IsShadow(ctx) or WithShadow(ctx) yet.|
|Req meta|reqmeta/spi_req_meta.go|Validates CallerSource and RequestId. No shadow field in the current IRequestMeta in voucher-common.|

So today:
- Resilience: one config key, one set of per-cmd protectors; no shadow lookup.
- No standard “is shadow?” in context; no helpers like IsShadow(ctx), WithShadow(ctx), or ShadowKey(cmd).

### 2.2 voucher-uservoucher

|Component|Where|Current behavior|
|---|---|---|
|Config|internal/config/config.go, rate_limit_config.go|DefaultRateLimit (uniconfig key default_rate_limit) with SoftRateLimit and HardRateLimit only. No shadow fields.|
|Rate limiters|internal/resource/user_voucher_ratelimit.go, resource.go|One pair of limiters: soft and hard, both built from cfg.DefaultRateLimit at init. No shadow pair.|
|Usage|internal/domain/uservoucher/v2/create_service.go|Picks soft vs hard by skipSoftRateLimit; calls rateLimiter.Allow(ctx, key). No ctx-based shadow vs normal.|
|Resilience|internal/util/spex/spex.go|Uses voucher-common resilience with config key "resilience" on all relevant SPEX clients. Single namespace.|

So: one default_rate_limit shape, one set of limiters, no shadow path.

### 2.3 voucher-ss-distribution

|Component|Where|Current behavior|
|---|---|---|
|Resilience|mod/api/module.go|resilience.RegisterClientInterceptor() with default config key (so resilience_interceptor). No shadow.|
|Rate limit|internal/config/config.go|RateLimit (uniconfig rate_limit), RateLimitRules, MultiKeyRateLimit, MultiKeyRateLimitV2.|
|Single-cmd limiter|internal/service/ratelimit/rate_limiter.go|Injects rate_limit Redis; in Init() builds one ratelimit.NewInadaptiveDistrLimiter from config.GetConfig().RateLimit. No shadow.|
|Multi-key limiter v2|internal/service/ratelimit/multi_key_limiter_v2.go, internal/config/multi_key_rate_limit_v2.go|Map of limiters per key prefix (e.g. ads_voucher_rate_limit, smart_voucher_rate_limit, …). All from one MultiKeyRateLimitV2 config. No shadow.|

So: one config namespace for resilience and for both rate limit mechanisms; no shadow branch.

### Code reference

| What                                          | Where (file: lines)                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Resilience: load config by command name       | voucher-common/interceptor/resilience/resilience.go 64–71, 118–121                                                          |
| Resilience: use protector by cmd only         | voucher-common/interceptor/resilience/resilience.go 119–121                                                                 |
| uservoucher resilience config key             | voucher-uservoucher/internal/util/spex/spex.go 20, 24                                                                       |
| ss-distribution resilience registration       | voucher-ss-distribution/mod/api/module.go 20                                                                                |
| uservoucher rate limit config struct          | voucher-uservoucher/internal/config/rate_limit_config.go 1–12                                                               |
| uservoucher: create limiters at init          | voucher-uservoucher/internal/resource/user_voucher_ratelimit.go 9–22                                                        |
| uservoucher: init called from                 | voucher-uservoucher/internal/resource/resource.go 91, 93                                                                    |
| uservoucher: use rate limiter in domain       | voucher-uservoucher/internal/domain/uservoucher/create_service.go 106–116                                                   |
| uservoucher: wire limiters into CreateService | voucher-uservoucher/internal/handler/api/create_user_voucher.go 46–48                                                       |
| ss-distribution single limiter config + Init  | voucher-ss-distribution/internal/service/ratelimit/rate_limiter.go 41–46; config internal/config/ratelimit.go, config.go 34 |
| ss-distribution: use single limiter           | voucher-ss-distribution/internal/service/distribute/service_steps.go 180–186, 625–640                                       |
| ss-distribution multi-key init                | voucher-ss-distribution/internal/service/ratelimit/multi_key_limiter_v2.go 28–86, 121–134                                   |
| ss-distribution multi-key use                 | voucher-ss-distribution/internal/service/distribute/service_multi_key_rate_limit_steps.go 198–224, 225–242                  |
| Existing shadow check                         | voucher-uservoucher/internal/util/kvorm/utils.go 36–44                                                                      |

---
## How is Shadow Traffic Detected
ø
### Observation

- shadow info is carried in the **platform tracing span context** (package: `git.garena.com/shopee/platform/tracing`)

```go
// voucher-uservoucher/internal/util/kvorm/utils.go
import (... "git.garena.com/shopee/platform/tracing")

func isShadowContext(ctx context.Context) bool {
	spanContext := tracing.GetSpanContext(ctx)
	if spanContext != nil {
		if tracing.IsSpanContextShadow(spanContext) {
			return true
		}
	}
	return false
}
```

- used in `voucher-uservoucher – kvorm` -- to distinguish what key prefix & expiration to use, for normal vs. shadow traffic

```go
// voucher-uservoucher/internal/util/kvorm/base.go
func (db *baseImpl) keyPrefix(ctx context.Context) string {
	c := db.config(ctx)
	if !c.Shadow.Disable && isShadowContext(ctx) {
		return c.Shadow.Prefix + c.Prefix
	}
	return c.Prefix
}
// similar pattern for checking key expiration
```

### To clarify

- existing check for "is shadow?" in `kvorm` -- to distinguish kv/cache (which key space + TTL to use, for normal vs. shadow traffic)
- assume that we add the "is shadow?" check in `voucher-common` and propagates this in `ctx` along the way 
- then in `uservoucher`, should we remove the existing "is shadow?" check, and have `kvorm` call `voucher-common`'s "is shadow?" check?
- this way there's only 1 central "is shadow" check -- used by all places which need traffic distinguishing

---
## Config Mapping

| Service         | Config key / scope      | Normal key / cmd                        | Shadow key / cmd                               | Fallback             |
| --------------- | ----------------------- | --------------------------------------- | ---------------------------------------------- | -------------------- |
| ss_distribution | resilience_interceptor  | voucher.code.batch_get_code_using_cache | shadow.voucher.code.batch_get_code_using_cache | Use normal config    |
| ss_distribution | multi_key_rate_limit_v2 | e.g. ads_voucher_rate_limit             | shadow_ads_voucher_rate_limit                  | Use normal config    |
| ss_distribution | rate_limit              | default_rate_limit                      | shadow_rate_limit                              | Use normal config    |
| uservoucher     | default_rate_limit      | soft/hard_rate_limit                    | shadow_soft_rate_limit, shadow_hard_rate_limit | Use normal soft/hard |
| uservoucher     | resilience              | e.g. account.core.get_account           | shadow.account.core.get_account                | Use normal config    |

---
## What to do (goal)

Adding shadow config and selection for rate limiters and resilience, so that:
- When the request is shadow → use shadow configs (and thus shadow limiters/breakers).
- When not shadow (or shadow config missing) → use existing behavior (fallback to normal).

---
## How to do (concrete steps)

### 2.1 voucher-common (resilience + shared “is shadow?”)

**Resilience interceptor** (`voucher-common/interceptor/resilience/resilience.go`):
- Now: Loads one map keyed by command name; `Wrap(ctx, cmd, ...)` uses `GetProtector(cmd)` only.
- Change: In `Wrap`, *decide effective command name from context*:
	- If traffic is shadow: use "shadow." + cmd as the config/protector key (e.g. shadow.account.core.get_account). If that protector/config is missing, fallback to cmd.
	- If not shadow: keep using cmd.

- So I need a way to know “is this request shadow?” in the interceptor. That implies either:
	- `voucher-common` depending on `git.garena.com/shopee/platform/tracing` and calling the same pattern as `kvorm` (GetSpanContext + IsSpanContextShadow), or
	- Some other context value that another layer (e.g. server interceptor) sets from tracing.

Proposed: Shared Helper
- In `voucher-common` (e.g. under interceptor/ctxmeta or a small shadow package) -- add smth like `IsShadowTraffic(ctx context.Context) bool` that reads from tracing span context 
- Use this in voucher-common’s resilience Wrap

> [!info] What's added
> - one behavioral change (resilience uses `shadow.<cmd>` when shadow, with fallback to cmd)
> - one new dependency (way to get “is shadow” from ctx).

---
### 2.2 voucher-uservoucher

#### Config (internal/config/rate_limit_config.go):

- Change: 
	- Extend `RateLimits` with `ShadowSoftRateLimit *RateLimit` and `ShadowHardRateLimit *RateLimit` (same struct as soft/hard)
	- Config center will have `shadow_soft_rate_limit / shadow_hard_rate_limit` under `default_rate_limit`.

#### Limiters:

- Now: Two limiters (soft, hard) created at init from normal config only (`user_voucher_ratelimit.go`).

- Change: Need shadow limiters to be used when `ctx` is shadow. 

- Two options:

1. Two sets at init: In mustInitUserVoucherRateLimit (and KV), also build limiters from ShadowSoftRateLimit / ShadowHardRateLimit (if non-nil), store e.g. softUvRateLimitShadow, hardUvRateLimitShadow. Then at use site, pass shadow flag so the caller picks the right set. That requires the call site to have access to “is shadow” and to the shadow limiters.

2. Context-aware resolution: Keep one “rate limit service” but have it take ctx; inside, if IsShadowTraffic(ctx) use shadow config (and shadow Redis key prefix), else normal. That might mean creating limiters per request (expensive) or caching shadow limiters and selecting by ctx (similar to (1) but behind one API).

The use site is create_service.go line 110: rateLimiter.Allow(ctx, s.GetRateLimiterKey(userID)). So either:

- CreateService gets four limiters (soft, hard, shadowSoft, shadowHard) and in CreateMulti does “if shadow use shadowSoft/shadowHard else soft/hard”, and you need to pass a “shadow” flag into the domain (e.g. from handler, which gets it from IsShadowTraffic(ctx)), or

- CreateService gets a single “rate limit checker” that takes ctx and internally does “if shadow → shadow config + shadow key prefix, else normal”. That hides the two sets inside one abstraction.

Resilience: No change in uservoucher code if voucher-common’s resilience interceptor becomes context-aware and uses `shadow.<cmd>` when shadow (same config key resilience, just additional keys in the map like shadow.account.core.get_account).

Summary: Add shadow fields to config; add shadow limiters or a context-aware limiter abstraction; ensure handler/domain can pass “is shadow” or ctx so the right limiters (and Redis key prefix) are used.

---

## 2.3 voucher-ss-distribution

rate_limit config:

- Now: Single struct RateLimit under uniconfig key rate_limit (config.go line 34). Limiter.Init() reads GetConfig().RateLimit once.

- Change (per more-context): Config shape becomes a map: e.g. default_rate_limit and shadow_rate_limit, each with the same fields (key_prefix, window_size_second, limit, burst). So you need a new config struct (e.g. a map or a struct with DefaultRateLimit and ShadowRateLimit *RateLimit) and uniconfig binding for it. Then in Limiter:

- Either: in Init() create two limiters (normal + shadow) and in Allow/CanAllow check ctx and choose which to use (and for shadow, use a shadow Redis key prefix), or

- Or: resolve config per call from ctx (if shadow → shadow config, else default; if shadow config missing use default) and then you need a way to get the right limiter (e.g. two pre-built limiters keyed by shadow vs normal).

multi_key_rate_limit_v2:

- Now: One struct with fields like AdsVoucherRateLimit, SmartVoucherRateLimit, ...; each initXxxRateLimiter() reads one such field and creates one limiter in kvLimiters[prefix].

- Change: Add shadow counterparts (e.g. ShadowAdsVoucherRateLimit, or a parallel map). When Allow/CanAllow is called with ctx, if shadow: use shadow config for that key (e.g. shadow_ads_voucher_rate_limit) and a shadow Redis key prefix; if shadow config missing, use normal config. So you need either:

- A second map shadowKvLimiters and in Allow/CanAllow branch on IsShadowTraffic(ctx) and pick the map + key prefix, or

- Same map but keyed by e.g. "shadow_"+prefix for shadow limiters, and at call site compute the key from ctx + prefix.

resilience: Same as voucher-common: once the interceptor uses `shadow.<cmd>` when shadow (with fallback), no extra change in ss-distribution except ensuring the config for resilience_interceptor includes entries like shadow.voucher.code.batch_get_code_using_cache.

Summary: Change rate_limit and multi_key_rate_limit_v2 config shapes to include shadow; in both Limiter and MultiKeyLimiterV2, branch on IsShadowTraffic(ctx) and use shadow config + shadow Redis prefix, with fallback to normal config when shadow config is absent.


---
## Code rerff

resilience 69-72
rate_limiter 25-28

----
## Again

### 2.1 voucher-common

- Resilience interceptor (interceptor/resilience/)

- Spex client interceptor; wraps outbound calls with circuit breaker.

- Config key is configurable (e.g. resilience_interceptor or resilience via WithConfigKey).

- Protector is chosen only by cmd; no context (e.g. shadow) used.

- Single map of protectors: resilience.GetProtector(cmd).

- Rate limit (ratelimit/)

- Distributed limiters (e.g. inadaptive) with KeyPrefix, Limit, Burst.

- No context-based branching; no shadow prefix or separate instances.

- Context

- ctxmeta: puts client name (from spex instance ID) in context. No shadow flag.

### 2.2 voucher-ss-distribution

- Resilience: resilience.RegisterClientInterceptor() with default config key → resilience_interceptor.

- Rate limit:

- Single limiter (Limiter): one config rate_limit → one KeyPrefix, limit, burst; used for e.g. distribution QPS.

- MultiKeyLimiterV2: many key prefixes (ads, smart voucher, affiliate, etc.) from multi_key_rate_limit_v2; each key prefix gets one limiter instance. No ctx in Allow/CanAllow for traffic type.

- Config (internal/config): RateLimit, MultiKeyRateLimitV2, no resilience in this struct (resilience comes from config SPI key resilience_interceptor).

- Flow: Handler → service → rate limit check → (if pass) spex call (through resilience interceptor). No shadow path anywhere.

### 2.3 voucher-uservoucher

- Resilience: resilience.RegisterClientInterceptor(resilience.WithConfigKey("resilience")) → config key resilience.

- Rate limit: default_rate_limit with SoftRateLimit and HardRateLimit → two limiters (soft + hard), created once at init from config. Used in e.g. create_service.go via rateLimiter.Allow(ctx, key).

- Config: DefaultRateLimit *RateLimits with SoftRateLimit / HardRateLimit; no shadow fields yet.

- Flow: Handler/domain calls GetSoftUserVoucherRateLimiter() / GetHardUserVoucherRateLimiter() and Allow(ctx, key). No shadow branch.

So today: one resilience control plane and one (or two) rate-limit control plane per service; no shadow/normal split.

---

“We store resilience settings per RPC command name.  
For each RPC name we create one circuit breaker instance.  
At runtime we look up the breaker using the command name string.”

- Today: **one command string → one protector instance (shared state)**
    
- Problem: shadow and real traffic use the **same command string**, so they share the **same breaker state**
    
- Goal: keep the _same business RPC command_, but have **two protector instances** (and optionally two configs): one for normal, one for shadow
    

So the “further separation” is simply:

> **make the lookup key different for shadow traffic**  
> (even though the actual RPC command being called is the same)

---
## concerns

- number of configs to be loaded
	- before: 1 protector per config (cmd) entry
	- after: double -- 1 for normal, 1 for shadow
- is that a concern? should be lightweight
