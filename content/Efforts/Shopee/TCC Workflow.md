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



