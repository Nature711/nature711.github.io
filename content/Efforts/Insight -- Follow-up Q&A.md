---
title:
draft: false
tags:
date: 2025-11-12
---
### **1. How It Works (30 seconds)**

> "I inject a timestamp into the gRPC request. The target service calculates end-to-end latency by comparing my timestamp with its current time. For per-hop breakdown, I extract metadata from the context—the framework automatically records timing at each layer like Gateway and service entry. I subtract these to isolate network, Gateway, and service latency."

---

### **2. Technical Implementation (1 minute)**

> "The CrossPing handler sends a request with `NowMs` timestamp to a target region via Mediary. The Ping handler receives it, calculates `elapsed = now - NowMs` for total latency.
> 
> For hop-level data, Takumi propagates context through gRPC metadata. I extract: Gateway processing time from `body_read_elapsed`, service start time from `ctxhelper.StartTime`, and caller info from `GetRPCClientInfo`.
> 
> Subtracting service and Gateway time from total gives me network and Mediary latency. All metrics export to Prometheus."

---

### **3. Key Design Points**

| Question                           | Quick Answer                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| **How do you inject timing?**      | "Timestamp field in protobuf request, calculated at both ends"                                |
| **How do you get hop data?**       | "Extract from context metadata—framework propagates it automatically"                         |
| **What if Gateway is missing?**    | "Check if metadata exists, if not it was direct gRPC—handle gracefully"                       |
| **Clock skew issues?**             | "Currently measuring from sender's perspective. Could add NTP sync or server-side timestamps" |
| **How do you route cross-region?** | "Two modes: static Mediary address or dynamic Zest lookup by zone/env"                        |

---

### **4. What You Built vs Framework**

**You built:**

- Timestamp injection logic
- Latency calculation
- Context extraction and aggregation
- Cross-region routing configuration
- Metrics design

**Framework provided:**

- Context propagation
- Service discovery
- Connection pooling
- Metrics SDK
- Logging

---

### **5. One-Liner for Each Part**

**End-to-end latency:** "Inject timestamp in request, target calculates difference"

**Per-hop latency:** "Extract timing metadata from propagated context, subtract to isolate each layer"

**Cross-region routing:** "Configure target zone/env, framework routes through Mediary"

**Service discovery:** "Static addresses or dynamic Zest config lookup"

----

### **Q: "How does context propagation work?"**

**Bad answer:** "The framework does it automatically."

**Good answer:**

> "Context propagation uses Go's native `context.Context`, which is a standard pattern for passing request-scoped data through function calls.
> 
> **What's native Go:** The `context.Context` type and the ability to attach values to it.
> 
> **What Takumi adds:** Automatic injection of request metadata (request ID, caller info, timestamps) into the context when a request enters the service. Takumi also ensures this context is propagated through gRPC metadata when making outbound calls.
> 
> **My code:** I use Takumi's `ctxhelper` functions to **extract** this data. For example, `ctxhelper.GetRPCClientInfo(ctx)` pulls out which service/region called me. I also **inject** my own timing data by adding the `NowMs` field to the request protobuf."

---

### **Q: "How do you measure hop-level latency?"**

**Good answer:**

> "I use a combination of **injected timestamps** and **framework-provided metadata**:
> 
> **For end-to-end latency:** I inject a start timestamp (`NowMs`) in the request, and the target service calculates the difference with its current time. This is basic Go time arithmetic.
> 
> **For hop-level breakdown:** Takumi automatically records timing at each layer:
> 
> - `ctxhelper.StartTime(ctx)` tells me when the request entered the service (framework records this)
> - `ctxhelper.GetRPCMeta(ctx, "body_read_elapsed")` gives me Gateway processing time (Gateway adds this to context)
> - I subtract these to isolate network/Mediary latency
> 
> The framework handles propagating this metadata through the infrastructure. My code extracts and aggregates it."

---

### **Q: "Could you build this without Takumi?"**

**Honest answer:**

> "Yes, but it would take significantly more time. I'd need to:
> 
> - Manually implement service discovery (integrate with Consul SDK directly)
> - Handle connection pooling and circuit breaking
> - Add gRPC interceptors to inject/extract context metadata
> - Integrate Prometheus client library directly
> - Build config management and reload logic
> - Implement graceful shutdown handling
> 
> Takumi gave me all of this out-of-the-box, so I spent my time on the **monitoring logic** rather than infrastructure plumbing. This is the value of internal frameworks—they standardize the platform layer so teams can focus on business logic.
> 
> **That said, the core concepts are portable:** Context propagation, gRPC, Prometheus, service discovery are all standard patterns. If I were to build a similar system elsewhere, I'd use:
> 
> - Go's `context` package
> - `grpc-go` for communication
> - Prometheus Go client
> - Consul client library or a different service mesh
> - Open-source frameworks like `go-kit` or `kratos` for similar abstractions"

---

### **Q: "This sounds like you just called framework APIs. What did YOU actually build?"**

**Strong answer:**

> "Great question. Here's what I designed and implemented:
> 
> **1. The monitoring architecture:**
> 
> - Designed the ping-pong pattern (request/response with timing)
> - Decided what data to collect (latency, hops, metadata)
> - Architected same-region vs cross-region flows
> 
> **2. The timing mechanism:**
> 
> - Implemented timestamp injection in requests
> - Designed latency calculation logic
> - Handled clock skew considerations
> 
> **3. Context data extraction:**
> 
> - Designed the `ComprehensiveContextInfo` structure
> - Wrote logic to extract and aggregate metadata from multiple sources (RPC info, Gateway info, performance metrics)
> - Implemented hop-level latency isolation
> 
> **4. Integration logic:**
> 
> - Configured cross-region routing (Zone/Env targeting)
> - Handled two discovery modes (static Mediary vs dynamic Zest)
> - Implemented error handling and logging
> 
> **5. Metrics design:**
> 
> - Decided what to measure (ping success rate, latency percentiles)
> - When to emit metrics
> 
> The framework gave me the tools (client library, context helpers, metrics SDK), but I wrote the **business logic, data models, and orchestration**. It's like using AWS SDK—I'm still responsible for the application logic even though I'm not implementing TCP myself."