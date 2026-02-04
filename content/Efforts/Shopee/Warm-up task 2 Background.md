---
title:
draft: true
tags:
date: 2026-02-04
---
# Background

- **FCST (Full Chain Stress Testing)**: end-to-end stress testing platform
- prepare Voucher data in **Shadow** environment --> simulate real user voucher claiming & redemption scenarios

## High Level Plan

- Isolate shadow traffic with normal traffic
    - Remove / have separate control of *user level rate limiter* for shadow traffic
    - Isolate *circuit breaker* for shadow traffic as well
    - Review other limiters / interceptors in VSS
- New set of APIs on ss.business & taskv2 for efficient shadow data manipulation across business domains
    - Provide asynchronous voucher dispatch API
        - Support dispatching shadow traffic via taskv2
        - Taskv2 should use ss.business API to do dispatch, to support multiple business domains
    - Migrate `batch_duplicate_shadow_promotion` to ss.business with multiple business domain support
    - Provide global user voucher query/manipulation API
- Add more metrics for shadow & normal data comparison
- Shadow data expiration management
    - Align the expiration mechanism for shadow data
    - Allow removing data from shadow DB

---

Voucher Backend - 2026-01-05 - VSS FCST Improvement

tickets related to me:
- [![](https://jira.shopee.io/secure/viewavatar?size=xsmall&avatarId=10318&avatarType=issuetype)SPPT-140541](https://jira.shopee.io/browse/SPPT-140541) - Voucher | Dev | voucher-common | FCST Improvement after KV Migration 
- [![](https://jira.shopee.io/secure/viewavatar?size=xsmall&avatarId=10318&avatarType=issuetype)SPPT-140540](https://jira.shopee.io/browse/SPPT-140540) - Voucher | Dev | voucher-uservoucher | FCST Improvement after KV Migration
- [![](https://jira.shopee.io/secure/viewavatar?size=xsmall&avatarId=10318&avatarType=issuetype)SPPT-140539](https://jira.shopee.io/browse/SPPT-140539) - Voucher | Dev | voucher-ss-distribution | FCST Improvement after KV Migration

# Background

**Current Load Testing Issues:**

1. Stress testing testing on certain production APIs impacts normal live traffic.
    
2. Test data is inaccurate, with significant discrepancies compared to actual production data.
    

Simultaneously, we plan to migrate relevant APIs within this project.

**Proposed Solutions:**

1. **Shadow Configuration:** Implement shadow configurations for the rate limiter and circuit breaker components within `voucher.ss.distribution` and `voucher.uservoucher`. If the traffic is identified as shadow traffic, it will be routed to the shadow configuration.
    
2. **Shadow Flagging & Migration:** For the `voucher.taskv2.submit_stream_task`API, determine if the request is shadow traffic before publishing to Kafka. Append a shadow flag to the message written to Kafka, and execute task-based migration on the Kafka consumer side.
    
3. **Logic Migration:** Migrate the general logic of the following three `voucher.core` APIs to `ss.business`: `batch_duplicate_shadow_promotion`, `get_promotion_list_by_list_type`, and `get_global_voucher_list`. If the request belongs to the "marketplace" domain, `ss.business` will invoke the `voucher.core` APIs.

# Overall Flow

The diagram indicates the overall flow of stress testing process:

The whole process can be splitted to 3 phases:

1. Load voucher
2. Duplicate voucher
3. Dispatch voucher

# Solution

## 4.1. Isolation shadow traffic with normal traffic

To implement the below goals:

1. Increase dispatch QPS during stress testing.
2. Make shadow traffic circuit breaker can't impact normal live traffic.

We will implement the isolation between shadow traffic and normal traffic by below solution.

### 4.1.1. voucher.ss.distribution

#### 4.1.1.1. Config

For config `resilience_interceptor` , it is a cmd based config, we will add a key within `shadow.` prefix to differentiate normal traffic and shadow traffic.

**resilience_interceptor**

|   |
|---|
|`{`<br><br>    `"voucher.code.batch_get_code_using_cache"``:{`<br><br>        `"circuit_breakers"``:[`<br><br>            `{`<br><br>                `"timeout_percent_threshold"``:` `50``,`<br><br>                `"timeout_threshold_seconds"``:` `3``,`<br><br>                `"minimum_number_of_calls"``:` `100`<br><br>            `}`<br><br>        `]`<br><br>    `},`<br><br>`+`    `"shadow.voucher.code.batch_get_code_using_cache"``:{`<br><br>`+`        `"circuit_breakers"``:[`<br><br>`+            {`<br><br>`+`                `"timeout_percent_threshold"``:` `50``,`<br><br>`+`                `"timeout_threshold_seconds"``:` `3``,`<br><br>`+`                `"minimum_number_of_calls"``:` `100`<br><br>`+            }`<br><br>`+        ]`<br><br>`+    },`<br><br>`...`<br><br>`}`|

For config `multi_key_rate_limit_v2`  and `rate_limit` , these are key based config, we will add a key within `shadow` prefix for each keys like below:

**multi_key_rate_limit**

|   |
|---|
|`{`<br><br>    `"ads_voucher_rate_limit"``: {`<br><br>        `"per_user"``: {`<br><br>            `"window_size_second"``:` `86400``,`<br><br>            `"limit"``:` `20`<br><br>        `},`<br><br>        `"per_user_per_shop"``: {`<br><br>            `"window_size_second"``:` `3600``,`<br><br>            `"limit"``:` `20`<br><br>        `},`<br><br>        `"per_reference_id"``: {`<br><br>            `"window_size_second"``:` `3600``,`<br><br>            `"limit"``:` `1`<br><br>        `}`<br><br>    `},`<br><br>`+`     `"shadow_ads_voucher_rate_limit"``: {`<br><br>`+`        `"per_user"``: {`<br><br>`+`            `"window_size_second"``:` `86400``,`<br><br>`+`            `"limit"``:` `20`<br><br>`+        },`<br><br>`+`        `"per_user_per_shop"``: {`<br><br>`+`            `"window_size_second"``:` `3600``,`<br><br>`+`            `"limit"``:` `20`<br><br>`+        },`<br><br>`+`        `"per_reference_id"``: {`<br><br>`+`            `"window_size_second"``:` `3600``,`<br><br>`+`            `"limit"``:` `1`<br><br>`+        }`<br><br>`+    },`<br><br>`...`<br><br>`}`|

**rate_limit**

|   |
|---|
|`{`<br><br>`-`  `"key_prefix"``:` `"distribute_rate_limit"``,`<br><br>`-`  `"window_size_second"``:` `10``,`<br><br>`-`  `"limit"``:` `10000``,`<br><br>`-`  `"burst"``:` `10000`<br><br>`+` `"default_rate_limit"``:{`<br><br>`+`  `"key_prefix"``:` `"distribute_rate_limit"``,`<br><br>`+`  `"window_size_second"``:` `10``,`<br><br>`+`  `"limit"``:` `10000``,`<br><br>`+`  `"burst"``:` `10000`<br><br>`+ }`<br><br>`+` `"shadow_rate_limit"``:{`<br><br>`+`  `"key_prefix"``:` `"distribute_rate_limit"``,`<br><br>`+`  `"window_size_second"``:` `10``,`<br><br>`+`  `"limit"``:` `10000``,`<br><br>`+`  `"burst"``:` `10000`<br><br>`+ }  }`|

#### 4.1.1.2. Flow New set of APIs on ss.business & taskv2 for efficient shadow data

1. Split shadow traffic config and normal traffic config in `rate_limit`  , `multi_key_rate_limit_v2` and `resilience_interceptor`  configs.
2. Add shadow rate limiter config in `rate_limit`  `multi_key_rate_limit_v2`  in config center.
3. Add shadow cmd circuit breaker config in `resilience_interceptor`  in config center.
4. If we can't found shadow rate limiter or resilience config, will use normal config as shadow config.

### 4.1.2. voucher.uservoucher

#### 4.1.2.1. Config

For `default_rate_limit`  config under voucher.uservoucher, I added two keys `shadow_soft_rate_limit`  and `shadow_hard_rate_limit`  to isolate shadow traffic and normal traffic.

**default_rate_limit**

|   |
|---|
|`{`<br><br>  `"key_prefix"``:` `"default_rate_limit"``,`<br><br>  `"window_size_second"``:` `43200``,`<br><br>  `"limit"``:` `150``,`<br><br>  `"soft_rate_limit"``:{`<br><br>      `"key_prefix"``:` `"soft_rate_limit"``,`<br><br>      `"window_size_second"``:` `43200``,`<br><br>      `"limit"``:` `150`<br><br>  `},`<br><br>  `"hard_rate_limit"``:{`<br><br>      `"key_prefix"``:` `"hard_rate_limit"``,`<br><br>      `"window_size_second"``:` `21600``,`<br><br>      `"limit"``:` `500`<br><br>  `},`<br><br>`+`  `"shadow_soft_rate_limit"``:{`<br><br>`+`      `"key_prefix"``:` `"hard_rate_limit"``,`<br><br>`+`      `"window_size_second"``:` `21600``,`<br><br>`+`      `"limit"``:` `500`<br><br>`+  },`<br><br>`+`  `"shadow_hard_rate_limit"``:{`<br><br>`+`      `"key_prefix"``:` `"hard_rate_limit"``,`<br><br>`+`      `"window_size_second"``:` `21600``,`<br><br>`+`      `"limit"``:` `500`<br><br>`+  }`<br><br>`....`<br><br>`}`|

  

For config resilience under voucher.uservoucher, I will add a key within `shadow.`  prefix for each keys like below sample,

**resilience**

|   |
|---|
|`{`<br><br>    `"account.core.get_account"``: {`<br><br>        `"circuit_breakers"``: [{`<br><br>            `"error_percent_threshold"``:` `50``,`<br><br>            `"timeout_threshold_seconds"``:` `3``,`<br><br>            `"minimum_number_of_calls"``:` `100`<br><br>        `}]`<br><br>    `},`<br><br>`+`   `"shadow.account.core.get_account"``: {`<br><br>`+`        `"circuit_breakers"``: [{`<br><br>`+`            `"error_percent_threshold"``:` `50``,`<br><br>`+`            `"timeout_threshold_seconds"``:` `3``,`<br><br>`+`            `"minimum_number_of_calls"``:` `100`<br><br>`+        }]`<br><br>`+    },`<br><br>`...`<br><br>`}`|

  

#### 4.1.2.2. Flow

1. Add shadow rate limiter and shadow circuit breaker config in config key `default_rate_limit` and `resilience` in config center.
2. Check if the traffic is shadow traffic in interceptor, then read shadow config from `resilience`  config key and mark it is a shadow traffic.
3. Check if the traffic is shadow traffic in voucher-common, then read shadow config from  `default_rate_limiter`  config key and mark it is a shadow traffic.

## 4.2. New set of APIs on ss.business & taskv2 for efficient shadow data

To increase dispatch QPS, I will also implement task-based config for API migration and shadow rate limiter config under service `voucher.taskv2` , it can make FCST stress testing reuse the task-based dispatch API in `voucher.taskv2` , this API can reuse existing async kafka pipeline to increase the QPS of dispatch voucher.

**TODO: refer to stream-based config.**

### 4.2.1. Config

And I will also add shadow task name config under `task_config`  key, the config change is like below:

1. I will add a new config item which has `shadow` prefix for the config of shadow task.

**task_config**

|   |
|---|
|`{` `"dispatch_voucher"``: {`<br><br>        `"limit_processing_task_by_client"``:` `true``,`<br><br>        `"max_processing_task_num_with_queue_priority_for_specific_client"``: {`<br><br>            `"0"``:` `8``,`<br><br>            `"1"``:` `2`<br><br>        `},`<br><br>        `"max_processing_task"``:` `8``,`<br><br>        `"priority"``:` `0``,`<br><br>        `"collection_size"``:` `5000``,`<br><br>        `"batch_size"``:` `10``,`<br><br>        `"generator_batch_size"``:` `1000``,`<br><br>        `"protector_name"``:` `"dispatch_voucher"``,`<br><br>        `"global_protector_name"``:` `"distribute_rate_limit_vss_dispatch_global_rate_limiter"``,`<br><br>        `"new_global_protector_name"``:` `"total_distribute_rate_limit_vss_dispatch_global_rate_limiter"``,`<br><br>        `"cmd_name"``:` `"voucher.core.dispatch_voucher"``,`<br><br>        `"max_retry_count"``:` `3``,`<br><br>        `"result_column_header"``: [`<br><br>            `"userid"``,`<br><br>            `"reason"`<br><br>        `],`<br><br>        `"s3_config"``: {`<br><br>            `"prefix_path"``:` `"server/task/1/{region}/{taskId}.{fileHash}.csv"`<br><br>        `},`<br><br>        `"csv_collection_config"``: {`<br><br>            `"skip_first_row"``:` `true``,`<br><br>            `"csv_columns"``: [`<br><br>                `{`<br><br>                    `"type"``:` `1``,`<br><br>                    `"name"``:` `"unique_id"`<br><br>                `}`<br><br>            `]`<br><br>        `},`<br><br>        `"rate_limiter_migration"``: {`<br><br>            `"mode"``:` `1``,`<br><br>            `"prefer_new_ratio"``:` `100`<br><br>        `},`<br><br>        `"rate_limiter"``: {`<br><br>            `"resource"``:` `"user_voucher"``,`<br><br>            `"queue"``:` `"dispatch_voucher_high_priority_queue"`<br><br>        `}`<br><br>    `},`<br><br>`+` `"shadow_dispatch_voucher"``: {`<br><br>`+`        `"is_shadow"``:``true``,` `// new field to check if it is a shadow task config`<br><br>`+`        `"limit_processing_task_by_client"``:` `true``,`<br><br>`+`        `"max_processing_task_num_with_queue_priority_for_specific_client"``: {`<br><br>`+`            `"0"``:` `8``,`<br><br>`+`            `"1"``:` `2`<br><br>`+        },`<br><br>`+`        `"max_processing_task"``:` `8``,`<br><br>`+`        `"priority"``:` `0``,`<br><br>`+`        `"collection_size"``:` `5000``,`<br><br>`+`        `"batch_size"``:` `10``,`<br><br>`+`        `"generator_batch_size"``:` `1000``,`<br><br>`+`        `"protector_name"``:` `"dispatch_voucher"``,`<br><br>`+`        `"global_protector_name"``:` `"distribute_rate_limit_vss_dispatch_global_rate_limiter"``,`<br><br>`+`        `"new_global_protector_name"``:` `"total_distribute_rate_limit_vss_dispatch_global_rate_limiter"``,`<br><br>`+`        `"cmd_name"``:` `"voucher.core.dispatch_voucher"``,`<br><br>`+`        `"max_retry_count"``:` `3``,`<br><br>`+`        `"result_column_header"``: [`<br><br>`+`            `"userid"``,`<br><br>`+`            `"reason"`<br><br>`+        ],`<br><br>`+`        `"s3_config"``: {`<br><br>`+`            `"prefix_path"``:` `"server/task/1/{region}/{taskId}.{fileHash}.csv"`<br><br>`+        },`<br><br>`+`        `"csv_collection_config"``: {`<br><br>`+`            `"skip_first_row"``:` `true``,`<br><br>`+`            `"csv_columns"``: [`<br><br>`+                {`<br><br>`+`                    `"type"``:` `1``,`<br><br>`+`                    `"name"``:` `"unique_id"`<br><br>`+                }`<br><br>`+            ]`<br><br>`+        },`<br><br>`+`        `"rate_limiter_migration"``: {`<br><br>`+`            `"mode"``:` `1``,`<br><br>`+`            `"prefer_new_ratio"``:` `100`<br><br>`+        },`<br><br>`+`        `"rate_limiter"``: {`<br><br>`+`            `"resource"``:` `"shadow_user_voucher"``,`<br><br>`+`            `"queue"``:` `"shadow_dispatch_voucher_high_priority_queue"`<br><br>`+        }`<br><br>`+    },  ...`<br><br>`+ }`|

In our current flow, we will read the the `resource`  and `queue`  field under `rate_limiter`  field, and then use the two values to get related rate limiter config under `hierarchy_rate_limit`  config, e.g. in this case, the resource name is `shadow_user_voucher`  and the queue name is `shadow_dispatch_voucher_high_priority_queue` ,so we can get the rate limiter config in `hierarchy_rate_limit` like below:

**hierarchy_rate_limit**

|   |
|---|
|`{`<br><br>`+`  `"shadow_user_voucher"``: {`<br><br>`+`    `"resource_name"``:` `"shadow_user_voucher"``,`<br><br>`+`    `"multiplier"``:` `1.0``,`<br><br>`+`    `"root_queue"``: {`<br><br>`+`      `"queue_name"``:` `"root"``,`<br><br>`+`      `"max_limit"``:` `12000``,`<br><br>`+`      `"surge_suppressor_config"``: {`<br><br>`+`        `"activation_rate"``:` `1000``,`<br><br>`+`        `"max_increment_step"``:` `200`<br><br>`+      },`<br><br>`+`      `"sub_queues"``: [`<br><br>`+        {`<br><br>`+`              `"queue_name"``:` `"shadow_dispatch_voucher_high_priority_queue"``,`<br><br>`+`              `"guaranteed_limit"``:` `625``,`<br><br>`+`              `"priority"``:` `1``,`<br><br>`+`              `"per_instance_config"``: {`<br><br>`+`                `"burst"``:` `25``,`<br><br>`+`                `"want_estimation_config"``: {`<br><br>`+`                  `"starving_timeout_millis"``:` `2000`<br><br>`+                }`<br><br>`+              }`<br><br>`+         }`<br><br>`+     ]`<br><br>`+`<br><br>`}`|

### 4.2.2. Flow

1. Handler Layer: We will define some shadow task names for each tasks, will ask upstream to call this api by shadow task names, and we will also define a new shadow flag field inside task config, will check the flag to determine if it is a shadow task.
2. Downstream Processing: We will add a task-based greyscale config. If the task name matches, switch the dispatch operation to call the voucher.ss.business API instead of the default one.

### 4.2.3. API Definition

|   |
|---|
|`//  voucher.taskv2.submit_stream_task_v2(SubmitStreamTaskV2Request, SubmitStreamTaskV2Response)`<br><br>`//`<br><br>`//Request:`<br><br>`message SubmitStreamTaskV2Request {`<br><br>    `optional RequestMeta req_meta =` `1``;`<br><br>    `optional string task_name =` `2``;`<br><br>    `optional int64 request_time =` `3``;`<br><br>    `optional ExpireUserVouchersByStreamTaskPayload expire_user_vouchers_payload =` `4``;`<br><br>    `optional ArchiveUserVouchersByStreamTaskPayload archive_user_vouchers_payload =` `5``;`<br><br>`+    optional DispatchVoucherByStreamTaskPayload dispatch_voucher_playload =` `6``;` `//Use this filed for dispatch voucher`<br><br>`}`<br><br>`message DispatchVoucherByStreamTaskPayload {`<br><br>    `repeated int64 voucher_ids =` `1``;`<br><br>    `optional int64 user_id =` `2``;`<br><br>    `optional uint32 business_domain =` `3``;`<br><br>    `optional bytes callback_payload =` `4``;` `// for callback usage`<br><br>`}`  <br><br>`message ExpireUserVouchersByStreamTaskPayload {`<br><br>    `repeated ExpiredUserVoucher expired_user_vouchers =` `1``;`<br><br>    `optional bool dry_run =` `2``;`<br><br>`}`<br><br>`message ExpiredUserVoucher {`<br><br>    `optional UserVoucherIdentifier identifier =` `1``;` `// required`<br><br>    `optional int64 usage_start_time =` `2``;` `// required`<br><br>    `optional int64 usage_end_time =` `3``;` `// required`<br><br>`}`<br><br>`message ArchiveUserVouchersByStreamTaskPayload {`<br><br>    `repeated UserVoucherIdentifier user_voucher_identifiers =` `1``;`<br><br>    `optional bool dry_run =` `2``;`<br><br>`}`<br><br>`message UserVoucherIdentifier {`<br><br>    `optional int64 user_id =` `1``;`<br><br>    `optional VoucherIdentifier voucher_identifier =` `2``;` `// only one of voucher_identifier or user_voucher_id could be filled`<br><br>    `optional int64 user_voucher_id =` `3``;` `// only one of voucher_identifier or user_voucher_id could be filled`<br><br>`}`<br><br>`//Response:`<br><br>`message SubmitStreamTaskV2Response {`<br><br>    `optional ResponseMeta resp_meta =` `1``;`<br><br>`}`|

  

  

## 4.3. Migration of some APIs from voucher.core to voucher.ss.business

This project is also a part of deprecation of voucher.core, in this part, I will design some new APIs in `voucher.ss.business`  to replace the previous APIs in `voucher.core` . And FCST should call the new API.

And this change can also implement the goal to extend these APIs from only MARKETPLACE domain to all domains.

### 4.3.1.  Migrating voucher.core.batch_duplicate_shadow_promotion to voucher.ss.business

Changes:

1. We have confirmed that we only need to support default code vouchers.
2. Create a duplicate_shadow_default_code_vouchers API in voucher.ss.business.
3. Create a duplicate_shadow_default_code_vouchers API in voucher.mp.management.
4. If the market_type is MARKETPLACE, calls voucher.mp.management.duplicate_shadow_default_code_vouchers api in voucher.ss.business.
5. If the market_type is not MARKETPLACE, will calls xxx.duplicate_shadow_default_code_vouchers API provided by all other downstream teams.

#### 4.3.1.1. Overall Flow

For the api xxx.duplicate_shadow_default_code_vouchers, it needs the downstream to provide related APIs, refering to the implementation of voucher.mp.management.batch_duplicate_shadow_default_code_vouchers in 3.3.1.2.

**TODO: And also consider the `cache not found issues`  if the downstream can't provide the API, the optimisation is in process: [https://git.garena.com/shopee/promotion/voucher/voucher-ss-query/-/merge_requests/193](https://git.garena.com/shopee/promotion/voucher/voucher-ss-query/-/merge_requests/193)**
#### 4.3.1.2. voucher.mp.management.duplicate_shadow_default_code_vouchers Flow

**TODO: Should consider the voucher from main db can override shadow db during dev.**

#### 4.3.1.3.  API Definition

  

##### 4.3.1.3.1. voucher.ss.business.duplicate_shadow_default_code_vouchers

|   |
|---|
|`//    voucher.ss.business.duplicate_shadow_default_code_vouchers(DuplicateShadowDefaultCodeVouchersRequest, DuplicateShadowDefaultCodeVouchersResponse)`<br><br>`//Request:`<br><br>`message DuplicateShadowDefaultCodeVouchersRequest {`<br><br>    `repeated int64 voucher_ids =` `1``;`<br><br>    `optional int32 dup_mode =` `2``;` `//deprecated`<br><br>    `optional string region =` `3``;`<br><br>    `optional CustomisedShadowPromotionData customised_data =` `4``;` `//optional`<br><br>`}`<br><br>`message CustomisedShadowVoucherData {`<br><br>    `optional int64 usage_end_time =` `1``;` `//optional, only handle non-zero value`<br><br>    `optional int64 dispatch_end_time =` `2``;` `//optional, only handle non-zero value`<br><br>    `optional int64 total_claim =` `3``;` `//optional, only handle non-zero value`<br><br>    `optional int64 total_usage =` `4``;` `//optional, only handle non-zero value`<br><br>    `repeated int64 shipping_promotion_rules =` `5``;` `//optional, only handle non-empty value`<br><br>    `repeated int32 user_agent_types =` `6``;` `//optional, only handle non-empty value, ref: DeviceType`<br><br>`}`  <br><br>`//Response:`<br><br>`message DuplicateShadowDefaultCodeVouchersResponse {`<br><br>    `optional string debug_msg =` `1``;`<br><br>    `optional DuplicateShadowVoucherResult result =` `2``;`<br><br>`}`<br><br>`message DuplicateShadowVoucherResult {`<br><br>    `repeated int64 duplicated_voucher_ids =` `1``;`<br><br>`}`|

  

##### 4.3.1.3.2. [voucher.mp](http://voucher.mp/).management.duplicate_shadow_default_code_vouchers

|   |
|---|
|`// voucher.mp.management.duplicate_shadow_default_code_vouchers(DuplicateShadowDefaultCodeVouchersRequest, DuplicateShadowDefaultCodeVouchersResponse)`<br><br>`// Request:`<br><br>`message DuplicateShadowDefaultCodeVouchersRequest {`<br><br>  `optional RequestMeta req_meta =` `1``;`  <br><br>  `repeated int64 voucher_ids =` `2``;`<br><br>  `optional string region =` `3``;`<br><br>  `optional CustomisedShadowVoucherData customised_data =` `4``;` `//optional`<br><br>`}`<br><br>`message CustomisedShadowVoucherData {`<br><br>    `optional int64 usage_end_time =` `1``;` `//optional, only handle non-zero value`<br><br>    `optional int64 dispatch_end_time =` `2``;` `//optional, only handle non-zero value`<br><br>    `optional int64 total_claim =` `3``;` `//optional, only handle non-zero value`<br><br>    `optional int64 total_usage =` `4``;` `//optional, only handle non-zero value`<br><br>    `repeated int64 shipping_promotion_rules =` `5``;` `//optional, only handle non-empty value`<br><br>    `repeated int32 user_agent_types =` `6``;` `//optional, only handle non-empty value, ref: DeviceType`<br><br>`}`<br><br>`//Response:`<br><br>`message DuplicateShadowDefaultCodeVouchersResponse {`<br><br>     `optional string debug_msg =` `1``;`<br><br>     `repeated DuplicateShadowVoucherResponseData responses =` `2``;`<br><br>`}`<br><br>`message DuplicateShadowVoucherResult {`<br><br>    `repeated int64 duplicated_voucher_id =` `1``;`<br><br>`}`|

  

  

### 4.3.2. Migrating voucher.core.get_promotion_list_by_list_type to voucher.ss.business

This API was used to get shop vouchers by shop_id, because currently this api is calling local DB in voucher.core, as our plan to deprecate voucher.core. We need FCST side to call a new API from voucher.ss.business in the future. The below is the design of the new API from voucher.ss.business.

#### 4.3.2.1. Flow

Changes:

1. Add list_vouchers_by_owner_ids api in ss.business service.
2. Calls voucher.ss.management.list_vouchers_with_condition API in the new API.
#### 4.3.2.2. API Definition

##### 4.3.2.2.1. voucher.ss.business.list_vouchers_by_owner_ids

|   |
|---|
|`//    voucher.ss.business.list_vouchers_by_owner_ids(ListVouchersByOwnerIdsRequest,ListVouchersByOwnerIdsResponse)`  <br><br>`//Request`<br><br>`message ListVouchersByOwnerIdsRequest {`<br><br>    `optional RequestMeta              req_meta    =` `1``;`<br><br>    `optional string                   region      =` `2``;`<br><br>    `optional PaginationRequest        pagination  =` `3``;`<br><br>    `repeated int64                    voucher_ids =` `4``;`<br><br>    `optional VoucherTransactionFilter filter      =` `5``;`<br><br>`}`<br><br>`message VoucherTransactionFilter {`<br><br>    `optional FilterIntInCondition    user_id_in                  =` `1``;`<br><br>    `optional FilterStringInCondition voucher_code_in             =` `2``;`<br><br>    `optional FilterStringInCondition transaction_reference_id_in =` `3``;`<br><br>    `optional FilterIntInCondition    status_in                   =` `4``;`<br><br>`+    optional FilterIntInCondition   owner_id_in                  =` `5``;` `//new field to filter by shop id`<br><br>`}`<br><br>`message FilterIntInCondition {`<br><br>    `repeated int64 in_values     =` `1``;`<br><br>    `repeated int64 not_in_values =` `2``;`<br><br>`}`<br><br>`//Response`<br><br>`message ListVouchersByOwnerIdsResponse {`<br><br>    `optional ResponseMeta                 resp_meta    =` `1``;`<br><br>    `repeated ManagementVoucherTransaction transactions =` `2``;`<br><br>    `optional PaginationResponse           pagination   =` `3``;`<br><br>`}`<br><br>`message ManagementVoucherTransaction {`<br><br>    `optional int64  voucher_transaction_id   =` `1``;`<br><br>    `optional int64  voucher_id               =` `2``;`<br><br>    `optional string voucher_code             =` `3``;`<br><br>    `optional string region                   =` `4``;`<br><br>    `optional int64  user_id                  =` `5``;`<br><br>    `optional int64  user_voucher_id          =` `6``;`<br><br>    `optional uint32 business_domain          =` `7``;` `// Constant.BusinessDomain`<br><br>    `optional string transaction_reference_id =` `8``;`<br><br>    `optional uint32 status                   =` `9``;` `// Constant.VoucherTransactionStatus`<br><br>    `optional int64  create_time              =` `10``;`<br><br>    `optional int64  update_time              =` `11``;`<br><br>`}`|

##### 4.3.2.2.2. voucher.ss.management.list_vouchers_with_condition

|   |
|---|
|`// voucher.ss.management.list_vouchers_with_condition(ListVouchersWithConditionRequest, ListVouchersWithConditionResponse)`<br><br>`//Request:`<br><br>`message ListVouchersWithConditionRequest {`<br><br>  `optional RequestMeta           req_meta        =` `1``;`<br><br>  `optional PaginationRequest     pagination      =` `2``;`<br><br>  `optional string                region          =` `3``;`<br><br>  `optional VoucherQueryCondition condition       =` `4``;`<br><br>  `optional bool                  need_total_size =` `5``;`<br><br>`}`<br><br>`message VoucherQueryCondition {`<br><br>  `optional FilterIntInCondition    voucher_id_in                  =` `1``;` `// max_length=50`<br><br>  `optional FilterStringCondition   template_fix_voucher_code_like =` `2``;`<br><br>  `optional FilterStringCondition   name_like                      =` `3``;`<br><br>  `optional FilterIntInCondition    status_in                      =` `4``;` `// ref: VoucherStatus, filter out deleted vouchers if not needed`<br><br>  `optional FilterIntInCondition    market_type_in                 =` `5``;`<br><br>  `optional FilterIntRangeCondition usage_start_time_range         =` `6``;`<br><br>  `optional FilterIntRangeCondition usage_end_time_range           =` `7``;`<br><br>  `optional FilterIntRangeCondition create_time_range              =` `8``;`<br><br>  `optional FilterStringCondition   group                          =` `9``;`<br><br>  `optional FilterIntInCondition    shop_id_in                     =` `10``;` `// this field is for the shopid in voucher level, not in product rule level`<br><br>`}`<br><br>`message FilterIntInCondition {`<br><br>  `repeated int64 in_values     =` `1``;`<br><br>  `repeated int64 not_in_values =` `2``;`<br><br>`}`<br><br>`message PaginationRequest {`<br><br>  `optional uint32 page_limit =` `1``;`<br><br>  `optional string cursor     =` `2``;`<br><br>`}`<br><br>`//Response:`<br><br>`message ListVouchersWithConditionResponse {`<br><br>  `optional ResponseMeta       resp_meta  =` `1``;`<br><br>  `repeated int64              vouchers   =` `2``;`<br><br>  `optional PaginationResponse pagination =` `3``;`<br><br>`}`<br><br>`message PaginationResponse {`<br><br>  `optional string prev_cursor =` `1``;`<br><br>  `optional string next_cursor =` `2``;`<br><br>  `optional int64  total_size  =` `3``;`<br><br>`}`|

### 4.3.3. Migrating voucher.core.get_global_voucher_list to ss.business

Previously the API was used to get global voucher list for MP business domain, because we have exist API [voucher.mp](http://voucher.mp/).management.list_non_expired_global_user_vouchers in voucher.mp.management that FCST side can directly use this API to get global vouchers.

#### 4.3.3.1. Flow

Changes:

1. FCST directly calls voucher.mp.management.list_non_expired_global_user_vouchers API in ss.business in the flow of the new API.

#### 4.3.3.2. API Definition

##### 4.3.3.2.1. [voucher.mp](http://voucher.mp/).management.list_non_expired_global_user_vouchers

|   |
|---|
|`//    voucher.mp.management.list_non_expired_global_user_vouchers(ListNonExpiredGlobalUserVouchersRequest,ListNonExpiredGlobalUserVouchersResponse)`  <br><br>`//Request:`<br><br>`message ListNonExpiredGlobalUserVouchersRequest {`<br><br>    `optional RequestMeta req_meta =` `1``;`<br><br>`}`<br><br>`//Response`<br><br>`message ListNonExpiredGlobalUserVouchersResponse {`<br><br>    `optional ResponseMeta resp_meta =` `1``;`<br><br>    `repeated GlobalUserVoucher global_user_vouchers =` `2``;`<br><br>`}`<br><br>`message GlobalUserVoucher {`<br><br>    `optional int64 voucher_id =` `1``;`<br><br>    `optional string voucher_code =` `2``;`<br><br>    `optional string region =` `3``;`<br><br>    `optional uint32 use_type =` `4``;` `// Constant.UseType`<br><br>    `optional uint32 reward_type =` `5``;` `// Constant.VoucherRewardType`<br><br>    `optional uint32 business_domain =` `6``;` `// Constant.BusinessDomain`<br><br>    `optional int64 owner_id =` `7``;`<br><br>    `optional int64 create_time =` `8``;`<br><br>    `optional int64 start_time =` `9``;`<br><br>    `optional int64 end_time =` `10``;`<br><br>`}`|

## 4.4. Shadow & normal data comparison

In this part, I will add more params in metrics under `voucher.ss.query`  API to get more details about the monitor of shadow traffic.

### 4.4.1. Flow

Changes:

1. Parse reward_type from exist voucher entity before report metrics.
2. Fill the reward_type value of metrics, and fill the voucher_type(platform_voucher, shop_voucher).

### 4.4.2. Definition

We can refer to the below enum definition for the value of reward_type and voucher_type.

|   |
|---|
|`enum` `VoucherRewardType {`<br><br>     `REWARD_TYPE_DISCOUNT =` `0``;`<br><br>     `REWARD_TYPE_COIN_CASHBACK =` `1``;`<br><br>     `REWARD_TYPE_FREE_SHIPPING =` `2``;`<br><br>     `REWARD_TYPE_PREPAID_CASHBACK =` `3``;` `// prepaid, cashback (actual money)`<br><br>     `REWARD_TYPE_PREPAID_COIN_CASHBACK =` `4``;` `// prepaid, coin-cashback (shopee coins)`<br><br>     `REWARD_TYPE_PREPAID_DISCOUNT =` `5``;` `// prepaid, discount`<br><br>     `REWARD_TYPE_SHIPPING_FEE =` `6``;`<br><br>     `REWARD_TYPE_ADMIN_FEE_DISCOUNT =` `7``;`<br><br>     `REWARD_TYPE_INTEREST_RATE_FEE_DISCOUNT =` `8``;`<br><br>     `REWARD_TYPE_REPAYMENT_DISCOUNT =` `9``;`<br><br>     `REWARD_TYPE_MONEY_CASHBACK =` `10``;`<br><br>     `REWARD_TYPE_ATTESTATION_FEE_DISCOUNT =` `11``;`<br><br>     `REWARD_TYPE_WAKALAH_FEE_DISCOUNT =` `12``;`<br><br>     `REWARD_TYPE_LAST_INSTALLMENT_FEE_DISCOUNT =` `13``;`<br><br>     `REWARD_TYPE_FIXED_INTEREST_RATE =` `14``;`<br><br> `}`<br><br>`enum` `VoucherType {`<br><br>   `PLATFORM_VOUCHER =` `0``;`<br><br>   `SHOP_VOUCHER =` `1``;`<br><br>`}`|

  

## 4.5. Shadow data expiration management

Only need to change `expiration_secs`  under shadow key of the the config `user_voucher_kv_config` below under voucher.uservoucher service.

As discussed, we will keep the 90 days expiration config. And we will provide an API to delete dispatched voucher, the flow is like below:

### 4.5.1. Flow

**TODO: should deep read the consumer code of taskv2 during dev, it is a bit complex**

### 4.5.2. API Definition

|   |
|---|
|`//  voucher.taskv2.submit_stream_task_v2(SubmitStreamTaskV2Request, SubmitStreamTaskV2Response)`<br><br>`//`<br><br>`//Request:`<br><br>`message SubmitStreamTaskV2Request {`<br><br>    `optional RequestMeta req_meta =` `1``;`<br><br>    `optional string task_name =` `2``;`<br><br>    `optional int64 request_time =` `3``;`<br><br>    `optional ExpireUserVouchersByStreamTaskPayload expire_user_vouchers_payload =` `4``;`<br><br>`*   optional ArchiveUserVouchersByStreamTaskPayload archive_user_vouchers_payload =` `5``;` `//Pass this field to archive voucher`<br><br>    `optional DispatchVoucherByStreamTaskPayload dispatch_voucher_playload =` `6``;`<br><br>`}`<br><br>`message DispatchVoucherByStreamTaskPayload {`<br><br>    `repeated int64 voucher_ids =` `1``;`<br><br>    `optional int64 user_id =` `2``;`<br><br>    `optional uint32 business_domain =` `3``;`<br><br>    `optional bytes callback_payload =` `4``;` `// for callback usage`<br><br>`}`  <br><br>`message ExpireUserVouchersByStreamTaskPayload {`<br><br>    `repeated ExpiredUserVoucher expired_user_vouchers =` `1``;`<br><br>    `optional bool dry_run =` `2``;`<br><br>`}`<br><br>`message ExpiredUserVoucher {`<br><br>    `optional UserVoucherIdentifier identifier =` `1``;` `// required`<br><br>    `optional int64 usage_start_time =` `2``;` `// required`<br><br>    `optional int64 usage_end_time =` `3``;` `// required`<br><br>`}`<br><br>`message ArchiveUserVouchersByStreamTaskPayload {`<br><br>    `repeated UserVoucherIdentifier user_voucher_identifiers =` `1``;`<br><br>    `optional bool dry_run =` `2``;`<br><br>`}`<br><br>`message UserVoucherIdentifier {`<br><br>    `optional int64 user_id =` `1``;`<br><br>    `optional VoucherIdentifier voucher_identifier =` `2``;` `// only one of voucher_identifier or user_voucher_id could be filled`<br><br>    `optional int64 user_voucher_id =` `3``;` `// only one of voucher_identifier or user_voucher_id could be filled`<br><br>`}`<br><br>`//Response:`<br><br>`message SubmitStreamTaskV2Response {`<br><br>    `optional ResponseMeta resp_meta =` `1``;`<br><br>`}`|

## 4.6. Increase Dispatch Voucher QPS in Shadow

Can refer the the solution of  chapter 3.1.2, will have a shadow config for it.

  

# 5. Work Break

## 5.1. Service Checklist

|Service Name|TODO|Effort|
|---|---|---|
|voucher.ss.distribution|Add shadow traffic rate limiter config|1d|
|voucher.ss.business|Add new api migrating from voucher.core|1d|
|integration with upstream batch_duplicate APIs|2d|
|voucher.uservoucher|Add shadow traffic rate limiter config|1d|
|voucher.taskv2|Add task-based shadow rate limit config|1d|
|voucher.mp.management|Add new api for the migration of voucher.core APIs|0.5d|
|Total|   |6d|

## 5.2. Config Change

|Config Key|Service|
|---|---|
|resilience_interceptor|voucher.ss.distribution|
|multi_key_rate_limit_v2|
|rate_limit|
|user_voucher_kv_config|voucher.uservoucher|
|default_rate_limit|
|resilience|
|api_migration|voucher.taskv2|
|task_config|
|redis_based_rate_limiter|
|global_redis_based_rate_limiter|

## 5.3. Task Split

| Task                                                                 | Involve services                                                             | sub task                                                              | PIC                                                                          | Effort |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| API migration from voucher.core to voucher.ss.business               | voucher.ss.business                                                          | voucher.core.batch_duplicate_shadow_promotion, refer to chapter 4.3.1 | [yu.jin@shopee.com](https://confluence.shopee.io/display/~yu.jin@shopee.com) | 2d     |
| voucher.core.get_promotion_list_by_list_type, refer to chapter 4.3.2 | [yu.jin@shopee.com](https://confluence.shopee.io/display/~yu.jin@shopee.com) | 1d                                                                    |                                                                              |        |
|                                                                      |                                                                              |                                                                       |                                                                              |        |
| support task-based shadow rate limit config for voucher.taskv2       | voucher.taskv2                                                               | refer to 4.2                                                          | [yu.jin@shopee.com](https://confluence.shopee.io/display/~yu.jin@shopee.com) | 2d     |
| Add shadow config for rate limiter and resilience                    | voucher-common,<br><br>voucher-ss-distribution,<br><br>voucher-uservoucher   | voucher-uservoucher, refer to 4.1.2                                   | [Hu Tianran](https://confluence.shopee.io/display/~tianran.hu@shopee.com)    | 1d     |
| voucher-ss-distribution, refer to 4.1.1                              |                                                                              |                                                                       |                                                                              |        |