---
title:
draft: true
tags:
date: 2026-03-13
---
## 1. Concise Summary

The past two months have been challenging but also formative.  
The entry tasks exposed gaps in my backend fundamentals—especially in performance optimization, Go project navigation, and framework understanding. Subsequent warm-up and feature tasks gradually introduced me to real engineering realities: service boundaries, request flows, runtime verification, cross-service contracts, and cross-team collaboration.

While the process has been uncomfortable and often challenged my confidence, it has also accelerated my learning. I have started to move from simply completing tasks toward understanding how systems actually work in production.

At the same time, I have been dealing with some internal tension: balancing the growth opportunity here with thoughts about opportunity cost and uncertainty about long-term career direction.

Overall, this period is best described not as purely “growth” or purely “regret,” but as a phase where both coexist—building technical foundations while also reflecting deeply on career choices and professional identity.

---

# 2. Recurring Themes

## Theme 1 — From “Using AI to ship code” to “Building my own technical reasoning”

I rely heavily on AI tools (ChatGPT, Cursor) and have developed a fairly advanced workflow:

- Breaking tasks down with ChatGPT
    
- Feeding steps to Cursor
    
- Using agent mode for implementation
    
- Running parallel threads to challenge or review code
    
- Using AI to trace repositories and debug
    

The challenge is not AI usage itself, but that **AI execution speed can exceed my own understanding**.  
This sometimes leads to:

- Fast initial progress
    
- Loss of control when complexity increases
    
- Being misled by AI assumptions
    
- Confusing “working code” with true understanding
    
- Trial-and-error debugging instead of structured reasoning
    

The key growth during this period is starting to build my **own engineering framework**, including:

- tracing request flows
    
- understanding API boundaries and service contracts
    
- verifying runtime behavior instead of relying only on static code
    
- analyzing upstream/downstream impact
    
- using logs, configs, and infra signals to validate assumptions
    

This shift is uncomfortable but necessary—it marks the transition toward developing a genuine backend engineering mindset.

---

## Theme 2 — From local coding to system-level understanding

Previously my focus was mainly local:

- a function
    
- a file
    
- a specific logic block
    

Now I increasingly need to understand:

- how requests enter the system
    
- how services interact
    
- how errors propagate
    
- how configs affect runtime behavior
    
- how contracts are managed across repositories
    

This represents an important shift:  
moving from **writing code** to **understanding systems**.

Interestingly, the most satisfying moments often happen when I successfully piece together a full request flow or system behavior.

---

## Theme 3 — From individual execution to organizational delivery

Before this role, many tasks were relatively isolated.

Now I am experiencing real engineering delivery in a large organization:

- cross-team coordination
    
- dependency alignment (FE, QA, other services)
    
- proto / contract changes across repos
    
- feature delivery requiring multiple teams
    

This initially feels overwhelming (“why so much alignment for a small change”), but it reflects the reality that **large-scale software delivery is as much about coordination as it is about coding**.

---

## Theme 4 — Preference for systems thinking

The moments that feel most rewarding tend to involve:

- understanding distributed system design decisions
    
- tracing request flows across layers
    
- verifying runtime behavior through logs
    
- understanding infrastructure mechanisms (rate limiter, circuit breaker)
    
- learning how service contracts work across repositories
    

This suggests that I am naturally drawn toward **system-level reasoning**, not just feature implementation.

---

## Theme 5 — Emotional tension driven by opportunity cost

Some of the ongoing emotional struggle is not purely about the work itself, but about perceived opportunity cost.

Factors include:

- compensation differences
    
- comparing with other offers
    
- uncertainty about long-term geography (Singapore vs overseas)
    
- questioning whether the original decision framework was correct
    

This creates an internal tension between:

- recognizing the learning opportunity here
    
- wondering whether a different choice might have been better
    

---

## Theme 6 — Evidence of real capability growth

Despite the challenges, there are clear signs of progress:

I have started to learn how to:

- trace request flows
    
- understand service layering
    
- reason about contracts and boundaries
    
- improve error handling awareness
    
- verify runtime behavior via logs
    
- understand infra middleware (rate limiting, circuit breaking)
    
- work with multi-repo proto contracts
    
- navigate cross-team feature delivery
    
- recognize estimation and complexity risks
    
- reflect critically on AI-assisted development
    

These skills may not yet feel fully internalized, but they represent meaningful foundational progress.

---

# 3. Reflection Template (for future monthly reviews)

To continue improving, it may help to reflect regularly using a simple structure:

### Technical Growth

- What systems or flows did I fully understand this month?
    
- What engineering concepts became clearer?
    
- What mistakes helped me learn the most?
    

### System Understanding

- What parts of the “voucher map” did I unlock?
    
- How do different services or entities connect?
    

### Collaboration

- What coordination challenges did I encounter?
    
- What communication or alignment skills improved?
    

### Personal State

- What caused stress or uncertainty?
    
- What increased confidence?
    

### Direction

- What kind of technical problems felt most interesting?
    
- What skills should I strengthen next?
    

---

# 4. Next Steps

Based on the current stage, a few practical focus areas may help.

### 1. Gradually build the “voucher map”

Following the manager’s analogy:

Treat the domain like a game map.  
Each task unlocks a small region of the system.

The goal is not to understand everything immediately, but to gradually connect:

- voucher entities
    
- lifecycle flows
    
- service interactions
    
- key APIs and contracts
    

Over time these pieces will form a coherent mental model.

---

### 2. Strengthen system reasoning before optimization

When encountering a task:

1. Identify the request entry point
    
2. Trace downstream calls
    
3. Identify contracts and boundaries
    
4. Observe runtime logs
    
5. Validate assumptions through testing
    

This reduces reliance on guesswork.

---

### 3. Use AI as a collaborator, not a driver

AI is most useful for:

- exploration
    
- code navigation
    
- generating hypotheses
    

But final understanding should come from:

- reading code
    
- tracing flows
    
- observing runtime behavior
    

---

### 4. Separate career evaluation from short-term emotions

Career decisions are easier to evaluate once:

- technical foundations are clearer
    
- personal preferences are better understood
    
- emotional reactions stabilize
    

The current focus can remain on **building capability and system understanding**, which will make future decisions more grounded.