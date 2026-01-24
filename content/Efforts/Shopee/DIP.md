---
title:
draft: true
tags:
date: 2026-01-19
---
## DIP 

> [!important] Dependency Inversion Principle (DIP), by Uncle Bob
> **High-level** modules should *not* depend on **low-level** modules.  
> Both should depend on **abstractions**.
> 
> Abstractions should *not* depend on details.  
> Details should depend on abstractions.

> [!info] In other words...
> Business code asks for _what it needs_, not _how it’s provided_.

## DIP in GAS

### The DIP Layers

#### High-Level Module (Business Logic)

```go
// internal/cron/cron.go - Business logic
type runner struct {
    accessor *config.Accessor `inject:""`  // Depends on abstraction
}
```

#### Low-Level Module (Infra) 

GAS Engine provides concrete implementations:

- Config loading from files/remote
- Kafka client connections
- Redis cache connections
- HTTP server setup...

#### Abstraction (SPI Interface)

```go
// Business code imports ONLY interfaces:
import "git.garena.com/shopee/mts/go-application-server/spi/config"
// configspi.Registry interface - the abstraction

// Accessor wraps the SPI:
type Accessor struct {
    registry configspi.Registry `inject:""`  // Depends on abstraction
}
```

#### Details (Concrete Implementation)

GAS Engine provides concrete implementations:

- FileConfigRegistry (reads YAML files)
- RemoteConfigRegistry (fetches from config center)
- Both implement `configspi.Registry` interface

### How DIP is Manifested

#### 1. High-level does NOT depend on low-level

❌ WITHOUT DIP:
```go
import "github.com/some/config-library"  // Concrete library
import "github.com/redis/go-redis/v9"    // Concrete library

type runner struct {
    configFile string  // Depends on file system details
    redisClient *redis.Client  // Depends on Redis library
}
```

✅ WITH GAS DIP:
```go
type runner struct {
    accessor *config.Accessor `inject:""`  // Depends on abstraction only
} 
// No imports of concrete libraries!
```

#### 2. Both depend on abstractions

Business code depends on abstraction:
```go
// runner depends on config.Accessor (abstraction)
type runner struct {
    accessor *config.Accessor `inject:""`
}
```

Accessor depends on abstraction:
```go
// Accessor depends on configspi.Registry (abstraction)
type Accessor struct {
    registry configspi.Registry `inject:""`  // Interface, not concrete type
}
```

Engine provides concrete implementations that satisfy the interface: 
- FileConfigRegistry implements `configspi.Registry`
- RemoteConfigRegistry implements `configspi.Registry`
- Both are "details" that depend on the abstraction (interface)

#### 3. Abstractions don't depend on details

```go
// The SPI interface (abstraction) defines the contract:
type Registry interface {
    Get(key string) interface{}
    BindProto(key string, proto interface{}) error
    WatchKey(key string, callback func(interface{}))
}
```

This interface doesn't know about: file paths, network protocols, db schemas...

#### 4. Details depend on abstractions

- `FileConfigRegistry` DEPENDS ON the Registry interface
- must implement all methods to satisfy the abstraction

```go
// Concrete implementations (details) implement the interface:
type FileConfigRegistry struct {
    // Implementation details: file paths, YAML parsing, etc.
}

func (f *FileConfigRegistry) Get(key string) interface{} {
    // Concrete implementation
}
```

## Visual Representation

```
┌─────────────────────────────────────────┐
│  HIGH-LEVEL: Business Logic             │
│  (runner, services, handlers)           │                        
└─────────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────────┐
│  ABSTRACTION: SPI Interfaces            │
│  (configspi.Registry,                   │
│   cachespi.RedisCache, ...)             │
│                                         │
│  Defines: What (contract)               │
│  Doesn't know: How (implementation)     │
└─────────────────────────────────────────┘
              ↑ implemented by
┌─────────────────────────────────────────┐
│  LOW-LEVEL: Infrastructure Details      │
│  (FileConfigRegistry,                   │
│   RemoteConfigRegistry,                 │
│   RedisCacheImpl, etc.)                 │
│                                         │
│  Depends on: SPI interfaces             │
│  Provides: How (implementation)         │
└─────────────────────────────────────────┘
```

---
## Key Point: Dependency Direction

**Traditional (Wrong):**
```
Business Logic → Infrastructure Details
     (depends on concrete implementations)
```

**GAS DIP (Correct):**
```
Business Logic → Abstractions ← Infrastructure Details
     (both point to interfaces, not each other)
```

---
## Takeaways

- High-level (business) depends on abstractions (SPI interfaces), not low-level details.
- Low-level (infrastructure) implements abstractions (SPI interfaces), not business logic.
- Abstractions define contracts (what), not implementations (how).
- Details implement abstractions, so they depend on the interface.

> [!info] Result
> Business logic is decoupled from infrastructure, making it testable, flexible, and maintainable



