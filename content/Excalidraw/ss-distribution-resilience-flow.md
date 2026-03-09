---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


# Excalidraw Data

## Text Elements
Resilience interceptor -- calling batch_get_code_using_cache()

(Inbound) batch_distribute_voucher
  |
  v
(Transport) GAS / Spex
  |
  | cmd: voucher.ss.distribution.batch_distribute_voucher
  v
(Generated Spex dispatcher)
  _Distribution_BatchDistributeVoucherHandler(ctx, req, resp)
  -> DistributionServer.service.BatchDistributeVoucher(ctx, req, resp)
  v
(Handler entry)
  BatchDistributeVoucherImpl.Execute(ctx, req, resp)
    -> validateBatchReq(req.GetRequests())
    -> distributeService.BatchDistribute(ctx, region, infos)
  v
(Distribute orchestration)
  Service.BatchDistribute(ctx, region, infos)
    - steps := [checkRateLimitAvailability, checkUserExistence, loadVouchers, ..., loadCodes, ...]
    - meta, err := ExecuteSteps(ctx, meta, steps)
  v
(Step: loadCodes)
  loadCodes(meta)(ctx)
    - identifiers := extractCompleteVoucherIdentifiers(meta)
    - codeMap, err := s.CodeService.BatchGetMap(ctx, meta.region, identifiers)
        |
        v
    code.Service.BatchGetMap(ctx, region, identifiers)
      - codes, err := s.repo.BatchGetUsingCache(ctx, region, identifiers)
        |
        v
    code.Repo.BatchGetUsingCache(ctx, region, identifiers)
      - cmd := "voucher.code.batch_get_code_using_cache"
      - req := getBatchGetCodeUsingCacheRequest(region, identifiers, false)
      - err := r.client.SpsRPCRequestWithJSONLog(ctx, cmd, req, resp)
        |
        v
(Outbound Spex client)
  spex.Client.SpsRPCRequestWithJSONLog(ctx, cmd, req, resp)
    -> c.invokerFunc(ctx, cmd, req, resp)   // invokerFunc = chain of ClientInterceptors
        |
        v
(Resilience interceptor — wraps all outbound Spex calls)
  resilienceInterceptor.Wrap(invoke)(ctx, cmd, req, resp)
    - effectiveName := cmd   // or shadowName(cmd) if shadow.IsShadow(ctx)
    - protector, _ := resilience.GetProtector(effectiveName)   // keyed by "voucher.code.batch_get_code_using_cache"
    - if protector == nil -> invoke(ctx, cmd, req, resp)
    - else:
        blockErr := protector.Protect(ctx, func(ctx context.Context) error {
            return invoke(ctx, cmd, req, resp, opts...)   // circuit breaker / timeout / rate limit
        })
        if blockErr != nil -> return convBlockErrToSpexErr(blockErr)
        return nil
        |
        v
    invoke(ctx, cmd, req, resp)   // inner invoker (next interceptor or default Invoker)
        |
        v
(Actual Spex invocation to downstream)
  Invoker.Invoke(ctx, "voucher.code.batch_get_code_using_cache", req, resp)
    -> network / Spex call to voucher.code service
    -> voucher.code.batch_get_code_using_cache ^rHm0W21A

%%
## Drawing
```compressed-json
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
```
%%