---
title:
draft: true
tags:
  - "#real-interview"
date: 2025-11-04
---
## Meta

- Company: ByteDance
- Role: [Senior Software Engineer - Traffic Infrastructure](https://jobs.bytedance.com/en/position/7360998096892250419/detail)
- Interviewer: Yu Bai (Network Engineer)
- Focus: Projects, Coding, Fundamentals

---
## Question Log

### Coding 

Problem: Longest Palindromic Substring
- Approach: expansion from center
- Fixed a few edge cases
- Follow-up: explained time and space complexity  

### Technical
#### TCP vs UDP
- Asked for differences and use cases  
- Gave clear comparison (TCP for reliability, UDP for speed; e.g., video streaming)  
- Briefly mentioned how TCP achieved reliability using sequence no., retransmission
- Could've mention 3-way handshake

#### HTTP 1/2/3
- Mentioned HTTP/2 multiplexing but couldn't remember HTTP/3 (QUIC)  
- Interviewer said it’s okay — not expected to go too in-depth

### Project

#### Insight (Takumi Framework)

- Explained overall purpose: connectivity testing, metrics collected
- Described how Takumi works as a infra development scaffold
- Struggled to explain how the project itself works -- what kind of metrics it's collecting, how they're collected
- Mentioned it's still ongoing

#### Resource Utilization Reporting System

- Described modular architecture (collection, processing, storage, alerting)  
- Talked about CloudWatch exporter for cost-saving  
- Mentioned recording rules in Prometheus, but couldn’t explain details

#### Nginx Whitelist Proxy

- Explained motivation: cross-environment access control via IP whitelist  
- Walked through full deployment pipeline: GitLab config → Ops Platform release → Jenkins + Ansible rollout  
- Communication clear and confident on this one

---
## Interview Dynamics

- Interviewer was polite, encouraging, and patient
- Often used gentle phrasing (“could you please…”)
- Reassuring when I didn’t know smth ("it's ok, not expected")
- Explained team structure and responsibilities at the end 
- Mentioned the team is split between SG and US; responsibilities are SWE+SRE hybrid with a focus on reliability and traffic infra  
- I didn’t fully grasp the technical descriptions at the end — felt abstract

---
## What Went Well

### Technical explanation

- Confident coding problem solve + complexity explanation  
- Stayed composed even when I didn’t know all answers  
- Delivered full explanation of CI/CD pipeline for Nginx proxy  
- Honest and clear when I wasn’t sure (e.g., HTTP versions)

### Interview dynamics

- The interviewer was polite and encouraging — asked questions gently (“could you please…”), which created a safe atmosphere.
- Felt like someone I could actually learn from and collaborate with — this matters more than I often realize.

---
## What to Improve

### Technical Depth

- Add clearer **impact framing** when describing projects (“why this mattered”)  
- Strengthen understanding of:
  - Prometheus recording rules
  - HTTP/2 and HTTP/3 core concepts  
  - Insight project’s component flow — Gateway, logic, metrics, Takumi lifecycle  
- Ask more natural, curiosity-driven questions — not just placeholders

---
## Actionable

- Draft “1-sentence impact” for each key project in my resume and interviews  
- Study:
  - Prometheus recording rules and performance implications
  - HTTP protocol evolution: persistent connections, multiplexing, QUIC  
  - Insight project’s real architecture: trace the exact request/metric path  
- Reflect: what / don’t understand about traffic platforms → turn confusion into next-round questions  
- Practice layered project explanations