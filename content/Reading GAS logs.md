---
title:
draft: true
tags:
date:
---
```bash
SIPSS0507@GM7PQRCMFP voucher-ss-distribution % ./bin/api
2026/02/16 11:55:22.904052 orchestrator.go:129: STARTING MODULE: 0
         ________
  (     /  _____/_____    ______       (      Engine    v1.8.8
  )\ ) /   \  ___\__  \  /  ___/  (    )\ )   Module    mod/api
 (()/( \    \_\  \/ /\ \_\___ \   )\  (()/()  Revision  localhost
((/(_)) \______  (____  /___  / ((_)( /(_))_) Docs      https://gas.shopee.io
===============\/=====\/====\/=============== Support   https://space.shopee.io/api/utility/seatalk/group/invite/722532201692329279

2026-02-16T11:55:23.531+0800    info    ipds-sdk-go/grpc        grpc/grpc_resolver.go:110       successfully connect to ipds
02/16 11:55:22.919107+08 INFO  lg.go:196                        internal.initFallbackLogger| tlog initialized, tlog_cfg={"min_level":"INFO","output":"/dev/stdout"}
02/16 11:55:22.919160+08 INFO  lg.go:76                            internal.initLocalLogger| local log config not found, initialized default std logger/tlog
02/16 11:55:22.919461+08 INFO  run.go:491                    internal.reportUsedConfigFiles| initializing with local config, files=["/Users/SIPSS0507/Developer/work/voucher/voucher-ss-distribution/etc/api.yml"]
02/16 11:55:22.925100+08 INFO  agent.go:240                                    sps.NewAgent| agent_created, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, opts={instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d,config_key=6bc2c0a5ca4c****************************************************,service_key=,concurrency=0,queue_timeout=0s,serve_timeout=0s,panic_propagation=true,aegis=false,rpc_metrics=true,max_receive_size=16777216,max_send_size=16777216,debug_queue_cost=0s}, version=v1.2.12 (Go)
02/16 11:55:22.926731+08 INFO  agent.go:756                               sps.(*agent).dial| dial_successfully, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, spex_network=unix, spex_address=/tmp/spex.sock
02/16 11:55:23.097369+08 INFO  default.go:63                             splog.handleStdLog|  info pusher info is blank, wait for getting pusher infometric_type="biz_metric"
02/16 11:55:23.097414+08 INFO  default.go:63                             splog.handleStdLog|  info push metric              push_gateway=https://monitoring-ssc.sz.shopee.io/vmagent/328,metric_type="rpc_metric"
02/16 11:55:23.122598+08 INFO  agent.go:970      sps.(*agent).subscribeConfigFromSpexLocked| subscribe_config_from_spex_successfully, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, config_key=6bc2c0a5ca4c****************************************************, req=instance_id:"voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d" config_key:"6bc2c0a5ca4c29910f8feb7557bfffcfe7428b4703144bd6d7fe5b3f5de74891" service_id:"" service_name:"voucher.ssdistributionapi" labels:<name:"pfb" values:"tianran-test" > labels:<name:"region" values:"id" > labels:<name:"env" values:"test" > labels:<name:"tag" values:"master" > labels:<name:"sdu_id" values:"default" > 
02/16 11:55:23.124744+08 INFO  cfgreg.go:229             sps.(*configRegistry).updateLocked| update_configs, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, cfgreg=0xc000674780, configs=version: 0, keys: [gas.spex.client rate_limit_rules gas.cache multi_key_rate_limit rate_limit dlock gas.spex.server gas.shark gas.log sp.runtime_control feature_toggle multi_key_rate_limit_v2 resilience_interceptor sp.service_info]
02/16 11:55:23.128385+08 INFO  agent.go:1116               sps.(*agent).updateControlConfig| control_config_updated, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, control_config={"monitor":{"enable":true},"inproc_call_configs":{"cmds":{},"service":{"percentage":0}},"aegis":{"enable":false}}
02/16 11:55:23.128402+08 INFO  api.go:156                     config.(*Registry).enableSpex| config: spex config enabled
02/16 11:55:23.128867+08 INFO  api.go:165             config.(*Registry).enableCcNamespaces| config: config center is not enabled due to empty config
02/16 11:55:23.133041+08 INFO  lg.go:241                          internal.initRemoteLogger| default ulog logger switched to remote config
02/16 11:55:23.581438+08 ERROR cfgreg.go:115                      sps.(*configRegistry).Get| fail_to_get_config, agent=0xc000e8c300, instance_id=voucher.ssdistributionapi.id.test.master.default.e3416e17279c4ababaed56272319413d, cfgreg=0xc000674780, key=api_setting, error.object=config not found
```

---
## 1) Banner + module start: “what binary am I running?”

```
orchestrator.go:129: STARTING MODULE: 0
Engine v1.8.8  Module mod/api  Revision localhost
```

**What it means**

- GAS has a module orchestrator: it loads module(s) (often `mod/api`) and starts them in order.
    
- `Engine v1.8.8` is your GAS runtime version.
    
- `Revision localhost` typically means you’re running locally (not a CI-injected git SHA).
    

**What to note**

- If you see the wrong module name/version, you might be running the wrong binary or wrong build output.
    
- If startup dies before any config lines appear, it’s often a crash during module init or wiring (DI / init order).
    

---

## 2) Early dependency: “I can reach basic infra service(s)”

```
ipds-sdk-go/grpc ... successfully connect to ipds
```

**What it means**

- Something in the stack initializes and connects to IPDS (internal discovery / data service in many setups).
    

**If it fails**

- You’ll usually see DNS / TLS / auth / dial timeout errors here.
    
- Fix is usually environment/network/VPN/credentials rather than business code.
    

---

## 3) Logger init: “where will logs go, and at what level?”

```
tlog initialized, min_level=INFO, output=/dev/stdout
local log config not found, initialized default std logger/tlog
```

**What it means**

- GAS first brings up a **fallback logger** so you still get logs before remote config arrives.
    
- It didn’t find local log config, so it uses defaults.
    

**What to note**

- Early-stage “why don’t I see debug logs?” is often just `min_level=INFO`.
    
- Later you might see “switched to remote config” (you do) → meaning log level/format can change mid-run.
    

---

## 4) Config file source: “what configs did I load (and from where)?”

```
initializing with local config, files=[".../etc/api.yml"]
```

**What it means**

- GAS is loading **local YAML** as the initial config source.
    

**What to note**

- This line is your first checkpoint for “am I using the correct config file”.
    
- If you run with flags (like `--gas.config`), this is where you confirm it worked.
    

---

## 5) SPEX agent created + SPEX transport: “how do I talk on the service mesh?”

```
agent_created ... instance_id=... opts={... rpc_metrics=true ...}
dial_successfully ... spex_network=unix, spex_address=/tmp/spex.sock
```

**What it means**

- A **SPEX agent** is created (client/server glue).
    
- Locally it’s using **unix domain socket** (`/tmp/spex.sock`) rather than TCP.
    

**What to note**

- `instance_id` is important: it encodes service name + region + env + tag, and is used for config subscription / routing / metrics labels.
    
- If dial fails:
    
    - `/tmp/spex.sock` missing/permission issues
        
    - SPEX runtime not available / not bootstrapped correctly
        
    - local environment misconfigured
        

---

## 6) Metrics push: “will my metrics show up somewhere?”

```
pusher info is blank ... metric_type="biz_metric"
push_gateway=https://... metric_type="rpc_metric"
```

**What it means**

- It’s attempting to set up metric exporters.
    
- It has a push gateway for rpc metrics; biz metrics pusher info is blank (common locally).
    

**What to note**

- This is often not fatal locally, but it explains “why I don’t see biz metrics”.
    
- If metrics misbehave in test env, this section is a good early clue.
    

---

## 7) Subscribe configs from SPEX + config keys loaded: “what config domains exist?”

```
subscribe_config_from_spex_successfully ... labels: pfb/region/env/tag/sdu_id
update_configs ... keys: [gas.spex.client rate_limit_rules gas.cache ... resilience_interceptor ...]
control_config_updated ... {"monitor":{"enable":true} ...}
config: spex config enabled
config center is not enabled due to empty config
```

**What it means**

- Your process subscribes configuration via SPEX (mesh config).
    
- You got a set of config “documents” / namespaces, listed as **keys**.
    
- “control config” toggles runtime controls (monitoring, in-proc calls, etc.).
    
- “spex config enabled” → it will read configs that are shipped via spex config.
    
- “config center not enabled due to empty config” → separate “Config Center” integration is not configured (not necessarily a problem locally).
    

**What to note (very relevant to your work on shadow isolation)**

- Seeing keys like `rate_limit`, `multi_key_rate_limit_v2`, `resilience_interceptor` is basically confirming the service is wired to read those configs (that’s exactly the stuff you were editing for shadow traffic isolation).
    
- If a config key you expect is missing, you’re either:
    
    - not subscribing to the right namespace/module,
        
    - or your SPEX service config doesn’t contain it,
        
    - or your local env labels (region/env/tag) don’t match where you stored config.
        

---

## 8) Switch to remote logger: “runtime config took effect”

```
default ulog logger switched to remote config
```

**What it means**

- Logging config is now controlled by remote/spex-delivered config.
    

**What to watch out for**

- Log level suddenly changes (debug disappears / appears).
    
- Format changes (fields/JSON differences).
    
- If your logs become “too quiet”, check remote log config.
    

---

## 9) The error at the end: “something tried to read a config key that doesn’t exist”

```
ERROR ... Get| fail_to_get_config ... key=api_setting, error.object=config not found
```

**What it likely means**

- Some component called `cfgreg.Get("api_setting")` (or similar) and that key wasn’t present in the subscribed config set.
    

**How to interpret severity**

- **Not necessarily fatal**. Startup might continue if the code treats it as optional / falls back to defaults.
    
- It _is_ a red flag if later your handlers assume `api_setting` exists → then you’ll see runtime misbehavior.
    

**What to do (fast triage)**

- Search your repo for `api_setting`:
    
    - Is it required? (e.g., server port, feature toggle, auth settings)
        
    - Is there a documented default?
        
- If it’s required, add it into the right config source (likely SPEX service config).
    
- If it’s optional, consider downgrading to warn or handling “not found” cleanly.
    

---

## A “what to expect later” mental model (when issues happen)

When a GAS service fails, it usually fails in one of these phases. You can map the log to the phase instantly:

1. **Process boot / module init**
    

- Symptoms: crash before “initializing with local config”
    
- Likely: DI/init panic, missing env vars, bad build.
    

2. **Config load / subscription**
    

- Symptoms: “subscribe_config…” fails or missing keys
    
- Likely: wrong env/region/tag labels, wrong namespace, missing config in spex config.
    

3. **Network / service mesh connectivity**
    

- Symptoms: dial failure to `/tmp/spex.sock` or grpc dial errors
    
- Likely: local mesh runtime issues, permissions, network/VPN.
    

4. **Middleware init (DB/Redis)**
    

- Often appears a bit later than your snippet.
    
- Symptoms: “connect db failed”, “redis auth failed”, timeouts.
    
- Likely: wrong DSN/credentials, security group, local not on VPN.
    

5. **Observability wiring**
    

- Symptoms: push gateway errors, exporter errors.
    
- Usually non-fatal but explains missing dashboards.
    

---

## Practical “startup log checklist” (what you should always scan)

- **Config file path**: am I loading the right `etc/*.yml`?
    
- **instance_id labels**: region/env/tag correct? (these decide what config you get)
    
- **SPEX dial success**: if it can’t dial, you’re dead in the water.
    
- **Config keys list**: do you see the config families you expect (rate_limit, resilience, feature_toggle, etc.)?
    
- **First error**: is it “not found config” (usually config mismatch) vs “dial timeout” (network) vs “panic” (code)?