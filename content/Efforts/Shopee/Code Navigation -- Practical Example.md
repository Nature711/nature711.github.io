---
title:
draft: true
tags:
date: 2026-02-24
---
Theory part: 

[[Code Navigation -- Theory]]

---

How to trace a request flow in a system 

- right click method --> show call hierachy
- cmd + click method --> go into it

---

how to read call hierachy? -- using example of canallow method

we want understand how a http request to batch_distribute_voucher endpoint flows through the system and reaches this method

```go 
// voucher-ss-distribution/internal/service/ratelimit/shadow_rate_limiter.go
func (s *ShadowAwareLimiter) CanAllow(...) {
	return s.pick(ctx).CanAllow(ctx, key)
}
```

- right click --> show call hierarchy 
	- by default it's showing outgoing call (i.e.,  calls from)
	- can also see incoming calls by clicking on the top right call button

![[calls-from-can-allow.png]]

it calls: `s.pick(ctx).CanAllow(ctx, key)` --> the `s.pick()` returns either `normal` or `shadow` rate limiter instance, which is of type `ILimiter` (not `ShadowAwareRateLimiter`) 

```go
type ShadowAwareLimiter struct {
	normal, shadow ILimiter
}
```

so this `return s.pick(ctx).CanAllow(ctx, key)`

--> this is calling the `ILimiter`'s `CanAllow()` method

> this is **interface dispatch**: it calls the CanAllow method of *whatever concrete type* is stored in s.normal or s.shadow.

> related: [[navigating interface methods]]

so we need to figure out what concrete type is actually stored in `s.normal` / `s.shadow`

we just saw: ShadowAwareLimiter only holds ILimiter

the concrete limiters are whatever we pass into `NewShadowAwareLimiter`

```go
// rate_limiter.go
func (crl *Limiter) Init() error {
...
normalLimiter := ratelimit.NewInadaptiveDistrLimiter(crl.cacheClient, normalCfg.KeyPrefix, limitD, burstD)

shadowLimiter := ratelimit.NewInadaptiveDistrLimiter(crl.cacheClient, shadowCfg.KeyPrefix, limitS, burstS)

crl.shadowAwareLimiter = NewShadowAwareLimiter(normalLimiter, shadowLimiter)
```

so: 

1. normalLimiter and shadowLimiter are the return values of ratelimit.NewInadaptiveDistrLimiter
2. there's this import at the top: 

```go 
// rate_limiter.go
import (
"git.garena.com/shopee/promotion/voucher-common/ratelimit"
...
)

type ILimiter interface {
	Allow(ctx context.Context, key string) (ok bool, err error)
	CanAllow(ctx context.Context, key string) (ok bool, err error)
}
...

```

therefore: 
> ratelimit in rate_limiter.go = voucher-common’s ratelimit package

which is like this: 

```go 
// inadaptive_distr_limiter.go
func (rtb *InadaptiveDistrLimiter) CanAllow(...) {
	return rtb.CanAllowN(ctx, key, 1)
}
```

which calls: 

```go
func (rtb *InadaptiveDistrLimiter) CanAllowN(...) {
	waitTimeMicroSec, err := rtb.runLuaScriptForWaitTime(ctx,inadaptiveCanAllowNLua, key, n)
...
```

which calls: 

```go
func (rtb *InadaptiveDistrLimiter) runLuaScriptForWaitTime(...) {
	...
	rawResult, err := rtb.cfg.RedisClient.Eval(ctx, script, keys, args)
	...
}
```

with the Lua script: 

```go
const inadaptiveCanAllowNLua = `local a=KEYS[1]local b=tonumber(ARGV[1])local...
```

which is interacting with the actual redis client 

---

well what we just explored is the outgoing stuff hhh

we still haven't know then, who calls the `ShadowAwareLimiter`'s CanAllow method???

we understand this by exploring the incoming calls (callers of)

![[callers-of-can-allow.png]]

we see it's called by the `CanAllow` method of `Limiter` 

note: this is because shadowAwareLimiter is a *ShadowAwareLimiter* type (due to new)

```go
// rate_limiter.go
func (crl *Limiter) CanAllow(...) {
	ok, err = crl.shadowAwareLimiter.CanAllow(ctx, key)
	...
}
```

which is called by: 

```go
// internal/service/distribute/service_steps.go
func (s *Service) canAllow(...) {
    ...
	ok, err := s.rateLimiter.CanAllow(ctx, strconv.FormatInt(userID, 10))
	...
}
```

which is called by: 

```go
// internal/service/distribute/service_steps.go
func (s *Service) batchCanAllow(...) {
	...
	for i, userID := range userIDs {
		ret[i] = s.canAllow(ctx, userID)
	}
	...
}

// same file
func (s *Service) checkRateLimitAvailability(...) {
	...
	errs := s.batchCanAllow(ctx, userIDs)
	...
}
```

now we're leaving the `DistributeService` layer, and moving up to `Handler` layer

which is called by: 

```go
// internal/service/distribute/service.go
func (s *Service) BatchDistribute(...) {
	steps := []stepFnGetter{
	s.checkRateLimitAvailability,
	s.checkUserExistence,
	...
```

which is called by: 

```go
// internal/handler/batch_distribute_voucher.go
func (b *BatchDistributeVoucherImpl) batchDistributeVoucher(...) {
	...
	results, err := b.distributeService.BatchDistribute(ctx, region, infos)
	...
}

// same file

func (b *BatchDistributeVoucherImpl) execute(...) {
	if err := b.batchDistributeVoucher(ctx, req, resp); err != nil { 
	...
}

// same file
func (b *BatchDistributeVoucherImpl) BatchDistributeVoucher(...) {
	err := b.execute(ctx, request, resp)
	...
}
```

![[incoming-call-trace-can-allow.png]]

---

the trace stops here , as we're finished at the handler layer. 
further up is the generated spex dispatcher layer, gas related stuff




