---
title:
draft: false
tags:
date: 2025-11-16
---
# PART 1 — FOUNDATIONAL CONCEPTS

(Review these first to anchor your thinking.)

## **Module 1 — RPC & Exactly-Once Semantics**

### **Goal:** Recover how your KV store communicated between nodes.

### **Questions to guide your memory:**

1. How did your RPC layer identify each request?
    
    - (Client ID + Request ID? Sequence number?)
        
2. How did you handle duplicates?
    
    - (Dedup table? Return cached response?)
        
3. What made a handler _idempotent_?
    
4. What’s the difference between at-least-once and exactly-once delivery?
    
5. How did retries work in your system?
    

### **What interviewers want:**

- You understand **why exactly-once is HARD**
    
- You know how to design **idempotent handlers**
    

### **Connect to HoYoverse:**

- MM2 replication must handle duplicates & retries
    
- Prometheus scrapes retry → idempotent metrics
    
- YACE exporter uses pull semantics → idempotent
    
- Takumi handlers must be deterministic
    

### **Your takeaway line:**

> “This taught me to think about message IDs, retries, idempotency — the same patterns I used later in MM2 replication debugging and Prometheus exporters.”

---

## **Module 2 — Replication & Primary–Backup**

### **Questions to guide your memory:**

1. How did you propagate writes from primary to backup?
    
2. Did you use synchronous or asynchronous replication? Why?
    
3. What happened when the primary crashed?
    
4. How did you prevent two primaries from existing (split-brain)?
    
5. How did clients know which server was the primary?
    

### **Interviewers want:**

- Understanding of **failover**, **replication delay**, **consistency vs availability**
    

### **Connect to HoYoverse:**

- Kafka MirrorMaker replication topology
    
- Prometheus remote write (replication factor)
    
- Nginx whitelist proxies: failover paths
    
- Network exporter: cross-AZ redundancy
    

### **Your takeaway line:**

> “This helped me reason about failover, replication ordering, and preventing split-brain — which became very useful when working with Kafka MM2 and cross-region monitoring.”

---

# PART 2 — CONSENSUS (PAXOS)

(Your biggest differentiator in interviews.)

## **Module 3 — Paxos Basics**

### **Questions to guide your memory:**

1. What problem does Paxos solve?  
    (Replicated log / choosing a single value across nodes)
    
2. What are proposal numbers?
    
3. What is majority quorum?
    
4. How do nodes respond to a “Prepare” message?
    
5. Why does Paxos guarantee safety even if messages reorder?
    

### **Interviewers want:**

- Can you explain Paxos “at the right level”?  
    → Not too academic, not too shallow.
    

### **Connect to HoYoverse:**

- Kafka replication = log replication
    
- Prometheus HA mode = similar “choose a leader” ideas
    
- MM2 offset sync = consistent progress
    
- Portal deployments = avoiding split brain across regions
    

### **Your takeaway line:**

> “Paxos gave me the mental model of consensus, replicated logs, and quorum, which I now naturally apply when thinking about Kafka replication, Prometheus HA, or multi-region consistency issues.”

---

## **Module 4 — Replicated State Machine (Log)**

### **Questions:**

1. How does Paxos ensure all nodes apply the _same sequence_ of operations?
    
2. Why must handlers be deterministic?
    
3. What happens when a node restarts — how does it catch up?
    
4. How does log indexing work?
    
5. How do you prevent divergent logs?
    

### **Interviewers want:**

- That you understand _state machines_, not just memorized Paxos steps.
    

### **Connect to HoYoverse:**

- Observability systems rely on deterministic metric generation
    
- MM2 exactly-once offset replication is a form of state machine
    
- Zest config system requires consistent versioning
    
- Takumi services rely on deterministic handlers for correctness
    

---

# PART 3 — SHARDING & DISTRIBUTION

## **Module 5 — Sharding & Load Balancing**

### **Questions to review:**

1. How were keys assigned to shards? (Hash? Range?)
    
2. What was the shardmaster?
    
3. How did the system handle shard movement?
    
4. During migration, how did you avoid dropping requests?
    
5. What consistency guarantees did you maintain during rebalancing?
    

### **Interviewers want:**

- Understanding of resharding challenges
    
- Awareness of stale reads, partial migration, double-serving
    

### **Connect to HoYoverse:**

- Prometheus sharding (via hashmod)
    
- YACE job shards by CloudWatch regions
    
- Kafka partitioning logic
    
- MM2 replication of specific topics (topic = shard)
    

### **Your takeaway line:**

> “Implementing rebalancing and shardmasters helped me understand how real systems like Prometheus sharding or Kafka partitioning achieve load distribution.”

---

## **Module 6 — Cross-Shard Transactions (if any)**

### **Questions:**

1. How did you handle multi-key operations across shards?
    
2. Was it 2PC, Paxos-based, or logical locking?
    
3. What consistency model did your system provide?
    

Even a vague memory is fine — interviewers mainly want reasoning.

---

# PART 4 — FAILURE MODELS & RELIABILITY

## **Module 7 — Failure Handling**

### **Questions:**

1. What happens when messages arrive out of order?
    
2. What if a node comes back after a long crash?
    
3. How do you avoid processing the same request twice?
    
4. How did you guarantee safety under all message schedules (model checker)?
    
5. What’s the difference between safety and liveness?
    

### **Interviewers expect:**

- You know the core distributed systems guarantees.
    

### **Connect to HoYoverse:**

- MM2 lag = out-of-order replication
    
- Network probe = detecting partial failures
    
- Prometheus HA = avoiding double-scrape
    
- Gateway routing = avoiding stale nodes
    
- YACE exporter = dealing with API throttling failures
    

---

# PART 5 — CONNECTING THE DOTS (UNI → HOYOVERSE → INTERVIEW)

This part is crucial: the **“synthesis” narrative**.

I want you to actually say something like this during interviews:

> “My university project gave me the deep theory — exactly-once semantics, replication, consensus, sharding.  
> In my HoYoverse work, I saw the real-world side: cross-region replication, reliability, monitoring, deployment, failure analysis.  
> Now when I design or debug systems, I naturally connect the two —  
> theory tells me why something is happening,  
> real experience tells me how to fix it.”

This is a **powerful** narrative.  
It flips your insecurity into a strength.

---

# PART 6 — MASTER QUESTION LIST (for full review)

Here is your complete set of review questions (your roadmap):

### **RPC Layer**

- How did you implement exactly-once semantics?
    
- How did you handle idempotency?
    
- How did you detect duplicate requests?
    
- What retry mechanism was used?
    

### **Replication**

- How did primary–backup replication work?
    
- What was your failover strategy?
    
- Why is split-brain dangerous?
    

### **Consensus (Paxos)**

- What problem does Paxos solve?
    
- What is Prepare / Accept?
    
- What is quorum?
    
- What guarantees safety?
    
- How do nodes recover and catch up?
    

### **Replicated State Machine**

- How does log ordering work?
    
- Why must handlers be deterministic?
    
- How do you ensure every node applies operations in the same order?
    

### **Sharding**

- How were keys mapped to shards?
    
- How did the shardmaster assign shards?
    
- How did shard migration work?
    
- What problems happen during rebalancing?
    

### **Failure Models**

- How does your system behave under message loss/delay/duplication?
    
- What’s the difference between safety vs liveness?
    
- How did the model checker validate correctness?
    

### **Practical Relevance**

- How does this relate to Kafka replication?
    
- How does this relate to Prometheus sharding?
    
- How does this relate to monitoring exporters?
    
- How does this relate to Takumi RPC handlers?
    
- How does this relate to service discovery & failover?