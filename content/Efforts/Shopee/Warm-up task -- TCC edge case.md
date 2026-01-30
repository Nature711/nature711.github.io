---
title:
draft: true
tags:
date: 2026-01-28
---
## Background

- Problem introduction: [TCC Edge case](https://confluence.shopee.io/display/SPPT/Voucher+Backend+-+20260123+-+TCC+Edge+Cases)
- TCC: try-confirm-cancellation in distributed txn processing

### Other useful links

#### VSS 

- [Voucher ER Diagram](https://confluence.shopee.io/pages/viewpage.action?pageId=1120735880)
- Note: [[Voucher ER Diagram]]

#### Procedural

- [Jira & Gitlab workflow](https://confluence.shopee.io/display/SPPT/Voucher+Backend+-+New+Hire+Guide+-+Workflow+Introduction)
- Jira ticket: [Call batch get transaction API by batch to avoid request length limit](https://jira.shopee.io/browse/SPPT-139786)

---
## The Task

### Problem

Big picture: TCC (Try / Confirm / Cancel) --> Cancel
- when calling the `batch_get_voucher_txn` API  during *cancel*
	- i.e., cancelling all voucher txn for a specific order 
- API has a batch size limit of 50
- if actual no. of voucher txn to be cancelled > 50 (i.e., this order has 50+ associated voucher txn) --> cancellation workflow failed
- impact: vouchers not returned to user

### Solution

- to update the cancellation flow -- making multiple calls to `batch_get_voucher_txn` API, instead of just 1 (which may exceed 50 batch size)
- i.e., if an order has N associated voucher txn --> make *N / 50*  calls to API 
- so that the cancellation workflow completes & all vouchers get returned to user

[[cursor prompts]]

---
## `ss_usage` repo

### Module Registration

- `mod/api/module.go` --> `RegisterModule()` --> `handler.VoucherSSUageAPIGASOption()`
	- what it does: register handler for voucher ss usage service

#### Patterns


### Service initialization
	
- `internal/handler/service.go` --> `Init()`
	- what it does: initialize all "sub-services" for voucher usage service
		- define interfaces for each service impl
		- tcc related stuff, e.g., TccTryImpl, TccConfirmImpl, TccCancelImpl...
	
- what matters: `i.UseVouchersTccCancelV2Impl` = `NewDefaulUseVouchersTccCancelV2Impl()`

#### Patterns
- interface for each service
- initialize concrete implementation
	
### Tcc Cancel Service

- `internal/handler/use_vouchers_tcc_cancel_v2.go` --> `NewDefaultUseVouchersTccCancelV2Impl()` --> `UseVouchersTccCancelV2(...)` --> `s.tccService.Cancel(..., tccTxId)` 
	- what it does: calls the cancel method of the TccCancel Service, to cancel a txn identified by tid
- `Cancel(..., tid)`
	- get try payload for cancel
	- check if the txn has already be cancelled
	- acquire use lock
	- get user vouchers for the txn
	- `s.useService.UseManyTccCancel(..., userVouchers...)`

#### Patterns
- decoupling -- by depending on interface
- testability -- easy to mock
```
mockTcc := new(MockTccCancelService)
impl := NewUseVouchersTccCancelV2Impl(mockTcc)
```
- lifecycle control -- constructor called by DI container

### Domain service: vouchertx.UseService

- `internal/domain/vouchertx/use_service.go` --> `UseManyTccCancel(...)` --> 

### Flow

```
1. API Handler (use_vouchers_tcc_cancel_v2.go)
   ├─ Line 97: s.tccService.Cancel()
   │
   └─▶ 2. TccCancelService.Cancel() (same file)
       ├─ Line 171: s.useService.UseManyTccCancel()
       │
       └─▶ 3. UseService.UseManyTccCancel() (vouchertx/use_service.go)
           ├─ Line 136: s.needReturnUserVouchers()
           │
           └─▶ 4. needReturnUserVouchers() (same file)
               ├─ Line 211: s.generateAllVoucherTransactionIdentifiers()
               │            → Creates N identifiers (txRefIDs × vouchers)
               ├─ Line 212: s.voucherTransactionService.GetMulti()
               │
               └─▶ 5. Service.GetMulti() (vouchertx/service.go)
                   ├─ Line 34: s.repo.GetMulti()
                   │
                   └─▶ 6. 🐛 Repo.GetMulti() (vouchertx/repo.go) ◄─── FIX HERE!
                       ├─ Line 34-51: Builds ONE request with ALL identifiers
                       ├─ Line 53: Makes ONE API call
                       └─ ❌ Fails if len(identifiers) > 50
```

