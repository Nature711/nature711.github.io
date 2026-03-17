---
title:
draft: true
tags:
date: 2026-02-03
---
## TCC Protocol

> Try -- Confirm -- Cancel

(attach diagram here)

---
2 components (separate executables)

- api
	- the API server – SPEX service that serves voucher-ss-usage APIs (validate_vouchers, use_vouchers_tcc_try_v2, use_vouchers_tcc_cancel_v2, return_vouchers_v2, etc.)
	- This is the main “program” that handles HTTP/SPEX traffic

- cron/tcc_archiver
	- Cron job – TCC archiver
	- Runs on a schedule to archive old TCC transaction data
	- No HTTP API; run as a separate process (e.g. from cron or a job runner)

---
## Local testing

- local spex socket
- export socket varibale
- export certain flags (PFB_NAME, CID -- as required in shopee-baggage)
	- how to know which vairables to export / what are needed
- pfb: pfb-get-multi-batching
- routing to certain instances

if run locally: 
- will create logs in data/ folder
- otherwise see online log platform

every time a push will trigger a deployment pipeline (using pfb = pfb-auto-dev-test), can see in [CMDB Deployment](https://space.shopee.io/console/cmdb/deployment/detail/shopee.marketplace_core.promotion.voucher.ss_usage.api) for that service

check [shark portal](https://shark.test.shopee.io/playback-tasks?project_name=voucher-ssusageapi&task_group_id=41948&tab=2)for failed test cases, explain if they're expected


---
## Context

this is my first warm-up task
it's to change a simple logic in the voucher shared service. 
the big picture is, we have this tcc (try / confirm / cancel) protocol to ensure correctness of user voucher dispatch. now when calling the `batch_get_voucher_txn` API during *cancel*

- i.e., cancelling all voucher txn for a specific order

- API has a batch size limit of 50

- if actual no. of voucher txn to be cancelled > 50 (i.e., this order has 50+ associated voucher txn) --> cancellation workflow failed

- impact: vouchers not returned to user. 

- so our solution is: - to update the cancellation flow -- making multiple calls to `batch_get_voucher_txn` API, instead of just 1 (which may exceed 50 batch size)

- i.e., if an order has N associated voucher txn --> make *N / 50* calls to API

- so that the cancellation workflow completes & all vouchers get returned to user.

this is a bug fix in the `ss_usage` repo