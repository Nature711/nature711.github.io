---
title:
draft: true
tags:
date:
---
Proto file defines the interface / contract

and it's managed separately from business logic code

so that the other projects that depend on this interface

can pull it and work on it

even if the actual "implementation" is not provided yet

this feature, together with PFB 

allows dev to work more efficiently & non-blocking on multiple features / versions

wanna know what's the best practice 

---
## Steps for publishing a proto file

### Create a new topic in service mesh

create a topic in Service CMDB --> Service Mesh (Spex) --> Spex proto

change api namespace (usually the shorter one)

create a new topic, e.g., named "feature-1-pb"

### Publish pb to that topic

after that under the same path as where `sp-workspace.yml` is defined -- 

execute `spcli proto publish <topic-name> <path-to-proto-file-to-be-published>` 

- path is relative to the `sp-workspace.yml` file
- e.g., `sp_proto/voucher/ss/business.proto`

### In the other repo (that use this new pb), pull the change

which pb to use is defined in `sp-workspace.yml`

```yml
protocol:

# root directory for the source code of protocols.
source_dir: "./sp_proto"

# root directory for generated code.
generated_dir: "../../internal/proto/spex/gen"

...
# dependencies: please maintain alphabetical order
dep:
- name: "account.address"
  topic_name: "master"
  ...
- name: "the.one.you.care.about"
  topic_name: "the topic name you just defined" -- change this 
```

> later after we merge the other repo's changes to master, need to update here as well


## What's Actually Happening Here

```
┌─────────────────┐         ┌──────────────────┐        ┌─────────────────┐
│   Service A      │         │   Service Mesh    │        │   Service B      │
│  (implements)    │──pub──▶ │  (Spex / CMDB)   │◀──sub──│  (consumes)      │
│                  │         │                   │        │                  │
│  business.proto  │         │  topic: feat-1-pb │        │  sp-workspace.yml│
└─────────────────┘         └──────────────────┘        └─────────────────┘
```

The proto file acts as a **shared contract** — Service B can code against it before Service A even finishes implementing it. That's the non-blocking benefit you mentioned.

---

## The Full Lifecycle (Best Practices)

### 1. 🏗️ Design the contract first, before writing logic

Before touching any business code, think through:

- What **fields** does this message need?
- What **RPCs** (remote procedure calls) are exposed?
- What's the **namespace** — keep it short, consistent, and domain-scoped

```proto
// Good namespace: voucher.ss  ✅
// Bad namespace:  com.company.services.voucher.subsystem  ❌ (too verbose)

syntax = "proto3";
package voucher.ss;

message RedeemRequest {
  string voucher_code = 1;
  string user_id = 2;
}

message RedeemResponse {
  bool success = 1;
  string message = 2;
}

service VoucherService {
  rpc Redeem(RedeemRequest) returns (RedeemResponse);
}
```

---

### 2. 📛 Naming your topic well

The topic name matters because **other teams reference it by name**. Keep it:

|Practice|Example|Why|
|---|---|---|
|Feature-scoped|`voucher-redeem-v2`|Clear what it's for|
|Versioned when breaking|`voucher-redeem-v2`|Avoids breaking consumers|
|Avoid generic names|~~`feature-1-pb`~~|Too vague, hard to trace later|

---

### 3. 🔁 The Two-Phase Topic Strategy (the key insight)

This is where most people get confused. There are **two phases**:

**Phase 1 — Development (use a feature topic)**

```yaml
dep:
  - name: "voucher.ss.business"
    topic_name: "voucher-redeem-v2"   # ← your feature topic
```

Both teams work against this. Service B codes against the contract. Service A implements it. Neither is blocked.

**Phase 2 — After merge to master (switch to master topic)**

```yaml
dep:
  - name: "voucher.ss.business"
    topic_name: "master"              # ← stable, released
```

Once Service A merges and the proto is stable, consumers should point to `master`. The feature topic becomes stale.

> ⚠️ **Common mistake**: Forgetting Phase 2. Teams leave `topic_name: "feature-xyz"` in production configs, which means they're depending on a topic that might get deleted or drift.

---

### 4. 🧱 Proto field rules (avoid breaking consumers)

Once a proto is published and consumed, treat it like a **public API**. Breaking changes silently break other services.

|Action|Safe?|Notes|
|---|---|---|
|Add a new field|✅ Yes|Proto3 ignores unknown fields|
|Rename a field|❌ No|Field names matter in JSON; numbers matter in binary|
|Delete a field|❌ No|Reserve the number instead|
|Change a field type|❌ No|Binary format breaks|
|Add a new RPC|✅ Yes|Additive, non-breaking|

**If you need a breaking change → bump the version:**

```proto
package voucher.ss.v2;   // new package, new topic, clean slate
```

---

### 5. 📦 What to keep in the proto repo / file

```
sp_proto/
└── voucher/
    └── ss/
        ├── business.proto      ✅ domain messages & services
        ├── common.proto        ✅ shared types (enums, pagination, etc.)
        └── internal.proto      ❌ avoid — "internal" in a shared contract is a red flag
```

Keep proto files **thin** — they define shape, not behavior. No business logic lives here.

---

### 6. 🔄 Full workflow summary

```
1. Design proto  →  review with consuming team  →  agree on contract
2. Create topic in Spex (feature-scoped name)
3. Publish:  spcli proto publish <topic> <path>
4. Consumer updates sp-workspace.yml → topic_name: "your-feature-topic"
5. Both teams develop in parallel  🚀
6. Service A merges to master
7. Re-publish proto to "master" topic
8. Consumer updates sp-workspace.yml → topic_name: "master"
9. Retire the feature topic
```

---

## Quick Mental Model

Think of it like **npm packages**:

- The **proto file** = your package's TypeScript types/interface
- The **topic** = a version tag (`beta`, `latest`, `v2.0.0`)
- `sp-workspace.yml` = your `package.json` dependencies
- `spcli proto publish` = `npm publish`

You'd never keep `"mypackage": "beta"` in your production `package.json` forever — same idea here.
