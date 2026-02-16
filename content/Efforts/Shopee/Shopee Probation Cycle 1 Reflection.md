---
title:
draft: false
tags:
date: 2026-02-13
---
## General 

### Definition of Done

> Is there anything else I should do but didn't do?

“Done” means **full ownership across the lifecycle**, not just coding: 
- **Development:** implement correct logic, consider edge cases, add necessary tests
- **Review:** respond to feedback, clarify design decisions, ensure quality bar is met
- **Testing:** align with QA, validate end-to-end flow, verify error handling & logs
- **Release:** confirm deployment readiness, move ticket across stages, ensure no loose ends

### Balance Reflection vs. Doing

> [!info] Risk
> Overthinking growth and burning mental energy instead of compounding skill steadily.

I tend to: 
- reflect deeply
- self-evaluate intensely
- optimize meta-level

That's powerful, but it can become **noise** if not channeled.

---
## Technical

### Boundary Thinking

[[API Boundary]]

- What layer owns this?
- What contract is being defined?
- What assumptions am I making?
- What breaks if upstream changes?

### Failure-Mode Modeling

> What can go wrong?

- Timeout
- Partial success
- Large / empty input
- Retry behavior
- Idempotency

### Repo Navigation Efficiency

- `rg` search
- go-to-definition patterns
- reading logs faster
- understanding module structure
    
