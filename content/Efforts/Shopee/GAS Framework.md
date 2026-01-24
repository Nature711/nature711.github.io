---
title:
draft: true
tags:
date: 2026-01-18
---
## Overview

> [!important] Big Picture
> GAS exists to separate *business logic* from *infrastructure evolution*.  
> Developers write only business modules that depend on ***stable SPI abstractions***, while GAS Engine supplies and evolves the ingress/egress implementations. 
> This allows platform-level changes (SPEX, config, DB, governance, tracing) to roll out centrally without forcing business teams to repeatedly migrate their code.

---
## What Problem Does GAS Solve

> Common issues in large-scale Go microservices

1. **Tight coupling to infra**
	- code imports concrete libraries → hard to test / swap implementations
	
2. **Inconsistent application structure**
	- different patterns for initialization, lifecycle, dependency management...
	
3. **Boilerplate overhead**
	- repetitive setup for logging, health checks, metrics, graceful shutdown, configuration...
	
4. **Testing challenges**
	- hard to test with real infra without complex mocks / integration test setup

5. **Engine versioning**
	- framework updates → need to update every service

---
## How GAS Solves These Problems

### Service Provider Interface Pattern (SPI)

> [!info] Core Idea
> Business code depends only on interfaces, not concrete implementations

```go
type Accessor struct {
	registry configspi.Registry `inject:""`
}
```

- business code imports only SPI packages (e.g., `spi/config`, `spi/cache`)
- GAS engine provides concrete implementations at runtime
- can swap implementations without changing business code

### Business Module Pattern (BM)

> [!info] Core Idea
> Replaces traditional `main()` functions with a declarative module registration

```go
func RegisterModule() (*gas.Module, error) {
	return gas.New(
		config.GASOption(),
		// TODO: register your own GAS options here
		// service.GASOption(),
		gas.EventHandler(gas.OnEngineSmokeTest, new(smokeTester)),
		gas.EventHandler(gas.OnEngineHealthCheck, new(healthChecker)),
	)
}
```

- each BM represents one *deployable application*
- no `main()` in business code
- GAS engine (with `main()`) injected at build time

### Dependency Injection 

> [!info] Core Idea
> Initialization order is based on the **dependency graph**, not the order objects are provided

```go
func GASOption() gas.Option {
	return gas.Options(gas.Object(new(Accessor)))
}

type Accessor struct {
	registry configspi.Registry `inject:""`
}
```

#### Key DI Functions

- `gas.Object(ptr)` -- provides a concrete object to be managed
- `gas.Export(from, to)` -- declares that a concrete type implements an interface
- `gas.Alias(name, targetName)` -- creates name aliases for dependency lookup

#### Lifecycle Interfaces

- `gas.Initable` -- `Init()` called after DI, before `Run()`
- `gas.Runnable` -- `Run(ctx, shutdown)` contains main logic
- `gas.Destroyable` -- `Destroy()` called during shutdown

---
## GAS Engine

Controls the flow of the main program: 

 - setting up common utilities (e.g., logger, metrics, health check)
 - managing application lifecycle -- init, graceful shutdown...
 - dependency injection, wiring...
 - config management
 - calls `RegisterModule()` -- kick start our application

---
## Implementing Business Logic

- Without GAS: implement goroutines yourself -- `go runLoop(ctx)`

- With GAS: register a *managed object* that implements a *Runnable interface*, and GAS Engine runs it for you

> [!info] Mindset Shift
> - You: provide concrete components
> - GAS Engine: orchestrates lifecycle -- start, run concurrently, shutdown gracefully

---
## GAS Config

[[GAS Config]]

> Read more on: Dependency Inversion Principle ([[DIP]])

---
## Data Flow Model

Think of your service as a *box*: 

```
Outside world
     ↓
[ INGRESS ] → [ BUSINESS LOGIC ] → [ EGRESS ]
     ↑
Outside world
```

![[gas-architecture.png]]

---

> Official doc: [GAS Overview](https://gas.shopee.io/concepts/gas.html)
