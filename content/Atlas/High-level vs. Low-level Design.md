---
title:
draft: false
tags:
description:
date: 2025-11-08
---
## High-Level Design (HLD)

### Overview

High-Level Design provides a bird's-eye view of the entire system architecture, focusing on how different components interact, their responsibilities, and how the system scales.

> [!important] Goal: To assess whether you can design a reliable and scalable system that works under real-world conditions and constraints.

### Key Focus Areas

#### Requirements

- **Functional requirements:** Core features (e.g., send message, post tweet, search user)
- **Non-functional requirements:** Scale, latency, throughput, availability, consistency

#### System Architecture

- System boundaries and major components/modules
- Communication protocols (REST, gRPC, etc.)
- Architecture components:
    - Load balancers
    - API gateway and rate limiting
    - Application/API servers
    - Databases (SQL vs NoSQL, sharding, replication)
    - Caches, queues, CDNs, pub/sub systems

#### Planning & Analysis

- **Traffic estimates and capacity planning:** Requests/sec, storage size, growth projections
- **Data flows:** Read path vs write path, request movement through the system
- **Trade-offs:** CAP theorem, eventual vs strong consistency, cost vs scalability
- **Scaling strategy:** Horizontal vs vertical scaling
- **High availability & fault tolerance**

### Deliverables

- Component Diagram
- Deployment Diagram
- Data Flow Diagrams
- Tech Stack Justification
- Scaling Strategy

### Common Interview Questions

- Design YouTube, Instagram, WhatsApp, etc.
- How would you handle millions of users?
- What database and architecture would you choose and why?

---
## Low-Level Design (LLD)

### Overview

Low-Level Design dives deeper into the internal structure of system components, focusing on how they are implemented and work together at the code level.

> [!important] Goal: To demonstrate how you translate high-level architecture into actual, maintainable implementation that can be built by developers.

### Key Focus Areas

#### Object-Oriented Design

- **Object-oriented modeling:** Classes, objects, interfaces, relationships
- **Object-oriented principles:** SOLID, DRY, YAGNI
- **Design patterns:** Factory, Strategy, Observer, Singleton, etc.
- **Relationships:** Composition, inheritance, aggregation

#### Implementation Details

- **APIs and methods:** Clear function signatures, parameters, return types
- **Data models:** Table schemas, indexes, relationships, query optimization
- **Component interactions:** Sequence diagrams, module communication
- **Thread safety and concurrency**

#### Code Quality

- **Edge cases and validations:** Error handling, retries, testing considerations
- **Maintainability:** Clean abstractions, modularity, extensibility
- **Clean Code & modularization**
- Interfaces and abstractions

### Deliverables

- Class Diagrams
- Sequence Diagrams
- ER Diagrams (Entity-Relationship)
- Pseudocode for major flows
- Relationship diagrams (composition, inheritance)

### Common Interview Questions

- Design elevator system / parking lot / ATM
- Implement rate limiter / logger / cache
- Write class diagram for social media post/comment system

---
## HLD vs LLD Comparison

|Aspect|HLD|LLD|
|---|---|---|
|**Focus**|Architecture & components|Internal structure & logic|
|**View**|Bird's-eye view|Programmer's view|
|**Audience**|Architects, stakeholders|Developers|
|**Diagrams**|Component, deployment, data flow|Class, sequence, ER diagram|
|**Concerns**|Scalability, availability, system-wide trade-offs|Code reusability, clean design, maintainability|

---
## References

- [System Design Interview Questions & Prep (from FAANG experts)](https://igotanoffer.com/blogs/tech/system-design-interviews)
- [HLD vs LLD: The Ultimate System Design Interview Preparation Guide (2025)](https://dev.to/devcorner/hld-vs-lld-the-ultimate-system-design-interview-preparation-guide-2025-54do)

