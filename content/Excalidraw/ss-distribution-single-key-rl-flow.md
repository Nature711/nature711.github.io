---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


# Excalidraw Data

## Text Elements
Batch pre-check: CanAllow()

(Transport) GAS / Spex
  |
  | cmd: voucher.ss.distribution.batch_distribute_voucher
  v
(Generated Spex dispatcher)
  _Distribution_BatchDistributeVoucherHandler(ctx, req, resp)
  -> DistributionServiceImpl.BatchDistributeVoucher(ctx, req, resp)
  v
(Handler entry)
  handler.BatchDistributeVoucher(ctx, req)
    - validateBatchReq(req.Requests)
    - distributeService.BatchDistribute(ctx, region, infos)
  v
(Distribute orchestration)
  distribute.Service.BatchDistribute(ctx, region, infos)
    - steps := [checkRateLimitAvailability, checkUserExistence, loadVouchers, ...]
    - meta := batchDistribute(ctx, region, infos, steps)
  v
(Step execution)
  ExecuteSteps(ctx, meta, steps)
    -> step#1 checkRateLimitAvailability(meta)(ctx)
        - userIDs := extractUserIDs(meta)
        - errs := batchCanAllow(ctx, userIDs)
        - fillErrorToResult(meta.results, errs)
             (results[i].Errs filled => this item will NOT continue)
        |
        v
    batchCanAllow(ctx, userIDs)
      for each userID:
        canAllow(ctx, userID)
          -> rateLimiter.CanAllow(ctx, strconv(uid))
              -> ShadowAwareLimiter.CanAllow(ctx, key)
                  -> pick(normal vs shadow by shadow.IsShadow(ctx))
                      -> InadaptiveDistrLimiter.CanAllow(ctx, key)
                          -> Redis EVAL(inadaptiveCanAllowNLua)
                              - GET key only
                              - returns wait time (no mutation)  ^Meq2VVaK

Pre-item check: Allow()

(Transport) GAS / Spex
  |
  v
(Generated Spex dispatcher)
  _Distribution_BatchDistributeVoucherHandler
  -> DistributionServiceImpl.BatchDistributeVoucher
  v
(Handler entry)
  handler.BatchDistributeVoucher
    -> distributeService.BatchDistribute(ctx, region, infos)
  v
(Distribute orchestration)
  BatchDistribute(...)
    - meta := ExecuteSteps(...)   // Path A already ran here
    - for each i where meta.results[i].Errs is empty:
        distributeOneBasic(ctx, region, info, voucher, campaign, result, isRandomCode)
          - lock(ctx, userID, voucherID)
          - checkUserVoucherDuplicate(...)
          - allow(ctx, userID)
              -> rateLimiter.Allow(ctx, strconv(uid))
                  -> ShadowAwareLimiter.Allow(ctx, key)
                      -> pick(normal vs shadow by shadow.IsShadow(ctx))
                          -> InadaptiveDistrLimiter.Allow(ctx, key)
                              -> Redis EVAL(inadaptiveAllowNLua)
                                   - GET key
                                   - if allowed: SETEX key TTL value (mutates)
                                   - returns 0 (or wait time)
          - distributeOneUserVoucher(...)
          - unlock(...) ^x6ObUIfA

%%
## Drawing
```compressed-json
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
```
%%