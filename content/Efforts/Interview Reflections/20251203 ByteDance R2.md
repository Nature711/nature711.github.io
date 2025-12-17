---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-12-03
---
## Meta

- Company: ByteDance
- Role: [Site Reliability Engineer](https://jobs.bytedance.com/referral/pc/position/7374622806136637723/detail?token=NTsxNzYyMjM0NTA0MzMzOzc1NjA1MTY3MTQ0MTM0NDI1Njg7NzU2ODczNjc0NzU1MzE5NjI5Mzsx)
- Team: Large Model Team
- Interviewer: 
- Focus: Project & General

---

## Common ML Workflow failures

1. **Low GPU utilization** from slow dataloader or CPU–GPU transfer
    
2. **OOM errors** from batch size or memory fragmentation
    
3. **NCCL timeouts** in multi-GPU training
    
4. **Unscheduled GPU jobs** because no GPU nodes available
    
5. **Driver/plugin issues** on GPU nodes
    
6. **Training hangs** from network instability during AllReduce

## Why ML-SRE

“I want to work on systems that combine high-scale infrastructure, distributed systems, and GPU workloads.  
ML infra has both reliability challenges and data throughput challenges, which match my strengths from building monitoring systems, exporters, and distributed pipelines.

I also want to grow into a role where I operate complex clusters, optimize performance, and build tools that empower ML engineers. ML-SRE sits exactly at that intersection.”

## CUDA Project

> “I’m not a pure ML engineer, but I do have practical GPU knowledge from CUDA programming.  
> It taught me how GPUs execute kernels, how memory and data transfer affect performance, and why batching and parallelism matter.
> That translates directly into understanding GPU utilization, NCCL behavior, and performance debugging for ML workloads — which is why I’m confident I can grow quickly as an ML-SRE.”

[[CUDA Virus Scanner]]

- SM occupancy
- memory hierarcy, global memory cost
- data transfer (host & device) overhead
- parallel execution, batching

database of signatures (virus)
a series of files
- goal: to find virus in all files
