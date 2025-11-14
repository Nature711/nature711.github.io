---
title:
draft: true
tags:
date: 2025-11-12
---
## Meta

- Company:  Airwallex
- Role: [Software Engineer, Cloud Infra](https://careers.airwallex.com/job/50c44f36-f889-40e4-ba32-84b20d2cada4/software-engineer-ii-cloud-infra/)
- Interviewer: Li Wenjun (Senior Software Engineer)
- Focus: Coding, Projects

---
## Review

### Part 1: Project Walkthrough

#### What went well

- Gave a **clear high-level summary** of Insight (cross-region probing, Takumi framework, metric collections
- Showed that I understood the purpose, the architecture, the ops workflow
    
#### What I struggled with

- When he asked:  
    **“How exactly is latency measured? How is data obtained?”**  
    I could not explain the context injection & gRPC call chain.
    
- Only said “using gRPC + inject metadata into context” — Correct but lack depth

### Part 2: Coding

> [!info]- Original Question
> “Given two Kubernetes Deployment YAML files, write a function that computes the field-level diff between them.”
> 
> ```
> def is_primitive(yaml):
>   return isinstance(yaml, (int, bool, str))
> def compare_list(l1, l2):
>   if len(l1) != len(l2):
>     return False
>   n = len(l1)
>   for i in range(n):
>     res = find_diff(l1[i], l2[i])
>     if res:
>       return False
>   return True
> def find_diff(yaml1, yaml2):
>   res = []
>   if yaml1 and not yaml2:
>     return yaml1
>   if yaml2 and not yaml1:
>     return yaml2
>   if type(yaml1) != type(yaml2):
>     return yaml1
>   if is_primitive(yaml1) and is_primitive(yaml2):
>     if yaml1 != yaml2:
>       return yaml1
>     else:
>       return res
>   if isinstance(yaml1, list) and isinstance(yaml2, list):
>     list_diff = compare_list(yaml1, yaml2)
>   for k1 in yaml1.keys():
>     if k1 in yaml2:
>       diff = find_diff(yaml1[k1], yaml2[k1])
>       if diff:
>         res.append(diff)
>     else:
>       res.append(yaml1[k1])
>   for k2 in yaml2.keys():
>     if k2 in yaml1:
>       diff = find_diff(yaml1[k2], yaml2[k2])
>       if diff:
>         res.append(diff)
>     else:
>       res.append(yaml2[k2])
>   return res
> def find(yaml1, yaml2):
>   yaml1_dict = {"apiVersion": "apps/v1", "kind": "Deployment", "list": [1, 2, 3, 5, 7]}
>   yaml2_dict = {"apiVersion": "apps/v2", "kind": "Deployment", "list": [1, 2, 4, 5, 8]}
>   return find_diff(yaml1_dict, yaml2_dict)
>   
> yaml1 = '''
> apiVersion: apps/v1
> kind: Deployment
> '''
> yaml2 = '''
> apiVersion: apps/v2
> kind: Deployment
> '''
> res = find(yaml1, yaml2)
> print(res)
> ```

#### What went well

- Even though I didn’t know the YAML parsing functions, I stayed honest
- Described a **recursive diff approach**:
    - Base Case: Compare primitives / empty input 
    - Recurse into nested structures
- Communicated my reasoning clearly and calmly

#### What I struggled with

- Blanked on concrete functions (`yaml.safe_load` etc.)
- Missed out on certain edges cases — Due to lack of knowledge about Python primitive types

### Part 3: Follow-ups

- Explained my real experience deploying to multi-cluster with our ops platform
- Mentioned config management, service registry, and monitoring.
- Tied it back to Insight and Takumi best practices