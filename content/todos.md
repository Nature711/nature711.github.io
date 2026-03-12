---
title:
draft: true
tags:
date:
---
- [x] merge MR
	- [x] voucher-common (1)
	- [x] uservoucher
	- [x] ss-distribution
- [x] add tag for voucher-common (`v1.23.0`) (2)
- [ ] update rate limiter & resilience config (live, edit experimental)
	- [ ] uservoucher
	- [ ] ss-distribution
- [ ] update voucher-common version tag in `go.mod` 
	- [x] uservoucher (3)
	- [x] ss-distribution (3)
- [ ] release services
	- [x] voucher-common: run new pipeline (since it's a lib) -- auto run after tagging
	- [ ] uservoucher
	- [ ] ss-distribution

- [x] add to release engine (before this fri)
- [x] code merge (before this fri)
- [ ] publish config
- [ ] actual release (next Wed)
- [ ] update tickets
