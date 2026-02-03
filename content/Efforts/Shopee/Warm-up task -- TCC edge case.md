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

[[tcc cancellation workflow]]

---
## `ss_usage` repo

### Module Registration

- `mod/api/module.go` --> `RegisterModule()` --> `handler.VoucherSSUageAPIGASOption()`
	- what it does: register handler for voucher ss usage service
	
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

- `internal/domain/vouchertx/use_service.go` --> `UseManyTccCancel(...)` --> `s.needReturnUserVouchers()` --> `s.voucherTransactionService.GetMulti()`

### Vouchertx service

- `s.voucherTransactionService.GetMulti()` --> `s.repo.GetMulti()`

### Repo layer

- the actual function we're changing
- original logic: put all vouchertxn identifiers into a single request --> call external API `BatchGetVoucherTransactionUsingMasters()` with it 
	- problem: if # req > 50 --> exceeds API request size limit --> cancel logic failed --> user voucher not returned 
- updated logic: split requests into batches (max 50 each) --> call external API for each batch --> return aggregated result

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

---
## E2E Testing

### Flow

1. make a test user account in [shopee testing app](https://test.shopee.co.id/)
2. find your vouchers in [vouchers page](https://test.shopee.co.id/user/voucher-wallet) 
3. if you don't have > 50 vouchers, dispatch yourself some active vouchers fro [promotion admin](https://admin.promotion.test.shopee.co.id/vm-shopee-voucher)
4. use [HTTP Gateway](https://confluence.shopee.io/display/SPDC/Spex+HTTP+Gateway) to call the try api using http spex gateway
5. call the cancel API using http spex gateway and verify transaction API is called multiple times (due to the newly implemented batching logic)

### Dispatch voucher API

> Goal: To get 50+ vouchers to test the new cancel flow; to do so, we use dispatch voucher api (in `ss_distribution` service) to dispatch vouchers to a certain user)

1. URL = which SPEX command you’re calling

	- `/sprpc/voucher.ss.distribution.batch_distribute_voucher`
	- This is the RPC command name. Gateway maps it to the SPEX service command.

2.  `x-sp-sdu` + `x-sp-servicekey` = “who you are” (auth)

	- `x-sp-sdu: voucher.ssdistributionapi.id.test.master.default x-sp-servicekey: 96537e...`
	- This is basically: “I am caller X, and here is my key.”  
	- i.e., pretending that you're the *SPEX Client*, who's authorized to call the SPEX server

3. `shopee-baggage: CID=id` + request `region: "ID"` = route to the right “country slice”

	- `shopee-baggage: CID=id "region": "ID"`
	- Many Shopee services route by CID/region. If you mismatch these, you might distribute into the wrong shard or fail routing.

 4. Body = the actual business request

	- `{   "requests": [{     "region": "ID",     "voucher_identifier": { "voucher_id": 1291850623389696 },     "user_id": 80395,     "distribution_method": 2   }] }`

	- **user_id**: the receiver (you)
	- **voucher_id**: which voucher to grant
	- **distribution_method**: how to distribute (2 usually means some backend-driven distribution mode in that service)

user_id: 7943359496
voucher_id: 1346878105206784

### Request shape (for E2E)

- Endpoint: `voucher.ss.usage.use_vouchers_tcc_cancel_v2`
- Request (conceptually): `UseVouchersTccCancelV2Request` with at least:
- tcc_transaction_id: id of a TCC try that already exists (from a prior use_vouchers_tcc_try_v2).

So to test your GetMulti change end-to-end you:
1. Create a TCC try with enough voucher usages that cancel will generate > 50 identifiers
2. Call TCC Cancel V2 with that tcc_transaction_id.

Then the path above runs and hits GetMulti with 50+ identifiers, so your batching and `batch_get_voucher_txn` logic are exercised.

| What               | Value                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Endpoint to test   | voucher.ss.usage.use_vouchers_tcc_cancel_v2                                                                            |
| Why                | It’s the only path that calls needReturnUserVouchers → GetMulti (your changed code).                                   |
| When GetMulti runs | During cancel, to decide if vouchers must be returned before cancelling the TCC record.                                |
| Flow               | HTTP → UseVouchersTccCancelV2 → TccCancelService.Cancel → UseManyTccCancel → needReturnUserVouchers → GetMulti (repo). |
| E2E for batching   | Create a TCC try with 50+ voucher tx identifiers, then call use_vouchers_tcc_cancel_v2 with that tcc_transaction_id.   |

---
## Request structure 

`ss_distribution`:

```
curl --request POST \
  --url https://http-gateway.spex.test.shopee.sg/sprpc/voucher.ss.distribution.batch_distribute_voucher \
  --header '_show_debug_info: 2' \
  --header 'content-type: application/json' \
  --header 'cookie: SPC_EC=-; SPC_F=OVGmqweEMmJ1Yr1HM6GHKe7AMzOfK4d5; SPC_R_T_ID=SLP58AneRkIRWvAOMjR01DAeGnZx2U6Yg+rtO6m/F6xYbiPU3zZNx3yrs1eYHsztfGfAytwehWVKtB/fl9S/hK8Ebk2HUpOkj2/SeRSEayE=; SPC_R_T_IV=r9DvgntzgxM24ULI71ccDg==; SPC_T_ID=SLP58AneRkIRWvAOMjR01DAeGnZx2U6Yg+rtO6m/F6xYbiPU3zZNx3yrs1eYHsztfGfAytwehWVKtB/fl9S/hK8Ebk2HUpOkj2/SeRSEayE=; SPC_T_IV=r9DvgntzgxM24ULI71ccDg==; SPC_U=-' \
  --header 'shopee-baggage: CID=id' \
  --header 'x-sp-debug: true' \
  --header 'x-sp-sdu: voucher.ssdistributionapi.id.test.master.default' \
  --header 'x-sp-servicekey: 96537eb39846c6f6b54d73f8af1869d7' \
  --cookie 'SPC_EC=-; SPC_F=OVGmqweEMmJ1Yr1HM6GHKe7AMzOfK4d5; SPC_R_T_ID=SLP58AneRkIRWvAOMjR01DAeGnZx2U6Yg+rtO6m/F6xYbiPU3zZNx3yrs1eYHsztfGfAytwehWVKtB/fl9S/hK8Ebk2HUpOkj2/SeRSEayE=; SPC_R_T_IV=r9DvgntzgxM24ULI71ccDg==; SPC_T_ID=SLP58AneRkIRWvAOMjR01DAeGnZx2U6Yg+rtO6m/F6xYbiPU3zZNx3yrs1eYHsztfGfAytwehWVKtB/fl9S/hK8Ebk2HUpOkj2/SeRSEayE=; SPC_T_IV=r9DvgntzgxM24ULI71ccDg==; SPC_U=-' \
  --data '{
  "requests": [
    {
      "req_meta": {
        "caller_source": 1
      },
      "region": "ID",
      "voucher_identifier": {
        "voucher_id": 1291850623389696
      },
      "user_id": 80395,
      "distribution_method": 2,
      "distributeValidationOption": {}
    }
  ]
}'
```

setup: 
- `export PFB_NAME=tianran-dev`
- `export CID=id`

`try_v2`

```
curl --request POST \
  --url 'https://http-gateway.spex.test.shopee.sg/sprpc/voucher.ss.usage.use_vouchers_tcc_try_v2' \
  --header 'content-type: application/json' \
  --header 'shopee-baggage: CID=id,PFB=tianran-dev' \
  --header 'x-sp-debug: true' \
  --header 'x-sp-processid: e2e_try_v2' \
  --header 'x-sp-sdu: voucher.ssusageapi.id.test.master.default' \
  --header 'x-sp-servicekey: bb6382543e4083c38027604fe3dd00ef' \
  --data '{
    "req_meta": { "caller_source": 1 },
    "region": "ID",
    "user_id": 7943359496,
    "transaction_reference_ids": ["test-txn-ref-id-001"],
    "tcc_reference_id": "test-txn-ref-id-001|use_vouchers_tcc_try",
    "voucher_identifiers": [
      {
        "voucher_id": 1346848308871168,
        "voucher_code": "DD12344"
      }
    ],
    "callback": "order.order_info.check_order_created",
    "callback_payload": "e30="
  }'
```

response: 
{"resp_meta":{"error_code":0,"debug_message":""},"tcc_transaction_id":"F8SQg2YJejtEKmViLNnGDZwYKh8yJ7Zxz3e896pCECKMyTrcV7fEQRubDU9oAYtpzXbsYHQqiDEokR"}

--> use this `tcc_transaction_id` in the cancel request payload
- this `id` identifies a particular voucher txn (all vouchers used by a user in a txn)
- cancelling this txn means reverting the use of all vouchers in this txn

`cancel_v2`

```
curl --request POST \
  --url 'https://http-gateway.spex.test.shopee.sg/sprpc/voucher.ss.usage.use_vouchers_tcc_cancel_v2' \
  --header 'content-type: application/json' \
  --header 'shopee-baggage: CID=id,PFB=tianran-dev' \
  --header 'x-sp-debug: true' \
  --header 'x-sp-processid: e2e_cancel_v2' \
  --header 'x-sp-sdu: voucher.ssusageapi.id.test.master.default' \
  --header 'x-sp-servicekey: bb6382543e4083c38027604fe3dd00ef' \
  --data '{
    "tcc_transaction_id": "F8SQg2YJejtEKmViLNnGDZwYKh8yJ7Zxz3e896pCECKMyTrcV7fEQRubDU9oAYtpzXbsYHQqiDEokR"
  }'
```