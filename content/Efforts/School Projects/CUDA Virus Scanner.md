---
title:
draft: false
tags:
date: 2025-11-29
---
> [!info] Intro
> “I built a GPU-accelerated virus scanner using CUDA.  
> It scans many files against a large signature database, including patterns with wildcards.  
> The goal was to achieve significant speedup compared to a sequential implementation.”

> [!info]+ STAR
> “One of my university projects was implementing a GPU-accelerated virus scanner using CUDA.  
> The task was to scan multiple files against a large signature database, including signatures with wildcards. The main idea was to parallelize by assigning one signature per thread, because each signature can be matched independently.
> 
> For fast pattern matching, I used Rabin–Karp rolling hash. For wildcard signatures, I excluded wildcard bytes from the hash and dynamically adjusted the rolling hash while sliding over the file.
> 
> To improve performance, I batched about 1280 signatures per kernel launch to reduce overhead, and used CUDA streams to overlap memory transfers with computation. On the CPU side, I used `mmap` to load files efficiently without large memory overhead.
> 
> The result was a substantial speedup compared to the sequential version while still passing the correctness tests, including F-beta scoring which penalized false negatives heavily. A key learning was how to balance data transfer, kernel launch overhead, and parallel workload granularity to maximize GPU efficiency.”

> [!info]+ Deep Dive
> 
> 1. High-level approach:
> 
> "We parallelize at the signature level: each GPU thread processes one signature across all files. This maps naturally to the problem since signatures are independent and each requires similar work (pattern matching via Rabin-Karp)."
> 
> 2. Batching strategy:
> 
> "To handle large signature databases efficiently, we batch signatures into groups of 1280. This balances memory usage, kernel launch overhead, and GPU occupancy. The batch size is chosen as a multiple of the warp size (32) for optimal thread alignment."
> 
> 3. Wildcard optimization:
> 
> "We separate wildcard and non-wildcard signatures into different groups. Non-wildcard signatures are processed first as they require simpler hash computations, improving overall throughput and load balance."
> 
> 4. Launch configuration:
> 
> "For each batch of 1280 signatures, we launch 40 blocks with 32 threads per block, ensuring one warp per block. This configuration maximizes GPU occupancy while maintaining efficient thread scheduling."
> 
> 5. Asynchronous execution:
> 
> "We use CUDA streams to overlap memory transfers with computation. Files are transferred asynchronously, and signature groups are processed in parallel streams, enabling pipeline parallelism."
> 
> ### Key talking points:
> 
> - Scalability: "The approach scales linearly with the number of signatures, as each signature gets its own thread."
> 
> - Memory efficiency: "Batching prevents memory exhaustion while maintaining high GPU utilization."
> 
> - Load balancing: "Separating wildcard signatures ensures more uniform execution times across threads."
> 
> - GPU utilization: "The 40-block configuration with warp-aligned thread counts maximizes SM occupancy."
> 
> ### Performance considerations to mention:
> 
> - Trade-off: Batching reduces memory usage but requires sequential processing of groups
> 
> - Optimization opportunity: The current implementation processes all files for each signature group; could be optimized further
> 
> - Memory access pattern: Each thread reads the entire file, which could benefit from shared memory caching for frequently accessed files




