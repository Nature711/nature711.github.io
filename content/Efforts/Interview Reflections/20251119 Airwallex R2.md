---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-11-19
---
### **Block A — Core Architecture**

- What is the core architecture of your KV store?  
    (Leader-based? Leaderless? Log replication?)
    
- How do reads work?
    
- How do writes work?
    

---

### **Block B — Consistency**

- How does your system ensure strong consistency?
    
- Why Raft over Paxos?
    
- What parts of Raft did you implement (or conceptually understand)?
    

---

### **Block C — Replication & Fault Tolerance**

- How many replicas do you maintain?
    
- What happens when the leader fails?
    
- What if followers lag behind?
    

---

### **Block D — Sharding / Partitioning**

- How do you decide which node stores which keys?
    
- How to rebalance shards when scaling out?
    
- What do you do about hot keys?
    

---

### **Block E — Multi-Region**

- How do you achieve low-latency reads across regions?
    
- How to choose consistency model across regions?
    

---

### **Block F — Failures**

Classic ones companies test:

- Network partitions
    
- Split brain
    
- Slow leader
    
- Majority unavailable
    
- Disk failure
    
- Node crash during write
    

---

### **Block G — Performance**

- How to increase QPS?
    
- How to reduce tail latency (p99)?
    
- Caching layers?
    
- Batch writes?
    
- Write buffering?
    

---

### **Block H — Operational Aspects**

- How to rollout safely?
    
- How to handle schema or key migration?
    
- How to add/remove nodes automatically?