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
- pfb
- routing to certain instances