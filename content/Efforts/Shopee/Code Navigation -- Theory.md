---
title:
draft: true
tags:
date:
---
> see also: [[Code Navigation -- Practical Example]]

## Think in Terms of a Call Graph

Every Go program can be modeled as a directed graph:

```
A() → B() → C()
      ↓
      D()
```

Each arrow means: “calls”

So the call graph is:

- Nodes = functions
    
- Edges = function calls
    

All these features are just different ways to traverse that graph.

---

##  Outgoing Calls (Downward)

### "Show Outgoing Calls" / "Calls From" (calls that originates from here)

Means:

> What functions does THIS function call?

Example:

```go
func Cancel() {
    validate()
    getUser()
    repo.GetMulti()
}
```

Outgoing calls of `Cancel()`:

```
validate()
getUser()
repo.GetMulti()
```

This answers:

- What **dependencies** does this function have?
    
- Is it heavy or thin?
    

Use this when:

- Understanding complexity
    
- Debugging inside a function
    
- Checking if logic is too coupled
    
---

## Incoming Calls (Upward)

### "Show Incoming Calls" / "Callers Of"

Means:

> Who calls THIS function?

Example:

If:

```go
func GetMulti()
```

And somewhere:

```go
UseService → GetMulti()
OrderService → GetMulti()
```

Incoming calls of `GetMulti()`:

```
UseService
OrderService
```

This answers:

- Where is this function used?
    
- If I change this function, **what breaks**?
    
- What is its blast radius?

---
## Show Call Hierarchy (Tree View)

This gives you both directions, navigable as a tree.

Example:

```
GetMulti()
  ↑ called by Service.GetMulti()
      ↑ called by UseService.needReturnUserVouchers()
          ↑ called by UseManyTccCancel()
```

You can expand upward or downward.

This is best when:

- Understanding layered architecture
    
- Learning new repo
    
- Tracing flow from API → repo

---

# 6️⃣ When to Use Which

Here is the mental rule:

|Situation|Use|
|---|---|
|I want to know what this function depends on|Outgoing|
|I want to know who depends on this function|Incoming|
|I want to understand full execution path|Call Hierarchy|
|I want to estimate impact of refactor|Incoming|
|I want to see complexity inside function|Outgoing|

---

# 7️⃣ Why It’s Especially Important in Go

Go uses:

- Interfaces
    
- Dependency injection
    
- Layered architecture
    

Example:

```go
type VoucherRepo interface {
    GetMulti()
}
```

Concrete implementation is injected somewhere else.

Call graph tools help you:

- Understand real usage
    
- Avoid missing indirect dependencies
    
- Avoid breaking flows silently

> more on this: [[navigating interface methods]]

---

# 9️⃣ Practical Workflow (What I Would Do)

Let’s say you’re editing:

```go
repo.GetMulti()
```

I would:

1. Right click → Show Incoming Calls
    
2. Expand upward until I see:
    
    - Service layer
        
    - Handler layer

why: cuz
That tells you:

- Which flows are affected
    
- Whether it’s only cancel flow or other flows too

        
3. Confirm only cancel flow uses it
    
4. Make change
    
5. Re-run incoming calls to confirm scope
    

That is production-safe navigation.