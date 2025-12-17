---
title:
draft: false
tags:
date: 2025-12-11
---
Goal: to design drills that test system robustness

(pretend that i have a mission at hand)

---

Pessimistic chapter -- assume everything can & will go wrong

Under this assumption, it's the engineers' goal to build systems that is resilient enough (i.e., meeting user expectations in spite of everything going wrong)

(First, we need to understand what challenges we might face in a distributed system)
- problem with networks
- clocks & timing issues
- to what degree they're avoidable
- how to reason about everything

### Faults & Partial Failures

program on a single computer: predictable behavior -- either works or not (all or nothing, not in between)
- deliberate design choice -- if internal fault occurs, we prefer a computer to crash completely, rather than returning a wrong result (which may be misleading)
- idealized computation model -- "always-correct computation"

program running on several computers (connected via network), assumption breaks -- some parts of system may break unpredictably, while other parts still working fine

> concept: partial failure

> The *non-deterministic* nature of the *partial failure* makes distributed systems hard to work with 

### Cloud computing & supercomputing

