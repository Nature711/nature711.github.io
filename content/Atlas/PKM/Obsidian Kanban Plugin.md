---
title:
draft: false
tags:
  - "#pkm"
date: 2026-03-19
---
## What is Kanban

At a high level:

> **Kanban = visualizing work as states + moving items through states**

Think of it like a pipeline:

> Ideas → Doing → Blocked → Done

Each task is a **card**, and each stage is a **column**.

---
## Why it exists

### Without Kanban

- Tasks are buried in notes
- No visibility of progress
- Hard to prioritize / track flow
    
### With Kanban

- You see **state transitions**
- You focus on **flow, not just tasks**
- You reduce mental overhead (externalize thinking)

---
## How to set up

1. Install Kanban plugin

2. Create a markdown file -- Obsidian will automatically render as Kanban

```
---
kanban-plugin: board
---

## TODO

- [ ] Task 1
- [ ] Task 2

## DOING

- [ ] Task 3

## DONE

- [x] Task 4
```

---
## Core Concepts (How to Use It Properly)

### Columns = States

#### Simple workflow 

- TODO
- DOING
- DONE

#### More realistic engineering workflow

- BACKLOG
- READY
- IN PROGRESS
- REVIEW
- DONE

#### My case

- IDEAS
- INVESTIGATE
- IMPLEMENT
- VERIFY
- SHIPPED

### Cards = Units of Work

Each card can be: a simple task / a note link

Example:

```markdown
- [ ] Implement voucher use_link logic [[Voucher Customization]]
```

You can:
- Link to notes
- Add descriptions
- Expand into sub-tasks
    
### Moving Tasks = State Transition

Dragging cards across columns = **moving work through a system**

---
## Advanced Usage

### Cards as Entry Points to Knowledge

Instead of writing everything inside the card:

```markdown
- [ ] Debug rate limiter issue [[Rate Limiter Deep Dive]]
```

Now:
- Kanban = execution layer
- Notes = knowledge layer

### Add Metadata / Context

```markdown
- [ ] Trace request flow for voucher distribution
  - priority: high
  - blocker: unclear proto contract
```

### Checklist inside Cards

```markdown
- [ ] Food Voucher Customization
    - [ ] Understand PRD
    - [ ] Trace call chain
    - [ ] Modify proto
    - [ ] Update BFF
```

---
## My Kanban Design

### Work Kanban (Execution)

```
BACKLOG
READY
IN PROGRESS
BLOCKED
REVIEW
DONE
```

###  Learning Kanban (Understanding)

```
TO LEARN
EXPLORING
UNDERSTOOD
INTERNALIZED
```

### Life / Reflection Kanban

```
THOUGHTS
WRITING
REFINING
PUBLISHED
```