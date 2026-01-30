---
title:
draft: true
tags:
date: 2026-01-28
---
![[voucher-er-diagram.png]]

`UserVoucher`: 
- links a user to a voucher
- "user A owns voucher B, with limit X..."
- user_id, voucher_id

`Voucher Transaction`: 
- a record for an actual voucher txn that's happening
- "user A is using voucher B in a particular txn C"