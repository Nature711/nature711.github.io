---
title:
draft: true
tags:
date: 2026-01-20
---
## Overview
 
> [!info] Goal
> Separate config from business logic so: 
> - config is *centralized* and type-safe
> - business logic doesn't depend on config implementation details
> - config can be loaded from *multiple sources* (e.g., file, remote config center)
> - config changes can be handled at runtime (i.e., *hot reload*)
> - dependencies are *injected automatically*

> [!note] Big Picture
> Config is just one GAS SPI (like DB, cache, or SPEX) — each acting as a *standard abstraction "lego piece"* that applications declare, and the Engine assembles into a working system.

---
## Patterns

### Anti-patterns

- global variables 
- manual dependency passing
- direct config file reading
- tight coupling to config implementation

e.g., 
```go
cfg := loadFromYamlOrConfigCenter()
ticker := time.NewTicker(cfg.Period)
```

problem: 
- business logic tied to config source
- untestable without infra, hard to swap implementation 

### Good patterns

- dependency injection
- abstraction layer
- lifecycle management
- separation of concerns

---
## How this maps to GAS

###  Accessor Pattern

- accessor: a bridge between infra (config loading) & business logic

```go
type Accessor struct {
	cron *Cron // wraps the Cron config struct
}

func (a *Accessor) Cron() *Cron {  // getter method
	return a.cron
}
```

features
- encapsulates config access behind API
- provides lifecycle hook `init` for setup
- easier to test -- just mock the Accessor, not raw config

### Runner Pattern

- runner: the business logic component that uses config

```go
type runner struct{
	accessor *config.Accessor `inject:""`
}

// ensure *cron.runner implements gas.Runnable
var _ gas.Runnable = (*runner)(nil)

func (r *runner) Run(ctx context.Context, shutdown <-chan gas.ShutdownInfo) error {
// ... business logic here

// use r.accessor.Cron() to get config values
// completely unaware of where config comes from
```

features
- implements `gas.Runnable` for lifecycle management
- receives config via DI
- business logic isolated from config loading

---
## Registration & Wiring

**declarative** registration: 

```go
func RegisterModule() (*gas.Module, error) {
	return gas.New(
		config.GASOption(),
		cron.GASOption(),
		// register more GAS options here, e.g., service.GASOption()
		...
```

how it works: 
- `config.GASOption()` registers the `Accessor`
- `cron.GASOption()` registers the `Runner`
- GAS Engine sees `runner.accessor` has the `inject:""` tag → finds the `*config.Accessor` in container → automatically injects it

> [!info]- How it works, from the doc
> When the Engine initializes the runner object provided through `gas.Object`, it checks for its fields that are annotated with the `inject` tag. 
> Then, it looks for *managed objects* of the matching type and set those values to the fields. This mechanism to set dependencies on managed objects' fields is called **field injection**.

### GAS Option

- a *declarative* instruction that tells the GAS Engine how to *assemble* and run your application

- without Option: we manages the execution order, e.g., 

```go
func main() {
    cfg := loadConfig()
    cron := NewCron(cfg)
    http := NewHTTP(cfg)
    go cron.Run()
    go http.Run()
    waitForShutdown()
}
```

Problem:
- GAS does not know your business components (cron, http...)
- It must support _arbitrary combinations_ of: http, cron, db...

Therefore: 
- GAS must construct an **object graph** before execution
- GAS must **inject dependencies** *before* running anything

How?
- GAS needs a way for you to **declare structure**, without executing code
- That mechanism is -- **GAS Options**

e.g.,
```
return gas.New(
    service1.GASOption(),
    service2.GASOption(),
    ...
)
```

- ❌  run service1, then service2, then... (the order in which they're declared)
- ✅  build a module composed of service1, 2... → GAS will figure out the execution order


> [!info] How they're tied together
> GAS Options define the _static structure_ of the application at startup.  
> The GAS Engine uses this structure to build a *dependency graph*,  
> which then drives _runtime behavior_ (initialization, execution, shutdown).

---
## Config Evolution

```
Hardcoded → Accessor → SPI Registry → Config Center
   ↓           ↓            ↓              ↓
  Code      Abstraction   Local File    Remote Source
```

> [!info] Key insight
> Each stage adds a layer of abstraction, allowing the same business code (runner) to work with different config sources without changes. 
> The Accessor pattern + SPI Registry enables this flexibility.

### Stage 1: Hardcoded Config

problem: config in code; requires recompile to change

```go
// business logic & config tightly coupled
func (r *runner) Run(ctx context.Context, _ <-chan gas.ShutdownInfo) error { 
	ulog.DefaultLoggerFromContext(ctx).Warn("running rn.") // ❌ directly in code
	...
```

### Stage 2: Accessor Pattern

improvement: business logic uses Accessor, not raw config

```go
// in config.go
func GASOption() gas.Option {
    return gas.Object(&Accessor{
        cron: &Cron{
            RunMessage: "hardcoded", 
            ...

// by having an Accessor holding a Cron object
type Accessor struct { cron *Cron } // ✨ decoupling
// and module including this config GAS option
func RegisterModule() (*gas.Module, error) { 
	return gas.New(
		config.GASOption(),
		...

// business logic is now decoupled from raw config
func (r *runner) Run(...) {
	ticker := time.NewTicker(r.accessor.Cron().Period) // ✨ abstraction++
	...
```

### Stage 3: Local File + SPI Registry

- improvement
	- config in YAML file, uses SPI
	- no recompile needed (hot reload after changing YAML)

```go
// by having the Accessor holding a Registry (which contains config) instead of directly the business logic object (Cron), we further decouples business logic from config
type Accessor struct { 
	registry configspi.Registry `inject:""` // ✨ abstraction++
} 

func (a *Accessor) Init() error {
    return a.registry.BindProto("cron", new(Cron))  // ✅ Loads from file (once)
}

// no change in business logic! 

// actual config: in etc/cron.yml
cron: 
	run_message: "some message"... 
// HOT RELOAD: changes here will directly take effect in the running application
```

### Stage 4: Config Center (Remote)

- improvement
	- config from remote source
	- local file takes precedence over remote config

```yml
# etc/cron.yml
gas.config:
  config_center:
    namespaces:
      - my-service-config
    ...
```