---
title:
draft: true
tags:
date:
---
In Go repos that lean hard on interfaces + DI, you trace **values**, not just symbols. A good mental model is:

> **Interface method call** = “call goes to _whatever concrete value_ is stored in this interface variable at runtime.”

So the job is: **find where that interface value is constructed and assigned**.

Here are the reliable techniques (ordered by how often they work in real codebases).

---

## 1) Identify what you’re looking at: interface call vs concrete call

If you see:

```go
s.voucherTransactionService.GetMulti(...)
```

Ask: what is the type of `s.voucherTransactionService`?

- Hover it in Cursor (or Go to Definition of the field).
    
- You’ll see something like:
    

```go
type UseService struct {
    voucherTransactionService VoucherTransactionService // ← interface
}
```

If it’s an interface type, call hierarchy will be incomplete unless you find the concrete assignment.

---

## 2) Jump to the constructor that builds the struct (`New...`)

Most production Go follows this pattern:

```go
func NewUseService(repo VoucherRepo, vt VoucherTransactionService) *UseService {
    return &UseService{repo: repo, voucherTransactionService: vt}
}
```

So do:

- Go to definition of the struct (`type UseService struct { ... }`)
    
- Find **`NewUseService` / `NewDefault...` / `Init()` / `Provide...`** nearby
    
- That constructor is where dependencies are wired.
    

In your kind of codebase, you literally saw this pattern: default impl created in an init/constructor chain.

---

## 3) Trace the assignment: “where does this field get a value?”

There are only a few common ways:

### A) Constructor parameter assignment (most common)

Search for where constructor is called:

- `Cmd+Shift+F` search: `NewUseService(`
    

Then inspect arguments. One of them will be the concrete impl.

### B) Direct literal assignment

Sometimes:

```go
svc := &UseService{
  voucherTransactionService: NewVoucherTransactionService(...),
}
```

Search for `voucherTransactionService:`.

### C) Setter / init method (less common, but exists)

Look for:

- `Init()`
    
- `SetVoucherTransactionService(...)`
    
- `Wire(...)`
    

Search those names.

---

## 4) Find concrete implementations of an interface (fast Go trick)

If you have:

```go
type VoucherTransactionService interface {
    GetMulti(...)
}
```

You can often find candidates by:

### Method name search

Search:

- `func (.*) GetMulti(`
    

(Just `GetMulti(` may be noisy; add receiver pattern `func (`.)

Then check which receivers implement the whole interface.

### “var _ Interface = (*Type)(nil)” pattern

Many repos include compile-time assertions:

```go
var _ VoucherTransactionService = (*voucherTransactionServiceImpl)(nil)
```

Search for:

- `VoucherTransactionService =`
    

This instantly tells you which type implements it.

---

## 5) Follow the DI / module wiring layer (GAS-style or module.go/service.go)

Big repos typically have a “wiring” file where everything is assembled:

Common filenames:

- `module.go`
    
- `wire.go`
    
- `provider.go`
    
- `service.go`
    
- `init.go`
    

The pattern you documented in the TCC flow is exactly this: `Init()` creates concrete sub-services and assigns them into interfaces used by handlers.

So if you hit an interface call in domain/service layer and you want the concrete target, you often jump **up** to the module/service initialization code.

---

## 6) When tools can’t resolve it: runtime-type tracing (last resort)

Sometimes the interface value comes from:

- reflection
    
- generic factories
    
- config-based plugin loading
    

Then static navigation fails.

Two practical options:

### A) Add temporary logging

Log the dynamic type:

```go
log.Printf("voucherTransactionService=%T", s.voucherTransactionService)
```

This prints the concrete type at runtime.

### B) Use debugger

Set a breakpoint at the call site and inspect the interface variable:

- In Go debugger, interface values show concrete type + pointer.
    

(Do this only when the wiring is too indirect.)

---

## A repeatable “interface tracing recipe”

When you land on `x.SomeMethod()` and `x` is an interface:

1. **Confirm** `x` is interface (hover / field type).
    
2. **Find owner struct’s constructor** (`New...`, `Init()`) and where it’s called.
    
3. **Locate concrete impl** passed/assigned into that field.
    
4. If unclear, **search implementations** (`func (T) SomeMethod` or `_ Interface = (*T)(nil)`).
    
5. If still unclear, **runtime `%T`** to reveal actual type.