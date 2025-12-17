---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-11-26
---
## Meta

- Company: ByteDance
- Role: [Site Reliability Engineer](https://jobs.bytedance.com/referral/pc/position/7374622806136637723/detail?token=NTsxNzYyMjM0NTA0MzMzOzc1NjA1MTY3MTQ0MTM0NDI1Njg7NzU2ODczNjc0NzU1MzE5NjI5Mzsx)
- Team: Large Model Team
- Interviewer: Elroy Haw
- Focus: Coding, Project, K8s Knowledge & Practicals

---

> [!info]- Pitch
> 
> Hi, I’m Tianran. At HoYoverse, I’ve been working in infrastructure and observability. I built a **Kafka MM2 replication and rollback platform** , a **cross-region network probe system** that monitors ICMP/TCP/MTR latency for early detection of routing issues , and a **cloud resource utilization reporting system** that integrates Prometheus, CloudWatch, YACE and PolarDB for cost and capacity insights .
> 
> One of my key school projects was building a **CUDA-based parallel virus scanner**, where I implemented GPU-accelerated pattern matching using Rabin-Karp and CUDA streams. That was my first exposure to GPU execution models, batching, and performance tuning.
> 
> I’m now looking for a role where I can go deeper into ML infrastructure at scale, and I’m excited about Bytedance because of the size of your ML platform and the strong engineering culture around performance and reliability.

---

## ## Resource Utilization Reporting System (Architecture)

**What was asked:**

- Walk through the project
- How data is collected
- Why CloudWatch exporter
- How Prometheus + DB work together
- How to scale the system

**My response:**

- Gave a clear, structured overview of the system
- Explained CloudWatch exporter usage to reduce cost
- Described ingestion → validation → storage pipeline
- Mentioned recording rules to reduce Prometheus load
- Admitted scalability is not yet designed, but system is modular
- Interviewer filled in with ideas like multi-exporter, multi-Prometheus

**What could be improved:**

- Provide concrete **horizontal scaling** plan
- Show understanding of **sharding, multi-exporter, multi-Prometheus**
- Show confidence in handling high-volume pipelines

> [!info]- Suggested Improved Answer
> “Currently it's extensible  by being modular and configuration-driven — adding new AWS accounts or services is just config, not code.
> 
> If data volume grows large, we can **scale horizontally** by:  
> - running *multiple YACE exporters* per account/region  
> - *sharding* ingestion jobs by account or service  
> - splitting Prometheus into multiple shards + federation/*Thanos*  
> - buffering raw metrics to S3 and processing with *parallel* workers
> 
> The pipeline is idempotent and batch-based, so scaling is straightforward.”

---
## Kubernetes Deployment Troubleshooting

### Pod Pending Scenario

**What was asked:**

- "Pod is Pending. How do you debug?"
    
**My response:**

- Mentioned dependency issues
- Mentioned init containers
- Checked `describe`
- Mentioned PVC issues
- Mentioned resource shortage
- Suggested node affinity (incorrectly)
	- Interviewer corrected: scheduler handles node choice
- Eventually reached correct idea: autoscale nodes
    
**What could be improved:**

- Avoid “dependency between pods” as first answer
- State the 3 real reasons for Pending clearly
- Avoid guessing node affinity
- Mention autoscaling confidently

>[!info] Suggested Improved Answer
>“If a pod is Pending, I check `kubectl describe pod` for scheduler events.  
>
> The three common causes are:
> 1. PVC not bound — wrong StorageClass or no capacity
>     
> 2. No nodes satisfy resource requests (CPU/mem)
>     
> 3. Taints/affinity mismatch
>     
> If the issue is resource shortage, the scheduler cannot place the pod. In that case, we either *reduce requests* or *scale out the node group* with the cluster autoscaler.”

### Requests vs Limits + Cgroups

**What was asked:**

- Difference between request and limit
- What happens when memory > limit
- What happens when CPU > limit
- Do you know cgroups/namespaces?
- Can you reason why CPU won’t cause kill?

**My response:**

- Took a few tries to define requests vs limits
- Correctly identified memory limit → OOM kill
- First guessed CPU limit → kill, then corrected
- Explained cgroups + namespaces correctly
    
**What could be improved:**

- State differences more confidently
- Avoid uncertainty around CPU throttling

> [!info] Suggested Improved Answer
> 
> “Requests are used by the *scheduler* to *place pods*; limits are enforced at *runtime*.
> 
> If memory exceeds limit → the kernel *OOMKills* the pod.  
> If CPU exceeds limit → cgroup *throttles* the container; it slows down but stays alive.  
> Namespaces isolate what a container can see; cgroups limit how much it can use.”

---
## Others 

### Coding

- Design a Log Parser
- Easy String Parsing problem, using counting + hashmap

### Questions I asked

- Biggest challenges in ML-SRE
- How the team collaborates with ML engineers

---
## Overall

**Strengths:**

- K8s debugging reasoning — think out load; show reasoning even when answer is unclear
- Correct understanding of cgroups/namespaces after reasoning

**Areas to Improve:**

- Stronger answers on scaling pipeline & exporters
- More confident Kubernetes scheduling / autoscaling story