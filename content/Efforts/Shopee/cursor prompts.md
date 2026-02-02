---
title:
draft: true
tags:
date: 2026-02-01
---
let's explore this repo as part of the voucher shared service. the big picture is, we have this tcc (try / confirm / cancel) protocol to ensure correctness of user voucher dispatch. now when calling the `batch_get_voucher_txn` API during *cancel*

- i.e., cancelling all voucher txn for a specific order

- API has a batch size limit of 50

- if actual no. of voucher txn to be cancelled > 50 (i.e., this order has 50+ associated voucher txn) --> cancellation workflow failed

- impact: vouchers not returned to user. so our solution is: - to update the cancellation flow -- making multiple calls to `batch_get_voucher_txn` API, instead of just 1 (which may exceed 50 batch size)

- i.e., if an order has N associated voucher txn --> make *N / 50* calls to API

- so that the cancellation workflow completes & all vouchers get returned to user.